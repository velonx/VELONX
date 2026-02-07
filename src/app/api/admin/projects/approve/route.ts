import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/middleware/auth.middleware";
import { handleError } from "@/lib/utils/errors";
import { notificationService } from "@/lib/services/notification.service";

/**
 * POST /api/admin/projects/approve
 * Approve a project submission and create the actual project
 */
export async function POST(request: NextRequest) {
  try {
    const session = await requireAuth();
    if (session instanceof NextResponse) return session;

    // Check if user is admin
    if (session.user.role !== "ADMIN") {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "UNAUTHORIZED",
            message: "Only admins can approve projects",
          },
        },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { requestId } = body;

    if (!requestId) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: "Request ID is required",
          },
        },
        { status: 400 }
      );
    }

    // Get the user request
    const userRequest = await prisma.userRequest.findUnique({
      where: { id: requestId },
      include: { user: true },
    });

    if (!userRequest) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "NOT_FOUND",
            message: "Request not found",
          },
        },
        { status: 404 }
      );
    }

    if (userRequest.type !== "PROJECT_SUBMISSION") {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "INVALID_REQUEST_TYPE",
            message: "This is not a project submission request",
          },
        },
        { status: 400 }
      );
    }

    if (userRequest.status !== "PENDING") {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "ALREADY_PROCESSED",
            message: "This request has already been processed",
          },
        },
        { status: 400 }
      );
    }

    // Parse project data from reason field
    const projectData = JSON.parse(userRequest.reason || "{}");

    // Create the project
    const project = await prisma.project.create({
      data: {
        title: projectData.title,
        description: projectData.description,
        techStack: projectData.techStack || [],
        status: "IN_PROGRESS",
        ownerId: userRequest.userId,
      },
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
      },
    });

    // Update the user request status
    await prisma.userRequest.update({
      where: { id: requestId },
      data: {
        status: "APPROVED",
        reviewedBy: session.user.id,
        reviewedAt: new Date(),
      },
    });

    // Create notification for project owner about approval
    try {
      await notificationService.createProjectApprovedNotification({
        projectId: project.id,
        ownerId: userRequest.userId,
        projectTitle: project.title,
      });
    } catch (error) {
      console.error('Failed to create project approved notification:', error);
      // Don't fail the approval if notification fails
    }

    return NextResponse.json(
      {
        success: true,
        data: project,
        message: "Project approved and created successfully",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Project approval error:", error);
    return handleError(error);
  }
}
