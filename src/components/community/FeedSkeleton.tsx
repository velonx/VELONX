/**
 * FeedSkeleton Component
 * Loading skeleton for the community feed.
 * 
 * Re-routed to use Boneyard FeedPostBoneSkeleton internally, preserving original API.
 */

'use client';

import { FeedPostBoneSkeleton, BoneyardLoader } from '@/components/boneyard';

export interface FeedSkeletonProps {
  count?: number;
}

export function FeedSkeleton({ count = 3 }: FeedSkeletonProps) {
  const items = Array.from({ length: count }, (_, i) => i);
  return (
    <div className="space-y-4" role="status" aria-label="Loading posts">
      {items.map((index) => (
        <FeedPostBoneSkeleton key={index} showImage={index % 2 === 0} />
      ))}
      <span className="sr-only">Loading posts...</span>
    </div>
  );
}
