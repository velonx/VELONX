'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  eventsApi,
  projectsApi,
  mentorsApi,
  resourcesApi,
  blogApi,
  leaderboardApi,
  meetingsApi,
  usersApi,
  adminApi,
  ApiClientError,
} from './client';
import type {
  Event,
  EventFilters,
  Project,
  ProjectFilters,
  Mentor,
  MentorFilters,
  Resource,
  ResourceFilters,
  BlogPost,
  BlogFilters,
  LeaderboardEntry,
  LeaderboardFilters,
  Meeting,
  MeetingFilters,
  User,
  UserRequest,
  UserRequestFilters,
  PlatformStats,
} from './types';

interface UseApiState<T> {
  data: T | null;
  loading: boolean;
  error: ApiClientError | null;
  refetch: () => Promise<void>;
}

interface UsePaginatedApiState<T> {
  data: T[];
  loading: boolean;
  error: ApiClientError | null;
  pagination: {
    page: number;
    pageSize: number;
    totalCount: number;
    totalPages: number;
  } | null;
  refetch: () => Promise<void>;
}

// Generic hook for single resource
function useApiResource<T>(
  fetcher: () => Promise<{ success: true; data: T }>,
  dependencies: any[] = []
): UseApiState<T> {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<ApiClientError | null>(null);

  useEffect(() => {
    let cancelled = false;
    
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await fetcher();
        if (!cancelled) {
          setData(response.data);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof ApiClientError ? err : new ApiClientError(500, 'UNKNOWN_ERROR', 'An error occurred'));
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    fetchData();

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, dependencies);

  const refetch = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetcher();
      setData(response.data);
    } catch (err) {
      setError(err instanceof ApiClientError ? err : new ApiClientError(500, 'UNKNOWN_ERROR', 'An error occurred'));
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, dependencies);

  return { data, loading, error, refetch };
}

// Generic hook for paginated resources
function usePaginatedApiResource<T>(
  fetcher: () => Promise<{ success: true; data: T[]; pagination: any }>,
  dependencies: any[] = []
): UsePaginatedApiState<T> {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<ApiClientError | null>(null);
  const [pagination, setPagination] = useState<any>(null);

  useEffect(() => {
    let cancelled = false;
    
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await fetcher();
        if (!cancelled) {
          setData(response.data);
          setPagination(response.pagination);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof ApiClientError ? err : new ApiClientError(500, 'UNKNOWN_ERROR', 'An error occurred'));
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    fetchData();

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, dependencies);

  const refetch = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetcher();
      setData(response.data);
      setPagination(response.pagination);
    } catch (err) {
      setError(err instanceof ApiClientError ? err : new ApiClientError(500, 'UNKNOWN_ERROR', 'An error occurred'));
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, dependencies);

  return { data, loading, error, pagination, refetch };
}

// Events hooks
export function useEvents(filters?: EventFilters) {
  return usePaginatedApiResource<Event>(
    () => eventsApi.list(filters),
    [JSON.stringify(filters)]
  );
}

export function useEvent(id: string) {
  return useApiResource<Event>(
    () => eventsApi.getById(id),
    [id]
  );
}

// Projects hooks
export function useProjects(filters?: ProjectFilters) {
  return usePaginatedApiResource<Project>(
    () => projectsApi.list(filters),
    [JSON.stringify(filters)]
  );
}

export function useProject(id: string) {
  return useApiResource<Project>(
    () => projectsApi.getById(id),
    [id]
  );
}

// Mentors hooks
export function useMentors(filters?: MentorFilters) {
  return usePaginatedApiResource<Mentor>(
    () => mentorsApi.list(filters),
    [JSON.stringify(filters)]
  );
}

export function useMentor(id: string) {
  return useApiResource<Mentor>(
    () => mentorsApi.getById(id),
    [id]
  );
}

// Resources hooks
export function useResources(filters?: ResourceFilters) {
  return usePaginatedApiResource<Resource>(
    () => resourcesApi.list(filters),
    [JSON.stringify(filters)]
  );
}

export function useResource(id: string) {
  return useApiResource<Resource>(
    () => resourcesApi.getById(id),
    [id]
  );
}

// Blog hooks
export function useBlogPosts(filters?: BlogFilters) {
  return usePaginatedApiResource<BlogPost>(
    () => blogApi.list(filters),
    [JSON.stringify(filters)]
  );
}

export function useBlogPost(id: string) {
  return useApiResource<BlogPost>(
    () => blogApi.getById(id),
    [id]
  );
}

