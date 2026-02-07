/**
 * Custom hook for managing resource filters with URL synchronization
 * Feature: resources-page-ui-improvements
 * Requirements: 1.5, 2.4, 2.5, 3.5, 5.5, 10.3
 */

'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { FilterState, ResourceCategory, ResourceType } from '@/lib/types/resources.types';
import { serializeFiltersToURL, parseFiltersFromURL, areFiltersEqual } from '@/lib/utils/resource-url-helpers';

/**
 * Hook return type
 */
export interface UseResourceFiltersReturn {
  filters: FilterState;
  setSearch: (search: string) => void;
  toggleCategory: (category: ResourceCategory) => void;
  toggleType: (type: ResourceType) => void;
  setPage: (page: number) => void;
  clearAllFilters: () => void;
  removeFilter: (filterType: 'search' | 'category' | 'type', value?: string) => void;
  activeFilterCount: number;
}

/**
 * Custom hook for managing resource filters with URL synchronization
 * 
 * Features:
 * - Reads initial filter state from URL parameters
 * - Updates URL when filters change
 * - Maintains browser history for back/forward navigation
 * - Provides filter update functions
 * - Handles filter reset functionality
 * 
 * @returns Filter state and update functions
 */
export function useResourceFilters(): UseResourceFiltersReturn {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Initialize filters from URL on mount
  const [filters, setFilters] = useState<FilterState>(() => {
    return parseFiltersFromURL(searchParams);
  });

  // Sync filters with URL when URL changes (browser back/forward)
  useEffect(() => {
    const urlFilters = parseFiltersFromURL(searchParams);
    if (!areFiltersEqual(filters, urlFilters)) {
      setFilters(urlFilters);
    }
  }, [searchParams]); // Only depend on searchParams, not filters to avoid loops

  // Update URL when filters change - using useEffect to avoid render phase updates
  useEffect(() => {
    const params = serializeFiltersToURL(filters);
    const queryString = params.toString();
    const currentUrl = searchParams.toString();
    
    // Only update if URL actually changed
    if (currentUrl !== queryString) {
      const newUrl = queryString ? `${pathname}?${queryString}` : pathname;
      router.push(newUrl, { scroll: false });
    }
  }, [filters, pathname, router, searchParams]);

  // Set search query
  const setSearch = useCallback((search: string) => {
    setFilters((prev) => ({
      ...prev,
      search: search.trim() || undefined,
      page: 1, // Reset to page 1 when search changes
    }));
  }, []);

  // Toggle category filter
  const toggleCategory = useCallback((category: ResourceCategory) => {
    setFilters((prev) => {
      const categories = prev.categories.includes(category)
        ? prev.categories.filter((c) => c !== category)
        : [...prev.categories, category];

      return {
        ...prev,
        categories,
        page: 1, // Reset to page 1 when filters change
      };
    });
  }, []);

  // Toggle type filter
  const toggleType = useCallback((type: ResourceType) => {
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

  // Set page number
  const setPage = useCallback((page: number) => {
    setFilters((prev) => ({
      ...prev,
      page,
    }));
  }, []);

  // Clear all filters
  const clearAllFilters = useCallback(() => {
    setFilters({
      search: undefined,
      categories: [],
      types: [],
      page: 1,
      pageSize: 12,
    });
  }, []);

  // Remove individual filter
  const removeFilter = useCallback((
    filterType: 'search' | 'category' | 'type',
    value?: string
  ) => {
    setFilters((prev) => {
      let newFilters: FilterState = { ...prev, page: 1 };

      switch (filterType) {
        case 'search':
          newFilters.search = undefined;
          break;
        case 'category':
          if (value) {
            newFilters.categories = prev.categories.filter(
              (c) => c !== value
            );
          }
          break;
        case 'type':
          if (value) {
            newFilters.types = prev.types.filter((t) => t !== value);
          }
          break;
      }

      return newFilters;
    });
  }, []);

  // Calculate active filter count
  const activeFilterCount =
    (filters.search ? 1 : 0) +
    filters.categories.length +
    filters.types.length;

  return {
    filters,
    setSearch,
    toggleCategory,
    toggleType,
    setPage,
    clearAllFilters,
    removeFilter,
    activeFilterCount,
  };
}
