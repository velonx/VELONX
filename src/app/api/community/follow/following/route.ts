import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/middleware/auth.middleware";
import { withErrorHandler } from "@/lib/utils/errors";
import { followService } from "@/lib/services/follow.service";

/**
 * @swagger
 * /api/community/follow/following:
 *   get:
 *     summary: Get following
 *     description: Retrieve list of users that the authenticated user follows
 *     tags:
 *       - Community - Follow
 *     security:
 *       - sessionAuth: []
 *     parameters:
 *       - in: query
 *         name: userId
 *         schema:
 *           type: string
 *         description: User ID to get following for (defaults to authenticated user)
 *     responses:
 *       200:
 *         description: Following list retrieved successfully
 *       401:
 *         description: Unauthorized - Authentication required
 *       404:
 *         description: User not found
 */
export const GET = withErrorHandler(async (request: NextRequest) => {
  // Require authentication
  const sessionOrResponse = await requireAuth();
  if (sessionOrResponse instanceof NextResponse) {
    return sessionOrResponse;
  }

  const session = sessionOrResponse;
  const searchParams = request.nextUrl.searchParams;
  const userId = searchParams.get("userId") || session.user.id!;

  // Get following via service
  const following = await followService.getFollowing(userId);

  return NextResponse.json(
    {
      success: true,
      data: following,
    },
    { status: 200 }
  );
});
