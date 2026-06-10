import { prisma } from '@/lib/prisma';
import { BadgeCategory, Badge } from '@prisma/client';
import { XPService } from './xp.service';
import { NotificationService } from './notification.service';

const notificationService = new NotificationService();

export interface BadgeProgressEntry {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
  category: BadgeCategory;
  xpReward: number;
  rarity: string;
  criteria: string;
  earned: boolean;
  earnedAt: string | null;
  progress: {
    current: number;
    target: number;
    percent: number;
  };
}

export class BadgeService {
  /**
   * Evaluates and awards badges to a user in a specific category (or all categories)
   */
  static async evaluateAndAwardBadges(userId: string, category?: BadgeCategory): Promise<Badge[]> {
    try {
      // Fetch system badges
      const queryWhere: any = {};
      if (category) {
        queryWhere.category = category;
      }
      const allBadges = await prisma.badge.findMany({ where: queryWhere });

      // Fetch user's earned badges
      const earnedUserBadges = await prisma.userBadge.findMany({
        where: { userId, badge: category ? { category } : {} },
        include: { badge: true }
      });
      const earnedBadgeIds = new Set(earnedUserBadges.map(ub => ub.badgeId));

      // Gather counts for evaluation
      const projectCount = await prisma.project.count({
        where: {
          status: 'COMPLETED',
          OR: [
            { ownerId: userId },
            { members: { some: { userId } } }
          ]
        }
      });

      const questionCount = await prisma.communityPost.count({ where: { authorId: userId } });
      const commentCount = await prisma.postComment.count({ where: { authorId: userId } });
      const groupCount = await prisma.groupMember.count({ where: { userId } });
      const communityContributions = questionCount + commentCount;

      const blogReadCount = await prisma.blogPostRead.count({ where: { userId } });
      const jobAppCount = await prisma.opportunityApplication.count({ where: { userId } });
      
      const mockInterviewCount = await prisma.mockInterview.count({
        where: { userId, status: 'COMPLETED' }
      });

      const referralCount = await prisma.referralRelationship.count({ where: { referrerId: userId } });
      
      const mentorSessionCount = await prisma.mentorSession.count({
        where: { studentId: userId, status: 'COMPLETED' }
      });

      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { currentStreak: true, level: true }
      });
      const currentStreak = user?.currentStreak || 0;
      const currentLevel = user?.level || 1;

      const newlyUnlockedBadges: Badge[] = [];

      for (const badge of allBadges) {
        // Skip if already earned
        if (earnedBadgeIds.has(badge.id)) {
          continue;
        }

        let criteria: any = {};
        try {
          criteria = JSON.parse(badge.criteria);
        } catch (e) {
          criteria = {};
        }

        let qualifies = false;

        if (criteria.minProjects !== undefined && projectCount >= criteria.minProjects) {
          qualifies = true;
        }
        if (criteria.minQuestions !== undefined && questionCount >= criteria.minQuestions) {
          qualifies = true;
        }
        if (criteria.minComments !== undefined && commentCount >= criteria.minComments) {
          qualifies = true;
        }
        if (criteria.minGroups !== undefined && groupCount >= criteria.minGroups) {
          qualifies = true;
        }
        if (criteria.minContributions !== undefined && communityContributions >= criteria.minContributions) {
          qualifies = true;
        }
        if (criteria.minBlogReads !== undefined && blogReadCount >= criteria.minBlogReads) {
          qualifies = true;
        }
        if (criteria.minJobApplications !== undefined && jobAppCount >= criteria.minJobApplications) {
          qualifies = true;
        }
        if (criteria.minMockInterviews !== undefined && mockInterviewCount >= criteria.minMockInterviews) {
          qualifies = true;
        }
        if (criteria.minReferrals !== undefined && referralCount >= criteria.minReferrals) {
          qualifies = true;
        }
        if (criteria.minSessions !== undefined && mentorSessionCount >= criteria.minSessions) {
          qualifies = true;
        }
        if (criteria.reqStreak !== undefined && currentStreak >= criteria.reqStreak) {
          qualifies = true;
        }
        if (criteria.minLevel !== undefined && currentLevel >= criteria.minLevel) {
          qualifies = true;
        }

        if (qualifies) {
          // Unlock badge
          await prisma.userBadge.create({
            data: {
              userId,
              badgeId: badge.id,
              progress: 100
            }
          });

          // Award XP
          await XPService.addXP(userId, badge.xpReward, 'BADGE_UNLOCK', {
            badgeId: badge.id,
            badgeName: badge.name
          });

          // Send notification
          await notificationService.createNotification({
            userId,
            title: `🏆 Badge Unlocked: ${badge.name}`,
            description: `You've earned the "${badge.name}" badge and received ${badge.xpReward} XP!`,
            type: 'AWARD',
            actionUrl: `/dashboard/student?tab=overview`,
            metadata: {
              badgeId: badge.id,
              badgeName: badge.name,
              xpReward: badge.xpReward
            }
          });

          newlyUnlockedBadges.push(badge);
        }
      }

