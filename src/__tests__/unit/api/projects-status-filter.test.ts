import { describe, it, expect, beforeEach, vi } from 'vitest';
import { GET } from '@/app/api/projects/route';
import { NextRequest } from 'next/server';
import { projectService } from '@/lib/services/project.service';

// Mock the auth middleware
vi.mock('@/lib/middleware/auth.middleware', () => ({
  requireAuth: vi.fn().mockResolvedValue({
    user: { id: 'test-user-id', email: 'test@example.com' },
  }),
}));

// Mock the project service
vi.mock('@/lib/services/project.service', () => ({
  projectService: {
    listProjects: vi.fn(),
  },
}));

// Mock the cache service
vi.mock('@/lib/services/cache.service', () => ({
  cacheService: {
    getOrSet: vi.fn(async (key, fetcher) => fetcher()),
  },
  CacheKeys: {
    project: {
      completed: vi.fn().mockReturnValue('mock-cache-key'),
    },
  },
  CacheTTL: {
    PROJECT_COMPLETED: 300,
  },
}));


// Mock prisma to prevent DB connection attempts
vi.mock('@/lib/prisma', () => ({
  prisma: {
    project: {
      findMany: vi.fn().mockResolvedValue([]),
      count: vi.fn().mockResolvedValue(0),
      findUnique: vi.fn().mockResolvedValue(null),
      create: vi.fn().mockResolvedValue({}),
      update: vi.fn().mockResolvedValue({}),
      delete: vi.fn().mockResolvedValue({}),
    },
    $connect: vi.fn().mockResolvedValue(undefined),
    $disconnect: vi.fn().mockResolvedValue(undefined),
  },
}));

describe('GET /api/projects - Status Filter', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should filter projects by PLANNING status', async () => {
    const mockProjects = [
      { id: '1', title: 'Project 1', status: 'PLANNING' },
      { id: '2', title: 'Project 2', status: 'PLANNING' },
    ];

    vi.mocked(projectService.listProjects).mockResolvedValue({
      projects: mockProjects as any,
      pagination: { page: 1, pageSize: 10, totalCount: 2, totalPages: 1 },
    });

    const request = new NextRequest('http://localhost:3000/api/projects?status=PLANNING');
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(projectService.listProjects).toHaveBeenCalledWith(
      expect.objectContaining({ status: 'PLANNING' })
    );
    expect(data.success).toBe(true);
  });

  it('should filter projects by IN_PROGRESS status', async () => {
    const mockProjects = [
      { id: '3', title: 'Project 3', status: 'IN_PROGRESS' },
    ];

    vi.mocked(projectService.listProjects).mockResolvedValue({
      projects: mockProjects as any,
      pagination: { page: 1, pageSize: 10, totalCount: 1, totalPages: 1 },
    });

    const request = new NextRequest('http://localhost:3000/api/projects?status=IN_PROGRESS');
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(projectService.listProjects).toHaveBeenCalledWith(
      expect.objectContaining({ status: 'IN_PROGRESS' })
    );
    expect(data.success).toBe(true);
  });

  it('should filter projects by COMPLETED status', async () => {
    const mockProjects = [
      { id: '4', title: 'Project 4', status: 'COMPLETED' },
    ];

    vi.mocked(projectService.listProjects).mockResolvedValue({
      projects: mockProjects as any,
      pagination: { page: 1, pageSize: 10, totalCount: 1, totalPages: 1 },
    });

    const request = new NextRequest('http://localhost:3000/api/projects?status=COMPLETED');
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(projectService.listProjects).toHaveBeenCalledWith(
      expect.objectContaining({ status: 'COMPLETED' })
    );
    expect(data.success).toBe(true);
  });

  it('should filter projects by ARCHIVED status', async () => {
    const mockProjects = [
      { id: '5', title: 'Project 5', status: 'ARCHIVED' },
    ];

    vi.mocked(projectService.listProjects).mockResolvedValue({
      projects: mockProjects as any,
      pagination: { page: 1, pageSize: 10, totalCount: 1, totalPages: 1 },
    });

    const request = new NextRequest('http://localhost:3000/api/projects?status=ARCHIVED');
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(projectService.listProjects).toHaveBeenCalledWith(
      expect.objectContaining({ status: 'ARCHIVED' })
    );
    expect(data.success).toBe(true);
  });

  it('should return all projects when no status filter is provided', async () => {
    const mockProjects = [
      { id: '1', title: 'Project 1', status: 'PLANNING' },
      { id: '2', title: 'Project 2', status: 'IN_PROGRESS' },
      { id: '3', title: 'Project 3', status: 'COMPLETED' },
    ];

    vi.mocked(projectService.listProjects).mockResolvedValue({
      projects: mockProjects as any,
      pagination: { page: 1, pageSize: 10, totalCount: 3, totalPages: 1 },
    });

    const request = new NextRequest('http://localhost:3000/api/projects');
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(projectService.listProjects).toHaveBeenCalledWith(
      expect.objectContaining({ status: undefined })
    );
    expect(data.success).toBe(true);
  });

  it('should combine status filter with other filters', async () => {
    const mockProjects = [
      { id: '6', title: 'Project 6', status: 'IN_PROGRESS', category: 'WEB_DEV' },
    ];

    vi.mocked(projectService.listProjects).mockResolvedValue({
      projects: mockProjects as any,
      pagination: { page: 1, pageSize: 10, totalCount: 1, totalPages: 1 },
    });

    const request = new NextRequest(
      'http://localhost:3000/api/projects?status=IN_PROGRESS&category=WEB_DEV'
    );
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(projectService.listProjects).toHaveBeenCalledWith(
      expect.objectContaining({
        status: 'IN_PROGRESS',
        category: 'WEB_DEV',
      })
    );
    expect(data.success).toBe(true);
  });
});
