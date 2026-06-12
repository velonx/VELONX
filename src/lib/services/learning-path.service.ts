import { prisma } from "@/lib/prisma";
import { NotFoundError, ValidationError } from "@/lib/utils/errors";
import { XPService } from "./xp.service";
import { NotificationService } from "./notification.service";

const notificationService = new NotificationService();

export class LearningPathService {
  /**
   * List all learning paths, optionally annotated with progress for a specific user
   */
  async listLearningPaths(userId?: string) {
    const paths = await prisma.learningPath.findMany({
      include: {
        modules: {
          orderBy: { order: "asc" },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    if (!userId) {
      return paths.map((path) => ({
        ...path,
        progress: 0,
        completedModules: 0,
        isStarted: false,
        isCompleted: false,
        certificateEarned: false,
        testStatus: null,
      }));
    }

    // Fetch user progress for all paths
    const userPathProgress = await prisma.userPathProgress.findMany({
      where: { userId },
    });

    const userModuleProgress = await prisma.userModuleProgress.findMany({
      where: { userId },
      select: { moduleId: true },
    });

    const testSchedules = await prisma.testSchedule.findMany({
      where: { userId },
    });

    const completedModuleIds = new Set(userModuleProgress.map((p) => p.moduleId));
    const progressMap = new Map(userPathProgress.map((p) => [p.pathId, p]));
    const testMap = new Map(testSchedules.map((t) => [t.pathId, t]));

    return paths.map((path) => {
      const pathModules = path.modules || [];
      const totalModules = pathModules.length;
      
      const completedModules = pathModules.filter((m) =>
        completedModuleIds.has(m.id)
      ).length;

      const progressPercent =
        totalModules > 0 ? Math.round((completedModules / totalModules) * 100) : 0;

      const progressRecord = progressMap.get(path.id);
      const testRecord = testMap.get(path.id);

      return {
        ...path,
        progress: progressPercent,
        completedModules,
        isStarted: completedModules > 0 || !!progressRecord,
        isCompleted: progressRecord?.completed || false,
        certificateEarned: progressRecord?.certificateEarned || false,
        certificateUrl: progressRecord?.certificateUrl || null,
        testStatus: testRecord
          ? {
              id: testRecord.id,
              testDate: testRecord.testDate,
              status: testRecord.status,
              score: testRecord.score,
            }
          : null,
      };
    });
  }

  /**
   * Get single learning path with details, modules, and user progress
   */
  async getLearningPathById(id: string, userId?: string) {
    const path = await prisma.learningPath.findUnique({
      where: { id },
      include: {
        modules: {
          orderBy: { order: "asc" },
        },
      },
    });

    if (!path) {
      throw new NotFoundError("Learning Path");
    }

    if (!userId) {
      return {
        ...path,
        progress: 0,
        completedModules: 0,
        isStarted: false,
        isCompleted: false,
        certificateEarned: false,
        testStatus: null,
        modules: path.modules.map((m) => ({ ...m, completed: false })),
      };
    }

    // Get user progress
    const progressRecord = await prisma.userPathProgress.findUnique({
      where: { userId_pathId: { userId, pathId: id } },
    });

    const userModuleProgress = await prisma.userModuleProgress.findMany({
      where: {
        userId,
        module: { pathId: id },
      },
      select: { moduleId: true },
    });

    const testRecord = await prisma.testSchedule.findUnique({
      where: { userId_pathId: { userId, pathId: id } },
    });

    const completedModuleIds = new Set(userModuleProgress.map((p) => p.moduleId));
    const totalModules = path.modules.length;
    const completedModules = path.modules.filter((m) =>
      completedModuleIds.has(m.id)
    ).length;

    const progressPercent =
      totalModules > 0 ? Math.round((completedModules / totalModules) * 100) : 0;

    return {
      ...path,
      progress: progressPercent,
      completedModules,
      isStarted: completedModules > 0 || !!progressRecord,
      isCompleted: progressRecord?.completed || false,
      certificateEarned: progressRecord?.certificateEarned || false,
      certificateUrl: progressRecord?.certificateUrl || null,
      testStatus: testRecord
        ? {
            id: testRecord.id,
            testDate: testRecord.testDate,
            status: testRecord.status,
            score: testRecord.score,
          }
        : null,
      modules: path.modules.map((m) => ({
        ...m,
        completed: completedModuleIds.has(m.id),
      })),
    };
  }

  /**
   * Create a learning path (Admin)
   */
  async createLearningPath(data: {
    title: string;
    description: string;
    level: string;
    duration: string;
    badgeName?: string;
    badgeImageUrl?: string;
    hasCertificate?: boolean;
  }) {
    return await prisma.learningPath.create({
      data: {
        title: data.title,
        description: data.description,
        level: data.level,
        duration: data.duration,
        badgeName: data.badgeName || null,
        badgeImageUrl: data.badgeImageUrl || null,
        hasCertificate: data.hasCertificate ?? false,
      },
    });
  }

  /**
   * Update a learning path (Admin)
   */
  async updateLearningPath(
    id: string,
    data: {
      title?: string;
      description?: string;
      level?: string;
      duration?: string;
      badgeName?: string | null;
      badgeImageUrl?: string | null;
      hasCertificate?: boolean;
    }
  ) {
    const existing = await prisma.learningPath.findUnique({ where: { id } });
    if (!existing) throw new NotFoundError("Learning Path");

    const updateData: any = {};
    if (data.title !== undefined) updateData.title = data.title;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.level !== undefined) updateData.level = data.level;
    if (data.duration !== undefined) updateData.duration = data.duration;
    if (data.badgeName !== undefined) updateData.badgeName = data.badgeName || null;
    if (data.badgeImageUrl !== undefined) updateData.badgeImageUrl = data.badgeImageUrl || null;
    if (data.hasCertificate !== undefined) updateData.hasCertificate = data.hasCertificate;

    return await prisma.learningPath.update({
      where: { id },
      data: updateData,
    });
  }

  /**
   * Delete a learning path (Admin)
   */
  async deleteLearningPath(id: string) {
    const existing = await prisma.learningPath.findUnique({ where: { id } });
    if (!existing) throw new NotFoundError("Learning Path");

    await prisma.learningPath.delete({ where: { id } });
    return { success: true };
  }

  /**
   * Add a module to path (Admin)
   */
  async addModule(
    pathId: string,
    data: {
      title: string;
      description: string;
      link: string;
      duration: string;
      order?: number;
    }
  ) {
    const path = await prisma.learningPath.findUnique({ where: { id: pathId } });
    if (!path) throw new NotFoundError("Learning Path");

    // If order not set, append to end
    let order = data.order;
    if (order === undefined) {
      const maxOrder = await prisma.module.aggregate({
        where: { pathId },
        _max: { order: true },
      });
      order = (maxOrder._max.order ?? -1) + 1;
    }

    return await prisma.module.create({
      data: {
        pathId,
        title: data.title,
        description: data.description,
        link: data.link,
        duration: data.duration,
        order,
      },
    });
  }

  /**
   * Update module details (Admin)
   */
  async updateModule(
    moduleId: string,
    data: {
      title?: string;
      description?: string;
      link?: string;
      duration?: string;
      order?: number;
    }
  ) {
    const existing = await prisma.module.findUnique({ where: { id: moduleId } });
    if (!existing) throw new NotFoundError("Module");

    return await prisma.module.update({
      where: { id: moduleId },
      data,
    });
  }

  /**
   * Delete a module (Admin)
   */
  async deleteModule(moduleId: string) {
    const existing = await prisma.module.findUnique({ where: { id: moduleId } });
    if (!existing) throw new NotFoundError("Module");

    await prisma.module.delete({ where: { id: moduleId } });
    return { success: true };
  }

  /**
   * Toggle Module Completion for Student
   */
  async toggleModuleCompletion(userId: string, moduleId: string) {
    const moduleItem = await prisma.module.findUnique({
      where: { id: moduleId },
      include: { learningPath: true },
    });

    if (!moduleItem) {
      throw new NotFoundError("Module");
    }

    const pathId = moduleItem.pathId;

    // Check if completion record exists
    const existingProgress = await prisma.userModuleProgress.findUnique({
      where: { userId_moduleId: { userId, moduleId } },
    });

    let completed = false;

    if (existingProgress) {
      // Un-complete it
      await prisma.userModuleProgress.delete({
        where: { id: existingProgress.id },
      });
      completed = false;
    } else {
      // Complete it
      await prisma.userModuleProgress.create({
        data: { userId, moduleId },
      });
      completed = true;

      // Note: Removed module clicked XP award as per user requirements
    }

    // Check path completion status
    const pathModules = await prisma.module.findMany({
      where: { pathId },
      select: { id: true },
    });

    const userModuleProgress = await prisma.userModuleProgress.findMany({
      where: {
        userId,
        module: { pathId },
      },
      select: { moduleId: true },
    });

    const completedModuleIds = new Set(userModuleProgress.map((p) => p.moduleId));
    const allCompleted = pathModules.every((m) => completedModuleIds.has(m.id));

    // Upsert UserPathProgress
    const progressRecord = await prisma.userPathProgress.upsert({
      where: { userId_pathId: { userId, pathId } },
      update: {
        completed: allCompleted,
        completedAt: allCompleted ? new Date() : null,
      },
      create: {
        userId,
        pathId,
        completed: allCompleted,
        completedAt: allCompleted ? new Date() : null,
      },
    });

    // Notify if path completed
    if (allCompleted && !existingProgress) {
      const descriptionText = module.learningPath.hasCertificate
        ? `You've completed all modules! Schedule your Certificate Test under the Roadmap page.`
        : `You've completed the roadmap "${module.learningPath.title}"!`;

      await notificationService.createNotification({
        userId,
        title: `🎉 Roadmap Completed: ${module.learningPath.title}`,
        description: descriptionText,
        type: "SUCCESS",
        actionUrl: `/resources`,
      });
    }

    const progressPercent =
      pathModules.length > 0 ? Math.round((userModuleProgress.length / pathModules.length) * 100) : 0;

    return {
      completed,
      progressPercent,
      completedCount: userModuleProgress.length,
      totalCount: pathModules.length,
      pathCompleted: allCompleted,
    };
  }

  /**
   * Schedule Certificate Test
   */
  async scheduleTest(userId: string, pathId: string, testDate: Date) {
    const path = await prisma.learningPath.findUnique({ where: { id: pathId } });
    if (!path) throw new NotFoundError("Learning Path");
    
    if (!path.hasCertificate) {
      throw new ValidationError("This roadmap does not require or offer a certification exam.");
    }

    // Confirm all modules are completed first
    const pathModules = await prisma.module.findMany({
      where: { pathId },
      select: { id: true },
    });

    const userModuleProgress = await prisma.userModuleProgress.findMany({
      where: {
        userId,
        module: { pathId },
      },
      select: { moduleId: true },
    });

    if (userModuleProgress.length < pathModules.length || pathModules.length === 0) {
      throw new ValidationError("All roadmap modules must be completed before scheduling the certificate test.");
    }

    const schedule = await prisma.testSchedule.upsert({
      where: { userId_pathId: { userId, pathId } },
      update: {
        testDate,
        status: "PENDING", // Scheduled test is pending review by admin
        score: null,
      },
      create: {
        userId,
        pathId,
        testDate,
        status: "PENDING",
      },
    });

    await notificationService.createNotification({
      userId,
      title: `📅 Test Schedule Requested`,
      description: `Your certificate test request for "${path.title}" is pending admin review.`,
      type: "INFO",
      actionUrl: `/resources`,
    });

    return schedule;
  }

  /**
   * Admin-facing method to list all test schedules
   */
  async listAllTestSchedules() {
    return await prisma.testSchedule.findMany({
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
        learningPath: {
          select: {
            id: true,
            title: true,
            hasCertificate: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });
  }

  /**
   * Admin updates a test schedule status (Approve/Reject)
   */
  async updateTestScheduleStatus(scheduleId: string, status: string, score?: number) {
    const existing = await prisma.testSchedule.findUnique({
      where: { id: scheduleId },
    });

    if (!existing) {
      throw new NotFoundError("Test Schedule");
    }

    if (status === "PASSED") {
      // Complete test, generate certificate and optional badge
      return await this.claimCertificate(existing.userId, existing.pathId, score ?? 95);
    }

    // Update other statuses (FAILED, SCHEDULED)
    const updated = await prisma.testSchedule.update({
      where: { id: scheduleId },
      data: {
        status,
        score: score !== undefined ? score : undefined,
      },
    });

    // Notify user
    await notificationService.createNotification({
      userId: existing.userId,
      title: `📅 Certificate Test Status Update`,
      description: `Your exam schedule request status has been updated to "${status}".`,
      type: "INFO",
      actionUrl: `/resources`,
    });

    return updated;
  }

  /**
   * Complete Test & Issue Certificate & Award Badge
   */
  async claimCertificate(userId: string, pathId: string, score: number = 90) {
    const path = await prisma.learningPath.findUnique({
      where: { id: pathId },
    });

    if (!path) {
      throw new NotFoundError("Learning Path");
    }

    // Verify test is scheduled or can be claimed
    const testSchedule = await prisma.testSchedule.findUnique({
      where: { userId_pathId: { userId, pathId } },
    });

    if (!testSchedule) {
      throw new ValidationError("You must schedule the test before claiming a certificate.");
    }

    // Update test schedule
    await prisma.testSchedule.update({
      where: { id: testSchedule.id },
      data: {
        status: "PASSED",
        score,
      },
    });

    // Generate certificate URL (unique ID)
    const certificateId = `VAL-${pathId.substring(0, 4)}-${userId.substring(0, 4)}-${Date.now().toString().slice(-6)}`.toUpperCase();
    const certificateUrl = `/certificates/${certificateId}`;

    // Update Path Progress
    await prisma.userPathProgress.update({
      where: { userId_pathId: { userId, pathId } },
      data: {
        certificateEarned: true,
        certificateUrl,
      },
    });

    // Award Badge only if configured by Admin
    let badgeName = path.badgeName;
    if (badgeName) {
      let badge = await prisma.badge.findUnique({
        where: { name: badgeName },
      });

      if (!badge) {
        badge = await prisma.badge.create({
          data: {
            name: badgeName,
            description: `Awarded for completing the ${path.title} learning path and passing the certificate test.`,
            imageUrl: path.badgeImageUrl || "/badges/default-path.png",
            category: "MILESTONE",
            xpReward: 500,
            criteria: JSON.stringify({ pathId }),
          },
        });
      }

      // Award user badge
      const existingUserBadge = await prisma.userBadge.findUnique({
        where: { userId_badgeId: { userId, badgeId: badge.id } },
      });

      if (!existingUserBadge) {
        await prisma.userBadge.create({
          data: {
            userId,
            badgeId: badge.id,
            progress: 100,
          },
        });

        // Award XP for Badge unlock
        await XPService.addXP(userId, 500, "BADGE_UNLOCK", {
          badgeId: badge.id,
          badgeName: badge.name,
        });
      }
    }

    // Create notification
    const notificationDesc = badgeName
      ? `Congratulations! You've passed the test for "${path.title}", earned the "${badgeName}" Skill Badge, and unlocked your printable Certificate.`
      : `Congratulations! You've passed the test for "${path.title}" and unlocked your printable Certificate.`;

    await notificationService.createNotification({
      userId,
      title: `🎓 Certificate Earned!`,
      description: notificationDesc,
      type: "SUCCESS",
      actionUrl: `/resources`,
    });

    return {
      success: true,
      certificateId,
      certificateUrl,
      badgeName: badgeName || null,
    };
  }
}

export const learningPathService = new LearningPathService();
