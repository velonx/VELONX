import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/middleware/auth.middleware";
import { withErrorHandler } from "@/lib/utils/errors";
import { communityGroupService } from "@/lib/services/community-group.service";

/**
 * @swagger
 * /api/community/groups/{id}/leave:
 *   post:
 *     summary: Leave a community group
 *     description: Remove yourself from a group. Group owners cannot leave their own groups.
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
 *         description: Successfully left the group
 *       400:
 *         description: Bad request - User is not a member or is the group owner
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

    // Leave group via service
    await communityGroupService.leaveGroup(groupId, userId);

    return NextResponse.json(
      {
        success: true,
        message: "Successfully left the group",
      },
      { status: 200 }
    );
  }
);
