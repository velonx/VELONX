/**
 * LoadingState Component
 * Loading placeholder matching ResourceCard layout.
 * 
 * Re-routed to use Boneyard ResourceCardBoneSkeleton internally, preserving original API.
 */

'use client';

import { ResourceCardBoneSkeleton, BoneyardLoader } from '@/components/boneyard';

export interface LoadingStateProps {
  count?: number;
  className?: string;
}

export function LoadingState({
  count = 12,
  className,
}: LoadingStateProps) {
  return (
    <BoneyardLoader
      skeleton={ResourceCardBoneSkeleton}
      count={count}
      columns={4}
      label="Loading resources"
      className={className}
      gridClassName="grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
    />
  );
}

LoadingState.displayName = 'LoadingState';
