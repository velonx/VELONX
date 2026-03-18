import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/middleware/auth.middleware";
import { handleError } from "@/lib/utils/errors";
import { notificationService } from "@/lib/services/notification.service";
import { cacheService } from "@/lib/services/cache.service";

/**
 * GET /api/notifications/unread-count
 * Get the count of unread notifications for the authenticated user.
 * Cached for 30 seconds to avoid hammering the DB on every page refresh.
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

    // Cache the count for 30 seconds — acceptable staleness for a badge counter
    const cacheKey = `notifications:unread-count:${userId}`;
    const cached = await cacheService.get<number>(cacheKey);

    const count = cached !== null
      ? cached
      : await (async () => {
          const freshCount = await notificationService.getUnreadCount(userId);
          // Fire-and-forget cache store (don't await — don't block the response)
          cacheService.set(cacheKey, freshCount, 30).catch(() => {});
          return freshCount;
        })();

    return NextResponse.json(
      {
        success: true,
        data: { count },
      },
      { status: 200 }
    );
  } catch (error) {
    return handleError(error);
  }
}
