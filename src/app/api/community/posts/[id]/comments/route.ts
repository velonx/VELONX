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
  parentId: z.string().optional(),
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
  { params }: { params: Promise<{ id: string }> }
) => {
  const { id: postId } = await params;

  // Require authentication
  const sessionOrResponse = await requireAuth();
  if (sessionOrResponse instanceof NextResponse) {
    return sessionOrResponse;
  }

  const session = sessionOrResponse;
  const userId = session.user.id!;

  // Parse and validate request body
  const body = await request.json();
  const validatedData = createCommentSchema.parse(body);

  // Create comment via service or prisma directly since postService might not have parentId
  const { prisma } = await import("@/lib/prisma");
  const comment = await prisma.postComment.create({
    data: {
      content: validatedData.content,
      postId,
      authorId: userId,
      parentId: validatedData.parentId || null,
    },
    include: {
      author: {
        select: {
          id: true,
          name: true,
          image: true,
        },
      },
    },
  });
  // Comment count is derived from _count.comments aggregation, no manual update needed

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
  { params }: { params: Promise<{ id: string }> }
) => {
  const { id: postId } = await params;

  // Require authentication
  const sessionOrResponse = await requireAuth();
  if (sessionOrResponse instanceof NextResponse) {
    return sessionOrResponse;
  }

  // Parse query parameters
  const searchParams = request.nextUrl.searchParams;
  const limit = parseInt(searchParams.get("limit") || "20", 10);
  const cursor = searchParams.get("cursor");

  // Get comments from database
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

  // Build where clause
  const whereClause: any = {
    postId,
    parentId: null,
  };

  // Add cursor condition if provided
  if (cursor) {
    whereClause.createdAt = { lt: new Date(cursor) };
  }

  const comments = await prisma.postComment.findMany({
    where: whereClause,
    take: limit + 1,
    include: {
      author: {
        select: {
          id: true,
          name: true,
          image: true,
        },
      },
      replies: {
        include: {
          author: {
            select: {
              id: true,
              name: true,
              image: true,
            },
          },
        },
        orderBy: { createdAt: "asc" },
      }
    },
    orderBy: { createdAt: "desc" },
  });

  const hasMore = comments.length > limit;
  const resultComments = hasMore ? comments.slice(0, limit) : comments;
  const nextCursor = hasMore ? resultComments[resultComments.length - 1].createdAt.toISOString() : null;

  return NextResponse.json(
    {
      success: true,
      data: resultComments,
      pagination: {
        cursor: nextCursor,
        limit,
        hasMore,
      },
    },
    { status: 200 }
  );
});
