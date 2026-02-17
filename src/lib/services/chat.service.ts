import { prisma } from "@/lib/prisma";
import { getRedisClient } from "@/lib/redis";
import { NotFoundError, ValidationError, AuthorizationError } from "@/lib/utils/errors";

/**
 * Input type for sending a chat message
 */
export interface SendMessageInput {
  content: string;
  roomId?: string;
  groupId?: string;
}

/**
 * Input type for editing a chat message
 */
export interface EditMessageInput {
  content: string;
}

/**
 * Typing indicator payload
 */
export interface TypingPayload {
  userId: string;
  userName: string;
  roomId?: string;
  groupId?: string;
  isTyping: boolean;
}

/**
 * Chat message data with author information
 */
export interface ChatMessageData {
  id: string;
  content: string;
  roomId?: string | null;
  groupId?: string | null;
  authorId: string;
  authorName: string;
  authorImage?: string | null;
  isEdited: boolean;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Chat service layer for managing real-time chat operations
 * Validates: Requirements 3.1, 3.2, 3.3, 3.4, 3.5, 3.6
 */
export class ChatService {
  /**
   * Send a chat message to a room or group
   * Validates: Requirements 3.1, 3.2, 3.3
   */
  async sendMessage(data: SendMessageInput, authorId: string): Promise<ChatMessageData> {
    // Validate input
    if (!data.content || data.content.trim().length === 0) {
      throw new ValidationError("Message content is required");
    }

    if (data.content.length > 2000) {
      throw new ValidationError("Message content exceeds maximum length of 2000 characters");
    }

    // Must specify either roomId or groupId, but not both
    if (!data.roomId && !data.groupId) {
      throw new ValidationError("Either roomId or groupId must be specified");
    }

    if (data.roomId && data.groupId) {
      throw new ValidationError("Cannot specify both roomId and groupId");
    }

    // Validate that the author exists
    const author = await prisma.user.findUnique({
      where: { id: authorId },
      select: { id: true, name: true, image: true },
    });

    if (!author) {
      throw new ValidationError("Invalid authorId: User does not exist");
    }

    // Validate room or group exists and user is a member
    if (data.roomId) {
      const room = await prisma.discussionRoom.findUnique({
        where: { id: data.roomId },
        select: { id: true },
      });

      if (!room) {
        throw new NotFoundError("Discussion room");
      }

      // Check if user is a member
      const isMember = await prisma.roomMember.findUnique({
        where: {
          roomId_userId: {
            roomId: data.roomId,
            userId: authorId,
          },
        },
      });

      if (!isMember) {
        throw new AuthorizationError("You must be a member of this room to send messages");
      }

      // Check if user is muted in this room
      const isMuted = await this.isUserMuted(authorId, data.roomId, undefined);
      if (isMuted) {
        throw new AuthorizationError("You are muted in this room and cannot send messages");
      }
    }

    if (data.groupId) {
      const group = await prisma.communityGroup.findUnique({
        where: { id: data.groupId },
        select: { id: true },
      });

      if (!group) {
        throw new NotFoundError("Community group");
      }

      // Check if user is a member
      const isMember = await prisma.groupMember.findUnique({
        where: {
          groupId_userId: {
            groupId: data.groupId,
            userId: authorId,
          },
        },
      });

      if (!isMember) {
        throw new AuthorizationError("You must be a member of this group to send messages");
      }

      // Check if user is muted in this group
      const isMuted = await this.isUserMuted(authorId, undefined, data.groupId);
      if (isMuted) {
        throw new AuthorizationError("You are muted in this group and cannot send messages");
      }
    }

    // Create the message
    const message = await prisma.chatMessage.create({
      data: {
        content: data.content.trim(),
        roomId: data.roomId,
        groupId: data.groupId,
        authorId,
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
      },
    });

    // Format message data
    const messageData: ChatMessageData = {
      id: message.id,
      content: message.content,
      roomId: message.roomId,
      groupId: message.groupId,
      authorId: message.authorId,
      authorName: message.author.name || "Unknown",
      authorImage: message.author.image,
      isEdited: message.isEdited,
      isDeleted: message.isDeleted,
      createdAt: message.createdAt,
      updatedAt: message.updatedAt,
    };

    // Broadcast message to connected clients
    await this.broadcastMessage(messageData);

    return messageData;
  }

