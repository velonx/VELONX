/**
 * EventsFilterPanel Example Usage
 * Feature: events-page-ui-improvements
 * Task: 5. Create EventsFilterPanel component (Desktop)
 * 
 * This file demonstrates how to integrate EventsFilterPanel with useEventFilters hook
 */

'use client';

import React from 'react';
import EventsFilterPanel from '../EventsFilterPanel';
import { useEventFilters } from '@/lib/hooks/useEventFilters';

/**
 * Example: Basic usage with useEventFilters hook
 */
export function BasicFilterPanelExample() {
  const {
    filters,
    toggleType,
    setDateRange,
    setAvailability,
    setMyEvents,
    clearAllFilters,
    activeFilterCount,
  } = useEventFilters();

  return (
    <div className="p-8 bg-gray-50">
      <EventsFilterPanel
        selectedTypes={filters.types}
        dateRange={filters.dateRange}
        availability={filters.availability}
        myEvents={filters.myEvents}
        onTypeToggle={toggleType}
        onDateRangeChange={setDateRange}
        onAvailabilityChange={setAvailability}
        onMyEventsToggle={setMyEvents}
        onClearAll={clearAllFilters}
        activeFilterCount={activeFilterCount}
      />
    </div>
  );
}

/**
 * Example: Integration with EventsSidebar in a layout
 */
export function FilterPanelWithSidebarExample() {
  const {
    filters,
    toggleType,
    setDateRange,
    setAvailability,
    setMyEvents,
    clearAllFilters,
    activeFilterCount,
  } = useEventFilters();

  return (
    <div className="flex gap-8 p-8 bg-gray-50">
      {/* Sidebar with filters */}
      <div className="w-72 space-y-6">
        {/* EventsSidebar would go here */}
        
        {/* Filter Panel */}
        <EventsFilterPanel
          selectedTypes={filters.types}
          dateRange={filters.dateRange}
          availability={filters.availability}
          myEvents={filters.myEvents}
          onTypeToggle={toggleType}
          onDateRangeChange={setDateRange}
          onAvailabilityChange={setAvailability}
          onMyEventsToggle={setMyEvents}
          onClearAll={clearAllFilters}
          activeFilterCount={activeFilterCount}
        />
      </div>

      {/* Main content area */}
      <div className="flex-1">
        <div className="bg-white rounded-lg p-6">
          <h2 className="text-2xl font-bold mb-4">Events</h2>
          <p className="text-gray-600">
            Active filters: {activeFilterCount}
          </p>
          <pre className="mt-4 p-4 bg-gray-100 rounded text-sm">
            {JSON.stringify(filters, null, 2)}
          </pre>
        </div>
      </div>
    </div>
  );
}

/**
 * Example: Sticky filter panel
 */
export function StickyFilterPanelExample() {
  const {
    filters,
    toggleType,
    setDateRange,
    setAvailability,
    setMyEvents,
    clearAllFilters,
    activeFilterCount,
  } = useEventFilters();

  return (
    <div className="flex gap-8 p-8 bg-gray-50 min-h-screen">
      {/* Sticky sidebar */}
      <div className="w-72 shrink-0">
        <div className="sticky top-24">
          <EventsFilterPanel
            selectedTypes={filters.types}
            dateRange={filters.dateRange}
            availability={filters.availability}
            myEvents={filters.myEvents}
            onTypeToggle={toggleType}
            onDateRangeChange={setDateRange}
            onAvailabilityChange={setAvailability}
            onMyEventsToggle={setMyEvents}
            onClearAll={clearAllFilters}
            activeFilterCount={activeFilterCount}
          />
        </div>
      </div>

      {/* Scrollable content */}
      <div className="flex-1">
        <div className="space-y-4">
          {[...Array(10)].map((_, i) => (
            <div key={i} className="bg-white rounded-lg p-6 h-40">
              Event Card {i + 1}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/**
 * Example: Filter panel with custom styling
 */
export function CustomStyledFilterPanelExample() {
  const {
    filters,
    toggleType,
    setDateRange,
    setAvailability,
    setMyEvents,
    clearAllFilters,
    activeFilterCount,
  } = useEventFilters();

  return (
    <div className="p-8 bg-gradient-to-br from-gray-900 to-gray-800 min-h-screen">
      <div className="max-w-7xl mx-auto flex gap-8">
        <EventsFilterPanel
          selectedTypes={filters.types}
          dateRange={filters.dateRange}
          availability={filters.availability}
          myEvents={filters.myEvents}
          onTypeToggle={toggleType}
          onDateRangeChange={setDateRange}
          onAvailabilityChange={setAvailability}
          onMyEventsToggle={setMyEvents}
          onClearAll={clearAllFilters}
          activeFilterCount={activeFilterCount}
        />
      </div>
    </div>
  );
}
