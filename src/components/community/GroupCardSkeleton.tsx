"use client";

import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

interface GroupCardSkeletonProps {
  className?: string;
}

/**
 * GroupCardSkeleton Component
 * Feature: community-discussion-rooms
 * Requirements: 2.1, 2.2
 * 
 * Loading skeleton for group cards.
 * Matches the structure of GroupCard for smooth loading transitions.
 */
export function GroupCardSkeleton({ className }: GroupCardSkeletonProps) {
  return (
    <Card
      className={cn(
        "border-border/50 bg-card/50 backdrop-blur-sm",
        className
      )}
      aria-busy="true"
      aria-label="Loading group information"
    >
      <CardHeader className="pb-3">
        {/* Image Skeleton */}
        <Skeleton className="w-full h-32 mb-3 rounded-lg" />

        {/* Title and Badge Skeleton */}
        <div className="flex items-start justify-between gap-2">
          <Skeleton className="h-6 flex-1" />
          <Skeleton className="h-5 w-16 shrink-0" />
        </div>
      </CardHeader>

      <CardContent className="pb-3">
        {/* Description Skeleton */}
        <div className="space-y-2 mb-3">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
        </div>

        {/* Stats Skeleton */}
        <div className="flex items-center gap-4">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-4 w-16" />
        </div>
      </CardContent>

      <CardFooter className="pt-3 border-t border-border/50">
        {/* Button Skeleton */}
        <Skeleton className="h-10 w-full" />
      </CardFooter>
    </Card>
  );
}

interface GroupCardSkeletonLoaderProps {
  count?: number;
  className?: string;
}

/**
 * GroupCardSkeletonLoader Component
 * 
 * Renders multiple group card skeletons in a grid layout.
 */
export function GroupCardSkeletonLoader({ 
  count = 6, 
  className 
}: GroupCardSkeletonLoaderProps) {
  return (
    <div className={cn("w-full", className)}>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: count }).map((_, index) => (
          <GroupCardSkeleton key={index} />
        ))}
      </div>
    </div>
  );
}
