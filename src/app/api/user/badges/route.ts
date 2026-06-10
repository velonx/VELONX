import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/middleware/auth.middleware";
import { handleError } from "@/lib/utils/errors";
import { BadgeService } from "@/lib/services/badge.service";

export async function GET() {
  try {
    const sessionOrResponse = await requireAuth();
    if (sessionOrResponse instanceof NextResponse) {
      return sessionOrResponse;
    }

    const userId = sessionOrResponse.user.id;
    if (!userId) {
      return NextResponse.json(
        { success: false, error: { code: "UNAUTHORIZED", message: "User session invalid" } },
        { status: 401 }
      );
    }

    // Auto-evaluate and award badges for any historical achievements
    await BadgeService.evaluateAndAwardBadges(userId);

    const badges = await BadgeService.getBadgesWithProgress(userId);

    return NextResponse.json({
      success: true,
      data: badges,
    }, { status: 200 });
  } catch (error) {
    console.error("GET /api/user/badges error:", error);
    return handleError(error);
  }
}
