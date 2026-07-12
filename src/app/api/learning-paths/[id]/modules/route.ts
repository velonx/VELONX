import { NextRequest, NextResponse } from "next/server";
import { learningPathService } from "@/lib/services/learning-path.service";
import { requireAdmin, requireAuth } from "@/lib/middleware/auth.middleware";
import { handleError } from "@/lib/utils/errors";
import { prisma } from "@/lib/prisma";

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * POST /api/learning-paths/[id]/modules
 * Add a module to a learning path (Admin only)
 */
export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await requireAuth();
    if (session instanceof NextResponse) return session;

    const { id: pathId } = await params;

    // Check path ownership
    const path = await prisma.learningPath.findUnique({ where: { id: pathId } });
    if (!path) {
      return NextResponse.json({ success: false, error: { code: "NOT_FOUND", message: "Learning path not found" } }, { status: 404 });
    }

    if (path.creatorId && path.creatorId !== session.user.id && session.user.role !== "ADMIN") {
      return NextResponse.json({ success: false, error: { code: "FORBIDDEN", message: "Forbidden" } }, { status: 403 });
    }

    const body = await request.json();

    const addedModule = await learningPathService.addModule(pathId, {
      title: body.title,
      description: body.description,
      link: body.link,
      duration: body.duration,
      order: body.order,
    });

    return NextResponse.json(
      {
        success: true,
        data: addedModule,
      },
      { status: 201 }
    );
  } catch (error) {
    return handleError(error);
  }
}
