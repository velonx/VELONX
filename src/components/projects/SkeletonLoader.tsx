/**
 * SkeletonLoader Component
 * Feature: project-page-ui-improvements
 * 
 * Loading placeholder matching ProjectCard layout with shimmer animation.
 * 
 * Requirements:
 * - 7.1: Display skeleton loaders matching ProjectCard layout
 * - 7.2: Shimmer animation with CSS
 * - 7.3: Respect prefers-reduced-motion
 * 
 * Accessibility:
 * - aria-busy="true" on container
 * - aria-hidden="true" on individual skeletons
 * - aria-live="polite" for status updates
 */

'use client';

import React from 'react';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

export interface SkeletonLoaderProps {
  /**
   * Number of skeleton cards to display
   * @default 6
   */
  count?: number;
  
  /**
   * Variant of skeleton layout
   * @default 'card'
   */
  variant?: 'card' | 'list';
  
  /**
   * Additional CSS classes
   */
  className?: string;
}

/**
 * Single skeleton card matching ProjectCard layout
 */
function SkeletonCard() {
  return (
    <Card
      className={cn(
        'relative overflow-hidden p-4 gap-4',
        'skeleton-shimmer'
      )}
      aria-hidden="true"
    >
      {/* Colored top border placeholder */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-muted" />

      {/* Header: Category and Status badges */}
      <div className="flex items-start justify-between gap-2 pt-2">
        <div className="flex items-center gap-2">
          <Skeleton className="h-5 w-20" />
        </div>
        <Skeleton className="h-5 w-16" />
      </div>

      {/* Title and Description */}
      <div className="space-y-2">
        <Skeleton className="h-6 w-3/4" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6" />
      </div>

      {/* Tech Stack */}
      <div className="flex flex-wrap gap-1.5">
        <Skeleton className="h-5 w-16" />
        <Skeleton className="h-5 w-20" />
        <Skeleton className="h-5 w-14" />
        <Skeleton className="h-5 w-18" />
        <Skeleton className="h-5 w-16" />
      </div>

      {/* Team Avatars */}
      <div className="flex items-center gap-1">
        <Skeleton className="h-8 w-8 rounded-full" />
        <Skeleton className="h-8 w-8 rounded-full -ml-2" />
        <Skeleton className="h-8 w-8 rounded-full -ml-2" />
        <Skeleton className="h-8 w-8 rounded-full -ml-2" />
      </div>

      {/* Footer: Quick Actions and Join Button */}
      <div className="flex items-center justify-between gap-2 pt-2 border-t">
        <div className="flex items-center gap-2">
          <Skeleton className="h-8 w-8 rounded" />
          <Skeleton className="h-8 w-8 rounded" />
        </div>
        <Skeleton className="h-8 w-32 rounded" />
      </div>
    </Card>
  );
}

/**
 * SkeletonLoader Component
 * 
 * Displays loading placeholders matching the ProjectCard layout.
 * Includes shimmer animation that respects prefers-reduced-motion.
 */
export function SkeletonLoader({
  count = 6,
  variant = 'card',
  className,
}: SkeletonLoaderProps) {
  // Generate array of skeleton cards
  const skeletons = Array.from({ length: count }, (_, i) => i);

  return (
    <div
      className={cn('w-full', className)}
      role="status"
      aria-busy="true"
      aria-live="polite"
      aria-label="Loading projects"
    >
      {variant === 'card' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {skeletons.map((index) => (
            <SkeletonCard key={`skeleton-${index}`} />
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          {skeletons.map((index) => (
            <SkeletonCard key={`skeleton-${index}`} />
          ))}
        </div>
      )}
      <span className="sr-only">Loading projects, please wait...</span>
    </div>
  );
}

SkeletonLoader.displayName = 'SkeletonLoader';
