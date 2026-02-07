import { NextRequest, NextResponse } from "next/server";
import { eventService } from "@/lib/services/event.service";
import { requireAuth, requireAdmin } from "@/lib/middleware/auth.middleware";
import { handleError } from "@/lib/utils/errors";
import { createEventSchema, eventQuerySchema } from "@/lib/validations/event";

/**
 * GET /api/events
 * List events with pagination and filtering
 * Public endpoint (no authentication required)
 * If user is authenticated, includes registration status
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
    
    const result = await eventService.listEvents(queryParams);
    
    // If user is authenticated, check registration status for each event
    let eventsWithRegistrationStatus = result.events;
    if (userId) {
      const { prisma } = await import("@/lib/prisma");
      
      eventsWithRegistrationStatus = await Promise.all(
        result.events.map(async (event) => {
          const isRegistered = await prisma.eventAttendee.findUnique({
            where: {
              eventId_userId: {
                eventId: event.id,
                userId: userId!,
              },
            },
          });
          
          return {
            ...event,
            isUserRegistered: !!isRegistered,
          };
        })
      );
    }
    
    return NextResponse.json(
      {
        success: true,
        data: eventsWithRegistrationStatus,
        pagination: result.pagination,
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
