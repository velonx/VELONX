import { prisma } from "@/lib/prisma";
import { NotFoundError, ValidationError, AuthorizationError } from "@/lib/utils/errors";
import type { ModerationType } from "@prisma/client";
import { notificationService } from "./notification.service";

/**
 * Input type for flagging content
 */
export interface FlagContentInput {
  contentId: string;
  contentType: "POST" | "MESSAGE";
  reason?: string;
}

/**
 * Input type for muting a user
 */
export interface MuteUserInput {
  userId: string;
  roomId?: string;
  groupId?: string;
  duration: number; // Duration in minutes
  reason?: string;
}

/**
 * Moderation service layer for managing content moderation and user safety
 * Validates: Requirements 6.1, 6.2, 6.5, 10.5, 10.6
 */
export class ModerationService {
  /**
   * Flag inappropriate content
   * This marks content as hidden and notifies the author
   * Validates: Requirements 6.1
   */
  async flagContent(
    contentId: string,
    contentType: "POST" | "MESSAGE",
    moderatorId: string,
    reason?: string
  ): Promise<void> {
    // Validate that the moderator exists
    const moderator = await prisma.user.findUnique({
      where: { id: moderatorId },
      select: { id: true },
    });

    if (!moderator) {
      throw new ValidationError("Invalid moderatorId: User does not exist");
    }

    // Validate content exists and get context (room/group)
    let contentExists = false;
    let roomId: string | undefined;
    let groupId: string | undefined;
    let authorId: string | undefined;

    if (contentType === "POST") {
      const post = await prisma.communityPost.findUnique({
        where: { id: contentId },
        select: {
          id: true,
          groupId: true,
          authorId: true,
        },
      });

      if (!post) {
        throw new NotFoundError("Post");
      }

      contentExists = true;
      groupId = post.groupId || undefined;
      authorId = post.authorId;

      // Verify moderator has permissions for this group
      if (groupId) {
        const isModerator = await this.isGroupModerator(moderatorId, groupId);
        if (!isModerator) {
          throw new AuthorizationError("You do not have moderator permissions for this group");
        }
      }
    } else if (contentType === "MESSAGE") {
      const message = await prisma.chatMessage.findUnique({
        where: { id: contentId },
        select: {
          id: true,
          roomId: true,
          groupId: true,
          authorId: true,
        },
      });

      if (!message) {
        throw new NotFoundError("Chat message");
      }

      contentExists = true;
      roomId = message.roomId || undefined;
      groupId = message.groupId || undefined;
      authorId = message.authorId;

      // Verify moderator has permissions for this room or group
      if (roomId) {
        const isModerator = await this.isRoomModerator(moderatorId, roomId);
        if (!isModerator) {
          throw new AuthorizationError("You do not have moderator permissions for this room");
        }
      } else if (groupId) {
        const isModerator = await this.isGroupModerator(moderatorId, groupId);
        if (!isModerator) {
          throw new AuthorizationError("You do not have moderator permissions for this group");
        }
      }
    }

    if (!contentExists) {
      throw new NotFoundError("Content");
    }

    // Log the moderation action
    await this.logModerationAction(
      "CONTENT_FLAG",
      moderatorId,
      contentId,
      reason,
      {
        contentType,
        roomId,
        groupId,
        authorId,
      }
    );

    // Send notification to content author
    if (authorId) {
      try {
        await notificationService.createNotification({
          userId: authorId,
          title: "Content Flagged",
          description: reason 
            ? `Your ${contentType.toLowerCase()} has been flagged by a moderator. Reason: ${reason}`
            : `Your ${contentType.toLowerCase()} has been flagged by a moderator.`,
          type: "WARNING",
          metadata: {
            contentId,
            contentType,
            moderatorId,
            reason,
          },
        });
      } catch (error) {
        // Log error but don't fail the operation
        console.error("Failed to send content flag notification:", error);
      }
    }

    // Note: The design document mentions marking content as hidden,
    // but the current schema doesn't have a "flagged" or "hidden" field.
    // For now, we're just logging the action. In a future iteration,
    // the schema could be extended to add these fields.
  }

