import { prisma } from '@/lib/prisma';
import { XPSource, XPTransaction } from '@prisma/client';

/**
 * XP Service - Manages user XP, levels, and multipliers
 */
export class XPService {
    // XP required for each level (exponential growth)
    private static getXPForLevel(level: number): number {
        return Math.floor(100 * Math.pow(level, 1.5));
    }

    /**
     * Get total XP required to reach a specific level
     */
    static getRequiredXPForLevel(level: number): number {
        let totalXP = 0;
        for (let i = 1; i < level; i++) {
            totalXP += this.getXPForLevel(i);
        }
        return totalXP;
    }

    /**
     * Calculate level from total XP
     */
    static getLevelFromXP(xp: number): number {
        let level = 1;
        let requiredXP = 0;

        while (requiredXP <= xp) {
            level++;
            requiredXP += this.getXPForLevel(level);
        }

        return level - 1;
    }

    /**
     * Calculate XP multiplier based on streaks and referrals
     */
    static async calculateMultiplier(userId: string): Promise<number> {
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: {
                currentStreak: true,
                referralCount: true,
                xpMultiplier: true,
            },
        });

        if (!user) return 1.0;

        let multiplier = 1.0;

        // Streak bonuses
        multiplier += this.getStreakMultiplier(user.currentStreak);

        // Referral bonuses (0.1x per referral, max 1.0x)
        const referralBonus = Math.min(user.referralCount * 0.1, 1.0);
        multiplier += referralBonus;

        // Apply any custom multiplier
        multiplier *= user.xpMultiplier;

        return Math.round(multiplier * 100) / 100; // Round to 2 decimal places
    }

    /**
     * Get streak multiplier
     */
    static getStreakMultiplier(streak: number): number {
        if (streak >= 100) return 0.5; // 100-day streak: +0.5x
        if (streak >= 30) return 0.25; // 30-day streak: +0.25x
        if (streak >= 7) return 0.1; // 7-day streak: +0.1x
        return 0;
    }

    /**
     * Add XP to user
     */
    static async addXP(
        userId: string,
        amount: number,
        source: XPSource,
        metadata?: any
    ): Promise<{ success: boolean; xpAdded: number; newLevel?: number; leveledUp: boolean }> {
        try {
            // Calculate multiplier
            const multiplier = await this.calculateMultiplier(userId);
            const actualXP = Math.floor(amount * multiplier);

            // Get current user data
            const user = await prisma.user.findUnique({
                where: { id: userId },
                select: { xp: true, level: true },
            });

            if (!user) {
                return { success: false, xpAdded: 0, leveledUp: false };
            }

            const newXP = user.xp + actualXP;
            const newLevel = this.getLevelFromXP(newXP);
            const leveledUp = newLevel > user.level;

            // Update user and create transaction
            await prisma.$transaction([
                prisma.xPTransaction.create({
                    data: {
                        userId,
                        amount: actualXP,
                        multiplier,
                        source,
                        reason: this.getReasonForSource(source),
                        metadata: metadata ? JSON.stringify(metadata) : null,
                    },
                }),
                prisma.user.update({
                    where: { id: userId },
                    data: {
                        xp: newXP,
                        level: newLevel,
                    },
                }),
            ]);

            // If leveled up, create achievement
            if (leveledUp) {
                await prisma.achievement.create({
                    data: {
                        userId,
                        type: 'CUSTOM',
                        title: `Reached Level ${newLevel}`,
                        description: `You've achieved level ${newLevel}!`,
                        xpEarned: 0,
                        metadata: JSON.stringify({ oldLevel: user.level, newLevel }),
                    },
                });
            }

            console.log(
                `[XP] Added ${actualXP} XP to user ${userId} (base: ${amount}, multiplier: ${multiplier})`
            );

            return {
                success: true,
                xpAdded: actualXP,
                newLevel: leveledUp ? newLevel : undefined,
                leveledUp,
            };
        } catch (error) {
            console.error('[XP] Error adding XP:', error);
            return { success: false, xpAdded: 0, leveledUp: false };
        }
    }

    /**
     * Get default reason text for XP source
     */
    private static getReasonForSource(source: XPSource): string {
        const reasons: Record<XPSource, string> = {
            PROJECT_SUBMISSION: 'Submitted a project',
            EVENT_ATTENDANCE: 'Attended an event',
            MENTOR_SESSION: 'Completed a mentor session',
            COMMUNITY_CONTRIBUTION: 'Made a community contribution',
            STREAK_BONUS: 'Login streak bonus',
            REFERRAL: 'Referred a new user',
            BADGE_UNLOCK: 'Unlocked a badge',
            DAILY_LOGIN: 'Daily login',
            CHALLENGE_COMPLETION: 'Completed a challenge',
            MANUAL: 'Manual XP adjustment',
        };

        return reasons[source] || 'Earned XP';
    }

    /**
     * Get XP transaction history
     */
    static async getXPHistory(
        userId: string,
        limit: number = 50
    ): Promise<XPTransaction[]> {
        return prisma.xPTransaction.findMany({
            where: { userId },
            orderBy: { timestamp: 'desc' },
            take: limit,
        });
    }

    /**
     * Update user's login streak
     */
    static async updateStreak(userId: string): Promise<{
        currentStreak: number;
        bonusXP: number;
        isNewStreak: boolean;
    }> {
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: {
                currentStreak: true,
                longestStreak: true,
                lastLoginDate: true,
                lastStreakUpdate: true,
            },
        });

        if (!user) {
            return { currentStreak: 0, bonusXP: 0, isNewStreak: false };
        }

        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const lastLogin = user.lastLoginDate
            ? new Date(
                user.lastLoginDate.getFullYear(),
                user.lastLoginDate.getMonth(),
                user.lastLoginDate.getDate()
            )
            : null;

        let currentStreak = user.currentStreak;
        let isNewStreak = false;

        // If last login was yesterday, increment streak
        if (lastLogin) {
            const daysDiff = Math.floor(
                (today.getTime() - lastLogin.getTime()) / (1000 * 60 * 60 * 24)
            );

            if (daysDiff === 1) {
                currentStreak++;
                isNewStreak = true;
            } else if (daysDiff > 1) {
                // Streak broken
                currentStreak = 1;
                isNewStreak = true;
            }
            // If daysDiff === 0, they already logged in today
        } else {
            // First login ever
            currentStreak = 1;
            isNewStreak = true;
        }

        // Calculate streak bonus XP
        let bonusXP = 0;
        if (isNewStreak) {
            bonusXP = Math.min(currentStreak * 2, 50); // 2 XP per day, max 50

            // Award bonus XP
            await this.addXP(userId, bonusXP, 'STREAK_BONUS', { streak: currentStreak });
        }

        // Update user
        await prisma.user.update({
            where: { id: userId },
            data: {
                currentStreak,
                longestStreak: Math.max(currentStreak, user.longestStreak),
                lastLoginDate: now,
                lastStreakUpdate: now,
            },
        });

        console.log(`[XP] Updated streak for user ${userId}: ${currentStreak} days`);

        return { currentStreak, bonusXP, isNewStreak };
    }

    /**
     * Get user's XP stats
     */
    static async getUserXPStats(userId: string): Promise<{
        totalXP: number;
        level: number;
        xpForCurrentLevel: number;
        xpForNextLevel: number;
        progress: number; // Percentage to next level
        multiplier: number;
        streak: number;
    }> {
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: {
                xp: true,
                level: true,
                currentStreak: true,
            },
        });

        if (!user) {
            return {
                totalXP: 0,
                level: 1,
                xpForCurrentLevel: 0,
                xpForNextLevel: 100,
                progress: 0,
                multiplier: 1.0,
                streak: 0,
            };
        }

        const xpForCurrentLevel = this.getRequiredXPForLevel(user.level);
        const xpForNextLevel = this.getRequiredXPForLevel(user.level + 1);
        const xpInCurrentLevel = user.xp - xpForCurrentLevel;
        const xpNeededForNextLevel = xpForNextLevel - xpForCurrentLevel;
        const progress = (xpInCurrentLevel / xpNeededForNextLevel) * 100;
        const multiplier = await this.calculateMultiplier(userId);

        return {
            totalXP: user.xp,
            level: user.level,
            xpForCurrentLevel,
            xpForNextLevel,
            progress: Math.min(Math.max(progress, 0), 100), // Clamp between 0-100
            multiplier,
            streak: user.currentStreak,
        };
    }

    /**
     * Award daily login XP
     */
    static async awardDailyLoginXP(userId: string): Promise<number> {
        const result = await this.addXP(userId, 10, 'DAILY_LOGIN');
        return result.xpAdded;
    }

    /**
     * Get leaderboard by XP
     */
    static async getXPLeaderboard(limit: number = 100): Promise<
        Array<{
            id: string;
            name: string | null;
            email: string;
            xp: number;
            level: number;
            rank: number;
        }>
    > {
        const users = await prisma.user.findMany({
            select: {
                id: true,
                name: true,
                email: true,
                xp: true,
                level: true,
            },
            orderBy: { xp: 'desc' },
            take: limit,
        });

        return users.map((user, index) => ({
            ...user,
            rank: index + 1,
        }));
    }
}
