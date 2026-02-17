import { prisma } from "@/lib/prisma";
import { NotFoundError, ValidationError, AuthorizationError } from "@/lib/utils/errors";

/**
 * Feed query parameters for filtering and pagination
 */
export interface FeedQuery {
  cursor?: string;
  limit?: number;
  filter?: "ALL" | "FOLLOWING" | "GROUPS";
}

/**
 * Feed item data structure
 */
export interface FeedItemData {
  type: "POST" | "SHARED_POST";
  post: {
    id: string;
    content: string;
    authorId: string;
    authorName: string;
    authorImage?: string | null;
    groupId?: string | null;
    groupName?: string | null;
    visibility: "PUBLIC" | "FOLLOWERS" | "GROUP";
    imageUrls: string[];
    linkUrls: string[];
    isEdited: boolean;
    isPinned: boolean;
    reactionCount: number;
    commentCount: number;
    createdAt: Date;
    updatedAt: Date;
  };
  sharedBy?: {
    id: string;
    name: string;
    image?: string | null;
  };
}

/**
 * Search results structure
 */
export interface SearchResults {
  posts: Array<{
    id: string;
    content: string;
    authorId: string;
    authorName: string;
    authorImage?: string | null;
    createdAt: Date;
  }>;
  rooms: Array<{
    id: string;
    name: string;
    description: string;
    memberCount: number;
    isPrivate: boolean;
  }>;
  groups: Array<{
    id: string;
    name: string;
    description: string;
    memberCount: number;
    isPrivate: boolean;
  }>;
}

/**
 * Feed service layer for managing content feeds and discovery
 * Validates: Requirements 4.4, 4.5, 7.1, 7.2, 7.3, 9.2, 9.3, 9.4
 */
