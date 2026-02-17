import { prisma } from "@/lib/prisma";
import { NotFoundError, ValidationError, AuthorizationError } from "@/lib/utils/errors";

/**
 * Input type for creating a community group
 */
export interface CreateGroupInput {
  name: string;
  description: string;
  isPrivate: boolean;
  imageUrl?: string;
}

/**
 * Community Group service layer for managing group operations
 */
export class CommunityGroupService {
  /**
   * Create a new community group
   * The owner is automatically added as the first moderator and member
   * Validates: Requirements 2.1
   */
  async createGroup(data: CreateGroupInput, ownerId: string) {
    // Validate that the owner exists
    const userExists = await prisma.user.findUnique({
      where: { id: ownerId },
      select: { id: true },
    });

    if (!userExists) {
      throw new ValidationError("Invalid ownerId: User does not exist");
    }

    // Validate input
    if (!data.name || data.name.trim().length === 0) {
      throw new ValidationError("Group name is required");
    }

    if (!data.description || data.description.trim().length === 0) {
      throw new ValidationError("Group description is required");
    }

    // Create the group with owner as moderator and member in a transaction
    const group = await prisma.$transaction(async (tx) => {
      // Create the group
      const newGroup = await tx.communityGroup.create({
        data: {
          name: data.name.trim(),
          description: data.description.trim(),
          isPrivate: data.isPrivate,
          imageUrl: data.imageUrl,
          ownerId,
        },
      });

      // Add owner as moderator
      await tx.groupModerator.create({
        data: {
          groupId: newGroup.id,
          userId: ownerId,
        },
      });

      // Add owner as member
      await tx.groupMember.create({
        data: {
          groupId: newGroup.id,
          userId: ownerId,
        },
      });

      return newGroup;
    });

    return group;
  }

