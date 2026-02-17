import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/middleware/auth.middleware";
import { withErrorHandler } from "@/lib/utils/errors";
import { communityGroupService } from "@/lib/services/community-group.service";

/**
 * @swagger
 * /api/community/groups/{id}/request:
 *   post:
 *     summary: Request to join a private community group
 *     description: Create a join request for a private group that requires moderator approval
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
 *         description: Group ID
 *     responses:
 *       200:
 *         description: Join request created successfully
 *       400:
 *         description: Bad request - Group is public, user already a member, or request already pending
 *       401:
 *         description: Unauthorized - Authentication required
 *       404:
 *         description: Group not found
 */
export const POST = withErrorHandler(
  async (request: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
    // Require authentication
    const sessionOrResponse = await requireAuth();
    if (sessionOrResponse instanceof NextResponse) {
      return sessionOrResponse;
    }

    const session = sessionOrResponse;
    const userId = session.user.id!;
    const { id: groupId } = await params;

    // Request to join group via service
    await communityGroupService.requestJoinGroup(groupId, userId);

    return NextResponse.json(
      {
        success: true,
        message: "Join request submitted successfully. Awaiting moderator approval.",
      },
      { status: 200 }
    );
  }
);
