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

import React from 'react';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
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
    <Card 
      className={cn(
        "bg-[#0f172a] border-0 rounded-[24px] overflow-hidden shadow-2xl",
        "skeleton-shimmer",
        className
      )}
      aria-hidden="true"
    >
      {/* Top Section - Gradient Header Placeholder */}
      <div className="h-40 bg-gradient-to-br from-gray-700 to-gray-800 relative flex items-center justify-center">
        {/* Urgency Badges Placeholder */}
        <div className="absolute top-4 right-4 flex flex-col gap-2">
          <Skeleton className="h-6 w-16 bg-white/10" />
        </div>

        {/* Event Type Badge Placeholder */}
        <div className="absolute top-4 left-4">
          <Skeleton className="h-6 w-24 bg-white/10" />
        </div>

        {/* Icon Placeholder */}
        <Skeleton className="h-16 w-16 rounded-full bg-white/10" />
      </div>

      {/* Content Section */}
      <CardHeader className="p-6 pb-0">
        {/* Date and Time Placeholder */}
        <div className="flex items-center gap-4 mb-3">
          <Skeleton className="h-4 w-28" />
          <Skeleton className="h-4 w-20" />
        </div>

        {/* Title Placeholder - 2 lines */}
        <div className="space-y-2 mb-3">
          <Skeleton className="h-6 w-full" />
          <Skeleton className="h-6 w-3/4" />
        </div>

        {/* Description Placeholder - 2 lines */}
        <div className="space-y-2 mb-4">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
        </div>

        {/* Meta Information Placeholder */}
        <div className="flex flex-wrap gap-3 mb-4">
          <Skeleton className="h-4 w-12" />
          <Skeleton className="h-4 w-24" />
        </div>

        {/* Dynamic Tags Placeholder */}
        <div className="flex flex-wrap gap-2 mb-6">
          <Skeleton className="h-5 w-20" />
          <Skeleton className="h-5 w-16" />
        </div>

        {/* Attendee Progress Placeholder */}
        <div className="space-y-2 mb-6">
          <div className="flex justify-between">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-4 w-12" />
          </div>
          <Skeleton className="h-2 w-full rounded-full" />
        </div>
      </CardHeader>

      {/* Footer - Action Buttons Placeholder */}
      <CardFooter className="p-6 pt-0 flex gap-3">
        <Skeleton className="flex-1 h-12 rounded-xl" />
        <Skeleton className="flex-1 h-12 rounded-xl" />
      </CardFooter>
    </Card>
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {skeletons.map((index) => (
          <EventCardSkeleton key={`event-skeleton-${index}`} />
        ))}
      </div>
      <span className="sr-only">Loading events, please wait...</span>
    </div>
  );
}

EventCardSkeletonLoader.displayName = 'EventCardSkeletonLoader';
