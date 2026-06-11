import { NextRequest, NextResponse } from "next/server";
import { learningPathService } from "@/lib/services/learning-path.service";
import { requireAuth } from "@/lib/middleware/auth.middleware";
import { handleError } from "@/lib/utils/errors";

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * POST /api/learning-paths/[id]/schedule-test
 * Schedule a certificate test for the specified learning path
 */
export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await requireAuth();
    if (session instanceof NextResponse) return session;

    const { id: pathId } = await params;
    const userId = session.user.id;

    if (!userId) {
      return NextResponse.json(
        { success: false, error: { code: "UNAUTHORIZED", message: "User session invalid" } },
        { status: 401 }
      );
    }

    const body = await request.json();
    if (!body.testDate) {
      return NextResponse.json(
        { success: false, error: { code: "BAD_REQUEST", message: "testDate is required" } },
        { status: 400 }
      );
    }

    const testDate = new Date(body.testDate);

    const schedule = await learningPathService.scheduleTest(userId, pathId, testDate);

    return NextResponse.json({
      success: true,
      data: schedule,
    });
  } catch (error) {
    return handleError(error);
  }
}
