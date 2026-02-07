/**
 * Extended types for Project Page UI Improvements
 * Feature: project-page-ui-improvements
 */

import { Project, ProjectMember, ProjectCategory, ProjectDifficulty } from '@/lib/api/types';

// Re-export types from API types for convenience
export type { ProjectCategory, ProjectDifficulty };

// Join Request Status Enum
export type JoinRequestStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

// Extended Project interface with join requests
export interface ExtendedProject extends Project {
  joinRequests?: ProjectJoinRequest[];
}

// Project Join Request interface
export interface ProjectJoinRequest {
  id: string;
  projectId: string;
  userId: string;
  status: JoinRequestStatus;
  createdAt: string;
  user?: {
    id: string;
    name: string | null;
    image: string | null;
  };
}

// Filter state interface
export interface ProjectFilters {
  techStack: string[];
  difficulty: ProjectDifficulty | null;
  teamSize: { min: number; max: number } | null;
  category: ProjectCategory | null;
}

// Sort options
export type SortOption = 'newest' | 'popular' | 'teamSize' | 'techStack';

// User relationship to project
export type UserProjectRelationship = 'owner' | 'member' | 'pending' | 'none';

// Project page state interface
export interface ProjectsPageState {
  searchTerm: string;
  filters: ProjectFilters;
  sortBy: SortOption;
  selectedProjectId: string | null;
  joinRequestStatuses: Map<string, UserProjectRelationship>;
}

// Empty state variants
export type EmptyStateVariant = 'no-results' | 'no-projects' | 'no-completed';

// Category display configuration
export interface CategoryConfig {
  label: string;
  color: string;
  bgColor: string;
  borderColor: string;
}

// Category color mapping
export const CATEGORY_COLORS: Record<ProjectCategory, CategoryConfig> = {
  WEB_DEV: {
    label: 'Web Dev',
    color: '#219EBC',
    bgColor: 'bg-blue-100',
    borderColor: 'border-blue-500',
  },
  MOBILE: {
    label: 'Mobile',
    color: '#8B5CF6',
    bgColor: 'bg-purple-100',
    borderColor: 'border-purple-500',
  },
  AI_ML: {
    label: 'AI/ML',
    color: '#10B981',
    bgColor: 'bg-green-100',
    borderColor: 'border-green-500',
  },
  DATA_SCIENCE: {
    label: 'Data Science',
    color: '#F59E0B',
    bgColor: 'bg-orange-100',
    borderColor: 'border-orange-500',
  },
  DEVOPS: {
    label: 'DevOps',
    color: '#EF4444',
    bgColor: 'bg-red-100',
    borderColor: 'border-red-500',
  },
  DESIGN: {
    label: 'Design',
    color: '#EC4899',
    bgColor: 'bg-pink-100',
    borderColor: 'border-pink-500',
  },
  OTHER: {
    label: 'Other',
    color: '#6B7280',
    bgColor: 'bg-gray-100',
    borderColor: 'border-gray-500',
  },
};
