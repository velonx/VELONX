import { NextRequest, NextResponse } from "next/server";
import { meetingService } from "@/lib/services/meeting.service";
import { requireAuth } from "@/lib/middleware/auth.middleware";
import { handleError } from "@/lib/utils/errors";
import { createMeetingSchema, meetingQuerySchema } from "@/lib/validations/meeting";

/**
 * GET /api/meetings
 * List meetings with pagination and filtering
 * Requires authentication
 */
export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const sessionOrResponse = await requireAuth();
    if (sessionOrResponse instanceof NextResponse) {
      return sessionOrResponse;
    }
    
    const { searchParams } = new URL(request.url);
    
    // Parse and validate query parameters
    const queryParams = meetingQuerySchema.parse({
      page: searchParams.get("page"),
      pageSize: searchParams.get("pageSize"),
      startDate: searchParams.get("startDate"),
      endDate: searchParams.get("endDate"),
      userId: searchParams.get("userId"),
    });
    
    const result = await meetingService.listMeetings(queryParams);
    
    return NextResponse.json(
      {
        success: true,
        data: result.meetings,
        pagination: result.pagination,
      },
      { status: 200 }
    );
  } catch (error) {
    return handleError(error);
  }
}

/**
 * POST /api/meetings
 * Create a new meeting
 * Requires authentication
 */
export async function POST(request: NextRequest) {
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
    
    // Parse and validate request body
    const body = await request.json();
    const validatedData = createMeetingSchema.parse(body);
    
    // Create meeting
    const meeting = await meetingService.createMeeting({
      ...validatedData,
      creatorId: session.user.id,
    });
    
    return NextResponse.json(
      {
        success: true,
        data: meeting,
        message: "Meeting created successfully",
      },
      { status: 201 }
    );
  } catch (error) {
    return handleError(error);
  }
}
