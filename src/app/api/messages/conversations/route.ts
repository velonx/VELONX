/**
 * GET /api/messages/conversations — List all conversations for the current user
 */

import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/middleware/auth.middleware";
import { handleError } from "@/lib/utils/errors";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const sessionOrResponse = await requireAuth();
    if (sessionOrResponse instanceof NextResponse) return sessionOrResponse;

    const userId = sessionOrResponse.user.id;
    if (!userId) {
      return NextResponse.json(
        { success: false, error: { code: "INVALID_SESSION", message: "User ID not found" } },
        { status: 401 }
      );
    }

    // Update current user's lastActiveAt in background
    prisma.user.update({
      where: { id: userId },
      data: { lastActiveAt: new Date() } as any,
    }).catch((err) => console.error("Failed to update lastActiveAt:", err));

    // Get all conversations where user is a participant
    const conversationsResult = await prisma.conversation.findMany({
      where: {
        OR: [{ participant1Id: userId }, { participant2Id: userId }],
      },
      orderBy: { lastMessageAt: "desc" },
      include: {
        participant1: {
          select: { id: true, name: true, image: true, headline: true, lastActiveAt: true } as any,
        },
        participant2: {
          select: { id: true, name: true, image: true, headline: true, lastActiveAt: true } as any,
        },
      } as any,
    });

    const conversations = conversationsResult as any[];

    // For each conversation, get unread count
    const conversationsWithUnread = await Promise.all(
      conversations.map(async (conv) => {
        const otherUser =
          conv.participant1Id === userId ? conv.participant2 : conv.participant1;
        const otherUserId =
          conv.participant1Id === userId ? conv.participant2Id : conv.participant1Id;

        const unreadCount = await prisma.directMessage.count({
          where: {
            senderId: otherUserId,
            receiverId: userId,
            isRead: false,
            isDeleted: false,
          },
        });

        const isOnline = otherUser && (otherUser as any).lastActiveAt
          ? (Date.now() - new Date((otherUser as any).lastActiveAt).getTime() < 3 * 60 * 1000)
          : false;

        return {
          conversationId: conv.id,
          otherUser: {
            id: otherUser.id,
            name: otherUser.name,
            image: otherUser.image,
            headline: otherUser.headline,
            isOnline,
          },
          lastMessageAt: conv.lastMessageAt,
          lastMessagePreview: conv.lastMessagePreview,
          unreadCount,
        };
      })
    );

    return NextResponse.json({
      success: true,
      data: { conversations: conversationsWithUnread },
    });
  } catch (error) {
    return handleError(error);
  }
}
