import { describe, it, expect, beforeEach, vi } from "vitest";
import { PostService } from "@/lib/services/post.service";
import { prisma } from "@/lib/prisma";
import { ValidationError, NotFoundError, AuthorizationError } from "@/lib/utils/errors";

// Mock Prisma
vi.mock("@/lib/prisma", () => ({
  prisma: {
    user: {
      findUnique: vi.fn(),
    },
    communityGroup: {
      findUnique: vi.fn(),
    },
    groupMember: {
      findUnique: vi.fn(),
    },
    communityPost: {
      create: vi.fn(),
      findUnique: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
    postReaction: {
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
    postComment: {
      create: vi.fn(),
    },
    groupModerator: {
      findUnique: vi.fn(),
    },
    moderationLog: {
      create: vi.fn(),
    },
  },
}));

describe("PostService", () => {
  let postService: PostService;

  beforeEach(() => {
    postService = new PostService();
    vi.clearAllMocks();
  });

  describe("createPost", () => {
    it("should create a post with valid data", async () => {
      const mockUser = {
        id: "user-1",
        name: "Test User",
        image: "https://example.com/avatar.jpg",
      };

      const mockPost = {
        id: "post-1",
        content: "Test post content",
        authorId: "user-1",
        groupId: null,
        visibility: "PUBLIC",
        imageUrls: [],
        linkUrls: [],
        isEdited: false,
        isPinned: false,
        createdAt: new Date(),
        updatedAt: new Date(),
        author: mockUser,
        _count: {
          reactions: 0,
          comments: 0,
        },
      };

      vi.mocked(prisma.user.findUnique).mockResolvedValue(mockUser as any);
      vi.mocked(prisma.communityPost.create).mockResolvedValue(mockPost as any);

      const result = await postService.createPost(
        {
          content: "Test post content",
          visibility: "PUBLIC",
        },
        "user-1"
      );

      expect(result).toMatchObject({
        id: "post-1",
        content: "Test post content",
        authorId: "user-1",
        authorName: "Test User",
        visibility: "PUBLIC",
        reactionCount: 0,
        commentCount: 0,
      });
    });

    it("should throw ValidationError for empty content", async () => {
      await expect(
        postService.createPost(
          {
            content: "",
            visibility: "PUBLIC",
          },
          "user-1"
        )
      ).rejects.toThrow(ValidationError);
    });

    it("should throw ValidationError for content exceeding max length", async () => {
      const longContent = "a".repeat(5001);

      await expect(
        postService.createPost(
          {
            content: longContent,
            visibility: "PUBLIC",
          },
          "user-1"
        )
      ).rejects.toThrow(ValidationError);
    });

    it("should validate image URLs", async () => {
      const mockUser = {
        id: "user-1",
        name: "Test User",
        image: null,
      };

      vi.mocked(prisma.user.findUnique).mockResolvedValue(mockUser as any);

      await expect(
        postService.createPost(
          {
            content: "Test post",
            visibility: "PUBLIC",
            imageUrls: ["not-a-valid-url"],
          },
          "user-1"
        )
      ).rejects.toThrow(ValidationError);
    });

    it("should validate maximum image count", async () => {
      const mockUser = {
        id: "user-1",
        name: "Test User",
        image: null,
      };

      vi.mocked(prisma.user.findUnique).mockResolvedValue(mockUser as any);

      await expect(
        postService.createPost(
          {
            content: "Test post",
            visibility: "PUBLIC",
            imageUrls: [
              "https://example.com/1.jpg",
              "https://example.com/2.jpg",
              "https://example.com/3.jpg",
              "https://example.com/4.jpg",
              "https://example.com/5.jpg",
              "https://example.com/6.jpg",
            ],
          },
          "user-1"
        )
      ).rejects.toThrow(ValidationError);
    });

    it("should require groupId when visibility is GROUP", async () => {
      const mockUser = {
        id: "user-1",
        name: "Test User",
        image: null,
      };

      vi.mocked(prisma.user.findUnique).mockResolvedValue(mockUser as any);

      await expect(
        postService.createPost(
          {
            content: "Test post",
            visibility: "GROUP",
          },
          "user-1"
        )
      ).rejects.toThrow(ValidationError);
    });
  });

  describe("editPost", () => {
    it("should edit a post by the author", async () => {
      const mockPost = {
        id: "post-1",
        authorId: "user-1",
      };

      const mockUpdatedPost = {
        id: "post-1",
        content: "Updated content",
        authorId: "user-1",
        groupId: null,
        visibility: "PUBLIC",
        imageUrls: [],
        linkUrls: [],
        isEdited: true,
        isPinned: false,
        createdAt: new Date(),
        updatedAt: new Date(),
        author: {
          id: "user-1",
          name: "Test User",
          image: null,
        },
        _count: {
          reactions: 0,
          comments: 0,
        },
      };

      vi.mocked(prisma.communityPost.findUnique).mockResolvedValue(mockPost as any);
      vi.mocked(prisma.communityPost.update).mockResolvedValue(mockUpdatedPost as any);

      const result = await postService.editPost("post-1", "Updated content", "user-1");

      expect(result.content).toBe("Updated content");
      expect(result.isEdited).toBe(true);
    });

    it("should throw AuthorizationError when editing another user's post", async () => {
      const mockPost = {
        id: "post-1",
        authorId: "user-1",
      };

      vi.mocked(prisma.communityPost.findUnique).mockResolvedValue(mockPost as any);

      await expect(postService.editPost("post-1", "Updated content", "user-2")).rejects.toThrow(
        AuthorizationError
      );
    });
  });

  describe("reactToPost", () => {
    it("should add a reaction to a post", async () => {
      const mockPost = { id: "post-1" };
      const mockUser = { id: "user-1" };

      vi.mocked(prisma.communityPost.findUnique).mockResolvedValue(mockPost as any);
      vi.mocked(prisma.user.findUnique).mockResolvedValue(mockUser as any);
      vi.mocked(prisma.postReaction.findUnique).mockResolvedValue(null);
      vi.mocked(prisma.postReaction.create).mockResolvedValue({} as any);

      await expect(postService.reactToPost("post-1", "user-1", "LIKE")).resolves.not.toThrow();

      expect(prisma.postReaction.create).toHaveBeenCalledWith({
        data: {
          postId: "post-1",
          userId: "user-1",
          type: "LIKE",
        },
      });
    });

    it("should update existing reaction", async () => {
      const mockPost = { id: "post-1" };
      const mockUser = { id: "user-1" };
      const mockReaction = { postId: "post-1", userId: "user-1", type: "LIKE" };

      vi.mocked(prisma.communityPost.findUnique).mockResolvedValue(mockPost as any);
      vi.mocked(prisma.user.findUnique).mockResolvedValue(mockUser as any);
      vi.mocked(prisma.postReaction.findUnique).mockResolvedValue(mockReaction as any);
      vi.mocked(prisma.postReaction.update).mockResolvedValue({} as any);

      await expect(postService.reactToPost("post-1", "user-1", "LOVE")).resolves.not.toThrow();

      expect(prisma.postReaction.update).toHaveBeenCalled();
    });
  });

  describe("commentOnPost", () => {
    it("should add a comment to a post", async () => {
      const mockPost = { id: "post-1" };
      const mockUser = { id: "user-1" };
      const mockComment = {
        id: "comment-1",
        postId: "post-1",
        authorId: "user-1",
        content: "Test comment",
        createdAt: new Date(),
        updatedAt: new Date(),
        author: {
          id: "user-1",
          name: "Test User",
          image: null,
        },
      };

      vi.mocked(prisma.communityPost.findUnique).mockResolvedValue(mockPost as any);
      vi.mocked(prisma.user.findUnique).mockResolvedValue(mockUser as any);
      vi.mocked(prisma.postComment.create).mockResolvedValue(mockComment as any);

      const result = await postService.commentOnPost("post-1", "Test comment", "user-1");

      expect(result.content).toBe("Test comment");
      expect(result.authorId).toBe("user-1");
    });

    it("should throw ValidationError for empty comment", async () => {
      await expect(postService.commentOnPost("post-1", "", "user-1")).rejects.toThrow(
        ValidationError
      );
    });
  });

  describe("pinPost", () => {
    it("should pin a post by a moderator", async () => {
      const mockPost = {
        id: "post-1",
        groupId: "group-1",
        isPinned: false,
      };
      const mockModerator = { groupId: "group-1", userId: "mod-1" };

      vi.mocked(prisma.communityPost.findUnique).mockResolvedValue(mockPost as any);
      vi.mocked(prisma.groupModerator.findUnique).mockResolvedValue(mockModerator as any);
      vi.mocked(prisma.communityPost.update).mockResolvedValue({} as any);
      vi.mocked(prisma.moderationLog.create).mockResolvedValue({} as any);

      await expect(postService.pinPost("post-1", "mod-1")).resolves.not.toThrow();

      expect(prisma.communityPost.update).toHaveBeenCalledWith({
        where: { id: "post-1" },
        data: { isPinned: true },
      });
    });

    it("should throw AuthorizationError for non-moderator", async () => {
      const mockPost = {
        id: "post-1",
        groupId: "group-1",
        isPinned: false,
      };

      vi.mocked(prisma.communityPost.findUnique).mockResolvedValue(mockPost as any);
      vi.mocked(prisma.groupModerator.findUnique).mockResolvedValue(null);

      await expect(postService.pinPost("post-1", "user-1")).rejects.toThrow(AuthorizationError);
    });
  });
});
