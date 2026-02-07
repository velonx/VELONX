import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/middleware/auth.middleware";
import { handleError } from "@/lib/utils/errors";

/**
 * POST /api/user-requests
 * Create a new user request (mentor application, project submission, etc.)
 */
export async function POST(request: NextRequest) {
  try {
    const session = await requireAuth();
    if (session instanceof NextResponse) return session;

    const body = await request.json();
    const { type, reason } = body;

    if (!type || !reason) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: "Type and reason are required",
          },
        },
        { status: 400 }
      );
    }

    // Validate type
    const validTypes = ["ACCOUNT_APPROVAL", "PROJECT_SUBMISSION", "MENTOR_APPLICATION"];
    if (!validTypes.includes(type)) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: "Invalid request type",
          },
        },
        { status: 400 }
      );
    }

    // Check if user already has a pending request of this type
    const existingRequest = await prisma.userRequest.findFirst({
      where: {
        userId: session.user.id!,
        type,
        status: "PENDING",
      },
    });

    if (existingRequest) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "DUPLICATE_REQUEST",
            message: "You already have a pending request of this type",
          },
        },
        { status: 400 }
      );
    }

    // Create the user request
    const userRequest = await prisma.userRequest.create({
      data: {
        userId: session.user.id!,
        type,
        reason,
        status: "PENDING",
      },
    });

    return NextResponse.json(
      {
        success: true,
        data: userRequest,
        message: "Request submitted successfully",
      },
      { status: 201 }
    );
  } catch (error) {
    return handleError(error);
  }
}
