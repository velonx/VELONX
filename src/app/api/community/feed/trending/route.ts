import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/middleware/auth.middleware";
import { withErrorHandler } from "@/lib/utils/errors";
import { feedService } from "@/lib/services/feed.service";
import { z } from "zod";

/**
 * Validation schema for trending query parameters
 */
const trendingQuerySchema = z.object({
  limit: z.coerce.number().int().positive().max(50).optional(),
});

/**
 * @swagger
 * /api/community/feed/trending:
 *   get:
 *     summary: Get trending posts
 *     description: Retrieve trending posts based on engagement (reactions and comments)
 *     tags:
 *       - Community - Feed
 *     security:
 *       - sessionAuth: []
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *           maximum: 50
 *         description: Number of trending posts to return
 *     responses:
 *       200:
 *         description: Trending posts retrieved successfully
 *       400:
 *         description: Bad request - Invalid query parameters
 *       401:
 *         description: Unauthorized - Authentication required
 */
export const GET = withErrorHandler(async (request: NextRequest) => {
  // Require authentication
  const sessionOrResponse = await requireAuth();
  if (sessionOrResponse instanceof NextResponse) {
    return sessionOrResponse;
  }

  // Parse and validate query parameters
  const searchParams = request.nextUrl.searchParams;
  const queryParams = {
    limit: searchParams.get("limit") || undefined,
  };

  const validatedQuery = trendingQuerySchema.parse(queryParams);

  // Get trending posts via service
  const trendingPosts = await feedService.getTrendingPosts(validatedQuery.limit);

  return NextResponse.json(
    {
      success: true,
      data: trendingPosts,
    },
    { status: 200 }
  );
});
