/**
 * SkeletonLoader Component
 * Loading placeholder matching ProjectCard layout.
 * 
 * Re-routed to use Boneyard ProjectCardBoneSkeleton internally, preserving original API.
 */

'use client';

import { ProjectCardBoneSkeleton, BoneyardLoader } from '@/components/boneyard';

export interface SkeletonLoaderProps {
  count?: number;
  variant?: 'card' | 'list';
  className?: string;
}

export function SkeletonLoader({
  count = 6,
  variant = 'card',
  className,
}: SkeletonLoaderProps) {
  return (
    <BoneyardLoader
      skeleton={ProjectCardBoneSkeleton}
      count={count}
      columns={3}
      layout={variant === 'list' ? 'list' : 'grid'}
      label="Loading projects"
      className={className}
    />
  );
}

SkeletonLoader.displayName = 'SkeletonLoader';
