/**
 * Basic unit tests for project filter utilities
 * Feature: project-page-ui-improvements
 */

import { describe, it, expect } from 'vitest';
import {
  filterProjectsBySearch,
  filterProjects,
  sortProjects,
  countActiveFilters,
  hasActiveFilters,
  createEmptyFilters,
} from '../project-filters';
import type { ExtendedProject } from '@/lib/types/project-page.types';

describe('Project Filter Utilities', () => {
  const mockProjects: ExtendedProject[] = [
    {
      id: '1',
      title: 'React Dashboard',
      description: 'A modern dashboard built with React',
      techStack: ['React', 'TypeScript', 'Tailwind'],
      status: 'IN_PROGRESS',
      category: 'WEB_DEV',
      difficulty: 'INTERMEDIATE',
      imageUrl: null,
      githubUrl: null,
      liveUrl: null,
      outcomes: null,
      ownerId: 'user1',
      createdAt: '2024-01-15T00:00:00Z',
      updatedAt: '2024-01-15T00:00:00Z',
      _count: { members: 3 },
    },
    {
      id: '2',
      title: 'Mobile App',
      description: 'iOS and Android mobile application',
      techStack: ['React Native', 'TypeScript'],
      status: 'PLANNING',
      category: 'MOBILE',
      difficulty: 'ADVANCED',
      imageUrl: null,
      githubUrl: null,
      liveUrl: null,
      outcomes: null,
      ownerId: 'user2',
      createdAt: '2024-01-20T00:00:00Z',
      updatedAt: '2024-01-20T00:00:00Z',
      _count: { members: 2 },
    },
  ];

  describe('filterProjectsBySearch', () => {
    it('should return all projects when search term is empty', () => {
      const result = filterProjectsBySearch(mockProjects, '');
      expect(result).toHaveLength(2);
    });

    it('should filter by title (case-insensitive)', () => {
      const result = filterProjectsBySearch(mockProjects, 'react');
      expect(result).toHaveLength(1);
      expect(result[0].title).toBe('React Dashboard');
    });

    it('should filter by description', () => {
      const result = filterProjectsBySearch(mockProjects, 'mobile');
      expect(result).toHaveLength(1);
      expect(result[0].title).toBe('Mobile App');
    });
  });

  describe('filterProjects', () => {
    it('should return all projects with empty filters', () => {
      const filters = createEmptyFilters();
      const result = filterProjects(mockProjects, filters);
      expect(result).toHaveLength(2);
    });

    it('should filter by tech stack', () => {
      const filters = createEmptyFilters();
      filters.techStack = ['React'];
      const result = filterProjects(mockProjects, filters);
      expect(result).toHaveLength(1);
      expect(result[0].title).toBe('React Dashboard');
    });

    it('should filter by difficulty', () => {
      const filters = createEmptyFilters();
      filters.difficulty = 'ADVANCED';
      const result = filterProjects(mockProjects, filters);
      expect(result).toHaveLength(1);
      expect(result[0].title).toBe('Mobile App');
    });

    it('should filter by category', () => {
      const filters = createEmptyFilters();
      filters.category = 'WEB_DEV';
      const result = filterProjects(mockProjects, filters);
      expect(result).toHaveLength(1);
      expect(result[0].title).toBe('React Dashboard');
    });
  });

  describe('sortProjects', () => {
    it('should sort by newest', () => {
      const result = sortProjects(mockProjects, 'newest');
      expect(result[0].title).toBe('Mobile App');
      expect(result[1].title).toBe('React Dashboard');
    });

    it('should sort by popular (member count)', () => {
      const result = sortProjects(mockProjects, 'popular');
      expect(result[0].title).toBe('React Dashboard');
      expect(result[1].title).toBe('Mobile App');
    });

    it('should sort by team size (ascending)', () => {
      const result = sortProjects(mockProjects, 'teamSize');
      expect(result[0].title).toBe('Mobile App');
      expect(result[1].title).toBe('React Dashboard');
    });
  });

  describe('countActiveFilters', () => {
    it('should return 0 for empty filters', () => {
      const filters = createEmptyFilters();
      expect(countActiveFilters(filters)).toBe(0);
    });

    it('should count active filters correctly', () => {
      const filters = createEmptyFilters();
      filters.techStack = ['React'];
      filters.difficulty = 'INTERMEDIATE';
      expect(countActiveFilters(filters)).toBe(2);
    });
  });

  describe('hasActiveFilters', () => {
    it('should return false for empty filters', () => {
      const filters = createEmptyFilters();
      expect(hasActiveFilters(filters)).toBe(false);
    });

    it('should return true when filters are active', () => {
      const filters = createEmptyFilters();
      filters.category = 'WEB_DEV';
      expect(hasActiveFilters(filters)).toBe(true);
    });
  });
});
