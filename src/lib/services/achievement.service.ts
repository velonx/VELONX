import { prisma } from '@/lib/prisma';
import { Achievement, AchievementType } from '@prisma/client';

/**
 * Achievement Service - Manages user achievements
 */
export class AchievementService {
    /**
     * Record a new achievement
     */
    static async recordAchievement(
        userId: string,
        type: AchievementType,
        options?: {
            title?: string;
            description?: string;
            xpEarned?: number;
            metadata?: any;
        }
    ): Promise<Achievement | null> {
        try {
            const { title, description, xpEarned = 0, metadata } = options || {};

            const achievement = await prisma.achievement.create({
                data: {
                    userId,
                    type,
                    title: title || this.getDefaultTitle(type),
                    description: description || this.getDefaultDescription(type),
                    xpEarned,
                    metadata: metadata ? JSON.stringify(metadata) : null,
                },
            });

            console.log(`[Achievement] Recorded achievement ${type} for user ${userId}`);

            // Send notification
            await this.notifyAchievement(userId, achievement);

            return achievement;
        } catch (error) {
            console.error('[Achievement] Error recording achievement:', error);
            return null;
        }
    }

    /**
     * Get default title for achievement type
     */
    private static getDefaultTitle(type: AchievementType): string {
        const titles: Record<AchievementType, string> = {
            FIRST_PROJECT: 'First Project',
            FIRST_EVENT: 'Event Newbie',
            FIRST_MENTOR_SESSION: 'Mentorship Begins',
            PROJECT_COMPLETION: 'Project Complete',
            EVENT_STREAK: 'Event Streak',
            COLLABORATION: 'Team Player',
            REFERRAL: 'Community Builder',
            CUSTOM: 'Achievement Unlocked',
        };

        return titles[type] || 'Achievement';
    }

    /**
     * Get default description for achievement type
     */
    private static getDefaultDescription(type: AchievementType): string {
        const descriptions: Record<AchievementType, string> = {
            FIRST_PROJECT: 'Submitted your first project',
            FIRST_EVENT: 'Attended your first event',
            FIRST_MENTOR_SESSION: 'Completed your first mentor session',
            PROJECT_COMPLETION: 'Successfully completed a project',
            EVENT_STREAK: 'Maintained an event attendance streak',
            COLLABORATION: 'Collaborated with other members',
            REFERRAL: 'Referred a new member to the community',
            CUSTOM: 'Achieved something special',
        };

        return descriptions[type] || 'Unlocked an achievement';
    }

    /**
     * Get user's achievements
     */
    static async getUserAchievements(
        userId: string,
        limit?: number
    ): Promise<Achievement[]> {
        return prisma.achievement.findMany({
            where: { userId },
            orderBy: { timestamp: 'desc' },
            take: limit,
        });
    }

