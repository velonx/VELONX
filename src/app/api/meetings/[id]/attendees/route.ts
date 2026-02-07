import { NextRequest, NextResponse } from "next/server";
import { meetingService } from "@/lib/services/meeting.service";
import { requireAuth } from "@/lib/middleware/auth.middleware";
import { handleError } from "@/lib/utils/errors";
import { z } from "zod";

/**
 * POST /api/meetings/[id]/attendees
 * Add an attendee to a meeting
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
    
    const { id } = await params;
    
    // Parse and validate request body
    const body = await request.json();
    const schema = z.object({
      userId: z.string().min(1, "User ID is required"),
    });
    const { userId } = schema.parse(body);
    
    // Add attendee
    const attendee = await meetingService.addMeetingAttendee(id, userId);
    
    return NextResponse.json(
      {
        success: true,
        data: attendee,
        message: "Attendee added successfully",
      },
      { status: 201 }
    );
  } catch (error) {
    return handleError(error);
  }
}
