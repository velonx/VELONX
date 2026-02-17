"use client";

import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

interface RoomCardSkeletonProps {
  className?: string;
}

/**
 * RoomCardSkeleton Component
 * Feature: community-discussion-rooms
 * Requirements: 1.1, 1.4
 * 
 * Loading placeholder matching RoomCard layout with shimmer animation.
 */
export function RoomCardSkeleton({ className }: RoomCardSkeletonProps) {
  return (
    <Card
      className={cn(
        "bg-card border border-border rounded-[24px] overflow-hidden shadow-lg",
        className
      )}
      aria-hidden="true"
    >
      {/* Header Section Placeholder */}
      <div className="h-24 sm:h-32 bg-gradient-to-br from-gray-700 to-gray-800 relative flex items-center justify-center">
        {/* Privacy Badge Placeholder */}
        <div className="absolute top-1.5 sm:top-2 left-1.5 sm:left-2">
          <Skeleton className="h-5 w-16 bg-white/10" />
        </div>

        {/* Activity Badge Placeholder */}
        <div className="absolute top-1.5 sm:top-2 right-1.5 sm:right-2">
          <Skeleton className="h-5 w-20 bg-white/10" />
        </div>

        {/* Icon Placeholder */}
        <Skeleton className="h-12 w-12 rounded-full bg-white/10" />
      </div>

      {/* Content Section */}
      <CardHeader className="p-3 sm:p-4 pb-0">
        {/* Room Name Placeholder - 2 lines */}
        <div className="space-y-2 mb-2">
          <Skeleton className="h-5 w-full" />
          <Skeleton className="h-5 w-3/4" />
        </div>

        {/* Description Placeholder - 3 lines */}
        <div className="space-y-1.5 mb-3">
          <Skeleton className="h-3 w-full" />
          <Skeleton className="h-3 w-full" />
          <Skeleton className="h-3 w-2/3" />
        </div>

        {/* Stats Placeholder */}
        <div className="flex items-center gap-4 mb-3">
          <Skeleton className="h-3 w-20" />
          <Skeleton className="h-3 w-24" />
        </div>

        {/* Created Date Placeholder */}
        <Skeleton className="h-3 w-32" />
      </CardHeader>

      {/* Footer - Action Buttons Placeholder */}
      <CardFooter className="p-3 sm:p-4 pt-3 flex gap-2">
        <Skeleton className="flex-1 h-9 sm:h-10 rounded-lg" />
        <Skeleton className="flex-1 h-9 sm:h-10 rounded-lg" />
      </CardFooter>
    </Card>
  );
}

RoomCardSkeleton.displayName = 'RoomCardSkeleton';

/**
 * RoomCardSkeletonLoader Component
 * 
 * Displays multiple RoomCardSkeleton components in a grid layout.
 */
interface RoomCardSkeletonLoaderProps {
  count?: number;
  className?: string;
}

export function RoomCardSkeletonLoader({
  count = 6,
  className,
}: RoomCardSkeletonLoaderProps) {
  const skeletons = Array.from({ length: count }, (_, i) => i);

  return (
    <div
      className={cn('w-full', className)}
      role="status"
      aria-busy="true"
      aria-live="polite"
      aria-label="Loading discussion rooms"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {skeletons.map((index) => (
          <RoomCardSkeleton key={`room-skeleton-${index}`} />
        ))}
      </div>
      <span className="sr-only">Loading discussion rooms, please wait...</span>
    </div>
  );
}

RoomCardSkeletonLoader.displayName = 'RoomCardSkeletonLoader';
