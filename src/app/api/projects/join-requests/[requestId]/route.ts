import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/middleware/auth.middleware";
import { handleError } from "@/lib/utils/errors";
import { notificationService } from "@/lib/services/notification.service";

/**
 * PATCH /api/projects/join-requests/[requestId]
 * Approve or reject a join request
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ requestId: string }> }
) {
  try {
    const session = await requireAuth();
    if (session instanceof NextResponse) return session;

    const { requestId } = await params;
    const body = await request.json();
    const { action } = body; // 'approve' or 'reject'

    if (!action || !['approve', 'reject'].includes(action)) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: "Action must be 'approve' or 'reject'",
          },
        },
        { status: 400 }
      );
    }

    // Get the join request
    const joinRequest = await prisma.userRequest.findUnique({
      where: { id: requestId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    if (!joinRequest) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "NOT_FOUND",
            message: "Join request not found",
          },
        },
        { status: 404 }
      );
    }

    if (joinRequest.type !== "PROJECT_JOIN") {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "INVALID_REQUEST_TYPE",
            message: "This is not a project join request",
          },
        },
        { status: 400 }
      );
    }

    if (joinRequest.status !== "PENDING") {
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
    const requestData = JSON.parse(joinRequest.reason || "{}");
    const projectId = requestData.projectId;

    // Verify user is the project owner
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      select: { ownerId: true, title: true },
    });

    if (!project) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "NOT_FOUND",
            message: "Project not found",
          },
        },
        { status: 404 }
      );
    }

    if (project.ownerId !== session.user.id) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "UNAUTHORIZED",
            message: "Only project owner can approve/reject join requests",
          },
        },
        { status: 403 }
      );
    }

    if (action === "approve") {
      // Add user as project member
      await prisma.projectMember.create({
        data: {
          projectId,
          userId: joinRequest.userId,
        },
      });

      // Update request status
      await prisma.userRequest.update({
        where: { id: requestId },
        data: {
          status: "APPROVED",
          reviewedBy: session.user.id,
          reviewedAt: new Date(),
        },
      });

      // Create notification for requester about approval
      try {
        await notificationService.createJoinRequestApprovedNotification({
          requestId,
          projectId,
          projectTitle: project.title,
          requesterId: joinRequest.userId,
        });
      } catch (error) {
        console.error('Failed to create join request approved notification:', error);
        // Don't fail the approval if notification fails
      }

      return NextResponse.json(
        {
          success: true,
          message: `${joinRequest.user.name} has been added to the project`,
        },
        { status: 200 }
      );
    } else {
      // Reject the request
      await prisma.userRequest.update({
        where: { id: requestId },
        data: {
          status: "REJECTED",
          reviewedBy: session.user.id,
          reviewedAt: new Date(),
        },
      });

      // Create notification for requester about rejection
      try {
        await notificationService.createJoinRequestRejectedNotification({
          requestId,
          projectId,
          projectTitle: project.title,
          requesterId: joinRequest.userId,
        });
      } catch (error) {
        console.error('Failed to create join request rejected notification:', error);
        // Don't fail the rejection if notification fails
      }

      return NextResponse.json(
        {
          success: true,
          message: "Join request rejected",
        },
        { status: 200 }
      );
    }
  } catch (error) {
    console.error("Join request action error:", error);
    return handleError(error);
  }
}
