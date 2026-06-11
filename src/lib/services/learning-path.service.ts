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
    badgeName: string;
    badgeImageUrl: string;
  }) {
    return await prisma.learningPath.create({
      data,
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
      badgeName?: string;
      badgeImageUrl?: string;
    }
  ) {
    const existing = await prisma.learningPath.findUnique({ where: { id } });
    if (!existing) throw new NotFoundError("Learning Path");

    return await prisma.learningPath.update({
      where: { id },
      data,
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
    const module = await prisma.module.findUnique({
      where: { id: moduleId },
      include: { learningPath: true },
    });

    if (!module) {
      throw new NotFoundError("Module");
    }

    const pathId = module.pathId;

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

      // Award XP for completing a module
      await XPService.addXP(userId, 50, "CHALLENGE_COMPLETION", {
        moduleId,
        moduleTitle: module.title,
        pathId,
      });
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
      await notificationService.createNotification({
        userId,
        title: `🎉 Roadmap Completed: ${module.learningPath.title}`,
        description: `You've completed all modules! Schedule your Certificate Test to earn the "${module.learningPath.badgeName}" Skill Badge.`,
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
        status: "SCHEDULED",
        score: null,
      },
      create: {
        userId,
        pathId,
        testDate,
        status: "SCHEDULED",
      },
    });

    const path = await prisma.learningPath.findUnique({ where: { id: pathId } });

    await notificationService.createNotification({
      userId,
      title: `📅 Certificate Test Scheduled`,
      description: `Your test for the "${path?.title}" certificate is scheduled for ${testDate.toLocaleDateString()}.`,
      type: "INFO",
      actionUrl: `/resources`,
    });

    return schedule;
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

    // Generate certificate URL (mock URL / unique ID)
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

    // Check if user already has a Badge with the same name, if not create one or link it
    let badge = await prisma.badge.findUnique({
      where: { name: path.badgeName },
    });

    if (!badge) {
      badge = await prisma.badge.create({
        data: {
          name: path.badgeName,
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

      // Award XP
      await XPService.addXP(userId, 500, "BADGE_UNLOCK", {
        badgeId: badge.id,
        badgeName: badge.name,
      });
    }

    // Create notification
    await notificationService.createNotification({
      userId,
      title: `🎓 Certificate Earned!`,
      description: `Congratulations! You've passed the test for "${path.title}", earned the "${path.badgeName}" Skill Badge, and unlocked your printable Certificate.`,
      type: "SUCCESS",
      actionUrl: `/resources`,
    });

    return {
      success: true,
      certificateId,
      certificateUrl,
      badgeName: path.badgeName,
    };
  }
}

export const learningPathService = new LearningPathService();
