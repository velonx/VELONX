import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/middleware/auth.middleware";
import { withErrorHandler } from "@/lib/utils/errors";
import { blockService } from "@/lib/services/block.service";

/**
 * @swagger
 * /api/community/block/{userId}:
 *   delete:
 *     summary: Unblock a user
 *     description: Unblock a user, restoring normal interaction permissions
 *     tags:
 *       - Community - Block
 *     security:
 *       - sessionAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the user to unblock
 *     responses:
 *       200:
 *         description: User unblocked successfully
 *       400:
 *         description: Bad request - User not blocked
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
    const blockerId = session.user.id!;

    const { userId: blockedId } = await params;

    // Unblock user via service
    await blockService.unblockUser(blockerId, blockedId);

    return NextResponse.json(
      {
        success: true,
        message: "User unblocked successfully",
      },
      { status: 200 }
    );
  }
);
