import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/middleware/auth.middleware";
import { withErrorHandler } from "@/lib/utils/errors";
import { followService } from "@/lib/services/follow.service";
import { z } from "zod";

/**
 * Validation schema for following a user
 */
const followUserSchema = z.object({
  userId: z.string().min(1, "User ID is required"),
});

/**
 * @swagger
 * /api/community/follow:
 *   post:
 *     summary: Follow a user
 *     description: Create a follow relationship with another user
 *     tags:
 *       - Community - Follow
 *     security:
 *       - sessionAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - userId
 *             properties:
 *               userId:
 *                 type: string
 *                 description: ID of the user to follow
 *                 example: "60d5ec49f1b2c8b1f8e4e1a1"
 *     responses:
 *       200:
 *         description: User followed successfully
 *       400:
 *         description: Bad request - Invalid input or already following
 *       401:
 *         description: Unauthorized - Authentication required
 *       404:
 *         description: User not found
 */
export const POST = withErrorHandler(async (request: NextRequest) => {
  // Require authentication
  const sessionOrResponse = await requireAuth();
  if (sessionOrResponse instanceof NextResponse) {
    return sessionOrResponse;
  }

  const session = sessionOrResponse;
  const followerId = session.user.id!;

  // Parse and validate request body
  const body = await request.json();
  const validatedData = followUserSchema.parse(body);

  // Follow user via service
  await followService.followUser(followerId, validatedData.userId);

  return NextResponse.json(
    {
      success: true,
      message: "User followed successfully",
    },
    { status: 200 }
  );
});
