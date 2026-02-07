// API Response Types
export interface ApiResponse<T> {
  success: true;
  data: T;
  message?: string;
}

export interface PaginatedResponse<T> {
  success: true;
  data: T[];
  pagination: {
    page: number;
    pageSize: number;
    totalCount: number;
    totalPages: number;
  };
}

export interface ApiError {
  success: false;
  error: {
    code: string;
    message: string;
    details?: Record<string, any>;
  };
}

// Type Aliases for Project Enums
export type ProjectCategory = 'WEB_DEV' | 'MOBILE' | 'AI_ML' | 'DATA_SCIENCE' | 'DEVOPS' | 'DESIGN' | 'OTHER';
export type ProjectDifficulty = 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';
export type ProjectStatus = 'PLANNING' | 'IN_PROGRESS' | 'COMPLETED' | 'ARCHIVED';

// Entity Types
export interface User {
  id: string;
  name: string | null;
  email: string;
  image: string | null;
  role: 'STUDENT' | 'ADMIN';
  bio: string | null;
  xp: number;
  level: number;
  currentStreak: number;
  longestStreak: number;
  lastLoginDate: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Event {
  id: string;
  title: string;
  description: string;
  type: 'HACKATHON' | 'WORKSHOP' | 'WEBINAR';
  date: string;
  endDate: string | null;
  location: string | null;
  meetingLink: string | null;
  imageUrl: string | null;
  maxSeats: number;
  status: 'UPCOMING' | 'ONGOING' | 'COMPLETED' | 'CANCELLED';
  creatorId: string;
  createdAt: string;
  updatedAt: string;
  isUserRegistered?: boolean;
  creator?: {
    id: string;
    name: string | null;
    image: string | null;
  };
  _count?: {
    attendees: number;
  };
  attendees?: EventAttendee[];
}

export interface EventAttendee {
  id: string;
  eventId: string;
  userId: string;
  status: 'REGISTERED' | 'ATTENDED' | 'CANCELLED';
  createdAt: string;
  user?: {
    id: string;
    name: string | null;
    image: string | null;
  };
}

export interface Project {
  id: string;
  title: string;
  description: string;
  techStack: string[];
  status: ProjectStatus;
  category: ProjectCategory;
  difficulty: ProjectDifficulty;
  imageUrl: string | null;
  githubUrl: string | null;
  liveUrl: string | null;
  outcomes: string | null;
  ownerId: string;
  createdAt: string;
  updatedAt: string;
  joinRequests?: Array<{
    id: string;
    projectId: string;
    userId: string;
    status: 'PENDING' | 'APPROVED' | 'REJECTED';
    createdAt: string;
    user?: {
      id: string;
      name: string | null;
      image: string | null;
    };
  }>;
  owner?: {
    id: string;
    name: string | null;
    image: string | null;
  };
  members?: ProjectMember[];
  _count?: {
    members: number;
  };
}

export interface ProjectMember {
  id: string;
  projectId: string;
  userId: string;
  role: string | null;
  joinedAt: string;
  user?: {
    id: string;
    name: string | null;
    image: string | null;
  };
}

export interface Mentor {
  id: string;
  name: string;
  email: string;
  expertise: string[];
  company: string;
  bio: string;
  imageUrl: string | null;
  rating: number;
  totalSessions: number;
  available: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Resource {
  id: string;
  title: string;
  description: string;
  category: 'PROGRAMMING' | 'DESIGN' | 'BUSINESS' | 'DATA_SCIENCE' | 'DEVOPS' | 'MOBILE' | 'WEB' | 'OTHER';
  type: 'ARTICLE' | 'VIDEO' | 'COURSE' | 'BOOK' | 'TOOL' | 'DOCUMENTATION';
  url: string;
  imageUrl: string | null;
  accessCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface BlogPost {
  id: string;
  title: string;
  content: string;
  excerpt: string | null;
  imageUrl: string | null;
  tags: string[];
  status: 'DRAFT' | 'PUBLISHED';
  authorId: string;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
  author?: {
    id: string;
    name: string | null;
    image: string | null;
  };
}

export interface LeaderboardEntry {
  id: string;
  name: string | null;
  image: string | null;
  xp: number;
  level: number;
  role: 'STUDENT' | 'ADMIN';
  rank: number;
  projectCount: number;
}

export interface Meeting {
  id: string;
  title: string;
  description: string | null;
  date: string;
  duration: number;
  platform: string;
  meetingLink: string | null;
  creatorId: string;
  createdAt: string;
  updatedAt: string;
  creator?: {
    id: string;
    name: string | null;
    image: string | null;
  };
  attendees?: MeetingAttendee[];
  _count?: {
    attendees: number;
  };
}

export interface MeetingAttendee {
  id: string;
  meetingId: string;
  userId: string;
  status: 'INVITED' | 'ACCEPTED' | 'DECLINED' | 'ATTENDED';
  createdAt: string;
  user?: {
    id: string;
    name: string | null;
    image: string | null;
  };
}

export interface UserRequest {
  id: string;
  userId: string;
  type: 'ACCOUNT_APPROVAL' | 'PROJECT_SUBMISSION' | 'MENTOR_APPLICATION';
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  reason: string | null;
  reviewedBy: string | null;
  reviewedAt: string | null;
  createdAt: string;
  updatedAt: string;
  user?: {
    id: string;
    name: string | null;
    email: string;
    image: string | null;
  };
}

export interface PlatformStats {
  totalUsers: number;
  totalEvents: number;
  totalProjects: number;
  totalMentors: number;
  pendingRequests: number;
}

export interface NotificationData {
  id: string;
  userId: string;
  title: string;
  description: string;
  type: 'INFO' | 'SUCCESS' | 'AWARD' | 'EVENT' | 'WARNING';
  read: boolean;
  actionUrl: string | null;
  metadata: Record<string, any> | null;
  createdAt: string;
  updatedAt: string;
}

export interface NotificationListResponse {
  notifications: NotificationData[];
  unreadCount: number;
  pagination: {
    page: number;
    pageSize: number;
    totalCount: number;
    totalPages: number;
  };
}

// Query Parameters
export interface PaginationParams {
  page?: number;
  pageSize?: number;
}

export interface EventFilters extends PaginationParams {
  type?: 'HACKATHON' | 'WORKSHOP' | 'WEBINAR';
  status?: 'UPCOMING' | 'ONGOING' | 'COMPLETED' | 'CANCELLED';
  startDate?: string;
  endDate?: string;
}

export interface ProjectFilters extends PaginationParams {
  status?: ProjectStatus;
  techStack?: string;
  member?: string;
  // Extended filters for project page UI improvements
  category?: ProjectCategory;
  difficulty?: ProjectDifficulty;
  teamSizeMin?: number;
  teamSizeMax?: number;
}

export interface MentorFilters extends PaginationParams {
  expertise?: string;
  company?: string;
}

export interface ResourceFilters extends PaginationParams {
  category?: string;
  type?: string;
  search?: string;
}

export interface BlogFilters extends PaginationParams {
  author?: string;
  status?: 'DRAFT' | 'PUBLISHED';
  tag?: string;
}

export interface LeaderboardFilters extends PaginationParams {
  role?: 'STUDENT' | 'ADMIN';
}

export interface MeetingFilters extends PaginationParams {
  startDate?: string;
  endDate?: string;
  attendee?: string;
}

export interface UserRequestFilters extends PaginationParams {
  type?: 'ACCOUNT_APPROVAL' | 'PROJECT_SUBMISSION' | 'MENTOR_APPLICATION';
  status?: 'PENDING' | 'APPROVED' | 'REJECTED';
}

export interface NotificationFilters extends PaginationParams {
  read?: boolean;
  type?: 'INFO' | 'SUCCESS' | 'AWARD' | 'EVENT' | 'WARNING';
}
