import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ProjectService } from '@/lib/services/project.service';
import { prisma } from '@/lib/prisma';
import { NotFoundError } from '@/lib/utils/errors';

// Mock Prisma
vi.mock('@/lib/prisma', () => ({
  prisma: {
    project: {
      findMany: vi.fn(),
      count: vi.fn(),
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
    projectMember: {
      findUnique: vi.fn(),
      create: vi.fn(),
      delete: vi.fn(),
    },
  },
}));

describe('ProjectService', () => {
  let service: ProjectService;

  beforeEach(() => {
    vi.clearAllMocks();
    service = new ProjectService();
  });

  describe('listProjects', () => {
    it('should list projects with default pagination', async () => {
      const mockProjects = [{ id: '1', title: 'Test' }];
      vi.mocked(prisma.project.findMany).mockResolvedValue(mockProjects as any);
      vi.mocked(prisma.project.count).mockResolvedValue(1);

      const result = await service.listProjects({});

      expect(result.projects).toEqual(mockProjects);
      expect(result.pagination).toEqual({
        page: 1,
        pageSize: 10,
        totalCount: 1,
        totalPages: 1,
      });

      expect(prisma.project.findMany).toHaveBeenCalledWith(expect.objectContaining({
        skip: 0,
        take: 10,
        orderBy: { createdAt: 'desc' },
      }));
    });

    it('should apply filters correctly', async () => {
      const mockProjects = [{ id: '1', title: 'Test' }];
      vi.mocked(prisma.project.findMany).mockResolvedValue(mockProjects as any);
      vi.mocked(prisma.project.count).mockResolvedValue(1);

      await service.listProjects({
        status: 'COMPLETED',
        category: 'WEB',
        difficulty: 'ADVANCED',
        techStack: 'React, Node.js',
        memberId: 'user-1',
      });

      expect(prisma.project.findMany).toHaveBeenCalledWith(expect.objectContaining({
        where: {
          status: 'COMPLETED',
          category: 'WEB',
          difficulty: 'ADVANCED',
          techStack: { hasSome: ['React', 'Node.js'] },
          OR: [
            { ownerId: 'user-1' },
            { members: { some: { userId: 'user-1' } } },
          ],
        },
        orderBy: { completedAt: 'desc' },
      }));
    });
  });

  describe('getProjectById', () => {
    it('should return project if found', async () => {
      const mockProject = { id: '1', title: 'Test' };
      vi.mocked(prisma.project.findUnique).mockResolvedValue(mockProject as any);

      const result = await service.getProjectById('1');

      expect(result).toEqual(mockProject);
      expect(prisma.project.findUnique).toHaveBeenCalledWith(expect.objectContaining({
        where: { id: '1' },
      }));
    });

    it('should throw NotFoundError if project is not found', async () => {
      vi.mocked(prisma.project.findUnique).mockResolvedValue(null);

      await expect(service.getProjectById('1')).rejects.toThrow(NotFoundError);
    });
  });

  describe('createProject', () => {
    it('should create a project with provided data', async () => {
      const mockProject = { id: '1', title: 'New Project' };
      vi.mocked(prisma.project.create).mockResolvedValue(mockProject as any);

      const data = {
        title: 'New Project',
        description: 'Description',
        techStack: ['React'],
        ownerId: 'user-1',
      };

      const result = await service.createProject(data);

      expect(result).toEqual(mockProject);
      expect(prisma.project.create).toHaveBeenCalledWith(expect.objectContaining({
        data: expect.objectContaining({
          title: 'New Project',
          description: 'Description',
          techStack: ['React'],
          status: 'PLANNING',
          category: 'OTHER',
          difficulty: 'BEGINNER',
          ownerId: 'user-1',
        }),
      }));
    });
  });

  describe('updateProject', () => {
    it('should update an existing project', async () => {
      const mockProject = { id: '1', title: 'Old Title' };
      const updatedProject = { id: '1', title: 'New Title' };

      // Mock getProjectById successful
      vi.spyOn(service, 'getProjectById').mockResolvedValue(mockProject as any);
      vi.mocked(prisma.project.update).mockResolvedValue(updatedProject as any);

      const result = await service.updateProject('1', { title: 'New Title' });

      expect(result).toEqual(updatedProject);
      expect(prisma.project.update).toHaveBeenCalledWith(expect.objectContaining({
        where: { id: '1' },
        data: expect.objectContaining({ title: 'New Title' }),
      }));
    });

    it('should throw if project does not exist', async () => {
      vi.spyOn(service, 'getProjectById').mockRejectedValue(new NotFoundError('Project'));

      await expect(service.updateProject('1', { title: 'New Title' })).rejects.toThrow(NotFoundError);
    });
  });

  describe('deleteProject', () => {
    it('should delete an existing project', async () => {
      const mockProject = { id: '1', title: 'Test' };
      vi.spyOn(service, 'getProjectById').mockResolvedValue(mockProject as any);
      vi.mocked(prisma.project.delete).mockResolvedValue(mockProject as any);

      const result = await service.deleteProject('1');

      expect(result).toEqual({ success: true });
      expect(prisma.project.delete).toHaveBeenCalledWith({ where: { id: '1' } });
    });
  });

  describe('addProjectMember', () => {
    it('should add a member to the project', async () => {
      const mockProject = { id: '1', title: 'Test' };
      const mockMember = { id: 'member-1', userId: 'user-1' };

      vi.spyOn(service, 'getProjectById').mockResolvedValue(mockProject as any);
      vi.mocked(prisma.projectMember.findUnique).mockResolvedValue(null);
      vi.mocked(prisma.projectMember.create).mockResolvedValue(mockMember as any);

      const result = await service.addProjectMember('1', 'user-1', 'DEVELOPER');

      expect(result).toEqual(mockMember);
      expect(prisma.projectMember.create).toHaveBeenCalledWith(expect.objectContaining({
        data: { projectId: '1', userId: 'user-1', role: 'DEVELOPER' },
      }));
    });

    it('should throw error if user is already a member', async () => {
      const mockProject = { id: '1', title: 'Test' };
      const existingMember = { id: 'member-1', userId: 'user-1' };

      vi.spyOn(service, 'getProjectById').mockResolvedValue(mockProject as any);
      vi.mocked(prisma.projectMember.findUnique).mockResolvedValue(existingMember as any);

      await expect(service.addProjectMember('1', 'user-1')).rejects.toThrow('User is already a member of this project');
    });
  });

  describe('removeProjectMember', () => {
    it('should remove an existing member', async () => {
      const mockProject = { id: '1', title: 'Test' };
      const existingMember = { id: 'member-1', userId: 'user-1' };

      vi.spyOn(service, 'getProjectById').mockResolvedValue(mockProject as any);
      vi.mocked(prisma.projectMember.findUnique).mockResolvedValue(existingMember as any);
      vi.mocked(prisma.projectMember.delete).mockResolvedValue(existingMember as any);

      const result = await service.removeProjectMember('1', 'user-1');

      expect(result).toEqual({ success: true });
      expect(prisma.projectMember.delete).toHaveBeenCalledWith({
        where: { projectId_userId: { projectId: '1', userId: 'user-1' } },
      });
    });

    it('should throw NotFoundError if member is not found', async () => {
      const mockProject = { id: '1', title: 'Test' };

      vi.spyOn(service, 'getProjectById').mockResolvedValue(mockProject as any);
      vi.mocked(prisma.projectMember.findUnique).mockResolvedValue(null);

      await expect(service.removeProjectMember('1', 'user-1')).rejects.toThrow(NotFoundError);
    });
  });

  describe('isProjectOwnerOrMember', () => {
    it('should return true if user is owner', async () => {
      vi.mocked(prisma.project.findUnique).mockResolvedValue({
        ownerId: 'user-1',
        members: [],
      } as any);

      const result = await service.isProjectOwnerOrMember('1', 'user-1');
      expect(result).toBe(true);
    });

    it('should return true if user is a member', async () => {
      vi.mocked(prisma.project.findUnique).mockResolvedValue({
        ownerId: 'user-2',
        members: [{ id: 'member-1' }],
      } as any);

      const result = await service.isProjectOwnerOrMember('1', 'user-1');
      expect(result).toBe(true);
    });

    it('should return false if user is neither owner nor member', async () => {
      vi.mocked(prisma.project.findUnique).mockResolvedValue({
        ownerId: 'user-2',
        members: [],
      } as any);

      const result = await service.isProjectOwnerOrMember('1', 'user-1');
      expect(result).toBe(false);
    });

    it('should return false if project is not found', async () => {
      vi.mocked(prisma.project.findUnique).mockResolvedValue(null);

      const result = await service.isProjectOwnerOrMember('1', 'user-1');
      expect(result).toBe(false);
    });
  });

  describe('isProjectOwner', () => {
    it('should return true if user is owner', async () => {
      vi.mocked(prisma.project.findUnique).mockResolvedValue({ ownerId: 'user-1' } as any);

      const result = await service.isProjectOwner('1', 'user-1');
      expect(result).toBe(true);
    });

    it('should return false if user is not owner', async () => {
      vi.mocked(prisma.project.findUnique).mockResolvedValue({ ownerId: 'user-2' } as any);

      const result = await service.isProjectOwner('1', 'user-1');
      expect(result).toBe(false);
    });

    it('should return false if project is not found', async () => {
      vi.mocked(prisma.project.findUnique).mockResolvedValue(null);

      const result = await service.isProjectOwner('1', 'user-1');
      expect(result).toBe(false);
    });
  });
});
