/**
 * Type definitions for Resources Page UI/UX Improvements
 * Feature: resources-page-ui-improvements
 */

// Re-export Resource type from API types for convenience
export type { Resource } from '@/lib/api/types';

/**
 * Resource Category Enum
 * Represents the subject area classification for resources
 */
export enum ResourceCategory {
  PROGRAMMING = 'PROGRAMMING',
  DESIGN = 'DESIGN',
  BUSINESS = 'BUSINESS',
  DATA_SCIENCE = 'DATA_SCIENCE',
  DEVOPS = 'DEVOPS',
  MOBILE = 'MOBILE',
  WEB = 'WEB',
  OTHER = 'OTHER'
}

/**
 * Resource Type Enum
 * Represents the content format classification for resources
 */
export enum ResourceType {
  ARTICLE = 'ARTICLE',
  VIDEO = 'VIDEO',
  COURSE = 'COURSE',
  BOOK = 'BOOK',
  TOOL = 'TOOL',
  DOCUMENTATION = 'DOCUMENTATION'
}

/**
 * Filter State Interface
 * Represents the current combination of filters applied to resources
 */
export interface FilterState {
  search?: string;
  categories: ResourceCategory[];
  types: ResourceType[];
  page: number;
  pageSize: number;
}

/**
 * Resources Response Interface
 * Represents the API response structure for resources
 */
export interface ResourcesResponse {
  resources: Resource[];
  pagination: {
    page: number;
    pageSize: number;
    totalCount: number;
    totalPages: number;
  };
}

/**
 * URL Query Parameters Interface
 * Represents the URL query parameters for resources page
 */
export interface ResourcesQueryParams {
  search?: string;
  category?: string | string[];
  type?: string | string[];
  page?: string;
  pageSize?: string;
}

/**
 * Active Filters Interface
 * Represents the currently active filters for display purposes
 */
export interface ActiveFilters {
  search?: string;
  categories: ResourceCategory[];
  types: ResourceType[];
}
