/**
 * URL Helper Utilities for Resources Page
 * Feature: resources-page-ui-improvements
 * 
 * Provides functions to serialize and parse filter state to/from URL query parameters
 * Requirements: 2.5, 3.5, 5.5
 */

import { FilterState, ResourceCategory, ResourceType, ResourcesQueryParams } from '@/lib/types/resources.types';

/**
 * Serializes filter state to URL query parameters
 * 
 * @param filters - The current filter state
 * @returns URLSearchParams object ready to be used with router
 */
export function serializeFiltersToURL(filters: FilterState): URLSearchParams {
  const params = new URLSearchParams();

  // Add search parameter if present
  if (filters.search && filters.search.trim() !== '') {
    params.set('search', filters.search.trim());
  }

  // Add category parameters (multiple values as comma-separated)
  if (filters.categories.length > 0) {
    params.set('category', filters.categories.join(','));
  }

  // Add type parameters (multiple values as comma-separated)
  if (filters.types.length > 0) {
    params.set('type', filters.types.join(','));
  }

  // Add page parameter (only if not page 1)
  if (filters.page > 1) {
    params.set('page', filters.page.toString());
  }

  // Add pageSize parameter (only if not default 12)
  if (filters.pageSize !== 12) {
    params.set('pageSize', filters.pageSize.toString());
  }

  return params;
}

/**
 * Parses URL query parameters to filter state
 * Validates and sanitizes all parameters
 * 
 * @param searchParams - URLSearchParams or query object from Next.js router
 * @returns Validated and sanitized filter state
 */
export function parseFiltersFromURL(
  searchParams: URLSearchParams | ResourcesQueryParams
): FilterState {
  const defaultFilters: FilterState = {
    search: undefined,
    categories: [],
    types: [],
    page: 1,
    pageSize: 12,
  };

  // Convert to URLSearchParams if it's a plain object
  const params = searchParams instanceof URLSearchParams 
    ? searchParams 
    : new URLSearchParams(searchParams as Record<string, string>);

  // Parse search parameter
  const search = params.get('search');
  if (search && search.trim() !== '') {
    defaultFilters.search = sanitizeSearchQuery(search);
  }

  // Parse category parameters
  const categoryParam = params.get('category');
  if (categoryParam) {
    defaultFilters.categories = parseCategoryArray(categoryParam);
  }

  // Parse type parameters
  const typeParam = params.get('type');
  if (typeParam) {
    defaultFilters.types = parseTypeArray(typeParam);
  }

  // Parse page parameter
  const pageParam = params.get('page');
  if (pageParam) {
    defaultFilters.page = validatePageNumber(pageParam);
  }

  // Parse pageSize parameter
  const pageSizeParam = params.get('pageSize');
  if (pageSizeParam) {
    defaultFilters.pageSize = validatePageSize(pageSizeParam);
  }

  return defaultFilters;
}

/**
 * Sanitizes search query string
 * Removes potentially harmful characters and limits length
 * 
 * @param query - Raw search query
 * @returns Sanitized search query
 */
function sanitizeSearchQuery(query: string): string {
  // Trim whitespace
  let sanitized = query.trim();

  // Limit length to 200 characters
  if (sanitized.length > 200) {
    sanitized = sanitized.substring(0, 200);
  }

  // Remove any null bytes or control characters
  sanitized = sanitized.replace(/[\x00-\x1F\x7F]/g, '');

  return sanitized;
}

/**
 * Parses and validates category array from comma-separated string
 * 
 * @param categoryString - Comma-separated category values
 * @returns Array of valid ResourceCategory values
 */
function parseCategoryArray(categoryString: string): ResourceCategory[] {
  const categories: ResourceCategory[] = [];
  const parts = categoryString.split(',').map(s => s.trim());

  for (const part of parts) {
    if (isValidCategory(part)) {
      categories.push(part as ResourceCategory);
    }
  }

  return categories;
}

/**
 * Parses and validates type array from comma-separated string
 * 
 * @param typeString - Comma-separated type values
 * @returns Array of valid ResourceType values
 */
function parseTypeArray(typeString: string): ResourceType[] {
  const types: ResourceType[] = [];
  const parts = typeString.split(',').map(s => s.trim());

  for (const part of parts) {
    if (isValidType(part)) {
      types.push(part as ResourceType);
    }
  }

  return types;
}

/**
 * Validates if a string is a valid ResourceCategory
 * 
 * @param value - String to validate
 * @returns True if valid category
 */
function isValidCategory(value: string): value is ResourceCategory {
  return Object.values(ResourceCategory).includes(value as ResourceCategory);
}

/**
 * Validates if a string is a valid ResourceType
 * 
 * @param value - String to validate
 * @returns True if valid type
 */
function isValidType(value: string): value is ResourceType {
  return Object.values(ResourceType).includes(value as ResourceType);
}

/**
 * Validates and sanitizes page number
 * 
 * @param pageString - Page number as string
 * @returns Valid page number (minimum 1)
 */
function validatePageNumber(pageString: string): number {
  const page = parseInt(pageString, 10);
  
  // Return 1 if invalid or less than 1
  if (isNaN(page) || page < 1) {
    return 1;
  }

  // Cap at reasonable maximum (1000 pages)
  if (page > 1000) {
    return 1000;
  }

  return page;
}

/**
 * Validates and sanitizes page size
 * 
 * @param pageSizeString - Page size as string
 * @returns Valid page size (between 1 and 100, default 12)
 */
function validatePageSize(pageSizeString: string): number {
  const pageSize = parseInt(pageSizeString, 10);
  
  // Return default if invalid
  if (isNaN(pageSize) || pageSize < 1) {
    return 12;
  }

  // Cap at maximum 100
  if (pageSize > 100) {
    return 100;
  }

  return pageSize;
}

/**
 * Checks if two filter states are equal
 * Useful for preventing unnecessary URL updates
 * 
 * @param a - First filter state
 * @param b - Second filter state
 * @returns True if filter states are equal
 */
export function areFiltersEqual(a: FilterState, b: FilterState): boolean {
  return (
    a.search === b.search &&
    a.page === b.page &&
    a.pageSize === b.pageSize &&
    arraysEqual(a.categories, b.categories) &&
    arraysEqual(a.types, b.types)
  );
}

/**
 * Helper function to check if two arrays contain the same elements
 * 
 * @param a - First array
 * @param b - Second array
 * @returns True if arrays contain same elements
 */
function arraysEqual<T>(a: T[], b: T[]): boolean {
  if (a.length !== b.length) return false;
  
  const sortedA = [...a].sort();
  const sortedB = [...b].sort();
  
  return sortedA.every((val, index) => val === sortedB[index]);
}
