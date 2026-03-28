import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { NotFoundError } from "@/lib/utils/errors";
import { cacheService, CacheKeys, CacheTTL } from "./cache.service";

/**
 * User service layer for managing user operations
 */
export class UserService {
  /**
   * List users with pagination and filtering
   */
  async listUsers(params: {
    page?: number;
    pageSize?: number;
    role?: string;
    search?: string;
  }) {
    const { page = 1, pageSize = 10, role, search } = params;

    const where: Prisma.UserWhereInput = {};

    if (role) {
      where.role = role as any;
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
      ];
    }

    const [users, totalCount] = await Promise.all([
      prisma.user.findMany({
        where,
        select: {
          id: true,
          name: true,
          email: true,
          image: true,
          role: true,
          xp: true,
          level: true,
          bio: true,
          createdAt: true,
          updatedAt: true,
        },
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy: { createdAt: "desc" },
      }),
      prisma.user.count({ where }),
    ]);

    return {
      users,
      pagination: {
        page,
        pageSize,
        totalCount,
        totalPages: Math.ceil(totalCount / pageSize),
      },
    };
  }

  /**
   * Get user by ID
   */
  async getUserById(id: string) {
    // Try to get from cache first
    const cacheKey = CacheKeys.user.profile(id);
    
    return await cacheService.getOrSet(
      cacheKey,
      async () => {
        const user = await prisma.user.findUnique({
          where: { id },
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
            role: true,
            xp: true,
            level: true,
            bio: true,
            createdAt: true,
            updatedAt: true,
          },
        });

        if (!user) {
          throw new NotFoundError("User");
        }

        return user;
      },
      CacheTTL.USER_PROFILE
    );
  }

  /**
   * Update user profile
   */
  async updateUser(
    id: string,
    data: {
      name?: string;
      bio?: string;
      image?: string;
    }
  ) {
    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { id },
    });

    if (!existingUser) {
      throw new NotFoundError("User");
    }

    const updatedUser = await prisma.user.update({
      where: { id },
      data,
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        role: true,
        xp: true,
        level: true,
        bio: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    // Invalidate user cache after update
    await cacheService.invalidate(CacheKeys.user.all(id));

    return updatedUser;
  }

  /**
   * Get user statistics
   */
  async getUserStats(id: string) {
    // Process pending event XP asynchronously to award XP for passed events
    this.processPendingEventXP(id).catch((err) => console.error(err));

    // Try to get from cache first
    const cacheKey = CacheKeys.user.stats(id);
    
    return await cacheService.getOrSet(
      cacheKey,
      async () => {
        // Check if user exists
        const user = await prisma.user.findUnique({
          where: { id },
          select: {
            id: true,
            name: true,
            xp: true,
            level: true,
          },
        });

        if (!user) {
          throw new NotFoundError("User");
        }

        // Get counts for various user activities
        const [
          projectsOwned,
          projectsJoined,
          eventsAttending,
          blogPostsAuthored,
          meetingsCreated,
        ] = await Promise.all([
          prisma.project.count({
            where: { ownerId: id },
          }),
          prisma.projectMember.count({
            where: { userId: id },
          }),
          prisma.eventAttendee.count({
            where: { 
              userId: id,
              status: {
                not: "CANCELLED"
              }
            },
          }),
          prisma.blogPost.count({
            where: { authorId: id },
          }),
          prisma.meeting.count({
            where: { creatorId: id },
          }),
        ]);

        return {
          user: {
            id: user.id,
            name: user.name,
            xp: user.xp,
            level: user.level,
          },
          stats: {
            projectsOwned,
            projectsJoined,
            totalProjects: projectsOwned + projectsJoined,
            eventsAttending,
            blogPostsAuthored,
            meetingsCreated,
          },
        };
      },
      CacheTTL.USER_STATS
    );
  }

  /**
   * Process pending XP for past events the user attended
   * This is called lazily when user stats are fetched
   */
  async processPendingEventXP(userId: string) {
    try {
      // Find all event registrations for this user where the event has passed
      // and XP hasn't been awarded yet, and status is not CANCELLED
      const now = new Date();
      const pendingRegistrations = await prisma.eventAttendee.findMany({
        where: {
          userId,
          xpAwarded: false,
          status: { not: "CANCELLED" },
          event: {
            OR: [
              { endDate: { lte: now } },
              { 
                AND: [
                  { endDate: null },
                  { date: { lte: now } }
                ]
              }
            ]
          }
        },
        include: {
          event: {
            select: {
              title: true
            }
          }
        }
      });

      if (pendingRegistrations.length === 0) {
        return;
      }

      // Process each pending registration
      const { awardXP, XP_REWARDS } = await import("@/lib/utils/xp");
      
      for (const reg of pendingRegistrations) {
        // Award 25 XP
        await awardXP(
          userId,
          XP_REWARDS.EVENT_ATTENDANCE,
          `Attended event: ${reg.event.title}`
        );

        // Mark as awarded
        await prisma.eventAttendee.update({
          where: { id: reg.id },
          data: { xpAwarded: true }
        });
      }
      
      // Invalidate user caches since their XP changed
      await cacheService.invalidate(CacheKeys.user.all(userId));
    } catch (error) {
      console.error("Failed to process pending event XP:", error);
    }
  }
}

export const userService = new UserService();
