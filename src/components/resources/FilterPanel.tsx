/**
 * FilterPanel Component
 * Feature: resources-page-ui-improvements
 * 
 * Optimized multi-select filter panel for resources with category and type filters.
 * Matches the design pattern from the projects page FilterPanel.
 */

'use client';

import React from 'react';
import { Filter, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { ResourceCategory, ResourceType } from '@/lib/types/resources.types';

interface FilterPanelProps {
  selectedCategories: ResourceCategory[];
  selectedTypes: ResourceType[];
  onCategoryToggle: (category: ResourceCategory) => void;
  onTypeToggle: (type: ResourceType) => void;
  onClearAll: () => void;
  resourceCount?: number;
}

const CATEGORY_OPTIONS: { value: ResourceCategory; label: string; description: string }[] = [
  { value: 'PROGRAMMING', label: 'Programming', description: 'Code & algorithms' },
  { value: 'DESIGN', label: 'Design', description: 'UI/UX & graphics' },
  { value: 'BUSINESS', label: 'Business', description: 'Strategy & management' },
  { value: 'DATA_SCIENCE', label: 'Data Science', description: 'Analytics & ML' },
  { value: 'DEVOPS', label: 'DevOps', description: 'Infrastructure & CI/CD' },
  { value: 'MOBILE', label: 'Mobile', description: 'iOS & Android' },
  { value: 'WEB', label: 'Web', description: 'Frontend & backend' },
  { value: 'OTHER', label: 'Other', description: 'Miscellaneous' },
];

const TYPE_OPTIONS: { value: ResourceType; label: string; icon: string }[] = [
  { value: 'ARTICLE', label: 'Article', icon: '📄' },
  { value: 'VIDEO', label: 'Video', icon: '🎥' },
  { value: 'COURSE', label: 'Course', icon: '🎓' },
  { value: 'BOOK', label: 'Book', icon: '📚' },
  { value: 'TOOL', label: 'Tool', icon: '🛠️' },
  { value: 'DOCUMENTATION', label: 'Documentation', icon: '📖' },
];

export const FilterPanelComponent = ({
  selectedCategories,
  selectedTypes,
  onCategoryToggle,
  onTypeToggle,
  onClearAll,
  resourceCount,
}: FilterPanelProps) => {
  const activeFilterCount = selectedCategories.length + selectedTypes.length;
  const hasActiveFilters = activeFilterCount > 0;

  return (
    <div className="flex items-center gap-2">
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className="gap-2"
            aria-label="Open filter panel"
            aria-expanded="false"
          >
            <Filter className="h-4 w-4" aria-hidden="true" />
            <span>Filters</span>
            {hasActiveFilters && (
              <Badge
                variant="secondary"
                className="ml-1 h-5 w-5 rounded-full p-0 flex items-center justify-center"
                aria-label={`${activeFilterCount} active filters`}
              >
                {activeFilterCount}
              </Badge>
            )}
            <ChevronDown className="h-4 w-4" aria-hidden="true" />
          </Button>
        </PopoverTrigger>
        <PopoverContent
          className="w-80 p-0"
          align="start"
          role="dialog"
          aria-label="Filter options"
        >
          <div className="p-4 border-b">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-sm">Filters</h3>
              {hasActiveFilters && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onClearAll}
                  className="h-auto p-1 text-xs"
                  aria-label="Clear all filters"
                >
                  Clear All
                </Button>
              )}
            </div>
            {resourceCount !== undefined && (
              <p className="text-xs text-muted-foreground mt-1">
                {resourceCount} {resourceCount === 1 ? 'resource' : 'resources'} found
              </p>
            )}
          </div>

          <ScrollArea className="h-[500px]">
            <div className="p-4 space-y-6">
              {/* Category Filter */}
              <div>
                <Label className="text-sm font-medium mb-3 block" aria-label="Filter by category">
                  Category
                </Label>
                <div className="space-y-2">
                  {CATEGORY_OPTIONS.map((option) => (
                    <div key={option.value} className="flex items-start space-x-2">
                      <Checkbox
                        id={`category-${option.value}`}
                        checked={selectedCategories.includes(option.value)}
                        onCheckedChange={() => onCategoryToggle(option.value)}
                        aria-label={`Filter by ${option.label} category`}
                        className="mt-1"
                      />
                      <label
                        htmlFor={`category-${option.value}`}
                        className="text-sm cursor-pointer flex-1"
                      >
                        <div className="font-medium">{option.label}</div>
                        <div className="text-xs text-muted-foreground">{option.description}</div>
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              <Separator />

              {/* Type Filter */}
              <div>
                <Label className="text-sm font-medium mb-3 block" aria-label="Filter by type">
                  Resource Type
                </Label>
                <div className="space-y-2">
                  {TYPE_OPTIONS.map((option) => (
                    <div key={option.value} className="flex items-center space-x-2">
                      <Checkbox
                        id={`type-${option.value}`}
                        checked={selectedTypes.includes(option.value)}
                        onCheckedChange={() => onTypeToggle(option.value)}
                        aria-label={`Filter by ${option.label} type`}
                      />
                      <label
                        htmlFor={`type-${option.value}`}
                        className="text-sm cursor-pointer flex-1 flex items-center gap-2"
                      >
                        <span className="text-base" aria-hidden="true">{option.icon}</span>
                        <span>{option.label}</span>
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </ScrollArea>
        </PopoverContent>
      </Popover>
    </div>
  );
};

/**
 * Memoized FilterPanel to prevent unnecessary re-renders
 */
export const FilterPanel = React.memo(FilterPanelComponent);
