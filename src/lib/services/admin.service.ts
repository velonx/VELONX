import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { NotFoundError } from "@/lib/utils/errors";
import { notificationService } from "./notification.service";

/**
 * Admin Service
 * Handles all business logic for admin operations
 */
export class AdminService {
  /**
   * List user requests with pagination and filtering
   */
  async listUserRequests(params: {
    page?: number;
    pageSize?: number;
    type?: string;
    status?: string;
  }) {
    const { page = 1, pageSize = 10, type, status } = params;

    // Build where clause for filtering
    const where: Prisma.UserRequestWhereInput = {};

    if (type) {
      where.type = type as any;
    }

    if (status) {
      where.status = status as any;
    }

    // First, get all user IDs to check which ones exist
    const allUserIds = await prisma.user.findMany({
      select: { id: true },
    });
    const validUserIds = new Set(allUserIds.map(u => u.id));

    // Add filter to only get requests with valid users
    where.userId = {
      in: Array.from(validUserIds),
    };

    // Execute query with pagination
    const [requests, totalCount] = await Promise.all([
      prisma.userRequest.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              image: true,
              role: true,
            },
          },
        },
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy: {
          createdAt: "desc",
        },
      }),
      prisma.userRequest.count({ where }),
    ]);

    return {
      requests,
      pagination: {
        page,
        pageSize,
        totalCount,
        totalPages: Math.ceil(totalCount / pageSize),
      },
    };
  }

  /**
   * Approve a user request
   */
  async approveRequest(requestId: string, adminId: string) {
    // Check if request exists
    const request = await prisma.userRequest.findUnique({
      where: { id: requestId },
      include: {
        user: true,
      },
    });

    if (!request) {
      throw new NotFoundError("User request");
    }

    // Handle mentor application approval
    if (request.type === 'MENTOR_APPLICATION' && request.reason) {
      try {
        // Parse mentor application data from reason field
        const mentorData = JSON.parse(request.reason);

        // Create mentor record
        await prisma.mentor.create({
          data: {
            name: mentorData.name || request.user.name || 'Unknown',
            email: mentorData.email || request.user.email,
            company: mentorData.company || 'Not specified',
            expertise: mentorData.expertise || [],
            bio: mentorData.bio || '',
            imageUrl: mentorData.imageUrl || request.user.image,
            linkedinUrl: mentorData.linkedinUrl || null,
            githubUrl: mentorData.githubUrl || null,
            twitterUrl: mentorData.twitterUrl || null,
            rating: 0,
            totalSessions: 0,
            available: true,
          },
        });

        // Create success notification
        await notificationService.createNotification({
          userId: request.userId,
          title: 'Mentor Application Approved',
          description: 'Congratulations! Your mentor application has been approved. You can now start accepting mentorship sessions.',
          type: 'SUCCESS',
        });
      } catch (error) {
        console.error('Failed to create mentor record:', error);
        throw new Error('Failed to process mentor application approval');
      }
    }

    // Update request status to APPROVED
    const updatedRequest = await prisma.userRequest.update({
      where: { id: requestId },
      data: {
        status: "APPROVED",
        reviewedBy: adminId,
        reviewedAt: new Date(),
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
            role: true,
          },
        },
      },
    });

    return updatedRequest;
  }

  /**
   * Reject a user request
   */
  async rejectRequest(requestId: string, adminId: string, reason?: string) {
    // Check if request exists
    const request = await prisma.userRequest.findUnique({
      where: { id: requestId },
    });

    if (!request) {
      throw new NotFoundError("User request");
    }

    // Update request status to REJECTED
    const updatedRequest = await prisma.userRequest.update({
      where: { id: requestId },
      data: {
        status: "REJECTED",
        reason: reason || "Request rejected by admin",
        reviewedBy: adminId,
        reviewedAt: new Date(),
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
            role: true,
          },
        },
      },
    });

    // Create notification for project rejection
    if (request.type === 'PROJECT_SUBMISSION') {
      try {
        const projectData = JSON.parse(request.reason || '{}');
        await notificationService.createProjectRejectedNotification({
          projectId: requestId, // Using request ID as project ID since project wasn't created
          ownerId: request.userId,
          projectTitle: projectData.title || 'Your project',
          reason: reason,
        });
      } catch (error) {
        console.error('Failed to create project rejected notification:', error);
        // Don't fail the rejection if notification fails
      }
    }

    return updatedRequest;
  }

  /**
   * Get platform statistics
   */
  async getPlatformStats() {
    // Get counts for various entities
    const [
      totalUsers,
      totalStudents,
      totalAdmins,
      totalEvents,
      totalProjects,
      totalMentors,
      totalResources,
      totalBlogPosts,
      totalMeetings,
      pendingRequests,
      unverifiedUsersList,
      unverifiedCredentialsUsers,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { role: "STUDENT" } }),
      prisma.user.count({ where: { role: "ADMIN" } }),
      prisma.event.count(),
      prisma.project.count(),
      prisma.mentor.count(),
      prisma.resource.count(),
      prisma.blogPost.count(),
      prisma.meeting.count(),
      prisma.userRequest.count({ where: { status: "PENDING" } }),
      prisma.user.findMany({
        where: { emailVerified: null },
        select: {
          id: true,
          accounts: {
            select: {
              provider: true,
            },
          },
        },
      }),
      prisma.user.findMany({
        where: {
          emailVerified: null,
          accounts: {
            none: {},
          },
        },
        select: {
          id: true,
          name: true,
          email: true,
          createdAt: true,
        },
        orderBy: {
          createdAt: "desc",
        },
      }),
    ]);

    let emailUnverified = 0;
    let googleUnverified = 0;
    let githubUnverified = 0;

    for (const u of unverifiedUsersList) {
      if (u.accounts.length === 0) {
        emailUnverified++;
      } else {
        const providers = u.accounts.map(a => a.provider);
        if (providers.includes("google")) {
          googleUnverified++;
        } else if (providers.includes("github")) {
          githubUnverified++;
        } else {
          emailUnverified++;
        }
      }
    }

    // Get recent activity counts (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const [
      recentUsers,
      recentEvents,
      recentProjects,
      recentBlogPosts,
    ] = await Promise.all([
      prisma.user.count({
        where: {
          createdAt: {
            gte: thirtyDaysAgo,
          },
        },
      }),
      prisma.event.count({
        where: {
          createdAt: {
            gte: thirtyDaysAgo,
          },
        },
      }),
      prisma.project.count({
        where: {
          createdAt: {
            gte: thirtyDaysAgo,
          },
        },
      }),
      prisma.blogPost.count({
        where: {
          createdAt: {
            gte: thirtyDaysAgo,
          },
        },
      }),
    ]);

    return {
      overview: {
        totalUsers,
        totalStudents,
        totalAdmins,
        totalEvents,
        totalProjects,
        totalMentors,
        totalResources,
        totalBlogPosts,
        totalMeetings,
        pendingRequests,
      },
      recentActivity: {
        newUsers: recentUsers,
        newEvents: recentEvents,
        newProjects: recentProjects,
        newBlogPosts: recentBlogPosts,
      },
      unverifiedStats: {
        email: emailUnverified,
        google: googleUnverified,
        github: githubUnverified,
        total: unverifiedUsersList.length,
        users: unverifiedCredentialsUsers,
      },
    };
  }

  /**
   * Log a moderation action
   */
  async logModerationAction(params: {
    adminId: string;
    action: string;
    targetType: string;
    targetId: string;
    reason?: string;
  }) {
    try {
      const logEntry = await prisma.moderationLog.create({
        data: {
          moderatorId: params.adminId,
          targetId: params.targetId,
          type: params.action as any,
          reason: params.reason,
          metadata: {
            targetType: params.targetType
          }
        }
      });

      return {
        id: logEntry.id,
        adminId: params.adminId,
        action: params.action,
        targetType: params.targetType,
        targetId: params.targetId,
        reason: params.reason,
        timestamp: logEntry.createdAt,
      };
    } catch (error) {
      console.error("Failed to log moderation action:", error);
      // Fallback if action is an invalid enum or DB fails
      return {
        id: `log_${Date.now()}`,
        adminId: params.adminId,
        action: params.action,
        targetType: params.targetType,
        targetId: params.targetId,
        reason: params.reason,
        timestamp: new Date(),
      };
    }
  }
}

// Export singleton instance
export const adminService = new AdminService();
