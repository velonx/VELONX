import { NextRequest, NextResponse } from "next/server";
import { eventService } from "@/lib/services/event.service";
import { requireAuth } from "@/lib/middleware/auth.middleware";
import { handleError } from "@/lib/utils/errors";

/**
 * POST /api/events/[id]/register
 * Register the authenticated user for an event
 * Requires authentication
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Check authentication
    const sessionOrResponse = await requireAuth();
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
    
    const { id } = await params;
    
    // Register user for event
    const registration = await eventService.registerForEvent(
      id,
      session.user.id
    );
    
    return NextResponse.json(
      {
        success: true,
        data: registration,
        message: "Successfully registered for event",
      },
      { status: 201 }
    );
  } catch (error) {
    return handleError(error);
  }
}

/**
 * DELETE /api/events/[id]/register
 * Unregister the authenticated user from an event
 * Requires authentication
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Check authentication
    const sessionOrResponse = await requireAuth();
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
    
    const { id } = await params;
    
    // Unregister user from event
    await eventService.unregisterFromEvent(id, session.user.id);
    
    return NextResponse.json(
      {
        success: true,
        message: "Successfully unregistered from event",
      },
      { status: 200 }
    );
  } catch (error) {
    return handleError(error);
  }
}
