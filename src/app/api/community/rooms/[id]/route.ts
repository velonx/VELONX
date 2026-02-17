import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/middleware/auth.middleware";
import { withErrorHandler } from "@/lib/utils/errors";
import { prisma } from "@/lib/prisma";
import { NotFoundError } from "@/lib/utils/errors";

/**
 * @swagger
 * /api/community/rooms/{id}:
 *   get:
 *     summary: Get discussion room details
 *     description: Retrieve details of a specific discussion room
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
 *         description: Room details retrieved successfully
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

    // Get room details
    const room = await prisma.discussionRoom.findUnique({
      where: { id: roomId },
      include: {
        creator: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
        _count: {
          select: {
            members: true,
            messages: true,
          },
        },
      },
    });

    if (!room) {
      throw new NotFoundError("Discussion room");
    }

    // Format response
    const formattedRoom = {
      ...room,
      memberCount: room._count.members,
      messageCount: room._count.messages,
      _count: undefined,
    };

    return NextResponse.json(
      {
        success: true,
        data: formattedRoom,
      },
      { status: 200 }
    );
  }
);
