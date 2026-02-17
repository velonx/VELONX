import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/middleware/auth.middleware";
import { withErrorHandler } from "@/lib/utils/errors";
import { postService } from "@/lib/services/post.service";
import { cacheService, CacheKeys } from "@/lib/services/cache.service";
import { z } from "zod";

/**
 * Validation schema for editing a post
 */
const editPostSchema = z.object({
  content: z.string().min(1, "Post content is required").max(5000, "Post content must be 5000 characters or less"),
});

/**
 * @swagger
 * /api/community/posts/{id}:
 *   get:
 *     summary: Get a post by ID
 *     description: Retrieve a specific community post with details
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
 *     responses:
 *       200:
 *         description: Post retrieved successfully
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

  // Get post from database
  const { prisma } = await import("@/lib/prisma");

  const post = await prisma.communityPost.findUnique({
    where: { id: postId },
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

  // Format response
  const formattedPost = {
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
  };

  return NextResponse.json(
    {
      success: true,
      data: formattedPost,
    },
    { status: 200 }
  );
});

/**
 * @swagger
 * /api/community/posts/{id}:
 *   patch:
 *     summary: Edit a post
 *     description: Edit an existing community post (author only)
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
 *                 description: Updated post content
 *                 example: "Updated: Just completed my first React project!"
 *     responses:
 *       200:
 *         description: Post updated successfully
 *       400:
 *         description: Bad request - Invalid input
 *       401:
 *         description: Unauthorized - Authentication required
 *       403:
 *         description: Forbidden - Not the post author
 *       404:
 *         description: Post not found
 */
export const PATCH = withErrorHandler(async (
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
  const validatedData = editPostSchema.parse(body);

  // Edit post via service
  const post = await postService.editPost(postId, validatedData.content, userId);

  // Invalidate user feed cache
  await cacheService.invalidate(CacheKeys.feed.userAll(userId));

  // If post is in a group, invalidate group feed cache
  if (post.groupId) {
    await cacheService.invalidate(CacheKeys.feed.groupAll(post.groupId));
  }

  return NextResponse.json(
    {
      success: true,
      data: post,
      message: "Post updated successfully",
    },
    { status: 200 }
  );
});

/**
 * @swagger
 * /api/community/posts/{id}:
 *   delete:
 *     summary: Delete a post
 *     description: Delete a community post (author or moderator only)
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
 *     responses:
 *       200:
 *         description: Post deleted successfully
 *       401:
 *         description: Unauthorized - Authentication required
 *       403:
 *         description: Forbidden - Not authorized to delete
 *       404:
 *         description: Post not found
 */
export const DELETE = withErrorHandler(async (
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

  // Get post details before deletion to know which caches to invalidate
  const { prisma } = await import("@/lib/prisma");
  const post = await prisma.communityPost.findUnique({
    where: { id: postId },
    select: { authorId: true, groupId: true },
  });

  // Delete post via service
  await postService.deletePost(postId, userId);

  // Invalidate user feed cache for the post author
  if (post?.authorId) {
    await cacheService.invalidate(CacheKeys.feed.userAll(post.authorId));
  }

  // If post was in a group, invalidate group feed cache
  if (post?.groupId) {
    await cacheService.invalidate(CacheKeys.feed.groupAll(post.groupId));
  }

  return NextResponse.json(
    {
      success: true,
      message: "Post deleted successfully",
    },
    { status: 200 }
  );
});
