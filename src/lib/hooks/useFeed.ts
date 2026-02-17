'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { ApiClientError } from '@/lib/api/client';
import type { FeedItemData } from '@/lib/types/community.types';

/**
 * Feed Filter Type
 */
export type FeedFilter = 'ALL' | 'FOLLOWING' | 'GROUPS';

/**
 * Feed Hook State Interface
 */
export interface UseFeedState {
  items: FeedItemData[];
  hasMore: boolean;
  isLoading: boolean;
  error: ApiClientError | null;
}

/**
 * Feed Hook Return Interface
 */
export interface UseFeedReturn extends UseFeedState {
  loadMore: () => Promise<void>;
  refetch: () => Promise<void>;
  setFilter: (filter: FeedFilter) => void;
  filter: FeedFilter;
}

/**
 * Convert API errors to user-friendly messages
 */
function getErrorMessage(err: unknown): string {
  if (err instanceof ApiClientError) {
    if (err.statusCode === 401) {
      return 'Please log in to view your feed';
    }
    if (err.statusCode === 403) {
      return 'You do not have permission to view this feed';
    }
    return err.message || 'An error occurred';
  }
  return err instanceof Error ? err.message : 'An unexpected error occurred';
}

/**
 * Custom hook for managing personalized feed with infinite scroll
 * 
 * Features:
 * - Fetch feed items with pagination
 * - Filter by ALL, FOLLOWING, or GROUPS
 * - Infinite scroll support
 * - Error handling
 * - Loading state management
 * 
 * @param limit - Number of items to fetch per page (default: 20)
 * 
 * @example
 * ```tsx
 * const { items, hasMore, isLoading, loadMore, setFilter, filter } = useFeed();
 * 
 * // Change filter
 * setFilter('FOLLOWING');
 * 
 * // Load more items
 * await loadMore();
 * ```
 */
export function useFeed(limit: number = 20): UseFeedReturn {
  const [state, setState] = useState<UseFeedState>({
    items: [],
    hasMore: true,
    isLoading: true,
    error: null,
  });
  
  const [filter, setFilter] = useState<FeedFilter>('ALL');
  
  const isMountedRef = useRef(true);
  const cursorRef = useRef<string | null>(null);

  /**
   * Fetch feed items from API
   */
  const fetchFeed = useCallback(async (cursor?: string | null) => {
    if (!isMountedRef.current) return;
    
    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const params = new URLSearchParams();
      params.append('filter', filter);
      params.append('limit', limit.toString());
      if (cursor) params.append('cursor', cursor);
      
      const response = await fetch(`/api/community/feed?${params.toString()}`);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new ApiClientError(
          response.status,
          errorData.error?.code || 'FETCH_ERROR',
          errorData.error?.message || 'Failed to fetch feed'
        );
      }
      
      const data = await response.json();
      
      if (!isMountedRef.current) return;
      
      const newItems = data.data || [];
      const nextCursor = data.pagination?.cursor || null;
      
      setState(prev => ({
        ...prev,
        items: cursor ? [...prev.items, ...newItems] : newItems,
        hasMore: !!nextCursor,
        isLoading: false,
        error: null,
      }));
      
      cursorRef.current = nextCursor;
    } catch (err) {
      console.error('[useFeed] Fetch error:', err);
      
      if (!isMountedRef.current) return;
      
      const error = err instanceof ApiClientError 
        ? err 
        : new ApiClientError(500, 'NETWORK_ERROR', getErrorMessage(err));
      
      setState(prev => ({
        ...prev,
        isLoading: false,
        error,
      }));
    }
  }, [filter, limit]);

  /**
   * Fetch feed on mount and when filter changes
   */
  useEffect(() => {
    cursorRef.current = null;
    fetchFeed();
  }, [fetchFeed]);
  
  /**
   * Cleanup on unmount
   */
  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  /**
   * Refetch function for manual refresh
   */
  const refetch = useCallback(async () => {
    cursorRef.current = null;
    await fetchFeed();
  }, [fetchFeed]);
  
  /**
   * Load more feed items (infinite scroll)
   */
  const loadMore = useCallback(async () => {
    if (!state.hasMore || state.isLoading) return;
    await fetchFeed(cursorRef.current);
  }, [state.hasMore, state.isLoading, fetchFeed]);

  return {
    ...state,
    loadMore,
    refetch,
    setFilter,
    filter,
  };
}
