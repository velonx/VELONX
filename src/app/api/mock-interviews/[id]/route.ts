import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { MockInterviewService } from "@/lib/services/career.service";
import { mockInterviewService } from "@/lib/services/mock-interview.service";
import { updateMockInterviewSchema } from "@/lib/validations/career";
import { interviewApprovalSchema } from "@/lib/validations/mock-interview";
import { ZodError } from "zod";
import { handleError } from "@/lib/utils/errors";

// GET - Get single mock interview
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: { code: "UNAUTHORIZED", message: "Please sign in" } },
        { status: 401 }
      );
    }

    const { id } = await params;
    const mockInterview = await MockInterviewService.getById(id);

    if (!mockInterview) {
      return NextResponse.json(
        { success: false, error: { code: "NOT_FOUND", message: "Mock interview not found" } },
        { status: 404 }
      );
    }

    // Check authorization
    if (session.user.role !== "ADMIN" && mockInterview.userId !== session.user.id) {
      return NextResponse.json(
        { success: false, error: { code: "FORBIDDEN", message: "Access denied" } },
        { status: 403 }
      );
    }

    return NextResponse.json({
      success: true,
      data: mockInterview,
    });
  } catch (error) {
    console.error("Mock interview fetch error:", error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "INTERNAL_ERROR",
          message: "Failed to fetch mock interview",
        },
      },
      { status: 500 }
    );
  }
}

// PATCH - Update mock interview or approve/reject it (admin only for approval)
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: { code: "UNAUTHORIZED", message: "Please sign in" } },
        { status: 401 }
      );
    }

    const { id } = await params;
    const body = await req.json();
    
    // Check if this is an approval/rejection action
    if (body.action === 'approve' || body.action === 'reject') {
      // Validate admin role for approval/rejection
      if (session.user.role !== "ADMIN") {
        return NextResponse.json(
          {
            success: false,
            error: {
              code: "FORBIDDEN",
              message: "Only admins can approve or reject mock interviews",
            },
          },
          { status: 403 }
        );
      }
      
      // Validate approval schema
      const validatedData = interviewApprovalSchema.parse(body);
      
      let mockInterview;
      
      if (validatedData.action === 'approve') {
        // Approve interview
        mockInterview = await mockInterviewService.approve(id, session.user.id);
        
        return NextResponse.json(
          {
            success: true,
            data: mockInterview,
            message: "Mock interview approved successfully",
          },
          { status: 200 }
        );
      } else {
        // Reject interview with feedback
        mockInterview = await mockInterviewService.reject(
          id,
          session.user.id,
          validatedData.feedback!
        );
        
        return NextResponse.json(
          {
            success: true,
            data: mockInterview,
            message: "Mock interview rejected successfully",
          },
          { status: 200 }
        );
      }
    }
    
    // Regular update flow (existing functionality)
    if (session.user.role !== "ADMIN") {
      return NextResponse.json(
        { success: false, error: { code: "FORBIDDEN", message: "Admin access required" } },
        { status: 403 }
      );
    }

    const validatedData = updateMockInterviewSchema.parse(body);

    const mockInterview = await MockInterviewService.update(
      id,
      validatedData,
      session.user.id
    );

    return NextResponse.json({
      success: true,
      data: mockInterview,
      message: "Mock interview updated successfully",
    });
  } catch (error) {
    return handleError(error);
  }
}

// DELETE - Delete mock interview (admin only)
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    
    if (!session?.user?.id || session.user.role !== "ADMIN") {
      return NextResponse.json(
        { success: false, error: { code: "FORBIDDEN", message: "Admin access required" } },
        { status: 403 }
      );
    }

    const { id } = await params;
    await MockInterviewService.delete(id);

    return NextResponse.json({
      success: true,
      message: "Mock interview deleted successfully",
    });
  } catch (error) {
    console.error("Mock interview delete error:", error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "INTERNAL_ERROR",
          message: "Failed to delete mock interview",
        },
      },
      { status: 500 }
    );
  }
}
