'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { ApiClientError } from '@/lib/api/client';
import type { DiscussionRoomData, CommunityGroupData, CommunityPostData } from '@/lib/types/community.types';

/**
 * Search Results Interface
 */
export interface SearchResults {
  rooms: DiscussionRoomData[];
  groups: CommunityGroupData[];
  posts: CommunityPostData[];
  users: Array<{
    id: string;
    name: string | null;
    email: string;
    image: string | null;
  }>;
}

/**
 * Search Hook State Interface
 */
export interface UseSearchState {
  results: SearchResults;
  isSearching: boolean;
  error: ApiClientError | null;
}

/**
 * Search Hook Return Interface
 */
export interface UseSearchReturn extends UseSearchState {
  search: (query: string) => Promise<void>;
  clearResults: () => void;
}

/**
 * Convert API errors to user-friendly messages
 */
function getErrorMessage(err: unknown): string {
  if (err instanceof ApiClientError) {
    if (err.statusCode === 401) {
      return 'Please log in to search';
    }
    if (err.statusCode === 400) {
      return 'Search query is too short';
    }
    return err.message || 'An error occurred';
  }
  return err instanceof Error ? err.message : 'An unexpected error occurred';
}

/**
 * Debounce utility
 */
function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;
  
  return (...args: Parameters<T>) => {
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

/**
 * Custom hook for searching community content
 * 
 * Features:
 * - Search across rooms, groups, posts, and users
 * - Debounced search (500ms delay)
 * - Error handling
 * - Loading state management
 * - Clear results function
 * 
 * @example
 * ```tsx
 * const { results, isSearching, search, clearResults } = useSearch();
 * 
 * // Search for content
 * await search('react hooks');
 * 
 * // Clear search results
 * clearResults();
 * ```
 */
export function useSearch(): UseSearchReturn {
  const [state, setState] = useState<UseSearchState>({
    results: {
      rooms: [],
      groups: [],
      posts: [],
      users: [],
    },
    isSearching: false,
    error: null,
  });
  
  const isMountedRef = useRef(true);
  const abortControllerRef = useRef<AbortController | null>(null);

  /**
   * Cleanup on unmount
   */
  useEffect(() => {
    return () => {
      isMountedRef.current = false;
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  /**
   * Perform search
   */
  const performSearch = useCallback(async (query: string) => {
    if (!query.trim()) {
      setState({
        results: {
          rooms: [],
          groups: [],
          posts: [],
          users: [],
        },
        isSearching: false,
        error: null,
      });
      return;
    }
    
    // Abort previous request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    
    // Create new abort controller
    abortControllerRef.current = new AbortController();
    
    if (!isMountedRef.current) return;
    
    setState(prev => ({ ...prev, isSearching: true, error: null }));

    try {
      const params = new URLSearchParams();
      params.append('q', query.trim());
      
      const response = await fetch(`/api/community/search?${params.toString()}`, {
        signal: abortControllerRef.current.signal,
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new ApiClientError(
          response.status,
          errorData.error?.code || 'SEARCH_ERROR',
          errorData.error?.message || 'Failed to search'
        );
      }
      
      const data = await response.json();
      
      if (!isMountedRef.current) return;
      
      setState({
        results: data.data || {
          rooms: [],
          groups: [],
          posts: [],
          users: [],
        },
        isSearching: false,
        error: null,
      });
    } catch (err) {
      // Ignore abort errors
      if (err instanceof Error && err.name === 'AbortError') {
        return;
      }
      
      console.error('[useSearch] Search error:', err);
      
      if (!isMountedRef.current) return;
      
      const error = err instanceof ApiClientError 
        ? err 
        : new ApiClientError(500, 'NETWORK_ERROR', getErrorMessage(err));
      
      setState(prev => ({
        ...prev,
        isSearching: false,
        error,
      }));
    }
  }, []);

  /**
   * Debounced search function
   */
  const debouncedSearch = useRef(
    debounce((query: string) => {
      performSearch(query);
    }, 500)
  ).current;

  /**
   * Search function (debounced)
   */
  const search = useCallback(async (query: string) => {
    debouncedSearch(query);
  }, [debouncedSearch]);
  
  /**
   * Clear search results
   */
  const clearResults = useCallback(() => {
    setState({
      results: {
        rooms: [],
        groups: [],
        posts: [],
        users: [],
      },
      isSearching: false,
      error: null,
    });
  }, []);

  return {
    ...state,
    search,
    clearResults,
  };
}
