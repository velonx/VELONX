/**
 * Project helper utilities
 * Feature: project-page-ui-improvements
 */

import {
  ExtendedProject,
  UserProjectRelationship,
} from '@/lib/types/project-page.types';

/**
 * Determine user's relationship to a project
 * 
 * @param project - Project to check
 * @param userId - Current user's ID
 * @returns User's relationship to the project
 */
export function getUserProjectRelationship(
  project: ExtendedProject,
  userId: string | undefined
): UserProjectRelationship {
  if (!userId) {
    return 'none';
  }

  // Check if user is the owner
  if (project.ownerId === userId) {
    return 'owner';
  }

  // Check if user is a member
  const isMember = project.members?.some((member) => member.userId === userId);
  if (isMember) {
    return 'member';
  }

  // Check if user has a pending join request
  const hasPendingRequest = project.joinRequests?.some(
    (request) => request.userId === userId && request.status === 'PENDING'
  );
  if (hasPendingRequest) {
    return 'pending';
  }

  return 'none';
}

/**
 * Get display text for join button based on relationship
 * 
 * @param relationship - User's relationship to project
 * @returns Button text
 */
export function getJoinButtonText(relationship: UserProjectRelationship): string {
  switch (relationship) {
    case 'owner':
      return 'Your Project';
    case 'member':
      return 'Member';
    case 'pending':
      return 'Request Pending';
    case 'none':
      return 'Request to Join';
    default:
      return 'Request to Join';
  }
}

/**
 * Check if join button should be disabled
 * 
 * @param relationship - User's relationship to project
 * @returns True if button should be disabled
 */
export function isJoinButtonDisabled(
  relationship: UserProjectRelationship
): boolean {
  return relationship !== 'none';
}

/**
 * Check if project is seeking members (urgency indicator)
 * 
 * @param project - Project to check
 * @param targetTeamSize - Target team size (default: 5)
 * @returns True if project is seeking members
 */
export function isProjectSeekingMembers(
  project: ExtendedProject,
  targetTeamSize: number = 5
): boolean {
  const currentSize = project._count?.members || 0;
  return currentSize < targetTeamSize && project.status !== 'COMPLETED';
}

/**
 * Get tech stack display items (limit to maxDisplay)
 * 
 * @param techStack - Array of tech stack items
 * @param maxDisplay - Maximum number to display
 * @returns Object with displayItems and remainingCount
 */
export function getTechStackDisplay(
  techStack: string[],
  maxDisplay: number = 5
): { displayItems: string[]; remainingCount: number } {
  if (techStack.length <= maxDisplay) {
    return {
      displayItems: techStack,
      remainingCount: 0,
    };
  }

  return {
    displayItems: techStack.slice(0, maxDisplay),
    remainingCount: techStack.length - maxDisplay,
  };
}

/**
 * Get team members display (limit to maxDisplay)
 * 
 * @param members - Array of project members
 * @param maxDisplay - Maximum number to display
 * @returns Object with displayMembers and remainingCount
 */
export function getTeamMembersDisplay<T>(
  members: T[],
  maxDisplay: number = 4
): { displayMembers: T[]; remainingCount: number } {
  if (members.length <= maxDisplay) {
    return {
      displayMembers: members,
      remainingCount: 0,
    };
  }

  return {
    displayMembers: members.slice(0, maxDisplay),
    remainingCount: members.length - maxDisplay,
  };
}

/**
 * Get user initials from name
 * 
 * @param name - User's name
 * @returns Initials (max 2 characters)
 */
export function getUserInitials(name: string | null | undefined): string {
  if (!name) {
    return '??';
  }

  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) {
    return parts[0].substring(0, 2).toUpperCase();
  }

  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

/**
 * Format date for display
 * 
 * @param dateString - ISO date string
 * @returns Formatted date string
 */
export function formatProjectDate(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffInMs = now.getTime() - date.getTime();
  const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

  if (diffInDays === 0) {
    return 'Today';
  } else if (diffInDays === 1) {
    return 'Yesterday';
  } else if (diffInDays < 7) {
    return `${diffInDays} days ago`;
  } else if (diffInDays < 30) {
    const weeks = Math.floor(diffInDays / 7);
    return `${weeks} ${weeks === 1 ? 'week' : 'weeks'} ago`;
  } else if (diffInDays < 365) {
    const months = Math.floor(diffInDays / 30);
    return `${months} ${months === 1 ? 'month' : 'months'} ago`;
  } else {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  }
}

/**
 * Check if project has external links
 * 
 * @param project - Project to check
 * @returns Object indicating which links exist
 */
export function getProjectLinks(project: ExtendedProject): {
  hasGithub: boolean;
  hasDemo: boolean;
  hasAnyLink: boolean;
} {
  const hasGithub = !!project.githubUrl;
  const hasDemo = !!project.liveUrl;

  return {
    hasGithub,
    hasDemo,
    hasAnyLink: hasGithub || hasDemo,
  };
}

/**
 * Get ARIA label for project card
 * 
 * @param project - Project
 * @returns ARIA label string
 */
export function getProjectCardAriaLabel(project: ExtendedProject): string {
  const memberCount = project._count?.members || 0;
  const memberText = memberCount === 1 ? '1 member' : `${memberCount} members`;
  
  return `${project.title}. ${project.description.substring(0, 100)}. ${memberText}. Click to view details.`;
}

/**
 * Get ARIA label for quick action button
 * 
 * @param type - Type of action ('github' | 'demo')
 * @param projectTitle - Project title
 * @returns ARIA label string
 */
export function getQuickActionAriaLabel(
  type: 'github' | 'demo',
  projectTitle: string
): string {
  if (type === 'github') {
    return `View ${projectTitle} GitHub repository`;
  }
  return `View ${projectTitle} live demo`;
}
