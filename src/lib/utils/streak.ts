import { prisma } from "@/lib/prisma";
import { awardXP, XP_REWARDS } from "./xp";

/**
 * Check if a date is today
 */
function isToday(date: Date): boolean {
  const today = new Date();
  return (
    date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear()
  );
}

/**
 * Check if a date is yesterday
 */
function isYesterday(date: Date): boolean {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  return (
    date.getDate() === yesterday.getDate() &&
    date.getMonth() === yesterday.getMonth() &&
    date.getFullYear() === yesterday.getFullYear()
  );
}

/**
 * Update user's login streak and award XP if applicable
 * @param userId - The user ID
 * @returns Updated streak information
 */
export async function updateLoginStreak(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      currentStreak: true,
      longestStreak: true,
      lastLoginDate: true,
      xp: true,
      level: true,
    },
  });

  if (!user) {
    throw new Error("User not found");
  }

  const now = new Date();
  let currentStreak = user.currentStreak;
  let longestStreak = user.longestStreak;
  let streakBonusAwarded = false;
  let xpAwarded = 0;

  // If user has never logged in or last login was not today
  if (!user.lastLoginDate || !isToday(user.lastLoginDate)) {
    // Check if last login was yesterday (continuing streak)
    if (user.lastLoginDate && isYesterday(user.lastLoginDate)) {
      currentStreak += 1;
    } else if (!user.lastLoginDate) {
      // First time login
      currentStreak = 1;
    } else {
      // Streak broken, reset to 1
      currentStreak = 1;
    }

    // Update longest streak if current is higher
    if (currentStreak > longestStreak) {
      longestStreak = currentStreak;
    }

    // Award streak bonus XP (only if streak is 2 or more days)
    if (currentStreak >= 2) {
      await awardXP(userId, XP_REWARDS.STREAK_BONUS, `Daily login streak: ${currentStreak} days`);
      streakBonusAwarded = true;
      xpAwarded = XP_REWARDS.STREAK_BONUS;
    }

    // Update user's streak and last login date
    await prisma.user.update({
      where: { id: userId },
      data: {
        currentStreak,
        longestStreak,
        lastLoginDate: now,
      },
    });
  }

  return {
    currentStreak,
    longestStreak,
    streakBonusAwarded,
    xpAwarded,
    lastLoginDate: now,
  };
}

/**
 * Get user's streak information
 * @param userId - The user ID
 * @returns Streak information
 */
export async function getUserStreak(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      currentStreak: true,
      longestStreak: true,
      lastLoginDate: true,
    },
  });

  if (!user) {
    throw new Error("User not found");
  }

  return {
    currentStreak: user.currentStreak,
    longestStreak: user.longestStreak,
    lastLoginDate: user.lastLoginDate,
  };
}
