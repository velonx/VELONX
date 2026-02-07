/**
 * Unit tests for useEventSearch hook
 * Feature: events-page-ui-improvements
 * Requirements: 1.2 (Event search with debouncing)
 */

import { renderHook, act, waitFor } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useEventSearch } from '../useEventSearch';
import { useEventFilters } from '../useEventFilters';
import { useDebounce } from '../useDebounce';

// Mock dependencies
vi.mock('../useEventFilters');
vi.mock('../useDebounce');
vi.mock('next/navigation', () => ({
  useRouter: vi.fn(() => ({
    push: vi.fn(),
    replace: vi.fn(),
  })),
  useSearchParams: vi.fn(() => new URLSearchParams()),
  usePathname: vi.fn(() => '/events'),
}));

describe('useEventSearch', () => {
  const mockSetSearch = vi.fn();
  const mockUseEventFilters = useEventFilters as any;
  const mockUseDebounce = useDebounce as any;

  beforeEach(() => {
    vi.clearAllMocks();
    
    // Default mock implementation
    mockUseEventFilters.mockReturnValue({
      filters: {
        search: undefined,
        types: [],
        dateRange: {},
        availability: 'all',
        myEvents: false,
        page: 1,
        pageSize: 12,
      },
      setSearch: mockSetSearch,
      toggleType: vi.fn(),
      setDateRange: vi.fn(),
      setAvailability: vi.fn(),
      setMyEvents: vi.fn(),
      setPage: vi.fn(),
      setPageSize: vi.fn(),
      clearAllFilters: vi.fn(),
      removeFilter: vi.fn(),
      activeFilterCount: 0,
      isFiltered: false,
    });
    
    // Mock useDebounce to return the value immediately for most tests
    mockUseDebounce.mockImplementation((value) => value);
  });

  describe('initialization', () => {
    it('should initialize with empty search query when no filter is set', () => {
      const { result } = renderHook(() => useEventSearch());

      expect(result.current.searchQuery).toBe('');
      expect(result.current.debouncedQuery).toBe('');
      expect(result.current.isSearching).toBe(false);
    });

    it('should initialize with existing filter search value', () => {
      mockUseEventFilters.mockReturnValue({
        filters: {
          search: 'workshop',
          types: [],
          dateRange: {},
          availability: 'all',
          myEvents: false,
          page: 1,
          pageSize: 12,
        },
        setSearch: mockSetSearch,
        toggleType: vi.fn(),
        setDateRange: vi.fn(),
        setAvailability: vi.fn(),
        setMyEvents: vi.fn(),
        setPage: vi.fn(),
        setPageSize: vi.fn(),
        clearAllFilters: vi.fn(),
        removeFilter: vi.fn(),
        activeFilterCount: 1,
        isFiltered: true,
      });

      const { result } = renderHook(() => useEventSearch());

      expect(result.current.searchQuery).toBe('workshop');
      expect(result.current.debouncedQuery).toBe('workshop');
    });

    it('should accept custom debounce delay', () => {
      const customDelay = 500;
      renderHook(() => useEventSearch(customDelay));

      expect(mockUseDebounce).toHaveBeenCalledWith('', customDelay);
    });
  });

  describe('search query updates', () => {
    it('should update search query immediately when setSearchQuery is called', () => {
      const { result } = renderHook(() => useEventSearch());

      act(() => {
        result.current.setSearchQuery('react');
      });

      expect(result.current.searchQuery).toBe('react');
    });

    it('should update search query multiple times', () => {
      const { result } = renderHook(() => useEventSearch());

      act(() => {
        result.current.setSearchQuery('r');
      });
      expect(result.current.searchQuery).toBe('r');

      act(() => {
        result.current.setSearchQuery('re');
      });
      expect(result.current.searchQuery).toBe('re');

      act(() => {
        result.current.setSearchQuery('react');
      });
      expect(result.current.searchQuery).toBe('react');
    });

    it('should handle empty string search query', () => {
      const { result } = renderHook(() => useEventSearch());

      act(() => {
        result.current.setSearchQuery('test');
      });
      expect(result.current.searchQuery).toBe('test');

      act(() => {
        result.current.setSearchQuery('');
      });
      expect(result.current.searchQuery).toBe('');
    });

    it('should handle whitespace in search query', () => {
      const { result } = renderHook(() => useEventSearch());

      act(() => {
        result.current.setSearchQuery('  react workshop  ');
      });

      expect(result.current.searchQuery).toBe('  react workshop  ');
    });
  });

  describe('debouncing behavior', () => {
    it('should show isSearching as true when query differs from debounced value', () => {
      // Mock debounce to return a different value
      mockUseDebounce.mockReturnValue('');

      const { result } = renderHook(() => useEventSearch());

      act(() => {
        result.current.setSearchQuery('react');
      });

      // searchQuery is 'react' but debouncedQuery is '' (from mock)
      expect(result.current.searchQuery).toBe('react');
      expect(result.current.debouncedQuery).toBe('');
      expect(result.current.isSearching).toBe(true);
    });

    it('should show isSearching as false when query matches debounced value', () => {
      mockUseDebounce.mockReturnValue('react');

      const { result } = renderHook(() => useEventSearch());

      act(() => {
        result.current.setSearchQuery('react');
      });

      expect(result.current.searchQuery).toBe('react');
      expect(result.current.debouncedQuery).toBe('react');
      expect(result.current.isSearching).toBe(false);
    });

    it('should call setSearch with debounced query', async () => {
      const { result } = renderHook(() => useEventSearch());

      act(() => {
        result.current.setSearchQuery('workshop');
      });

      // Wait for effect to run
      await waitFor(() => {
        expect(mockSetSearch).toHaveBeenCalledWith('workshop');
      });
    });

    it('should not call setSearch if debounced query matches current filter', () => {
      mockUseEventFilters.mockReturnValue({
        filters: {
          search: 'workshop',
          types: [],
          dateRange: {},
          availability: 'all',
          myEvents: false,
          page: 1,
          pageSize: 12,
        },
        setSearch: mockSetSearch,
        toggleType: vi.fn(),
        setDateRange: vi.fn(),
        setAvailability: vi.fn(),
        setMyEvents: vi.fn(),
        setPage: vi.fn(),
        setPageSize: vi.fn(),
        clearAllFilters: vi.fn(),
        removeFilter: vi.fn(),
        activeFilterCount: 1,
        isFiltered: true,
      });

      mockUseDebounce.mockReturnValue('workshop');

      renderHook(() => useEventSearch());

      // setSearch should not be called since the filter already has 'workshop'
      expect(mockSetSearch).not.toHaveBeenCalled();
    });
  });

  describe('URL synchronization', () => {
    it('should sync with filter changes from URL navigation', () => {
      const { result, rerender } = renderHook(() => useEventSearch());

      // Initial state
      expect(result.current.searchQuery).toBe('');

      // Simulate URL change by updating the mock
      mockUseEventFilters.mockReturnValue({
        filters: {
          search: 'hackathon',
          types: [],
          dateRange: {},
          availability: 'all',
          myEvents: false,
          page: 1,
          pageSize: 12,
        },
        setSearch: mockSetSearch,
        toggleType: vi.fn(),
        setDateRange: vi.fn(),
        setAvailability: vi.fn(),
        setMyEvents: vi.fn(),
        setPage: vi.fn(),
        setPageSize: vi.fn(),
        clearAllFilters: vi.fn(),
        removeFilter: vi.fn(),
        activeFilterCount: 1,
        isFiltered: true,
      });

      mockUseDebounce.mockReturnValue('hackathon');

      // Rerender to trigger effect
      rerender();

      // Should sync with the new filter value
      expect(result.current.searchQuery).toBe('hackathon');
      expect(result.current.debouncedQuery).toBe('hackathon');
    });

    it('should not overwrite user input during typing', () => {
      // Start with a filter value
      mockUseEventFilters.mockReturnValue({
        filters: {
          search: 'workshop',
          types: [],
          dateRange: {},
          availability: 'all',
          myEvents: false,
          page: 1,
          pageSize: 12,
        },
        setSearch: mockSetSearch,
        toggleType: vi.fn(),
        setDateRange: vi.fn(),
        setAvailability: vi.fn(),
        setMyEvents: vi.fn(),
        setPage: vi.fn(),
        setPageSize: vi.fn(),
        clearAllFilters: vi.fn(),
        removeFilter: vi.fn(),
        activeFilterCount: 1,
        isFiltered: true,
      });

      const { result } = renderHook(() => useEventSearch());

      // User starts typing
      act(() => {
        result.current.setSearchQuery('w');
      });

      // Mock debounce to simulate typing in progress
      mockUseDebounce.mockReturnValue('workshop'); // Still showing old debounced value

      // searchQuery should remain 'w' (user's input), not revert to 'workshop'
      expect(result.current.searchQuery).toBe('w');
    });
  });

  describe('edge cases', () => {
    it('should handle rapid query changes', () => {
      const { result } = renderHook(() => useEventSearch());

      act(() => {
        result.current.setSearchQuery('a');
        result.current.setSearchQuery('ab');
        result.current.setSearchQuery('abc');
        result.current.setSearchQuery('abcd');
      });

      expect(result.current.searchQuery).toBe('abcd');
    });

    it('should handle clearing search after typing', () => {
      const { result } = renderHook(() => useEventSearch());

      act(() => {
        result.current.setSearchQuery('workshop');
      });
      expect(result.current.searchQuery).toBe('workshop');

      act(() => {
        result.current.setSearchQuery('');
      });
      expect(result.current.searchQuery).toBe('');
    });

    it('should handle special characters in search query', () => {
      const { result } = renderHook(() => useEventSearch());

      const specialQuery = 'React & Node.js (2024)';
      act(() => {
        result.current.setSearchQuery(specialQuery);
      });

      expect(result.current.searchQuery).toBe(specialQuery);
    });

    it('should handle very long search queries', () => {
      const { result } = renderHook(() => useEventSearch());

      const longQuery = 'a'.repeat(1000);
      act(() => {
        result.current.setSearchQuery(longQuery);
      });

      expect(result.current.searchQuery).toBe(longQuery);
    });

    it('should maintain referential stability of setSearchQuery', () => {
      const { result, rerender } = renderHook(() => useEventSearch());

      const firstSetSearchQuery = result.current.setSearchQuery;
      
      rerender();
      
      const secondSetSearchQuery = result.current.setSearchQuery;

      expect(firstSetSearchQuery).toBe(secondSetSearchQuery);
    });
  });

  describe('integration with useDebounce', () => {
    it('should pass search query to useDebounce', () => {
      const { result } = renderHook(() => useEventSearch());

      act(() => {
        result.current.setSearchQuery('test');
      });

      expect(mockUseDebounce).toHaveBeenCalledWith('test', 300);
    });

    it('should pass custom delay to useDebounce', () => {
      const customDelay = 500;
      const { result } = renderHook(() => useEventSearch(customDelay));

      act(() => {
        result.current.setSearchQuery('test');
      });

      expect(mockUseDebounce).toHaveBeenCalledWith('test', customDelay);
    });
  });

  describe('integration with useEventFilters', () => {
    it('should call setSearch from useEventFilters when debounced query changes', async () => {
      const { result } = renderHook(() => useEventSearch());

      act(() => {
        result.current.setSearchQuery('react');
      });

      await waitFor(() => {
        expect(mockSetSearch).toHaveBeenCalledWith('react');
      });
    });

    it('should read initial search value from filters', () => {
      mockUseEventFilters.mockReturnValue({
        filters: {
          search: 'initial search',
          types: [],
          dateRange: {},
          availability: 'all',
          myEvents: false,
          page: 1,
          pageSize: 12,
        },
        setSearch: mockSetSearch,
        toggleType: vi.fn(),
        setDateRange: vi.fn(),
        setAvailability: vi.fn(),
        setMyEvents: vi.fn(),
        setPage: vi.fn(),
        setPageSize: vi.fn(),
        clearAllFilters: vi.fn(),
        removeFilter: vi.fn(),
        activeFilterCount: 1,
        isFiltered: true,
      });

      const { result } = renderHook(() => useEventSearch());

      expect(result.current.searchQuery).toBe('initial search');
    });
  });
});
