import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/middleware/auth.middleware";
import { handleError } from "@/lib/utils/errors";
import { notificationService } from "@/lib/services/notification.service";

/**
 * GET /api/notifications/unread-count
 * Get the count of unread notifications for the authenticated user
 */
export async function GET(request: NextRequest) {
  try {
    // Require authentication
    const sessionOrResponse = await requireAuth();
    if (sessionOrResponse instanceof NextResponse) {
      return sessionOrResponse;
    }

    const session = sessionOrResponse;
    const userId = session.user.id!;

    // Get unread count from service
    const count = await notificationService.getUnreadCount(userId);

    return NextResponse.json(
      {
        success: true,
        data: {
          count,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    return handleError(error);
  }
}
