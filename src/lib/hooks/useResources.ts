/**
 * Custom hook for fetching and managing resources data
 * Feature: resources-page-ui-improvements
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { resourcesApi, ApiClientError } from '@/lib/api/client';
import type { Resource, ResourceFilters } from '@/lib/api/types';

/**
 * Enhanced Error Interface with user-friendly messages
 */
export interface ResourceError extends Error {
  statusCode?: number;
  code?: string;
  userMessage: string;
  canRetry: boolean;
}

/**
 * Resources Hook State Interface
 */
export interface UseResourcesState {
  resources: Resource[];
  pagination: {
    page: number;
    pageSize: number;
    totalCount: number;
    totalPages: number;
  } | null;
  isLoading: boolean;
  error: ResourceError | null;
}

/**
 * Resources Hook Return Interface
 */
export interface UseResourcesReturn extends UseResourcesState {
  refetch: () => Promise<void>;
  retry: () => Promise<void>;
}

/**
 * Maximum number of retry attempts
 */
const MAX_RETRY_ATTEMPTS = 3;

/**
 * Initial retry delay in milliseconds
 */
const INITIAL_RETRY_DELAY = 1000;


/**
 * Convert API errors to user-friendly ResourceError
 * 
 * @param err - The caught error
 * @returns ResourceError with user-friendly message and retry capability
 */
function createResourceError(err: unknown): ResourceError {
  // Handle ApiClientError
  if (err instanceof ApiClientError) {
    const statusCode = err.statusCode;
    const code = err.code;
    
    // Network errors (can retry)
    if (code === 'NETWORK_ERROR') {
      return Object.assign(new Error(err.message), {
        statusCode,
        code,
        userMessage: 'Unable to load resources. Please check your connection.',
        canRetry: true,
      });
    }
    
    // Server errors 5xx (can retry)
    if (statusCode >= 500 && statusCode < 600) {
      return Object.assign(new Error(err.message), {
        statusCode,
        code,
        userMessage: 'Something went wrong on our end. Please try again.',
        canRetry: true,
      });
    }
    
    // Client errors 4xx (usually cannot retry)
    if (statusCode >= 400 && statusCode < 500) {
      let userMessage = 'Unable to load resources.';
      
      if (statusCode === 400) {
        userMessage = 'Invalid filter combination. Please adjust your filters.';
      } else if (statusCode === 404) {
        userMessage = 'Resources not found.';
      } else if (statusCode === 401) {
        userMessage = 'You need to be logged in to view resources.';
      } else if (statusCode === 403) {
        userMessage = 'You do not have permission to view these resources.';
      }
      
      return Object.assign(new Error(err.message), {
        statusCode,
        code,
        userMessage,
        canRetry: false,
      });
    }
    
    // Other API errors
    return Object.assign(new Error(err.message), {
      statusCode,
      code,
      userMessage: err.message || 'Failed to load resources.',
      canRetry: true,
    });
  }
  
  // Generic errors (network issues, parsing errors, etc.)
  const message = err instanceof Error ? err.message : 'An unexpected error occurred';
  return Object.assign(new Error(message), {
    userMessage: 'Unable to load resources. Please try again.',
    canRetry: true,
  });
}

/**
 * Sleep utility for exponential backoff
 * 
 * @param ms - Milliseconds to sleep
 */
function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Custom hook for fetching resources with filter parameters
 * 
 * @param filters - Resource filter parameters (search, category, type, page, pageSize)
 * @returns Resources data, loading state, error state, refetch function, and retry function
 * 
 * @example
 * ```tsx
 * const { resources, pagination, isLoading, error, refetch, retry } = useResources({
 *   search: 'react',
 *   category: 'PROGRAMMING',
 *   page: 1,
 *   pageSize: 12
 * });
 * 
 * // Retry after error
 * if (error && error.canRetry) {
 *   await retry();
 * }
 * ```
 */
export function useResources(filters: ResourceFilters = {}): UseResourcesReturn {
  const [state, setState] = useState<UseResourcesState>({
    resources: [],
    pagination: null,
    isLoading: true,
    error: null,
  });
  
  // Track retry attempts for exponential backoff
  const retryCountRef = useRef(0);
  
  // Track if component is mounted to prevent state updates after unmount
  const isMountedRef = useRef(true);

  /**
   * Fetch resources from API with current filter parameters
   * Implements exponential backoff retry logic
   * 
   * @param isRetry - Whether this is a retry attempt
   */
  const fetchResources = useCallback(async (isRetry: boolean = false) => {
    // Only update state if component is still mounted
    if (!isMountedRef.current) return;
    
    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const response = await resourcesApi.list(filters);
      
      // Reset retry count on success
      retryCountRef.current = 0;
      
      if (!isMountedRef.current) return;
      
      setState({
        resources: response.data,
        pagination: response.pagination,
        isLoading: false,
        error: null,
      });
    } catch (err) {
      const error = createResourceError(err);
      
      // Log error for debugging
      console.error('[useResources] Fetch error:', {
        message: error.message,
        statusCode: error.statusCode,
        code: error.code,
        filters,
      });
      
      if (!isMountedRef.current) return;
      
      setState({
        resources: [],
        pagination: null,
        isLoading: false,
        error,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters.search, filters.category, filters.type, filters.page, filters.pageSize]);

  /**
   * Fetch resources on mount and when filters change
   */
  useEffect(() => {
    // Reset retry count when filters change
    retryCountRef.current = 0;
    fetchResources();
     
  }, [fetchResources]);
  
  /**
   * Cleanup on unmount
   */
  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  /**
   * Refetch function for manual refresh (e.g., after filter change)
   * Resets retry count
   */
  const refetch = useCallback(async () => {
    retryCountRef.current = 0;
    await fetchResources();
  }, [fetchResources]);
  
  /**
   * Retry function with exponential backoff
   * Preserves filter state and implements retry limits
   * 
   * Exponential backoff formula: delay = INITIAL_RETRY_DELAY * (2 ^ retryCount)
   * - Attempt 1: 1000ms (1s)
   * - Attempt 2: 2000ms (2s)
   * - Attempt 3: 4000ms (4s)
   */
  const retry = useCallback(async () => {
    // Check if we've exceeded max retry attempts
    if (retryCountRef.current >= MAX_RETRY_ATTEMPTS) {
      console.warn('[useResources] Max retry attempts reached');
      
      // Update error message to indicate max retries reached
      setState(prev => ({
        ...prev,
        error: prev.error ? {
          ...prev.error,
          userMessage: 'Unable to load resources after multiple attempts. Please try again later.',
          canRetry: false,
        } : null,
      }));
      
      return;
    }
    
    // Calculate exponential backoff delay
    const delay = INITIAL_RETRY_DELAY * Math.pow(2, retryCountRef.current);
    
    console.log(`[useResources] Retrying in ${delay}ms (attempt ${retryCountRef.current + 1}/${MAX_RETRY_ATTEMPTS})`);
    
    // Wait before retrying
    await sleep(delay);
    
    // Increment retry count
    retryCountRef.current += 1;
    
    // Attempt to fetch resources again
    await fetchResources(true);
  }, [fetchResources]);

  return {
    ...state,
    refetch,
    retry,
  };
}