  /**
   * Join a public community group
   * For private groups, use requestJoinGroup instead
   * Validates: Requirements 2.2
   */
  async joinGroup(groupId: string, userId: string): Promise<void> {
    // Validate that the group exists
    const group = await prisma.communityGroup.findUnique({
      where: { id: groupId },
      select: { id: true, isPrivate: true },
    });

    if (!group) {
      throw new NotFoundError("Community group");
    }

    // Check if group is private
    if (group.isPrivate) {
      throw new ValidationError("Cannot directly join a private group. Use requestJoinGroup instead.");
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
    const existingMember = await prisma.groupMember.findUnique({
      where: {
        groupId_userId: {
          groupId,
          userId,
        },
      },
    });

    if (existingMember) {
      throw new ValidationError("User is already a member of this group");
    }

    // Add user as member
    await prisma.groupMember.create({
      data: {
        groupId,
        userId,
      },
    });

    // Broadcast user joined event to group
    await this.broadcastUserJoined(groupId, userId, user.name || "Unknown", user.image || undefined);
  }

  /**
   * Request to join a private community group
   * Validates: Requirements 2.3
   */
  async requestJoinGroup(groupId: string, userId: string): Promise<void> {
    // Validate that the group exists
    const group = await prisma.communityGroup.findUnique({
      where: { id: groupId },
      select: { id: true, isPrivate: true },
    });

    if (!group) {
      throw new NotFoundError("Community group");
    }

    // Check if group is private
    if (!group.isPrivate) {
      throw new ValidationError("This is a public group. Use joinGroup instead.");
    }

    // Validate that the user exists
    const userExists = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true },
    });

    if (!userExists) {
      throw new ValidationError("Invalid userId: User does not exist");
    }

    // Check if user is already a member
    const existingMember = await prisma.groupMember.findUnique({
      where: {
        groupId_userId: {
          groupId,
          userId,
        },
      },
    });

    if (existingMember) {
      throw new ValidationError("User is already a member of this group");
    }

    // Check if there's already a pending request
    const existingRequest = await prisma.groupJoinRequest.findUnique({
      where: {
        groupId_userId: {
          groupId,
          userId,
        },
      },
    });

    if (existingRequest) {
      if (existingRequest.status === "PENDING") {
        throw new ValidationError("A join request is already pending for this group");
      }
      // If there's a rejected request, allow creating a new one by deleting the old one
      await prisma.groupJoinRequest.delete({
        where: { id: existingRequest.id },
      });
    }

    // Create join request
    await prisma.groupJoinRequest.create({
      data: {
        groupId,
        userId,
        status: "PENDING",
      },
    });
  }

  /**
   * Approve a join request for a private group
   * Validates: Requirements 2.5
   */
  async approveJoinRequest(requestId: string, moderatorId: string): Promise<void> {
    // Get the join request
    const request = await prisma.groupJoinRequest.findUnique({
      where: { id: requestId },
      include: {
        group: {
          select: { id: true, ownerId: true },
        },
        user: {
          select: { id: true, name: true, image: true },
        },
      },
    });

    if (!request) {
      throw new NotFoundError("Join request");
    }

    // Check if the moderator has permission
    const isModerator = await this.isUserModerator(request.groupId, moderatorId);
    if (!isModerator) {
      throw new AuthorizationError("You do not have moderator permissions for this group");
    }

    // Check if request is still pending
    if (request.status !== "PENDING") {
      throw new ValidationError("This join request has already been processed");
    }

    // Approve request and add user as member in a transaction
    await prisma.$transaction(async (tx) => {
      // Update request status
      await tx.groupJoinRequest.update({
        where: { id: requestId },
        data: { status: "APPROVED" },
      });

      // Add user as member
      await tx.groupMember.create({
        data: {
          groupId: request.groupId,
          userId: request.userId,
        },
      });
    });

    // Broadcast user joined event to group
    await this.broadcastUserJoined(
      request.groupId,
      request.userId,
      request.user.name || "Unknown",
      request.user.image || undefined
    );
  }

  /**
   * Reject a join request for a private group
   * Validates: Requirements 2.6
   */
  async rejectJoinRequest(requestId: string, moderatorId: string): Promise<void> {
    // Get the join request
    const request = await prisma.groupJoinRequest.findUnique({
      where: { id: requestId },
      include: {
        group: {
          select: { id: true, ownerId: true },
        },
      },
    });

    if (!request) {
      throw new NotFoundError("Join request");
    }

    // Check if the moderator has permission
    const isModerator = await this.isUserModerator(request.groupId, moderatorId);
    if (!isModerator) {
      throw new AuthorizationError("You do not have moderator permissions for this group");
    }

    // Check if request is still pending
    if (request.status !== "PENDING") {
      throw new ValidationError("This join request has already been processed");
    }

    // Update request status to rejected
    await prisma.groupJoinRequest.update({
      where: { id: requestId },
      data: { status: "REJECTED" },
    });
  }

  /**
   * Leave a community group
   * Validates: Requirements 2.7
   */
  async leaveGroup(groupId: string, userId: string): Promise<void> {
    // Validate that the group exists
    const group = await prisma.communityGroup.findUnique({
      where: { id: groupId },
      select: { id: true, ownerId: true },
    });

    if (!group) {
      throw new NotFoundError("Community group");
    }

    // Check if user is the owner
    if (userId === group.ownerId) {
      throw new ValidationError("Group owner cannot leave the group. Transfer ownership or delete the group instead.");
    }

    // Check if user is a member
    const member = await prisma.groupMember.findUnique({
      where: {
        groupId_userId: {
          groupId,
          userId,
        },
      },
    });

    if (!member) {
      throw new ValidationError("User is not a member of this group");
    }

    // Remove user from group (also removes moderator status if applicable due to cascade)
    await prisma.groupMember.delete({
      where: {
        groupId_userId: {
          groupId,
          userId,
        },
      },
    });

    // Broadcast user left event to group
    await this.broadcastUserLeft(groupId, userId);
  }

  /**
   * Assign moderator permissions to a group member
   * Validates: Requirements 2.4
   */
  async assignModerator(groupId: string, userId: string, ownerId: string): Promise<void> {
    // Validate that the group exists
    const group = await prisma.communityGroup.findUnique({
      where: { id: groupId },
      select: { id: true, ownerId: true },
    });

    if (!group) {
      throw new NotFoundError("Community group");
    }

    // Check if the requester is the owner
    if (ownerId !== group.ownerId) {
      throw new AuthorizationError("Only the group owner can assign moderators");
    }

    // Check if user is a member
    const member = await prisma.groupMember.findUnique({
      where: {
        groupId_userId: {
          groupId,
          userId,
        },
      },
    });

    if (!member) {
      throw new ValidationError("User must be a member of the group to become a moderator");
    }

    // Check if user is already a moderator
    const existingModerator = await prisma.groupModerator.findUnique({
      where: {
        groupId_userId: {
          groupId,
          userId,
        },
      },
    });

    if (existingModerator) {
      throw new ValidationError("User is already a moderator of this group");
    }

    // Add user as moderator
    await prisma.groupModerator.create({
      data: {
        groupId,
        userId,
      },
    });
  }

  /**
   * Check if a user is a member of a community group
   */
  async isUserMember(groupId: string, userId: string): Promise<boolean> {
    const member = await prisma.groupMember.findUnique({
      where: {
        groupId_userId: {
          groupId,
          userId,
        },
      },
    });

    return !!member;
  }

  /**
   * Check if a user is a moderator of a community group
   */
  async isUserModerator(groupId: string, userId: string): Promise<boolean> {
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

  /**
   * Broadcast user joined event to group
   * Validates: Requirements 2.2
   */
  private async broadcastUserJoined(groupId: string, userId: string, userName: string, userImage?: string): Promise<void> {
    try {
      // Import dynamically to avoid circular dependencies
      const { publishUserJoined } = await import("@/lib/websocket/pubsub");
      
      // Publish user joined event to WebSocket channel
      await publishUserJoined(undefined, groupId, userId, userName, userImage);
    } catch (error) {
      console.error("[CommunityGroupService] Failed to broadcast user joined:", error);
      // Don't throw error - broadcasting is best-effort
    }
  }

  /**
   * Broadcast user left event to group
   * Validates: Requirements 2.7
   */
  private async broadcastUserLeft(groupId: string, userId: string): Promise<void> {
    try {
      // Import dynamically to avoid circular dependencies
      const { publishUserLeft } = await import("@/lib/websocket/pubsub");
      
      // Publish user left event to WebSocket channel
      await publishUserLeft(undefined, groupId, userId);
    } catch (error) {
      console.error("[CommunityGroupService] Failed to broadcast user left:", error);
      // Don't throw error - broadcasting is best-effort
    }
  }
}

export const communityGroupService = new CommunityGroupService();
