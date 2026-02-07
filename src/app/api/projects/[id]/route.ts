import { NextRequest, NextResponse } from "next/server";
import { projectService } from "@/lib/services/project.service";
import { requireAuth, requireAdmin } from "@/lib/middleware/auth.middleware";
import { handleError, AuthorizationError } from "@/lib/utils/errors";
import { updateProjectSchema } from "@/lib/validations/project";
import { awardXP, XP_REWARDS } from "@/lib/utils/xp";

/**
 * GET /api/projects/[id]
 * Get a single project by ID
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireAuth();
    if (session instanceof NextResponse) return session;

    const { id } = await params;
    const project = await projectService.getProjectById(id);

    return NextResponse.json(
      {
        success: true,
        data: project,
      },
      { status: 200 }
    );
  } catch (error) {
    return handleError(error);
  }
}

/**
 * PATCH /api/projects/[id]
 * Update a project (owner or admin only)
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireAuth();
    if (session instanceof NextResponse) return session;

    const { id } = await params;

    // Check if user is owner or admin
    const isOwner = await projectService.isProjectOwner(id, session.user.id!);
    const isAdmin = session.user.role === "ADMIN";

    if (!isOwner && !isAdmin) {
      throw new AuthorizationError("Only the project owner or admin can update this project");
    }

    // Get existing project to check old status
    const existingProject = await projectService.getProjectById(id);

    const body = await request.json();
    
    // Validate request body
    const validatedData = updateProjectSchema.parse(body);

    const project = await projectService.updateProject(id, validatedData);

    // Award XP if project was just completed
    if (validatedData.status === 'COMPLETED' && existingProject.status !== 'COMPLETED') {
      try {
        await awardXP(
          project.ownerId,
          XP_REWARDS.PROJECT_COMPLETION,
          `Completed project: ${project.title}`
        );
      } catch (error) {
        console.error('Failed to award XP for project completion:', error);
        // Don't fail the project update if XP award fails
      }
    }

    return NextResponse.json(
      {
        success: true,
        data: project,
        message: "Project updated successfully",
      },
      { status: 200 }
    );
  } catch (error) {
    return handleError(error);
  }
}

/**
 * DELETE /api/projects/[id]
 * Delete a project (owner or admin only)
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireAuth();
    if (session instanceof NextResponse) return session;

    const { id } = await params;

    // Check if user is owner or admin
    const isOwner = await projectService.isProjectOwner(id, session.user.id!);
    const isAdmin = session.user.role === "ADMIN";

    if (!isOwner && !isAdmin) {
      throw new AuthorizationError("Only the project owner or admin can delete this project");
    }

    await projectService.deleteProject(id);

    return NextResponse.json(
      {
        success: true,
        message: "Project deleted successfully",
      },
      { status: 200 }
    );
  } catch (error) {
    return handleError(error);
  }
}
