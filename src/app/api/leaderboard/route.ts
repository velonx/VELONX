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
    const queryParams = leaderboardQuerySchema.parse({
      page: searchParams.get("page"),
      pageSize: searchParams.get("pageSize"),
      role: searchParams.get("role"),
      timeframe: searchParams.get("timeframe"),
    });
    
    const result = await leaderboardService.getLeaderboard(queryParams);
    
    return NextResponse.json(
      {
        success: true,
        data: result.leaderboard,
        pagination: result.pagination,
      },
      { status: 200 }
    );
  } catch (error) {
    return handleError(error);
  }
}
