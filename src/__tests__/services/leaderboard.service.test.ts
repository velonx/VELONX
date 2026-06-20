import { describe, it, expect, vi, beforeEach } from "vitest";
import { LeaderboardService, leaderboardService } from "../../lib/services/leaderboard.service";
import { prisma } from "../../lib/prisma";

// Mock prisma
vi.mock("@/lib/prisma", () => ({
  prisma: {
    user: {
      findMany: vi.fn(),
      count: vi.fn(),
      findUnique: vi.fn(),
    },
    xPTransaction: {
      findMany: vi.fn(),
    },
  },
}));

describe("LeaderboardService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("getLeaderboard all-time pagination", () => {
    it("should offset pagination queries with skip and take on the database", async () => {
      const mockUsers = [
        { id: "u-1", name: "Alice", email: "alice@test.com", image: null, xp: 100, level: 2, currentStreak: 5, _count: { badges: 2, projectsOwned: 1 } },
        { id: "u-2", name: "Bob", email: "bob@test.com", image: null, xp: 80, level: 1, currentStreak: 2, _count: { badges: 1, projectsOwned: 0 } },
      ];

      (prisma.user.findMany as any).mockResolvedValue(mockUsers);

      const result = await LeaderboardService.getLeaderboard("ALL_TIME", 2, 2);

      expect(prisma.user.findMany).toHaveBeenCalledWith({
        where: { role: "STUDENT" },
        select: expect.any(Object),
        orderBy: { xp: "desc" },
        skip: 2,
        take: 2,
      });

      expect(result).toHaveLength(2);
      expect(result[0].rank).toBe(3); // Rank offset should be skip + index + 1 (2 + 0 + 1)
      expect(result[1].rank).toBe(4); // Rank offset should be skip + index + 1 (2 + 1 + 1)
    });
  });

  describe("leaderboardService wrapper getLeaderboard", () => {
    it("should return both entries and total student count", async () => {
      const mockUsers = [
        { id: "u-1", name: "Alice", email: "alice@test.com", image: null, xp: 100, level: 2, currentStreak: 5, _count: { badges: 2, projectsOwned: 1 } }
      ];

      (prisma.user.findMany as any).mockResolvedValue(mockUsers);
      (prisma.user.count as any).mockResolvedValue(12);

      const result = await leaderboardService.getLeaderboard({
        timeframe: "all",
        page: 2,
        pageSize: 5,
      });

      expect(prisma.user.findMany).toHaveBeenCalledWith(expect.objectContaining({
        skip: 5,
        take: 5,
      }));
      expect(prisma.user.count).toHaveBeenCalledWith({
        where: { role: "STUDENT" },
      });

      expect(result.entries).toHaveLength(1);
      expect(result.entries[0].rank).toBe(6);
      expect(result.totalCount).toBe(12);
    });
  });
});
