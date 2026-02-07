/**
 * Unit tests for useResourceFilters hook
 * Feature: resources-page-ui-improvements
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useResourceFilters } from '../useResourceFilters';
import { ResourceCategory, ResourceType } from '@/lib/types/resources.types';

// Mock Next.js navigation hooks
const mockPush = vi.fn();
const mockPathname = '/resources';
let currentSearchParams = new URLSearchParams();

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
  useSearchParams: () => currentSearchParams,
  usePathname: () => mockPathname,
}));

describe('useResourceFilters', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset search params by creating a new instance
    currentSearchParams = new URLSearchParams();
  });

  it('should initialize with default filters', () => {
    const { result } = renderHook(() => useResourceFilters());

    expect(result.current.filters).toEqual({
      search: undefined,
      categories: [],
      types: [],
      page: 1,
      pageSize: 12,
    });
    expect(result.current.activeFilterCount).toBe(0);
  });

  it('should initialize from URL parameters', () => {
    currentSearchParams = new URLSearchParams({
      search: 'react',
      category: 'PROGRAMMING',
      page: '2',
    });

    const { result } = renderHook(() => useResourceFilters());

    expect(result.current.filters.search).toBe('react');
    expect(result.current.filters.categories).toEqual([ResourceCategory.PROGRAMMING]);
    expect(result.current.filters.page).toBe(2);
  });

  it('should update search and reset page to 1', () => {
    const { result } = renderHook(() => useResourceFilters());

    act(() => {
      result.current.setSearch('javascript');
    });

    expect(result.current.filters.search).toBe('javascript');
    expect(result.current.filters.page).toBe(1);
    expect(mockPush).toHaveBeenCalledWith('/resources?search=javascript', { scroll: false });
  });

  it('should clear search when empty string provided', () => {
    currentSearchParams = new URLSearchParams({ search: 'react' });
    const { result } = renderHook(() => useResourceFilters());

    act(() => {
      result.current.setSearch('');
    });

    expect(result.current.filters.search).toBeUndefined();
    expect(mockPush).toHaveBeenCalledWith('/resources', { scroll: false });
  });

  it('should toggle category on', () => {
    const { result } = renderHook(() => useResourceFilters());

    act(() => {
      result.current.toggleCategory(ResourceCategory.PROGRAMMING);
    });

    expect(result.current.filters.categories).toEqual([ResourceCategory.PROGRAMMING]);
    expect(result.current.filters.page).toBe(1);
    expect(mockPush).toHaveBeenCalledWith('/resources?category=PROGRAMMING', { scroll: false });
  });

  it('should toggle category off', () => {
    currentSearchParams = new URLSearchParams({ category: 'PROGRAMMING' });
    const { result } = renderHook(() => useResourceFilters());

    act(() => {
      result.current.toggleCategory(ResourceCategory.PROGRAMMING);
    });

    expect(result.current.filters.categories).toEqual([]);
    expect(mockPush).toHaveBeenCalledWith('/resources', { scroll: false });
  });

  it('should toggle multiple categories', () => {
    const { result } = renderHook(() => useResourceFilters());

    act(() => {
      result.current.toggleCategory(ResourceCategory.PROGRAMMING);
    });

    act(() => {
      result.current.toggleCategory(ResourceCategory.WEB);
    });

    expect(result.current.filters.categories).toEqual([
      ResourceCategory.PROGRAMMING,
      ResourceCategory.WEB,
    ]);
  });

  it('should toggle type on', () => {
    const { result } = renderHook(() => useResourceFilters());

    act(() => {
      result.current.toggleType(ResourceType.VIDEO);
    });

    expect(result.current.filters.types).toEqual([ResourceType.VIDEO]);
    expect(result.current.filters.page).toBe(1);
    expect(mockPush).toHaveBeenCalledWith('/resources?type=VIDEO', { scroll: false });
  });

  it('should toggle type off', () => {
    currentSearchParams = new URLSearchParams({ type: 'VIDEO' });
    const { result } = renderHook(() => useResourceFilters());

    act(() => {
      result.current.toggleType(ResourceType.VIDEO);
    });

    expect(result.current.filters.types).toEqual([]);
    expect(mockPush).toHaveBeenCalledWith('/resources', { scroll: false });
  });

  it('should set page number', () => {
    const { result } = renderHook(() => useResourceFilters());

    act(() => {
      result.current.setPage(3);
    });

    expect(result.current.filters.page).toBe(3);
    expect(mockPush).toHaveBeenCalledWith('/resources?page=3', { scroll: false });
  });

  it('should maintain filters when changing page', () => {
    currentSearchParams = new URLSearchParams({
      search: 'react',
      category: 'PROGRAMMING',
    });
    const { result } = renderHook(() => useResourceFilters());

    act(() => {
      result.current.setPage(2);
    });

    expect(result.current.filters.search).toBe('react');
    expect(result.current.filters.categories).toEqual([ResourceCategory.PROGRAMMING]);
    expect(result.current.filters.page).toBe(2);
    expect(mockPush).toHaveBeenCalledWith(
      '/resources?search=react&category=PROGRAMMING&page=2',
      { scroll: false }
    );
  });

  it('should clear all filters', () => {
    currentSearchParams = new URLSearchParams({
      search: 'react',
      category: 'PROGRAMMING',
      type: 'VIDEO',
      page: '3',
    });
    const { result } = renderHook(() => useResourceFilters());

    act(() => {
      result.current.clearAllFilters();
    });

    expect(result.current.filters).toEqual({
      search: undefined,
      categories: [],
      types: [],
      page: 1,
      pageSize: 12,
    });
    expect(mockPush).toHaveBeenCalledWith('/resources', { scroll: false });
  });

  it('should remove search filter', () => {
    currentSearchParams = new URLSearchParams({
      search: 'react',
      category: 'PROGRAMMING',
    });
    const { result } = renderHook(() => useResourceFilters());

    act(() => {
      result.current.removeFilter('search');
    });

    expect(result.current.filters.search).toBeUndefined();
    expect(result.current.filters.categories).toEqual([ResourceCategory.PROGRAMMING]);
    expect(mockPush).toHaveBeenCalledWith('/resources?category=PROGRAMMING', { scroll: false });
  });

  it('should remove specific category filter', () => {
    currentSearchParams = new URLSearchParams({ category: 'PROGRAMMING,WEB' });
    const { result } = renderHook(() => useResourceFilters());

    act(() => {
      result.current.removeFilter('category', 'PROGRAMMING');
    });

    expect(result.current.filters.categories).toEqual([ResourceCategory.WEB]);
    expect(mockPush).toHaveBeenCalledWith('/resources?category=WEB', { scroll: false });
  });

  it('should remove specific type filter', () => {
    currentSearchParams = new URLSearchParams({ type: 'VIDEO,ARTICLE' });
    const { result } = renderHook(() => useResourceFilters());

    act(() => {
      result.current.removeFilter('type', 'VIDEO');
    });

    expect(result.current.filters.types).toEqual([ResourceType.ARTICLE]);
    expect(mockPush).toHaveBeenCalledWith('/resources?type=ARTICLE', { scroll: false });
  });

  it('should calculate active filter count correctly', () => {
    const { result } = renderHook(() => useResourceFilters());

    expect(result.current.activeFilterCount).toBe(0);

    act(() => {
      result.current.setSearch('react');
    });
    expect(result.current.activeFilterCount).toBe(1);

    act(() => {
      result.current.toggleCategory(ResourceCategory.PROGRAMMING);
    });
    expect(result.current.activeFilterCount).toBe(2);

    act(() => {
      result.current.toggleType(ResourceType.VIDEO);
    });
    expect(result.current.activeFilterCount).toBe(3);

    act(() => {
      result.current.toggleType(ResourceType.ARTICLE);
    });
    expect(result.current.activeFilterCount).toBe(4);
  });

  it('should reset page to 1 when filters change', () => {
    currentSearchParams = new URLSearchParams({ page: '5' });
    const { result } = renderHook(() => useResourceFilters());

    expect(result.current.filters.page).toBe(5);

    act(() => {
      result.current.setSearch('react');
    });
    expect(result.current.filters.page).toBe(1);

    act(() => {
      result.current.setPage(3);
    });
    expect(result.current.filters.page).toBe(3);

    act(() => {
      result.current.toggleCategory(ResourceCategory.PROGRAMMING);
    });
    expect(result.current.filters.page).toBe(1);
  });

  it('should update URL without scroll', () => {
    const { result } = renderHook(() => useResourceFilters());

    act(() => {
      result.current.setSearch('react');
    });

    expect(mockPush).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({ scroll: false })
    );
  });
});
