import { describe, it, expect, beforeEach, vi } from 'vitest';
import { learningPathService } from '@/lib/services/learning-path.service';
import { prisma } from '@/lib/prisma';

// Mock Prisma
vi.mock('@/lib/prisma', () => ({
  prisma: {
    learningPath: {
      findUnique: vi.fn(),
      findMany: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
    module: {
      findUnique: vi.fn(),
      findMany: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      aggregate: vi.fn(),
    },
    userPathProgress: {
      findUnique: vi.fn(),
      findMany: vi.fn(),
      upsert: vi.fn(),
      update: vi.fn(),
    },
    userModuleProgress: {
      findUnique: vi.fn(),
      findMany: vi.fn(),
      create: vi.fn(),
      delete: vi.fn(),
    },
    testSchedule: {
      findUnique: vi.fn(),
      findMany: vi.fn(),
      upsert: vi.fn(),
      update: vi.fn(),
    },
    user: {
      findUnique: vi.fn(),
      update: vi.fn(),
    },
    xpTransaction: {
      create: vi.fn(),
    },
    badge: {
      findUnique: vi.fn(),
      create: vi.fn(),
    },
    userBadge: {
      findUnique: vi.fn(),
      create: vi.fn(),
    },
    notification: {
      create: vi.fn(),
    },
  },
}));

describe('LearningPathService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('toggleModuleCompletion', () => {
    it('should complete module and update progress when no record exists', async () => {
      const mockModule = {
        id: 'mod-1',
        pathId: 'path-1',
        title: 'Introduction',
        learningPath: {
          title: 'DSA Path',
          badgeName: 'DSA Master',
        },
      };

      vi.mocked(prisma.module.findUnique).mockResolvedValue(mockModule as any);
      vi.mocked(prisma.userModuleProgress.findUnique).mockResolvedValue(null);
      vi.mocked(prisma.userModuleProgress.create).mockResolvedValue({ id: 'prog-1' } as any);
      
      // Mock path checking
      vi.mocked(prisma.module.findMany).mockResolvedValue([
        { id: 'mod-1' },
        { id: 'mod-2' },
      ] as any);
      vi.mocked(prisma.userModuleProgress.findMany).mockResolvedValue([
        { moduleId: 'mod-1' },
      ] as any);
      vi.mocked(prisma.userPathProgress.upsert).mockResolvedValue({} as any);

      // Mock user update
      vi.mocked(prisma.user.findUnique).mockResolvedValue({ id: 'user-1', xp: 100 } as any);

      const result = await learningPathService.toggleModuleCompletion('user-1', 'mod-1');

      expect(result.completed).toBe(true);
      expect(result.progressPercent).toBe(50);
      expect(result.pathCompleted).toBe(false);
      expect(prisma.userModuleProgress.create).toHaveBeenCalledWith({
        data: { userId: 'user-1', moduleId: 'mod-1' },
      });
    });

    it('should un-complete module when record already exists', async () => {
      const mockModule = {
        id: 'mod-1',
        pathId: 'path-1',
        title: 'Introduction',
        learningPath: {
          title: 'DSA Path',
          badgeName: 'DSA Master',
        },
      };

      vi.mocked(prisma.module.findUnique).mockResolvedValue(mockModule as any);
      vi.mocked(prisma.userModuleProgress.findUnique).mockResolvedValue({ id: 'existing-prog-1' } as any);
      vi.mocked(prisma.userModuleProgress.delete).mockResolvedValue({} as any);
      
      vi.mocked(prisma.module.findMany).mockResolvedValue([
        { id: 'mod-1' },
        { id: 'mod-2' },
      ] as any);
      vi.mocked(prisma.userModuleProgress.findMany).mockResolvedValue([] as any);
      vi.mocked(prisma.userPathProgress.upsert).mockResolvedValue({} as any);

      const result = await learningPathService.toggleModuleCompletion('user-1', 'mod-1');

      expect(result.completed).toBe(false);
      expect(result.progressPercent).toBe(0);
      expect(prisma.userModuleProgress.delete).toHaveBeenCalled();
    });
  });

  describe('scheduleTest', () => {
    it('should fail if not all modules are completed', async () => {
      vi.mocked(prisma.module.findMany).mockResolvedValue([
        { id: 'mod-1' },
        { id: 'mod-2' },
      ] as any);
      vi.mocked(prisma.userModuleProgress.findMany).mockResolvedValue([
        { moduleId: 'mod-1' },
      ] as any);

      await expect(
        learningPathService.scheduleTest('user-1', 'path-1', new Date())
      ).rejects.toThrow("All roadmap modules must be completed before scheduling the certificate test.");
    });

    it('should succeed and schedule if all modules are completed', async () => {
      vi.mocked(prisma.module.findMany).mockResolvedValue([
        { id: 'mod-1' },
        { id: 'mod-2' },
      ] as any);
      vi.mocked(prisma.userModuleProgress.findMany).mockResolvedValue([
        { moduleId: 'mod-1' },
        { moduleId: 'mod-2' },
      ] as any);

      const mockSchedule = { id: 'sched-1', testDate: new Date(), status: 'SCHEDULED' };
      vi.mocked(prisma.testSchedule.upsert).mockResolvedValue(mockSchedule as any);
      vi.mocked(prisma.learningPath.findUnique).mockResolvedValue({ title: 'DSA Path' } as any);

      const result = await learningPathService.scheduleTest('user-1', 'path-1', new Date());

      expect(result).toBeDefined();
      expect(prisma.testSchedule.upsert).toHaveBeenCalled();
    });
  });

  describe('claimCertificate', () => {
    it('should fail if no test has been scheduled', async () => {
      vi.mocked(prisma.learningPath.findUnique).mockResolvedValue({ id: 'path-1', title: 'DSA Path' } as any);
      vi.mocked(prisma.testSchedule.findUnique).mockResolvedValue(null);

      await expect(
        learningPathService.claimCertificate('user-1', 'path-1')
      ).rejects.toThrow("You must schedule the test before claiming a certificate.");
    });

    it('should award certificate and badge if exam passed', async () => {
      const mockPath = {
        id: 'path-1',
        title: 'DSA Path',
        badgeName: 'DSA Master',
        badgeImageUrl: '/badge.png',
      };

      vi.mocked(prisma.learningPath.findUnique).mockResolvedValue(mockPath as any);
      vi.mocked(prisma.testSchedule.findUnique).mockResolvedValue({ id: 'sched-1' } as any);
      vi.mocked(prisma.testSchedule.update).mockResolvedValue({} as any);
      vi.mocked(prisma.userPathProgress.update).mockResolvedValue({} as any);
      
      // Mock badge checking and creation
      vi.mocked(prisma.badge.findUnique).mockResolvedValue(null);
      vi.mocked(prisma.badge.create).mockResolvedValue({ id: 'badge-1', name: 'DSA Master' } as any);
      vi.mocked(prisma.userBadge.findUnique).mockResolvedValue(null);
      vi.mocked(prisma.userBadge.create).mockResolvedValue({} as any);
      
      // Mock user update
      vi.mocked(prisma.user.findUnique).mockResolvedValue({ id: 'user-1', xp: 100 } as any);

      const result = await learningPathService.claimCertificate('user-1', 'path-1', 95);

      expect(result.success).toBe(true);
      expect(result.badgeName).toBe('DSA Master');
      expect(result.certificateId).toBeDefined();
      expect(prisma.userBadge.create).toHaveBeenCalled();
    });
  });
});
