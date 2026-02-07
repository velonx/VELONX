import { prisma } from '@/lib/prisma';
import { Badge, BadgeCategory, BadgeRarity, UserBadge } from '@prisma/client';

/**
 * Badge Service - Manages badges and user badge operations
 */
export class BadgeService {
    /**
     * Create a new badge
     */
    static async createBadge(data: {
        name: string;
        description: string;
        imageUrl: string;
        category: BadgeCategory;
        xpReward: number;
        rarity?: BadgeRarity;
        criteria: string;
    }): Promise<Badge> {
        return prisma.badge.create({
            data: {
                ...data,
                rarity: data.rarity || 'COMMON',
            },
        });
    }

    /**
     * Get all badges
     */
    static async getAllBadges(): Promise<Badge[]> {
        return prisma.badge.findMany({
            orderBy: [{ rarity: 'desc' }, { createdAt: 'asc' }],
        });
    }

    /**
     * Get badges by category
     */
    static async getBadgesByCategory(category: BadgeCategory): Promise<Badge[]> {
        return prisma.badge.findMany({
            where: { category },
            orderBy: [{ rarity: 'desc' }, { createdAt: 'asc' }],
        });
    }

    /**
     * Get badge by ID
     */
    static async getBadgeById(badgeId: string): Promise<Badge | null> {
        return prisma.badge.findUnique({
            where: { id: badgeId },
        });
    }

    /**
     * Award a badge to a user
     */
    static async awardBadge(
        userId: string,
        badgeId: string
    ): Promise<UserBadge | null> {
        try {
            // Check if user already has this badge
            const existing = await prisma.userBadge.findUnique({
                where: {
                    userId_badgeId: {
                        userId,
                        badgeId,
                    },
                },
            });

            if (existing) {
                console.log(`[Badge] User ${userId} already has badge ${badgeId}`);
                return existing;
            }

            // Get badge details for XP reward
            const badge = await this.getBadgeById(badgeId);
            if (!badge) {
                console.error(`[Badge] Badge ${badgeId} not found`);
                return null;
            }

            // Award badge and add XP using transaction
            const [userBadge] = await prisma.$transaction([
                prisma.userBadge.create({
                    data: {
                        userId,
                        badgeId,
                    },
                }),
                // Add XP transaction for badge unlock
                prisma.xPTransaction.create({
                    data: {
                        userId,
                        amount: badge.xpReward,
                        source: 'BADGE_UNLOCK',
                        reason: `Unlocked badge: ${badge.name}`,
                        metadata: JSON.stringify({ badgeId }),
                    },
                }),
                // Update user's total XP
                prisma.user.update({
                    where: { id: userId },
                    data: {
                        xp: {
                            increment: badge.xpReward,
                        },
                    },
                }),
            ]);

            console.log(`[Badge] Awarded badge ${badge.name} to user ${userId}`);
            return userBadge;
        } catch (error) {
            console.error('[Badge] Error awarding badge:', error);
            return null;
        }
    }

    /**
     * Get user's badges
     */
    static async getUserBadges(userId: string): Promise<
        Array<
            UserBadge & {
                badge: Badge;
            }
        >
    > {
        return prisma.userBadge.findMany({
            where: { userId },
            include: { badge: true },
            orderBy: { earnedAt: 'desc' },
        });
    }

    /**
     * Check if user has a badge
     */
    static async hasUserBadge(userId: string, badgeId: string): Promise<boolean> {
        const userBadge = await prisma.userBadge.findUnique({
            where: {
                userId_badgeId: {
                    userId,
                    badgeId,
                },
            },
        });
        return !!userBadge;
    }

    /**
     * Update badge progress for progressive badges
     */
    static async updateBadgeProgress(
        userId: string,
        badgeId: string,
        progress: number
    ): Promise<UserBadge | null> {
        try {
            // Check if user has this badge
            const userBadge = await prisma.userBadge.findUnique({
                where: {
                    userId_badgeId: {
                        userId,
                        badgeId,
                    },
                },
            });

            if (!userBadge) {
                // Create new badge entry with progress
                return prisma.userBadge.create({
                    data: {
                        userId,
                        badgeId,
                        progress,
                    },
                });
            }

            // Update existing badges progress
            return prisma.userBadge.update({
                where: {
                    userId_badgeId: {
                        userId,
                        badgeId,
                    },
                },
                data: { progress },
            });
        } catch (error) {
            console.error('[Badge] Error updating badge progress:', error);
            return null;
        }
    }

