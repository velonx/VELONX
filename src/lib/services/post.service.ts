import { prisma } from "@/lib/prisma";
import { NotFoundError, ValidationError, AuthorizationError } from "@/lib/utils/errors";

/**
 * Input type for creating a post
 */
export interface CreatePostInput {
  content: string;
  groupId?: string;
  visibility: "PUBLIC" | "FOLLOWERS" | "GROUP";
  imageUrls?: string[];
  linkUrls?: string[];
}

/**
 * Input type for editing a post
 */
export interface EditPostInput {
  content: string;
}

/**
 * Reaction types for posts
 */
export type ReactionType = "LIKE" | "LOVE" | "INSIGHTFUL" | "CELEBRATE";

/**
 * Post data with author and interaction counts
 */
export interface CommunityPostData {
  id: string;
  content: string;
  authorId: string;
  authorName: string;
  authorImage?: string | null;
  groupId?: string | null;
  visibility: "PUBLIC" | "FOLLOWERS" | "GROUP";
  imageUrls: string[];
  linkUrls: string[];
  isEdited: boolean;
  isPinned: boolean;
  reactionCount: number;
  commentCount: number;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Post service layer for managing community posts
 * Validates: Requirements 4.1, 4.2, 4.3, 4.6, 4.7, 4.8, 4.9, 6.3, 6.4
 */
export class PostService {
  /**
   * Create a new community post
   * Validates: Requirements 4.1, 4.2, 4.3
   */
  async createPost(data: CreatePostInput, authorId: string): Promise<CommunityPostData> {
    // Validate input
    if (!data.content || data.content.trim().length === 0) {
      throw new ValidationError("Post content is required");
    }

    if (data.content.length > 5000) {
      throw new ValidationError("Post content exceeds maximum length of 5000 characters");
    }

    // Validate that the author exists
    const author = await prisma.user.findUnique({
      where: { id: authorId },
      select: { id: true, name: true, image: true },
    });

    if (!author) {
      throw new ValidationError("Invalid authorId: User does not exist");
    }

    // Validate visibility and groupId consistency
    if (data.visibility === "GROUP" && !data.groupId) {
      throw new ValidationError("groupId is required when visibility is GROUP");
    }

    if (data.visibility !== "GROUP" && data.groupId) {
      throw new ValidationError("groupId should only be specified when visibility is GROUP");
    }

    // Validate group exists and user is a member if groupId is provided
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
        throw new AuthorizationError("You must be a member of this group to post");
      }
    }

    // Validate image URLs
    if (data.imageUrls && data.imageUrls.length > 0) {
      if (data.imageUrls.length > 5) {
        throw new ValidationError("Maximum 5 images allowed per post");
      }

      for (const url of data.imageUrls) {
        if (!this.isValidImageUrl(url)) {
          throw new ValidationError(`Invalid image URL format: ${url}`);
        }
      }
    }

    // Validate link URLs
    if (data.linkUrls && data.linkUrls.length > 0) {
      if (data.linkUrls.length > 3) {
        throw new ValidationError("Maximum 3 links allowed per post");
      }

      for (const url of data.linkUrls) {
        if (!this.isValidUrl(url)) {
          throw new ValidationError(`Invalid URL format: ${url}`);
        }
      }
    }

    // Create the post
    const post = await prisma.communityPost.create({
      data: {
        content: data.content.trim(),
        authorId,
        groupId: data.groupId,
        visibility: data.visibility,
        imageUrls: data.imageUrls || [],
        linkUrls: data.linkUrls || [],
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
        _count: {
          select: {
            reactions: true,
            comments: true,
          },
        },
      },
    });

