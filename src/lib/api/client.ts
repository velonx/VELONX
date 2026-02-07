import type {
  ApiResponse,
  PaginatedResponse,
  ApiError,
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
  NotificationListResponse,
  NotificationFilters,
} from './types';
import { getCSRFToken } from '@/lib/utils/csrf';

// Custom error class for API errors
export class ApiClientError extends Error {
  constructor(
    public statusCode: number,
    public code: string,
    message: string,
    public details?: Record<string, any>
  ) {
    super(message);
    this.name = 'ApiClientError';
  }
}

// Base fetch wrapper with error handling and CSRF token support
async function fetchApi<T>(
  url: string,
  options?: RequestInit
): Promise<T> {
  try {
    const method = options?.method?.toUpperCase() || 'GET';
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    
    // Merge with provided headers
    if (options?.headers) {
      Object.entries(options.headers).forEach(([key, value]) => {
        if (typeof value === 'string') {
          headers[key] = value;
        }
      });
    }
    
    // Add CSRF token for state-changing requests
    if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(method)) {
      try {
        const csrfToken = await getCSRFToken();
        headers['x-csrf-token'] = csrfToken;
      } catch (error) {
        console.error('[API Client] Failed to get CSRF token:', error);
        // Continue without CSRF token - server will reject if required
      }
    }
    
    const response = await fetch(url, {
      ...options,
      headers,
      credentials: 'include', // Include cookies for CSRF token
    });

    const data = await response.json();

    if (!response.ok) {
      const error = data as ApiError;
      throw new ApiClientError(
        response.status,
        error.error.code,
        error.error.message,
        error.error.details
      );
    }

    return data;
  } catch (error) {
    if (error instanceof ApiClientError) {
      throw error;
    }
    
    // Network or parsing errors
    throw new ApiClientError(
      500,
      'NETWORK_ERROR',
      error instanceof Error ? error.message : 'An unexpected error occurred'
    );
  }
}

// Build query string from params
function buildQueryString(params: Record<string, any>): string {
  const searchParams = new URLSearchParams();
  
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      searchParams.append(key, String(value));
    }
  });
  
  const queryString = searchParams.toString();
  return queryString ? `?${queryString}` : '';
}

