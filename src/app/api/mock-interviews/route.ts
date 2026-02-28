import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { MockInterviewService } from "@/lib/services/career.service";
import { mockInterviewService } from "@/lib/services/mock-interview.service";
import { mockInterviewSchema } from "@/lib/validations/career";
import { prisma } from "@/lib/prisma";
import { ZodError } from "zod";
import { handleError } from "@/lib/utils/errors";

// POST - Create mock interview application
export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: { code: "UNAUTHORIZED", message: "Please sign in" } },
        { status: 401 }
      );
    }

    const body = await req.json();
    const validatedData = mockInterviewSchema.parse(body);

    const mockInterview = await MockInterviewService.create(session.user.id, validatedData);

    return NextResponse.json({
      success: true,
      data: mockInterview,
      message: "Mock interview application submitted successfully",
    });
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: "Invalid input data",
            details: error.issues,
          },
        },
        { status: 400 }
      );
    }

    console.error("Mock interview creation error:", error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "INTERNAL_ERROR",
          message: "Failed to submit mock interview application",
        },
      },
      { status: 500 }
    );
  }
}

// GET - Get all mock interviews (admin only) or user's own applications
export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: { code: "UNAUTHORIZED", message: "Please sign in" } },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(req.url);
    const statusParam = searchParams.get("status");

    let mockInterviews;

    if (session.user.role === "ADMIN") {
      // Admin can see all applications with optional status filter
      if (statusParam === 'PENDING') {
        // Use new service for pending interviews with user details
        const interviews = await mockInterviewService.getAll({ status: 'PENDING' });
        
        // Fetch user details for each interview
        const interviewsWithUsers = await Promise.all(
          interviews.map(async (interview) => {
            const user = await prisma.user.findUnique({
              where: { id: interview.userId },
              select: {
                id: true,
                name: true,
                email: true,
              },
            });
            
            return {
              ...interview,
              user,
            };
          })
        );
        
        return NextResponse.json({
          success: true,
          data: interviewsWithUsers,
        });
      }
      
      // Fallback to old service for other statuses
      mockInterviews = await MockInterviewService.getAll({ status: statusParam || undefined });
    } else {
      // Students can only see their own applications
      mockInterviews = await MockInterviewService.getByUserId(session.user.id);
    }

    return NextResponse.json({
      success: true,
      data: mockInterviews,
    });
  } catch (error) {
    return handleError(error);
  }
}
