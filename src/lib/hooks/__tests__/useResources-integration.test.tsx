/**
 * Integration tests for useResources and useResourceFilters hooks
 * Feature: resources-page-ui-improvements
 */

import { renderHook, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useResources } from '../useResources';
import { useResourceFilters } from '../useResourceFilters';
import { resourcesApi } from '@/lib/api/client';
import type { Resource } from '@/lib/api/types';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';

// Mock Next.js navigation
vi.mock('next/navigation', () => ({
  useRouter: vi.fn(),
  useSearchParams: vi.fn(),
  usePathname: vi.fn(),
}));

// Mock the API client
vi.mock('@/lib/api/client', () => ({
  resourcesApi: {
    list: vi.fn(),
  },
}));

describe('useResources + useResourceFilters Integration', () => {
  const mockResources: Resource[] = [
    {
      id: '1',
      title: 'React Documentation',
      description: 'Official React documentation',
      category: 'PROGRAMMING',
      type: 'DOCUMENTATION',
      url: 'https://react.dev',
      imageUrl: null,
      accessCount: 100,
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z',
    },
  ];

  const mockPagination = {
    page: 1,
    pageSize: 12,
    totalCount: 1,
    totalPages: 1,
  };

  const mockRouter = {
    push: vi.fn(),
    replace: vi.fn(),
    back: vi.fn(),
    forward: vi.fn(),
    refresh: vi.fn(),
    prefetch: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useRouter).mockReturnValue(mockRouter as any);
    vi.mocked(usePathname).mockReturnValue('/resources');
    vi.mocked(useSearchParams).mockReturnValue(new URLSearchParams() as any);
    vi.mocked(resourcesApi.list).mockResolvedValue({
      success: true,
      data: mockResources,
      pagination: mockPagination,
    });
  });

  it('should work together to fetch filtered resources', async () => {
    // Render both hooks
    const { result: filtersResult } = renderHook(() => useResourceFilters());
    
    // Wait for initial state
    await waitFor(() => {
      expect(filtersResult.current.filters).toBeDefined();
    });

    // Use filters from useResourceFilters in useResources
    const { result: resourcesResult } = renderHook(() =>
      useResources({
        search: filtersResult.current.filters.search,
        category: filtersResult.current.filters.categories[0],
        type: filtersResult.current.filters.types[0],
        page: filtersResult.current.filters.page,
        pageSize: filtersResult.current.filters.pageSize,
      })
    );

    // Wait for resources to load
    await waitFor(() => {
      expect(resourcesResult.current.isLoading).toBe(false);
    });

    expect(resourcesResult.current.resources).toEqual(mockResources);
    expect(resourcesResult.current.error).toBeNull();
  });

  it('should demonstrate typical usage pattern', async () => {
    // This test demonstrates how the hooks would be used together in a component
    const { result: filtersResult } = renderHook(() => useResourceFilters());

    await waitFor(() => {
      expect(filtersResult.current.filters).toBeDefined();
    });

    // Simulate user setting a search query
    filtersResult.current.setSearch('react');

    await waitFor(() => {
      expect(filtersResult.current.filters.search).toBe('react');
    });

    // The component would then pass these filters to useResources
    const filters = {
      search: filtersResult.current.filters.search,
      page: filtersResult.current.filters.page,
      pageSize: filtersResult.current.filters.pageSize,
    };

    const { result: resourcesResult } = renderHook(() => useResources(filters));

    await waitFor(() => {
      expect(resourcesResult.current.isLoading).toBe(false);
    });

    // Verify API was called with correct filters
    expect(resourcesApi.list).toHaveBeenCalledWith(
      expect.objectContaining({
        search: 'react',
      })
    );
  });
});