    /**
     * Check and award project-related badges
     */
    static async checkProjectBadges(userId: string): Promise<UserBadge[]> {
        const awarded: UserBadge[] = [];

        try {
            // Get user's project count
            const projectCount = await prisma.project.count({
                where: {
                    OR: [
                        { ownerId: userId },
                        { members: { some: { userId } } },
                    ],
                },
            });

            // Get all project badges
            const projectBadges = await this.getBadgesByCategory('PROJECT');

            for (const badge of projectBadges) {
                const criteria = JSON.parse(badge.criteria);

                if (criteria.minProjects && projectCount >= criteria.minProjects) {
                    const result = await this.awardBadge(userId, badge.id);
                    if (result) awarded.push(result);
                }
            }
        } catch (error) {
            console.error('[Badge] Error checking project badges:', error);
        }

        return awarded;
    }

    /**
     * Check and award event-related badges
     */
    static async checkEventBadges(userId: string): Promise<UserBadge[]> {
        const awarded: UserBadge[] = [];

        try {
            // Get user's event attendance count
            const eventCount = await prisma.eventAttendee.count({
                where: { userId },
            });

            // Get event streak
            const user = await prisma.user.findUnique({
                where: { id: userId },
                select: { currentStreak: true },
            });

            // Get all event badges
            const eventBadges = await this.getBadgesByCategory('EVENT');

            for (const badge of eventBadges) {
                const criteria = JSON.parse(badge.criteria);

                if (criteria.minEvents && eventCount >= criteria.minEvents) {
                    const result = await this.awardBadge(userId, badge.id);
                    if (result) awarded.push(result);
                }

                if (
                    criteria.minStreak &&
                    user &&
                    user.currentStreak >= criteria.minStreak
                ) {
                    const result = await this.awardBadge(userId, badge.id);
                    if (result) awarded.push(result);
                }
            }
        } catch (error) {
            console.error('[Badge] Error checking event badges:', error);
        }

        return awarded;
    }

    /**
     * Check and award mentor-related badges
     */
    static async checkMentorBadges(userId: string): Promise<UserBadge[]> {
        const awarded: UserBadge[] = [];

        try {
            // Get user's mentor session count
            const sessionCount = await prisma.mentorSession.count({
                where: { studentId: userId },
            });

            // Get all mentor badges
            const mentorBadges = await this.getBadgesByCategory('MENTOR');

            for (const badge of mentorBadges) {
                const criteria = JSON.parse(badge.criteria);

                if (criteria.minSessions && sessionCount >= criteria.minSessions) {
                    const result = await this.awardBadge(userId, badge.id);
                    if (result) awarded.push(result);
                }
            }
        } catch (error) {
            console.error('[Badge] Error checking mentor badges:', error);
        }

        return awarded;
    }

    /**
     * Check and award streak-related badges
     */
    static async checkStreakBadges(userId: string): Promise<UserBadge[]> {
        const awarded: UserBadge[] = [];

        try {
            const user = await prisma.user.findUnique({
                where: { id: userId },
                select: { currentStreak: true, longestStreak: true },
            });

            if (!user) return awarded;

            // Get all streak badges
            const streakBadges = await this.getBadgesByCategory('STREAK');

            for (const badge of streakBadges) {
                const criteria = JSON.parse(badge.criteria);

                if (
                    criteria.reqStreak &&
                    (user.currentStreak >= criteria.reqStreak ||
                        user.longestStreak >= criteria.reqStreak)
                ) {
                    const result = await this.awardBadge(userId, badge.id);
                    if (result) awarded.push(result);
                }
            }
        } catch (error) {
            console.error('[Badge] Error checking streak badges:', error);
        }

        return awarded;
    }

    /**
     * Check all badge criteria for a user
     */
    static async checkAndAwardBadges(userId: string): Promise<UserBadge[]> {
        const allAwarded: UserBadge[] = [];

        const [projectBadges, eventBadges, mentorBadges, streakBadges] =
            await Promise.all([
                this.checkProjectBadges(userId),
                this.checkEventBadges(userId),
                this.checkMentorBadges(userId),
                this.checkStreakBadges(userId),
            ]);

        allAwarded.push(
            ...projectBadges,
            ...eventBadges,
            ...mentorBadges,
            ...streakBadges
        );

        return allAwarded;
    }

    /**
     * Get badge statistics for a user
     */
    static async getUserBadgeStats(userId: string): Promise<{
        total: number;
        byCategory: Record<BadgeCategory, number>;
        byRarity: Record<BadgeRarity, number>;
        recentBadges: Array<UserBadge & { badge: Badge }>;
    }> {
        const userBadges = await this.getUserBadges(userId);

        const stats = {
            total: userBadges.length,
            byCategory: {} as Record<BadgeCategory, number>,
            byRarity: {} as Record<BadgeRarity, number>,
            recentBadges: userBadges.slice(0, 5),
        };

        for (const ub of userBadges) {
            stats.byCategory[ub.badge.category] =
                (stats.byCategory[ub.badge.category] || 0) + 1;
            stats.byRarity[ub.badge.rarity] =
                (stats.byRarity[ub.badge.rarity] || 0) + 1;
        }

        return stats;
    }
}
