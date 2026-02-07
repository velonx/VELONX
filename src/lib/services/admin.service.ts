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
    
    // If this is an account approval request, activate the user account
    // (In this implementation, users are already active by default)
    // You could add additional logic here if needed
    
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
    ]);
    
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
    };
  }
  
  /**
   * Log a moderation action
   * This is a placeholder for future implementation
   * In a real system, you would create a ModerationLog model
   */
  async logModerationAction(params: {
    adminId: string;
    action: string;
    targetType: string;
    targetId: string;
    reason?: string;
  }) {
    // For now, we'll just return the action details
    // In a production system, you would store this in a ModerationLog table
    const logEntry = {
      id: `log_${Date.now()}`,
      adminId: params.adminId,
      action: params.action,
      targetType: params.targetType,
      targetId: params.targetId,
      reason: params.reason,
      timestamp: new Date(),
    };
    
    // TODO: Store in database when ModerationLog model is added
    console.log("Moderation action logged:", logEntry);
    
    return logEntry;
  }
}

// Export singleton instance
export const adminService = new AdminService();
