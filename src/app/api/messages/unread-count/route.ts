import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/middleware/auth.middleware";
import { handleError } from "@/lib/utils/errors";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const sessionOrResponse = await requireAuth();
    if (sessionOrResponse instanceof NextResponse) return sessionOrResponse;

    const userId = sessionOrResponse.user.id;
    if (!userId) {
      return NextResponse.json(
        { success: false, error: { code: "INVALID_SESSION", message: "User ID not found" } },
        { status: 401 }
      );
    }

    const unreadCount = await prisma.directMessage.count({
      where: {
        receiverId: userId,
        isRead: false,
        isDeleted: false,
      },
    });

    return NextResponse.json({
      success: true,
      data: { count: unreadCount },
    });
  } catch (error) {
    return handleError(error);
  }
}
