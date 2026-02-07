import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/middleware/auth.middleware";
import { updateLoginStreak, getUserStreak } from "@/lib/utils/streak";
import { handleError } from "@/lib/utils/errors";

/**
 * GET /api/users/check-in
 * Get user's current streak information
 * Authenticated users only
 */
export async function GET() {
  try {
    // Check authentication
    const sessionOrResponse = await requireAuth();
    if (sessionOrResponse instanceof NextResponse) {
      return sessionOrResponse;
    }

    const session = sessionOrResponse;

    // Get streak information
    const streakInfo = await getUserStreak(session.user.id!);

    return NextResponse.json(
      {
        success: true,
        data: streakInfo,
      },
      { status: 200 }
    );
  } catch (error) {
    return handleError(error);
  }
}

/**
 * POST /api/users/check-in
 * Record daily login and update streak
 * Authenticated users only
 */
export async function POST() {
  try {
    // Check authentication
    const sessionOrResponse = await requireAuth();
    if (sessionOrResponse instanceof NextResponse) {
      return sessionOrResponse;
    }

    const session = sessionOrResponse;

    // Update login streak
    const streakInfo = await updateLoginStreak(session.user.id!);

    return NextResponse.json(
      {
        success: true,
        data: streakInfo,
        message: streakInfo.streakBonusAwarded
          ? `Streak bonus! You've earned ${streakInfo.xpAwarded} XP for ${streakInfo.currentStreak} days in a row!`
          : `Welcome back! Current streak: ${streakInfo.currentStreak} day(s)`,
      },
      { status: 200 }
    );
  } catch (error) {
    return handleError(error);
  }
}
