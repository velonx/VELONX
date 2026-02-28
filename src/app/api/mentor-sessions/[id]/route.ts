import { NextRequest, NextResponse } from "next/server";
import { mentorSessionService } from "@/lib/services/mentor-session.service";
import { requireAuth } from "@/lib/middleware/auth.middleware";
import { handleError, AuthorizationError } from "@/lib/utils/errors";
import { updateSessionSchema, sessionApprovalSchema } from "@/lib/validations/mentor-session";

/**
 * GET /api/mentor-sessions/[id]
 * Get session details by ID
 * Requires authentication
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    // Check authentication
    const sessionOrResponse = await requireAuth();
    if (sessionOrResponse instanceof NextResponse) {
      return sessionOrResponse;
    }
    
    const session = sessionOrResponse;
    
    // Get session
    const mentorSession = await mentorSessionService.getSessionById(id);
    
    // Check if user is authorized to view this session
    if (
      mentorSession.studentId !== session.user.id &&
      mentorSession.mentorId !== session.user.id &&
      session.user.role !== "ADMIN"
    ) {
      throw new AuthorizationError("You are not authorized to view this session");
    }
    
    return NextResponse.json(
      {
        success: true,
        data: mentorSession,
      },
      { status: 200 }
    );
  } catch (error) {
    return handleError(error);
  }
}

/**
 * PATCH /api/mentor-sessions/[id]
 * Update a mentor session or approve/reject it (admin only for approval)
 * Requires authentication
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    // Check authentication
    const sessionOrResponse = await requireAuth();
    if (sessionOrResponse instanceof NextResponse) {
      return sessionOrResponse;
    }
    
    const session = sessionOrResponse;
    
    // Parse request body
    const body = await request.json();
    
    // Check if this is an approval/rejection action
    if (body.action === 'approve' || body.action === 'reject') {
      // Validate admin role for approval/rejection
      if (session.user.role !== "ADMIN") {
        return NextResponse.json(
          {
            success: false,
            error: {
              code: "FORBIDDEN",
              message: "Only admins can approve or reject sessions",
            },
          },
          { status: 403 }
        );
      }
      
      // Validate approval schema
      const validatedData = sessionApprovalSchema.parse(body);
      
      let mentorSession;
      
      if (validatedData.action === 'approve') {
        // Approve session
        mentorSession = await mentorSessionService.approveSession(id, session.user.id);
        
        return NextResponse.json(
          {
            success: true,
            data: mentorSession,
            message: "Session approved successfully",
          },
          { status: 200 }
        );
      } else {
        // Reject session with reason
        mentorSession = await mentorSessionService.rejectSession(
          id,
          session.user.id,
          validatedData.reason!
        );
        
        return NextResponse.json(
          {
            success: true,
            data: mentorSession,
            message: "Session rejected successfully",
          },
          { status: 200 }
        );
      }
    }
    
    // Regular update flow (existing functionality)
    // Get existing session to check ownership
    const existingSession = await mentorSessionService.getSessionById(id);
    
    // Check if user is authorized to update this session
    const isStudent = existingSession.studentId === session.user.id;
    const isMentor = existingSession.mentorId === session.user.id;
    const isAdmin = session.user.role === "ADMIN";
    
    if (!isStudent && !isMentor && !isAdmin) {
      throw new AuthorizationError("You are not authorized to update this session");
    }
    
    // Parse and validate request body
    const validatedData = updateSessionSchema.parse(body);
    
    // Update session
    const mentorSession = await mentorSessionService.updateSession(id, validatedData);
    
    return NextResponse.json(
      {
        success: true,
        data: mentorSession,
        message: "Session updated successfully",
      },
      { status: 200 }
    );
  } catch (error) {
    return handleError(error);
  }
}

/**
 * DELETE /api/mentor-sessions/[id]
 * Cancel a mentor session
 * Requires authentication
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
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
    
    // Cancel session
    await mentorSessionService.cancelSession(id, session.user.id);
    
    return NextResponse.json(
      {
        success: true,
        message: "Session cancelled successfully",
      },
      { status: 200 }
    );
  } catch (error) {
    return handleError(error);
  }
}
