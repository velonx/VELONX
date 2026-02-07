import { NextRequest, NextResponse } from "next/server";
import { projectService } from "@/lib/services/project.service";
import { requireAuth } from "@/lib/middleware/auth.middleware";
import { handleError, AuthorizationError } from "@/lib/utils/errors";
import { addProjectMemberSchema } from "@/lib/validations/project";

/**
 * POST /api/projects/[id]/members
 * Add a member to a project
 */
export async function POST(
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
      throw new AuthorizationError("Only the project owner or admin can add members");
    }

    const body = await request.json();
    
    // Validate request body
    const validatedData = addProjectMemberSchema.parse(body);

    const member = await projectService.addProjectMember(
      id,
      validatedData.userId,
      validatedData.role
    );

    return NextResponse.json(
      {
        success: true,
        data: member,
        message: "Member added successfully",
      },
      { status: 201 }
    );
  } catch (error) {
    return handleError(error);
  }
}
