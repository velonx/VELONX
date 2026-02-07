/**
 * TypeFilter Component
 * Feature: resources-page-ui-improvements
 * 
 * A filter component for selecting resource types with multi-select support.
 * Displays as pills on desktop and dropdown on mobile.
 * Validates: Requirements 3.1, 3.4
 */

'use client';

import * as React from 'react';
import { Check, Filter, FileText, Video, BookOpen, Book, Wrench, FileCode } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ResourceType } from '@/lib/types/resources.types';
import { cn } from '@/lib/utils';

export interface TypeFilterProps {
  /**
   * Currently selected types
   */
  selectedTypes: ResourceType[];
  
  /**
   * Callback when a type is toggled
   */
  onToggle: (type: ResourceType) => void;
  
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
 * Type display configuration
 * Maps enum values to user-friendly labels and icons
 */
const TYPE_CONFIG: Record<ResourceType, { label: string; Icon: React.ComponentType<{ className?: string }> }> = {
  [ResourceType.ARTICLE]: { label: 'Article', Icon: FileText },
  [ResourceType.VIDEO]: { label: 'Video', Icon: Video },
  [ResourceType.COURSE]: { label: 'Course', Icon: BookOpen },
  [ResourceType.BOOK]: { label: 'Book', Icon: Book },
  [ResourceType.TOOL]: { label: 'Tool', Icon: Wrench },
  [ResourceType.DOCUMENTATION]: { label: 'Documentation', Icon: FileCode },
};

/**
 * Get all types in display order
 */
const ALL_TYPES = Object.values(ResourceType);

/**
 * TypeFilter component for filtering resources by type
 * 
 * Features:
 * - Multi-select functionality (can select multiple types)
 * - Toggle selection for each type
 * - Visual indicators for selected types
 * - Type-specific icons for better recognition
 * - Responsive: pills on desktop (>= 768px), dropdown on mobile (< 768px)
 * - Accessible with ARIA labels and keyboard navigation
 * - Shows count of selected types
 * - Matches CategoryFilter styling patterns
 * 
 * Validates: Requirements 3.1, 3.4
 */
const TypeFilterComponent = ({
  selectedTypes,
  onToggle,
  displayMode = 'pills',
  className,
}: TypeFilterProps) => {
  const isSelected = (type: ResourceType) => 
    selectedTypes.includes(type);
  
  const selectedCount = selectedTypes.length;
  
  /**
   * Render as pill buttons (desktop view)
   * Touch-friendly with minimum 44x44px tap targets on mobile
   */
  const renderPills = () => (
    <div 
      className={cn('flex flex-wrap gap-2', className)}
      role="group"
      aria-label="Filter by type"
    >
      {ALL_TYPES.map((type) => {
        const config = TYPE_CONFIG[type];
        const selected = isSelected(type);
        const Icon = config.Icon;
        
        return (
          <Button
            key={type}
            variant={selected ? 'default' : 'outline'}
            size="sm"
            onClick={() => onToggle(type)}
            aria-pressed={selected}
            aria-label={`Filter by ${config.label}`}
            className={cn(
              'h-11 min-h-[44px] gap-1.5 transition-all md:h-9 md:min-h-0',
              selected && 'ring-2 ring-primary ring-offset-2'
            )}
          >
            <Icon className="h-3.5 w-3.5" aria-hidden="true" />
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
          aria-label={`Type filter, ${selectedCount} selected`}
        >
          <span className="flex items-center gap-2">
            <Filter className="h-4 w-4" aria-hidden="true" />
            <span>Types</span>
          </span>
          {selectedCount > 0 && (
            <Badge 
              variant="secondary" 
              className="ml-auto h-5 w-5 rounded-full p-0 text-xs"
              aria-label={`${selectedCount} types selected`}
            >
              {selectedCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent 
        align="start" 
        className="w-56"
        aria-label="Type filter options"
      >
        {ALL_TYPES.map((type) => {
          const config = TYPE_CONFIG[type];
          const selected = isSelected(type);
          const Icon = config.Icon;
          
          return (
            <DropdownMenuCheckboxItem
              key={type}
              checked={selected}
              onCheckedChange={() => onToggle(type)}
              aria-label={`Filter by ${config.label}`}
              className="min-h-[44px]"
            >
              <Icon className="mr-2 h-4 w-4" aria-hidden="true" />
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
 * Memoized TypeFilter to prevent unnecessary re-renders
 */
export const TypeFilter = React.memo(TypeFilterComponent);

/**
 * Responsive TypeFilter that automatically switches between pills and dropdown
 * based on screen size
 */
export const ResponsiveTypeFilter = ({
  selectedTypes,
  onToggle,
  className,
}: Omit<TypeFilterProps, 'displayMode'>) => {
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
    <TypeFilter
      selectedTypes={selectedTypes}
      onToggle={onToggle}
      displayMode={isMobile ? 'dropdown' : 'pills'}
      className={className}
    />
  );
};
