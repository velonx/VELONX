import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/middleware/auth.middleware";
import { withErrorHandler } from "@/lib/utils/errors";
import { communityGroupService } from "@/lib/services/community-group.service";

/**
 * @swagger
 * /api/community/groups/requests/{id}/reject:
 *   post:
 *     summary: Reject a join request
 *     description: Reject a pending join request for a private group (moderators only)
 *     tags:
 *       - Community - Groups
 *     security:
 *       - sessionAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Join request ID
 *     responses:
 *       200:
 *         description: Join request rejected successfully
 *       400:
 *         description: Bad request - Request already processed
 *       401:
 *         description: Unauthorized - Authentication required
 *       403:
 *         description: Forbidden - Not a moderator
 *       404:
 *         description: Join request not found
 */
export const POST = withErrorHandler(
  async (request: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
    // Require authentication
    const sessionOrResponse = await requireAuth();
    if (sessionOrResponse instanceof NextResponse) {
      return sessionOrResponse;
    }

    const session = sessionOrResponse;
    const moderatorId = session.user.id!;
    const { id: requestId } = await params;

    // Reject join request via service
    await communityGroupService.rejectJoinRequest(requestId, moderatorId);

    return NextResponse.json(
      {
        success: true,
        message: "Join request rejected successfully",
      },
      { status: 200 }
    );
  }
);
