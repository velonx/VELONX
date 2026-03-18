import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/middleware/auth.middleware";
import { withErrorHandler } from "@/lib/utils/errors";
import { feedService } from "@/lib/services/feed.service";
import { cacheService, CacheKeys, CacheTTL } from "@/lib/services/cache.service";
import { z } from "zod";

/**
 * Validation schema for trending query parameters
 */
const trendingQuerySchema = z.object({
  limit: z.coerce.number().int().positive().max(50).optional(),
});

/**
 * GET /api/community/feed/trending
 * Returns trending posts (cached for 5 minutes)
 */
export const GET = withErrorHandler(async (request: NextRequest) => {
  // Require authentication
  const sessionOrResponse = await requireAuth();
  if (sessionOrResponse instanceof NextResponse) {
    return sessionOrResponse;
  }

  // Parse and validate query parameters
  const searchParams = request.nextUrl.searchParams;
  const validatedQuery = trendingQuerySchema.parse({
    limit: searchParams.get("limit") || undefined,
  });
  const limit = validatedQuery.limit || 10;

  // Try cache first — trending posts change slowly, 5 min TTL is fine
  const cacheKey = CacheKeys.feed.trending(limit);
  const cached = await cacheService.get(cacheKey);
  if (cached) {
    return NextResponse.json(cached, { status: 200 });
  }

  // Cache miss — fetch from database
  const trendingPosts = await feedService.getTrendingPosts(limit);

  const response = {
    success: true,
    data: trendingPosts,
  };

  // Store in cache for 5 minutes
  await cacheService.set(cacheKey, response, CacheTTL.FEED_TRENDING);

  return NextResponse.json(response, { status: 200 });
});
