/**
 * Example usage of useEventSearch hook
 * Feature: events-page-ui-improvements
 * 
 * This file demonstrates how to use the useEventSearch hook
 * in a real component. It's not a test file, but serves as
 * documentation and can be used as a reference.
 */

'use client';

import { useEventSearch } from '../useEventSearch';
import { useEventFilters } from '../useEventFilters';

/**
 * Example 1: Basic search bar with debouncing
 */
export function BasicSearchBar() {
  const { searchQuery, setSearchQuery, isSearching } = useEventSearch();

  return (
    <div className="relative">
      <input
        type="text"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        placeholder="Search events..."
        className="w-full px-4 py-2 border rounded-lg"
      />
      {isSearching && (
        <div className="absolute right-3 top-3">
          <div className="animate-spin h-4 w-4 border-2 border-blue-500 rounded-full border-t-transparent" />
        </div>
      )}
    </div>
  );
}

/**
 * Example 2: Search bar with result count
 */
export function SearchBarWithResults({ resultCount }: { resultCount: number }) {
  const { searchQuery, setSearchQuery, debouncedQuery, isSearching } = useEventSearch();

  return (
    <div>
      <div className="relative">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search events..."
          className="w-full px-4 py-2 border rounded-lg"
        />
        {isSearching && (
          <div className="absolute right-3 top-3">
            <span className="text-sm text-gray-500">Searching...</span>
          </div>
        )}
      </div>
      {debouncedQuery && (
        <p className="text-sm text-gray-600 mt-2">
          Found {resultCount} events for "{debouncedQuery}"
        </p>
      )}
    </div>
  );
}

/**
 * Example 3: Search with clear button
 */
export function SearchBarWithClear() {
  const { searchQuery, setSearchQuery, debouncedQuery } = useEventSearch();

  const handleClear = () => {
    setSearchQuery('');
  };

  return (
    <div className="relative">
      <input
        type="text"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        placeholder="Search events..."
        className="w-full px-4 py-2 pr-10 border rounded-lg"
      />
      {searchQuery && (
        <button
          onClick={handleClear}
          className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
          aria-label="Clear search"
        >
          ✕
        </button>
      )}
    </div>
  );
}

/**
 * Example 4: Search integrated with other filters
 */
export function SearchWithFilters() {
  const { searchQuery, setSearchQuery, debouncedQuery, isSearching } = useEventSearch();
  const { filters, toggleType, setAvailability, clearAllFilters, activeFilterCount } = useEventFilters();

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <div className="relative">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search events..."
          className="w-full px-4 py-2 border rounded-lg"
        />
        {isSearching && (
          <div className="absolute right-3 top-3">
            <span className="text-sm text-gray-500">Searching...</span>
          </div>
        )}
      </div>

      {/* Filter Buttons */}
      <div className="flex gap-2">
        <button
          onClick={() => toggleType('WORKSHOP')}
          className={`px-4 py-2 rounded ${
            filters.types.includes('WORKSHOP') ? 'bg-blue-500 text-white' : 'bg-gray-200'
          }`}
        >
          Workshop
        </button>
        <button
          onClick={() => toggleType('HACKATHON')}
          className={`px-4 py-2 rounded ${
            filters.types.includes('HACKATHON') ? 'bg-blue-500 text-white' : 'bg-gray-200'
          }`}
        >
          Hackathon
        </button>
        <button
          onClick={() => setAvailability('available')}
          className={`px-4 py-2 rounded ${
            filters.availability === 'available' ? 'bg-blue-500 text-white' : 'bg-gray-200'
          }`}
        >
          Available Only
        </button>
      </div>

      {/* Active Filters Display */}
      {activeFilterCount > 0 && (
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600">
            {activeFilterCount} filter{activeFilterCount > 1 ? 's' : ''} active
          </span>
          <button
            onClick={clearAllFilters}
            className="text-sm text-blue-500 hover:text-blue-700"
          >
            Clear all
          </button>
        </div>
      )}

      {/* Search Status */}
      {debouncedQuery && (
        <p className="text-sm text-gray-600">
          Searching for: "{debouncedQuery}"
        </p>
      )}
    </div>
  );
}

/**
 * Example 5: Custom debounce delay
 */
export function SlowSearchBar() {
  // Use a longer delay (500ms) for slower networks or expensive searches
  const { searchQuery, setSearchQuery, isSearching } = useEventSearch(500);

  return (
    <div className="relative">
      <input
        type="text"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        placeholder="Search events (500ms delay)..."
        className="w-full px-4 py-2 border rounded-lg"
      />
      {isSearching && (
        <div className="absolute right-3 top-3">
          <span className="text-xs text-gray-500">Waiting...</span>
        </div>
      )}
    </div>
  );
}

/**
 * Example 6: Search with keyboard shortcuts
 */
export function SearchBarWithShortcuts() {
  const { searchQuery, setSearchQuery } = useEventSearch();
  const inputRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Focus search on '/' key
      if (e.key === '/' && document.activeElement !== inputRef.current) {
        e.preventDefault();
        inputRef.current?.focus();
      }
      // Clear search on 'Escape' key
      if (e.key === 'Escape' && document.activeElement === inputRef.current) {
        setSearchQuery('');
        inputRef.current?.blur();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [setSearchQuery]);

  return (
    <div>
      <input
        ref={inputRef}
        type="text"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        placeholder="Search events (press / to focus)..."
        className="w-full px-4 py-2 border rounded-lg"
      />
      <p className="text-xs text-gray-500 mt-1">
        Press <kbd className="px-1 bg-gray-100 rounded">/</kbd> to focus,{' '}
        <kbd className="px-1 bg-gray-100 rounded">Esc</kbd> to clear
      </p>
    </div>
  );
}

// Note: This file is for documentation purposes and is not executed in tests
import React from 'react';
