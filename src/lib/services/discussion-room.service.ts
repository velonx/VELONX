import { prisma } from "@/lib/prisma";
import { NotFoundError, ValidationError, AuthorizationError } from "@/lib/utils/errors";

/**
 * Input type for creating a discussion room
 */
export interface CreateRoomInput {
  name: string;
  description: string;
  isPrivate: boolean;
  imageUrl?: string;
}

/**
 * Discussion Room service layer for managing room operations
 */
export class DiscussionRoomService {
  /**
   * Create a new discussion room
   * The creator is automatically added as the first moderator and member
   * Validates: Requirements 1.1
   */
  async createRoom(data: CreateRoomInput, creatorId: string) {
    // Validate that the creator exists
    const userExists = await prisma.user.findUnique({
      where: { id: creatorId },
      select: { id: true },
    });

    if (!userExists) {
      throw new ValidationError("Invalid creatorId: User does not exist");
    }

    // Validate input
    if (!data.name || data.name.trim().length === 0) {
      throw new ValidationError("Room name is required");
    }

    if (!data.description || data.description.trim().length === 0) {
      throw new ValidationError("Room description is required");
    }

    // Create the room with creator as moderator and member in a transaction
    const room = await prisma.$transaction(async (tx) => {
      // Create the room
      const newRoom = await tx.discussionRoom.create({
        data: {
          name: data.name.trim(),
          description: data.description.trim(),
          isPrivate: data.isPrivate,
          imageUrl: data.imageUrl,
          creatorId,
        },
      });

      // Add creator as moderator
      await tx.roomModerator.create({
        data: {
          roomId: newRoom.id,
          userId: creatorId,
        },
      });

      // Add creator as member
      await tx.roomMember.create({
        data: {
          roomId: newRoom.id,
          userId: creatorId,
        },
      });

      return newRoom;
    });

    return room;
  }

