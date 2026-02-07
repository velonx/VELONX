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
            where: { userId: id },
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
}

export const userService = new UserService();