// Leaderboard hooks
export function useLeaderboard(filters?: LeaderboardFilters) {
  return usePaginatedApiResource<LeaderboardEntry>(
    () => leaderboardApi.list(filters),
    [JSON.stringify(filters)]
  );
}

// Meetings hooks
export function useMeetings(filters?: MeetingFilters) {
  return usePaginatedApiResource<Meeting>(
    () => meetingsApi.list(filters),
    [JSON.stringify(filters)]
  );
}

export function useMeeting(id: string) {
  return useApiResource<Meeting>(
    () => meetingsApi.getById(id),
    [id]
  );
}

// Users hooks
export function useUsers(params?: { page?: number; pageSize?: number }) {
  return usePaginatedApiResource<User>(
    () => usersApi.list(params),
    [JSON.stringify(params)]
  );
}

export function useUser(id: string) {
  return useApiResource<User>(
    () => usersApi.getById(id),
    [id]
  );
}

export function useUserStats(id: string) {
  // Skip API call if ID is invalid
  const shouldFetch = id && id !== 'skip' && id.length === 24;
  
  return useApiResource<{
    eventsAttended: number;
    projectsOwned: number;
    projectsMember: number;
    blogPosts: number;
  }>(
    () => shouldFetch ? usersApi.getStats(id) : Promise.resolve({ success: true as const, data: { eventsAttended: 0, projectsOwned: 0, projectsMember: 0, blogPosts: 0 } }),
    [id, shouldFetch]
  );
}

export function useUserStreak() {
  return useApiResource<{
    currentStreak: number;
    longestStreak: number;
    lastLoginDate: Date | null;
  }>(
    () => usersApi.getStreak(),
    []
  );
}

export function useCheckIn() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<ApiClientError | null>(null);
  const [data, setData] = useState<{
    currentStreak: number;
    longestStreak: number;
    streakBonusAwarded: boolean;
    xpAwarded: number;
    lastLoginDate: Date;
  } | null>(null);

  const checkIn = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await usersApi.checkIn();
      setData(response.data);
      return response;
    } catch (err) {
      const apiError = err instanceof ApiClientError ? err : new ApiClientError(500, 'UNKNOWN_ERROR', 'An error occurred');
      setError(apiError);
      throw apiError;
    } finally {
      setLoading(false);
    }
  }, []);

  return { checkIn, loading, error, data };
}

// Resource visit tracking hook
export function useResourceVisit() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<ApiClientError | null>(null);
  const [data, setData] = useState<{
    alreadyVisited: boolean;
    xpAwarded: boolean;
    xpAmount?: number;
    newXP?: number;
    newLevel?: number;
    leveledUp?: boolean;
    message: string;
  } | null>(null);

  const trackVisit = useCallback(async (resourceId: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await resourcesApi.trackVisit(resourceId);
      setData(response.data);
      return response;
    } catch (err) {
      const apiError = err instanceof ApiClientError ? err : new ApiClientError(500, 'UNKNOWN_ERROR', 'An error occurred');
      setError(apiError);
      throw apiError;
    } finally {
      setLoading(false);
    }
  }, []);

  return { trackVisit, loading, error, data };
}

// Admin hooks
export function useUserRequests(filters?: UserRequestFilters) {
  return usePaginatedApiResource<UserRequest>(
    () => adminApi.listRequests(filters),
    [JSON.stringify(filters)]
  );
}

export function usePlatformStats() {
  return useApiResource<PlatformStats>(
    () => adminApi.getStats(),
    []
  );
}

// Mutation hooks with optimistic updates
export function useMutation<TData, TVariables>(
  mutationFn: (variables: TVariables) => Promise<{ success: true; data: TData }>,
  options?: {
    onSuccess?: (data: TData) => void;
    onError?: (error: ApiClientError) => void;
  }
) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<ApiClientError | null>(null);

  const mutate = useCallback(async (variables: TVariables) => {
    try {
      setLoading(true);
      setError(null);
      const response = await mutationFn(variables);
      options?.onSuccess?.(response.data);
      return response.data;
    } catch (err) {
      const apiError = err instanceof ApiClientError ? err : new ApiClientError(500, 'UNKNOWN_ERROR', 'An error occurred');
      setError(apiError);
      options?.onError?.(apiError);
      throw apiError;
    } finally {
      setLoading(false);
    }
  }, [mutationFn, options]);

  return { mutate, loading, error };
}
