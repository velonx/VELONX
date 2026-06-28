/**
 * EventCardSkeleton Component
 * Feature: events-page-ui-improvements
 * 
 * Re-routed to use Boneyard EventCardBoneSkeleton internally, preserving original API.
 */

'use client';

import { EventCardBoneSkeleton, BoneyardLoader } from '@/components/boneyard';

export interface EventCardSkeletonProps {
  className?: string;
}

export function EventCardSkeleton({ className }: EventCardSkeletonProps) {
  return <EventCardBoneSkeleton className={className} />;
}

EventCardSkeleton.displayName = 'EventCardSkeleton';

export interface EventCardSkeletonLoaderProps {
  count?: number;
  className?: string;
}

export function EventCardSkeletonLoader({
  count = 6,
  className,
}: EventCardSkeletonLoaderProps) {
  return (
    <BoneyardLoader
      skeleton={EventCardBoneSkeleton}
      count={count}
      columns={3}
      label="Loading events"
      className={className}
      gridClassName="events-grid"
    />
  );
}

EventCardSkeletonLoader.displayName = 'EventCardSkeletonLoader';
