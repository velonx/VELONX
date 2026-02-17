import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/middleware/auth.middleware";
import { withErrorHandler } from "@/lib/utils/errors";
import { discussionRoomService } from "@/lib/services/discussion-room.service";

/**
 * @swagger
 * /api/community/rooms/{id}/leave:
 *   post:
 *     summary: Leave a discussion room
 *     description: Remove the authenticated user from the discussion room
 *     tags:
 *       - Community - Rooms
 *     security:
 *       - sessionAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Room ID
 *     responses:
 *       200:
 *         description: Successfully left the room
 *       400:
 *         description: Bad request - Not a member
 *       401:
 *         description: Unauthorized - Authentication required
 *       404:
 *         description: Room not found
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
    const { id: roomId } = await params;

    // Leave room via service
    await discussionRoomService.leaveRoom(roomId, userId);

    return NextResponse.json(
      {
        success: true,
        message: "Successfully left the discussion room",
      },
      { status: 200 }
    );
  }
);
