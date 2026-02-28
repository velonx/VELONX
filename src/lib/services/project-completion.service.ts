import { prisma } from '@/lib/prisma';
import { XPService } from './xp.service';
import { NotificationService } from './notification.service';
import { AuditLogger } from './audit.service';
import { Project, ProjectMember, User } from '@prisma/client';
import { cacheService, CacheKeys } from './cache.service';

/**
 * Validation result for project completion
 */
export interface CompletionValidation {
  isValid: boolean;
  error?: {
    code: string;
    message: string;
  };
}

/**
 * Result of project completion operation
 */
export interface CompletionResult {
  project: Project;
  xpAwarded: {
    owner: number;
    members: number;
  };
  notificationsSent: number;
  auditLogId: string;
}

/**
 * ProjectCompletionService
 * Handles the workflow for marking projects as completed, including:
 * - Validation of completion eligibility
 * - Status updates
 * - XP rewards for team members
 * - Notifications
 * - Audit logging
 */
export class ProjectCompletionService {
  private notificationService: NotificationService;

  constructor() {
    this.notificationService = new NotificationService();
  }

  /**
   * Validates if a project can be completed
   * Validates: Requirements 8.1, 8.2, 8.3, 8.5
   */
  async validateCompletion(
    projectId: string,
    userId: string
  ): Promise<CompletionValidation> {
    try {
      // Validate project exists (Requirement 8.1)
      const project = await prisma.project.findUnique({
        where: { id: projectId },
        select: {
          id: true,
          status: true,
          ownerId: true,
        },
      });

      if (!project) {
        return {
          isValid: false,
          error: {
            code: 'PROJECT_NOT_FOUND',
            message: 'Project not found',
          },
        };
      }

      // Validate user is the project owner (Requirement 8.2)
      if (project.ownerId !== userId) {
        return {
          isValid: false,
          error: {
            code: 'UNAUTHORIZED',
            message: 'Only the project owner can mark the project as complete',
          },
        };
      }

      // Validate project status is IN_PROGRESS (Requirement 8.3)
      if (project.status !== 'IN_PROGRESS') {
        if (project.status === 'COMPLETED') {
          return {
            isValid: false,
            error: {
              code: 'ALREADY_COMPLETED',
              message: 'Project has already been marked as complete',
            },
          };
        }

        return {
          isValid: false,
          error: {
            code: 'INVALID_STATUS',
            message: 'Project must be in IN_PROGRESS status to be completed',
          },
        };
      }

      // All validations passed
      return { isValid: true };
    } catch (error) {
      console.error('[ProjectCompletion] Validation error:', error);
      return {
        isValid: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'An error occurred during validation',
        },
      };
    }
  }

  /**
   * Completes a project and triggers all related actions
   * Validates: Requirements 2.2, 2.3, 2.6
   */
  async completeProject(
    projectId: string,
    userId: string
  ): Promise<CompletionResult> {
    // Validate completion eligibility
    const validation = await this.validateCompletion(projectId, userId);
    if (!validation.isValid) {
      throw new Error(validation.error?.message || 'Validation failed');
    }

    // Fetch project with owner and members
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        members: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
      },
    });

    if (!project) {
      throw new Error('Project not found');
    }

    // Update project status to COMPLETED (Requirements 2.2, 2.3)
    const completedProject = await prisma.project.update({
      where: { id: projectId },
      data: {
        status: 'COMPLETED',
        completedAt: new Date(),
        completedBy: userId,
      },
    });

    // Define XP amounts
    const xpAwarded = {
      owner: 100,
      members: 75,
    };

    // Execute XP awards and notifications in parallel (Requirement 2.6)
    const [xpResults, notificationResults] = await Promise.allSettled([
      this.awardTeamXP(project, project.members, xpAwarded),
      this.notifyTeamMembers(project, project.members, xpAwarded),
    ]);

    // Log any failures but don't throw
    if (xpResults.status === 'rejected') {
      console.error('[ProjectCompletion] XP award failed:', xpResults.reason);
    }

    let notificationsSent = 0;
    if (notificationResults.status === 'fulfilled') {
      notificationsSent = notificationResults.value;
    } else {
      console.error('[ProjectCompletion] Notifications failed:', notificationResults.reason);
    }

    // Record audit log
    const auditLogId = await this.recordAudit(projectId, userId);

    // Invalidate completed projects cache (Requirement: Performance optimization)
    try {
      await cacheService.invalidate(CacheKeys.project.allCompleted());
      console.log('[ProjectCompletion] Invalidated completed projects cache');
    } catch (error) {
      // Log error but don't fail the completion
      console.error('[ProjectCompletion] Failed to invalidate cache:', error);
    }

    return {
      project: completedProject,
      xpAwarded,
      notificationsSent,
      auditLogId,
    };
  }

  /**
   * Awards XP to project owner and all members
   * Validates: Requirements 3.1, 3.2, 3.3, 3.4, 3.5, 3.6
   */
  private async awardTeamXP(
    project: Project & {
      owner: { id: string; name: string | null; email: string };
      members: Array<ProjectMember & { user: { id: string; name: string | null; email: string } }>;
    },
    members: Array<ProjectMember & { user: { id: string; name: string | null; email: string } }>,
    xpAwarded: { owner: number; members: number }
  ): Promise<void> {
    const xpPromises: Promise<any>[] = [];

    // Award 100 XP to project owner (Requirements 3.1, 3.4)
    xpPromises.push(
      XPService.addXP(
        project.ownerId,
        xpAwarded.owner,
        'PROJECT_COMPLETION',
        {
          projectId: project.id,
          projectTitle: project.title,
          role: 'owner',
        }
      )
    );

    // Award 75 XP to each project member (Requirements 3.2, 3.5)
    for (const member of members) {
      xpPromises.push(
        XPService.addXP(
          member.userId,
          xpAwarded.members,
          'PROJECT_COMPLETION',
          {
            projectId: project.id,
            projectTitle: project.title,
            role: 'member',
          }
        )
      );
    }

    // Use Promise.allSettled for parallel execution (Requirement 3.6)
    const results = await Promise.allSettled(xpPromises);

    // Log failures but don't throw errors
    results.forEach((result, index) => {
      if (result.status === 'rejected') {
        const userId = index === 0 ? project.ownerId : members[index - 1].userId;
        console.error(`[ProjectCompletion] Failed to award XP to user ${userId}:`, result.reason);
      }
    });
  }

  /**
   * Sends completion notifications to all team members
   * Validates: Requirements 7.1, 7.2, 7.3, 7.4, 7.5
   */
  private async notifyTeamMembers(
    project: Project & {
      owner: { id: string; name: string | null; email: string };
      members: Array<ProjectMember & { user: { id: string; name: string | null; email: string } }>;
    },
    members: Array<ProjectMember & { user: { id: string; name: string | null; email: string } }>,
    xpAwarded: { owner: number; members: number }
  ): Promise<number> {
    const notificationPromises: Promise<any>[] = [];

    // Create notification for project owner (Requirement 7.1)
    notificationPromises.push(
      this.notificationService.createNotification({
        userId: project.ownerId,
        title: 'Project Completed!',
        description: `Congratulations! Your project "${project.title}" has been marked as complete. You earned ${xpAwarded.owner} XP!`,
        type: 'AWARD',
        actionUrl: `/projects?status=completed`,
        metadata: {
          projectId: project.id,
          projectTitle: project.title,
          xpAwarded: xpAwarded.owner,
          eventType: 'project_completion',
        },
      })
    );

    // Create notifications for all project members (Requirements 7.2, 7.3, 7.4)
    for (const member of members) {
      notificationPromises.push(
        this.notificationService.createNotification({
          userId: member.userId,
          title: 'Project Completed!',
          description: `The project "${project.title}" has been completed! You earned ${xpAwarded.members} XP for your contribution.`,
          type: 'AWARD',
          actionUrl: `/projects?status=completed`,
          metadata: {
            projectId: project.id,
            projectTitle: project.title,
            xpAwarded: xpAwarded.members,
            eventType: 'project_completion',
          },
        })
      );
    }

    // Use Promise.allSettled for parallel execution (Requirement 7.5)
    const results = await Promise.allSettled(notificationPromises);

    // Count successful notifications
    let successCount = 0;
    results.forEach((result, index) => {
      if (result.status === 'fulfilled') {
        successCount++;
      } else {
        const userId = index === 0 ? project.ownerId : members[index - 1].userId;
        console.error(`[ProjectCompletion] Failed to send notification to user ${userId}:`, result.reason);
      }
    });

    return successCount;
  }

  /**
   * Records completion event in audit log
   * Validates: Requirement 10.5
   */
  private async recordAudit(projectId: string, userId: string): Promise<string> {
    try {
      const auditLog = await prisma.auditLog.create({
        data: {
          userId,
          action: 'PROJECT_COMPLETION',
          resource: 'PROJECT',
          ipAddress: 'system',
          userAgent: 'system',
          result: 'success',
          metadata: {
            projectId,
            timestamp: new Date().toISOString(),
          },
        },
      });

      return auditLog.id;
    } catch (error) {
      console.error('[ProjectCompletion] Failed to record audit log:', error);
      // Return empty string if audit logging fails (non-critical)
      return '';
    }
  }
}
