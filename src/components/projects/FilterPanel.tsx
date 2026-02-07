/**
 * FilterPanel Component
 * Feature: project-page-ui-improvements
 * 
 * Multi-select filter panel for projects with tech stack, difficulty,
 * team size, and category filters.
 */

'use client';

import React from 'react';
import { X, Filter, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Slider } from '@/components/ui/slider';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import {
  ProjectFilters,
  ProjectCategory,
  ProjectDifficulty,
  CATEGORY_COLORS,
} from '@/lib/types/project-page.types';
import { countActiveFilters } from '@/lib/utils/project-filters';

interface FilterPanelProps {
  filters: ProjectFilters;
  onChange: (filters: ProjectFilters) => void;
  availableTechStacks: string[];
  projectCount: number;
}

const DIFFICULTY_OPTIONS: { value: ProjectDifficulty; label: string }[] = [
  { value: 'BEGINNER', label: 'Beginner' },
  { value: 'INTERMEDIATE', label: 'Intermediate' },
  { value: 'ADVANCED', label: 'Advanced' },
];

const CATEGORY_OPTIONS: { value: ProjectCategory; label: string }[] = [
  { value: 'WEB_DEV', label: 'Web Dev' },
  { value: 'MOBILE', label: 'Mobile' },
  { value: 'AI_ML', label: 'AI/ML' },
  { value: 'DATA_SCIENCE', label: 'Data Science' },
  { value: 'DEVOPS', label: 'DevOps' },
  { value: 'DESIGN', label: 'Design' },
  { value: 'OTHER', label: 'Other' },
];

const TEAM_SIZE_MIN = 1;
const TEAM_SIZE_MAX = 20;

export const FilterPanelComponent = ({
  filters,
  onChange,
  availableTechStacks,
  projectCount,
}: FilterPanelProps) => {
  const activeFilterCount = countActiveFilters(filters);
  const hasActiveFilters = activeFilterCount > 0;

  // Handle tech stack toggle
  const handleTechStackToggle = (tech: string) => {
    const newTechStack = filters.techStack.includes(tech)
      ? filters.techStack.filter((t) => t !== tech)
      : [...filters.techStack, tech];

    onChange({
      ...filters,
      techStack: newTechStack,
    });
  };

  // Handle difficulty selection
  const handleDifficultyChange = (difficulty: ProjectDifficulty) => {
    onChange({
      ...filters,
      difficulty: filters.difficulty === difficulty ? null : difficulty,
    });
  };

  // Handle category selection
  const handleCategoryChange = (category: ProjectCategory) => {
    onChange({
      ...filters,
      category: filters.category === category ? null : category,
    });
  };

  // Handle team size change
  const handleTeamSizeChange = (values: number[]) => {
    onChange({
      ...filters,
      teamSize: {
        min: values[0],
        max: values[1],
      },
    });
  };

  // Clear all filters
  const handleClearAll = () => {
    onChange({
      techStack: [],
      difficulty: null,
      teamSize: null,
      category: null,
    });
  };

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
                  onClick={handleClearAll}
                  className="h-auto p-1 text-xs"
                  aria-label="Clear all filters"
                >
                  Clear All
                </Button>
              )}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {projectCount} {projectCount === 1 ? 'project' : 'projects'} found
            </p>
          </div>

          <ScrollArea className="h-[400px]">
            <div className="p-4 space-y-6">
              {/* Tech Stack Filter */}
              <div>
                <Label className="text-sm font-medium mb-3 block" aria-label="Filter by tech stack">
                  Tech Stack
                </Label>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {availableTechStacks.map((tech) => (
                    <div key={tech} className="flex items-center space-x-2">
                      <Checkbox
                        id={`tech-${tech}`}
                        checked={filters.techStack.includes(tech)}
                        onCheckedChange={() => handleTechStackToggle(tech)}
                        aria-label={`Filter by ${tech}`}
                      />
                      <label
                        htmlFor={`tech-${tech}`}
                        className="text-sm cursor-pointer flex-1"
                      >
                        {tech}
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              <Separator />

              {/* Difficulty Filter */}
              <div>
                <Label className="text-sm font-medium mb-3 block" aria-label="Filter by difficulty">
                  Difficulty
                </Label>
                <div className="space-y-2">
                  {DIFFICULTY_OPTIONS.map((option) => (
                    <div key={option.value} className="flex items-center space-x-2">
                      <Checkbox
                        id={`difficulty-${option.value}`}
                        checked={filters.difficulty === option.value}
                        onCheckedChange={() => handleDifficultyChange(option.value)}
                        aria-label={`Filter by ${option.label} difficulty`}
                      />
                      <label
                        htmlFor={`difficulty-${option.value}`}
                        className="text-sm cursor-pointer flex-1"
                      >
                        {option.label}
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              <Separator />

              {/* Category Filter */}
              <div>
                <Label className="text-sm font-medium mb-3 block" aria-label="Filter by category">
                  Category
                </Label>
                <div className="space-y-2">
                  {CATEGORY_OPTIONS.map((option) => (
                    <div key={option.value} className="flex items-center space-x-2">
                      <Checkbox
                        id={`category-${option.value}`}
                        checked={filters.category === option.value}
                        onCheckedChange={() => handleCategoryChange(option.value)}
                        aria-label={`Filter by ${option.label} category`}
                      />
                      <label
                        htmlFor={`category-${option.value}`}
                        className="text-sm cursor-pointer flex-1"
                      >
                        {option.label}
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              <Separator />

              {/* Team Size Filter */}
              <div>
                <Label className="text-sm font-medium mb-3 block" aria-label="Filter by team size">
                  Team Size
                </Label>
                <div className="space-y-4">
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <span>
                      {filters.teamSize?.min ?? TEAM_SIZE_MIN} - {filters.teamSize?.max ?? TEAM_SIZE_MAX} members
                    </span>
                    {filters.teamSize && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onChange({ ...filters, teamSize: null })}
                        className="h-auto p-1 text-xs"
                        aria-label="Clear team size filter"
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    )}
                  </div>
                  <Slider
                    min={TEAM_SIZE_MIN}
                    max={TEAM_SIZE_MAX}
                    step={1}
                    value={[
                      filters.teamSize?.min ?? TEAM_SIZE_MIN,
                      filters.teamSize?.max ?? TEAM_SIZE_MAX,
                    ]}
                    onValueChange={handleTeamSizeChange}
                    className="w-full"
                    aria-label="Select team size range"
                  />
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
