import { prisma } from '@/lib/prisma';
import { LeaderboardPeriod, LeaderboardSnapshot } from '@prisma/client';

/**
 * Enhanced Leaderboard Service - Manages leaderboards, rankings, and snapshots
 * Supports multiple period types and comprehensive statistics
 */
export class LeaderboardService {
  /**
   * Get leaderboard for a specific period
   */
  static async getLeaderboard(
    period: LeaderboardPeriod,
    limit: number = 100
  ): Promise<
    Array<{
      rank: number;
      id: string;
      name: string | null;
      email: string;
      image: string | null;
      xp: number;
      level: number;
      currentStreak: number;
      badges: number;
      projects: number;
    }>
  > {
    const { startDate, endDate } = this.getPeriodDates(period);

    if (period === 'ALL_TIME') {
      // For all-time, just use total XP
      return this.getAllTimeLeaderboard(limit);
    }

    // For time-limited periods, calculate XP earned in period
    return this.getPeriodLeaderboard(startDate, endDate, limit);
  }

  /**
   * Get all-time leaderboard
   */
  private static async getAllTimeLeaderboard(limit: number): Promise<
    Array<{
      rank: number;
      id: string;
      name: string | null;
      email: string;
      image: string | null;
      xp: number;
      level: number;
      currentStreak: number;
      badges: number;
      projects: number;
    }>
  > {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        xp: true,
        level: true,
        currentStreak: true,
        _count: {
          select: {
            badges: true,
            projectsOwned: true,
          },
        },
      },
      orderBy: { xp: 'desc' },
      take: limit,
    });

    return users.map((user, index) => ({
      rank: index + 1,
      id: user.id,
      name: user.name,
      email: user.email,
      image: user.image,
      xp: user.xp,
      level: user.level,
      currentStreak: user.currentStreak,
      badges: user._count.badges,
      projects: user._count.projectsOwned,
    }));
  }

  /**
   * Get leaderboard for a specific time period
   */
  private static async getPeriodLeaderboard(
    startDate: Date,
    endDate: Date,
    limit: number
  ) {
    // Get XP transactions in period
    const xpTransactions = await prisma.xPTransaction.findMany({
      where: {
        timestamp: {
          gte: startDate,
          lte: endDate,
        },
      },
      select: {
        userId: true,
        amount: true,
      },
    });

    // Aggregate XP by user
    const userXP = new Map<string, number>();
    for (const tx of xpTransactions) {
      const current = userXP.get(tx.userId) || 0;
      userXP.set(tx.userId, current + tx.amount);
    }

    // Get user IDs sorted by XP
    const sortedUserIds = Array.from(userXP.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, limit)
      .map(([userId]) => userId);

    // Fetch user details
    const users = await prisma.user.findMany({
      where: {
        id: { in: sortedUserIds },
      },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        xp: true,
        level: true,
        currentStreak: true,
        _count: {
          select: {
            badges: true,
            projectsOwned: true,
          },
        },
      },
    });

    // Map to leaderboard format
    return sortedUserIds.map((userId, index) => {
      const user = users.find((u) => u.id === userId)!;
      return {
        rank: index + 1,
        id: user.id,
        name: user.name,
        email: user.email,
        image: user.image,
        xp: userXP.get(userId) || 0, // Period XP
        level: user.level,
        currentStreak: user.currentStreak,
        badges: user._count.badges,
        projects: user._count.projectsOwned,
      };
    });
  }

  /**
   * Get user's rank in leaderboard
   */
  static async getUserRank(
    userId: string,
    period: LeaderboardPeriod
  ): Promise<{
    rank: number | null;
    totalUsers: number;
    xp: number;
  }> {
    const { startDate, endDate } = this.getPeriodDates(period);

    if (period === 'ALL_TIME') {
      // Count users with more XP
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { xp: true },
      });

      if (!user) {
        return { rank: null, totalUsers: 0, xp: 0 };
      }

      const rank = await prisma.user.count({
        where: {
          xp: { gt: user.xp },
        },
      });

      const totalUsers = await prisma.user.count();

      return { rank: rank + 1, totalUsers, xp: user.xp };
    }

    // For period leaderboards
    const leaderboard = await this.getPeriodLeaderboard(startDate, endDate, 10000);
    const userEntry = leaderboard.find((entry) => entry.id === userId);

    return {
      rank: userEntry ? userEntry.rank : null,
      totalUsers: leaderboard.length,
      xp: userEntry ? userEntry.xp : 0,
    };
  }

  /**
   * Get nearby users in leaderboard
   */
  static async getNearbyUsers(
    userId: string,
    period: LeaderboardPeriod,
    range: number = 5
  ) {
    const { rank } = await this.getUserRank(userId, period);

    if (!rank) {
      return [];
    }

    const leaderboard = await this.getLeaderboard(period, 10000);
    const startIndex = Math.max(0, rank - range - 1);
    const endIndex = Math.min(leaderboard.length, rank + range);

    return leaderboard.slice(startIndex, endIndex);
  }

  /**
   * Create leaderboard snapshot
   */
  static async createSnapshot(period: LeaderboardPeriod): Promise<LeaderboardSnapshot> {
    const { startDate, endDate } = this.getPeriodDates(period);
    const leaderboard = await this.getLeaderboard(period, 100);

    return prisma.leaderboardSnapshot.create({
      data: {
        period,
        startDate,
        endDate,
        data: JSON.stringify(leaderboard),
      },
    });
  }

  /**
   * Get historical snapshot
   */
  static async getHistoricalSnapshot(
    period: LeaderboardPeriod,
    date: Date
  ): Promise<LeaderboardSnapshot | null> {
    return prisma.leaderboardSnapshot.findFirst({
      where: {
        period,
        startDate: { lte: date },
        endDate: { gte: date },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Get period date ranges
   */
  private static getPeriodDates(period: LeaderboardPeriod): {
    startDate: Date;
    endDate: Date;
  } {
    const now = new Date();
    const endDate = new Date(now);

    let startDate: Date;

    switch (period) {
      case 'DAILY':
        startDate = new Date(now);
        startDate.setHours(0, 0, 0, 0);
        endDate.setHours(23, 59, 59, 999);
        break;

      case 'WEEKLY':
        startDate = new Date(now);
        const day = startDate.getDay();
        const diff = day === 0 ? 6 : day - 1; // Monday is first day
        startDate.setDate(startDate.getDate() - diff);
        startDate.setHours(0, 0, 0, 0);
        endDate.setDate(startDate.getDate() + 6);
        endDate.setHours(23, 59, 59, 999);
        break;

      case 'MONTHLY':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        endDate.setMonth(endDate.getMonth() + 1, 0);
        endDate.setHours(23, 59, 59, 999);
        break;

      case 'ALL_TIME':
      default:
        startDate = new Date(0); // Unix epoch
        break;
    }

    return { startDate, endDate };
  }

  /**
   * Get leaderboard statistics
   */
  static async getLeaderboardStats(period: LeaderboardPeriod): Promise<{
    totalUsers: number;
    totalXP: number;
    averageXP: number;
    topUser: {
      id: string;
      name: string | null;
      xp: number;
    } | null;
  }> {
    const leaderboard = await this.getLeaderboard(period, 10000);

    if (leaderboard.length === 0) {
      return {
        totalUsers: 0,
        totalXP: 0,
        averageXP: 0,
        topUser: null,
      };
    }

    const totalXP = leaderboard.reduce((sum, user) => sum + user.xp, 0);
    const topUser = leaderboard[0];

    return {
      totalUsers: leaderboard.length,
      totalXP,
      averageXP: Math.floor(totalXP / leaderboard.length),
      topUser: {
        id: topUser.id,
        name: topUser.name,
        xp: topUser.xp,
      },
    };
  }
}

// Keep legacy export for backward compatibility
export const leaderboardService = {
  getLeaderboard: (params: any) => LeaderboardService.getLeaderboard('ALL_TIME', params.pageSize || 10),
  getUserRank: (userId: string) => LeaderboardService.getUserRank(userId, 'ALL_TIME'),
};
