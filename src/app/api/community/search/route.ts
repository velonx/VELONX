import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/middleware/auth.middleware";
import { withErrorHandler } from "@/lib/utils/errors";
import { feedService } from "@/lib/services/feed.service";
import { z } from "zod";

/**
 * Validation schema for search query parameters
 */
const searchQuerySchema = z.object({
  q: z.string().min(1, "Search query is required").max(100, "Search query must be 100 characters or less"),
});

/**
 * @swagger
 * /api/community/search:
 *   get:
 *     summary: Search community content
 *     description: Search across posts, discussion rooms, and community groups
 *     tags:
 *       - Community - Search
 *     security:
 *       - sessionAuth: []
 *     parameters:
 *       - in: query
 *         name: q
 *         required: true
 *         schema:
 *           type: string
 *           minLength: 1
 *           maxLength: 100
 *         description: Search query
 *         example: "react tutorial"
 *     responses:
 *       200:
 *         description: Search results retrieved successfully
 *       400:
 *         description: Bad request - Invalid or missing query
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
    q: searchParams.get("q") || "",
  };

  const validatedQuery = searchQuerySchema.parse(queryParams);

  // Search content via service
  const searchResults = await feedService.searchContent(validatedQuery.q, userId);

  return NextResponse.json(
    {
      success: true,
      data: searchResults,
    },
    { status: 200 }
  );
});
