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
        
        // Extract unique user IDs from interviews
        const userIds = Array.from(new Set(interviews.map(interview => interview.userId)));

        // Fetch user details for all unique users in a single query
        const users = await prisma.user.findMany({
          where: { id: { in: userIds } },
          select: {
            id: true,
            name: true,
            email: true,
          },
        });

        // Create a map for fast user lookups by ID
        const userMap = new Map(users.map(user => [user.id, user]));

        // Attach user details to each interview
        const interviewsWithUsers = interviews.map(interview => ({
          ...interview,
          user: userMap.get(interview.userId) || null,
        }));
        
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
