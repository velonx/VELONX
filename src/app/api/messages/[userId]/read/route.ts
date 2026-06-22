/**
 * POST /api/messages/[userId]/read — Mark all messages from a user as read
 */

import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/middleware/auth.middleware";
import { handleError } from "@/lib/utils/errors";
import { prisma } from "@/lib/prisma";

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const sessionOrResponse = await requireAuth();
    if (sessionOrResponse instanceof NextResponse) return sessionOrResponse;

    const currentUserId = sessionOrResponse.user.id;
    if (!currentUserId) {
      return NextResponse.json(
        { success: false, error: { code: "INVALID_SESSION", message: "User ID not found" } },
        { status: 401 }
      );
    }

    const { userId: senderUserId } = await params;

    // Mark all unread messages from sender to current user as read
    const result = await prisma.directMessage.updateMany({
      where: {
        senderId: senderUserId,
        receiverId: currentUserId,
        isRead: false,
      },
      data: { isRead: true },
    });

    return NextResponse.json({
      success: true,
      data: { markedAsRead: result.count },
      message: `${result.count} messages marked as read`,
    });
  } catch (error) {
    return handleError(error);
  }
}
