/**
 * EmptyState Component
 * Feature: resources-page-ui-improvements
 * 
 * Displays contextual messages when no resources are found.
 * 
 * Requirements:
 * - 1.4: Display empty state when no results match search/filters
 * 
 * Accessibility:
 * - Proper heading hierarchy
 * - Descriptive text for screen readers
 * - Keyboard accessible CTA buttons
 */

'use client';

import React from 'react';
import { Search, BookOpen, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export interface EmptyStateProps {
  /**
   * Whether filters are currently active
   */
  hasActiveFilters: boolean;
  
  /**
   * Callback when "Clear Filters" button is clicked
   */
  onClearFilters?: () => void;
  
  /**
   * Additional CSS classes
   */
  className?: string;
}

/**
 * EmptyState Component
 * 
 * Displays contextual empty state messages based on whether filters are active.
 * Provides helpful guidance and actions to users when no resources are found.
 */
export function EmptyState({
  hasActiveFilters,
  onClearFilters,
  className,
}: EmptyStateProps) {
  // Different configurations for filtered vs unfiltered states
  const config = hasActiveFilters
    ? {
        icon: Filter,
        heading: 'No resources match your filters',
        description: 'Try adjusting your search terms or filters to find more resources. You can also clear all filters to see all available resources.',
        actionLabel: 'Clear All Filters',
        iconColor: 'text-blue-500',
        bgColor: 'bg-blue-500/10',
        suggestions: [
          'Try using different search terms',
          'Remove some category or type filters',
          'Check for typos in your search',
        ],
      }
    : {
        icon: BookOpen,
        heading: 'No resources available',
        description: 'There are currently no learning resources available. Please check back later or contact support if you believe this is an error.',
        actionLabel: null,
        iconColor: 'text-purple-500',
        bgColor: 'bg-purple-500/10',
        suggestions: [
          'Check back later for new resources',
          'Contact support if you need assistance',
        ],
      };

  const Icon = config.icon;

  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center empty-state-enter',
        'py-16 px-4 text-center',
        'min-h-[400px]',
        className
      )}
      role="status"
      aria-live="polite"
    >
      {/* Icon */}
      <div
        className={cn(
          'mb-6 p-4 rounded-full flex items-center justify-center',
          config.bgColor
        )}
        aria-hidden="true"
      >
        <Icon
          className={cn('h-12 w-12', config.iconColor)}
          strokeWidth={1.5}
        />
      </div>

      {/* Heading */}
      <h2 className="text-2xl font-bold mb-3 text-foreground">
        {config.heading}
      </h2>

      {/* Description */}
      <p className="text-base text-muted-foreground mb-6 max-w-md">
        {config.description}
      </p>

      {/* Suggestions */}
      {config.suggestions.length > 0 && (
        <div className="mb-8 max-w-md">
          <p className="text-sm font-medium text-foreground mb-3">
            Suggestions:
          </p>
          <ul className="text-sm text-muted-foreground space-y-2 text-left">
            {config.suggestions.map((suggestion, index) => (
              <li key={index} className="flex items-start gap-2">
                <span className="text-primary mt-0.5">•</span>
                <span>{suggestion}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* CTA Button */}
      {config.actionLabel && onClearFilters && (
        <Button
          onClick={onClearFilters}
          size="lg"
          className="min-w-[160px]"
          aria-label={config.actionLabel}
        >
          {config.actionLabel}
        </Button>
      )}
    </div>
  );
}

EmptyState.displayName = 'EmptyState';
