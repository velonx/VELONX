import { NextRequest, NextResponse } from "next/server";
import { eventService } from "@/lib/services/event.service";
import { requireAdmin } from "@/lib/middleware/auth.middleware";
import { handleError } from "@/lib/utils/errors";
import { updateEventSchema } from "@/lib/validations/event";

/**
 * GET /api/events/[id]
 * Get event details by ID
 * Public endpoint (no authentication required)
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const event = await eventService.getEventById(id);
    
    return NextResponse.json(
      {
        success: true,
        data: event,
      },
      { status: 200 }
    );
  } catch (error) {
    return handleError(error);
  }
}

/**
 * PATCH /api/events/[id]
 * Update an event
 * Admin only
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Check admin authentication
    const sessionOrResponse = await requireAdmin();
    if (sessionOrResponse instanceof NextResponse) {
      return sessionOrResponse;
    }
    
    const { id } = await params;
    
    // Parse and validate request body
    const body = await request.json();
    const validatedData = updateEventSchema.parse(body);
    
    // Update event
    const event = await eventService.updateEvent(id, validatedData);
    
    return NextResponse.json(
      {
        success: true,
        data: event,
        message: "Event updated successfully",
      },
      { status: 200 }
    );
  } catch (error) {
    return handleError(error);
  }
}

/**
 * DELETE /api/events/[id]
 * Delete an event
 * Admin only
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Check admin authentication
    const sessionOrResponse = await requireAdmin();
    if (sessionOrResponse instanceof NextResponse) {
      return sessionOrResponse;
    }
    
    const { id } = await params;
    
    // Delete event
    await eventService.deleteEvent(id);
    
    return NextResponse.json(
      {
        success: true,
        message: "Event deleted successfully",
      },
      { status: 200 }
    );
  } catch (error) {
    return handleError(error);
  }
}
