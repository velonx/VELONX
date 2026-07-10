/**
 * XP thresholds for each level
 * Level 1: 0 XP
 * Level 2: 100 XP
 * Level 3: 250 XP
 * ... and so on
 */
export const XP_THRESHOLDS = [
  0,     // Level 1
  100,   // Level 2
  250,   // Level 3
  500,   // Level 4
  1000,  // Level 5
  2000,  // Level 6
  3500,  // Level 7
  5500,  // Level 8
  8000,  // Level 9
  11000, // Level 10
];

/**
 * XP rewards for different actions
 */
export const XP_REWARDS = {
  EVENT_ATTENDANCE: 25,
  PROJECT_COMPLETION: 100,
  MENTOR_SESSION: 25,
  RESOURCE_VISIT: 10,
  BLOG_POST_READ: 5,
  RESOURCE_CONTRIBUTION: 30, // Contributing a new resource
  STREAK_BONUS: 20, // Daily login streak bonus
  REFERRAL_SIGNUP: 25, // Referral signup milestone
  REFERRAL_PROFILE_COMPLETE: 50, // Referral profile completion milestone
  REFERRAL_FIRST_ACTIVITY: 75, // Referral first activity milestone
};

/**
 * Calculate user level based on XP
 * @param xp - Current XP amount
 * @returns The calculated level (1-10)
 */
export function calculateLevel(xp: number): number {
  // Find the highest level threshold that the XP meets or exceeds
  for (let i = XP_THRESHOLDS.length - 1; i >= 0; i--) {
    if (xp >= XP_THRESHOLDS[i]) {
      return i + 1;
    }
  }
  return 1;
}

/**
 * Get XP required for next level
 * @param currentLevel - The current level
 * @returns XP required for next level, or null if at max level
 */
export function getXPForNextLevel(currentLevel: number): number | null {
  if (currentLevel >= XP_THRESHOLDS.length) {
    return null; // Max level reached
  }
  return XP_THRESHOLDS[currentLevel];
}

/**
 * Get progress to next level as a percentage
 * @param currentXP - Current XP amount
 * @param currentLevel - Current level
 * @returns Progress percentage (0-100)
 */
export function getLevelProgress(currentXP: number, currentLevel: number): number {
  if (currentLevel >= XP_THRESHOLDS.length) {
    return 100; // Max level reached
  }

  const currentThreshold = XP_THRESHOLDS[currentLevel - 1];
  const nextThreshold = XP_THRESHOLDS[currentLevel];
  const xpInCurrentLevel = currentXP - currentThreshold;
  const xpNeededForLevel = nextThreshold - currentThreshold;

  return Math.min(100, Math.max(0, (xpInCurrentLevel / xpNeededForLevel) * 100));
}
