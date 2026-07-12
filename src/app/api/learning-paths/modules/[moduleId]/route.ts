import { NextRequest, NextResponse } from "next/server";
import { learningPathService } from "@/lib/services/learning-path.service";
import { requireAdmin, requireAuth } from "@/lib/middleware/auth.middleware";
import { handleError } from "@/lib/utils/errors";
import { prisma } from "@/lib/prisma";

interface RouteParams {
  params: Promise<{ moduleId: string }>;
}

/**
 * PATCH /api/learning-paths/modules/[moduleId]
 * Update a module (Admin only)
 */
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await requireAuth();
    if (session instanceof NextResponse) return session;

    const { moduleId } = await params;

    // Check parent path ownership
    const existingModule = await prisma.module.findUnique({
      where: { id: moduleId },
      include: { learningPath: true },
    });
    if (!existingModule) {
      return NextResponse.json({ success: false, error: { code: "NOT_FOUND", message: "Module not found" } }, { status: 404 });
    }

    if (existingModule.learningPath.creatorId && existingModule.learningPath.creatorId !== session.user.id && session.user.role !== "ADMIN") {
      return NextResponse.json({ success: false, error: { code: "FORBIDDEN", message: "Forbidden" } }, { status: 403 });
    }

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
    const session = await requireAuth();
    if (session instanceof NextResponse) return session;

    const { moduleId } = await params;

    // Check parent path ownership
    const existingModule = await prisma.module.findUnique({
      where: { id: moduleId },
      include: { learningPath: true },
    });
    if (!existingModule) {
      return NextResponse.json({ success: false, error: { code: "NOT_FOUND", message: "Module not found" } }, { status: 404 });
    }

    if (existingModule.learningPath.creatorId && existingModule.learningPath.creatorId !== session.user.id && session.user.role !== "ADMIN") {
      return NextResponse.json({ success: false, error: { code: "FORBIDDEN", message: "Forbidden" } }, { status: 403 });
    }

    await learningPathService.deleteModule(moduleId);

    return NextResponse.json({
      success: true,
      message: "Module deleted successfully",
    });
  } catch (error) {
    return handleError(error);
  }
}
