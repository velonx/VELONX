/**
 * GroupCardSkeleton Component
 * Loading skeleton for group cards.
 * 
 * Re-routed to use Boneyard GroupCardBoneSkeleton internally, preserving original API.
 */

'use client';

import { GroupCardBoneSkeleton, BoneyardLoader } from '@/components/boneyard';

interface GroupCardSkeletonProps {
  className?: string;
}

export function GroupCardSkeleton({ className }: GroupCardSkeletonProps) {
  return <GroupCardBoneSkeleton className={className} />;
}

interface GroupCardSkeletonLoaderProps {
  count?: number;
  className?: string;
}

export function GroupCardSkeletonLoader({ 
  count = 6, 
  className 
}: GroupCardSkeletonLoaderProps) {
  return (
    <BoneyardLoader
      skeleton={GroupCardBoneSkeleton}
      count={count}
      columns={3}
      label="Loading group information"
      className={className}
    />
  );
}
