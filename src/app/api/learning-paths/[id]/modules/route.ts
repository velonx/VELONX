import { NextRequest, NextResponse } from "next/server";
import { learningPathService } from "@/lib/services/learning-path.service";
import { requireAdmin } from "@/lib/middleware/auth.middleware";
import { handleError } from "@/lib/utils/errors";

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * POST /api/learning-paths/[id]/modules
 * Add a module to a learning path (Admin only)
 */
export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await requireAdmin();
    if (session instanceof NextResponse) return session;

    const { id: pathId } = await params;
    const body = await request.json();

    const module = await learningPathService.addModule(pathId, {
      title: body.title,
      description: body.description,
      link: body.link,
      duration: body.duration,
      order: body.order,
    });

    return NextResponse.json(
      {
        success: true,
        data: module,
      },
      { status: 201 }
    );
  } catch (error) {
    return handleError(error);
  }
}