  /**
   * Mute a user in a room or group
   * Prevents the user from sending messages for the specified duration
   * Validates: Requirements 6.5
   */
  async muteUser(
    userId: string,
    roomId: string | undefined,
    groupId: string | undefined,
    moderatorId: string,
    duration: number,
    reason?: string
  ): Promise<void> {
    // Validate input
    if (!roomId && !groupId) {
      throw new ValidationError("Either roomId or groupId must be specified");
    }

    if (roomId && groupId) {
      throw new ValidationError("Cannot specify both roomId and groupId");
    }

    if (duration <= 0) {
      throw new ValidationError("Duration must be a positive number");
    }

    // Validate that the user exists
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true },
    });

    if (!user) {
      throw new NotFoundError("User");
    }

    // Validate that the moderator exists
    const moderator = await prisma.user.findUnique({
      where: { id: moderatorId },
      select: { id: true },
    });

    if (!moderator) {
      throw new ValidationError("Invalid moderatorId: User does not exist");
    }

    // Cannot mute yourself
    if (userId === moderatorId) {
      throw new ValidationError("Cannot mute yourself");
    }

    // Verify moderator has permissions
    if (roomId) {
      const room = await prisma.discussionRoom.findUnique({
        where: { id: roomId },
        select: { id: true },
      });

      if (!room) {
        throw new NotFoundError("Discussion room");
      }

      const isModerator = await this.isRoomModerator(moderatorId, roomId);
      if (!isModerator) {
        throw new AuthorizationError("You do not have moderator permissions for this room");
      }

      // Verify user is a member of the room
      const isMember = await prisma.roomMember.findUnique({
        where: {
          roomId_userId: {
            roomId,
            userId,
          },
        },
      });

      if (!isMember) {
        throw new ValidationError("User is not a member of this room");
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

      const isModerator = await this.isGroupModerator(moderatorId, groupId);
      if (!isModerator) {
        throw new AuthorizationError("You do not have moderator permissions for this group");
      }

      // Verify user is a member of the group
      const isMember = await prisma.groupMember.findUnique({
        where: {
          groupId_userId: {
            groupId,
            userId,
          },
        },
      });

      if (!isMember) {
        throw new ValidationError("User is not a member of this group");
      }
    }

    // Calculate expiration time
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + duration);

    // Check if user is already muted in this context
    const existingMute = await prisma.userMute.findFirst({
      where: {
        userId,
        ...(roomId && { roomId }),
        ...(groupId && { groupId }),
        expiresAt: {
          gt: new Date(),
        },
      },
    });

    if (existingMute) {
      // Update existing mute
      await prisma.userMute.update({
        where: { id: existingMute.id },
        data: {
          expiresAt,
          reason,
          mutedBy: moderatorId,
        },
      });
    } else {
      // Create new mute
      await prisma.userMute.create({
        data: {
          userId,
          roomId,
          groupId,
          mutedBy: moderatorId,
          reason,
          expiresAt,
        },
      });
    }

    // Log the moderation action
    await this.logModerationAction(
      "USER_MUTE",
      moderatorId,
      userId,
      reason,
      {
        roomId,
        groupId,
        duration,
        expiresAt: expiresAt.toISOString(),
      }
    );

    // Send notification to muted user
    try {
      const contextName = roomId ? "room" : "group";
      await notificationService.createNotification({
        userId,
        title: "You Have Been Muted",
        description: reason
          ? `You have been muted in a ${contextName} for ${duration} minutes. Reason: ${reason}`
          : `You have been muted in a ${contextName} for ${duration} minutes.`,
        type: "WARNING",
        metadata: {
          moderatorId,
          roomId,
          groupId,
          duration,
          expiresAt: expiresAt.toISOString(),
          reason,
        },
      });
    } catch (error) {
      // Log error but don't fail the operation
      console.error("Failed to send mute notification:", error);
    }
  }

  /**
   * Unmute a user by removing their mute record
   * Validates: Requirements 6.6
   */
  async unmuteUser(muteId: string, moderatorId: string): Promise<void> {
    // Get the mute record
    const mute = await prisma.userMute.findUnique({
      where: { id: muteId },
      select: {
        id: true,
        userId: true,
        roomId: true,
        groupId: true,
      },
    });

    if (!mute) {
      throw new NotFoundError("Mute record");
    }

    // Verify moderator has permissions
    if (mute.roomId) {
      const isModerator = await this.isRoomModerator(moderatorId, mute.roomId);
      if (!isModerator) {
        throw new AuthorizationError("You do not have moderator permissions for this room");
      }
    } else if (mute.groupId) {
      const isModerator = await this.isGroupModerator(moderatorId, mute.groupId);
      if (!isModerator) {
        throw new AuthorizationError("You do not have moderator permissions for this group");
      }
    }

    // Delete the mute record
    await prisma.userMute.delete({
      where: { id: muteId },
    });

    // Log the moderation action (unmute is not in the enum, so we'll use USER_MUTE with metadata)
    await this.logModerationAction(
      "USER_MUTE",
      moderatorId,
      mute.userId,
      "User unmuted",
      {
        action: "unmute",
        muteId,
        roomId: mute.roomId || undefined,
        groupId: mute.groupId || undefined,
      }
    );

    // Send notification to unmuted user
    try {
      const contextName = mute.roomId ? "room" : "group";
      await notificationService.createNotification({
        userId: mute.userId,
        title: "You Have Been Unmuted",
        description: `You have been unmuted in a ${contextName} and can now send messages again.`,
        type: "INFO",
        metadata: {
          moderatorId,
          roomId: mute.roomId || undefined,
          groupId: mute.groupId || undefined,
        },
      });
    } catch (error) {
      // Log error but don't fail the operation
      console.error("Failed to send unmute notification:", error);
    }
  }

  /**
   * Check if a user is currently muted in a room or group
   * Validates: Requirements 6.5
   */
  async isUserMuted(
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

  /**
   * Log a moderation action for audit purposes
   * Validates: Requirements 10.6
   */
  async logModerationAction(
    type: ModerationType,
    moderatorId: string,
    targetId: string,
    reason?: string,
    metadata?: Record<string, any>
  ): Promise<void> {
    await prisma.moderationLog.create({
      data: {
        moderatorId,
        targetId,
        type,
        reason,
        metadata: metadata as any,
      },
    });
  }

  /**
   * Check if a user is a moderator of a room
   * Helper method for permission checks
   */
  private async isRoomModerator(userId: string, roomId: string): Promise<boolean> {
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
   * Check if a user is a moderator of a group
   * Helper method for permission checks
   */
  private async isGroupModerator(userId: string, groupId: string): Promise<boolean> {
    const moderator = await prisma.groupModerator.findUnique({
      where: {
        groupId_userId: {
          groupId,
          userId,
        },
      },
    });

    return !!moderator;
  }
}

export const moderationService = new ModerationService();
