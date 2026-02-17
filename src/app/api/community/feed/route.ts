import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/middleware/auth.middleware";
import { withErrorHandler } from "@/lib/utils/errors";
import { feedService } from "@/lib/services/feed.service";
import { cacheService, CacheKeys, CacheTTL } from "@/lib/services/cache.service";
import { z } from "zod";

/**
 * Validation schema for feed query parameters
 */
const feedQuerySchema = z.object({
  cursor: z.string().optional(),
  limit: z.coerce.number().int().positive().max(100).default(20),
  filter: z.enum(["ALL", "FOLLOWING", "GROUPS"]).default("ALL"),
});

/**
 * @swagger
 * /api/community/feed:
 *   get:
 *     summary: Get personalized feed
 *     description: Retrieve personalized content feed with filtering and cursor-based pagination
 *     tags:
 *       - Community - Feed
 *     security:
 *       - sessionAuth: []
 *     parameters:
 *       - in: query
 *         name: cursor
 *         schema:
 *           type: string
 *         description: Cursor for pagination (post ID)
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *           maximum: 100
 *         description: Number of items to return
 *       - in: query
 *         name: filter
 *         schema:
 *           type: string
 *           enum: [ALL, FOLLOWING, GROUPS]
 *           default: ALL
 *         description: Filter feed content
 *     responses:
 *       200:
 *         description: Feed retrieved successfully
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

  const session = sessionOrResponse;
  const userId = session.user.id!;

  // Parse and validate query parameters
  const searchParams = request.nextUrl.searchParams;
  const queryParams = {
    cursor: searchParams.get("cursor") || undefined,
    limit: searchParams.get("limit") || undefined,
    filter: searchParams.get("filter") || "ALL",
  };

  const validatedQuery = feedQuerySchema.parse(queryParams);

  // Generate cache key based on user ID, filter, cursor, and limit
  const cacheKey = CacheKeys.feed.user(
    userId,
    validatedQuery.filter,
    validatedQuery.cursor || 'initial',
    validatedQuery.limit
  );

  // Try to get from cache first (cache-aside pattern)
  const cachedFeed = await cacheService.get(cacheKey);
  
  if (cachedFeed) {
    return NextResponse.json(cachedFeed, { status: 200 });
  }

  // Cache miss - fetch from database via service
  const feedItems = await feedService.getUserFeed(userId, validatedQuery);

  // Generate next cursor (last item's ID)
  const nextCursor = feedItems.length > 0 ? feedItems[feedItems.length - 1].post.id : null;

  const response = {
    success: true,
    data: feedItems,
    pagination: {
      nextCursor,
      hasMore: feedItems.length === (validatedQuery.limit || 20),
    },
  };

  // Store in cache with 5-minute TTL
  await cacheService.set(cacheKey, response, CacheTTL.FEED);

  return NextResponse.json(response, { status: 200 });
});
