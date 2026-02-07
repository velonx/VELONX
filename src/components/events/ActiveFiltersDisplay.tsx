/**
 * ActiveFiltersDisplay Component
 * Feature: events-page-ui-improvements
 * 
 * Displays currently active filters with remove buttons and clear all option.
 * Validates: Requirements 1.6, 1.7
 */

'use client';

import * as React from 'react';
import { X, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { EventType, EventAvailability, DateRange } from '@/lib/types/events.types';
import { cn } from '@/lib/utils';

export interface ActiveFiltersDisplayProps {
  /**
   * Currently active filters
   */
  activeFilters: {
    search?: string;
    types: EventType[];
    dateRange: DateRange;
    availability: EventAvailability;
    myEvents: boolean;
  };
  
  /**
   * Callback when clear all filters is clicked
   */
  onClearAll: () => void;
  
  /**
   * Callback when a specific filter is removed
   */
  onRemoveFilter: (filterType: 'search' | 'type' | 'dateRange' | 'availability' | 'myEvents', value?: string) => void;
  
  /**
   * Additional CSS classes
   */
  className?: string;
}

/**
 * Event type display labels
 */
const EVENT_TYPE_LABELS: Record<EventType, string> = {
  HACKATHON: 'Hackathon',
  WORKSHOP: 'Workshop',
  WEBINAR: 'Webinar',
  NETWORKING: 'Networking',
};

/**
 * Availability display labels
 */
const AVAILABILITY_LABELS: Record<EventAvailability, string> = {
  all: 'All Events',
  available: 'Available',
  'almost-full': 'Almost Full',
  full: 'Full',
};

/**
 * Format date range for display
 */
const formatDateRange = (dateRange: DateRange): string => {
  const { start, end } = dateRange;
  
  if (!start && !end) return '';
  
  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }).format(date);
  };
  
  if (start && end) {
    return `${formatDate(start)} - ${formatDate(end)}`;
  } else if (start) {
    return `From ${formatDate(start)}`;
  } else if (end) {
    return `Until ${formatDate(end)}`;
  }
  
  return '';
};

/**
 * ActiveFiltersDisplay component for showing and managing active filters
 * 
 * Features:
 * - Displays chips for each active filter (search, types, date range, availability, myEvents)
 * - Each chip has a remove button
 * - Shows "Clear All Filters" button when any filter is active
 * - Displays count of active filters
 * - Accessible with ARIA labels
 * - Keyboard accessible (Enter/Space to remove)
 * - Responsive layout
 * 
 * Validates: Requirements 1.6, 1.7
 */
const ActiveFiltersDisplayComponent = ({
  activeFilters,
  onClearAll,
  onRemoveFilter,
  className,
}: ActiveFiltersDisplayProps) => {
  const { search, types, dateRange, availability, myEvents } = activeFilters;
  
  // Calculate total count of active filters
  const activeFilterCount = 
    (search ? 1 : 0) + 
    types.length + 
    (dateRange.start || dateRange.end ? 1 : 0) +
    (availability !== 'all' ? 1 : 0) +
    (myEvents ? 1 : 0);
  
  // Don't render if no filters are active
  if (activeFilterCount === 0) {
    return null;
  }
  
  /**
   * Render a filter chip with remove button
   */
  const renderFilterChip = (
    label: string,
    filterType: 'search' | 'type' | 'dateRange' | 'availability' | 'myEvents',
    value: string | undefined,
    key: string
  ) => (
    <Badge
      key={key}
      variant="secondary"
      className={cn(
        'flex items-center gap-1.5 pl-3 pr-1 py-1.5 text-sm',
        'transition-colors hover:bg-secondary/80'
      )}
    >
      <span>{label}</span>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => onRemoveFilter(filterType, value)}
        aria-label={`Remove ${label} filter`}
        className="h-4 w-4 p-0 hover:bg-transparent"
      >
        <X className="h-3 w-3" aria-hidden="true" />
      </Button>
    </Badge>
  );
  
  return (
    <div 
      className={cn('flex flex-col gap-3', className)}
      role="region"
      aria-label="Active filters"
    >
      {/* Filter Count and Clear All Button */}
      <div className="flex items-center justify-between gap-2">
        <span className="text-sm text-muted-foreground">
          <span className="font-medium">{activeFilterCount}</span>
          {' '}
          {activeFilterCount === 1 ? 'filter' : 'filters'} active
        </span>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={onClearAll}
          aria-label={`Clear all ${activeFilterCount} filters`}
          className="h-8 gap-1.5 text-sm hover:text-destructive"
        >
          <XCircle className="h-4 w-4" aria-hidden="true" />
          <span>Clear All</span>
        </Button>
      </div>
      
      {/* Active Filter Chips */}
      <div 
        className="flex flex-wrap gap-2"
        role="list"
        aria-label="Active filter chips"
      >
        {/* Search Filter */}
        {search && renderFilterChip(
          `Search: "${search}"`,
          'search',
          undefined,
          'search-filter'
        )}
        
        {/* Event Type Filters */}
        {types.map((type) => renderFilterChip(
          EVENT_TYPE_LABELS[type],
          'type',
          type,
          `type-${type}`
        ))}
        
        {/* Date Range Filter */}
        {(dateRange.start || dateRange.end) && renderFilterChip(
          formatDateRange(dateRange),
          'dateRange',
          undefined,
          'dateRange-filter'
        )}
        
        {/* Availability Filter */}
        {availability !== 'all' && renderFilterChip(
          AVAILABILITY_LABELS[availability],
          'availability',
          undefined,
          'availability-filter'
        )}
        
        {/* My Events Filter */}
        {myEvents && renderFilterChip(
          'My Events',
          'myEvents',
          undefined,
          'myEvents-filter'
        )}
      </div>
      
      {/* Screen Reader Announcement */}
      <div
        role="status"
        aria-live="polite"
        aria-atomic="true"
        className="sr-only"
      >
        {activeFilterCount} {activeFilterCount === 1 ? 'filter' : 'filters'} active
      </div>
    </div>
  );
};

/**
 * Memoized ActiveFiltersDisplay to prevent unnecessary re-renders
 */
export const ActiveFiltersDisplay = React.memo(ActiveFiltersDisplayComponent);
