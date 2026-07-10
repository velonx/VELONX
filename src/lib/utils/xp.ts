import { prisma } from "@/lib/prisma";
import { notificationService } from "@/lib/services/notification.service";

import { cacheService, CacheKeys } from "@/lib/services/cache.service";

import {
  XP_THRESHOLDS,
  XP_REWARDS,
  calculateLevel,
  getXPForNextLevel,
  getLevelProgress,
} from "./xp-constants";

export {
  XP_THRESHOLDS,
  XP_REWARDS,
  calculateLevel,
  getXPForNextLevel,
  getLevelProgress,
};


/**
 * Award XP to a user and automatically recalculate their level
 * @param userId - The user ID to award XP to
 * @param amount - The amount of XP to award
 * @param reason - The reason for awarding XP (for logging)
 * @returns The updated user with new XP and level
 */
export async function awardXP(userId: string, amount: number, reason: string) {
  // Update user XP
  const user = await prisma.user.update({
    where: { id: userId },
    data: {
      xp: { increment: amount },
    },
  });

  // Invalidate user stats cache
  try {
    await cacheService.delete(CacheKeys.user.stats(userId));
  } catch (cacheError) {
    console.error("Failed to invalidate user stats cache:", cacheError);
  }

  // Calculate new level based on updated XP
  const newLevel = calculateLevel(user.xp);

  // Create notification for XP award
  try {
    await notificationService.createXPAwardNotification({
      userId,
      xpAmount: amount,
      reason,
    });
  } catch (error) {
    console.error('Failed to create XP award notification:', error);
    // Don't fail the XP award if notification fails
  }

  // Update level if it changed
  if (newLevel !== user.level) {
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { level: newLevel },
    });

    // Create notification for level up
    try {
      await notificationService.createLevelUpNotification({
        userId,
        newLevel,
      });
    } catch (error) {
      console.error('Failed to create level up notification:', error);
      // Don't fail the level up if notification fails
    }

    return {
      user: updatedUser,
      xp: updatedUser.xp,
      level: updatedUser.level,
      leveledUp: true,
      previousLevel: user.level,
    };
  }

  return {
    user,
    xp: user.xp,
    level: user.level,
    leveledUp: false,
  };
}
