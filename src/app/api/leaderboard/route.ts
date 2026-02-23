import { NextRequest, NextResponse } from "next/server";
import { leaderboardService } from "@/lib/services/leaderboard.service";
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

    const leaderboard = await leaderboardService.getLeaderboard(queryParams);

    return NextResponse.json(
      {
        success: true,
        data: leaderboard,
        pagination: {
          page: queryParams.page,
          pageSize: queryParams.pageSize,
          total: leaderboard.length,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    return handleError(error);
  }
}
