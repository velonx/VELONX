import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/middleware/auth.middleware";
import { withErrorHandler } from "@/lib/utils/errors";
import { communityGroupService } from "@/lib/services/community-group.service";

/**
 * @swagger
 * /api/community/groups/requests/{id}/approve:
 *   post:
 *     summary: Approve a join request
 *     description: Approve a pending join request for a private group (moderators only)
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
 *         description: Join request approved successfully
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

    // Approve join request via service
    await communityGroupService.approveJoinRequest(requestId, moderatorId);

    return NextResponse.json(
      {
        success: true,
        message: "Join request approved successfully",
      },
      { status: 200 }
    );
  }
);
