import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/middleware/auth.middleware";
import { handleError } from "@/lib/utils/errors";
import { notificationService } from "@/lib/services/notification.service";

/**
 * GET /api/projects/[id]/join-requests
 * Get all join requests for a project (owner only)
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireAuth();
    if (session instanceof NextResponse) return session;

    const { id: projectId } = await params;

    // Check if user is the project owner
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      select: { ownerId: true },
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
            message: "Only project owner can view join requests",
          },
        },
        { status: 403 }
      );
    }

    // Get all pending join requests for this project
    const joinRequests = await prisma.userRequest.findMany({
      where: {
        type: "PROJECT_JOIN",
        status: "PENDING",
        reason: {
          contains: projectId, // The reason field contains JSON with projectId
        },
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
            xp: true,
            level: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(
      {
        success: true,
        data: joinRequests,
      },
      { status: 200 }
    );
  } catch (error) {
    return handleError(error);
  }
}

/**
 * POST /api/projects/[id]/join-requests
 * Create a join request for a project
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireAuth();
    if (session instanceof NextResponse) return session;

    const { id: projectId } = await params;

    // Check if project exists
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      include: {
        owner: {
          select: {
            id: true,
            name: true,
          },
        },
      },
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

    // Check if user is already a member
    const existingMember = await prisma.projectMember.findUnique({
      where: {
        projectId_userId: {
          projectId,
          userId: session.user.id!,
        },
      },
    });

    if (existingMember) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "ALREADY_MEMBER",
            message: "You are already a member of this project",
          },
        },
        { status: 400 }
      );
    }

    // Check if user already has a pending request
    const existingRequest = await prisma.userRequest.findFirst({
      where: {
        userId: session.user.id!,
        type: "PROJECT_JOIN",
        status: "PENDING",
        reason: {
          contains: projectId,
        },
      },
    });

    if (existingRequest) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "DUPLICATE_REQUEST",
            message: "You already have a pending join request for this project",
          },
        },
        { status: 400 }
      );
    }

    // Create join request
    const joinRequest = await prisma.userRequest.create({
      data: {
        userId: session.user.id!,
        type: "PROJECT_JOIN",
        status: "PENDING",
        reason: JSON.stringify({
          projectId,
          projectTitle: project.title,
          ownerId: project.ownerId,
          ownerName: project.owner.name,
        }),
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    // Create notification for project owner about join request
    try {
      await notificationService.createProjectJoinRequestNotification({
        requestId: joinRequest.id,
        projectId,
        projectTitle: project.title,
        ownerId: project.ownerId,
        requesterName: joinRequest.user.name || 'A user',
      });
    } catch (error) {
      console.error('Failed to create project join request notification:', error);
      // Don't fail the request creation if notification fails
    }

    return NextResponse.json(
      {
        success: true,
        data: joinRequest,
        message: "Join request sent successfully",
      },
      { status: 201 }
    );
  } catch (error) {
    return handleError(error);
  }
}
