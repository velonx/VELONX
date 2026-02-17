import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/middleware/auth.middleware";
import { withErrorHandler } from "@/lib/utils/errors";
import { postService } from "@/lib/services/post.service";

/**
 * @swagger
 * /api/community/posts/{id}/pin:
 *   post:
 *     summary: Pin a post
 *     description: Pin a group post (moderator only)
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
 *         description: Post pinned successfully
 *       400:
 *         description: Bad request - Post already pinned or not a group post
 *       401:
 *         description: Unauthorized - Authentication required
 *       403:
 *         description: Forbidden - Not a group moderator
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

  // Pin post via service
  await postService.pinPost(postId, userId);

  return NextResponse.json(
    {
      success: true,
      message: "Post pinned successfully",
    },
    { status: 200 }
  );
});

/**
 * @swagger
 * /api/community/posts/{id}/pin:
 *   delete:
 *     summary: Unpin a post
 *     description: Unpin a group post (moderator only)
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
 *         description: Post unpinned successfully
 *       400:
 *         description: Bad request - Post not pinned or not a group post
 *       401:
 *         description: Unauthorized - Authentication required
 *       403:
 *         description: Forbidden - Not a group moderator
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

  // Unpin post via service
  await postService.unpinPost(postId, userId);

  return NextResponse.json(
    {
      success: true,
      message: "Post unpinned successfully",
    },
    { status: 200 }
  );
});
