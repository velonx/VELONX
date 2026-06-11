import { NextRequest, NextResponse } from "next/server";
import { learningPathService } from "@/lib/services/learning-path.service";
import { requireAdmin } from "@/lib/middleware/auth.middleware";
import { handleError } from "@/lib/utils/errors";

interface RouteParams {
  params: Promise<{ moduleId: string }>;
}

/**
 * PATCH /api/learning-paths/modules/[moduleId]
 * Update a module (Admin only)
 */
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await requireAdmin();
    if (session instanceof NextResponse) return session;

    const { moduleId } = await params;
    const body = await request.json();

    const updated = await learningPathService.updateModule(moduleId, body);

    return NextResponse.json({
      success: true,
      data: updated,
    });
  } catch (error) {
    return handleError(error);
  }
}

/**
 * DELETE /api/learning-paths/modules/[moduleId]
 * Delete a module (Admin only)
 */
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await requireAdmin();
    if (session instanceof NextResponse) return session;

    const { moduleId } = await params;
    await learningPathService.deleteModule(moduleId);

    return NextResponse.json({
      success: true,
      message: "Module deleted successfully",
    });
  } catch (error) {
    return handleError(error);
  }
}
