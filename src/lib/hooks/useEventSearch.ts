/**
 * Custom hook for managing event search with debouncing
 * Feature: events-page-ui-improvements
 * Requirements: 1.1-1.2 (Event Discovery & Search with debouncing)
 * 
 * This hook provides a debounced search experience on top of useEventFilters.
 * It manages the immediate search input state and syncs the debounced value
 * with the filter state and URL parameters.
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import { useDebounce } from './useDebounce';
import { useEventFilters } from './useEventFilters';

/**
 * Hook return type
 */
export interface UseEventSearchReturn {
  /** Current search query (immediate, not debounced) */
  searchQuery: string;
  /** Set the search query (updates immediately) */
  setSearchQuery: (query: string) => void;
  /** Debounced search query (synced with filters and URL) */
  debouncedQuery: string;
  /** Whether the search is currently debouncing */
  isSearching: boolean;
}

/**
 * Custom hook for managing event search with debouncing
 * 
 * Features:
 * - Immediate search input state for responsive UI
 * - Debounced search value (300ms) to reduce API calls
 * - Automatic sync with useEventFilters for URL persistence
 * - Loading state indicator during debounce period
 * 
 * @param delay - Debounce delay in milliseconds (default: 300ms)
 * @returns Search state and update functions
 * 
 * @example
 * ```tsx
 * function SearchBar() {
 *   const { searchQuery, setSearchQuery, debouncedQuery, isSearching } = useEventSearch();
 *   
 *   return (
 *     <div>
 *       <input
 *         value={searchQuery}
 *         onChange={(e) => setSearchQuery(e.target.value)}
 *         placeholder="Search events..."
 *       />
 *       {isSearching && <Spinner />}
 *       <p>Searching for: {debouncedQuery}</p>
 *     </div>
 *   );
 * }
 * ```
 */
export function useEventSearch(delay: number = 300): UseEventSearchReturn {
  const { filters, setSearch } = useEventFilters();
  
  // Local state for immediate search input (not debounced)
  const [searchQuery, setSearchQueryState] = useState<string>(filters.search || '');
  
  // Debounce the search query
  const debouncedQuery = useDebounce(searchQuery, delay);
  
  // Track if we're currently debouncing (search query differs from debounced value)
  const isSearching = searchQuery !== debouncedQuery;
  
  // Sync local state with filter state when filters change externally
  // (e.g., from URL navigation, browser back/forward)
  useEffect(() => {
    const filterSearch = filters.search || '';
    if (filterSearch !== searchQuery && filterSearch === debouncedQuery) {
      // Only update if the filter search matches the debounced query
      // This prevents overwriting user input during typing
      setSearchQueryState(filterSearch);
    }
  }, [filters.search]); // Only depend on filters.search to avoid loops
  
  // Update the filter state when debounced query changes
  useEffect(() => {
    // Only update if the debounced query is different from the current filter
    if (debouncedQuery !== (filters.search || '')) {
      setSearch(debouncedQuery);
    }
  }, [debouncedQuery, setSearch]); // filters.search intentionally omitted to avoid loops
  
  // Wrapper for setSearchQuery to update local state
  const setSearchQuery = useCallback((query: string) => {
    setSearchQueryState(query);
  }, []);
  
  return {
    searchQuery,
    setSearchQuery,
    debouncedQuery,
    isSearching,
  };
}
