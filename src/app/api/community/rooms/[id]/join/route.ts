import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/middleware/auth.middleware";
import { withErrorHandler } from "@/lib/utils/errors";
import { discussionRoomService } from "@/lib/services/discussion-room.service";

/**
 * @swagger
 * /api/community/rooms/{id}/join:
 *   post:
 *     summary: Join a discussion room
 *     description: Add the authenticated user as a member of the discussion room
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
 *         description: Successfully joined the room
 *       400:
 *         description: Bad request - Already a member or invalid room
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

    // Join room via service
    await discussionRoomService.joinRoom(roomId, userId);

    return NextResponse.json(
      {
        success: true,
        message: "Successfully joined the discussion room",
      },
      { status: 200 }
    );
  }
);
