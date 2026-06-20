import { NextRequest, NextResponse } from "next/server";
import { leaderboardService, LeaderboardService } from "@/lib/services/leaderboard.service";
import { LeaderboardPeriod } from "@prisma/client";
import { auth } from "@/auth";
import { handleError } from "@/lib/utils/errors";
import { z } from "zod";

// Query parameters validation schema
const leaderboardQuerySchema = z.object({
  page: z.string().optional().transform((val) => (val ? parseInt(val, 10) : 1)),
  pageSize: z.string().optional().transform((val) => (val ? parseInt(val, 10) : 10)),
  role: z.enum(["STUDENT", "ADMIN"]).optional(),
  timeframe: z.enum(["all", "month", "week"]).optional(),
});

/**
 * GET /api/leaderboard
 * Get leaderboard with pagination and filtering
 * Public endpoint (no authentication required)
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    // Parse and validate query parameters
    // Only include params that have actual values so Zod defaults apply correctly
    const queryParamsRaw: Record<string, string> = {};
    const page = searchParams.get("page");
    if (page) queryParamsRaw.page = page;
    const pageSize = searchParams.get("pageSize");
    if (pageSize) queryParamsRaw.pageSize = pageSize;
    const role = searchParams.get("role");
    if (role) queryParamsRaw.role = role;
    const timeframe = searchParams.get("timeframe");
    if (timeframe) queryParamsRaw.timeframe = timeframe;

    const queryParams = leaderboardQuerySchema.parse(queryParamsRaw);

    const session = await auth();
    const userId = session?.user?.id;

    let period: LeaderboardPeriod = 'ALL_TIME';
    if (queryParams.timeframe === 'month') period = 'MONTHLY';
    else if (queryParams.timeframe === 'week') period = 'WEEKLY';

    let userRank: number | null = null;
    if (userId) {
      const rankInfo = await LeaderboardService.getUserRank(userId, period);
      userRank = rankInfo.rank;
    }

    const { entries, totalCount } = await leaderboardService.getLeaderboard(queryParams);

    return NextResponse.json(
      {
        success: true,
        data: entries,
        pagination: {
          page: queryParams.page,
          pageSize: queryParams.pageSize,
          totalCount: totalCount,
          totalPages: Math.ceil(totalCount / queryParams.pageSize),
          userRank: userRank,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    return handleError(error);
  }
}