export class FeedService {
  /**
   * Get personalized feed for a user with filtering and pagination
   * Validates: Requirements 7.1, 7.3, 9.2
   * Optimized with parallel queries and select-only fields
   */
  async getUserFeed(userId: string, query: FeedQuery = {}): Promise<FeedItemData[]> {
    // Validate that the user exists
    const userExists = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true },
    });

    if (!userExists) {
      throw new NotFoundError("User");
    }

    const limit = query.limit && query.limit > 0 ? Math.min(query.limit, 100) : 20;
    const filter = query.filter || "ALL";

    // Execute relationship queries in parallel using Promise.all
    const [blockedUserIds, followingIds, groupIds] = await Promise.all([
      this.getBlockedUserIds(userId),
      this.getFollowingIds(userId),
      this.getGroupIds(userId),
    ]);

    // Build the where clause based on filter
    let whereClause: any = {
      // Exclude deleted posts
      NOT: {
        content: "",
      },
    };

    if (blockedUserIds.length > 0) {
      whereClause.authorId = {
        notIn: blockedUserIds,
      };
    }

    if (filter === "FOLLOWING") {
      if (followingIds.length === 0) {
        // User doesn't follow anyone, return empty feed
        return [];
      }

      whereClause.AND = [
        {
          OR: [
            { authorId: { in: followingIds } },
            { visibility: "FOLLOWERS", authorId: { in: followingIds } },
          ],
        },
      ];
    } else if (filter === "GROUPS") {
      if (groupIds.length === 0) {
        // User is not a member of any groups, return empty feed
        return [];
      }

      whereClause.groupId = { in: groupIds };
      whereClause.visibility = "GROUP";
    } else {
      // ALL filter: show public posts, posts from followed users, and posts from joined groups
      whereClause.OR = [
        { visibility: "PUBLIC" },
        { visibility: "FOLLOWERS", authorId: { in: followingIds } },
        { visibility: "GROUP", groupId: { in: groupIds } },
      ];
    }

    // Add cursor-based pagination
    if (query.cursor) {
      whereClause.id = {
        lt: query.cursor,
      };
    }

    // Fetch posts with select instead of include for optimized field selection
    const posts = await prisma.communityPost.findMany({
      where: whereClause,
      select: {
        id: true,
        content: true,
        authorId: true,
        groupId: true,
        visibility: true,
        imageUrls: true,
        linkUrls: true,
        isEdited: true,
        isPinned: true,
        createdAt: true,
        updatedAt: true,
        author: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
        group: {
          select: {
            id: true,
            name: true,
          },
        },
        _count: {
          select: {
            reactions: true,
            comments: true,
          },
        },
      },
      orderBy: [
        { isPinned: "desc" }, // Pinned posts first
        { createdAt: "desc" }, // Then chronological order
      ],
      take: limit,
    });

    // Format posts as feed items
    return posts.map((post) => this.formatFeedItem(post));
  }

  /**
   * Get blocked user IDs for a user (both blocked and blocked by)
   */
  private async getBlockedUserIds(userId: string): Promise<string[]> {
    const [blocked, blockedBy] = await Promise.all([
      prisma.userBlock.findMany({
        where: { blockerId: userId },
        select: { blockedId: true },
      }),
      prisma.userBlock.findMany({
        where: { blockedId: userId },
        select: { blockerId: true },
      }),
    ]);

    return [...blocked.map((b) => b.blockedId), ...blockedBy.map((b) => b.blockerId)];
  }

  /**
   * Get following user IDs for a user
   */
  private async getFollowingIds(userId: string): Promise<string[]> {
    const following = await prisma.follow.findMany({
      where: { followerId: userId },
      select: { followingId: true },
    });
    return following.map((f) => f.followingId);
  }

  /**
   * Get group IDs that a user is a member of
   */
  private async getGroupIds(userId: string): Promise<string[]> {
    const groups = await prisma.groupMember.findMany({
      where: { userId },
      select: { groupId: true },
    });
    return groups.map((g) => g.groupId);
  }

  /**
   * Get feed for a specific group
   * Validates: Requirements 4.4, 7.1, 9.2
   * Optimized with select-only fields
   */
  async getGroupFeed(groupId: string, userId: string, query: FeedQuery = {}): Promise<FeedItemData[]> {
    // Validate that the group exists
    const group = await prisma.communityGroup.findUnique({
      where: { id: groupId },
      select: { id: true, isPrivate: true },
    });

    if (!group) {
      throw new NotFoundError("Community group");
    }

    // Check if user is a member (required for private groups)
    const isMember = await prisma.groupMember.findUnique({
      where: {
        groupId_userId: {
          groupId,
          userId,
        },
      },
    });

    if (group.isPrivate && !isMember) {
      throw new AuthorizationError("You must be a member of this private group to view its feed");
    }

    const limit = query.limit && query.limit > 0 ? Math.min(query.limit, 100) : 20;

    // Build where clause
    const whereClause: any = {
      groupId,
      visibility: "GROUP",
    };

    // Add cursor-based pagination
    if (query.cursor) {
      whereClause.id = {
        lt: query.cursor,
      };
    }

    // Fetch posts with select instead of include for optimized field selection
    const posts = await prisma.communityPost.findMany({
      where: whereClause,
      select: {
        id: true,
        content: true,
        authorId: true,
        groupId: true,
        visibility: true,
        imageUrls: true,
        linkUrls: true,
        isEdited: true,
        isPinned: true,
        createdAt: true,
        updatedAt: true,
        author: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
        group: {
          select: {
            id: true,
            name: true,
          },
        },
        _count: {
          select: {
            reactions: true,
            comments: true,
          },
        },
      },
      orderBy: [
        { isPinned: "desc" },
        { createdAt: "desc" },
      ],
      take: limit,
    });

    return posts.map((post) => this.formatFeedItem(post));
  }

  /**
   * Get trending posts based on activity
   * Validates: Requirements 7.3
   * Optimized with select-only fields
   */
  async getTrendingPosts(limit: number = 10): Promise<FeedItemData[]> {
    const validLimit = limit > 0 ? Math.min(limit, 50) : 10;

    // Get posts from the last 7 days with high engagement
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    // Fetch posts with select instead of include for optimized field selection
    const posts = await prisma.communityPost.findMany({
      where: {
        createdAt: {
          gte: sevenDaysAgo,
        },
        visibility: "PUBLIC", // Only public posts can be trending
      },
      select: {
        id: true,
        content: true,
        authorId: true,
        groupId: true,
        visibility: true,
        imageUrls: true,
        linkUrls: true,
        isEdited: true,
        isPinned: true,
        createdAt: true,
        updatedAt: true,
        author: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
        group: {
          select: {
            id: true,
            name: true,
          },
        },
        _count: {
          select: {
            reactions: true,
            comments: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 100, // Get more posts to calculate trending score
    });

    // Calculate trending score (reactions + comments * 2) and sort
    const postsWithScore = posts.map((post) => ({
      post,
      score: (post._count?.reactions || 0) + (post._count?.comments || 0) * 2,
    }));

    postsWithScore.sort((a, b) => b.score - a.score);

    // Return top trending posts
    return postsWithScore
      .slice(0, validLimit)
      .map((item) => this.formatFeedItem(item.post));
  }

  /**
   * Search for content across posts, rooms, and groups
   * Validates: Requirements 7.2, 9.4
   */
  async searchContent(query: string, userId: string): Promise<SearchResults> {
    if (!query || query.trim().length === 0) {
      throw new ValidationError("Search query is required");
    }

    if (query.length > 100) {
      throw new ValidationError("Search query exceeds maximum length of 100 characters");
    }

    const searchTerm = query.trim();

    // Get blocked users to exclude their content
    const blockedUsers = await prisma.userBlock.findMany({
      where: { blockerId: userId },
      select: { blockedId: true },
    });
    const blockedUserIds = blockedUsers.map((b) => b.blockedId);

    // Get users who blocked this user
    const blockedByUsers = await prisma.userBlock.findMany({
      where: { blockedId: userId },
      select: { blockerId: true },
    });
    const blockedByUserIds = blockedByUsers.map((b) => b.blockerId);

    const allBlockedUserIds = [...blockedUserIds, ...blockedByUserIds];

    // Search posts
    const posts = await prisma.communityPost.findMany({
      where: {
        content: {
          contains: searchTerm,
          mode: "insensitive",
        },
        authorId: allBlockedUserIds.length > 0 ? { notIn: allBlockedUserIds } : undefined,
        OR: [
          { visibility: "PUBLIC" },
          {
            visibility: "FOLLOWERS",
            author: {
              followers: {
                some: {
                  followerId: userId,
                },
              },
            },
          },
          {
            visibility: "GROUP",
            group: {
              members: {
                some: {
                  userId,
                },
              },
            },
          },
        ],
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
      orderBy: {
        createdAt: "desc",
      },
      take: 20,
    });

    // Search discussion rooms
    const rooms = await prisma.discussionRoom.findMany({
      where: {
        OR: [
          {
            name: {
              contains: searchTerm,
              mode: "insensitive",
            },
          },
          {
            description: {
              contains: searchTerm,
              mode: "insensitive",
            },
          },
        ],
      },
      include: {
        _count: {
          select: {
            members: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 10,
    });

    // Search community groups
    const groups = await prisma.communityGroup.findMany({
      where: {
        OR: [
          {
            name: {
              contains: searchTerm,
              mode: "insensitive",
            },
          },
          {
            description: {
              contains: searchTerm,
              mode: "insensitive",
            },
          },
        ],
      },
      include: {
        _count: {
          select: {
            members: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 10,
    });

    return {
      posts: posts.map((post) => ({
        id: post.id,
        content: post.content,
        authorId: post.authorId,
        authorName: post.author.name || "Unknown",
        authorImage: post.author.image,
        createdAt: post.createdAt,
      })),
      rooms: rooms.map((room) => ({
        id: room.id,
        name: room.name,
        description: room.description,
        memberCount: room._count?.members || 0,
        isPrivate: room.isPrivate,
      })),
      groups: groups.map((group) => ({
        id: group.id,
        name: group.name,
        description: group.description,
        memberCount: group._count?.members || 0,
        isPrivate: group.isPrivate,
      })),
    };
  }

  /**
   * Format post data as feed item
   */
  private formatFeedItem(post: any): FeedItemData {
    return {
      type: "POST",
      post: {
        id: post.id,
        content: post.content,
        authorId: post.authorId,
        authorName: post.author.name || "Unknown",
        authorImage: post.author.image,
        groupId: post.groupId,
        groupName: post.group?.name,
        visibility: post.visibility,
        imageUrls: post.imageUrls,
        linkUrls: post.linkUrls,
        isEdited: post.isEdited,
        isPinned: post.isPinned,
        reactionCount: post._count?.reactions || 0,
        commentCount: post._count?.comments || 0,
        createdAt: post.createdAt,
        updatedAt: post.updatedAt,
      },
    };
  }
}

export const feedService = new FeedService();
