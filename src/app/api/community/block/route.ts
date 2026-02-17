import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/middleware/auth.middleware";
import { withErrorHandler } from "@/lib/utils/errors";
import { blockService } from "@/lib/services/block.service";
import { z } from "zod";

/**
 * Validation schema for blocking a user
 */
const blockUserSchema = z.object({
  blockedId: z.string().min(1, "User ID to block is required"),
});

/**
 * @swagger
 * /api/community/block:
 *   post:
 *     summary: Block a user
 *     description: Block a user, preventing them from viewing your content and sending you messages
 *     tags:
 *       - Community - Block
 *     security:
 *       - sessionAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - blockedId
 *             properties:
 *               blockedId:
 *                 type: string
 *                 description: ID of the user to block
 *                 example: "60d5ec49f1b2c8b1f8e4e1a1"
 *     responses:
 *       200:
 *         description: User blocked successfully
 *       400:
 *         description: Bad request - Invalid input or already blocked
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
  const blockerId = session.user.id!;

  // Parse and validate request body
  const body = await request.json();
  const validatedData = blockUserSchema.parse(body);

  // Block user via service
  await blockService.blockUser(blockerId, validatedData.blockedId);

  return NextResponse.json(
    {
      success: true,
      message: "User blocked successfully",
    },
    { status: 200 }
  );
});

/**
 * @swagger
 * /api/community/block:
 *   get:
 *     summary: Get blocked users
 *     description: Retrieve list of users you have blocked
 *     tags:
 *       - Community - Block
 *     security:
 *       - sessionAuth: []
 *     responses:
 *       200:
 *         description: Blocked users retrieved successfully
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

  // Get blocked users via service
  const blockedUsers = await blockService.getBlockedUsers(userId);

  return NextResponse.json(
    {
      success: true,
      data: blockedUsers,
    },
    { status: 200 }
  );
});
