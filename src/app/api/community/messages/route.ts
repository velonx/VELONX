import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/middleware/auth.middleware";
import { withErrorHandler } from "@/lib/utils/errors";
import { chatService } from "@/lib/services/chat.service";
import { applyCustomRateLimit } from "@/lib/middleware/rate-limit.middleware";
import { z } from "zod";

/**
 * Validation schema for sending a message
 */
const sendMessageSchema = z.object({
  content: z.string().min(1, "Message content is required").max(2000, "Message content must be 2000 characters or less"),
  roomId: z.string().optional(),
  groupId: z.string().optional(),
}).refine(
  (data) => (data.roomId && !data.groupId) || (!data.roomId && data.groupId),
  {
    message: "Either roomId or groupId must be specified, but not both",
  }
);

/**
 * @swagger
 * /api/community/messages:
 *   post:
 *     summary: Send a chat message
 *     description: Send a chat message to a discussion room or community group
 *     tags:
 *       - Community - Messages
 *     security:
 *       - sessionAuth: []
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
 *                 description: Message content
 *                 example: "Hello everyone!"
 *               roomId:
 *                 type: string
 *                 description: Discussion room ID (required if groupId not provided)
 *                 example: "60d5ec49f1b2c8b1f8e4e1a1"
 *               groupId:
 *                 type: string
 *                 description: Community group ID (required if roomId not provided)
 *                 example: "60d5ec49f1b2c8b1f8e4e1a2"
 *     responses:
 *       201:
 *         description: Message sent successfully
 *       400:
 *         description: Bad request - Invalid input
 *       401:
 *         description: Unauthorized - Authentication required
 *       403:
 *         description: Forbidden - User is muted or not a member
 *       429:
 *         description: Too many requests - Rate limit exceeded
 */
export const POST = withErrorHandler(async (request: NextRequest) => {
  // Require authentication
  const sessionOrResponse = await requireAuth();
  if (sessionOrResponse instanceof NextResponse) {
    return sessionOrResponse;
  }

  const session = sessionOrResponse;
  const userId = session.user.id!;

  // Apply rate limiting: 30 messages per minute
  const rateLimitResponse = await applyCustomRateLimit(
    request,
    userId,
    {
      maxRequests: 30,
      windowMs: 60000, // 1 minute
    },
    "community:messages:send"
  );

  if (rateLimitResponse) {
    return rateLimitResponse;
  }

  // Parse and validate request body
  const body = await request.json();
  const validatedData = sendMessageSchema.parse(body);

  // Send message via service (includes mute status checking)
  const message = await chatService.sendMessage(
    {
      content: validatedData.content,
      roomId: validatedData.roomId,
      groupId: validatedData.groupId,
    },
    userId
  );

  return NextResponse.json(
    {
      success: true,
      data: message,
      message: "Message sent successfully",
    },
    { status: 201 }
  );
});

/**
 * @swagger
 * /api/community/messages:
 *   get:
 *     summary: Get chat messages
 *     description: Retrieve chat messages from a discussion room or community group with pagination
 *     tags:
 *       - Community - Messages
 *     security:
 *       - sessionAuth: []
 *     parameters:
 *       - in: query
 *         name: roomId
 *         schema:
 *           type: string
 *         description: Discussion room ID (required if groupId not provided)
 *       - in: query
 *         name: groupId
 *         schema:
 *           type: string
 *         description: Community group ID (required if roomId not provided)
 *       - in: query
 *         name: cursor
 *         schema:
 *           type: string
 *         description: Cursor for pagination (message ID)
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 50
 *         description: Number of messages to retrieve
 *     responses:
 *       200:
 *         description: Messages retrieved successfully
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

  // Parse query parameters
  const searchParams = request.nextUrl.searchParams;
  const roomId = searchParams.get("roomId") || undefined;
  const groupId = searchParams.get("groupId") || undefined;
  const cursor = searchParams.get("cursor") || undefined;
  const limit = parseInt(searchParams.get("limit") || "50", 10);

  // Validate that either roomId or groupId is provided
  if (!roomId && !groupId) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "VALIDATION_ERROR",
          message: "Either roomId or groupId must be specified",
        },
      },
      { status: 400 }
    );
  }

  if (roomId && groupId) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "VALIDATION_ERROR",
          message: "Cannot specify both roomId and groupId",
        },
      },
      { status: 400 }
    );
  }

  // Get messages via service
  const messages = await chatService.getMessages(roomId, groupId, cursor, limit);

  return NextResponse.json(
    {
      success: true,
      data: messages,
      pagination: {
        cursor: messages.length > 0 ? messages[messages.length - 1].id : null,
        hasMore: messages.length === limit,
      },
    },
    { status: 200 }
  );
});