  /**
   * Join a discussion room
   * For private rooms, this should only be called after approval
   * Validates: Requirements 1.2
   */
  async joinRoom(roomId: string, userId: string): Promise<void> {
    // Validate that the room exists
    const room = await prisma.discussionRoom.findUnique({
      where: { id: roomId },
      select: { id: true, isPrivate: true },
    });

    if (!room) {
      throw new NotFoundError("Discussion room");
    }

    // Validate that the user exists
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, name: true, image: true },
    });

    if (!user) {
      throw new ValidationError("Invalid userId: User does not exist");
    }

    // Check if user is already a member
    const existingMember = await prisma.roomMember.findUnique({
      where: {
        roomId_userId: {
          roomId,
          userId,
        },
      },
    });

    if (existingMember) {
      throw new ValidationError("User is already a member of this room");
    }

    // Add user as member
    await prisma.roomMember.create({
      data: {
        roomId,
        userId,
      },
    });

    // Broadcast user joined event to room
    await this.broadcastUserJoined(roomId, userId, user.name || "Unknown", user.image || undefined);
  }

  /**
   * Leave a discussion room
   * Validates: Requirements 1.3
   */
  async leaveRoom(roomId: string, userId: string): Promise<void> {
    // Validate that the room exists
    const room = await prisma.discussionRoom.findUnique({
      where: { id: roomId },
      select: { id: true, creatorId: true },
    });

    if (!room) {
      throw new NotFoundError("Discussion room");
    }

    // Check if user is a member
    const member = await prisma.roomMember.findUnique({
      where: {
        roomId_userId: {
          roomId,
          userId,
        },
      },
    });

    if (!member) {
      throw new ValidationError("User is not a member of this room");
    }

    // Remove user from room (also removes moderator status if applicable due to cascade)
    await prisma.roomMember.delete({
      where: {
        roomId_userId: {
          roomId,
          userId,
        },
      },
    });

    // Broadcast user left event to room
    await this.broadcastUserLeft(roomId, userId);
  }

  /**
   * Get all members of a discussion room
   * Validates: Requirements 1.4
   */
  async getRoomMembers(roomId: string) {
    // Validate that the room exists
    const room = await prisma.discussionRoom.findUnique({
      where: { id: roomId },
      select: { id: true },
    });

    if (!room) {
      throw new NotFoundError("Discussion room");
    }

    // Get all members with user details
    const members = await prisma.roomMember.findMany({
      where: { roomId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
            role: true,
          },
        },
      },
      orderBy: { joinedAt: "asc" },
    });

    return members.map((m) => m.user);
  }

  /**
   * Get messages from a discussion room with pagination
   * Validates: Requirements 1.4
   */
  async getRoomMessages(roomId: string, cursor?: string, limit: number = 50) {
    // Validate that the room exists
    const room = await prisma.discussionRoom.findUnique({
      where: { id: roomId },
      select: { id: true },
    });

    if (!room) {
      throw new NotFoundError("Discussion room");
    }

    // Build query options
    const queryOptions: any = {
      where: {
        roomId,
        isDeleted: false,
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
      take: limit,
    };

    // Add cursor if provided
    if (cursor) {
      queryOptions.cursor = { id: cursor };
      queryOptions.skip = 1; // Skip the cursor itself
    }

    const messages = await prisma.chatMessage.findMany(queryOptions);

    return messages;
  }

  /**
   * Check if a user is a member of a discussion room
   */
  async isUserMember(roomId: string, userId: string): Promise<boolean> {
    const member = await prisma.roomMember.findUnique({
      where: {
        roomId_userId: {
          roomId,
          userId,
        },
      },
    });

    return !!member;
  }

  /**
   * Check if a user is a moderator of a discussion room
   */
  async isUserModerator(roomId: string, userId: string): Promise<boolean> {
    const moderator = await prisma.roomModerator.findUnique({
      where: {
        roomId_userId: {
          roomId,
          userId,
        },
      },
    });

    return !!moderator;
  }

  /**
   * Kick a member from a discussion room (moderator action)
   * Validates: Requirements 1.6
   */
  async kickMember(roomId: string, userId: string, moderatorId: string): Promise<void> {
    // Validate that the room exists
    const room = await prisma.discussionRoom.findUnique({
      where: { id: roomId },
      select: { id: true, creatorId: true },
    });

    if (!room) {
      throw new NotFoundError("Discussion room");
    }

    // Check if the moderator has permission
    const isModerator = await this.isUserModerator(roomId, moderatorId);
    if (!isModerator) {
      throw new AuthorizationError("You do not have moderator permissions for this room");
    }

    // Check if user is a member
    const member = await prisma.roomMember.findUnique({
      where: {
        roomId_userId: {
          roomId,
          userId,
        },
      },
    });

    if (!member) {
      throw new ValidationError("User is not a member of this room");
    }

    // Cannot kick the room creator
    if (userId === room.creatorId) {
      throw new ValidationError("Cannot kick the room creator");
    }

    // Remove user from room
    await prisma.roomMember.delete({
      where: {
        roomId_userId: {
          roomId,
          userId,
        },
      },
    });

    // Broadcast user left event to room
    await this.broadcastUserLeft(roomId, userId);
  }

  /**
   * Broadcast user joined event to room
   * Validates: Requirements 1.2
   */
  private async broadcastUserJoined(roomId: string, userId: string, userName: string, userImage?: string): Promise<void> {
    try {
      // Import dynamically to avoid circular dependencies
      const { publishUserJoined } = await import("@/lib/websocket/pubsub");
      
      // Publish user joined event to WebSocket channel
      await publishUserJoined(roomId, undefined, userId, userName, userImage);
    } catch (error) {
      console.error("[DiscussionRoomService] Failed to broadcast user joined:", error);
      // Don't throw error - broadcasting is best-effort
    }
  }

  /**
   * Broadcast user left event to room
   * Validates: Requirements 1.3
   */
  private async broadcastUserLeft(roomId: string, userId: string): Promise<void> {
    try {
      // Import dynamically to avoid circular dependencies
      const { publishUserLeft } = await import("@/lib/websocket/pubsub");
      
      // Publish user left event to WebSocket channel
      await publishUserLeft(roomId, undefined, userId);
    } catch (error) {
      console.error("[DiscussionRoomService] Failed to broadcast user left:", error);
      // Don't throw error - broadcasting is best-effort
    }
  }
}

export const discussionRoomService = new DiscussionRoomService();
