import { NextRequest, NextResponse } from "next/server";
import { meetingService } from "@/lib/services/meeting.service";
import { requireAuth } from "@/lib/middleware/auth.middleware";
import { handleError } from "@/lib/utils/errors";
import { updateAttendeeStatusSchema } from "@/lib/validations/meeting";

/**
 * PATCH /api/meetings/[id]/attendees/[userId]
 * Update attendee status
 * Requires authentication
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; userId: string }> }
) {
  try {
    // Check authentication
    const sessionOrResponse = await requireAuth();
    if (sessionOrResponse instanceof NextResponse) {
      return sessionOrResponse;
    }
    
    const { id, userId } = await params;
    
    // Parse and validate request body
    const body = await request.json();
    const { status } = updateAttendeeStatusSchema.parse(body);
    
    // Update attendee status
    const attendee = await meetingService.updateAttendeeStatus(
      id,
      userId,
      status
    );
    
    return NextResponse.json(
      {
        success: true,
        data: attendee,
        message: "Attendee status updated successfully",
      },
      { status: 200 }
    );
  } catch (error) {
    return handleError(error);
  }
}