    // Format post data
    return this.formatPostData(post);
  }

  /**
   * Edit a post
   * Validates: Requirements 4.6
   */
  async editPost(postId: string, content: string, userId: string): Promise<CommunityPostData> {
    // Validate input
    if (!content || content.trim().length === 0) {
      throw new ValidationError("Post content is required");
    }

    if (content.length > 5000) {
      throw new ValidationError("Post content exceeds maximum length of 5000 characters");
    }

    // Get the post
    const post = await prisma.communityPost.findUnique({
      where: { id: postId },
      select: {
        id: true,
        authorId: true,
      },
    });

    if (!post) {
      throw new NotFoundError("Post");
    }

    // Check if user is the author
    if (post.authorId !== userId) {
      throw new AuthorizationError("You can only edit your own posts");
    }

    // Update the post
    const updatedPost = await prisma.communityPost.update({
      where: { id: postId },
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
        _count: {
          select: {
            reactions: true,
            comments: true,
          },
        },
      },
    });

    return this.formatPostData(updatedPost);
  }

  /**
   * Delete a post and all associated interactions
   * Validates: Requirements 4.7
   */
  async deletePost(postId: string, userId: string): Promise<void> {
    // Get the post
    const post = await prisma.communityPost.findUnique({
      where: { id: postId },
      select: {
        id: true,
        authorId: true,
        groupId: true,
      },
    });

    if (!post) {
      throw new NotFoundError("Post");
    }

    // Check if user is the author or a moderator
    const isAuthor = post.authorId === userId;
    let isModerator = false;

    if (!isAuthor && post.groupId) {
      // Check if user is a moderator of the group
      const moderator = await prisma.groupModerator.findUnique({
        where: {
          groupId_userId: {
            groupId: post.groupId,
            userId,
          },
        },
      });
      isModerator = !!moderator;
    }

    if (!isAuthor && !isModerator) {
      throw new AuthorizationError("You can only delete your own posts or posts as a moderator");
    }

    // Delete the post (cascade will delete reactions and comments)
    await prisma.communityPost.delete({
      where: { id: postId },
    });

    // If deleted by moderator, log the action
    if (isModerator && !isAuthor) {
      await prisma.moderationLog.create({
        data: {
          moderatorId: userId,
          targetId: postId,
          type: "POST_DELETE",
          reason: "Post deleted by moderator",
          metadata: {
            postId,
            groupId: post.groupId || undefined,
          } as any,
        },
      });
    }
  }

  /**
   * React to a post
   * Validates: Requirements 4.8
   */
  async reactToPost(postId: string, userId: string, type: ReactionType): Promise<void> {
    // Validate that the post exists
    const post = await prisma.communityPost.findUnique({
      where: { id: postId },
      select: { id: true },
    });

    if (!post) {
      throw new NotFoundError("Post");
    }

    // Validate that the user exists
    const userExists = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true },
    });

    if (!userExists) {
      throw new ValidationError("Invalid userId: User does not exist");
    }

    // Check if user already reacted to this post
    const existingReaction = await prisma.postReaction.findUnique({
      where: {
        postId_userId: {
          postId,
          userId,
        },
      },
    });

    if (existingReaction) {
      // Update existing reaction type
      await prisma.postReaction.update({
        where: {
          postId_userId: {
            postId,
            userId,
          },
        },
        data: {
          type,
        },
      });
    } else {
      // Create new reaction
      await prisma.postReaction.create({
        data: {
          postId,
          userId,
          type,
        },
      });
    }
  }

  /**
   * Remove a reaction from a post
   * Validates: Requirements 4.8
   */
  async removeReaction(postId: string, userId: string): Promise<void> {
    // Check if reaction exists
    const reaction = await prisma.postReaction.findUnique({
      where: {
        postId_userId: {
          postId,
          userId,
        },
      },
    });

    if (!reaction) {
      throw new NotFoundError("Reaction");
    }

    // Delete the reaction
    await prisma.postReaction.delete({
      where: {
        postId_userId: {
          postId,
          userId,
        },
      },
    });
  }

  /**
   * Comment on a post
   * Validates: Requirements 4.9
   */
  async commentOnPost(postId: string, content: string, userId: string) {
    // Validate input
    if (!content || content.trim().length === 0) {
      throw new ValidationError("Comment content is required");
    }

    if (content.length > 1000) {
      throw new ValidationError("Comment content exceeds maximum length of 1000 characters");
    }

    // Validate that the post exists
    const post = await prisma.communityPost.findUnique({
      where: { id: postId },
      select: { id: true },
    });

    if (!post) {
      throw new NotFoundError("Post");
    }

    // Validate that the user exists
    const userExists = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true },
    });

    if (!userExists) {
      throw new ValidationError("Invalid userId: User does not exist");
    }

    // Create the comment
    const comment = await prisma.postComment.create({
      data: {
        postId,
        authorId: userId,
        content: content.trim(),
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

    return comment;
  }

  /**
   * Pin a post (moderator action)
   * Validates: Requirements 6.3
   */
  async pinPost(postId: string, moderatorId: string): Promise<void> {
    // Get the post
    const post = await prisma.communityPost.findUnique({
      where: { id: postId },
      select: {
        id: true,
        groupId: true,
        isPinned: true,
      },
    });

    if (!post) {
      throw new NotFoundError("Post");
    }

    // Check if post is already pinned
    if (post.isPinned) {
      throw new ValidationError("Post is already pinned");
    }

    // Check if user is a moderator of the group (only group posts can be pinned)
    if (!post.groupId) {
      throw new ValidationError("Only group posts can be pinned");
    }

    const isModerator = await prisma.groupModerator.findUnique({
      where: {
        groupId_userId: {
          groupId: post.groupId,
          userId: moderatorId,
        },
      },
    });

    if (!isModerator) {
      throw new AuthorizationError("You do not have moderator permissions for this group");
    }

    // Pin the post
    await prisma.communityPost.update({
      where: { id: postId },
      data: {
        isPinned: true,
      },
    });

    // Log the moderation action
    await prisma.moderationLog.create({
      data: {
        moderatorId,
        targetId: postId,
        type: "POST_PIN",
        reason: "Post pinned by moderator",
        metadata: {
          postId,
          groupId: post.groupId,
        } as any,
      },
    });
  }

  /**
   * Unpin a post (moderator action)
   * Validates: Requirements 6.4
   */
  async unpinPost(postId: string, moderatorId: string): Promise<void> {
    // Get the post
    const post = await prisma.communityPost.findUnique({
      where: { id: postId },
      select: {
        id: true,
        groupId: true,
        isPinned: true,
      },
    });

    if (!post) {
      throw new NotFoundError("Post");
    }

    // Check if post is not pinned
    if (!post.isPinned) {
      throw new ValidationError("Post is not pinned");
    }

    // Check if user is a moderator of the group
    if (!post.groupId) {
      throw new ValidationError("Only group posts can be unpinned");
    }

    const isModerator = await prisma.groupModerator.findUnique({
      where: {
        groupId_userId: {
          groupId: post.groupId,
          userId: moderatorId,
        },
      },
    });

    if (!isModerator) {
      throw new AuthorizationError("You do not have moderator permissions for this group");
    }

    // Unpin the post
    await prisma.communityPost.update({
      where: { id: postId },
      data: {
        isPinned: false,
      },
    });

    // Log the moderation action
    await prisma.moderationLog.create({
      data: {
        moderatorId,
        targetId: postId,
        type: "POST_UNPIN",
        reason: "Post unpinned by moderator",
        metadata: {
          postId,
          groupId: post.groupId,
        } as any,
      },
    });
  }

  /**
   * Validate image URL format
   * Supports common image formats and CDN URLs
   */
  private isValidImageUrl(url: string): boolean {
    try {
      const parsedUrl = new URL(url);
      
      // Check protocol
      if (!["http:", "https:"].includes(parsedUrl.protocol)) {
        return false;
      }

      // Check for common image extensions or CDN patterns
      const pathname = parsedUrl.pathname.toLowerCase();
      const imageExtensions = [".jpg", ".jpeg", ".png", ".gif", ".webp", ".svg"];
      const hasImageExtension = imageExtensions.some((ext) => pathname.endsWith(ext));
      
      // Allow CDN URLs (cloudinary, imgix, etc.) even without extensions
      const cdnPatterns = ["cloudinary.com", "imgix.net", "cloudfront.net", "amazonaws.com"];
      const isCdnUrl = cdnPatterns.some((pattern) => parsedUrl.hostname.includes(pattern));

      return hasImageExtension || isCdnUrl;
    } catch {
      return false;
    }
  }

  /**
   * Validate URL format
   */
  private isValidUrl(url: string): boolean {
    try {
      const parsedUrl = new URL(url);
      return ["http:", "https:"].includes(parsedUrl.protocol);
    } catch {
      return false;
    }
  }

  /**
   * Format post data for API responses
   */
  private formatPostData(post: any): CommunityPostData {
    return {
      id: post.id,
      content: post.content,
      authorId: post.authorId,
      authorName: post.author.name || "Unknown",
      authorImage: post.author.image,
      groupId: post.groupId,
      visibility: post.visibility,
      imageUrls: post.imageUrls,
      linkUrls: post.linkUrls,
      isEdited: post.isEdited,
      isPinned: post.isPinned,
      reactionCount: post._count?.reactions || 0,
      commentCount: post._count?.comments || 0,
      createdAt: post.createdAt,
      updatedAt: post.updatedAt,
    };
  }
}

export const postService = new PostService();
