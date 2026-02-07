/**
 * Custom hook for managing event filters with URL synchronization
 * Feature: events-page-ui-improvements
 * Requirements: 1.1-1.10 (Event Discovery & Search)
 */

'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { EventFilterState, EventType, EventAvailability, EventSortOption, DateRange } from '@/lib/types/events.types';
import { serializeFiltersToURL, parseFiltersFromURL, areFiltersEqual } from '@/lib/utils/event-url-helpers';
import { saveEventFilterPreference, loadEventFilterPreference } from '@/lib/utils/session-storage';

/**
 * Hook return type
 */
export interface UseEventFiltersReturn {
  filters: EventFilterState;
  setSearch: (search: string) => void;
  toggleType: (type: EventType) => void;
  setDateRange: (dateRange: DateRange) => void;
  setAvailability: (availability: EventAvailability) => void;
  setMyEvents: (myEvents: boolean) => void;
  setSortBy: (sortBy: EventSortOption) => void;
  setPage: (page: number) => void;
  setPageSize: (pageSize: number) => void;
  clearAllFilters: () => void;
  removeFilter: (filterType: 'search' | 'type' | 'dateRange' | 'availability' | 'myEvents', value?: string) => void;
  activeFilterCount: number;
  isFiltered: boolean;
}

/**
 * Custom hook for managing event filters with URL synchronization
 * 
 * Features:
 * - Reads initial filter state from URL parameters
 * - Updates URL when filters change
 * - Maintains browser history for back/forward navigation
 * - Persists filters to session storage
 * - Provides filter update functions
 * - Handles filter reset functionality
 * 
 * @returns Filter state and update functions
 */
export function useEventFilters(): UseEventFiltersReturn {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Initialize filters from URL on mount, with session storage fallback
  const [filters, setFilters] = useState<EventFilterState>(() => {
    const urlFilters = parseFiltersFromURL(searchParams);
    
    // If URL has filters, use them; otherwise try session storage
    const hasUrlFilters = searchParams.toString().length > 0;
    if (hasUrlFilters) {
      return urlFilters;
    }
    
    // Try to load from session storage
    const defaultFilters: EventFilterState = {
      search: undefined,
      types: [],
      dateRange: {},
      availability: 'all',
      myEvents: false,
      sortBy: 'date-asc',
      page: 1,
      pageSize: 12,
    };
    
    return loadEventFilterPreference(defaultFilters);
  });

  // Sync filters with URL when URL changes (browser back/forward)
  useEffect(() => {
    const urlFilters = parseFiltersFromURL(searchParams);
    if (!areFiltersEqual(filters, urlFilters)) {
      setFilters(urlFilters);
    }
  }, [searchParams]); // Only depend on searchParams, not filters to avoid loops

  // Update URL and session storage when filters change
  useEffect(() => {
    const params = serializeFiltersToURL(filters);
    const queryString = params.toString();
    const currentUrl = searchParams.toString();
    
    // Only update if URL actually changed
    if (currentUrl !== queryString) {
      const newUrl = queryString ? `${pathname}?${queryString}` : pathname;
      router.push(newUrl, { scroll: false });
    }

    // Save to session storage
    saveEventFilterPreference(filters);
  }, [filters, pathname, router, searchParams]);

  // Set search query
  const setSearch = useCallback((search: string) => {
    setFilters((prev) => ({
      ...prev,
      search: search.trim() || undefined,
      page: 1, // Reset to page 1 when search changes
    }));
  }, []);

  // Toggle event type filter
  const toggleType = useCallback((type: EventType) => {
    setFilters((prev) => {
      const types = prev.types.includes(type)
        ? prev.types.filter((t) => t !== type)
        : [...prev.types, type];

      return {
        ...prev,
        types,
        page: 1, // Reset to page 1 when filters change
      };
    });
  }, []);

  // Set date range filter
  const setDateRange = useCallback((dateRange: DateRange) => {
    setFilters((prev) => ({
      ...prev,
      dateRange,
      page: 1, // Reset to page 1 when filters change
    }));
  }, []);

  // Set availability filter
  const setAvailability = useCallback((availability: EventAvailability) => {
    setFilters((prev) => ({
      ...prev,
      availability,
      page: 1, // Reset to page 1 when filters change
    }));
  }, []);

  // Set myEvents filter
  const setMyEvents = useCallback((myEvents: boolean) => {
    setFilters((prev) => ({
      ...prev,
      myEvents,
      page: 1, // Reset to page 1 when filters change
    }));
  }, []);

  // Set sortBy option
  const setSortBy = useCallback((sortBy: EventSortOption) => {
    setFilters((prev) => ({
      ...prev,
      sortBy,
      page: 1, // Reset to page 1 when sort changes
    }));
  }, []);

  // Set page number
  const setPage = useCallback((page: number) => {
    setFilters((prev) => ({
      ...prev,
      page,
    }));
  }, []);

  // Set page size
  const setPageSize = useCallback((pageSize: number) => {
    setFilters((prev) => ({
      ...prev,
      pageSize,
      page: 1, // Reset to page 1 when page size changes
    }));
  }, []);

  // Clear all filters
  const clearAllFilters = useCallback(() => {
    setFilters({
      search: undefined,
      types: [],
      dateRange: {},
      availability: 'all',
      myEvents: false,
      sortBy: 'date-asc',
      page: 1,
      pageSize: 12,
    });
  }, []);

  // Remove individual filter
  const removeFilter = useCallback((
    filterType: 'search' | 'type' | 'dateRange' | 'availability' | 'myEvents',
    value?: string
  ) => {
    setFilters((prev) => {
      let newFilters: EventFilterState = { ...prev, page: 1 };

      switch (filterType) {
        case 'search':
          newFilters.search = undefined;
          break;
        case 'type':
          if (value) {
            newFilters.types = prev.types.filter((t) => t !== value);
          }
          break;
        case 'dateRange':
          newFilters.dateRange = {};
          break;
        case 'availability':
          newFilters.availability = 'all';
          break;
        case 'myEvents':
          newFilters.myEvents = false;
          break;
      }

      return newFilters;
    });
  }, []);

  // Calculate active filter count
  const activeFilterCount =
    (filters.search ? 1 : 0) +
    filters.types.length +
    (filters.dateRange.start || filters.dateRange.end ? 1 : 0) +
    (filters.availability !== 'all' ? 1 : 0) +
    (filters.myEvents ? 1 : 0);

  // Check if any filters are active
  const isFiltered = activeFilterCount > 0;

  return {
    filters,
    setSearch,
    toggleType,
    setDateRange,
    setAvailability,
    setMyEvents,
    setSortBy,
    setPage,
    setPageSize,
    clearAllFilters,
    removeFilter,
    activeFilterCount,
    isFiltered,
  };
}
