import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/middleware/auth.middleware";
import { handleError } from "@/lib/utils/errors";
import { eventAnalyticsService } from "@/lib/services/event-analytics.service";
import { UserRole } from "@prisma/client";

/**
 * GET /api/events/analytics/closure
 * Get registration closure analytics for a specific event
 * Requires authentication and admin role
 * 
 * Query parameters:
 * - eventId: The ID of the event to get analytics for
 * 
 * Requirements: 10.1, 10.2, 10.3, 10.4, 10.5
 */
export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const sessionOrResponse = await requireAuth();
    if (sessionOrResponse instanceof NextResponse) {
      return sessionOrResponse;
    }
    
    const session = sessionOrResponse;
    
    // Ensure user ID exists
    if (!session?.user?.id) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "INVALID_SESSION",
            message: "User ID not found in session",
          },
        },
        { status: 401 }
      );
    }
    
    // Check if user is admin
    if (session.user.role !== UserRole.ADMIN) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "FORBIDDEN",
            message: "Admin access required",
          },
        },
        { status: 403 }
      );
    }
    
    // Get eventId from query parameters
    const { searchParams } = new URL(request.url);
    const eventId = searchParams.get("eventId");
    
    if (!eventId) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "MISSING_PARAMETER",
            message: "eventId query parameter is required",
          },
        },
        { status: 400 }
      );
    }
    
    // Get analytics data
    const analytics = await eventAnalyticsService.getRegistrationClosureAnalytics(eventId);
    
    if (!analytics) {
      return NextResponse.json(
        {
          success: true,
          data: {
            hasClosed: false,
            message: "Registration has not closed for this event",
          },
        },
        { status: 200 }
      );
    }
    
    // Calculate time to closure in human-readable format
    const timeToClosureHours = analytics.timeToClosureMs 
      ? Math.round(analytics.timeToClosureMs / (1000 * 60 * 60) * 10) / 10
      : null;
    
    const timeToClosureDays = analytics.timeToClosureMs
      ? Math.round(analytics.timeToClosureMs / (1000 * 60 * 60 * 24) * 10) / 10
      : null;
    
    return NextResponse.json(
      {
        success: true,
        data: {
          hasClosed: true,
          closureTimestamp: analytics.closureTimestamp,
          closureReason: analytics.closureReason,
          attendeeCountAtClosure: analytics.attendeeCountAtClosure,
          failedAttempts: analytics.failedAttempts,
          timeToClosureMs: analytics.timeToClosureMs,
          timeToClosureHours,
          timeToClosureDays,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    return handleError(error);
  }
}
