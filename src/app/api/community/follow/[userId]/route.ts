import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/middleware/auth.middleware";
import { withErrorHandler } from "@/lib/utils/errors";
import { followService } from "@/lib/services/follow.service";

/**
 * @swagger
 * /api/community/follow/{userId}:
 *   delete:
 *     summary: Unfollow a user
 *     description: Remove a follow relationship with another user
 *     tags:
 *       - Community - Follow
 *     security:
 *       - sessionAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the user to unfollow
 *     responses:
 *       200:
 *         description: User unfollowed successfully
 *       400:
 *         description: Bad request - Not following this user
 *       401:
 *         description: Unauthorized - Authentication required
 *       404:
 *         description: User not found
 */
export const DELETE = withErrorHandler(
  async (request: NextRequest, { params }: { params: Promise<{ userId: string }> }) => {
    // Require authentication
    const sessionOrResponse = await requireAuth();
    if (sessionOrResponse instanceof NextResponse) {
      return sessionOrResponse;
    }

    const session = sessionOrResponse;
    const followerId = session.user.id!;
    const { userId: followingId } = await params;

    // Unfollow user via service
    await followService.unfollowUser(followerId, followingId);

    return NextResponse.json(
      {
        success: true,
        message: "User unfollowed successfully",
      },
      { status: 200 }
    );
  }
);
