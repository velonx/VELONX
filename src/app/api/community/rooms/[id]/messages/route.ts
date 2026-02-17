import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/middleware/auth.middleware";
import { withErrorHandler, AuthorizationError } from "@/lib/utils/errors";
import { discussionRoomService } from "@/lib/services/discussion-room.service";

/**
 * @swagger
 * /api/community/rooms/{id}/messages:
 *   get:
 *     summary: Get room messages
 *     description: Retrieve messages from a discussion room with pagination
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
 *       - in: query
 *         name: cursor
 *         schema:
 *           type: string
 *         description: Cursor for pagination (message ID)
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 50
 *         description: Number of messages to retrieve
 *     responses:
 *       200:
 *         description: Messages retrieved successfully
 *       401:
 *         description: Unauthorized - Authentication required
 *       403:
 *         description: Forbidden - Not a member of the room
 *       404:
 *         description: Room not found
 */
export const GET = withErrorHandler(
  async (request: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
    // Require authentication
    const sessionOrResponse = await requireAuth();
    if (sessionOrResponse instanceof NextResponse) {
      return sessionOrResponse;
    }

    const session = sessionOrResponse;
    const userId = session.user.id!;
    const { id: roomId } = await params;

    // Check if user is a member of the room
    const isMember = await discussionRoomService.isUserMember(roomId, userId);
    if (!isMember) {
      throw new AuthorizationError("You must be a member of this room to view messages");
    }

    // Parse query parameters
    const searchParams = request.nextUrl.searchParams;
    const cursor = searchParams.get("cursor") || undefined;
    const limit = parseInt(searchParams.get("limit") || "50", 10);

    // Get messages via service
    const messages = await discussionRoomService.getRoomMessages(roomId, cursor, limit);

    return NextResponse.json(
      {
        success: true,
        data: messages,
      },
      { status: 200 }
    );
  }
);
