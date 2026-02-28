import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ProjectCompletionService } from '@/lib/services/project-completion.service';
import { prisma } from '@/lib/prisma';
import { XPService } from '@/lib/services/xp.service';
import { NotificationService } from '@/lib/services/notification.service';

// Mock dependencies
vi.mock('@/lib/prisma', () => ({
  prisma: {
    project: {
      findUnique: vi.fn(),
      update: vi.fn(),
    },
    auditLog: {
      create: vi.fn(),
    },
  },
}));

vi.mock('@/lib/services/xp.service', () => ({
  XPService: {
    addXP: vi.fn(),
  },
}));

vi.mock('@/lib/services/notification.service', () => {
  const mockCreateNotification = vi.fn();
  return {
    NotificationService: class {
      createNotification = mockCreateNotification;
    },
  };
});

describe('ProjectCompletionService', () => {
  let service: ProjectCompletionService;

  beforeEach(() => {
    vi.clearAllMocks();
    service = new ProjectCompletionService();
  });

  describe('validateCompletion', () => {
    it('should return valid when project exists, user is owner, and status is IN_PROGRESS', async () => {
      const mockProject = {
        id: 'project-1',
        status: 'IN_PROGRESS',
        ownerId: 'user-1',
      };

      vi.mocked(prisma.project.findUnique).mockResolvedValue(mockProject as any);

      const result = await service.validateCompletion('project-1', 'user-1');

      expect(result.isValid).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it('should return PROJECT_NOT_FOUND error when project does not exist', async () => {
      vi.mocked(prisma.project.findUnique).mockResolvedValue(null);

      const result = await service.validateCompletion('project-1', 'user-1');

      expect(result.isValid).toBe(false);
      expect(result.error?.code).toBe('PROJECT_NOT_FOUND');
      expect(result.error?.message).toBe('Project not found');
    });

    it('should return UNAUTHORIZED error when user is not the owner', async () => {
      const mockProject = {
        id: 'project-1',
        status: 'IN_PROGRESS',
        ownerId: 'user-2',
      };

      vi.mocked(prisma.project.findUnique).mockResolvedValue(mockProject as any);

      const result = await service.validateCompletion('project-1', 'user-1');

      expect(result.isValid).toBe(false);
      expect(result.error?.code).toBe('UNAUTHORIZED');
      expect(result.error?.message).toBe('Only the project owner can mark the project as complete');
    });

    it('should return ALREADY_COMPLETED error when project is already completed', async () => {
      const mockProject = {
        id: 'project-1',
        status: 'COMPLETED',
        ownerId: 'user-1',
      };

      vi.mocked(prisma.project.findUnique).mockResolvedValue(mockProject as any);

      const result = await service.validateCompletion('project-1', 'user-1');

      expect(result.isValid).toBe(false);
      expect(result.error?.code).toBe('ALREADY_COMPLETED');
      expect(result.error?.message).toBe('Project has already been marked as complete');
    });

    it('should return INVALID_STATUS error when project status is not IN_PROGRESS', async () => {
      const mockProject = {
        id: 'project-1',
        status: 'PLANNING',
        ownerId: 'user-1',
      };

      vi.mocked(prisma.project.findUnique).mockResolvedValue(mockProject as any);

      const result = await service.validateCompletion('project-1', 'user-1');

      expect(result.isValid).toBe(false);
      expect(result.error?.code).toBe('INVALID_STATUS');
      expect(result.error?.message).toBe('Project must be in IN_PROGRESS status to be completed');
    });
  });

  describe('completeProject', () => {
    it('should complete project and award XP to owner and members', async () => {
      const mockProject = {
        id: 'project-1',
        title: 'Test Project',
        status: 'IN_PROGRESS',
        ownerId: 'user-1',
        owner: {
          id: 'user-1',
          name: 'Owner User',
          email: 'owner@test.com',
        },
        members: [
          {
            id: 'member-1',
            userId: 'user-2',
            projectId: 'project-1',
            user: {
              id: 'user-2',
              name: 'Member User',
              email: 'member@test.com',
            },
          },
        ],
      };

      const completedProject = {
        ...mockProject,
        status: 'COMPLETED',
        completedAt: new Date(),
        completedBy: 'user-1',
      };

      vi.mocked(prisma.project.findUnique)
        .mockResolvedValueOnce(mockProject as any) // For validation
        .mockResolvedValueOnce(mockProject as any); // For fetching with relations

      vi.mocked(prisma.project.update).mockResolvedValue(completedProject as any);
      vi.mocked(XPService.addXP).mockResolvedValue({
        success: true,
        xpAdded: 100,
        leveledUp: false,
      });
      vi.mocked(prisma.auditLog.create).mockResolvedValue({ id: 'audit-1' } as any);

      const result = await service.completeProject('project-1', 'user-1');

      expect(result.project.status).toBe('COMPLETED');
      expect(result.xpAwarded.owner).toBe(100);
      expect(result.xpAwarded.members).toBe(75);
      expect(XPService.addXP).toHaveBeenCalledTimes(2); // Owner + 1 member
    });

    it('should throw error when validation fails', async () => {
      vi.mocked(prisma.project.findUnique).mockResolvedValue(null);

      await expect(service.completeProject('project-1', 'user-1')).rejects.toThrow('Project not found');
    });

    it('should continue even if XP award fails', async () => {
      const mockProject = {
        id: 'project-1',
        title: 'Test Project',
        status: 'IN_PROGRESS',
        ownerId: 'user-1',
        owner: {
          id: 'user-1',
          name: 'Owner User',
          email: 'owner@test.com',
        },
        members: [],
      };

      const completedProject = {
        ...mockProject,
        status: 'COMPLETED',
        completedAt: new Date(),
        completedBy: 'user-1',
      };

      vi.mocked(prisma.project.findUnique)
        .mockResolvedValueOnce(mockProject as any)
        .mockResolvedValueOnce(mockProject as any);

      vi.mocked(prisma.project.update).mockResolvedValue(completedProject as any);
      vi.mocked(XPService.addXP).mockRejectedValue(new Error('XP service error'));
      vi.mocked(prisma.auditLog.create).mockResolvedValue({ id: 'audit-1' } as any);

      const result = await service.completeProject('project-1', 'user-1');

      expect(result.project.status).toBe('COMPLETED');
      expect(result.xpAwarded.owner).toBe(100);
    });
  });
});
