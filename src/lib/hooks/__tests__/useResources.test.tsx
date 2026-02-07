/**
 * Unit tests for useResources hook
 * Feature: resources-page-ui-improvements
 */

import { renderHook, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useResources } from '../useResources';
import { resourcesApi } from '@/lib/api/client';
import type { Resource } from '@/lib/api/types';

// Mock the API client
vi.mock('@/lib/api/client', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/lib/api/client')>();
  return {
    ...actual,
    resourcesApi: {
      list: vi.fn(),
    },
  };
});

describe('useResources', () => {
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
    {
      id: '2',
      title: 'TypeScript Handbook',
      description: 'Learn TypeScript',
      category: 'PROGRAMMING',
      type: 'DOCUMENTATION',
      url: 'https://typescriptlang.org',
      imageUrl: null,
      accessCount: 50,
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z',
    },
  ];

  const mockPagination = {
    page: 1,
    pageSize: 12,
    totalCount: 2,
    totalPages: 1,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should fetch resources on mount', async () => {
    vi.mocked(resourcesApi.list).mockResolvedValue({
      success: true,
      data: mockResources,
      pagination: mockPagination,
    });

    const { result } = renderHook(() => useResources());

    // Initially loading
    expect(result.current.isLoading).toBe(true);
    expect(result.current.resources).toEqual([]);

    // Wait for fetch to complete
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.resources).toEqual(mockResources);
    expect(result.current.pagination).toEqual(mockPagination);
    expect(result.current.error).toBeNull();
    expect(resourcesApi.list).toHaveBeenCalledTimes(1);
  });

  it('should handle API errors', async () => {
    const mockError = new Error('Network error');
    vi.mocked(resourcesApi.list).mockRejectedValue(mockError);

    const { result } = renderHook(() => useResources());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.resources).toEqual([]);
    expect(result.current.pagination).toBeNull();
    expect(result.current.error).toBeTruthy();
    expect(result.current.error?.message).toBe('Network error');
  });

  it('should refetch resources when refetch is called', async () => {
    vi.mocked(resourcesApi.list).mockResolvedValue({
      success: true,
      data: mockResources,
      pagination: mockPagination,
    });

    const { result } = renderHook(() => useResources());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(resourcesApi.list).toHaveBeenCalledTimes(1);

    // Call refetch
    await result.current.refetch();

    expect(resourcesApi.list).toHaveBeenCalledTimes(2);
  });

  it('should pass filter parameters to API', async () => {
    vi.mocked(resourcesApi.list).mockResolvedValue({
      success: true,
      data: mockResources,
      pagination: mockPagination,
    });

    const filters = {
      search: 'react',
      category: 'PROGRAMMING',
      type: 'DOCUMENTATION',
      page: 2,
      pageSize: 10,
    };

    renderHook(() => useResources(filters));

    await waitFor(() => {
      expect(resourcesApi.list).toHaveBeenCalledWith(filters);
    });
  });

  it('should refetch when filters change', async () => {
    vi.mocked(resourcesApi.list).mockResolvedValue({
      success: true,
      data: mockResources,
      pagination: mockPagination,
    });

    const { rerender } = renderHook(
      ({ filters }) => useResources(filters),
      {
        initialProps: { filters: { page: 1 } },
      }
    );

    await waitFor(() => {
      expect(resourcesApi.list).toHaveBeenCalledTimes(1);
    });

    // Change filters
    rerender({ filters: { page: 2 } });

    await waitFor(() => {
      expect(resourcesApi.list).toHaveBeenCalledTimes(2);
    });
  });

  it('should retry after error', async () => {
    const mockError = new Error('Network error');
    vi.mocked(resourcesApi.list)
      .mockRejectedValueOnce(mockError)
      .mockResolvedValueOnce({
        success: true,
        data: mockResources,
        pagination: mockPagination,
      });

    const { result } = renderHook(() => useResources());

    // Wait for initial error
    await waitFor(() => {
      expect(result.current.error).toBeTruthy();
    });

    expect(resourcesApi.list).toHaveBeenCalledTimes(1);

    // Call retry
    await result.current.retry();

    // Wait for retry to complete
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    // Should have called API twice (initial + 1 retry)
    expect(resourcesApi.list).toHaveBeenCalledTimes(2);
    expect(result.current.resources).toEqual(mockResources);
    expect(result.current.error).toBeNull();
  });

  it('should preserve filter state during retry', async () => {
    const mockError = new Error('Network error');
    const filters = {
      search: 'react',
      category: 'PROGRAMMING',
      page: 2,
    };

    vi.mocked(resourcesApi.list)
      .mockRejectedValueOnce(mockError)
      .mockResolvedValueOnce({
        success: true,
        data: mockResources,
        pagination: mockPagination,
      });

    const { result } = renderHook(() => useResources(filters));

    // Wait for initial error
    await waitFor(() => {
      expect(result.current.error).toBeTruthy();
    });

    // Call retry
    await result.current.retry();

    // Wait for retry to complete
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    // Should have called API with same filters both times
    expect(resourcesApi.list).toHaveBeenNthCalledWith(1, filters);
    expect(resourcesApi.list).toHaveBeenNthCalledWith(2, filters);
    expect(resourcesApi.list).toHaveBeenCalledTimes(2);
  });
});