// Events API
export const eventsApi = {
  list: (filters?: EventFilters) =>
    fetchApi<PaginatedResponse<Event>>(
      `/api/events${buildQueryString(filters || {})}`
    ),

  getById: (id: string) =>
    fetchApi<ApiResponse<Event>>(`/api/events/${id}`),

  create: (data: Partial<Event>) =>
    fetchApi<ApiResponse<Event>>('/api/events', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  update: (id: string, data: Partial<Event>) =>
    fetchApi<ApiResponse<Event>>(`/api/events/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),

  delete: (id: string) =>
    fetchApi<ApiResponse<void>>(`/api/events/${id}`, {
      method: 'DELETE',
    }),

  register: (id: string) =>
    fetchApi<ApiResponse<{ message: string }>>(`/api/events/${id}/register`, {
      method: 'POST',
    }),

  unregister: (id: string) =>
    fetchApi<ApiResponse<{ message: string }>>(`/api/events/${id}/register`, {
      method: 'DELETE',
    }),

  getAttendees: (id: string) =>
    fetchApi<ApiResponse<{
      event: {
        id: string;
        title: string;
        date: string;
        maxSeats: number;
      };
      attendees: Array<{
        id: string;
        eventId: string;
        userId: string;
        status: string;
        createdAt: string;
        user: {
          id: string;
          name: string | null;
          email: string;
          image: string | null;
          createdAt: string;
        };
      }>;
      totalAttendees: number;
    }>>(`/api/events/${id}/attendees`),
};

// Projects API
export const projectsApi = {
  list: (filters?: ProjectFilters) =>
    fetchApi<PaginatedResponse<Project>>(
      `/api/projects${buildQueryString(filters || {})}`
    ),

  getById: (id: string) =>
    fetchApi<ApiResponse<Project>>(`/api/projects/${id}`),

  create: (data: Partial<Project>) =>
    fetchApi<ApiResponse<Project>>('/api/projects', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  update: (id: string, data: Partial<Project>) =>
    fetchApi<ApiResponse<Project>>(`/api/projects/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),

  delete: (id: string) =>
    fetchApi<ApiResponse<void>>(`/api/projects/${id}`, {
      method: 'DELETE',
    }),

  addMember: (id: string, userId: string, role?: string) =>
    fetchApi<ApiResponse<{ message: string }>>(`/api/projects/${id}/members`, {
      method: 'POST',
      body: JSON.stringify({ userId, role }),
    }),

  removeMember: (id: string, userId: string) =>
    fetchApi<ApiResponse<{ message: string }>>(`/api/projects/${id}/members/${userId}`, {
      method: 'DELETE',
    }),
};

// Mentors API
export const mentorsApi = {
  list: (filters?: MentorFilters) =>
    fetchApi<PaginatedResponse<Mentor>>(
      `/api/mentors${buildQueryString(filters || {})}`
    ),

  getById: (id: string) =>
    fetchApi<ApiResponse<Mentor>>(`/api/mentors/${id}`),

  create: (data: Partial<Mentor>) =>
    fetchApi<ApiResponse<Mentor>>('/api/mentors', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  update: (id: string, data: Partial<Mentor>) =>
    fetchApi<ApiResponse<Mentor>>(`/api/mentors/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),

  delete: (id: string) =>
    fetchApi<ApiResponse<void>>(`/api/mentors/${id}`, {
      method: 'DELETE',
    }),
};

// Resources API
export const resourcesApi = {
  list: (filters?: ResourceFilters) =>
    fetchApi<PaginatedResponse<Resource>>(
      `/api/resources${buildQueryString(filters || {})}`
    ),

  getById: (id: string) =>
    fetchApi<ApiResponse<Resource>>(`/api/resources/${id}`),

  create: (data: Partial<Resource>) =>
    fetchApi<ApiResponse<Resource>>('/api/resources', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  update: (id: string, data: Partial<Resource>) =>
    fetchApi<ApiResponse<Resource>>(`/api/resources/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),

  delete: (id: string) =>
    fetchApi<ApiResponse<void>>(`/api/resources/${id}`, {
      method: 'DELETE',
    }),

  trackAccess: (id: string) =>
    fetchApi<ApiResponse<{ message: string }>>(`/api/resources/${id}/access`, {
      method: 'POST',
    }),

  trackVisit: (id: string) =>
    fetchApi<ApiResponse<{
      alreadyVisited: boolean;
      xpAwarded: boolean;
      xpAmount?: number;
      newXP?: number;
      newLevel?: number;
      leveledUp?: boolean;
      message: string;
    }>>(`/api/resources/${id}/visit`, {
      method: 'POST',
    }),
};

// Blog API
export const blogApi = {
  list: (filters?: BlogFilters) =>
    fetchApi<PaginatedResponse<BlogPost>>(
      `/api/blog${buildQueryString(filters || {})}`
    ),

  getById: (id: string) =>
    fetchApi<ApiResponse<BlogPost>>(`/api/blog/${id}`),

  create: (data: Partial<BlogPost>) =>
    fetchApi<ApiResponse<BlogPost>>('/api/blog', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  update: (id: string, data: Partial<BlogPost>) =>
    fetchApi<ApiResponse<BlogPost>>(`/api/blog/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),

  delete: (id: string) =>
    fetchApi<ApiResponse<void>>(`/api/blog/${id}`, {
      method: 'DELETE',
    }),
};

// Leaderboard API
export const leaderboardApi = {
  list: (filters?: LeaderboardFilters) =>
    fetchApi<PaginatedResponse<LeaderboardEntry>>(
      `/api/leaderboard${buildQueryString(filters || {})}`
    ),

  awardXp: (userId: string, amount: number, reason: string) =>
    fetchApi<ApiResponse<{ xp: number; level: number }>>('/api/leaderboard/award-xp', {
      method: 'POST',
      body: JSON.stringify({ userId, amount, reason }),
    }),
};

// Meetings API
export const meetingsApi = {
  list: (filters?: MeetingFilters) =>
    fetchApi<PaginatedResponse<Meeting>>(
      `/api/meetings${buildQueryString(filters || {})}`
    ),

  getById: (id: string) =>
    fetchApi<ApiResponse<Meeting>>(`/api/meetings/${id}`),

  create: (data: Partial<Meeting>) =>
    fetchApi<ApiResponse<Meeting>>('/api/meetings', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  update: (id: string, data: Partial<Meeting>) =>
    fetchApi<ApiResponse<Meeting>>(`/api/meetings/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),

  delete: (id: string) =>
    fetchApi<ApiResponse<void>>(`/api/meetings/${id}`, {
      method: 'DELETE',
    }),

  addAttendee: (id: string, userId: string) =>
    fetchApi<ApiResponse<{ message: string }>>(`/api/meetings/${id}/attendees`, {
      method: 'POST',
      body: JSON.stringify({ userId }),
    }),

  updateAttendeeStatus: (id: string, userId: string, status: string) =>
    fetchApi<ApiResponse<{ message: string }>>(`/api/meetings/${id}/attendees/${userId}`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    }),
};

// Users API
export const usersApi = {
  list: (params?: { page?: number; pageSize?: number }) =>
    fetchApi<PaginatedResponse<User>>(
      `/api/users${buildQueryString(params || {})}`
    ),

  getById: (id: string) =>
    fetchApi<ApiResponse<User>>(`/api/users/${id}`),

  update: (id: string, data: Partial<User>) =>
    fetchApi<ApiResponse<User>>(`/api/users/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),

  getStats: (id: string) =>
    fetchApi<ApiResponse<{
      eventsAttended: number;
      projectsOwned: number;
      projectsMember: number;
      blogPosts: number;
    }>>(`/api/users/${id}/stats`),

  checkIn: () =>
    fetchApi<ApiResponse<{
      currentStreak: number;
      longestStreak: number;
      streakBonusAwarded: boolean;
      xpAwarded: number;
      lastLoginDate: Date;
    }>>('/api/users/check-in', {
      method: 'POST',
    }),

  getStreak: () =>
    fetchApi<ApiResponse<{
      currentStreak: number;
      longestStreak: number;
      lastLoginDate: Date | null;
    }>>('/api/users/check-in'),
};

// Admin API
export const adminApi = {
  listRequests: (filters?: UserRequestFilters) =>
    fetchApi<PaginatedResponse<UserRequest>>(
      `/api/admin/requests${buildQueryString(filters || {})}`
    ),

  approveRequest: (id: string) =>
    fetchApi<ApiResponse<UserRequest>>(`/api/admin/requests/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({ action: 'approve' }),
    }),

  rejectRequest: (id: string, reason: string) =>
    fetchApi<ApiResponse<UserRequest>>(`/api/admin/requests/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({ action: 'reject', reason }),
    }),

  getStats: () =>
    fetchApi<ApiResponse<PlatformStats>>('/api/admin/stats'),
};

// Auth API
export const authApi = {
  signup: (data: { name: string; email: string; password: string; role?: 'STUDENT' | 'ADMIN' }) =>
    fetchApi<ApiResponse<User>>('/api/auth/signup', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
};

// Notifications API
export const notificationsApi = {
  list: (filters?: NotificationFilters) =>
    fetchApi<ApiResponse<NotificationListResponse>>(
      `/api/notifications${buildQueryString(filters || {})}`
    ),

  getUnreadCount: () =>
    fetchApi<ApiResponse<{ count: number }>>('/api/notifications/unread-count'),

  markAsRead: (id: string) =>
    fetchApi<ApiResponse<Notification>>(`/api/notifications/${id}`, {
      method: 'PATCH',
    }),

  markAllAsRead: () =>
    fetchApi<ApiResponse<{ count: number }>>('/api/notifications/mark-all-read', {
      method: 'PATCH',
    }),

  delete: (id: string) =>
    fetchApi<ApiResponse<void>>(`/api/notifications/${id}`, {
      method: 'DELETE',
    }),

  clearAll: () =>
    fetchApi<ApiResponse<{ count: number }>>('/api/notifications/clear-all', {
      method: 'DELETE',
    }),
};
