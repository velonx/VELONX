import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/middleware/auth.middleware";
import { handleError } from "@/lib/utils/errors";
import { notificationService } from "@/lib/services/notification.service";

/**
 * PATCH /api/notifications/mark-all-read
 * Mark all notifications as read for the authenticated user
 */
export async function PATCH(request: NextRequest) {
  try {
    // Require authentication
    const sessionOrResponse = await requireAuth();
    if (sessionOrResponse instanceof NextResponse) {
      return sessionOrResponse;
    }

    const session = sessionOrResponse;
    const userId = session.user.id!;

    // Mark all notifications as read
    const result = await notificationService.markAllAsRead(userId);

    return NextResponse.json(
      {
        success: true,
        data: result,
        message: "All notifications marked as read",
      },
      { status: 200 }
    );
  } catch (error) {
    return handleError(error);
  }
}
