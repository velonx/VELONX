import { NextRequest, NextResponse } from "next/server";
import { projectService } from "@/lib/services/project.service";
import { requireAuth } from "@/lib/middleware/auth.middleware";
import { handleError, AuthorizationError } from "@/lib/utils/errors";

/**
 * DELETE /api/projects/[id]/members/[userId]
 * Remove a member from a project
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; userId: string }> }
) {
  try {
    const session = await requireAuth();
    if (session instanceof NextResponse) return session;

    const { id, userId } = await params;

    // Check if user is owner or admin
    const isOwner = await projectService.isProjectOwner(id, session.user.id!);
    const isAdmin = session.user.role === "ADMIN";

    if (!isOwner && !isAdmin) {
      throw new AuthorizationError("Only the project owner or admin can remove members");
    }

    await projectService.removeProjectMember(id, userId);

    return NextResponse.json(
      {
        success: true,
        message: "Member removed successfully",
      },
      { status: 200 }
    );
  } catch (error) {
    return handleError(error);
  }
}
