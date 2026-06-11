import { NextRequest, NextResponse } from "next/server";
import { learningPathService } from "@/lib/services/learning-path.service";
import { requireAdmin } from "@/lib/middleware/auth.middleware";
import { handleError } from "@/lib/utils/errors";
import { z } from "zod";

interface RouteParams {
  params: Promise<{ id: string }>;
}

const updateScheduleSchema = z.object({
  status: z.enum(["PENDING", "SCHEDULED", "PASSED", "FAILED"]),
  score: z.number().min(0).max(100).optional(),
});

/**
 * PATCH /api/learning-paths/test-schedules/[id]
 * Update a test schedule status (Admin only)
 */
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await requireAdmin();
    if (session instanceof NextResponse) return session;

    const { id } = await params;
    const body = await request.json();
    const validatedData = updateScheduleSchema.parse(body);

    const updated = await learningPathService.updateTestScheduleStatus(
      id,
      validatedData.status,
      validatedData.score
    );

    return NextResponse.json({
      success: true,
      data: updated,
    });
  } catch (error) {
    return handleError(error);
  }
}
