/**
 * Session storage utilities for persisting user preferences
 * Feature: project-page-ui-improvements, events-page-ui-improvements
 */

import { ProjectFilters, SortOption } from '@/lib/types/project-page.types';
import { EventFilterState } from '@/lib/types/events.types';

const STORAGE_KEYS = {
  SORT_PREFERENCE: 'velonx_project_sort_preference',
  FILTER_PREFERENCE: 'velonx_project_filter_preference',
  EVENT_FILTER_PREFERENCE: 'velonx_event_filter_preference',
} as const;

/**
 * Save sort preference to session storage
 * 
 * @param sortBy - Sort option to save
 */
export function saveSortPreference(sortBy: SortOption): void {
  try {
    if (typeof window !== 'undefined' && window.sessionStorage) {
      sessionStorage.setItem(STORAGE_KEYS.SORT_PREFERENCE, sortBy);
    }
  } catch (error) {
    // Silently fail if session storage is unavailable
    console.warn('Failed to save sort preference:', error);
  }
}

/**
 * Load sort preference from session storage
 * 
 * @param defaultValue - Default value if no preference is saved
 * @returns Saved sort preference or default
 */
export function loadSortPreference(
  defaultValue: SortOption = 'newest'
): SortOption {
  try {
    if (typeof window !== 'undefined' && window.sessionStorage) {
      const saved = sessionStorage.getItem(STORAGE_KEYS.SORT_PREFERENCE);
      if (saved && isValidSortOption(saved)) {
        return saved as SortOption;
      }
    }
  } catch (error) {
    // Silently fail if session storage is unavailable
    console.warn('Failed to load sort preference:', error);
  }
  return defaultValue;
}

/**
 * Save filter preferences to session storage
 * 
 * @param filters - Filter state to save
 */
export function saveFilterPreference(filters: ProjectFilters): void {
  try {
    if (typeof window !== 'undefined' && window.sessionStorage) {
      sessionStorage.setItem(
        STORAGE_KEYS.FILTER_PREFERENCE,
        JSON.stringify(filters)
      );
    }
  } catch (error) {
    // Silently fail if session storage is unavailable
    console.warn('Failed to save filter preference:', error);
  }
}

/**
 * Load filter preferences from session storage
 * 
 * @param defaultValue - Default value if no preference is saved
 * @returns Saved filter preferences or default
 */
export function loadFilterPreference(
  defaultValue: ProjectFilters
): ProjectFilters {
  try {
    if (typeof window !== 'undefined' && window.sessionStorage) {
      const saved = sessionStorage.getItem(STORAGE_KEYS.FILTER_PREFERENCE);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (isValidFilterState(parsed)) {
          return parsed;
        }
      }
    }
  } catch (error) {
    // Silently fail if session storage is unavailable
    console.warn('Failed to load filter preference:', error);
  }
  return defaultValue;
}

/**
 * Clear all project page preferences from session storage
 */
export function clearProjectPreferences(): void {
  try {
    if (typeof window !== 'undefined' && window.sessionStorage) {
      sessionStorage.removeItem(STORAGE_KEYS.SORT_PREFERENCE);
      sessionStorage.removeItem(STORAGE_KEYS.FILTER_PREFERENCE);
    }
  } catch (error) {
    // Silently fail if session storage is unavailable
    console.warn('Failed to clear preferences:', error);
  }
}

/**
 * Validate if a string is a valid sort option
 * 
 * @param value - Value to validate
 * @returns True if valid sort option
 */
function isValidSortOption(value: string): boolean {
  return ['newest', 'popular', 'teamSize', 'techStack'].includes(value);
}

/**
 * Validate if an object is a valid filter state
 * 
 * @param value - Value to validate
 * @returns True if valid filter state
 */
function isValidFilterState(value: any): value is ProjectFilters {
  return (
    value &&
    typeof value === 'object' &&
    Array.isArray(value.techStack) &&
    (value.difficulty === null || typeof value.difficulty === 'string') &&
    (value.teamSize === null ||
      (typeof value.teamSize === 'object' &&
        typeof value.teamSize.min === 'number' &&
        typeof value.teamSize.max === 'number')) &&
    (value.category === null || typeof value.category === 'string')
  );
}

/**
 * Save event filter preferences to session storage
 * 
 * @param filters - Event filter state to save
 */
export function saveEventFilterPreference(filters: EventFilterState): void {
  try {
    if (typeof window !== 'undefined' && window.sessionStorage) {
      // Convert dates to ISO strings for storage
      const storageFilters = {
        ...filters,
        dateRange: {
          start: filters.dateRange.start?.toISOString(),
          end: filters.dateRange.end?.toISOString(),
        },
      };
      sessionStorage.setItem(
        STORAGE_KEYS.EVENT_FILTER_PREFERENCE,
        JSON.stringify(storageFilters)
      );
    }
  } catch (error) {
    // Silently fail if session storage is unavailable
    console.warn('Failed to save event filter preference:', error);
  }
}

/**
 * Load event filter preferences from session storage
 * 
 * @param defaultValue - Default value if no preference is saved
 * @returns Saved event filter preferences or default
 */
export function loadEventFilterPreference(
  defaultValue: EventFilterState
): EventFilterState {
  try {
    if (typeof window !== 'undefined' && window.sessionStorage) {
      const saved = sessionStorage.getItem(STORAGE_KEYS.EVENT_FILTER_PREFERENCE);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (isValidEventFilterState(parsed)) {
          // Convert ISO strings back to Date objects
          return {
            ...parsed,
            dateRange: {
              start: parsed.dateRange.start ? new Date(parsed.dateRange.start) : undefined,
              end: parsed.dateRange.end ? new Date(parsed.dateRange.end) : undefined,
            },
          };
        }
      }
    }
  } catch (error) {
    // Silently fail if session storage is unavailable
    console.warn('Failed to load event filter preference:', error);
  }
  return defaultValue;
}

/**
 * Clear event filter preferences from session storage
 */
export function clearEventFilterPreference(): void {
  try {
    if (typeof window !== 'undefined' && window.sessionStorage) {
      sessionStorage.removeItem(STORAGE_KEYS.EVENT_FILTER_PREFERENCE);
    }
  } catch (error) {
    // Silently fail if session storage is unavailable
    console.warn('Failed to clear event filter preference:', error);
  }
}

/**
 * Validate if an object is a valid event filter state
 * 
 * @param value - Value to validate
 * @returns True if valid event filter state
 */
function isValidEventFilterState(value: any): value is EventFilterState {
  return (
    value &&
    typeof value === 'object' &&
    Array.isArray(value.types) &&
    typeof value.availability === 'string' &&
    typeof value.myEvents === 'boolean' &&
    typeof value.page === 'number' &&
    typeof value.pageSize === 'number' &&
    typeof value.dateRange === 'object'
  );
}
