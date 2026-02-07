import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/middleware/auth.middleware";
import { handleError } from "@/lib/utils/errors";
import { notificationService } from "@/lib/services/notification.service";

/**
 * DELETE /api/notifications/clear-all
 * Delete all notifications for the authenticated user
 */
export async function DELETE(request: NextRequest) {
  try {
    // Require authentication
    const sessionOrResponse = await requireAuth();
    if (sessionOrResponse instanceof NextResponse) {
      return sessionOrResponse;
    }

    const session = sessionOrResponse;
    const userId = session.user.id!;

    // Delete all notifications
    const result = await notificationService.deleteAllNotifications(userId);

    return NextResponse.json(
      {
        success: true,
        data: result,
        message: "All notifications cleared",
      },
      { status: 200 }
    );
  } catch (error) {
    return handleError(error);
  }
}
