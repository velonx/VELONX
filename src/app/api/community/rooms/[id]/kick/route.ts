import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/middleware/auth.middleware";
import { withErrorHandler, ValidationError } from "@/lib/utils/errors";
import { discussionRoomService } from "@/lib/services/discussion-room.service";
import { z } from "zod";

/**
 * Validation schema for kicking a member
 */
const kickMemberSchema = z.object({
  userId: z.string().min(1, "User ID is required"),
});

/**
 * @swagger
 * /api/community/rooms/{id}/kick:
 *   post:
 *     summary: Kick a member from the room
 *     description: Remove a member from the discussion room (moderator only)
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
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - userId
 *             properties:
 *               userId:
 *                 type: string
 *                 description: ID of the user to kick
 *                 example: "507f1f77bcf86cd799439011"
 *     responses:
 *       200:
 *         description: Member kicked successfully
 *       400:
 *         description: Bad request - Invalid input
 *       401:
 *         description: Unauthorized - Authentication required
 *       403:
 *         description: Forbidden - Not a moderator
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
    const moderatorId = session.user.id!;
    const { id: roomId } = await params;

    // Parse and validate request body
    const body = await request.json();
    const validatedData = kickMemberSchema.parse(body);

    // Kick member via service (service handles moderator permission check)
    await discussionRoomService.kickMember(roomId, validatedData.userId, moderatorId);

    return NextResponse.json(
      {
        success: true,
        message: "Member kicked from the room successfully",
      },
      { status: 200 }
    );
  }
);
