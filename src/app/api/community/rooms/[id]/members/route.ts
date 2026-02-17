import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/middleware/auth.middleware";
import { withErrorHandler } from "@/lib/utils/errors";
import { discussionRoomService } from "@/lib/services/discussion-room.service";

/**
 * @swagger
 * /api/community/rooms/{id}/members:
 *   get:
 *     summary: Get room members
 *     description: Retrieve all members of a discussion room
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
 *         description: Members retrieved successfully
 *       401:
 *         description: Unauthorized - Authentication required
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

    const { id: roomId } = await params;

    // Get members via service
    const members = await discussionRoomService.getRoomMembers(roomId);

    return NextResponse.json(
      {
        success: true,
        data: members,
      },
      { status: 200 }
    );
  }
);
