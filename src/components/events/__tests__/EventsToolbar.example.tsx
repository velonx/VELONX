/**
 * Example usage of EventsToolbar Component
 * Feature: events-page-ui-improvements
 * Requirements: 1.1, 5.1-5.4
 * 
 * This file demonstrates how to integrate EventsToolbar with the custom hooks
 * for search and sort functionality.
 */

'use client';

import EventsToolbar from '../EventsToolbar';
import { useEventSearch } from '@/lib/hooks/useEventSearch';
import { useEventSort } from '@/lib/hooks/useEventSort';

/**
 * Example: Basic usage with hooks
 */
export function EventsToolbarBasicExample() {
  const { searchQuery, setSearchQuery, isSearching } = useEventSearch();
  const { sortBy, setSortBy } = useEventSort();
  
  // Mock results count - in real usage, this would come from your events data
  const resultsCount = 42;
  
  return (
    <EventsToolbar
      searchQuery={searchQuery}
      onSearchChange={setSearchQuery}
      sortBy={sortBy}
      onSortChange={setSortBy}
      resultsCount={resultsCount}
      isSearching={isSearching}
    />
  );
}

/**
 * Example: Integration with events list
 */
export function EventsToolbarWithListExample() {
  const { searchQuery, setSearchQuery, debouncedQuery, isSearching } = useEventSearch();
  const { sortBy, setSortBy } = useEventSort();
  
  // In real usage, you would fetch events based on debouncedQuery and sortBy
  const events = []; // Mock events array
  const resultsCount = events.length;
  
  return (
    <div className="space-y-6">
      <EventsToolbar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        sortBy={sortBy}
        onSortChange={setSortBy}
        resultsCount={resultsCount}
        isSearching={isSearching}
      />
      
      {/* Events list would go here */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Event cards */}
      </div>
    </div>
  );
}

/**
 * Example: Standalone usage without hooks
 */
export function EventsToolbarStandaloneExample() {
  const [searchQuery, setSearchQuery] = React.useState('');
  const [sortBy, setSortBy] = React.useState<EventSortOption>('date-asc');
  const resultsCount = 10;
  
  return (
    <EventsToolbar
      searchQuery={searchQuery}
      onSearchChange={setSearchQuery}
      sortBy={sortBy}
      onSortChange={setSortBy}
      resultsCount={resultsCount}
    />
  );
}

/**
 * Example: With custom styling
 */
export function EventsToolbarCustomStyleExample() {
  const { searchQuery, setSearchQuery, isSearching } = useEventSearch();
  const { sortBy, setSortBy } = useEventSort();
  
  return (
    <div className="max-w-6xl mx-auto p-4">
      <EventsToolbar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        sortBy={sortBy}
        onSortChange={setSortBy}
        resultsCount={25}
        isSearching={isSearching}
      />
    </div>
  );
}

/**
 * Example: Mobile-first layout
 */
export function EventsToolbarMobileExample() {
  const { searchQuery, setSearchQuery, isSearching } = useEventSearch();
  const { sortBy, setSortBy } = useEventSort();
  
  return (
    <div className="container mx-auto px-4">
      {/* Toolbar automatically adapts to mobile */}
      <EventsToolbar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        sortBy={sortBy}
        onSortChange={setSortBy}
        resultsCount={8}
        isSearching={isSearching}
      />
    </div>
  );
}

// Note: Import React for standalone example
import React from 'react';
import { EventSortOption } from '@/lib/types/events.types';
