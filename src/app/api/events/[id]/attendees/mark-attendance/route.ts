import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/middleware/auth.middleware";
import { handleError } from "@/lib/utils/errors";
import { eventService } from "@/lib/services/event.service";

/**
 * PATCH /api/events/[id]/attendees/mark-attendance
 * Mark or unmark attendance for event attendees
 * Admin only — awards XP on marking as ATTENDED
 *
 * Body: { attendeeIds: string[], action: "mark" | "unmark" }
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
    const body = await request.json();
    const { attendeeIds, action } = body;

    // Validate input
    if (!attendeeIds || !Array.isArray(attendeeIds) || attendeeIds.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "INVALID_INPUT",
            message: "attendeeIds must be a non-empty array",
          },
        },
        { status: 400 }
      );
    }

    if (!action || !["mark", "unmark"].includes(action)) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "INVALID_INPUT",
            message: 'action must be either "mark" or "unmark"',
          },
        },
        { status: 400 }
      );
    }

    const result = await eventService.markAttendance(id, attendeeIds, action);

    return NextResponse.json(
      {
        success: true,
        data: result,
        message:
          action === "mark"
            ? `${result.updated} attendee(s) marked as attended`
            : `${result.updated} attendee(s) unmarked`,
      },
      { status: 200 }
    );
  } catch (error) {
    return handleError(error);
  }
}
