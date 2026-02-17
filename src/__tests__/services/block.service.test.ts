import { describe, it, expect, beforeEach, vi } from "vitest";
import { BlockService } from "@/lib/services/block.service";
import { prisma } from "@/lib/prisma";
import { ValidationError, NotFoundError } from "@/lib/utils/errors";

// Mock Prisma
vi.mock("@/lib/prisma", () => ({
  prisma: {
    user: {
      findUnique: vi.fn(),
    },
    userBlock: {
      findUnique: vi.fn(),
      findMany: vi.fn(),
      create: vi.fn(),
      delete: vi.fn(),
    },
  },
}));

describe("BlockService", () => {
  let blockService: BlockService;

  beforeEach(() => {
    blockService = new BlockService();
    vi.clearAllMocks();
  });

  describe("blockUser", () => {
    it("should create a block relationship with valid users", async () => {
      const mockBlocker = { id: "user-1" };
      const mockBlocked = { id: "user-2" };

      vi.mocked(prisma.user.findUnique)
        .mockResolvedValueOnce(mockBlocker as any)
        .mockResolvedValueOnce(mockBlocked as any);
      vi.mocked(prisma.userBlock.findUnique).mockResolvedValue(null);
      vi.mocked(prisma.userBlock.create).mockResolvedValue({
        id: "block-1",
        blockerId: "user-1",
        blockedId: "user-2",
        createdAt: new Date(),
      } as any);

      await blockService.blockUser("user-1", "user-2");

      expect(prisma.userBlock.create).toHaveBeenCalledWith({
        data: {
          blockerId: "user-1",
          blockedId: "user-2",
        },
      });
    });

    it("should throw ValidationError when trying to block self", async () => {
      await expect(blockService.blockUser("user-1", "user-1")).rejects.toThrow(
        ValidationError
      );
      await expect(blockService.blockUser("user-1", "user-1")).rejects.toThrow(
        "Users cannot block themselves"
      );
    });

    it("should throw ValidationError when blocker does not exist", async () => {
      vi.mocked(prisma.user.findUnique)
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce({ id: "user-2" } as any);

      await expect(blockService.blockUser("invalid-user", "user-2")).rejects.toThrow(
        ValidationError
      );
    });

    it("should throw NotFoundError when user to block does not exist", async () => {
      vi.mocked(prisma.user.findUnique)
        .mockResolvedValueOnce({ id: "user-1" } as any)
        .mockResolvedValueOnce(null);

      await expect(blockService.blockUser("user-1", "invalid-user")).rejects.toThrow(
        NotFoundError
      );
    });

    it("should throw ValidationError when already blocked", async () => {
      const mockBlocker = { id: "user-1" };
      const mockBlocked = { id: "user-2" };

      vi.mocked(prisma.user.findUnique)
        .mockResolvedValueOnce(mockBlocker as any)
        .mockResolvedValueOnce(mockBlocked as any);
      vi.mocked(prisma.userBlock.findUnique).mockResolvedValue({
        id: "block-1",
        blockerId: "user-1",
        blockedId: "user-2",
        createdAt: new Date(),
      } as any);

      await expect(blockService.blockUser("user-1", "user-2")).rejects.toThrow(
        "You have already blocked this user"
      );
    });
  });

  describe("unblockUser", () => {
    it("should remove a block relationship", async () => {
      const mockBlocker = { id: "user-1" };
      const mockBlocked = { id: "user-2" };

      vi.mocked(prisma.user.findUnique)
        .mockResolvedValueOnce(mockBlocker as any)
        .mockResolvedValueOnce(mockBlocked as any);
      vi.mocked(prisma.userBlock.findUnique).mockResolvedValue({
        id: "block-1",
        blockerId: "user-1",
        blockedId: "user-2",
        createdAt: new Date(),
      } as any);
      vi.mocked(prisma.userBlock.delete).mockResolvedValue({} as any);

      await blockService.unblockUser("user-1", "user-2");

      expect(prisma.userBlock.delete).toHaveBeenCalledWith({
        where: {
          blockerId_blockedId: {
            blockerId: "user-1",
            blockedId: "user-2",
          },
        },
      });
    });

    it("should throw ValidationError when blocker does not exist", async () => {
      vi.mocked(prisma.user.findUnique)
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce({ id: "user-2" } as any);

      await expect(blockService.unblockUser("invalid-user", "user-2")).rejects.toThrow(
        ValidationError
      );
    });

    it("should throw NotFoundError when user to unblock does not exist", async () => {
      vi.mocked(prisma.user.findUnique)
        .mockResolvedValueOnce({ id: "user-1" } as any)
        .mockResolvedValueOnce(null);

      await expect(blockService.unblockUser("user-1", "invalid-user")).rejects.toThrow(
        NotFoundError
      );
    });

    it("should throw ValidationError when not blocked", async () => {
      const mockBlocker = { id: "user-1" };
      const mockBlocked = { id: "user-2" };

      vi.mocked(prisma.user.findUnique)
        .mockResolvedValueOnce(mockBlocker as any)
        .mockResolvedValueOnce(mockBlocked as any);
      vi.mocked(prisma.userBlock.findUnique).mockResolvedValue(null);

      await expect(blockService.unblockUser("user-1", "user-2")).rejects.toThrow(
        "You have not blocked this user"
      );
    });
  });

  describe("isBlocked", () => {
    it("should return true when block relationship exists", async () => {
      vi.mocked(prisma.userBlock.findUnique).mockResolvedValue({
        id: "block-1",
        blockerId: "user-1",
        blockedId: "user-2",
        createdAt: new Date(),
      } as any);

      const result = await blockService.isBlocked("user-1", "user-2");

      expect(result).toBe(true);
    });

    it("should return false when block relationship does not exist", async () => {
      vi.mocked(prisma.userBlock.findUnique).mockResolvedValue(null);

      const result = await blockService.isBlocked("user-1", "user-2");

      expect(result).toBe(false);
    });
  });

  describe("getBlockedUsers", () => {
    it("should return list of blocked users", async () => {
      const mockUser = { id: "user-1" };
      const mockBlocks = [
        {
          id: "block-1",
          blockerId: "user-1",
          blockedId: "user-2",
          createdAt: new Date(),
          blocked: {
            id: "user-2",
            name: "Blocked User 1",
            email: "blocked1@example.com",
            image: "https://example.com/avatar1.jpg",
            role: "STUDENT",
          },
        },
        {
          id: "block-2",
          blockerId: "user-1",
          blockedId: "user-3",
          createdAt: new Date(),
          blocked: {
            id: "user-3",
            name: "Blocked User 2",
            email: "blocked2@example.com",
            image: "https://example.com/avatar2.jpg",
            role: "STUDENT",
          },
        },
      ];

      vi.mocked(prisma.user.findUnique).mockResolvedValue(mockUser as any);
      vi.mocked(prisma.userBlock.findMany).mockResolvedValue(mockBlocks as any);

      const result = await blockService.getBlockedUsers("user-1");

      expect(result).toHaveLength(2);
      expect(result[0]).toMatchObject({
        id: "user-2",
        name: "Blocked User 1",
        email: "blocked1@example.com",
      });
      expect(result[1]).toMatchObject({
        id: "user-3",
        name: "Blocked User 2",
        email: "blocked2@example.com",
      });
    });

    it("should throw NotFoundError when user does not exist", async () => {
      vi.mocked(prisma.user.findUnique).mockResolvedValue(null);

      await expect(blockService.getBlockedUsers("invalid-user")).rejects.toThrow(
        NotFoundError
      );
    });

    it("should return empty array when user has not blocked anyone", async () => {
      const mockUser = { id: "user-1" };

      vi.mocked(prisma.user.findUnique).mockResolvedValue(mockUser as any);
      vi.mocked(prisma.userBlock.findMany).mockResolvedValue([]);

      const result = await blockService.getBlockedUsers("user-1");

      expect(result).toHaveLength(0);
    });
  });
});
