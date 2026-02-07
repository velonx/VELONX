/**
 * FilterDrawer Component
 * Feature: resources-page-ui-improvements
 * 
 * A mobile-optimized drawer/modal for displaying filters in a vertical layout.
 * Validates: Requirements 7.1
 */

'use client';

import * as React from 'react';
import { X, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';
import { CategoryFilter } from './CategoryFilter';
import { TypeFilter } from './TypeFilter';
import { ResourceCategory, ResourceType } from '@/lib/types/resources.types';
import { cn } from '@/lib/utils';

export interface FilterDrawerProps {
  /**
   * Currently selected categories
   */
  selectedCategories: ResourceCategory[];
  
  /**
   * Currently selected types
   */
  selectedTypes: ResourceType[];
  
  /**
   * Callback when a category is toggled
   */
  onCategoryToggle: (category: ResourceCategory) => void;
  
  /**
   * Callback when a type is toggled
   */
  onTypeToggle: (type: ResourceType) => void;
  
  /**
   * Callback when filters are applied (drawer closes)
   */
  onApply?: () => void;
  
  /**
   * Callback when filters are cleared
   */
  onClearAll?: () => void;
  
  /**
   * Additional CSS classes
   */
  className?: string;
}

/**
 * FilterDrawer Component
 * 
 * A mobile-friendly drawer that displays category and type filters
 * in a vertical layout with an "Apply Filters" button.
 * 
 * Features:
 * - Slide-in drawer from bottom on mobile
 * - Vertical filter layout for better mobile UX
 * - Apply button to confirm filter selection
 * - Clear all button to reset filters
 * - Shows count of active filters on trigger button
 * - Touch-friendly with minimum 44x44px tap targets
 * - Accessible with proper ARIA labels
 * 
 * Validates: Requirements 7.1
 */
export const FilterDrawer = ({
  selectedCategories,
  selectedTypes,
  onCategoryToggle,
  onTypeToggle,
  onApply,
  onClearAll,
  className,
}: FilterDrawerProps) => {
  const [open, setOpen] = React.useState(false);
  
  // Calculate total active filters
  const activeFilterCount = selectedCategories.length + selectedTypes.length;
  
  /**
   * Handle apply button click
   */
  const handleApply = () => {
    setOpen(false);
    onApply?.();
  };
  
  /**
   * Handle clear all button click
   */
  const handleClearAll = () => {
    onClearAll?.();
  };
  
  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          variant="outline"
          size="lg"
          className={cn(
            'w-full justify-between gap-2 h-11 min-h-[44px]',
            className
          )}
          aria-label={`Open filters, ${activeFilterCount} active`}
        >
          <span className="flex items-center gap-2">
            <Filter className="h-4 w-4" aria-hidden="true" />
            <span>Filters</span>
          </span>
          {activeFilterCount > 0 && (
            <Badge 
              variant="secondary" 
              className="ml-auto h-5 w-5 rounded-full p-0 text-xs"
              aria-label={`${activeFilterCount} filters active`}
            >
              {activeFilterCount}
            </Badge>
          )}
        </Button>
      </SheetTrigger>
      
      <SheetContent 
        side="bottom" 
        className="h-[85vh] flex flex-col"
        aria-label="Filter options"
      >
        <SheetHeader className="pb-4 border-b">
          <SheetTitle className="text-left">Filter Resources</SheetTitle>
        </SheetHeader>
        
        {/* Scrollable filter content */}
        <div className="flex-1 overflow-y-auto py-6 space-y-6">
          {/* Category Filter Section */}
          <div>
            <h3 className="text-sm font-semibold text-gray-700 mb-3">
              Category
            </h3>
            <CategoryFilter
              selectedCategories={selectedCategories}
              onToggle={onCategoryToggle}
              displayMode="pills"
              className="flex-col items-stretch"
            />
          </div>
          
          {/* Type Filter Section */}
          <div>
            <h3 className="text-sm font-semibold text-gray-700 mb-3">
              Type
            </h3>
            <TypeFilter
              selectedTypes={selectedTypes}
              onToggle={onTypeToggle}
              displayMode="pills"
              className="flex-col items-stretch"
            />
          </div>
        </div>
        
        {/* Action buttons */}
        <div className="pt-4 border-t space-y-2">
          {activeFilterCount > 0 && (
            <Button
              variant="outline"
              size="lg"
              onClick={handleClearAll}
              className="w-full h-11 min-h-[44px]"
              aria-label="Clear all filters"
            >
              Clear All Filters
            </Button>
          )}
          
          <Button
            size="lg"
            onClick={handleApply}
            className="w-full h-11 min-h-[44px]"
            aria-label="Apply filters and close"
          >
            Apply Filters
            {activeFilterCount > 0 && (
              <Badge 
                variant="secondary" 
                className="ml-2 bg-white/20 text-white"
              >
                {activeFilterCount}
              </Badge>
            )}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
};

FilterDrawer.displayName = 'FilterDrawer';
