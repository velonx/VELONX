import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/middleware/auth.middleware";
import { withErrorHandler } from "@/lib/utils/errors";
import { postService } from "@/lib/services/post.service";
import { z } from "zod";

/**
 * Validation schema for creating a comment
 */
const createCommentSchema = z.object({
  content: z.string().min(1, "Comment content is required").max(1000, "Comment content must be 1000 characters or less"),
});

/**
 * @swagger
 * /api/community/posts/{id}/comments:
 *   post:
 *     summary: Comment on a post
 *     description: Add a comment to a community post
 *     tags:
 *       - Community - Posts
 *     security:
 *       - sessionAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Post ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - content
 *             properties:
 *               content:
 *                 type: string
 *                 description: Comment content
 *                 example: "Great post! Thanks for sharing."
 *     responses:
 *       201:
 *         description: Comment created successfully
 *       400:
 *         description: Bad request - Invalid input
 *       401:
 *         description: Unauthorized - Authentication required
 *       404:
 *         description: Post not found
 */
export const POST = withErrorHandler(async (
  request: NextRequest,
  { params }: { params: { id: string } }
) => {
  // Require authentication
  const sessionOrResponse = await requireAuth();
  if (sessionOrResponse instanceof NextResponse) {
    return sessionOrResponse;
  }

  const session = sessionOrResponse;
  const userId = session.user.id!;
  const postId = params.id;

  // Parse and validate request body
  const body = await request.json();
  const validatedData = createCommentSchema.parse(body);

  // Create comment via service
  const comment = await postService.commentOnPost(postId, validatedData.content, userId);

  return NextResponse.json(
    {
      success: true,
      data: comment,
      message: "Comment created successfully",
    },
    { status: 201 }
  );
});

/**
 * @swagger
 * /api/community/posts/{id}/comments:
 *   get:
 *     summary: Get post comments
 *     description: Retrieve all comments for a community post with pagination
 *     tags:
 *       - Community - Posts
 *     security:
 *       - sessionAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Post ID
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
 *     responses:
 *       200:
 *         description: Comments retrieved successfully
 *       401:
 *         description: Unauthorized - Authentication required
 *       404:
 *         description: Post not found
 */
export const GET = withErrorHandler(async (
  request: NextRequest,
  { params }: { params: { id: string } }
) => {
  // Require authentication
  const sessionOrResponse = await requireAuth();
  if (sessionOrResponse instanceof NextResponse) {
    return sessionOrResponse;
  }

  const postId = params.id;

  // Parse query parameters
  const searchParams = request.nextUrl.searchParams;
  const page = parseInt(searchParams.get("page") || "1", 10);
  const pageSize = parseInt(searchParams.get("pageSize") || "20", 10);

  // Calculate skip for pagination
  const skip = (page - 1) * pageSize;

  // Get comments from database with pagination
  const { prisma } = await import("@/lib/prisma");

  // First check if post exists
  const post = await prisma.communityPost.findUnique({
    where: { id: postId },
    select: { id: true },
  });

  if (!post) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "NOT_FOUND",
          message: "Post not found",
        },
      },
      { status: 404 }
    );
  }

  const [comments, total] = await Promise.all([
    prisma.postComment.findMany({
      where: { postId },
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
      },
      orderBy: { createdAt: "asc" }, // Oldest first for comments
    }),
    prisma.postComment.count({ where: { postId } }),
  ]);

  return NextResponse.json(
    {
      success: true,
      data: comments,
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
