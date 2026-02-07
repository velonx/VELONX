'use client';

/**
 * SortControl Component
 * Feature: project-page-ui-improvements
 * 
 * Dropdown component for selecting project sort order with session storage persistence.
 * Supports keyboard navigation and accessibility.
 * Memoized to prevent unnecessary re-renders.
 * 
 * Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 14.6
 */

import { useEffect } from 'react';
import * as React from 'react';
import { ArrowUpDown } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { SortOption } from '@/lib/types/project-page.types';
import { saveSortPreference } from '@/lib/utils/session-storage';

interface SortControlProps {
  value: SortOption;
  onChange: (option: SortOption) => void;
}

// Sort option configurations
const SORT_OPTIONS: Array<{ value: SortOption; label: string }> = [
  { value: 'newest', label: 'Newest' },
  { value: 'popular', label: 'Most Popular' },
  { value: 'teamSize', label: 'Team Size' },
  { value: 'techStack', label: 'Tech Stack' },
];

export const SortControlComponent = ({ value, onChange }: SortControlProps) => {
  // Persist sort preference to session storage whenever it changes
  useEffect(() => {
    saveSortPreference(value);
  }, [value]);

  const handleValueChange = (newValue: string) => {
    onChange(newValue as SortOption);
  };

  return (
    <div className="flex items-center gap-2">
      <ArrowUpDown className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
      <Select value={value} onValueChange={handleValueChange}>
        <SelectTrigger
          className="w-[180px]"
          aria-label="Sort projects by"
        >
          <SelectValue placeholder="Sort by..." />
        </SelectTrigger>
        <SelectContent>
          {SORT_OPTIONS.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

/**
 * Memoized SortControl to prevent unnecessary re-renders
 */
export const SortControl = React.memo(SortControlComponent);
