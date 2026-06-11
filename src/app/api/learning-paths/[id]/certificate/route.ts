import { NextRequest, NextResponse } from "next/server";
import { learningPathService } from "@/lib/services/learning-path.service";
import { requireAuth } from "@/lib/middleware/auth.middleware";
import { handleError } from "@/lib/utils/errors";

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * POST /api/learning-paths/[id]/certificate
 * Complete the scheduled test, pass it, and claim/unlock the certificate
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

    const body = await request.json().catch(() => ({}));
    const score = body.score ?? 95;

    const result = await learningPathService.claimCertificate(userId, pathId, score);

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error) {
    return handleError(error);
  }
}
