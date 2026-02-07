/**
 * ActiveFiltersDisplay Component
 * Feature: resources-page-ui-improvements
 * 
 * Displays currently active filters with remove buttons and clear all option.
 * Validates: Requirements 10.2, 10.4
 */

'use client';

import * as React from 'react';
import { X, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ResourceCategory, ResourceType } from '@/lib/types/resources.types';
import { cn } from '@/lib/utils';

export interface ActiveFiltersDisplayProps {
  /**
   * Currently active filters
   */
  activeFilters: {
    search?: string;
    categories: ResourceCategory[];
    types: ResourceType[];
  };
  
  /**
   * Callback when clear all filters is clicked
   */
  onClearAll: () => void;
  
  /**
   * Callback when a specific filter is removed
   */
  onRemoveFilter: (filterType: 'search' | 'category' | 'type', value: string) => void;
  
  /**
   * Additional CSS classes
   */
  className?: string;
}

/**
 * Category display labels
 */
const CATEGORY_LABELS: Record<ResourceCategory, string> = {
  [ResourceCategory.PROGRAMMING]: 'Programming',
  [ResourceCategory.DESIGN]: 'Design',
  [ResourceCategory.BUSINESS]: 'Business',
  [ResourceCategory.DATA_SCIENCE]: 'Data Science',
  [ResourceCategory.DEVOPS]: 'DevOps',
  [ResourceCategory.MOBILE]: 'Mobile',
  [ResourceCategory.WEB]: 'Web',
  [ResourceCategory.OTHER]: 'Other',
};

/**
 * Type display labels
 */
const TYPE_LABELS: Record<ResourceType, string> = {
  [ResourceType.ARTICLE]: 'Article',
  [ResourceType.VIDEO]: 'Video',
  [ResourceType.COURSE]: 'Course',
  [ResourceType.BOOK]: 'Book',
  [ResourceType.TOOL]: 'Tool',
  [ResourceType.DOCUMENTATION]: 'Documentation',
};

/**
 * ActiveFiltersDisplay component for showing and managing active filters
 * 
 * Features:
 * - Displays chips for each active filter (search, categories, types)
 * - Each chip has a remove button
 * - Shows "Clear All Filters" button when any filter is active
 * - Displays count of active filters
 * - Accessible with ARIA labels
 * - Keyboard accessible (Enter/Space to remove)
 * - Responsive layout
 * 
 * Validates: Requirements 10.2, 10.4
 */
const ActiveFiltersDisplayComponent = ({
  activeFilters,
  onClearAll,
  onRemoveFilter,
  className,
}: ActiveFiltersDisplayProps) => {
  const { search, categories, types } = activeFilters;
  
  // Calculate total count of active filters
  const activeFilterCount = 
    (search ? 1 : 0) + 
    categories.length + 
    types.length;
  
  // Don't render if no filters are active
  if (activeFilterCount === 0) {
    return null;
  }
  
  /**
   * Render a filter chip with remove button
   */
  const renderFilterChip = (
    label: string,
    filterType: 'search' | 'category' | 'type',
    value: string,
    key: string
  ) => (
    <Badge
      key={key}
      variant="secondary"
      className={cn(
        'flex items-center gap-1.5 pl-3 pr-1 py-1.5 text-sm filter-chip-enter',
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
          search,
          'search-filter'
        )}
        
        {/* Category Filters */}
        {categories.map((category) => renderFilterChip(
          CATEGORY_LABELS[category],
          'category',
          category,
          `category-${category}`
        ))}
        
        {/* Type Filters */}
        {types.map((type) => renderFilterChip(
          TYPE_LABELS[type],
          'type',
          type,
          `type-${type}`
        ))}
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