  /**
   * Edit a chat message
   * Validates: Requirements 3.4
   */
  async editMessage(messageId: string, content: string, userId: string): Promise<ChatMessageData> {
    // Validate input
    if (!content || content.trim().length === 0) {
      throw new ValidationError("Message content is required");
    }

    if (content.length > 2000) {
      throw new ValidationError("Message content exceeds maximum length of 2000 characters");
    }

    // Get the message
    const message = await prisma.chatMessage.findUnique({
      where: { id: messageId },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
      },
    });

    if (!message) {
      throw new NotFoundError("Chat message");
    }

    // Check if user is the author
    if (message.authorId !== userId) {
      throw new AuthorizationError("You can only edit your own messages");
    }

    // Check if message is already deleted
    if (message.isDeleted) {
      throw new ValidationError("Cannot edit a deleted message");
    }

    // Update the message
    const updatedMessage = await prisma.chatMessage.update({
      where: { id: messageId },
      data: {
        content: content.trim(),
        isEdited: true,
        updatedAt: new Date(),
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
      },
    });

    // Format message data
    const messageData: ChatMessageData = {
      id: updatedMessage.id,
      content: updatedMessage.content,
      roomId: updatedMessage.roomId,
      groupId: updatedMessage.groupId,
      authorId: updatedMessage.authorId,
      authorName: updatedMessage.author.name || "Unknown",
      authorImage: updatedMessage.author.image,
      isEdited: updatedMessage.isEdited,
      isDeleted: updatedMessage.isDeleted,
      createdAt: updatedMessage.createdAt,
      updatedAt: updatedMessage.updatedAt,
    };

    // Broadcast message edit to connected clients
    await this.broadcastMessageEdit(messageData);

    return messageData;
  }

  /**
   * Delete a chat message
   * Can be deleted by the author or a moderator
   * Validates: Requirements 3.5, 3.6
   */
  async deleteMessage(messageId: string, userId: string): Promise<void> {
    // Get the message
    const message = await prisma.chatMessage.findUnique({
      where: { id: messageId },
      select: {
        id: true,
        authorId: true,
        roomId: true,
        groupId: true,
      },
    });

    if (!message) {
      throw new NotFoundError("Chat message");
    }

    // Check if user is the author or a moderator
    const isAuthor = message.authorId === userId;
    let isModerator = false;

    if (!isAuthor) {
      // Check if user is a moderator of the room or group
      if (message.roomId) {
        const moderator = await prisma.roomModerator.findUnique({
          where: {
            roomId_userId: {
              roomId: message.roomId,
              userId,
            },
          },
        });
        isModerator = !!moderator;
      } else if (message.groupId) {
        const moderator = await prisma.groupModerator.findUnique({
          where: {
            groupId_userId: {
              groupId: message.groupId,
              userId,
            },
          },
        });
        isModerator = !!moderator;
      }
    }

    if (!isAuthor && !isModerator) {
      throw new AuthorizationError("You can only delete your own messages or messages as a moderator");
    }

    // Mark message as deleted (soft delete)
    await prisma.chatMessage.update({
      where: { id: messageId },
      data: {
        isDeleted: true,
        content: "[Message deleted]",
        updatedAt: new Date(),
      },
    });

    // Broadcast message deletion to connected clients
    await this.broadcastMessageDelete(message.roomId || undefined, message.groupId || undefined, messageId);

    // If deleted by moderator, log the action
    if (isModerator && !isAuthor) {
      await prisma.moderationLog.create({
        data: {
          moderatorId: userId,
          targetId: messageId,
          type: "MESSAGE_DELETE",
          reason: "Message deleted by moderator",
          metadata: {
            messageId,
            roomId: message.roomId || undefined,
            groupId: message.groupId || undefined,
          } as any,
        },
      });
    }
  }

  /**
   * Get messages from a room or group with pagination
   * Validates: Requirements 3.3, 9.2
   */
  async getMessages(
    roomId?: string,
    groupId?: string,
    cursor?: string,
    limit: number = 50
  ): Promise<ChatMessageData[]> {
    // Must specify either roomId or groupId, but not both
    if (!roomId && !groupId) {
      throw new ValidationError("Either roomId or groupId must be specified");
    }

    if (roomId && groupId) {
      throw new ValidationError("Cannot specify both roomId and groupId");
    }

    // Validate room or group exists
    if (roomId) {
      const room = await prisma.discussionRoom.findUnique({
        where: { id: roomId },
        select: { id: true },
      });

      if (!room) {
        throw new NotFoundError("Discussion room");
      }
    }

    if (groupId) {
      const group = await prisma.communityGroup.findUnique({
        where: { id: groupId },
        select: { id: true },
      });

      if (!group) {
        throw new NotFoundError("Community group");
      }
    }

    // Build query options
    const queryOptions = {
      where: {
        ...(roomId && { roomId }),
        ...(groupId && { groupId }),
        isDeleted: false,
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
      },
      orderBy: { createdAt: "desc" as const },
      take: limit,
      ...(cursor && {
        cursor: { id: cursor },
        skip: 1, // Skip the cursor itself
      }),
    };

    const messages = await prisma.chatMessage.findMany(queryOptions);

    // Format messages
    return messages.map((message) => ({
      id: message.id,
      content: message.content,
      roomId: message.roomId,
      groupId: message.groupId,
      authorId: message.authorId,
      authorName: message.author.name || "Unknown",
      authorImage: message.author.image,
      isEdited: message.isEdited,
      isDeleted: message.isDeleted,
      createdAt: message.createdAt,
      updatedAt: message.updatedAt,
    }));
  }

