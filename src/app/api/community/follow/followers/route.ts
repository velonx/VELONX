import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/middleware/auth.middleware";
import { withErrorHandler } from "@/lib/utils/errors";
import { followService } from "@/lib/services/follow.service";

/**
 * @swagger
 * /api/community/follow/followers:
 *   get:
 *     summary: Get followers
 *     description: Retrieve list of users who follow the authenticated user
 *     tags:
 *       - Community - Follow
 *     security:
 *       - sessionAuth: []
 *     parameters:
 *       - in: query
 *         name: userId
 *         schema:
 *           type: string
 *         description: User ID to get followers for (defaults to authenticated user)
 *     responses:
 *       200:
 *         description: Followers retrieved successfully
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

  // Get followers via service
  const followers = await followService.getFollowers(userId);

  return NextResponse.json(
    {
      success: true,
      data: followers,
    },
    { status: 200 }
  );
});
