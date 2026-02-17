import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/middleware/auth.middleware";
import { withErrorHandler } from "@/lib/utils/errors";
import { moderationService } from "@/lib/services/moderation.service";
import { z } from "zod";

/**
 * Validation schema for flagging content
 */
const flagContentSchema = z.object({
  contentId: z.string().min(1, "Content ID is required"),
  contentType: z.enum(["POST", "MESSAGE"], {
    message: "Content type must be POST or MESSAGE",
  }),
  reason: z.string().optional(),
});

/**
 * @swagger
 * /api/community/moderation/flag:
 *   post:
 *     summary: Flag inappropriate content
 *     description: Flag a post or message as inappropriate (moderator only)
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
 *               - contentId
 *               - contentType
 *             properties:
 *               contentId:
 *                 type: string
 *                 description: ID of the content to flag
 *                 example: "60d5ec49f1b2c8b1f8e4e1a1"
 *               contentType:
 *                 type: string
 *                 enum: [POST, MESSAGE]
 *                 description: Type of content being flagged
 *                 example: "POST"
 *               reason:
 *                 type: string
 *                 description: Reason for flagging
 *                 example: "Inappropriate language"
 *     responses:
 *       200:
 *         description: Content flagged successfully
 *       400:
 *         description: Bad request - Invalid input
 *       401:
 *         description: Unauthorized - Authentication required
 *       403:
 *         description: Forbidden - Moderator permissions required
 *       404:
 *         description: Content not found
 */
export const POST = withErrorHandler(async (request: NextRequest) => {
  // Require authentication
  const sessionOrResponse = await requireAuth();
  if (sessionOrResponse instanceof NextResponse) {
    return sessionOrResponse;
  }

  const session = sessionOrResponse;
  const userId = session.user.id!;

  // Parse and validate request body
  const body = await request.json();
  const validatedData = flagContentSchema.parse(body);

  // Flag content via service (service will verify moderator permissions)
  await moderationService.flagContent(
    validatedData.contentId,
    validatedData.contentType,
    userId,
    validatedData.reason
  );

  return NextResponse.json(
    {
      success: true,
      message: "Content flagged successfully",
    },
    { status: 200 }
  );
});
