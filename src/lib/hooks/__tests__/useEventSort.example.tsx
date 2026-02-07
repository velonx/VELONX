/**
 * Example usage of useEventSort hook
 * Feature: events-page-ui-improvements
 * Requirements: 5.1-5.4 (Sorting & Pagination)
 * 
 * This file demonstrates how to use the useEventSort hook in components.
 */

import React from 'react';
import { useEventSort } from '../useEventSort';
import { EventSortOption } from '@/lib/types/events.types';

/**
 * Example 1: Simple sort dropdown
 */
export function SimpleSortDropdown() {
  const { sortBy, setSortBy } = useEventSort();

  return (
    <select 
      value={sortBy} 
      onChange={(e) => setSortBy(e.target.value as EventSortOption)}
      className="border rounded px-3 py-2"
    >
      <option value="date-asc">Date (Earliest First)</option>
      <option value="date-desc">Date (Latest First)</option>
      <option value="popularity">Most Popular</option>
      <option value="availability">Most Available</option>
      <option value="recent">Recently Added</option>
    </select>
  );
}

/**
 * Example 2: Sort buttons with active state
 */
export function SortButtons() {
  const { sortBy, setSortBy, isSortActive } = useEventSort();

  const sortOptions: Array<{ value: EventSortOption; label: string }> = [
    { value: 'date-asc', label: 'Earliest' },
    { value: 'date-desc', label: 'Latest' },
    { value: 'popularity', label: 'Popular' },
    { value: 'availability', label: 'Available' },
    { value: 'recent', label: 'New' },
  ];

  return (
    <div className="flex gap-2">
      {sortOptions.map((option) => (
        <button
          key={option.value}
          onClick={() => setSortBy(option.value)}
          className={`px-4 py-2 rounded ${
            isSortActive(option.value)
              ? 'bg-blue-600 text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}

/**
 * Example 3: Sort control with icon and label
 */
export function SortControl() {
  const { sortBy, setSortBy } = useEventSort();

  const getSortLabel = (sort: EventSortOption): string => {
    switch (sort) {
      case 'date-asc':
        return 'Date: Earliest First';
      case 'date-desc':
        return 'Date: Latest First';
      case 'popularity':
        return 'Most Popular';
      case 'availability':
        return 'Most Available';
      case 'recent':
        return 'Recently Added';
    }
  };

  return (
    <div className="flex items-center gap-2">
      <span className="text-sm text-gray-600">Sort by:</span>
      <select
        value={sortBy}
        onChange={(e) => setSortBy(e.target.value as EventSortOption)}
        className="border rounded px-3 py-2 text-sm"
        aria-label="Sort events"
      >
        <option value="date-asc">Date (Earliest First)</option>
        <option value="date-desc">Date (Latest First)</option>
        <option value="popularity">Most Popular</option>
        <option value="availability">Most Available</option>
        <option value="recent">Recently Added</option>
      </select>
    </div>
  );
}

/**
 * Example 4: Sort toggle between ascending and descending
 */
export function DateSortToggle() {
  const { sortBy, setSortBy } = useEventSort();

  const toggleDateSort = () => {
    if (sortBy === 'date-asc') {
      setSortBy('date-desc');
    } else {
      setSortBy('date-asc');
    }
  };

  return (
    <button
      onClick={toggleDateSort}
      className="flex items-center gap-2 px-4 py-2 border rounded hover:bg-gray-50"
      aria-label={`Sort by date ${sortBy === 'date-asc' ? 'descending' : 'ascending'}`}
    >
      <span>Date</span>
      <span className="text-lg">
        {sortBy === 'date-asc' ? '↑' : '↓'}
      </span>
    </button>
  );
}

/**
 * Example 5: Complete sort toolbar with multiple options
 */
export function SortToolbar() {
  const { sortBy, setSortBy, isSortActive } = useEventSort();

  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 p-4 bg-gray-50 rounded-lg">
      <span className="text-sm font-medium text-gray-700">Sort by:</span>
      
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setSortBy('date-asc')}
          className={`px-3 py-1.5 text-sm rounded-full transition-colors ${
            isSortActive('date-asc')
              ? 'bg-blue-600 text-white'
              : 'bg-white text-gray-700 hover:bg-gray-100 border'
          }`}
        >
          📅 Earliest
        </button>
        
        <button
          onClick={() => setSortBy('date-desc')}
          className={`px-3 py-1.5 text-sm rounded-full transition-colors ${
            isSortActive('date-desc')
              ? 'bg-blue-600 text-white'
              : 'bg-white text-gray-700 hover:bg-gray-100 border'
          }`}
        >
          📅 Latest
        </button>
        
        <button
          onClick={() => setSortBy('popularity')}
          className={`px-3 py-1.5 text-sm rounded-full transition-colors ${
            isSortActive('popularity')
              ? 'bg-blue-600 text-white'
              : 'bg-white text-gray-700 hover:bg-gray-100 border'
          }`}
        >
          🔥 Popular
        </button>
        
        <button
          onClick={() => setSortBy('availability')}
          className={`px-3 py-1.5 text-sm rounded-full transition-colors ${
            isSortActive('availability')
              ? 'bg-blue-600 text-white'
              : 'bg-white text-gray-700 hover:bg-gray-100 border'
          }`}
        >
          ✅ Available
        </button>
        
        <button
          onClick={() => setSortBy('recent')}
          className={`px-3 py-1.5 text-sm rounded-full transition-colors ${
            isSortActive('recent')
              ? 'bg-blue-600 text-white'
              : 'bg-white text-gray-700 hover:bg-gray-100 border'
          }`}
        >
          ✨ New
        </button>
      </div>
    </div>
  );
}

/**
 * Example 6: Integration with event list
 */
export function EventListWithSort() {
  const { sortBy } = useEventSort();

  // In a real component, you would fetch events with the sortBy parameter
  // const { data: events } = useEvents({ sortBy });

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Events</h2>
        <SortControl />
      </div>
      
      <div className="text-sm text-gray-600">
        Sorted by: {sortBy}
      </div>
      
      {/* Event list would go here */}
      <div className="space-y-2">
        {/* <EventCard /> components */}
      </div>
    </div>
  );
}
