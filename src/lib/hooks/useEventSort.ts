/**
 * Custom hook for managing event sort with URL synchronization
 * Feature: events-page-ui-improvements
 * Requirements: 5.1-5.4 (Sorting & Pagination)
 * 
 * This hook provides a simplified interface for managing event sort state.
 * It wraps useEventFilters to provide a focused API for sorting functionality.
 */

'use client';

import { useCallback } from 'react';
import { EventSortOption } from '@/lib/types/events.types';
import { useEventFilters } from './useEventFilters';

/**
 * Hook return type
 */
export interface UseEventSortReturn {
  /** Current sort option */
  sortBy: EventSortOption;
  /** Set the sort option */
  setSortBy: (sortBy: EventSortOption) => void;
  /** Check if a specific sort option is active */
  isSortActive: (sortBy: EventSortOption) => boolean;
}

/**
 * Custom hook for managing event sort with URL synchronization
 * 
 * Features:
 * - Manages sort state with URL persistence
 * - Provides helper to check active sort option
 * - Resets pagination when sort changes
 * - Syncs with useEventFilters for unified state management
 * 
 * Sort Options:
 * - date-asc: Sort by date ascending (earliest first)
 * - date-desc: Sort by date descending (latest first)
 * - popularity: Sort by most registered attendees
 * - availability: Sort by most seats available
 * - recent: Sort by recently added events
 * 
 * @returns Sort state and update functions
 * 
 * @example
 * ```tsx
 * function SortControl() {
 *   const { sortBy, setSortBy, isSortActive } = useEventSort();
 *   
 *   return (
 *     <select value={sortBy} onChange={(e) => setSortBy(e.target.value as EventSortOption)}>
 *       <option value="date-asc">Date (Earliest First)</option>
 *       <option value="date-desc">Date (Latest First)</option>
 *       <option value="popularity">Most Popular</option>
 *       <option value="availability">Most Available</option>
 *       <option value="recent">Recently Added</option>
 *     </select>
 *   );
 * }
 * ```
 */
export function useEventSort(): UseEventSortReturn {
  const { filters, setSortBy: setFilterSortBy } = useEventFilters();
  
  // Get current sort option from filters
  const sortBy = filters.sortBy;
  
  // Wrapper for setSortBy to maintain consistent API
  const setSortBy = useCallback((newSortBy: EventSortOption) => {
    setFilterSortBy(newSortBy);
  }, [setFilterSortBy]);
  
  // Helper to check if a specific sort option is active
  const isSortActive = useCallback((option: EventSortOption) => {
    return sortBy === option;
  }, [sortBy]);
  
  return {
    sortBy,
    setSortBy,
    isSortActive,
  };
}
