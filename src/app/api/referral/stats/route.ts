import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/middleware/auth.middleware";
import { handleError } from "@/lib/utils/errors";
import { getReferralStats } from "@/lib/services/referral.service";

/**
 * GET /api/referral/stats
 * Get referral statistics for the authenticated user
 * Requires authentication
 * 
 * Returns:
 * - totalReferrals: Total number of users referred
 * - activeReferrals: Number of referrals who completed profile milestone
 * - totalXPEarned: Total XP earned from all referral milestones
 * - milestones: Breakdown of milestone completions
 */
export async function GET() {
  try {
    // Require authentication
    const sessionOrResponse = await requireAuth();
    if (sessionOrResponse instanceof NextResponse) {
      return sessionOrResponse;
    }

    const session = sessionOrResponse;
    const userId = session.user.id;

    if (!userId) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "INVALID_SESSION",
            message: "User ID not found in session",
          },
        },
        { status: 401 }
      );
    }

    // Get referral statistics
    let stats;
    try {
      stats = await getReferralStats(userId);
    } catch (dbError) {
      console.error("Database error while fetching referral stats:", dbError);
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "DATABASE_ERROR",
            message: "Failed to retrieve referral statistics. Please try again later.",
          },
        },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        data: stats,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Unexpected error in GET /api/referral/stats:", error);
    return handleError(error);
  }
}
