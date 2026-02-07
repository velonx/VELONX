import { NextRequest, NextResponse } from "next/server";
import { meetingService } from "@/lib/services/meeting.service";
import { requireAuth } from "@/lib/middleware/auth.middleware";
import { handleError, AuthorizationError } from "@/lib/utils/errors";
import { updateMeetingSchema } from "@/lib/validations/meeting";

/**
 * GET /api/meetings/[id]
 * Get meeting details by ID
 * Requires authentication
 */
export async function GET(
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
    const meeting = await meetingService.getMeetingById(id);
    
    return NextResponse.json(
      {
        success: true,
        data: meeting,
      },
      { status: 200 }
    );
  } catch (error) {
    return handleError(error);
  }
}

/**
 * PATCH /api/meetings/[id]
 * Update a meeting
 * Creator or Admin only
 */
export async function PATCH(
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
    const { id } = await params;
    
    // Get meeting to check ownership
    const meeting = await meetingService.getMeetingById(id);
    
    // Check if user is creator or admin
    const isCreator = meeting.creatorId === session.user.id;
    const isAdmin = session.user.role === "ADMIN";
    
    if (!isCreator && !isAdmin) {
      throw new AuthorizationError("Only the meeting creator or admin can update this meeting");
    }
    
    // Parse and validate request body
    const body = await request.json();
    const validatedData = updateMeetingSchema.parse(body);
    
    // Update meeting
    const updatedMeeting = await meetingService.updateMeeting(id, validatedData);
    
    return NextResponse.json(
      {
        success: true,
        data: updatedMeeting,
        message: "Meeting updated successfully",
      },
      { status: 200 }
    );
  } catch (error) {
    return handleError(error);
  }
}

/**
 * DELETE /api/meetings/[id]
 * Delete a meeting
 * Creator or Admin only
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
    const { id } = await params;
    
    // Get meeting to check ownership
    const meeting = await meetingService.getMeetingById(id);
    
    // Check if user is creator or admin
    const isCreator = meeting.creatorId === session.user.id;
    const isAdmin = session.user.role === "ADMIN";
    
    if (!isCreator && !isAdmin) {
      throw new AuthorizationError("Only the meeting creator or admin can delete this meeting");
    }
    
    // Delete meeting
    await meetingService.deleteMeeting(id);
    
    return NextResponse.json(
      {
        success: true,
        message: "Meeting deleted successfully",
      },
      { status: 200 }
    );
  } catch (error) {
    return handleError(error);
  }
}
