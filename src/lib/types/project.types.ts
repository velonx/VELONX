/**
 * Project Completion Hall of Fame Types
 * Feature: project-completion-hall-of-fame
 * 
 * This file contains TypeScript types and interfaces for the project completion
 * and Hall of Fame features, including completion workflows, API responses,
 * and celebration data.
 */

import { Project, ProjectMember, ProjectCategory, ProjectDifficulty, ProjectStatus } from '@/lib/api/types';

// Re-export types from API types for convenience
export type { ProjectCategory, ProjectDifficulty, ProjectStatus };

/**
 * Extended project interface with completion data
 * Requirements: 4.4, 5.1, 5.2
 */
export interface CompletedProject {
  id: string;
  title: string;
  description: string;
  techStack: string[];
  status: 'COMPLETED';
  category: ProjectCategory;
  difficulty: ProjectDifficulty;
  imageUrl: string | null;
  githubUrl: string | null;
  liveUrl: string | null;
  outcomes: string | null;
  completedAt: Date;
  completedBy: string;
  owner: {
    id: string;
    name: string;
    image: string | null;
  };
  members: Array<{
    id: string;
    name: string;
    image: string | null;
    role: string | null;
  }>;
  teamSize: number;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Project completion result returned from API
 * Requirements: 2.6
 */
export interface ProjectCompletionResult {
  project: CompletedProject;
  xpAwarded: {
    owner: number;
    members: number;
  };
  teamMembers: {
    owner: { id: string; name: string; xpAwarded: number };
    members: Array<{ id: string; name: string; xpAwarded: number }>;
  };
}

/**
 * Hall of Fame filter options
 * Requirements: 5.1, 5.2
 */
export interface HallOfFameFilters {
  search: string;
  techStack: string[];
  category: ProjectCategory | null;
  difficulty: ProjectDifficulty | null;
  sortBy: 'completedAt' | 'title' | 'teamSize';
  sortOrder: 'asc' | 'desc';
}

/**
 * Celebration data displayed after project completion
 * Requirements: 9.3
 */
export interface CompletionCelebrationData {
  projectId: string;
  projectTitle: string;
  xpAwarded: number;
  hallOfFameUrl: string;
  completedAt: Date;
}

/**
 * API response for project completion endpoint
 * POST /api/projects/[id]/complete
 * Requirements: 2.6
 */
export interface CompleteProjectResponse {
  success: true;
  data: {
    project: {
      id: string;
      title: string;
      status: 'COMPLETED';
      completedAt: string;
      completedBy: string;
      xpAwarded: {
        owner: number;
        members: number;
      };
    };
    teamMembers: {
      owner: { id: string; name: string; xpAwarded: number };
      members: Array<{ id: string; name: string; xpAwarded: number }>;
    };
  };
}

/**
 * API response for Hall of Fame endpoint
 * GET /api/projects/hall-of-fame
 * Requirements: 4.2
 */
export interface HallOfFameResponse {
  success: true;
  data: {
    projects: Array<{
      id: string;
      title: string;
      description: string;
      techStack: string[];
      category: ProjectCategory;
      difficulty: ProjectDifficulty;
      imageUrl: string | null;
      githubUrl: string | null;
      liveUrl: string | null;
      completedAt: string;
      owner: {
        id: string;
        name: string;
        image: string | null;
      };
      members: Array<{
        id: string;
        name: string;
        image: string | null;
        role: string | null;
      }>;
      teamSize: number;
    }>;
    pagination: {
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    };
  };
}

/**
 * Error response for project completion
 * Requirements: 2.6
 */
export interface ProjectCompletionError {
  success: false;
  error: {
    code: 'INVALID_STATUS' | 'ALREADY_COMPLETED' | 'PROJECT_NOT_FOUND' | 'UNAUTHORIZED' | 'UNAUTHENTICATED';
    message: string;
    details?: any;
    timestamp: string;
  };
}

/**
 * Validation result for project completion eligibility
 */
export interface CompletionValidation {
  isValid: boolean;
  error?: {
    code: string;
    message: string;
  };
}

/**
 * Project with completion button state
 * Used in ProjectCard component
 */
export interface ProjectWithCompletionState extends Omit<Project, 'completedAt'> {
  canComplete: boolean;
  isCompleting?: boolean;
  completedAt?: Date | string | null;
  completedBy?: string;
}

/**
 * Hall of Fame query parameters
 * Requirements: 5.1, 5.2, 5.4
 */
export interface HallOfFameQueryParams {
  search?: string;
  techStack?: string[];
  category?: ProjectCategory;
  difficulty?: ProjectDifficulty;
  sortBy?: 'completedAt' | 'title' | 'teamSize';
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

/**
 * Pagination data for Hall of Fame
 */
export interface HallOfFamePagination {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

/**
 * Project status filter for dashboard
 * Requirements: 6.1, 6.2
 */
export type ProjectStatusFilter = 'ALL' | 'IN_PROGRESS' | 'COMPLETED';

/**
 * Dashboard project counts
 * Requirements: 6.5
 */
export interface DashboardProjectCounts {
  all: number;
  inProgress: number;
  completed: number;
}
