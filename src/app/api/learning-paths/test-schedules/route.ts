import { NextRequest, NextResponse } from "next/server";
import { learningPathService } from "@/lib/services/learning-path.service";
import { requireAdmin } from "@/lib/middleware/auth.middleware";
import { handleError } from "@/lib/utils/errors";

/**
 * GET /api/learning-paths/test-schedules
 * List all scheduled/pending exams for learning paths (Admin only)
 */
export async function GET(request: NextRequest) {
  try {
    const session = await requireAdmin();
    if (session instanceof NextResponse) return session;

    const schedules = await learningPathService.listAllTestSchedules();

    return NextResponse.json({
      success: true,
      data: schedules,
    });
  } catch (error) {
    return handleError(error);
  }
}
