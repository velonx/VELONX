/**
 * EventsGrid Component
 * Feature: events-page-ui-improvements
 * Task: 10. Update EventsGrid layout, 26. Optimize EventsPage for mobile
 * 
 * Responsive grid layout for displaying event cards with loading states and smooth transitions.
 * 
 * Requirements:
 * - 6.1: Event cards stack in single column on mobile
 * - 7.1: Skeleton loaders show while events are loading
 * 
 * Features:
 * - Integrates skeleton loaders during loading state
 * - Smooth transitions for card updates
 * - Optimized grid layout for different screen sizes (1/2/3 columns)
 * - Responsive breakpoints: mobile (1 col), tablet (2 cols), desktop (3 cols)
 * - Mobile-optimized spacing (gap-4 on mobile, gap-6 on desktop)
 * - Fade-in animation for loaded cards
 * - Empty state support
 * 
 * Accessibility:
 * - Proper ARIA labels for loading states
 * - Screen reader announcements for content updates
 */

'use client';

import React from 'react';
import { Event } from '@/lib/api/types';
import EventCard from './EventCard';
import { EventCardSkeletonLoader } from './EventCardSkeleton';
import { cn } from '@/lib/utils';

export interface EventsGridProps {
  /**
   * Array of events to display
   */
  events: Event[];
  
  /**
   * Loading state
   */
  isLoading?: boolean;
  
  /**
   * Number of skeleton cards to show during loading
   * @default 6
   */
  skeletonCount?: number;
  
  /**
   * Callback when user clicks "View Details" on an event
   */
  onViewDetails?: (event: Event) => void;
  
  /**
   * Callback when user registers for an event
   */
  onRegister?: (eventId: string) => void;
  
  /**
   * Callback when user unregisters from an event
   */
  onUnregister?: (eventId: string) => void;
  
  /**
   * Function to check if user is registered for an event
   */
  isRegistered?: (eventId: string) => boolean;
  
  /**
   * Empty state component to show when no events
   */
  emptyState?: React.ReactNode;
  
  /**
   * Additional CSS classes
   */
  className?: string;
}

/**
 * EventsGrid Component
 * 
 * Displays events in a responsive grid with loading states and smooth transitions.
 * Grid adapts to screen size: 1 column (mobile), 2 columns (tablet), 3 columns (desktop).
 */
export default function EventsGrid({
  events,
  isLoading = false,
  skeletonCount = 6,
  onViewDetails,
  onRegister,
  onUnregister,
  isRegistered,
  emptyState,
  className,
}: EventsGridProps) {
  // Show skeleton loaders during loading
  if (isLoading) {
    return (
      <div className={cn('w-full', className)}>
        <div className="sr-only" role="status" aria-live="polite" aria-atomic="true">
          Loading events...
        </div>
        <EventCardSkeletonLoader count={skeletonCount} />
      </div>
    );
  }

  // Show empty state if no events
  if (!events || events.length === 0) {
    return emptyState ? (
      <div className={cn('w-full', className)}>
        <div className="sr-only" role="status" aria-live="polite" aria-atomic="true">
          No events found
        </div>
        {emptyState}
      </div>
    ) : null;
  }

  return (
    <div
      className={cn('w-full', className)}
      role="region"
      aria-label="Events grid"
    >
      {/* Screen reader announcement for loaded events */}
      <div className="sr-only" role="status" aria-live="polite" aria-atomic="true">
        {events.length} {events.length === 1 ? 'event' : 'events'} loaded
      </div>
      
      {/* Responsive Grid Layout
          - Mobile (<768px): 1 column with optimized spacing
          - Tablet (768px-1024px): 2 columns
          - Desktop (>1024px): 3 columns
      */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 md:gap-6" role="list">
        {events.map((event, index) => (
          <div
            key={event.id}
            role="listitem"
            className={cn(
              // Fade-in animation with stagger
              'animate-fade-in-up opacity-0',
              // Stagger animation based on index (max 8 stagger classes)
              index < 8 && `stagger-${Math.min(index + 1, 8)}`,
              // Smooth transition for updates
              'transition-all duration-300 ease-out'
            )}
            style={{
              // Fallback for indices > 8
              animationDelay: index >= 8 ? `${(index % 8 + 1) * 0.1}s` : undefined,
            }}
          >
            <EventCard
              event={event}
              onViewDetails={onViewDetails}
              onRegister={onRegister}
              onUnregister={onUnregister}
              isRegistered={isRegistered ? isRegistered(event.id) : false}
            />
          </div>
        ))}
      </div>
    </div>
  );
}

EventsGrid.displayName = 'EventsGrid';
