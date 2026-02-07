/**
 * CategoryFilter Component
 * Feature: resources-page-ui-improvements
 * 
 * A filter component for selecting resource categories.
 * Displays as pills on desktop and dropdown on mobile.
 * Validates: Requirements 2.1, 2.3, 7.1
 */

'use client';

import * as React from 'react';
import { Check, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ResourceCategory } from '@/lib/types/resources.types';
import { cn } from '@/lib/utils';

export interface CategoryFilterProps {
  /**
   * Currently selected categories
   */
  selectedCategories: ResourceCategory[];
  
  /**
   * Callback when a category is toggled
   */
  onToggle: (category: ResourceCategory) => void;
  
  /**
   * Display mode: pills for desktop, dropdown for mobile
   * @default 'pills'
   */
  displayMode?: 'pills' | 'dropdown';
  
  /**
   * Additional CSS classes
   */
  className?: string;
}

/**
 * Category display configuration
 * Maps enum values to user-friendly labels and icons
 */
const CATEGORY_CONFIG: Record<ResourceCategory, { label: string; icon: string }> = {
  [ResourceCategory.PROGRAMMING]: { label: 'Programming', icon: '💻' },
  [ResourceCategory.DESIGN]: { label: 'Design', icon: '🎨' },
  [ResourceCategory.BUSINESS]: { label: 'Business', icon: '💼' },
  [ResourceCategory.DATA_SCIENCE]: { label: 'Data Science', icon: '📊' },
  [ResourceCategory.DEVOPS]: { label: 'DevOps', icon: '⚙️' },
  [ResourceCategory.MOBILE]: { label: 'Mobile', icon: '📱' },
  [ResourceCategory.WEB]: { label: 'Web', icon: '🌐' },
  [ResourceCategory.OTHER]: { label: 'Other', icon: '📚' },
};

/**
 * Get all categories in display order
 */
const ALL_CATEGORIES = Object.values(ResourceCategory);

/**
 * CategoryFilter component for filtering resources by category
 * 
 * Features:
 * - Toggle selection for each category
 * - Visual indicators for selected categories
 * - Responsive: pills on desktop (>= 768px), dropdown on mobile (< 768px)
 * - Category icons for better visual recognition
 * - Accessible with ARIA labels and keyboard navigation
 * - Shows count of selected categories
 * 
 * Validates: Requirements 2.1, 2.3, 7.1
 */
const CategoryFilterComponent = ({
  selectedCategories,
  onToggle,
  displayMode = 'pills',
  className,
}: CategoryFilterProps) => {
  const isSelected = (category: ResourceCategory) => 
    selectedCategories.includes(category);
  
  const selectedCount = selectedCategories.length;
  
  /**
   * Render as pill buttons (desktop view)
   * Touch-friendly with minimum 44x44px tap targets on mobile
   */
  const renderPills = () => (
    <div 
      className={cn('flex flex-wrap gap-2', className)}
      role="group"
      aria-label="Filter by category"
    >
      {ALL_CATEGORIES.map((category) => {
        const config = CATEGORY_CONFIG[category];
        const selected = isSelected(category);
        
        return (
          <Button
            key={category}
            variant={selected ? 'default' : 'outline'}
            size="sm"
            onClick={() => onToggle(category)}
            aria-pressed={selected}
            aria-label={`Filter by ${config.label}`}
            className={cn(
              'h-11 min-h-[44px] gap-1.5 transition-all md:h-9 md:min-h-0',
              selected && 'ring-2 ring-primary ring-offset-2'
            )}
          >
            <span aria-hidden="true">{config.icon}</span>
            <span>{config.label}</span>
            {selected && (
              <Check className="ml-1 h-3 w-3" aria-hidden="true" />
            )}
          </Button>
        );
      })}
    </div>
  );
  
  /**
   * Render as dropdown menu (mobile view)
   * Touch-friendly with minimum 44x44px tap target
   */
  const renderDropdown = () => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className={cn('w-full justify-between gap-2 h-11 min-h-[44px]', className)}
          aria-label={`Category filter, ${selectedCount} selected`}
        >
          <span className="flex items-center gap-2">
            <Filter className="h-4 w-4" aria-hidden="true" />
            <span>Categories</span>
          </span>
          {selectedCount > 0 && (
            <Badge 
              variant="secondary" 
              className="ml-auto h-5 w-5 rounded-full p-0 text-xs"
              aria-label={`${selectedCount} categories selected`}
            >
              {selectedCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent 
        align="start" 
        className="w-56"
        aria-label="Category filter options"
      >
        {ALL_CATEGORIES.map((category) => {
          const config = CATEGORY_CONFIG[category];
          const selected = isSelected(category);
          
          return (
            <DropdownMenuCheckboxItem
              key={category}
              checked={selected}
              onCheckedChange={() => onToggle(category)}
              aria-label={`Filter by ${config.label}`}
              className="min-h-[44px]"
            >
              <span className="mr-2" aria-hidden="true">{config.icon}</span>
              <span>{config.label}</span>
            </DropdownMenuCheckboxItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
  
  return displayMode === 'pills' ? renderPills() : renderDropdown();
};

/**
 * Memoized CategoryFilter to prevent unnecessary re-renders
 */
export const CategoryFilter = React.memo(CategoryFilterComponent);

/**
 * Responsive CategoryFilter that automatically switches between pills and dropdown
 * based on screen size
 */
export const ResponsiveCategoryFilter = ({
  selectedCategories,
  onToggle,
  className,
}: Omit<CategoryFilterProps, 'displayMode'>) => {
  const [isMobile, setIsMobile] = React.useState(false);
  
  React.useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);
  
  return (
    <CategoryFilter
      selectedCategories={selectedCategories}
      onToggle={onToggle}
      displayMode={isMobile ? 'dropdown' : 'pills'}
      className={className}
    />
  );
};
