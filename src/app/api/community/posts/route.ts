import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/middleware/auth.middleware";
import { withErrorHandler } from "@/lib/utils/errors";
import { postService } from "@/lib/services/post.service";
import { cacheService, CacheKeys } from "@/lib/services/cache.service";
import { applyCustomRateLimit } from "@/lib/middleware/rate-limit.middleware";
import { z } from "zod";

/**
 * Validation schema for creating a post
 */
const createPostSchema = z.object({
  content: z.string().min(1, "Post content is required").max(5000, "Post content must be 5000 characters or less"),
  groupId: z.string().optional(),
  visibility: z.enum(["PUBLIC", "FOLLOWERS", "GROUP"], {
    message: "Visibility must be PUBLIC, FOLLOWERS, or GROUP",
  }),
  imageUrls: z.array(z.string().url("Invalid image URL")).max(5, "Maximum 5 images allowed").optional(),
  linkUrls: z.array(z.string().url("Invalid link URL")).max(3, "Maximum 3 links allowed").optional(),
});

/**
 * @swagger
 * /api/community/posts:
 *   post:
 *     summary: Create a community post
 *     description: Create a new community post with optional images and links
 *     tags:
 *       - Community - Posts
 *     security:
 *       - sessionAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - content
 *               - visibility
 *             properties:
 *               content:
 *                 type: string
 *                 description: Post content
 *                 example: "Just completed my first React project!"
 *               groupId:
 *                 type: string
 *                 description: Group ID (required if visibility is GROUP)
 *                 example: "60d5ec49f1b2c8b1f8e4e1a1"
 *               visibility:
 *                 type: string
 *                 enum: [PUBLIC, FOLLOWERS, GROUP]
 *                 description: Post visibility
 *                 example: "PUBLIC"
 *               imageUrls:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Array of image URLs (max 5)
 *                 example: ["https://example.com/image1.jpg"]
 *               linkUrls:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Array of link URLs (max 3)
 *                 example: ["https://github.com/myproject"]
 *     responses:
 *       201:
 *         description: Post created successfully
 *       400:
 *         description: Bad request - Invalid input
 *       401:
 *         description: Unauthorized - Authentication required
 *       429:
 *         description: Rate limit exceeded
 */
export const POST = withErrorHandler(async (request: NextRequest) => {
  // Require authentication
  const sessionOrResponse = await requireAuth();
  if (sessionOrResponse instanceof NextResponse) {
    return sessionOrResponse;
  }

  const session = sessionOrResponse;
  const userId = session.user.id!;

  // Apply rate limiting (5 posts per hour)
  const rateLimitResponse = await applyCustomRateLimit(
    request,
    userId,
    {
      maxRequests: 5,
      windowMs: 60 * 60 * 1000, // 1 hour
      keyPrefix: "ratelimit:post:create",
    },
    "/api/community/posts"
  );
  if (rateLimitResponse) {
    return rateLimitResponse;
  }

  // Parse and validate request body
  const body = await request.json();
  const validatedData = createPostSchema.parse(body);

  // Create post via service
  const post = await postService.createPost(validatedData, userId);

  // Invalidate user feed cache
  await cacheService.invalidate(CacheKeys.feed.userAll(userId));

  // If post is in a group, invalidate group feed cache
  if (validatedData.groupId) {
    await cacheService.invalidate(CacheKeys.feed.groupAll(validatedData.groupId));
  }

  return NextResponse.json(
    {
      success: true,
      data: post,
      message: "Post created successfully",
    },
    { status: 201 }
  );
});

/**
 * @swagger
 * /api/community/posts:
 *   get:
 *     summary: List community posts
 *     description: Retrieve community posts with pagination and filtering
 *     tags:
 *       - Community - Posts
 *     security:
 *       - sessionAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number for pagination
 *       - in: query
 *         name: pageSize
 *         schema:
 *           type: integer
 *           default: 20
 *         description: Number of items per page
 *       - in: query
 *         name: groupId
 *         schema:
 *           type: string
 *         description: Filter by group ID
 *       - in: query
 *         name: authorId
 *         schema:
 *           type: string
 *         description: Filter by author ID
 *     responses:
 *       200:
 *         description: Posts retrieved successfully
 *       401:
 *         description: Unauthorized - Authentication required
 */
export const GET = withErrorHandler(async (request: NextRequest) => {
  // Require authentication
  const sessionOrResponse = await requireAuth();
  if (sessionOrResponse instanceof NextResponse) {
    return sessionOrResponse;
  }

  // Parse query parameters
  const searchParams = request.nextUrl.searchParams;
  const page = parseInt(searchParams.get("page") || "1", 10);
  const pageSize = parseInt(searchParams.get("pageSize") || "20", 10);
  const groupId = searchParams.get("groupId") || undefined;
  const authorId = searchParams.get("authorId") || undefined;

  // Calculate skip for pagination
  const skip = (page - 1) * pageSize;

  // Build filter
  const where: any = {};
  if (groupId) {
    where.groupId = groupId;
  }
  if (authorId) {
    where.authorId = authorId;
  }

  // Get posts from database with pagination
  const { prisma } = await import("@/lib/prisma");

  const [posts, total] = await Promise.all([
    prisma.communityPost.findMany({
      where,
      skip,
      take: pageSize,
      include: {
        author: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
        _count: {
          select: {
            reactions: true,
            comments: true,
          },
        },
      },
      orderBy: [
        { isPinned: "desc" }, // Pinned posts first
        { createdAt: "desc" }, // Then by creation date
      ],
    }),
    prisma.communityPost.count({ where }),
  ]);

  // Format response
  const formattedPosts = posts.map((post) => ({
    id: post.id,
    content: post.content,
    authorId: post.authorId,
    authorName: post.author.name || "Unknown",
    authorImage: post.author.image,
    groupId: post.groupId,
    visibility: post.visibility,
    imageUrls: post.imageUrls,
    linkUrls: post.linkUrls,
    isEdited: post.isEdited,
    isPinned: post.isPinned,
    reactionCount: post._count.reactions,
    commentCount: post._count.comments,
    createdAt: post.createdAt,
    updatedAt: post.updatedAt,
  }));

  return NextResponse.json(
    {
      success: true,
      data: formattedPosts,
      pagination: {
        page,
        pageSize,
        total,
        totalPages: Math.ceil(total / pageSize),
      },
    },
    { status: 200 }
  );
});
