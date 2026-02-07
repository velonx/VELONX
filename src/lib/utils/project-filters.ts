/**
 * Project filtering utilities
 * Feature: project-page-ui-improvements
 */

import {
  ExtendedProject,
  ProjectFilters,
  SortOption,
} from '@/lib/types/project-page.types';

/**
 * Filter projects by search term (case-insensitive)
 * Searches in project title and description
 * 
 * @param projects - Array of projects to filter
 * @param searchTerm - Search term to match
 * @returns Filtered array of projects
 */
export function filterProjectsBySearch(
  projects: ExtendedProject[],
  searchTerm: string
): ExtendedProject[] {
  if (!searchTerm || searchTerm.trim() === '') {
    return projects;
  }

  const normalizedSearch = searchTerm.toLowerCase().trim();

  return projects.filter((project) => {
    const titleMatch = project.title.toLowerCase().includes(normalizedSearch);
    const descriptionMatch = project.description
      .toLowerCase()
      .includes(normalizedSearch);

    return titleMatch || descriptionMatch;
  });
}

/**
 * Filter projects by multiple filter criteria
 * Applies AND logic across all filters
 * 
 * @param projects - Array of projects to filter
 * @param filters - Filter criteria object
 * @returns Filtered array of projects
 */
export function filterProjects(
  projects: ExtendedProject[],
  filters: ProjectFilters
): ExtendedProject[] {
  return projects.filter((project) => {
    // Tech stack filter (OR logic within tech stack, AND with other filters)
    if (filters.techStack.length > 0) {
      const hasMatchingTech = filters.techStack.some((tech) =>
        project.techStack.some(
          (projectTech) =>
            projectTech.toLowerCase() === tech.toLowerCase()
        )
      );
      if (!hasMatchingTech) return false;
    }

    // Difficulty filter
    if (filters.difficulty && project.difficulty !== filters.difficulty) {
      return false;
    }

    // Team size filter
    if (filters.teamSize) {
      const memberCount = project._count?.members || 0;
      if (
        memberCount < filters.teamSize.min ||
        memberCount > filters.teamSize.max
      ) {
        return false;
      }
    }

    // Category filter
    if (filters.category && project.category !== filters.category) {
      return false;
    }

    return true;
  });
}

/**
 * Sort projects by specified criteria
 * 
 * @param projects - Array of projects to sort
 * @param sortBy - Sort option
 * @returns Sorted array of projects
 */
export function sortProjects(
  projects: ExtendedProject[],
  sortBy: SortOption
): ExtendedProject[] {
  const sorted = [...projects];

  switch (sortBy) {
    case 'newest':
      return sorted.sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );

    case 'popular':
      return sorted.sort(
        (a, b) => (b._count?.members || 0) - (a._count?.members || 0)
      );

    case 'teamSize':
      return sorted.sort(
        (a, b) => (a._count?.members || 0) - (b._count?.members || 0)
      );

    case 'techStack':
      return sorted.sort((a, b) => {
        const aPrimary = a.techStack[0] || '';
        const bPrimary = b.techStack[0] || '';
        return aPrimary.localeCompare(bPrimary);
      });

    default:
      return sorted;
  }
}

/**
 * Apply search, filters, and sort to projects
 * 
 * @param projects - Array of projects
 * @param searchTerm - Search term
 * @param filters - Filter criteria
 * @param sortBy - Sort option
 * @returns Processed array of projects
 */
export function processProjects(
  projects: ExtendedProject[],
  searchTerm: string,
  filters: ProjectFilters,
  sortBy: SortOption
): ExtendedProject[] {
  let result = projects;

  // Apply search
  result = filterProjectsBySearch(result, searchTerm);

  // Apply filters
  result = filterProjects(result, filters);

  // Apply sort
  result = sortProjects(result, sortBy);

  return result;
}

/**
 * Count active filters
 * 
 * @param filters - Filter criteria object
 * @returns Number of active filters
 */
export function countActiveFilters(filters: ProjectFilters): number {
  let count = 0;

  if (filters.techStack.length > 0) count++;
  if (filters.difficulty !== null) count++;
  if (filters.teamSize !== null) count++;
  if (filters.category !== null) count++;

  return count;
}

/**
 * Check if any filters are active
 * 
 * @param filters - Filter criteria object
 * @returns True if any filters are active
 */
export function hasActiveFilters(filters: ProjectFilters): boolean {
  return countActiveFilters(filters) > 0;
}

/**
 * Create empty filter state
 * 
 * @returns Empty ProjectFilters object
 */
export function createEmptyFilters(): ProjectFilters {
  return {
    techStack: [],
    difficulty: null,
    teamSize: null,
    category: null,
  };
}

/**
 * Get unique tech stacks from projects
 * 
 * @param projects - Array of projects
 * @returns Sorted array of unique tech stack items
 */
export function getUniqueTechStacks(projects: ExtendedProject[]): string[] {
  const techStackSet = new Set<string>();

  projects.forEach((project) => {
    project.techStack.forEach((tech) => {
      techStackSet.add(tech);
    });
  });

  return Array.from(techStackSet).sort();
}
