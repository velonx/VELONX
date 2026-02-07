import { calculateLevel, XP_THRESHOLDS, XP_REWARDS, getXPForNextLevel, getLevelProgress } from "@/lib/utils/xp";

describe("XP Utilities", () => {
  describe("calculateLevel", () => {
    it("should return level 1 for 0 XP", () => {
      expect(calculateLevel(0)).toBe(1);
    });

    it("should return level 2 for 100 XP", () => {
      expect(calculateLevel(100)).toBe(2);
    });

    it("should return level 3 for 250 XP", () => {
      expect(calculateLevel(250)).toBe(3);
    });

    it("should return level 5 for 1500 XP", () => {
      expect(calculateLevel(1500)).toBe(5);
    });

    it("should return level 10 for 11000+ XP", () => {
      expect(calculateLevel(11000)).toBe(10);
      expect(calculateLevel(15000)).toBe(10);
    });

    it("should return correct level for XP just below threshold", () => {
      expect(calculateLevel(99)).toBe(1);
      expect(calculateLevel(249)).toBe(2);
      expect(calculateLevel(499)).toBe(3);
    });
  });

  describe("XP_THRESHOLDS", () => {
    it("should have 10 levels defined", () => {
      expect(XP_THRESHOLDS).toHaveLength(10);
    });

    it("should start at 0 for level 1", () => {
      expect(XP_THRESHOLDS[0]).toBe(0);
    });

    it("should be in ascending order", () => {
      for (let i = 1; i < XP_THRESHOLDS.length; i++) {
        expect(XP_THRESHOLDS[i]).toBeGreaterThan(XP_THRESHOLDS[i - 1]);
      }
    });
  });

  describe("XP_REWARDS", () => {
    it("should have defined rewards for all actions", () => {
      expect(XP_REWARDS.EVENT_ATTENDANCE).toBe(50);
      expect(XP_REWARDS.PROJECT_COMPLETION).toBe(100);
      expect(XP_REWARDS.MENTOR_SESSION).toBe(25);
      expect(XP_REWARDS.RESOURCE_CONTRIBUTION).toBe(30);
      expect(XP_REWARDS.STREAK_BONUS).toBe(20);
    });
  });

  describe("getXPForNextLevel", () => {
    it("should return correct XP for next level", () => {
      expect(getXPForNextLevel(1)).toBe(100);
      expect(getXPForNextLevel(2)).toBe(250);
      expect(getXPForNextLevel(5)).toBe(2000);
    });

    it("should return null for max level", () => {
      expect(getXPForNextLevel(10)).toBeNull();
      expect(getXPForNextLevel(11)).toBeNull();
    });
  });

  describe("getLevelProgress", () => {
    it("should return 0% at level start", () => {
      expect(getLevelProgress(0, 1)).toBe(0);
      expect(getLevelProgress(100, 2)).toBe(0);
    });

    it("should return 50% at level midpoint", () => {
      expect(getLevelProgress(50, 1)).toBe(50);
      expect(getLevelProgress(175, 2)).toBe(50);
    });

    it("should return 100% at max level", () => {
      expect(getLevelProgress(11000, 10)).toBe(100);
      expect(getLevelProgress(15000, 10)).toBe(100);
    });
  });
});
