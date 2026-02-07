import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/middleware/auth.middleware";
import { handleError } from "@/lib/utils/errors";
import { prisma } from "@/lib/prisma";
import { EventType, EventStatus, AttendeeStatus } from "@prisma/client";

/**
 * GET /api/events/analytics/personal
 * Get personal event analytics for the authenticated user
 * Requires authentication
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
    
    const userId = session.user.id;
    
    // Get all user's event registrations
    const userRegistrations = await prisma.eventAttendee.findMany({
      where: {
        userId,
      },
      include: {
        event: {
          select: {
            id: true,
            title: true,
            type: true,
            date: true,
            endDate: true,
            status: true,
          },
        },
      },
      orderBy: {
        createdAt: "asc",
      },
    });
    
    // Calculate events attended (completed events user registered for)
    const attendedEvents = userRegistrations.filter(
      (reg) => reg.event.status === EventStatus.COMPLETED
    );
    const eventsAttended = attendedEvents.length;
    
    // Calculate upcoming registered events
    const now = new Date();
    const upcomingEvents = userRegistrations.filter(
      (reg) =>
        reg.event.status === EventStatus.UPCOMING &&
        reg.event.date > now
    );
    const upcomingEventsCount = upcomingEvents.length;
    
    // Calculate participation streak
    // Streak is the number of consecutive completed events attended
    let participationStreak = 0;
    const completedEvents = userRegistrations
      .filter((reg) => reg.event.status === EventStatus.COMPLETED)
      .sort((a, b) => b.event.date.getTime() - a.event.date.getTime());
    
    if (completedEvents.length > 0) {
      // Start with 1 for the most recent completed event
      participationStreak = 1;
      
      // Check consecutive events
      for (let i = 1; i < completedEvents.length; i++) {
        const currentEventDate = completedEvents[i].event.date;
        const previousEventDate = completedEvents[i - 1].event.date;
        
        // Calculate days between events
        const daysDiff = Math.floor(
          (previousEventDate.getTime() - currentEventDate.getTime()) /
            (1000 * 60 * 60 * 24)
        );
        
        // If events are within 60 days of each other, continue streak
        if (daysDiff <= 60) {
          participationStreak++;
        } else {
          break;
        }
      }
    }
    
    // Calculate favorite event type (most attended)
    const eventTypeCount: Record<EventType, number> = {
      [EventType.HACKATHON]: 0,
      [EventType.WORKSHOP]: 0,
      [EventType.WEBINAR]: 0,
    };
    
    attendedEvents.forEach((reg) => {
      eventTypeCount[reg.event.type]++;
    });
    
    let favoriteEventType: EventType | null = null;
    let maxCount = 0;
    
    Object.entries(eventTypeCount).forEach(([type, count]) => {
      if (count > maxCount) {
        maxCount = count;
        favoriteEventType = type as EventType;
      }
    });
    
    // Calculate total hours attended
    let totalHours = 0;
    
    attendedEvents.forEach((reg) => {
      const event = reg.event;
      
      // Calculate duration in hours
      if (event.endDate) {
        const durationMs = event.endDate.getTime() - event.date.getTime();
        const durationHours = durationMs / (1000 * 60 * 60);
        totalHours += durationHours;
      } else {
        // Default to 2 hours if no end date specified
        totalHours += 2;
      }
    });
    
    // Round to 1 decimal place
    totalHours = Math.round(totalHours * 10) / 10;
    
    return NextResponse.json(
      {
        success: true,
        data: {
          eventsAttended,
          upcomingEvents: upcomingEventsCount,
          participationStreak,
          favoriteEventType,
          totalHours,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    return handleError(error);
  }
}
