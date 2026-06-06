/**
 * EventCardSkeleton Component
 * Feature: events-page-ui-improvements
 * 
 * Loading placeholder matching EventCard layout with shimmer animation.
 * 
 * Requirements:
 * - 7.1: Display skeleton loaders during loading
 * 
 * Features:
 * - Matches EventCard structure (gradient header, content, footer)
 * - Pulse animation with shimmer effect
 * - Matches actual card dimensions and spacing
 * - Respects prefers-reduced-motion
 * 
 * Accessibility:
 * - aria-hidden="true" on skeleton elements
 * - Proper role and aria attributes on container
 */

'use client';

import { Card, CardFooter, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

export interface EventCardSkeletonProps {
  /**
   * Additional CSS classes
   */
  className?: string;
}

/**
 * EventCardSkeleton Component
 * 
 * Displays a loading placeholder matching the EventCard layout.
 * Includes shimmer animation that respects prefers-reduced-motion.
 */
export function EventCardSkeleton({ className }: EventCardSkeletonProps) {
  return (
    <div 
      className={cn(
        "event-card relative animate-pulse skeleton-shimmer bg-[#0f172a] border-0 rounded-3xl shadow-2xl",
        className
      )}
      aria-hidden="true"
    >
      {/* Top Section - Banner Placeholder */}
      <div className="event-banner bg-linear-to-br h-40 bg-muted/20 mb-4 rounded-[14px] relative flex items-center justify-center">
        {/* Status Tag Badge Placeholder */}
        <div className="absolute top-3 left-3">
          <Skeleton className="h-5 w-16 bg-muted/30 rounded-full" />
        </div>
      </div>

      {/* Date and Time / Location Meta Placeholder */}
      <div className="flex items-center gap-4 mb-2.5 px-6">
        <Skeleton className="h-3.5 w-24 bg-muted/30" />
        <Skeleton className="h-3.5 w-16 bg-muted/30" />
      </div>

      {/* Title Placeholder */}
      <div className="p-6">
        <Skeleton className="h-5 w-3/4 bg-muted/40 mb-2 rounded" />
      </div>

      {/* Description Placeholder */}
      <div className="space-y-1.5 mb-5 grow px-6">
        <Skeleton className="h-3.5 w-full bg-muted/20" />
        <Skeleton className="h-3.5 w-5/6 bg-muted/20" />
        <Skeleton className="h-3.5 w-4/6 bg-muted/20" />
      </div>

      {/* Attendee progress bar placeholder */}
      <div className="px-6 mb-4">
        <Skeleton className="h-2 w-full rounded-full bg-muted/20" />
      </div>

      {/* Footer - Action Buttons Placeholder */}
      <div className="flex justify-between items-center border-t border-border mt-auto p-6 pt-0">
        <Skeleton className="h-4 w-16 bg-muted/30 rounded" />
        <Skeleton className="h-8 w-24 bg-muted/40 rounded-full" />
      </div>
    </div>
  );
}

EventCardSkeleton.displayName = 'EventCardSkeleton';

/**
 * EventCardSkeletonLoader Component
 * 
 * Displays multiple EventCardSkeleton components in a grid layout.
 */
export interface EventCardSkeletonLoaderProps {
  /**
   * Number of skeleton cards to display
   * @default 6
   */
  count?: number;
  
  /**
   * Additional CSS classes
   */
  className?: string;
}

export function EventCardSkeletonLoader({
  count = 6,
  className,
}: EventCardSkeletonLoaderProps) {
  // Generate array of skeleton cards
  const skeletons = Array.from({ length: count }, (_, i) => i);

  return (
    <div
      className={cn('w-full', className)}
      role="status"
      aria-busy="true"
      aria-live="polite"
      aria-label="Loading events"
    >
      <div className="events-grid grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {skeletons.map((index) => (
          <EventCardSkeleton key={`event-skeleton-${index}`} />
        ))}
      </div>
      <span className="sr-only">Loading events, please wait...</span>
    </div>
  );
}

EventCardSkeletonLoader.displayName = 'EventCardSkeletonLoader';
