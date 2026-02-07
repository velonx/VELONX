/**
 * Unit tests for useEventFilters hook
 * Feature: events-page-ui-improvements
 * Requirements: 1.1-1.10 (Event Discovery & Search)
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useEventFilters } from '../useEventFilters';

// Mock Next.js router hooks
const mockPush = vi.fn();
const mockPathname = '/events';
const mockSearchParams = new URLSearchParams();

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
  usePathname: () => mockPathname,
  useSearchParams: () => mockSearchParams,
}));

// Mock session storage utilities
vi.mock('@/lib/utils/session-storage', () => ({
  saveEventFilterPreference: vi.fn(),
  loadEventFilterPreference: vi.fn((defaultValue) => defaultValue),
}));

describe('useEventFilters', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSearchParams.forEach((_, key) => mockSearchParams.delete(key));
  });

  describe('initialization', () => {
    it('should initialize with default filters', () => {
      const { result } = renderHook(() => useEventFilters());

      expect(result.current.filters).toEqual({
        search: undefined,
        types: [],
        dateRange: {},
        availability: 'all',
        myEvents: false,
        sortBy: 'date-asc',
        page: 1,
        pageSize: 12,
      });
    });

    it('should initialize activeFilterCount to 0', () => {
      const { result } = renderHook(() => useEventFilters());

      expect(result.current.activeFilterCount).toBe(0);
    });

    it('should initialize isFiltered to false', () => {
      const { result } = renderHook(() => useEventFilters());

      expect(result.current.isFiltered).toBe(false);
    });
  });

  describe('setSearch', () => {
    it('should update search filter', () => {
      const { result } = renderHook(() => useEventFilters());

      act(() => {
        result.current.setSearch('workshop');
      });

      expect(result.current.filters.search).toBe('workshop');
    });

    it('should trim search query', () => {
      const { result } = renderHook(() => useEventFilters());

      act(() => {
        result.current.setSearch('  workshop  ');
      });

      expect(result.current.filters.search).toBe('workshop');
    });

    it('should reset page to 1', () => {
      const { result } = renderHook(() => useEventFilters());

      act(() => {
        result.current.setPage(3);
      });

      act(() => {
        result.current.setSearch('workshop');
      });

      expect(result.current.filters.page).toBe(1);
    });

    it('should clear search if empty string', () => {
      const { result } = renderHook(() => useEventFilters());

      act(() => {
        result.current.setSearch('workshop');
      });

      act(() => {
        result.current.setSearch('');
      });

      expect(result.current.filters.search).toBeUndefined();
    });
  });

  describe('toggleType', () => {
    it('should add event type', () => {
      const { result } = renderHook(() => useEventFilters());

      act(() => {
        result.current.toggleType('WORKSHOP');
      });

      expect(result.current.filters.types).toContain('WORKSHOP');
    });

    it('should remove event type if already selected', () => {
      const { result } = renderHook(() => useEventFilters());

      act(() => {
        result.current.toggleType('WORKSHOP');
      });

      act(() => {
        result.current.toggleType('WORKSHOP');
      });

      expect(result.current.filters.types).not.toContain('WORKSHOP');
    });

    it('should handle multiple types', () => {
      const { result } = renderHook(() => useEventFilters());

      act(() => {
        result.current.toggleType('WORKSHOP');
        result.current.toggleType('HACKATHON');
      });

      expect(result.current.filters.types).toEqual(['WORKSHOP', 'HACKATHON']);
    });

    it('should reset page to 1', () => {
      const { result } = renderHook(() => useEventFilters());

      act(() => {
        result.current.setPage(3);
      });

      act(() => {
        result.current.toggleType('WORKSHOP');
      });

      expect(result.current.filters.page).toBe(1);
    });
  });

  describe('setDateRange', () => {
    it('should update date range', () => {
      const { result } = renderHook(() => useEventFilters());
      const startDate = new Date('2024-01-01');
      const endDate = new Date('2024-12-31');

      act(() => {
        result.current.setDateRange({ start: startDate, end: endDate });
      });

      expect(result.current.filters.dateRange.start).toEqual(startDate);
      expect(result.current.filters.dateRange.end).toEqual(endDate);
    });

    it('should reset page to 1', () => {
      const { result } = renderHook(() => useEventFilters());

      act(() => {
        result.current.setPage(3);
      });

      act(() => {
        result.current.setDateRange({ start: new Date() });
      });

      expect(result.current.filters.page).toBe(1);
    });
  });

  describe('setAvailability', () => {
    it('should update availability filter', () => {
      const { result } = renderHook(() => useEventFilters());

      act(() => {
        result.current.setAvailability('available');
      });

      expect(result.current.filters.availability).toBe('available');
    });

    it('should reset page to 1', () => {
      const { result } = renderHook(() => useEventFilters());

      act(() => {
        result.current.setPage(3);
      });

      act(() => {
        result.current.setAvailability('available');
      });

      expect(result.current.filters.page).toBe(1);
    });
  });

  describe('setMyEvents', () => {
    it('should update myEvents filter', () => {
      const { result } = renderHook(() => useEventFilters());

      act(() => {
        result.current.setMyEvents(true);
      });

      expect(result.current.filters.myEvents).toBe(true);
    });

    it('should reset page to 1', () => {
      const { result } = renderHook(() => useEventFilters());

      act(() => {
        result.current.setPage(3);
      });

      act(() => {
        result.current.setMyEvents(true);
      });

      expect(result.current.filters.page).toBe(1);
    });
  });

  describe('setPage', () => {
    it('should update page number', () => {
      const { result } = renderHook(() => useEventFilters());

      act(() => {
        result.current.setPage(3);
      });

      expect(result.current.filters.page).toBe(3);
    });
  });

  describe('setPageSize', () => {
    it('should update page size', () => {
      const { result } = renderHook(() => useEventFilters());

      act(() => {
        result.current.setPageSize(24);
      });

      expect(result.current.filters.pageSize).toBe(24);
    });

    it('should reset page to 1', () => {
      const { result } = renderHook(() => useEventFilters());

      act(() => {
        result.current.setPage(3);
      });

      act(() => {
        result.current.setPageSize(24);
      });

      expect(result.current.filters.page).toBe(1);
    });
  });

  describe('clearAllFilters', () => {
    it('should reset all filters to default', () => {
      const { result } = renderHook(() => useEventFilters());

      act(() => {
        result.current.setSearch('workshop');
        result.current.toggleType('WORKSHOP');
        result.current.setAvailability('available');
        result.current.setMyEvents(true);
        result.current.setPage(3);
      });

      act(() => {
        result.current.clearAllFilters();
      });

      expect(result.current.filters).toEqual({
        search: undefined,
        types: [],
        dateRange: {},
        availability: 'all',
        myEvents: false,
        sortBy: 'date-asc',
        page: 1,
        pageSize: 12,
      });
    });
  });

  describe('removeFilter', () => {
    it('should remove search filter', () => {
      const { result } = renderHook(() => useEventFilters());

      act(() => {
        result.current.setSearch('workshop');
      });

      act(() => {
        result.current.removeFilter('search');
      });

      expect(result.current.filters.search).toBeUndefined();
    });

    it('should remove specific type filter', () => {
      const { result } = renderHook(() => useEventFilters());

      act(() => {
        result.current.toggleType('WORKSHOP');
        result.current.toggleType('HACKATHON');
      });

      act(() => {
        result.current.removeFilter('type', 'WORKSHOP');
      });

      expect(result.current.filters.types).toEqual(['HACKATHON']);
    });

    it('should remove date range filter', () => {
      const { result } = renderHook(() => useEventFilters());

      act(() => {
        result.current.setDateRange({ start: new Date(), end: new Date() });
      });

      act(() => {
        result.current.removeFilter('dateRange');
      });

      expect(result.current.filters.dateRange).toEqual({});
    });

    it('should remove availability filter', () => {
      const { result } = renderHook(() => useEventFilters());

      act(() => {
        result.current.setAvailability('available');
      });

      act(() => {
        result.current.removeFilter('availability');
      });

      expect(result.current.filters.availability).toBe('all');
    });

    it('should remove myEvents filter', () => {
      const { result } = renderHook(() => useEventFilters());

      act(() => {
        result.current.setMyEvents(true);
      });

      act(() => {
        result.current.removeFilter('myEvents');
      });

      expect(result.current.filters.myEvents).toBe(false);
    });

    it('should reset page to 1', () => {
      const { result } = renderHook(() => useEventFilters());

      act(() => {
        result.current.setSearch('workshop');
        result.current.setPage(3);
      });

      act(() => {
        result.current.removeFilter('search');
      });

      expect(result.current.filters.page).toBe(1);
    });
  });

  describe('activeFilterCount', () => {
    it('should count search filter', () => {
      const { result } = renderHook(() => useEventFilters());

      act(() => {
        result.current.setSearch('workshop');
      });

      expect(result.current.activeFilterCount).toBe(1);
    });

    it('should count type filters', () => {
      const { result } = renderHook(() => useEventFilters());

      act(() => {
        result.current.toggleType('WORKSHOP');
        result.current.toggleType('HACKATHON');
      });

      expect(result.current.activeFilterCount).toBe(2);
    });

    it('should count date range as one filter', () => {
      const { result } = renderHook(() => useEventFilters());

      act(() => {
        result.current.setDateRange({ start: new Date(), end: new Date() });
      });

      expect(result.current.activeFilterCount).toBe(1);
    });

    it('should count availability filter', () => {
      const { result } = renderHook(() => useEventFilters());

      act(() => {
        result.current.setAvailability('available');
      });

      expect(result.current.activeFilterCount).toBe(1);
    });

    it('should count myEvents filter', () => {
      const { result } = renderHook(() => useEventFilters());

      act(() => {
        result.current.setMyEvents(true);
      });

      expect(result.current.activeFilterCount).toBe(1);
    });

    it('should count all active filters', () => {
      const { result } = renderHook(() => useEventFilters());

      act(() => {
        result.current.setSearch('workshop');
        result.current.toggleType('WORKSHOP');
        result.current.toggleType('HACKATHON');
        result.current.setDateRange({ start: new Date() });
        result.current.setAvailability('available');
        result.current.setMyEvents(true);
      });

      // search(1) + types(2) + dateRange(1) + availability(1) + myEvents(1) = 6
      expect(result.current.activeFilterCount).toBe(6);
    });
  });

  describe('isFiltered', () => {
    it('should be false with no filters', () => {
      const { result } = renderHook(() => useEventFilters());

      expect(result.current.isFiltered).toBe(false);
    });

    it('should be true with any filter active', () => {
      const { result } = renderHook(() => useEventFilters());

      act(() => {
        result.current.setSearch('workshop');
      });

      expect(result.current.isFiltered).toBe(true);
    });
  });
});
