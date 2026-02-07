/**
 * EmptyState Component
 * Feature: project-page-ui-improvements
 * 
 * Informative message displayed when no projects match the current filters.
 * 
 * Requirements:
 * - 6.1: Display empty state with relevant message when no projects match filters
 * - 6.2: Include call-to-action button
 * - 6.3: Encourage users to submit first project when no running projects exist
 * - 6.4: Display encouraging message when no completed projects exist
 * - 6.5: Use appropriate iconography matching the context
 * 
 * Accessibility:
 * - Proper heading hierarchy
 * - Descriptive text for screen readers
 * - Keyboard accessible CTA buttons
 */

'use client';

import React from 'react';
import { Search, Code, CheckCircle, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export interface EmptyStateProps {
  /**
   * Type of empty state to display
   */
  type: 'no-results' | 'no-projects' | 'no-completed';
  
  /**
   * Optional action handler for CTA button
   */
  onAction?: () => void;
  
  /**
   * Optional custom label for CTA button
   */
  actionLabel?: string;
  
  /**
   * Additional CSS classes
   */
  className?: string;
}

/**
 * Configuration for each empty state variant
 */
const EMPTY_STATE_CONFIG = {
  'no-results': {
    icon: Search,
    heading: 'No projects match your filters',
    description: 'Try adjusting your search terms or filters to find more projects.',
    defaultActionLabel: 'Clear Filters',
    iconColor: 'text-blue-500',
  },
  'no-projects': {
    icon: Code,
    heading: 'No running projects yet',
    description: 'Be the first to start a project! Share your ideas and collaborate with others.',
    defaultActionLabel: 'Submit Project',
    iconColor: 'text-purple-500',
  },
  'no-completed': {
    icon: CheckCircle,
    heading: 'No completed projects yet',
    description: 'Keep working on your projects! Completed projects will appear here once they\'re finished.',
    defaultActionLabel: null, // No action for this variant
    iconColor: 'text-green-500',
  },
} as const;

/**
 * EmptyState Component
 * 
 * Displays contextual empty state messages with appropriate icons and CTAs.
 * Provides helpful guidance to users when no projects are available.
 */
export function EmptyState({
  type,
  onAction,
  actionLabel,
  className,
}: EmptyStateProps) {
  const config = EMPTY_STATE_CONFIG[type];
  const Icon = config.icon;
  // Use actionLabel if explicitly provided (even if empty), otherwise use default
  const finalActionLabel = actionLabel !== undefined ? actionLabel : config.defaultActionLabel;

  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center',
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
          'mb-6 p-4 rounded-full',
          'bg-muted/50',
          'flex items-center justify-center'
        )}
        aria-hidden="true"
      >
        <Icon
          className={cn('h-12 w-12', config.iconColor)}
          strokeWidth={1.5}
        />
      </div>

      {/* Heading */}
      <h2
        className={cn(
          'text-2xl font-bold mb-3',
          'text-foreground'
        )}
      >
        {config.heading}
      </h2>

      {/* Description */}
      <p
        className={cn(
          'text-base text-muted-foreground mb-8',
          'max-w-md'
        )}
      >
        {config.description}
      </p>

      {/* CTA Button */}
      {finalActionLabel && onAction && (
        <Button
          onClick={onAction}
          size="lg"
          className="min-w-[160px]"
          aria-label={finalActionLabel}
        >
          {finalActionLabel}
        </Button>
      )}
    </div>
  );
}

EmptyState.displayName = 'EmptyState';
