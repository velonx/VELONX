import { describe, it, expect, beforeEach, vi } from "vitest";
import { FollowService } from "@/lib/services/follow.service";
import { prisma } from "@/lib/prisma";
import { ValidationError, NotFoundError } from "@/lib/utils/errors";

// Mock Prisma
vi.mock("@/lib/prisma", () => ({
  prisma: {
    user: {
      findUnique: vi.fn(),
    },
    follow: {
      findUnique: vi.fn(),
      findMany: vi.fn(),
      create: vi.fn(),
      delete: vi.fn(),
    },
  },
}));

describe("FollowService", () => {
  let followService: FollowService;

  beforeEach(() => {
    followService = new FollowService();
    vi.clearAllMocks();
  });

  describe("followUser", () => {
    it("should create a follow relationship with valid users", async () => {
      const mockFollower = { id: "user-1" };
      const mockFollowing = { id: "user-2" };

      vi.mocked(prisma.user.findUnique)
        .mockResolvedValueOnce(mockFollower as any)
        .mockResolvedValueOnce(mockFollowing as any);
      vi.mocked(prisma.follow.findUnique).mockResolvedValue(null);
      vi.mocked(prisma.follow.create).mockResolvedValue({
        id: "follow-1",
        followerId: "user-1",
        followingId: "user-2",
        createdAt: new Date(),
      } as any);

      await followService.followUser("user-1", "user-2");

      expect(prisma.follow.create).toHaveBeenCalledWith({
        data: {
          followerId: "user-1",
          followingId: "user-2",
        },
      });
    });

    it("should throw ValidationError when trying to follow self", async () => {
      await expect(followService.followUser("user-1", "user-1")).rejects.toThrow(
        ValidationError
      );
      await expect(followService.followUser("user-1", "user-1")).rejects.toThrow(
        "Users cannot follow themselves"
      );
    });

    it("should throw ValidationError when follower does not exist", async () => {
      vi.mocked(prisma.user.findUnique)
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce({ id: "user-2" } as any);

      await expect(followService.followUser("invalid-user", "user-2")).rejects.toThrow(
        ValidationError
      );
    });

    it("should throw NotFoundError when user to follow does not exist", async () => {
      vi.mocked(prisma.user.findUnique)
        .mockResolvedValueOnce({ id: "user-1" } as any)
        .mockResolvedValueOnce(null);

      await expect(followService.followUser("user-1", "invalid-user")).rejects.toThrow(
        NotFoundError
      );
    });

    it("should throw ValidationError when already following", async () => {
      const mockFollower = { id: "user-1" };
      const mockFollowing = { id: "user-2" };

      vi.mocked(prisma.user.findUnique)
        .mockResolvedValueOnce(mockFollower as any)
        .mockResolvedValueOnce(mockFollowing as any);
      vi.mocked(prisma.follow.findUnique).mockResolvedValue({
        id: "follow-1",
        followerId: "user-1",
        followingId: "user-2",
        createdAt: new Date(),
      } as any);

      await expect(followService.followUser("user-1", "user-2")).rejects.toThrow(
        "You are already following this user"
      );
    });
  });

  describe("unfollowUser", () => {
    it("should remove a follow relationship", async () => {
      const mockFollower = { id: "user-1" };
      const mockFollowing = { id: "user-2" };

      vi.mocked(prisma.user.findUnique)
        .mockResolvedValueOnce(mockFollower as any)
        .mockResolvedValueOnce(mockFollowing as any);
      vi.mocked(prisma.follow.findUnique).mockResolvedValue({
        id: "follow-1",
        followerId: "user-1",
        followingId: "user-2",
        createdAt: new Date(),
      } as any);
      vi.mocked(prisma.follow.delete).mockResolvedValue({} as any);

      await followService.unfollowUser("user-1", "user-2");

      expect(prisma.follow.delete).toHaveBeenCalledWith({
        where: {
          followerId_followingId: {
            followerId: "user-1",
            followingId: "user-2",
          },
        },
      });
    });

    it("should throw ValidationError when follower does not exist", async () => {
      vi.mocked(prisma.user.findUnique)
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce({ id: "user-2" } as any);

      await expect(followService.unfollowUser("invalid-user", "user-2")).rejects.toThrow(
        ValidationError
      );
    });

    it("should throw NotFoundError when user to unfollow does not exist", async () => {
      vi.mocked(prisma.user.findUnique)
        .mockResolvedValueOnce({ id: "user-1" } as any)
        .mockResolvedValueOnce(null);

      await expect(followService.unfollowUser("user-1", "invalid-user")).rejects.toThrow(
        NotFoundError
      );
    });

    it("should throw ValidationError when not following", async () => {
      const mockFollower = { id: "user-1" };
      const mockFollowing = { id: "user-2" };

      vi.mocked(prisma.user.findUnique)
        .mockResolvedValueOnce(mockFollower as any)
        .mockResolvedValueOnce(mockFollowing as any);
      vi.mocked(prisma.follow.findUnique).mockResolvedValue(null);

      await expect(followService.unfollowUser("user-1", "user-2")).rejects.toThrow(
        "You are not following this user"
      );
    });
  });

  describe("getFollowers", () => {
    it("should return list of followers", async () => {
      const mockUser = { id: "user-1" };
      const mockFollowers = [
        {
          id: "follow-1",
          followerId: "user-2",
          followingId: "user-1",
          createdAt: new Date(),
          follower: {
            id: "user-2",
            name: "Follower 1",
            email: "follower1@example.com",
            image: "https://example.com/avatar1.jpg",
            role: "STUDENT",
          },
        },
        {
          id: "follow-2",
          followerId: "user-3",
          followingId: "user-1",
          createdAt: new Date(),
          follower: {
            id: "user-3",
            name: "Follower 2",
            email: "follower2@example.com",
            image: "https://example.com/avatar2.jpg",
            role: "STUDENT",
          },
        },
      ];

      vi.mocked(prisma.user.findUnique).mockResolvedValue(mockUser as any);
      vi.mocked(prisma.follow.findMany).mockResolvedValue(mockFollowers as any);

      const result = await followService.getFollowers("user-1");

      expect(result).toHaveLength(2);
      expect(result[0]).toMatchObject({
        id: "user-2",
        name: "Follower 1",
        email: "follower1@example.com",
      });
      expect(result[1]).toMatchObject({
        id: "user-3",
        name: "Follower 2",
        email: "follower2@example.com",
      });
    });

    it("should throw NotFoundError when user does not exist", async () => {
      vi.mocked(prisma.user.findUnique).mockResolvedValue(null);

      await expect(followService.getFollowers("invalid-user")).rejects.toThrow(
        NotFoundError
      );
    });

    it("should return empty array when user has no followers", async () => {
      const mockUser = { id: "user-1" };

      vi.mocked(prisma.user.findUnique).mockResolvedValue(mockUser as any);
      vi.mocked(prisma.follow.findMany).mockResolvedValue([]);

      const result = await followService.getFollowers("user-1");

      expect(result).toHaveLength(0);
    });
  });

  describe("getFollowing", () => {
    it("should return list of users being followed", async () => {
      const mockUser = { id: "user-1" };
      const mockFollowing = [
        {
          id: "follow-1",
          followerId: "user-1",
          followingId: "user-2",
          createdAt: new Date(),
          following: {
            id: "user-2",
            name: "Following 1",
            email: "following1@example.com",
            image: "https://example.com/avatar1.jpg",
            role: "STUDENT",
          },
        },
        {
          id: "follow-2",
          followerId: "user-1",
          followingId: "user-3",
          createdAt: new Date(),
          following: {
            id: "user-3",
            name: "Following 2",
            email: "following2@example.com",
            image: "https://example.com/avatar2.jpg",
            role: "MENTOR",
          },
        },
      ];

      vi.mocked(prisma.user.findUnique).mockResolvedValue(mockUser as any);
      vi.mocked(prisma.follow.findMany).mockResolvedValue(mockFollowing as any);

      const result = await followService.getFollowing("user-1");

      expect(result).toHaveLength(2);
      expect(result[0]).toMatchObject({
        id: "user-2",
        name: "Following 1",
        email: "following1@example.com",
      });
      expect(result[1]).toMatchObject({
        id: "user-3",
        name: "Following 2",
        email: "following2@example.com",
      });
    });

    it("should throw NotFoundError when user does not exist", async () => {
      vi.mocked(prisma.user.findUnique).mockResolvedValue(null);

      await expect(followService.getFollowing("invalid-user")).rejects.toThrow(
        NotFoundError
      );
    });

    it("should return empty array when user is not following anyone", async () => {
      const mockUser = { id: "user-1" };

      vi.mocked(prisma.user.findUnique).mockResolvedValue(mockUser as any);
      vi.mocked(prisma.follow.findMany).mockResolvedValue([]);

      const result = await followService.getFollowing("user-1");

      expect(result).toHaveLength(0);
    });
  });

  describe("isFollowing", () => {
    it("should return true when follow relationship exists", async () => {
      vi.mocked(prisma.follow.findUnique).mockResolvedValue({
        id: "follow-1",
        followerId: "user-1",
        followingId: "user-2",
        createdAt: new Date(),
      } as any);

      const result = await followService.isFollowing("user-1", "user-2");

      expect(result).toBe(true);
    });

    it("should return false when follow relationship does not exist", async () => {
      vi.mocked(prisma.follow.findUnique).mockResolvedValue(null);

      const result = await followService.isFollowing("user-1", "user-2");

      expect(result).toBe(false);
    });
  });
});
