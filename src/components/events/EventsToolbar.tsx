/**
 * EventsToolbar Component
 * Feature: events-page-ui-improvements
 * Requirements: 1.1, 5.1-5.4 (Search and Sort functionality)
 * 
 * Provides search input with debouncing, sort dropdown, and results count display.
 * Responsive design for mobile and desktop.
 */

'use client';

import { Search, ArrowUpDown } from 'lucide-react';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { EventSortOption } from '@/lib/types/events.types';

export interface EventsToolbarProps {
  /** Current search query (immediate, not debounced) */
  searchQuery: string;
  /** Callback when search query changes */
  onSearchChange: (query: string) => void;
  /** Current sort option */
  sortBy: EventSortOption;
  /** Callback when sort option changes */
  onSortChange: (sort: EventSortOption) => void;
  /** Number of results found */
  resultsCount: number;
  /** Whether search is currently debouncing */
  isSearching?: boolean;
}

/**
 * Sort option labels for display
 */
const SORT_OPTIONS: Record<EventSortOption, string> = {
  'date-asc': 'Date (Earliest First)',
  'date-desc': 'Date (Latest First)',
  'popularity': 'Most Popular',
  'availability': 'Most Available',
  'recent': 'Recently Added',
};

/**
 * EventsToolbar component for search and sort controls
 * 
 * Features:
 * - Search input with icon and debounced onChange
 * - Sort dropdown with multiple options
 * - Results count display
 * - Responsive design for mobile and desktop
 * - Loading indicator during search debounce
 * 
 * @example
 * ```tsx
 * <EventsToolbar
 *   searchQuery={searchQuery}
 *   onSearchChange={setSearchQuery}
 *   sortBy={sortBy}
 *   onSortChange={setSortBy}
 *   resultsCount={events.length}
 *   isSearching={isSearching}
 * />
 * ```
 */
export default function EventsToolbar({
  searchQuery,
  onSearchChange,
  sortBy,
  onSortChange,
  resultsCount,
  isSearching = false,
}: EventsToolbarProps) {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-4 shadow-sm" role="search" aria-label="Event search and sort controls">
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        {/* Search Input */}
        <div className="relative flex-1 w-full sm:max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" aria-hidden="true" />
          <Input
            type="text"
            placeholder="Search events..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10 h-10 bg-gray-50 border-gray-200 focus:bg-white focus:border-[#219EBC] transition-colors"
            aria-label="Search events by title or description"
            aria-describedby="search-hint"
          />
          <span id="search-hint" className="sr-only">
            Type to search events. Results update automatically as you type.
          </span>
          {isSearching && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2" role="status" aria-label="Searching">
              <div className="w-4 h-4 border-2 border-[#219EBC] border-t-transparent rounded-full animate-spin" />
              <span className="sr-only">Searching events...</span>
            </div>
          )}
        </div>

        {/* Sort and Results */}
        <div className="flex items-center gap-4 w-full sm:w-auto">
          {/* Sort Dropdown */}
          <div className="flex items-center gap-2 flex-1 sm:flex-initial">
            <ArrowUpDown className="w-4 h-4 text-gray-500 hidden sm:block" aria-hidden="true" />
            <Select value={sortBy} onValueChange={(value) => onSortChange(value as EventSortOption)}>
              <SelectTrigger 
                className="h-10 bg-gray-50 border-gray-200 hover:bg-white hover:border-[#219EBC] transition-colors min-w-[180px]"
                aria-label="Sort events by"
              >
                <SelectValue placeholder="Sort by..." />
              </SelectTrigger>
              <SelectContent role="listbox" aria-label="Sort options">
                {Object.entries(SORT_OPTIONS).map(([value, label]) => (
                  <SelectItem key={value} value={value} role="option">
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Results Count */}
          <div 
            className="hidden sm:flex items-center gap-2 px-4 py-2 bg-gray-50 rounded-lg border border-gray-200"
            role="status"
            aria-live="polite"
            aria-atomic="true"
          >
            <span className="text-sm font-medium text-gray-700">
              {resultsCount}
            </span>
            <span className="text-sm text-gray-500">
              {resultsCount === 1 ? 'event' : 'events'}
            </span>
          </div>
        </div>
      </div>

      {/* Mobile Results Count */}
      <div className="sm:hidden mt-3 pt-3 border-t border-gray-100">
        <div 
          className="flex items-center justify-between"
          role="status"
          aria-live="polite"
          aria-atomic="true"
        >
          <span className="text-sm text-gray-500">Results</span>
          <span className="text-sm font-medium text-gray-700">
            {resultsCount} {resultsCount === 1 ? 'event' : 'events'}
          </span>
        </div>
      </div>
    </div>
  );
}
