import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/middleware/auth.middleware";
import { withErrorHandler } from "@/lib/utils/errors";
import { moderationService } from "@/lib/services/moderation.service";
import { z } from "zod";

/**
 * Validation schema for muting a user
 */
const muteUserSchema = z.object({
  userId: z.string().min(1, "User ID is required"),
  roomId: z.string().optional(),
  groupId: z.string().optional(),
  duration: z.number().min(1, "Duration must be at least 1 minute").max(43200, "Duration cannot exceed 30 days (43200 minutes)"),
  reason: z.string().optional(),
}).refine(
  (data) => data.roomId || data.groupId,
  {
    message: "Either roomId or groupId must be specified",
  }
).refine(
  (data) => !(data.roomId && data.groupId),
  {
    message: "Cannot specify both roomId and groupId",
  }
);

/**
 * @swagger
 * /api/community/moderation/mute:
 *   post:
 *     summary: Mute a user
 *     description: Mute a user in a room or group, preventing them from sending messages (moderator only)
 *     tags:
 *       - Community - Moderation
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
 *               - duration
 *             properties:
 *               userId:
 *                 type: string
 *                 description: ID of the user to mute
 *                 example: "60d5ec49f1b2c8b1f8e4e1a1"
 *               roomId:
 *                 type: string
 *                 description: ID of the room (required if groupId not specified)
 *                 example: "60d5ec49f1b2c8b1f8e4e1a2"
 *               groupId:
 *                 type: string
 *                 description: ID of the group (required if roomId not specified)
 *                 example: "60d5ec49f1b2c8b1f8e4e1a3"
 *               duration:
 *                 type: number
 *                 description: Mute duration in minutes (1-43200)
 *                 example: 60
 *               reason:
 *                 type: string
 *                 description: Reason for muting
 *                 example: "Spamming messages"
 *     responses:
 *       200:
 *         description: User muted successfully
 *       400:
 *         description: Bad request - Invalid input
 *       401:
 *         description: Unauthorized - Authentication required
 *       403:
 *         description: Forbidden - Moderator permissions required
 *       404:
 *         description: User, room, or group not found
 */
export const POST = withErrorHandler(async (request: NextRequest) => {
  // Require authentication
  const sessionOrResponse = await requireAuth();
  if (sessionOrResponse instanceof NextResponse) {
    return sessionOrResponse;
  }

  const session = sessionOrResponse;
  const moderatorId = session.user.id!;

  // Parse and validate request body
  const body = await request.json();
  const validatedData = muteUserSchema.parse(body);

  // Mute user via service (service will verify moderator permissions)
  await moderationService.muteUser(
    validatedData.userId,
    validatedData.roomId,
    validatedData.groupId,
    moderatorId,
    validatedData.duration,
    validatedData.reason
  );

  return NextResponse.json(
    {
      success: true,
      message: "User muted successfully",
    },
    { status: 200 }
  );
});
