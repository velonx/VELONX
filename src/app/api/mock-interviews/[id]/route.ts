import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { MockInterviewService } from "@/lib/services/career.service";
import { updateMockInterviewSchema } from "@/lib/validations/career";
import { ZodError } from "zod";

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

// PATCH - Update mock interview (admin only)
export async function PATCH(
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
    const body = await req.json();
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

    console.error("Mock interview update error:", error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "INTERNAL_ERROR",
          message: "Failed to update mock interview",
        },
      },
      { status: 500 }
    );
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
