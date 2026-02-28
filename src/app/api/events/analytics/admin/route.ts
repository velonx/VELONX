import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/middleware/auth.middleware";
import { handleError } from "@/lib/utils/errors";
import { prisma } from "@/lib/prisma";
import { UserRole } from "@prisma/client";

/**
 * GET /api/events/analytics/admin
 * Get aggregate registration closure analytics for all events
 * Requires authentication and admin role
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
    
    // Get all closure records
    const closures = await prisma.eventRegistrationClosure.findMany({
      orderBy: {
        closureTimestamp: 'desc',
      },
    });
    
    // Get all failed attempts
    const failedAttempts = await prisma.failedRegistrationAttempt.findMany({
      orderBy: {
        attemptTimestamp: 'desc',
      },
    });
    
    // Calculate statistics by closure reason
    const closuresByReason = {
      capacity: closures.filter(c => c.closureReason === 'capacity').length,
      deadline: closures.filter(c => c.closureReason === 'deadline').length,
      manual: closures.filter(c => c.closureReason === 'manual').length,
    };
    
    // Calculate average time to closure by reason
    const avgTimeToClosureByReason = {
      capacity: 0,
      deadline: 0,
      manual: 0,
    };
    
    ['capacity', 'deadline', 'manual'].forEach((reason) => {
      const reasonClosures = closures.filter(c => c.closureReason === reason && c.timeToClosureMs);
      if (reasonClosures.length > 0) {
        const totalTime = reasonClosures.reduce((sum, c) => sum + (c.timeToClosureMs || 0), 0);
        const avgMs = totalTime / reasonClosures.length;
        avgTimeToClosureByReason[reason as keyof typeof avgTimeToClosureByReason] = 
          Math.round(avgMs / (1000 * 60 * 60) * 10) / 10; // Convert to hours
      }
    });
    
    // Calculate failed attempts by reason
    const failedAttemptsByReason = {
      capacity: failedAttempts.filter(a => a.closureReason === 'capacity').length,
      deadline: failedAttempts.filter(a => a.closureReason === 'deadline').length,
      manual: failedAttempts.filter(a => a.closureReason === 'manual').length,
    };
    
    // Get recent closures (last 10)
    const recentClosures = await prisma.eventRegistrationClosure.findMany({
      take: 10,
      orderBy: {
        closureTimestamp: 'desc',
      },
      select: {
        id: true,
        eventId: true,
        closureTimestamp: true,
        closureReason: true,
        attendeeCountAtClosure: true,
        timeToClosureMs: true,
      },
    });
    
    // Get events with most failed attempts
    const failedAttemptsByEvent = failedAttempts.reduce((acc, attempt) => {
      acc[attempt.eventId] = (acc[attempt.eventId] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    const topFailedAttemptEvents = Object.entries(failedAttemptsByEvent)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)
      .map(([eventId, count]) => ({ eventId, failedAttempts: count }));
    
    return NextResponse.json(
      {
        success: true,
        data: {
          summary: {
            totalClosures: closures.length,
            totalFailedAttempts: failedAttempts.length,
            closuresByReason,
            failedAttemptsByReason,
            avgTimeToClosureByReason,
          },
          recentClosures,
          topFailedAttemptEvents,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    return handleError(error);
  }
}
