/**
 * Type definitions for Events Page
 * Feature: events-page-ui-improvements
 * Requirements: 1.1-1.10 (Event Discovery & Search)
 */

/**
 * Event type enum matching API
 */
export type EventType = 'HACKATHON' | 'WORKSHOP' | 'WEBINAR' | 'NETWORKING';

/**
 * Event availability filter options
 */
export type EventAvailability = 'all' | 'available' | 'almost-full' | 'full';

/**
 * Date range filter
 */
export interface DateRange {
  start?: Date;
  end?: Date;
}

/**
 * Event filter state
 */
export interface EventFilterState {
  search?: string;
  types: EventType[];
  dateRange: DateRange;
  availability: EventAvailability;
  myEvents: boolean;
  sortBy: EventSortOption;
  page: number;
  pageSize: number;
}

/**
 * Sort options for events
 * Requirements: 5.1-5.4
 */
export type EventSortOption = 'date-asc' | 'date-desc' | 'popularity' | 'availability' | 'recent';

/**
 * Query parameters for events API
 */
export interface EventsQueryParams {
  search?: string;
  type?: string; // Comma-separated types
  startDate?: string; // ISO date string
  endDate?: string; // ISO date string
  availability?: EventAvailability;
  myEvents?: string; // 'true' or 'false'
  page?: string;
  pageSize?: string;
  sortBy?: EventSortOption;
  status?: 'UPCOMING' | 'ONGOING' | 'COMPLETED' | 'CANCELLED';
}
