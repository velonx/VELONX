import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/middleware/auth.middleware";
import { withErrorHandler } from "@/lib/utils/errors";
import { chatService } from "@/lib/services/chat.service";
import { z } from "zod";

/**
 * Validation schema for editing a message
 */
const editMessageSchema = z.object({
  content: z.string().min(1, "Message content is required").max(2000, "Message content must be 2000 characters or less"),
});

/**
 * @swagger
 * /api/community/messages/{id}:
 *   patch:
 *     summary: Edit a chat message
 *     description: Edit an existing chat message (author only)
 *     tags:
 *       - Community - Messages
 *     security:
 *       - sessionAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Message ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - content
 *             properties:
 *               content:
 *                 type: string
 *                 description: Updated message content
 *                 example: "Hello everyone! (edited)"
 *     responses:
 *       200:
 *         description: Message edited successfully
 *       400:
 *         description: Bad request - Invalid input
 *       401:
 *         description: Unauthorized - Authentication required
 *       403:
 *         description: Forbidden - Not the message author
 *       404:
 *         description: Message not found
 */
export const PATCH = withErrorHandler(async (
  request: NextRequest,
  { params }: { params: { id: string } }
) => {
  // Require authentication
  const sessionOrResponse = await requireAuth();
  if (sessionOrResponse instanceof NextResponse) {
    return sessionOrResponse;
  }

  const session = sessionOrResponse;
  const userId = session.user.id!;
  const messageId = params.id;

  // Parse and validate request body
  const body = await request.json();
  const validatedData = editMessageSchema.parse(body);

  // Edit message via service
  const message = await chatService.editMessage(
    messageId,
    validatedData.content,
    userId
  );

  return NextResponse.json(
    {
      success: true,
      data: message,
      message: "Message edited successfully",
    },
    { status: 200 }
  );
});

/**
 * @swagger
 * /api/community/messages/{id}:
 *   delete:
 *     summary: Delete a chat message
 *     description: Delete a chat message (author or moderator only)
 *     tags:
 *       - Community - Messages
 *     security:
 *       - sessionAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Message ID
 *     responses:
 *       200:
 *         description: Message deleted successfully
 *       401:
 *         description: Unauthorized - Authentication required
 *       403:
 *         description: Forbidden - Not the message author or moderator
 *       404:
 *         description: Message not found
 */
export const DELETE = withErrorHandler(async (
  request: NextRequest,
  { params }: { params: { id: string } }
) => {
  // Require authentication
  const sessionOrResponse = await requireAuth();
  if (sessionOrResponse instanceof NextResponse) {
    return sessionOrResponse;
  }

  const session = sessionOrResponse;
  const userId = session.user.id!;
  const messageId = params.id;

  // Delete message via service
  await chatService.deleteMessage(messageId, userId);

  return NextResponse.json(
    {
      success: true,
      message: "Message deleted successfully",
    },
    { status: 200 }
  );
});