    /**
     * Get recent achievements across all users
     */
    static async getRecentAchievements(limit: number = 50): Promise<
        Array<
            Achievement & {
                user: {
                    id: string;
                    name: string | null;
                    email: string;
                    image: string | null;
                };
            }
        >
    > {
        return prisma.achievement.findMany({
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        image: true,
                    },
                },
            },
            orderBy: { timestamp: 'desc' },
            take: limit,
        });
    }

    /**
     * Check if this is a first-time achievement for the user
     */
    static async checkFirstTimeAchievement(
        userId: string,
        type: string
    ): Promise<boolean> {
        const existingCount = await prisma.achievement.count({
            where: {
                userId,
                type: type as AchievementType,
            },
        });

        return existingCount === 0;
    }

    /**
     * Send notification for achievement
     */
    static async notifyAchievement(
        userId: string,
        achievement: Achievement
    ): Promise<void> {
        try {
            await prisma.notification.create({
                data: {
                    userId,
                    type: 'AWARD',
                    title: `🏆 ${achievement.title}`,
                    message: achievement.description,
                    link: '/profile', // Link to profile achievements
                    read: false,
                },
            });

            console.log(`[Achievement] Notification sent for achievement ${achievement.id}`);
        } catch (error) {
            console.error('[Achievement] Error sending notification:', error);
        }
    }

    /**
     * Get achievement statistics for a user
     */
    static async getUserAchievementStats(userId: string): Promise<{
        total: number;
        byType: Partial<Record<AchievementType, number>>;
        totalXPEarned: number;
        recentAchievements: Achievement[];
    }> {
        const achievements = await this.getUserAchievements(userId);

        const stats: {
            total: number;
            byType: Partial<Record<AchievementType, number>>;
            totalXPEarned: number;
            recentAchievements: Achievement[];
        } = {
            total: achievements.length,
            byType: {},
            totalXPEarned: 0,
            recentAchievements: achievements.slice(0, 5),
        };

        for (const achievement of achievements) {
            stats.byType[achievement.type] = (stats.byType[achievement.type] || 0) + 1;
            stats.totalXPEarned += achievement.xpEarned;
        }

        return stats;
    }

    /**
     * Trigger achievement checks based on user activity
     */
    static async checkAchievements(
        userId: string,
        activityType: 'project' | 'event' | 'mentor' | 'referral'
    ): Promise<Achievement[]> {
        const awarded: Achievement[] = [];

        try {
            switch (activityType) {
                case 'project':
                    await this.checkProjectAchievements(userId, awarded);
                    break;
                case 'event':
                    await this.checkEventAchievements(userId, awarded);
                    break;
                case 'mentor':
                    await this.checkMentorAchievements(userId, awarded);
                    break;
                case 'referral':
                    await this.checkReferralAchievements(userId, awarded);
                    break;
            }
        } catch (error) {
            console.error('[Achievement] Error checking achievements:', error);
        }

        return awarded;
    }

    /**
     * Check project-related achievements
     */
    private static async checkProjectAchievements(
        userId: string,
        awarded: Achievement[]
    ): Promise<void> {
        // Check first project
        if (await this.checkFirstTimeAchievement(userId, 'FIRST_PROJECT')) {
            const projectCount = await prisma.project.count({
                where: {
                    OR: [{ ownerId: userId }, { members: { some: { userId } } }],
                },
            });

            if (projectCount === 1) {
                const achievement = await this.recordAchievement(userId, 'FIRST_PROJECT', {
                    xpEarned: 50,
                });
                if (achievement) awarded.push(achievement);
            }
        }
    }

    /**
     * Check event-related achievements
     */
    private static async checkEventAchievements(
        userId: string,
        awarded: Achievement[]
    ): Promise<void> {
        // Check first event
        if (await this.checkFirstTimeAchievement(userId, 'FIRST_EVENT')) {
            const eventCount = await prisma.eventAttendee.count({
                where: { userId },
            });

            if (eventCount === 1) {
                const achievement = await this.recordAchievement(userId, 'FIRST_EVENT', {
                    xpEarned: 25,
                });
                if (achievement) awarded.push(achievement);
            }
        }

        // Check event streak
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: { currentStreak: true },
        });

        if (user && user.currentStreak >= 3) {
            const streakAchievement = await this.recordAchievement(userId, 'EVENT_STREAK', {
                title: `${user.currentStreak}-Day Streak`,
                description: `Maintained a ${user.currentStreak}-day login streak`,
                xpEarned: user.currentStreak * 5,
                metadata: { streak: user.currentStreak },
            });
            if (streakAchievement) awarded.push(streakAchievement);
        }
    }

    /**
     * Check mentor-related achievements
     */
    private static async checkMentorAchievements(
        userId: string,
        awarded: Achievement[]
    ): Promise<void> {
        // Check first mentor session
        if (await this.checkFirstTimeAchievement(userId, 'FIRST_MENTOR_SESSION')) {
            const sessionCount = await prisma.mentorSession.count({
                where: { studentId: userId },
            });

            if (sessionCount === 1) {
                const achievement = await this.recordAchievement(
                    userId,
                    'FIRST_MENTOR_SESSION',
                    {
                        xpEarned: 30,
                    }
                );
                if (achievement) awarded.push(achievement);
            }
        }
    }

    /**
     * Check referral achievements
     */
    private static async checkReferralAchievements(
        userId: string,
        awarded: Achievement[]
    ): Promise<void> {
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: { referralCount: true },
        });

        if (user && user.referralCount > 0) {
            const achievement = await this.recordAchievement(userId, 'REFERRAL', {
                title: 'Community Builder',
                description: `Referred ${user.referralCount} member${user.referralCount > 1 ? 's' : ''
                    } to VELONX`,
                xpEarned: user.referralCount * 100,
                metadata: { referralCount: user.referralCount },
            });
            if (achievement) awarded.push(achievement);
        }
    }
}
