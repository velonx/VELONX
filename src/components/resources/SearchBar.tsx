/**
 * SearchBar Component
 * Feature: resources-page-ui-improvements
 * 
 * A search input component with debouncing, loading indicator, and clear functionality.
 * Validates: Requirements 1.1, 11.1
 */

'use client';

import * as React from 'react';
import { Search, X, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useDebounce } from '@/lib/hooks/useDebounce';
import { cn } from '@/lib/utils';

export interface SearchBarProps {
  /**
   * Current search value
   */
  value: string;
  
  /**
   * Callback when search value changes (debounced)
   */
  onChange: (value: string) => void;
  
  /**
   * Placeholder text for the input
   * @default "Search resources..."
   */
  placeholder?: string;
  
  /**
   * Whether the search is currently loading/filtering
   * @default false
   */
  isLoading?: boolean;
  
  /**
   * Number of results found (for screen reader announcement)
   */
  resultsCount?: number;
  
  /**
   * Additional CSS classes
   */
  className?: string;
  
  /**
   * Debounce delay in milliseconds
   * @default 300
   */
  debounceMs?: number;
}

/**
 * SearchBar component with debounced input for resource search
 * 
 * Features:
 * - Configurable debounce delay (default 300ms)
 * - Search icon indicator
 * - Clear button when text is present
 * - Loading spinner during filtering
 * - Accessible with ARIA labels and live region
 * - Keyboard accessible (Escape to clear)
 * - Memoized to prevent unnecessary re-renders
 * 
 * Validates: Requirements 1.1, 11.1
 */
const SearchBarComponent = ({
  value,
  onChange,
  placeholder = 'Search resources...',
  isLoading = false,
  resultsCount,
  className,
  debounceMs = 300,
}: SearchBarProps) => {
  // Local state for immediate input feedback
  const [localValue, setLocalValue] = React.useState(value);
  
  // Debounce the local value by specified delay (default 300ms)
  const debouncedValue = useDebounce(localValue, debounceMs);
  
  // Sync local value with prop value when it changes externally
  React.useEffect(() => {
    setLocalValue(value);
  }, [value]);
  
  // Call onChange when debounced value changes
  React.useEffect(() => {
    if (debouncedValue !== value) {
      onChange(debouncedValue);
    }
  }, [debouncedValue, onChange, value]);
  
  // Handle input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLocalValue(e.target.value);
  };
  
  // Handle clear button click
  const handleClear = () => {
    setLocalValue('');
    onChange('');
  };
  
  // Handle keyboard events
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Escape' && localValue) {
      handleClear();
    }
  };
  
  const showClearButton = localValue.length > 0;
  
  return (
    <div className={cn('relative w-full search-bar-focus', className)}>
      {/* Search Icon */}
      <div className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2">
        <Search className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
      </div>
      
      {/* Search Input */}
      <Input
        type="text"
        value={localValue}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        aria-label="Search resources by title or description"
        aria-describedby="search-results-count"
        className={cn(
          'pl-9',
          showClearButton && 'pr-20',
          !showClearButton && isLoading && 'pr-9'
        )}
      />
      
      {/* Loading Indicator */}
      {isLoading && (
        <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2">
          <Loader2 
            className="h-4 w-4 animate-spin text-muted-foreground" 
            aria-hidden="true"
          />
        </div>
      )}
      
      {/* Clear Button */}
      {showClearButton && (
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={handleClear}
          aria-label="Clear search"
          className={cn(
            'absolute right-1 top-1/2 h-7 w-7 -translate-y-1/2 p-0 hover:bg-muted',
            isLoading && 'right-9'
          )}
        >
          <X className="h-4 w-4" aria-hidden="true" />
        </Button>
      )}
      
      {/* Screen Reader Announcement for Results Count */}
      <div
        id="search-results-count"
        role="status"
        aria-live="polite"
        aria-atomic="true"
        className="sr-only"
      >
        {resultsCount !== undefined && (
          localValue
            ? `${resultsCount} resource${resultsCount !== 1 ? 's' : ''} found`
            : ''
        )}
      </div>
    </div>
  );
};

/**
 * Memoized SearchBar to prevent unnecessary re-renders
 */
export const SearchBar = React.memo(SearchBarComponent);
