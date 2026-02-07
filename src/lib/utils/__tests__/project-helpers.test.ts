/**
 * Basic unit tests for project helper utilities
 * Feature: project-page-ui-improvements
 */

import { describe, it, expect } from 'vitest';
import {
  getUserProjectRelationship,
  getJoinButtonText,
  isJoinButtonDisabled,
  getTechStackDisplay,
  getTeamMembersDisplay,
  getUserInitials,
  getProjectLinks,
} from '../project-helpers';
import type { ExtendedProject } from '@/lib/types/project-page.types';

describe('Project Helper Utilities', () => {
  const mockProject: ExtendedProject = {
    id: '1',
    title: 'Test Project',
    description: 'Test description',
    techStack: ['React', 'TypeScript', 'Node.js', 'MongoDB', 'Docker', 'AWS'],
    status: 'IN_PROGRESS',
    imageUrl: null,
    githubUrl: 'https://github.com/test/repo',
    liveUrl: 'https://test.com',
    outcomes: null,
    ownerId: 'owner123',
    createdAt: '2024-01-15T00:00:00Z',
    updatedAt: '2024-01-15T00:00:00Z',
    members: [
      { id: '1', projectId: '1', userId: 'member1', role: 'Developer', joinedAt: '2024-01-15T00:00:00Z' },
      { id: '2', projectId: '1', userId: 'member2', role: 'Designer', joinedAt: '2024-01-15T00:00:00Z' },
    ],
    joinRequests: [
      { id: '1', projectId: '1', userId: 'pending1', status: 'PENDING', createdAt: '2024-01-15T00:00:00Z' },
    ],
  };

  describe('getUserProjectRelationship', () => {
    it('should return "owner" for project owner', () => {
      const result = getUserProjectRelationship(mockProject, 'owner123');
      expect(result).toBe('owner');
    });

    it('should return "member" for project member', () => {
      const result = getUserProjectRelationship(mockProject, 'member1');
      expect(result).toBe('member');
    });

    it('should return "pending" for user with pending request', () => {
      const result = getUserProjectRelationship(mockProject, 'pending1');
      expect(result).toBe('pending');
    });

    it('should return "none" for unrelated user', () => {
      const result = getUserProjectRelationship(mockProject, 'other123');
      expect(result).toBe('none');
    });

    it('should return "none" when userId is undefined', () => {
      const result = getUserProjectRelationship(mockProject, undefined);
      expect(result).toBe('none');
    });
  });

  describe('getJoinButtonText', () => {
    it('should return correct text for owner', () => {
      expect(getJoinButtonText('owner')).toBe('Your Project');
    });

    it('should return correct text for member', () => {
      expect(getJoinButtonText('member')).toBe('Member');
    });

    it('should return correct text for pending', () => {
      expect(getJoinButtonText('pending')).toBe('Request Pending');
    });

    it('should return correct text for none', () => {
      expect(getJoinButtonText('none')).toBe('Request to Join');
    });
  });

  describe('isJoinButtonDisabled', () => {
    it('should be disabled for owner', () => {
      expect(isJoinButtonDisabled('owner')).toBe(true);
    });

    it('should be disabled for member', () => {
      expect(isJoinButtonDisabled('member')).toBe(true);
    });

    it('should be disabled for pending', () => {
      expect(isJoinButtonDisabled('pending')).toBe(true);
    });

    it('should not be disabled for none', () => {
      expect(isJoinButtonDisabled('none')).toBe(false);
    });
  });

  describe('getTechStackDisplay', () => {
    it('should return all items when below max', () => {
      const result = getTechStackDisplay(['React', 'TypeScript'], 5);
      expect(result.displayItems).toHaveLength(2);
      expect(result.remainingCount).toBe(0);
    });

    it('should limit items and show remaining count', () => {
      const result = getTechStackDisplay(mockProject.techStack, 3);
      expect(result.displayItems).toHaveLength(3);
      expect(result.remainingCount).toBe(3);
    });
  });

  describe('getTeamMembersDisplay', () => {
    it('should return all members when below max', () => {
      const result = getTeamMembersDisplay(mockProject.members || [], 4);
      expect(result.displayMembers).toHaveLength(2);
      expect(result.remainingCount).toBe(0);
    });

    it('should limit members and show remaining count', () => {
      const members = Array(10).fill(null).map((_, i) => ({
        id: `${i}`,
        projectId: '1',
        userId: `user${i}`,
        role: 'Developer',
        joinedAt: '2024-01-15T00:00:00Z',
      }));
      const result = getTeamMembersDisplay(members, 4);
      expect(result.displayMembers).toHaveLength(4);
      expect(result.remainingCount).toBe(6);
    });
  });

  describe('getUserInitials', () => {
    it('should return initials for full name', () => {
      expect(getUserInitials('John Doe')).toBe('JD');
    });

    it('should return first two letters for single name', () => {
      expect(getUserInitials('John')).toBe('JO');
    });

    it('should return ?? for null', () => {
      expect(getUserInitials(null)).toBe('??');
    });

    it('should return ?? for undefined', () => {
      expect(getUserInitials(undefined)).toBe('??');
    });

    it('should handle multiple spaces', () => {
      expect(getUserInitials('John   Doe')).toBe('JD');
    });
  });

  describe('getProjectLinks', () => {
    it('should detect GitHub link', () => {
      const result = getProjectLinks(mockProject);
      expect(result.hasGithub).toBe(true);
      expect(result.hasDemo).toBe(true);
      expect(result.hasAnyLink).toBe(true);
    });

    it('should handle no links', () => {
      const projectNoLinks = { ...mockProject, githubUrl: null, liveUrl: null };
      const result = getProjectLinks(projectNoLinks);
      expect(result.hasGithub).toBe(false);
      expect(result.hasDemo).toBe(false);
      expect(result.hasAnyLink).toBe(false);
    });
  });
});
