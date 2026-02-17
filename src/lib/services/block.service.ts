import { prisma } from "@/lib/prisma";
import { NotFoundError, ValidationError } from "@/lib/utils/errors";

/**
 * Block service layer for managing user blocking relationships
 * Validates: Requirements 10.2, 10.3
 */
export class BlockService {
  /**
   * Block a user
   * Creates a block relationship preventing the blocked user from viewing
   * the blocker's content and sending them messages
   * Validates: Requirements 10.2
   */
  async blockUser(blockerId: string, blockedId: string): Promise<void> {
    // Prevent self-block
    if (blockerId === blockedId) {
      throw new ValidationError("Users cannot block themselves");
    }

    // Validate that both users exist
    const [blocker, blocked] = await Promise.all([
      prisma.user.findUnique({
        where: { id: blockerId },
        select: { id: true },
      }),
      prisma.user.findUnique({
        where: { id: blockedId },
        select: { id: true },
      }),
    ]);

    if (!blocker) {
      throw new ValidationError("Invalid blockerId: User does not exist");
    }

    if (!blocked) {
      throw new NotFoundError("User to block");
    }

    // Check if block relationship already exists
    const existingBlock = await prisma.userBlock.findUnique({
      where: {
        blockerId_blockedId: {
          blockerId,
          blockedId,
        },
      },
    });

    if (existingBlock) {
      throw new ValidationError("You have already blocked this user");
    }

    // Create block relationship
    await prisma.userBlock.create({
      data: {
        blockerId,
        blockedId,
      },
    });
  }

  /**
   * Unblock a user
   * Removes the block relationship and restores normal interaction permissions
   * Validates: Requirements 10.3
   */
  async unblockUser(blockerId: string, blockedId: string): Promise<void> {
    // Validate that both users exist
    const [blocker, blocked] = await Promise.all([
      prisma.user.findUnique({
        where: { id: blockerId },
        select: { id: true },
      }),
      prisma.user.findUnique({
        where: { id: blockedId },
        select: { id: true },
      }),
    ]);

    if (!blocker) {
      throw new ValidationError("Invalid blockerId: User does not exist");
    }

    if (!blocked) {
      throw new NotFoundError("User to unblock");
    }

    // Check if block relationship exists
    const existingBlock = await prisma.userBlock.findUnique({
      where: {
        blockerId_blockedId: {
          blockerId,
          blockedId,
        },
      },
    });

    if (!existingBlock) {
      throw new ValidationError("You have not blocked this user");
    }

    // Remove block relationship
    await prisma.userBlock.delete({
      where: {
        blockerId_blockedId: {
          blockerId,
          blockedId,
        },
      },
    });
  }

  /**
   * Check if a user has blocked another user
   * Returns true if the block relationship exists
   * Validates: Requirements 10.2
   */
  async isBlocked(blockerId: string, blockedId: string): Promise<boolean> {
    const block = await prisma.userBlock.findUnique({
      where: {
        blockerId_blockedId: {
          blockerId,
          blockedId,
        },
      },
    });

    return !!block;
  }

  /**
   * Get all users blocked by a user
   * Returns list of users that the specified user has blocked
   * Validates: Requirements 10.2, 10.3
   */
  async getBlockedUsers(userId: string) {
    // Validate that the user exists
    const userExists = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true },
    });

    if (!userExists) {
      throw new NotFoundError("User");
    }

    // Get all blocked users with user details
    const blocks = await prisma.userBlock.findMany({
      where: { blockerId: userId },
      include: {
        blocked: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
            role: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return blocks.map((b) => b.blocked);
  }
}

export const blockService = new BlockService();