  /**
   * Broadcast a message to all connected clients via Redis Pub/Sub
   * This will be consumed by WebSocket servers to push to clients
   * Validates: Requirements 3.1, 3.2
   */
  async broadcastMessage(message: ChatMessageData): Promise<void> {
    try {
      // Import dynamically to avoid circular dependencies
      const { publishChatMessage } = await import("@/lib/websocket/pubsub");
      
      // Publish message to WebSocket channel
      await publishChatMessage(
        message.roomId || undefined,
        message.groupId || undefined,
        {
          type: "CHAT_MESSAGE",
          payload: {
            id: message.id,
            content: message.content,
            roomId: message.roomId || undefined,
            groupId: message.groupId || undefined,
            authorId: message.authorId,
            authorName: message.authorName,
            authorImage: message.authorImage || undefined,
            isEdited: message.isEdited,
            createdAt: message.createdAt.toISOString(),
          },
        }
      );
    } catch (error) {
      console.error("[ChatService] Failed to broadcast message:", error);
      // Don't throw error - message is already saved to database
      // WebSocket broadcasting is best-effort
    }
  }

  /**
   * Broadcast typing indicator to connected clients via Redis Pub/Sub
   * Validates: Requirements 3.7
   */
  async broadcastTyping(payload: TypingPayload): Promise<void> {
    try {
      // Import dynamically to avoid circular dependencies
      const { publishTypingIndicator } = await import("@/lib/websocket/pubsub");
      
      // Publish typing indicator to WebSocket channel
      await publishTypingIndicator(
        payload.roomId,
        payload.groupId,
        payload.userId,
        payload.userName,
        payload.isTyping
      );
    } catch (error) {
      console.error("[ChatService] Failed to broadcast typing indicator:", error);
      // Don't throw error - typing indicators are best-effort
    }
  }

  /**
   * Broadcast message edit to connected clients via Redis Pub/Sub
   * Validates: Requirements 3.4
   */
  async broadcastMessageEdit(message: ChatMessageData): Promise<void> {
    try {
      // Import dynamically to avoid circular dependencies
      const { publishMessageEdit } = await import("@/lib/websocket/pubsub");
      
      // Publish message edit to WebSocket channel
      await publishMessageEdit(
        message.roomId || undefined,
        message.groupId || undefined,
        message.id,
        message.content
      );
    } catch (error) {
      console.error("[ChatService] Failed to broadcast message edit:", error);
      // Don't throw error - broadcasting is best-effort
    }
  }

  /**
   * Broadcast message deletion to connected clients via Redis Pub/Sub
   * Validates: Requirements 3.5, 3.6
   */
  async broadcastMessageDelete(roomId?: string, groupId?: string, messageId?: string): Promise<void> {
    try {
      // Import dynamically to avoid circular dependencies
      const { publishMessageDelete } = await import("@/lib/websocket/pubsub");
      
      // Publish message deletion to WebSocket channel
      await publishMessageDelete(
        roomId,
        groupId,
        messageId!
      );
    } catch (error) {
      console.error("[ChatService] Failed to broadcast message deletion:", error);
      // Don't throw error - broadcasting is best-effort
    }
  }

  /**
   * Check if a user is muted in a room or group
   * Validates: Requirements 6.5
   */
  private async isUserMuted(
    userId: string,
    roomId?: string,
    groupId?: string
  ): Promise<boolean> {
    const now = new Date();

    const mute = await prisma.userMute.findFirst({
      where: {
        userId,
        ...(roomId && { roomId }),
        ...(groupId && { groupId }),
        expiresAt: {
          gt: now,
        },
      },
    });

    return !!mute;
  }
}

export const chatService = new ChatService();
