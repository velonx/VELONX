import { prisma } from "@/lib/prisma";
import { NotFoundError, ValidationError } from "@/lib/utils/errors";

/**
 * Follow service layer for managing user follow relationships
 * Validates: Requirements 5.1, 5.2, 5.3, 5.4, 5.5, 5.6
 */
export class FollowService {
  /**
   * Follow a user
   * Creates a follow relationship between two users
   * Validates: Requirements 5.1
   */
  async followUser(followerId: string, followingId: string): Promise<void> {
    // Prevent self-follow (Requirement 5.6)
    if (followerId === followingId) {
      throw new ValidationError("Users cannot follow themselves");
    }

    // Validate that both users exist
    const [follower, following] = await Promise.all([
      prisma.user.findUnique({
        where: { id: followerId },
        select: { id: true },
      }),
      prisma.user.findUnique({
        where: { id: followingId },
        select: { id: true },
      }),
    ]);

    if (!follower) {
      throw new ValidationError("Invalid followerId: User does not exist");
    }

    if (!following) {
      throw new NotFoundError("User to follow");
    }

    // Check if follow relationship already exists
    const existingFollow = await prisma.follow.findUnique({
      where: {
        followerId_followingId: {
          followerId,
          followingId,
        },
      },
    });

    if (existingFollow) {
      throw new ValidationError("You are already following this user");
    }

    // Create follow relationship
    await prisma.follow.create({
      data: {
        followerId,
        followingId,
      },
    });
  }

  /**
   * Unfollow a user
   * Removes the follow relationship between two users
   * Validates: Requirements 5.2
   */
  async unfollowUser(followerId: string, followingId: string): Promise<void> {
    // Validate that both users exist
    const [follower, following] = await Promise.all([
      prisma.user.findUnique({
        where: { id: followerId },
        select: { id: true },
      }),
      prisma.user.findUnique({
        where: { id: followingId },
        select: { id: true },
      }),
    ]);

    if (!follower) {
      throw new ValidationError("Invalid followerId: User does not exist");
    }

    if (!following) {
      throw new NotFoundError("User to unfollow");
    }

    // Check if follow relationship exists
    const existingFollow = await prisma.follow.findUnique({
      where: {
        followerId_followingId: {
          followerId,
          followingId,
        },
      },
    });

    if (!existingFollow) {
      throw new ValidationError("You are not following this user");
    }

    // Remove follow relationship
    await prisma.follow.delete({
      where: {
        followerId_followingId: {
          followerId,
          followingId,
        },
      },
    });
  }

  /**
   * Get all followers of a user
   * Returns list of users who follow the specified user
   * Validates: Requirements 5.3
   */
  async getFollowers(userId: string) {
    // Validate that the user exists
    const userExists = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true },
    });

    if (!userExists) {
      throw new NotFoundError("User");
    }

    // Get all followers with user details
    const followers = await prisma.follow.findMany({
      where: { followingId: userId },
      include: {
        follower: {
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

    return followers.map((f) => f.follower);
  }

  /**
   * Get all users that a user is following
   * Returns list of users that the specified user follows
   * Validates: Requirements 5.4
   */
  async getFollowing(userId: string) {
    // Validate that the user exists
    const userExists = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true },
    });

    if (!userExists) {
      throw new NotFoundError("User");
    }

    // Get all following with user details
    const following = await prisma.follow.findMany({
      where: { followerId: userId },
      include: {
        following: {
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

    return following.map((f) => f.following);
  }

  /**
   * Check if a user is following another user
   * Returns true if the follow relationship exists
   * Validates: Requirements 5.5
   */
  async isFollowing(followerId: string, followingId: string): Promise<boolean> {
    const follow = await prisma.follow.findUnique({
      where: {
        followerId_followingId: {
          followerId,
          followingId,
        },
      },
    });

    return !!follow;
  }
}

export const followService = new FollowService();
