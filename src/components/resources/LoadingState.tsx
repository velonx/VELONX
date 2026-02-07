/**
 * LoadingState Component
 * Feature: resources-page-ui-improvements
 * 
 * Loading placeholder matching ResourceCard layout with shimmer animation.
 * 
 * Requirements:
 * - 6.1: Display skeleton loaders during loading
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

export interface LoadingStateProps {
  /**
   * Number of skeleton cards to display
   * @default 12
   */
  count?: number;
  
  /**
   * Additional CSS classes
   */
  className?: string;
}

/**
 * Single skeleton card matching ResourceCard layout
 */
function SkeletonResourceCard() {
  return (
    <Card
      className={cn(
        'relative overflow-hidden flex flex-col h-full',
        'skeleton-shimmer'
      )}
      aria-hidden="true"
    >
      {/* Image Section - 16:9 aspect ratio */}
      <div className="relative w-full aspect-video bg-muted">
        <Skeleton className="w-full h-full" />
        
        {/* Type Badge Overlay */}
        <div className="absolute top-2 right-2">
          <Skeleton className="h-6 w-20" />
        </div>
      </div>
      
      {/* Content Section */}
      <div className="flex flex-col flex-1 p-4 gap-3">
        {/* Title - 2 lines */}
        <div className="space-y-2">
          <Skeleton className="h-5 w-full" />
          <Skeleton className="h-5 w-3/4" />
        </div>
        
        {/* Description - 3 lines */}
        <div className="space-y-2 flex-1">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-2/3" />
        </div>
        
        {/* Footer: Category and Access Count */}
        <div className="flex items-center justify-between gap-2 pt-2 border-t">
          <Skeleton className="h-5 w-24" />
          <Skeleton className="h-4 w-12" />
        </div>
      </div>
    </Card>
  );
}

/**
 * LoadingState Component
 * 
 * Displays loading placeholders matching the ResourceCard layout.
 * Includes shimmer animation that respects prefers-reduced-motion.
 */
export function LoadingState({
  count = 12,
  className,
}: LoadingStateProps) {
  // Generate array of skeleton cards
  const skeletons = Array.from({ length: count }, (_, i) => i);

  return (
    <div
      className={cn('w-full loading-state-enter', className)}
      role="status"
      aria-busy="true"
      aria-live="polite"
      aria-label="Loading resources"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {skeletons.map((index) => (
          <SkeletonResourceCard key={`skeleton-${index}`} />
        ))}
      </div>
      <span className="sr-only">Loading resources, please wait...</span>
    </div>
  );
}

LoadingState.displayName = 'LoadingState';
