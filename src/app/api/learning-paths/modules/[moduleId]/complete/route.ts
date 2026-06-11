import { NextRequest, NextResponse } from "next/server";
import { learningPathService } from "@/lib/services/learning-path.service";
import { requireAuth } from "@/lib/middleware/auth.middleware";
import { handleError } from "@/lib/utils/errors";

interface RouteParams {
  params: Promise<{ moduleId: string }>;
}

/**
 * POST /api/learning-paths/modules/[moduleId]/complete
 * Toggle module completion status for the authenticated user
 */
export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await requireAuth();
    if (session instanceof NextResponse) return session;

    const { moduleId } = await params;
    const userId = session.user.id;

    if (!userId) {
      return NextResponse.json(
        { success: false, error: { code: "UNAUTHORIZED", message: "User session invalid" } },
        { status: 401 }
      );
    }

    const result = await learningPathService.toggleModuleCompletion(userId, moduleId);

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error) {
    return handleError(error);
  }
}
