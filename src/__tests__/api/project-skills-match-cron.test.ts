import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GET as projectSkillsMatchHandler } from '../../app/api/cron/project-skills-match/route';
import { createMockNextRequest } from '../utils/api-test-helpers';

const mockPrisma = vi.hoisted(() => ({
  user: {
    findMany: vi.fn(),
  },
  project: {
    findMany: vi.fn(),
  },
  notification: {
    findMany: vi.fn(),
    create: vi.fn(),
  },
}));

vi.mock('../../lib/prisma', () => ({
  prisma: mockPrisma,
}));

const mockSendProjectMatchEmail = vi.fn().mockResolvedValue({ success: true });

vi.mock('../../lib/services/email.service', () => ({
  EmailService: {
    sendProjectMatchEmail: (...args: any[]) => mockSendProjectMatchEmail(...args),
  },
}));

describe('Project Skills Match Cron Tests', () => {
  beforeEach(() => {
    mockPrisma.user.findMany.mockReset();
    mockPrisma.project.findMany.mockReset();
    mockPrisma.notification.findMany.mockReset();
    mockPrisma.notification.create.mockReset();
    mockSendProjectMatchEmail.mockReset();
    mockSendProjectMatchEmail.mockResolvedValue({ success: true });
    process.env.CRON_SECRET = 'test-secret';
  });

  it('should require a valid authorization secret', async () => {
    const request = createMockNextRequest({
      method: 'GET',
      url: 'http://localhost:3000/api/cron/project-skills-match',
      headers: {
        authorization: 'Bearer wrong-secret',
      },
    });

    const response = await projectSkillsMatchHandler(request);
    expect(response.status).toBe(401);
  });

  it('should return success and 0 emails if no users have skills defined', async () => {
    mockPrisma.user.findMany.mockResolvedValueOnce([
      { id: 'user-1', email: 'user1@example.com', name: 'Alice', skills: [] },
    ]);
    mockPrisma.project.findMany.mockResolvedValueOnce([
      { id: 'proj-1', title: 'React App', description: 'desc', techStack: ['React'], ownerId: 'user-2', members: [] },
    ]);

    const request = createMockNextRequest({
      method: 'GET',
      url: 'http://localhost:3000/api/cron/project-skills-match',
      headers: {
        authorization: 'Bearer test-secret',
      },
    });

    const response = await projectSkillsMatchHandler(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.stats.emailsSent).toBe(0);
  });

  it('should match user skills with project tech stack case-insensitively', async () => {
    mockPrisma.user.findMany.mockResolvedValueOnce([
      { id: 'user-1', email: 'user1@example.com', name: 'Alice', skills: ['react', 'TypeScript'] },
    ]);
    mockPrisma.project.findMany.mockResolvedValueOnce([
      { id: 'proj-1', title: 'React App', description: 'desc', techStack: ['React', 'CSS'], ownerId: 'user-2', members: [] },
    ]);
    mockPrisma.notification.findMany.mockResolvedValueOnce([]);

    const request = createMockNextRequest({
      method: 'GET',
      url: 'http://localhost:3000/api/cron/project-skills-match',
      headers: {
        authorization: 'Bearer test-secret',
      },
    });

    const response = await projectSkillsMatchHandler(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.stats.emailsSent).toBe(1);
    expect(data.stats.totalMatches).toBe(1);

    expect(mockSendProjectMatchEmail).toHaveBeenCalledWith(
      expect.objectContaining({ id: 'user-1', email: 'user1@example.com' }),
      expect.arrayContaining([
        expect.objectContaining({
          id: 'proj-1',
          title: 'React App',
          matchedSkills: ['React'],
        }),
      ])
    );

    expect(mockPrisma.notification.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          userId: 'user-1',
          title: 'Project Match Found',
          metadata: { projectIds: ['proj-1'] },
        }),
      })
    );
  });

  it('should filter out projects owned by the user, where user is a member, or already notified', async () => {
    mockPrisma.user.findMany.mockResolvedValueOnce([
      { id: 'user-1', email: 'user1@example.com', name: 'Alice', skills: ['React'] },
    ]);

    mockPrisma.project.findMany.mockResolvedValueOnce([
      // Owned project (should ignore)
      { id: 'proj-own', title: 'Own React App', description: 'desc', techStack: ['React'], ownerId: 'user-1', members: [] },
      // Already a member project (should ignore)
      { id: 'proj-member', title: 'Member React App', description: 'desc', techStack: ['React'], ownerId: 'user-2', members: [{ userId: 'user-1' }] },
      // Already recommended project (should ignore)
      { id: 'proj-notified', title: 'Notified React App', description: 'desc', techStack: ['React'], ownerId: 'user-3', members: [] },
      // Valid project (should match)
      { id: 'proj-valid', title: 'Valid React App', description: 'desc', techStack: ['React'], ownerId: 'user-4', members: [] },
    ]);

    // Mock already notified project
    mockPrisma.notification.findMany.mockResolvedValueOnce([
      { userId: 'user-1', metadata: { projectIds: ['proj-notified'] } },
    ]);

    const request = createMockNextRequest({
      method: 'GET',
      url: 'http://localhost:3000/api/cron/project-skills-match',
      headers: {
        authorization: 'Bearer test-secret',
      },
    });

    const response = await projectSkillsMatchHandler(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.stats.emailsSent).toBe(1);
    expect(data.stats.totalMatches).toBe(1);

    // Verify only the valid project is recommended
    expect(mockSendProjectMatchEmail).toHaveBeenCalledWith(
      expect.any(Object),
      [
        expect.objectContaining({
          id: 'proj-valid',
          title: 'Valid React App',
        }),
      ]
    );
  });
});
