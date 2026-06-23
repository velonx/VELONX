/**
 * GET /api/messages/[userId] — Get message history with a specific user
 * POST /api/messages/[userId] — Send a message to a user
 */

import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/middleware/auth.middleware";
import { handleError } from "@/lib/utils/errors";
import { prisma } from "@/lib/prisma";
import { directMessageSchema } from "@/lib/validations/profile";
import { areConnected } from "@/lib/services/connection.service";

/**
 * Sanitize message content to prevent XSS
 */
function sanitizeContent(text: string): string {
  if (!text) return text;
  let sanitized = text.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "");
  sanitized = sanitized.replace(/on\w+\s*=\s*["'][^"']*["']/gi, "");
  sanitized = sanitized.replace(/javascript:/gi, "");
  sanitized = sanitized.replace(/<[^>]*>/g, "");
  return sanitized.trim();
}

/**
 * GET /api/messages/[userId]
 * Get message history with a specific user (paginated, cursor-based)
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const sessionOrResponse = await requireAuth();
    if (sessionOrResponse instanceof NextResponse) return sessionOrResponse;

    const currentUserId = sessionOrResponse.user.id;
    if (!currentUserId) {
      return NextResponse.json(
        { success: false, error: { code: "INVALID_SESSION", message: "User ID not found" } },
        { status: 401 }
      );
    }

    // Update current user's lastActiveAt in background
    prisma.user.update({
      where: { id: currentUserId },
      data: { lastActiveAt: new Date() } as any,
    }).catch((err) => console.error("Failed to update lastActiveAt:", err));

    const { userId: otherUserId } = await params;
    const { searchParams } = new URL(request.url);
    const cursor = searchParams.get("cursor") || undefined;
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get("limit") || "30", 10)));

    // Get messages between the two users
    const messages = await prisma.directMessage.findMany({
      where: {
        isDeleted: false,
        OR: [
          { senderId: currentUserId, receiverId: otherUserId },
          { senderId: otherUserId, receiverId: currentUserId },
        ],
      },
      orderBy: { createdAt: "desc" },
      take: limit + 1, // Fetch one extra to determine if there are more
      ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
      select: {
        id: true,
        content: true,
        senderId: true,
        receiverId: true,
        isRead: true,
        isEdited: true,
        createdAt: true,
        sender: {
          select: { id: true, name: true, image: true },
        },
      },
    });

    const hasMore = messages.length > limit;
    const items = hasMore ? messages.slice(0, limit) : messages;
    const nextCursor = hasMore ? items[items.length - 1]?.id : undefined;

    // Get recipient's online status
    const otherUserRecord = await prisma.user.findUnique({
      where: { id: otherUserId },
      select: { lastActiveAt: true } as any,
    }) as any;

    const isOnline = otherUserRecord?.lastActiveAt
      ? (Date.now() - new Date(otherUserRecord.lastActiveAt).getTime() < 3 * 60 * 1000)
      : false;

    return NextResponse.json({
      success: true,
      data: {
        messages: items.reverse(), // Return in chronological order
        nextCursor,
        hasMore,
        isOnline,
      },
    });
  } catch (error) {
    return handleError(error);
  }
}

/**
 * POST /api/messages/[userId]
 * Send a message to a user (must be connected)
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const sessionOrResponse = await requireAuth();
    if (sessionOrResponse instanceof NextResponse) return sessionOrResponse;

    const currentUserId = sessionOrResponse.user.id;
    if (!currentUserId) {
      return NextResponse.json(
        { success: false, error: { code: "INVALID_SESSION", message: "User ID not found" } },
        { status: 401 }
      );
    }

    const { userId: receiverId } = await params;

    if (currentUserId === receiverId) {
      return NextResponse.json(
        { success: false, error: { code: "INVALID_REQUEST", message: "Cannot message yourself" } },
        { status: 400 }
      );
    }

    // Check if connected
    const connected = await areConnected(currentUserId, receiverId);
    if (!connected) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "NOT_CONNECTED",
            message: "You can only message users you are connected with",
          },
        },
        { status: 403 }
      );
    }

    // Check if blocked
    const block = await prisma.userBlock.findFirst({
      where: {
        OR: [
          { blockerId: currentUserId, blockedId: receiverId },
          { blockerId: receiverId, blockedId: currentUserId },
        ],
      },
    });

    if (block) {
      return NextResponse.json(
        { success: false, error: { code: "BLOCKED", message: "Cannot message this user" } },
        { status: 403 }
      );
    }

    const body = await request.json();
    const validated = directMessageSchema.parse(body);
    const sanitizedContent = sanitizeContent(validated.content);

    if (!sanitizedContent) {
      return NextResponse.json(
        { success: false, error: { code: "INVALID_CONTENT", message: "Message cannot be empty" } },
        { status: 400 }
      );
    }

    // Create message and update/create conversation atomically
    const [message] = await Promise.all([
      prisma.directMessage.create({
        data: {
          senderId: currentUserId,
          receiverId,
          content: sanitizedContent,
        },
        select: {
          id: true,
          content: true,
          senderId: true,
          receiverId: true,
          isRead: true,
          createdAt: true,
          sender: {
            select: { id: true, name: true, image: true },
          },
        },
      }),
      // Upsert conversation (ensure consistent participant ordering)
      upsertConversation(currentUserId, receiverId, sanitizedContent),
    ]);

    // Create notification for receiver (fire-and-forget)
    prisma.notification
      .create({
        data: {
          userId: receiverId,
          title: "New Message",
          description: `${message.sender.name || "Someone"} sent you a message`,
          type: "DIRECT_MESSAGE",
          actionUrl: `/messages/${currentUserId}`,
        },
      })
      .catch((err) => console.error("Failed to create DM notification:", err));

    // Send email notification (fire-and-forget)
    prisma.user
      .findUnique({
        where: { id: receiverId },
        select: { email: true, name: true },
      })
      .then((receiver) => {
        if (receiver && receiver.email) {
          import("@/lib/services/email.service")
            .then(({ EmailService }) => {
              EmailService.sendDirectMessageEmail(
                { email: receiver.email, name: receiver.name },
                { name: message.sender.name },
                sanitizedContent.length > 200 ? sanitizedContent.substring(0, 200) + "..." : sanitizedContent
              ).catch((err) => console.error("Failed to send DM email:", err));
            })
            .catch((err) => console.error("Failed to import EmailService:", err));
        }
      })
      .catch((err) => console.error("Failed to fetch receiver for DM email:", err));

    return NextResponse.json(
      { success: true, data: message, message: "Message sent" },
      { status: 201 }
    );
  } catch (error) {
    return handleError(error);
  }
}

/**
 * Upsert a conversation between two users
 * Uses consistent ordering: smaller ID is always participant1
 */
async function upsertConversation(
  userId1: string,
  userId2: string,
  lastMessagePreview: string
) {
  const [p1, p2] = userId1 < userId2 ? [userId1, userId2] : [userId2, userId1];
  const preview =
    lastMessagePreview.length > 100
      ? lastMessagePreview.substring(0, 100) + "..."
      : lastMessagePreview;

  // Try to find existing conversation
  const existing = await prisma.conversation.findFirst({
    where: {
      OR: [
        { participant1Id: p1, participant2Id: p2 },
        { participant1Id: p2, participant2Id: p1 },
      ],
    },
  });

  if (existing) {
    return prisma.conversation.update({
      where: { id: existing.id },
      data: {
        lastMessageAt: new Date(),
        lastMessagePreview: preview,
      },
    });
  }

  return prisma.conversation.create({
    data: {
      participant1Id: p1,
      participant2Id: p2,
      lastMessageAt: new Date(),
      lastMessagePreview: preview,
    },
  });
}
