import { NextRequest, NextResponse } from "next/server";
import { learningPathService } from "@/lib/services/learning-path.service";
import { auth } from "@/auth";
import { requireAdmin } from "@/lib/middleware/auth.middleware";
import { handleError } from "@/lib/utils/errors";

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * GET /api/learning-paths/[id]
 * Fetch a single path with modules and user completion status
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth();
    const userId = session?.user?.id;
    const { id } = await params;

    const path = await learningPathService.getLearningPathById(id, userId);

    return NextResponse.json({
      success: true,
      data: path,
    });
  } catch (error) {
    return handleError(error);
  }
}

/**
 * PATCH /api/learning-paths/[id]
 * Update a learning path (Admin only)
 */
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await requireAdmin();
    if (session instanceof NextResponse) return session;

    const { id } = await params;
    const body = await request.json();

    const updated = await learningPathService.updateLearningPath(id, body);

    return NextResponse.json({
      success: true,
      data: updated,
    });
  } catch (error) {
    return handleError(error);
  }
}

/**
 * DELETE /api/learning-paths/[id]
 * Delete a learning path (Admin only)
 */
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await requireAdmin();
    if (session instanceof NextResponse) return session;

    const { id } = await params;
    await learningPathService.deleteLearningPath(id);

    return NextResponse.json({
      success: true,
      message: "Learning path deleted successfully",
    });
  } catch (error) {
    return handleError(error);
  }
}
