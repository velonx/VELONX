import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/middleware/auth.middleware";
import { withErrorHandler } from "@/lib/utils/errors";
import { cacheService } from "@/lib/services/cache.service";
import { z } from "zod";
import { auth } from "@/auth";
import { maskSensitiveData } from "@/lib/utils";

/**
 * Validation schema for creating a comment
 */
const createCommentSchema = z.object({
  content: z.string().min(1, "Comment content is required").max(1000, "Comment content must be 1000 characters or less"),
  parentId: z.string().optional(),
});

/** Cache key for a post's comments page */
const commentsCacheKey = (postId: string, limit: number, cursor: string | null) =>
  `comments:${postId}:${limit}:${cursor ?? "initial"}`;

/** Invalidate all cached comment pages for a post */
async function invalidateCommentsCache(postId: string) {
  cacheService.invalidate(`comments:${postId}:*`).catch(() => {});
}

/**
 * POST /api/community/posts/[id]/comments
 * Create a new comment on a post
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

  // Invalidate cached comments for this post so next GET reflects new comment
  await invalidateCommentsCache(postId);

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
 * GET /api/community/posts/[id]/comments
 * Get comments for a post with cursor-based pagination (optional auth)
 */
export const GET = withErrorHandler(async (
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) => {
  const { id: postId } = await params;

  // Optional authentication
  const session = await auth();
  const userId = session?.user?.id;

  // Parse query parameters
  const searchParams = request.nextUrl.searchParams;
  let limit = parseInt(searchParams.get("limit") || "20", 10);
  const cursor = searchParams.get("cursor");

  // Limit comments to 3 for unauthenticated visitors
  if (!userId) {
    limit = Math.min(limit, 3);
  }

  // Try cache first
  const cacheKey = `${commentsCacheKey(postId, limit, cursor)}:${userId ? "auth" : "anon"}`;
  const cached = await cacheService.get(cacheKey);
  if (cached) {
    return NextResponse.json(cached, { status: 200 });
  }

  // Cache miss — query DB
  const { prisma } = await import("@/lib/prisma");

  // Verify access to the post
  const post = await prisma.communityPost.findUnique({
    where: { id: postId },
    select: {
      visibility: true,
      authorId: true,
      groupId: true,
      group: {
        select: {
          isPrivate: true,
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

  let hasAccess = false;
  if (post.visibility === "PUBLIC") {
    if (post.group && post.group.isPrivate) {
      if (userId) {
        const membership = await prisma.groupMember.findUnique({
          where: {
            groupId_userId: {
              groupId: post.groupId!,
              userId,
            },
          },
        });
        hasAccess = !!membership || post.authorId === userId;
      }
    } else {
      hasAccess = true;
    }
  } else if (post.visibility === "GROUP" && post.groupId) {
    if (post.group && !post.group.isPrivate) {
      hasAccess = true;
    } else {
      if (userId) {
        const membership = await prisma.groupMember.findUnique({
          where: {
            groupId_userId: {
              groupId: post.groupId,
              userId,
            },
          },
        });
        hasAccess = !!membership || post.authorId === userId;
      }
    }
  } else if (post.visibility === "FOLLOWERS") {
    if (userId) {
      if (post.authorId === userId) {
        hasAccess = true;
      } else {
        const follow = await prisma.follow.findUnique({
          where: {
            followerId_followingId: {
              followerId: userId,
              followingId: post.authorId,
            },
          },
        });
        hasAccess = !!follow;
      }
    }
  }

  if (!hasAccess) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "UNAUTHORIZED",
          message: "You do not have permission to view comments on this post",
        },
      },
      { status: 401 }
    );
  }

  // Build where clause (parentId: null fetches only top-level comments)
  const whereClause: any = {
    postId,
    parentId: null,
  };

  if (cursor) {
    whereClause.createdAt = { lt: new Date(cursor) };
  }

  const comments = await prisma.postComment.findMany({
    where: whereClause,
    take: limit + 1,
    include: {
      author: {
        select: { id: true, name: true, image: true, college: true },
      },
      replies: {
        include: {
          author: {
            select: { id: true, name: true, image: true, college: true },
          },
        },
        orderBy: { createdAt: "asc" },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  const hasMore = comments.length > limit;
  const resultComments = hasMore ? comments.slice(0, limit) : comments;
  const nextCursor = hasMore ? resultComments[resultComments.length - 1].createdAt.toISOString() : null;

  // Mask sensitive content for anonymous visitors
  const finalComments = resultComments.map((comment) => {
    const commentContent = userId ? comment.content : maskSensitiveData(comment.content);
    const replies = comment.replies.map((reply) => ({
      ...reply,
      content: userId ? reply.content : maskSensitiveData(reply.content),
    }));
    return {
      ...comment,
      content: commentContent,
      replies,
    };
  });

  const response = {
    success: true,
    data: finalComments,
    pagination: {
      cursor: nextCursor,
      limit,
      hasMore,
    },
  };

  // Cache for 30 seconds
  cacheService.set(cacheKey, response, 30).catch(() => {});

  return NextResponse.json(response, { status: 200 });
});
