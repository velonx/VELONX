import { NextRequest, NextResponse } from "next/server";
import { eventService } from "@/lib/services/event.service";
import { requireAuth, requireAdmin } from "@/lib/middleware/auth.middleware";
import { handleError } from "@/lib/utils/errors";
import { createEventSchema, eventQuerySchema } from "@/lib/validations/event";
import { computeRegistrationStatus } from "@/lib/utils/event-helpers";
import type { Event } from "@/lib/api/types";

/**
 * GET /api/events
 * List events with pagination and filtering
 * Public endpoint (no authentication required)
 * If user is authenticated, includes registration status
 * Feature: event-registration-closed
 * Requirements: 8.1, 8.2, 8.3, 8.4, 8.5
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Check if user is authenticated (optional)
    let userId: string | undefined;
    try {
      const sessionOrResponse = await requireAuth();
      if (!(sessionOrResponse instanceof NextResponse)) {
        userId = sessionOrResponse.user.id;
      }
    } catch {
      // User not authenticated, continue without userId
    }
    
    // Parse and validate query parameters
    const queryParams = eventQuerySchema.parse({
      page: searchParams.get("page"),
      pageSize: searchParams.get("pageSize"),
      type: searchParams.get("type"),
      status: searchParams.get("status"),
      startDate: searchParams.get("startDate"),
      endDate: searchParams.get("endDate"),
    });
    
    // Get availability filter parameter
    const availability = searchParams.get("availability");
    
    const result = await eventService.listEvents(queryParams);
    const { prisma } = await import("@/lib/prisma");
    
    // Compute registration status for each event and check user registration
    const eventsWithStatus = await Promise.all(
      result.events.map(async (event) => {
        // Compute registration status
        const attendeeCount = event._count?.attendees || 0;
        const statusInfo = computeRegistrationStatus(event as any, attendeeCount);
        
        // Check if user is registered (if authenticated)
        let isUserRegistered = false;
        if (userId) {
          const registration = await prisma.eventAttendee.findUnique({
            where: {
              eventId_userId: {
                eventId: event.id,
                userId: userId,
              },
            },
          });
          isUserRegistered = !!registration;
        }
        
        return {
          ...event,
          isRegistrationClosed: !statusInfo.isOpen,
          registrationClosureReason: statusInfo.reason,
          isUserRegistered,
        };
      })
    );
    
    // Apply availability filter if requested
    // Requirement 8.2: Exclude closed events when availability=available
    // Requirement 8.5: Include user's registered events regardless of status
    let filteredEvents = eventsWithStatus;
    if (availability === 'available') {
      filteredEvents = eventsWithStatus.filter(event => 
        !event.isRegistrationClosed || event.isUserRegistered
      );
    }
    
    // Calculate filter counts
    // Requirement 8.4: Return availableCount and totalCount
    const availableCount = eventsWithStatus.filter(event => !event.isRegistrationClosed).length;
    const totalCount = eventsWithStatus.length;
    
    return NextResponse.json(
      {
        success: true,
        data: {
          events: filteredEvents,
          pagination: {
            page: result.pagination.page,
            pageSize: result.pagination.pageSize,
            total: result.pagination.totalCount,
            totalPages: result.pagination.totalPages,
          },
          filters: {
            availableCount,
            totalCount,
          },
        },
      },
      { status: 200 }
    );
  } catch (error) {
    return handleError(error);
  }
}

/**
 * POST /api/events
 * Create a new event
 * Admin only
 */
export async function POST(request: NextRequest) {
  try {
    // Check admin authentication
    const sessionOrResponse = await requireAdmin();
    if (sessionOrResponse instanceof NextResponse) {
      return sessionOrResponse;
    }
    
    const session = sessionOrResponse;
    
    // Ensure user ID exists
    if (!session.user.id) {
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
    
    // Parse and validate request body
    const body = await request.json();
    const validatedData = createEventSchema.parse(body);
    
    // Create event
    const event = await eventService.createEvent({
      ...validatedData,
      creatorId: session.user.id,
    });
    
    return NextResponse.json(
      {
        success: true,
        data: event,
        message: "Event created successfully",
      },
      { status: 201 }
    );
  } catch (error) {
    return handleError(error);
  }
}
