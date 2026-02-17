'use client';

import { Card, CardHeader, CardContent, CardFooter } from '@/components/ui/card';

/**
 * Feed Skeleton Props Interface
 */
export interface FeedSkeletonProps {
  count?: number;
}

/**
 * FeedSkeleton Component
 * 
 * Loading skeleton for the community feed.
 * 
 * Features:
 * - Mimics the structure of PostCard
 * - Animated shimmer effect
 * - Configurable number of skeletons
 * - Accessibility support
 * 
 * @example
 * ```tsx
 * <FeedSkeleton count={3} />
 * ```
 */
export function FeedSkeleton({ count = 3 }: FeedSkeletonProps) {
  return (
    <div className="space-y-4" role="status" aria-label="Loading posts">
      {Array.from({ length: count }).map((_, index) => (
        <Card key={index} className="w-full">
          {/* Header */}
          <CardHeader className="pb-3">
            <div className="flex items-start gap-3">
              {/* Avatar Skeleton */}
              <div className="size-10 rounded-full bg-muted animate-pulse shrink-0" />

              {/* Author Info Skeleton */}
              <div className="flex-1 space-y-2">
                <div className="h-4 w-32 bg-muted animate-pulse rounded" />
                <div className="h-3 w-24 bg-muted animate-pulse rounded" />
              </div>
            </div>
          </CardHeader>

          {/* Content */}
          <CardContent className="space-y-3">
            {/* Text Lines */}
            <div className="space-y-2">
              <div className="h-4 w-full bg-muted animate-pulse rounded" />
              <div className="h-4 w-5/6 bg-muted animate-pulse rounded" />
              <div className="h-4 w-4/6 bg-muted animate-pulse rounded" />
            </div>

            {/* Image Skeleton (optional, alternating) */}
            {index % 2 === 0 && (
              <div className="aspect-video w-full bg-muted animate-pulse rounded-md" />
            )}
          </CardContent>

          {/* Footer */}
          <CardFooter className="flex-col gap-3 pt-0">
            {/* Stats */}
            <div className="flex items-center justify-between w-full">
              <div className="h-3 w-20 bg-muted animate-pulse rounded" />
              <div className="h-3 w-20 bg-muted animate-pulse rounded" />
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2 w-full border-t pt-3">
              <div className="h-8 flex-1 bg-muted animate-pulse rounded" />
              <div className="h-8 flex-1 bg-muted animate-pulse rounded" />
            </div>
          </CardFooter>
        </Card>
      ))}
      <span className="sr-only">Loading posts...</span>
    </div>
  );
}
