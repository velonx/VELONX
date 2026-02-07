/**
 * URL Helper Utilities for Events Page
 * Feature: events-page-ui-improvements
 * 
 * Provides functions to serialize and parse filter state to/from URL query parameters
 * Requirements: 1.8 (Filter state persists in URL)
 */

import { EventFilterState, EventType, EventAvailability, EventSortOption, EventsQueryParams } from '@/lib/types/events.types';

/**
 * Serializes filter state to URL query parameters
 * 
 * @param filters - The current filter state
 * @returns URLSearchParams object ready to be used with router
 */
export function serializeFiltersToURL(filters: EventFilterState): URLSearchParams {
  const params = new URLSearchParams();

  // Add search parameter if present
  if (filters.search && filters.search.trim() !== '') {
    params.set('search', filters.search.trim());
  }

  // Add type parameters (multiple values as comma-separated)
  if (filters.types.length > 0) {
    params.set('type', filters.types.join(','));
  }

  // Add date range parameters
  if (filters.dateRange.start) {
    params.set('startDate', filters.dateRange.start.toISOString());
  }
  if (filters.dateRange.end) {
    params.set('endDate', filters.dateRange.end.toISOString());
  }

  // Add availability parameter (only if not 'all')
  if (filters.availability !== 'all') {
    params.set('availability', filters.availability);
  }

  // Add myEvents parameter (only if true)
  if (filters.myEvents) {
    params.set('myEvents', 'true');
  }

  // Add sortBy parameter (only if not default 'date-asc')
  if (filters.sortBy !== 'date-asc') {
    params.set('sortBy', filters.sortBy);
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
  searchParams: URLSearchParams | EventsQueryParams
): EventFilterState {
  const defaultFilters: EventFilterState = {
    search: undefined,
    types: [],
    dateRange: {},
    availability: 'all',
    myEvents: false,
    sortBy: 'date-asc',
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

  // Parse type parameters
  const typeParam = params.get('type');
  if (typeParam) {
    defaultFilters.types = parseTypeArray(typeParam);
  }

  // Parse date range parameters
  const startDateParam = params.get('startDate');
  if (startDateParam) {
    const startDate = parseDate(startDateParam);
    if (startDate) {
      defaultFilters.dateRange.start = startDate;
    }
  }

  const endDateParam = params.get('endDate');
  if (endDateParam) {
    const endDate = parseDate(endDateParam);
    if (endDate) {
      defaultFilters.dateRange.end = endDate;
    }
  }

  // Parse availability parameter
  const availabilityParam = params.get('availability');
  if (availabilityParam && isValidAvailability(availabilityParam)) {
    defaultFilters.availability = availabilityParam as EventAvailability;
  }

  // Parse myEvents parameter
  const myEventsParam = params.get('myEvents');
  if (myEventsParam === 'true') {
    defaultFilters.myEvents = true;
  }

  // Parse sortBy parameter
  const sortByParam = params.get('sortBy');
  if (sortByParam && isValidSortOption(sortByParam)) {
    defaultFilters.sortBy = sortByParam as EventSortOption;
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
 * Parses and validates type array from comma-separated string
 * 
 * @param typeString - Comma-separated type values
 * @returns Array of valid EventType values
 */
function parseTypeArray(typeString: string): EventType[] {
  const types: EventType[] = [];
  const parts = typeString.split(',').map(s => s.trim());

  for (const part of parts) {
    if (isValidType(part)) {
      types.push(part as EventType);
    }
  }

  return types;
}

/**
 * Validates if a string is a valid EventType
 * 
 * @param value - String to validate
 * @returns True if valid type
 */
function isValidType(value: string): value is EventType {
  return ['HACKATHON', 'WORKSHOP', 'WEBINAR', 'NETWORKING'].includes(value);
}

/**
 * Validates if a string is a valid EventAvailability
 * 
 * @param value - String to validate
 * @returns True if valid availability
 */
function isValidAvailability(value: string): value is EventAvailability {
  return ['all', 'available', 'almost-full', 'full'].includes(value);
}

/**
 * Validates if a string is a valid EventSortOption
 * 
 * @param value - String to validate
 * @returns True if valid sort option
 */
function isValidSortOption(value: string): value is EventSortOption {
  return ['date-asc', 'date-desc', 'popularity', 'availability', 'recent'].includes(value);
}

/**
 * Parses a date string to Date object
 * 
 * @param dateString - ISO date string
 * @returns Date object or null if invalid
 */
function parseDate(dateString: string): Date | null {
  try {
    const date = new Date(dateString);
    // Check if date is valid
    if (isNaN(date.getTime())) {
      return null;
    }
    return date;
  } catch {
    return null;
  }
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
export function areFiltersEqual(a: EventFilterState, b: EventFilterState): boolean {
  return (
    a.search === b.search &&
    a.page === b.page &&
    a.pageSize === b.pageSize &&
    a.availability === b.availability &&
    a.myEvents === b.myEvents &&
    a.sortBy === b.sortBy &&
    arraysEqual(a.types, b.types) &&
    datesEqual(a.dateRange.start, b.dateRange.start) &&
    datesEqual(a.dateRange.end, b.dateRange.end)
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

/**
 * Helper function to check if two dates are equal
 * 
 * @param a - First date
 * @param b - Second date
 * @returns True if dates are equal
 */
function datesEqual(a: Date | undefined, b: Date | undefined): boolean {
  if (a === undefined && b === undefined) return true;
  if (a === undefined || b === undefined) return false;
  return a.getTime() === b.getTime();
}