      return newlyUnlockedBadges;
    } catch (error) {
      console.error('[BadgeService] Error evaluating badges:', error);
      return [];
    }
  }

  /**
   * Fetches all badges, annotated with progress, percentage, and unlock status
   */
  static async getBadgesWithProgress(userId: string): Promise<BadgeProgressEntry[]> {
    try {
      // Get all badges
      const allBadges = await prisma.badge.findMany();

      // Get user's unlocked badges
      const userBadges = await prisma.userBadge.findMany({
        where: { userId }
      });
      const userBadgeMap = new Map(userBadges.map(ub => [ub.badgeId, ub]));

      // Gather current counts for progress calculation
      const projectCount = await prisma.project.count({
        where: {
          status: 'COMPLETED',
          OR: [
            { ownerId: userId },
            { members: { some: { userId } } }
          ]
        }
      });

      const questionCount = await prisma.communityPost.count({ where: { authorId: userId } });
      const commentCount = await prisma.postComment.count({ where: { authorId: userId } });
      const groupCount = await prisma.groupMember.count({ where: { userId } });
      const communityContributions = questionCount + commentCount;

      const blogReadCount = await prisma.blogPostRead.count({ where: { userId } });
      const jobAppCount = await prisma.opportunityApplication.count({ where: { userId } });
      
      const mockInterviewCount = await prisma.mockInterview.count({
        where: { userId, status: 'COMPLETED' }
      });

      const referralCount = await prisma.referralRelationship.count({ where: { referrerId: userId } });
      
      const mentorSessionCount = await prisma.mentorSession.count({
        where: { studentId: userId, status: 'COMPLETED' }
      });

      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { currentStreak: true, level: true }
      });
      const currentStreak = user?.currentStreak || 0;
      const currentLevel = user?.level || 1;

      return allBadges.map(badge => {
        const userBadge = userBadgeMap.get(badge.id);
        const earned = !!userBadge;
        const earnedAt = userBadge ? userBadge.earnedAt.toISOString() : null;

        let criteria: any = {};
        try {
          criteria = JSON.parse(badge.criteria);
        } catch (e) {
          criteria = {};
        }

        // Calculate progress numbers
        let current = 0;
        let target = 0;

        if (criteria.minProjects !== undefined) {
          current = projectCount;
          target = criteria.minProjects;
        } else if (criteria.minQuestions !== undefined) {
          current = questionCount;
          target = criteria.minQuestions;
        } else if (criteria.minComments !== undefined) {
          current = commentCount;
          target = criteria.minComments;
        } else if (criteria.minGroups !== undefined) {
          current = groupCount;
          target = criteria.minGroups;
        } else if (criteria.minContributions !== undefined) {
          current = communityContributions;
          target = criteria.minContributions;
        } else if (criteria.minBlogReads !== undefined) {
          current = blogReadCount;
          target = criteria.minBlogReads;
        } else if (criteria.minJobApplications !== undefined) {
          current = jobAppCount;
          target = criteria.minJobApplications;
        } else if (criteria.minMockInterviews !== undefined) {
          current = mockInterviewCount;
          target = criteria.minMockInterviews;
        } else if (criteria.minReferrals !== undefined) {
          current = referralCount;
          target = criteria.minReferrals;
        } else if (criteria.minSessions !== undefined) {
          current = mentorSessionCount;
          target = criteria.minSessions;
        } else if (criteria.reqStreak !== undefined) {
          current = currentStreak;
          target = criteria.reqStreak;
        } else if (criteria.minLevel !== undefined) {
          current = currentLevel;
          target = criteria.minLevel;
        }

        const percent = target > 0 ? Math.min(100, Math.floor((current / target) * 100)) : 100;

        return {
          id: badge.id,
          userBadgeId: userBadge ? userBadge.id : null,
          name: badge.name,
          description: badge.description,
          imageUrl: badge.imageUrl,
          category: badge.category,
          xpReward: badge.xpReward,
          rarity: badge.rarity,
          criteria: badge.criteria,
          earned,
          earnedAt,
          progress: {
            current,
            target,
            percent: earned ? 100 : percent
          }
        };
      });
    } catch (error) {
      console.error('[BadgeService] Error loading badges with progress:', error);
      return [];
    }
  }

  /**
   * Fetches full shareable details for a specific earned user badge
   */
  static async getShareableBadgeDetails(userBadgeId: string) {
    try {
      const userBadge = await prisma.userBadge.findUnique({
        where: { id: userBadgeId },
        include: {
          badge: true,
          user: {
            select: {
              name: true,
              image: true,
              level: true
            }
          }
        }
      });

      if (!userBadge) return null;

      return {
        id: userBadge.id,
        earnedAt: userBadge.earnedAt.toISOString(),
        studentName: userBadge.user.name || 'A Velonx Student',
        studentImage: userBadge.user.image,
        studentLevel: userBadge.user.level,
        badgeName: userBadge.badge.name,
        badgeDescription: userBadge.badge.description,
        badgeImageUrl: userBadge.badge.imageUrl,
        badgeCategory: userBadge.badge.category,
        badgeRarity: userBadge.badge.rarity,
        criteria: userBadge.badge.criteria
      };
    } catch (error) {
      console.error('[BadgeService] Error getting shareable badge details:', error);
      return null;
    }
  }
}
