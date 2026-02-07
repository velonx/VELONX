/**
 * Example usage of ActiveFiltersDisplay Component
 * Feature: events-page-ui-improvements
 * 
 * This file demonstrates how to use the ActiveFiltersDisplay component
 * with the useEventFilters hook.
 */

'use client';

import React from 'react';
import { ActiveFiltersDisplay } from '../ActiveFiltersDisplay';
import { useEventFilters } from '@/lib/hooks/useEventFilters';

/**
 * Example 1: Basic usage with useEventFilters hook
 */
export function BasicActiveFiltersExample() {
  const { filters, clearAllFilters, removeFilter } = useEventFilters();

  return (
    <div className="p-4 space-y-4">
      <h2 className="text-xl font-semibold">Active Filters Example</h2>
      
      <ActiveFiltersDisplay
        activeFilters={{
          search: filters.search,
          types: filters.types,
          dateRange: filters.dateRange,
          availability: filters.availability,
          myEvents: filters.myEvents,
        }}
        onClearAll={clearAllFilters}
        onRemoveFilter={removeFilter}
      />
    </div>
  );
}

/**
 * Example 2: With custom styling
 */
export function StyledActiveFiltersExample() {
  const { filters, clearAllFilters, removeFilter } = useEventFilters();

  return (
    <div className="p-4 space-y-4">
      <h2 className="text-xl font-semibold">Styled Active Filters</h2>
      
      <ActiveFiltersDisplay
        activeFilters={{
          search: filters.search,
          types: filters.types,
          dateRange: filters.dateRange,
          availability: filters.availability,
          myEvents: filters.myEvents,
        }}
        onClearAll={clearAllFilters}
        onRemoveFilter={removeFilter}
        className="bg-muted/50 p-4 rounded-lg border"
      />
    </div>
  );
}

/**
 * Example 3: Integrated with filter panel
 */
export function IntegratedActiveFiltersExample() {
  const { 
    filters, 
    clearAllFilters, 
    removeFilter,
    toggleType,
    setAvailability,
    setMyEvents,
  } = useEventFilters();

  return (
    <div className="p-4 space-y-6">
      <h2 className="text-xl font-semibold">Integrated Example</h2>
      
      {/* Filter Controls */}
      <div className="space-y-4 border p-4 rounded-lg">
        <h3 className="font-medium">Filters</h3>
        
        <div className="space-y-2">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={filters.types.includes('WORKSHOP')}
              onChange={() => toggleType('WORKSHOP')}
            />
            Workshop
          </label>
          
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={filters.types.includes('HACKATHON')}
              onChange={() => toggleType('HACKATHON')}
            />
            Hackathon
          </label>
          
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={filters.availability === 'available'}
              onChange={() => setAvailability(filters.availability === 'available' ? 'all' : 'available')}
            />
            Available Only
          </label>
          
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={filters.myEvents}
              onChange={(e) => setMyEvents(e.target.checked)}
            />
            My Events
          </label>
        </div>
      </div>
      
      {/* Active Filters Display */}
      <ActiveFiltersDisplay
        activeFilters={{
          search: filters.search,
          types: filters.types,
          dateRange: filters.dateRange,
          availability: filters.availability,
          myEvents: filters.myEvents,
        }}
        onClearAll={clearAllFilters}
        onRemoveFilter={removeFilter}
      />
    </div>
  );
}

/**
 * Example 4: Mock data for demonstration
 */
export function MockActiveFiltersExample() {
  const handleClearAll = () => {
    console.log('Clear all filters');
  };

  const handleRemoveFilter = (filterType: string, value?: string) => {
    console.log('Remove filter:', filterType, value);
  };

  return (
    <div className="p-4 space-y-6">
      <h2 className="text-xl font-semibold">Mock Data Examples</h2>
      
      {/* Example with search only */}
      <div className="space-y-2">
        <h3 className="text-sm font-medium text-muted-foreground">Search Filter Only</h3>
        <ActiveFiltersDisplay
          activeFilters={{
            search: 'react workshop',
            types: [],
            dateRange: {},
            availability: 'all',
            myEvents: false,
          }}
          onClearAll={handleClearAll}
          onRemoveFilter={handleRemoveFilter}
        />
      </div>
      
      {/* Example with multiple types */}
      <div className="space-y-2">
        <h3 className="text-sm font-medium text-muted-foreground">Multiple Event Types</h3>
        <ActiveFiltersDisplay
          activeFilters={{
            types: ['WORKSHOP', 'HACKATHON', 'WEBINAR'],
            dateRange: {},
            availability: 'all',
            myEvents: false,
          }}
          onClearAll={handleClearAll}
          onRemoveFilter={handleRemoveFilter}
        />
      </div>
      
      {/* Example with date range */}
      <div className="space-y-2">
        <h3 className="text-sm font-medium text-muted-foreground">Date Range Filter</h3>
        <ActiveFiltersDisplay
          activeFilters={{
            types: [],
            dateRange: {
              start: new Date('2024-01-01'),
              end: new Date('2024-12-31'),
            },
            availability: 'all',
            myEvents: false,
          }}
          onClearAll={handleClearAll}
          onRemoveFilter={handleRemoveFilter}
        />
      </div>
      
      {/* Example with all filters */}
      <div className="space-y-2">
        <h3 className="text-sm font-medium text-muted-foreground">All Filters Active</h3>
        <ActiveFiltersDisplay
          activeFilters={{
            search: 'javascript',
            types: ['WORKSHOP', 'WEBINAR'],
            dateRange: {
              start: new Date('2024-06-01'),
              end: new Date('2024-12-31'),
            },
            availability: 'available',
            myEvents: true,
          }}
          onClearAll={handleClearAll}
          onRemoveFilter={handleRemoveFilter}
        />
      </div>
    </div>
  );
}

/**
 * Example 5: Responsive layout
 */
export function ResponsiveActiveFiltersExample() {
  const { filters, clearAllFilters, removeFilter } = useEventFilters();

  return (
    <div className="p-4 space-y-4">
      <h2 className="text-xl font-semibold">Responsive Layout</h2>
      
      {/* Desktop: Full width */}
      <div className="hidden md:block">
        <ActiveFiltersDisplay
          activeFilters={{
            search: filters.search,
            types: filters.types,
            dateRange: filters.dateRange,
            availability: filters.availability,
            myEvents: filters.myEvents,
          }}
          onClearAll={clearAllFilters}
          onRemoveFilter={removeFilter}
        />
      </div>
      
      {/* Mobile: Compact */}
      <div className="md:hidden">
        <ActiveFiltersDisplay
          activeFilters={{
            search: filters.search,
            types: filters.types,
            dateRange: filters.dateRange,
            availability: filters.availability,
            myEvents: filters.myEvents,
          }}
          onClearAll={clearAllFilters}
          onRemoveFilter={removeFilter}
          className="text-sm"
        />
      </div>
    </div>
  );
}
