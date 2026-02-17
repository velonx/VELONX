import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/middleware/auth.middleware";
import { withErrorHandler } from "@/lib/utils/errors";
import { communityGroupService } from "@/lib/services/community-group.service";

/**
 * @swagger
 * /api/community/groups/{id}/join:
 *   post:
 *     summary: Join a public community group
 *     description: Join a public group immediately. For private groups, use the request endpoint instead.
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
 *         description: Successfully joined the group
 *       400:
 *         description: Bad request - Group is private or user already a member
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

    // Join group via service
    await communityGroupService.joinGroup(groupId, userId);

    return NextResponse.json(
      {
        success: true,
        message: "Successfully joined the group",
      },
      { status: 200 }
    );
  }
);
