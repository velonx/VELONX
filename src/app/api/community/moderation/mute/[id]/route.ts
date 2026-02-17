import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/middleware/auth.middleware";
import { withErrorHandler } from "@/lib/utils/errors";
import { moderationService } from "@/lib/services/moderation.service";

/**
 * @swagger
 * /api/community/moderation/mute/{id}:
 *   delete:
 *     summary: Unmute a user
 *     description: Remove a mute by its ID, restoring the user's messaging permissions (moderator only)
 *     tags:
 *       - Community - Moderation
 *     security:
 *       - sessionAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Mute record ID
 *     responses:
 *       200:
 *         description: User unmuted successfully
 *       401:
 *         description: Unauthorized - Authentication required
 *       403:
 *         description: Forbidden - Moderator permissions required
 *       404:
 *         description: Mute record not found
 */
export const DELETE = withErrorHandler(
  async (request: NextRequest, { params }: { params: { id: string } }) => {
    // Require authentication
    const sessionOrResponse = await requireAuth();
    if (sessionOrResponse instanceof NextResponse) {
      return sessionOrResponse;
    }

    const session = sessionOrResponse;
    const moderatorId = session.user.id!;

    const muteId = params.id;

    // Unmute user via service (service will verify moderator permissions)
    await moderationService.unmuteUser(muteId, moderatorId);

    return NextResponse.json(
      {
        success: true,
        message: "User unmuted successfully",
      },
      { status: 200 }
    );
  }
);
