/**
 * EventsFilterDrawer Example Usage
 * Feature: events-page-ui-improvements
 * Task: 6. Create EventsFilterDrawer component (Mobile)
 * 
 * This file demonstrates how to use the EventsFilterDrawer component
 * in a mobile-responsive events page.
 */

'use client';

import React from 'react';
import { EventsFilterDrawer } from '../EventsFilterDrawer';
import { useEventFilters } from '@/lib/hooks/useEventFilters';

/**
 * Example 1: Basic Usage with useEventFilters Hook
 * 
 * This is the recommended way to use EventsFilterDrawer.
 * The useEventFilters hook manages all filter state and URL synchronization.
 */
export function BasicExample() {
  const {
    filters,
    toggleType,
    setDateRange,
    setAvailability,
    setMyEvents,
    clearAllFilters,
    activeFilterCount,
  } = useEventFilters();

  const handleApply = () => {
    console.log('Filters applied:', filters);
    // Typically, this would trigger a data refetch
  };

  const handleCancel = () => {
    console.log('Filter changes cancelled');
  };

  return (
    <div className="p-4 md:hidden">
      <EventsFilterDrawer
        selectedTypes={filters.types}
        dateRange={filters.dateRange}
        availability={filters.availability}
        myEvents={filters.myEvents}
        onTypeToggle={toggleType}
        onDateRangeChange={setDateRange}
        onAvailabilityChange={setAvailability}
        onMyEventsToggle={setMyEvents}
        onApply={handleApply}
        onCancel={handleCancel}
        onClearAll={clearAllFilters}
        activeFilterCount={activeFilterCount}
      />
    </div>
  );
}

/**
 * Example 2: With Results Count Preview
 * 
 * Shows live preview of how many events match the current filters.
 */
export function WithResultsCountExample() {
  const {
    filters,
    toggleType,
    setDateRange,
    setAvailability,
    setMyEvents,
    clearAllFilters,
    activeFilterCount,
  } = useEventFilters();

  // In a real app, this would come from your events query
  const resultsCount = 42;

  return (
    <div className="p-4 md:hidden">
      <EventsFilterDrawer
        selectedTypes={filters.types}
        dateRange={filters.dateRange}
        availability={filters.availability}
        myEvents={filters.myEvents}
        onTypeToggle={toggleType}
        onDateRangeChange={setDateRange}
        onAvailabilityChange={setAvailability}
        onMyEventsToggle={setMyEvents}
        onApply={() => console.log('Applied')}
        onCancel={() => console.log('Cancelled')}
        onClearAll={clearAllFilters}
        activeFilterCount={activeFilterCount}
        resultsCount={resultsCount}
      />
    </div>
  );
}

/**
 * Example 3: Integration with Events Page
 * 
 * Complete example showing how to integrate EventsFilterDrawer
 * into a mobile-responsive events page layout.
 */
export function EventsPageIntegrationExample() {
  const {
    filters,
    toggleType,
    setDateRange,
    setAvailability,
    setMyEvents,
    clearAllFilters,
    activeFilterCount,
  } = useEventFilters();

  // Mock events data
  const events = [
    { id: '1', title: 'Web Dev Workshop', type: 'WORKSHOP' },
    { id: '2', title: 'Hackathon 2024', type: 'HACKATHON' },
  ];

  return (
    <div className="min-h-screen bg-[#0a0f1e]">
      {/* Mobile Header with Filter Drawer */}
      <div className="md:hidden sticky top-0 z-10 bg-[#0a0f1e] border-b border-white/10 p-4">
        <h1 className="text-white text-2xl font-bold mb-4">Events</h1>
        
        <EventsFilterDrawer
          selectedTypes={filters.types}
          dateRange={filters.dateRange}
          availability={filters.availability}
          myEvents={filters.myEvents}
          onTypeToggle={toggleType}
          onDateRangeChange={setDateRange}
          onAvailabilityChange={setAvailability}
          onMyEventsToggle={setMyEvents}
          onApply={() => {
            console.log('Filters applied, refetching events...');
            // Trigger events refetch here
          }}
          onCancel={() => {
            console.log('Filter changes cancelled');
          }}
          onClearAll={clearAllFilters}
          activeFilterCount={activeFilterCount}
          resultsCount={events.length}
        />
      </div>

      {/* Events Grid */}
      <div className="p-4">
        <div className="grid grid-cols-1 gap-4">
          {events.map((event) => (
            <div
              key={event.id}
              className="bg-[#0f172a] rounded-lg p-4 border border-white/10"
            >
              <h3 className="text-white font-semibold">{event.title}</h3>
              <p className="text-gray-400 text-sm">{event.type}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/**
 * Example 4: Custom Styling
 * 
 * Shows how to customize the appearance of the filter drawer trigger button.
 */
export function CustomStyledExample() {
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
    <div className="p-4 md:hidden">
      <EventsFilterDrawer
        selectedTypes={filters.types}
        dateRange={filters.dateRange}
        availability={filters.availability}
        myEvents={filters.myEvents}
        onTypeToggle={toggleType}
        onDateRangeChange={setDateRange}
        onAvailabilityChange={setAvailability}
        onMyEventsToggle={setMyEvents}
        onApply={() => console.log('Applied')}
        onCancel={() => console.log('Cancelled')}
        onClearAll={clearAllFilters}
        activeFilterCount={activeFilterCount}
        className="shadow-lg shadow-cyan-500/20"
      />
    </div>
  );
}

/**
 * Example 5: Responsive Layout
 * 
 * Shows how to conditionally render the drawer on mobile
 * and the desktop filter panel on larger screens.
 */
export function ResponsiveLayoutExample() {
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
    <div className="flex gap-6">
      {/* Mobile: Filter Drawer */}
      <div className="md:hidden w-full">
        <EventsFilterDrawer
          selectedTypes={filters.types}
          dateRange={filters.dateRange}
          availability={filters.availability}
          myEvents={filters.myEvents}
          onTypeToggle={toggleType}
          onDateRangeChange={setDateRange}
          onAvailabilityChange={setAvailability}
          onMyEventsToggle={setMyEvents}
          onApply={() => console.log('Applied')}
          onCancel={() => console.log('Cancelled')}
          onClearAll={clearAllFilters}
          activeFilterCount={activeFilterCount}
        />
      </div>

      {/* Desktop: Filter Panel (would be imported from EventsFilterPanel) */}
      <div className="hidden md:block">
        {/* EventsFilterPanel component would go here */}
        <div className="w-72 bg-[#0f172a] rounded-lg p-6 border border-white/10">
          <p className="text-white">Desktop Filter Panel</p>
        </div>
      </div>

      {/* Events Content */}
      <div className="flex-1">
        <p className="text-white">Events grid goes here</p>
      </div>
    </div>
  );
}

/**
 * Usage Notes:
 * 
 * 1. The EventsFilterDrawer is designed for mobile screens (< 768px)
 * 2. Use the useEventFilters hook for state management
 * 3. The drawer maintains local filter state until "Apply" is clicked
 * 4. "Cancel" button resets local changes without applying them
 * 5. All touch targets meet the 44x44px minimum size requirement
 * 6. Smooth animations are powered by Framer Motion
 * 7. The drawer slides up from the bottom with a backdrop overlay
 * 8. Results count preview updates in real-time as filters change
 * 9. Active filter count is displayed on both trigger and apply buttons
 * 10. Fully accessible with proper ARIA labels and keyboard navigation
 */
