/**
 * SkeletonLoader Component
 * Feature: project-page-ui-improvements
 * 
 * Loading placeholder matching ProjectCard layout with shimmer animation.
 * 
 * Requirements:
 * - 7.1: Display skeleton loaders matching ProjectCard layout
 * - 7.2: Shimmer animation with CSS
 * - 7.3: Respect prefers-reduced-motion
 * 
 * Accessibility:
 * - aria-busy="true" on container
 * - aria-hidden="true" on individual skeletons
 * - aria-live="polite" for status updates
 */

'use client';

import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

export interface SkeletonLoaderProps {
  /**
   * Number of skeleton cards to display
   * @default 6
   */
  count?: number;
  
  /**
   * Variant of skeleton layout
   * @default 'card'
   */
  variant?: 'card' | 'list';
  
  /**
   * Additional CSS classes
   */
  className?: string;
}

function SkeletonCard() {
  return (
    <div
      className={cn(
        'p-project-card skeleton-shimmer',
        'pointer-events-none select-none'
      )}
      aria-hidden="true"
    >
      {/* Header: Category badge and Star rating placeholder */}
      <div className="p-project-header">
        <Skeleton className="h-6 w-20 rounded-full" />
        <Skeleton className="h-5 w-12 rounded-md" />
      </div>

      {/* Title & Description */}
      <div className="flex flex-col grow">
        <Skeleton className="h-6 w-3/4 rounded-md mb-2" />
        <div className="space-y-2 mb-5">
          <Skeleton className="h-4 w-full rounded-md" />
          <Skeleton className="h-4 w-5/6 rounded-md" />
        </div>
      </div>

      {/* Tech Stack Tags */}
      <div className="p-project-tags">
        <Skeleton className="h-6 w-16 rounded-full" />
        <Skeleton className="h-6 w-20 rounded-full" />
        <Skeleton className="h-6 w-14 rounded-full" />
        <Skeleton className="h-6 w-18 rounded-full" />
      </div>

      {/* Footer: Avatars & CTA Actions */}
      <div className="p-project-footer">
        {/* Team Avatars / Owner name */}
        <div className="flex items-center gap-1">
          <Skeleton className="h-7 w-20 rounded-full" />
        </div>

        {/* Buttons / Actions */}
        <div className="flex items-center gap-2">
          <Skeleton className="h-8 w-8 rounded-lg" />
          <Skeleton className="h-8 w-8 rounded-lg" />
          <Skeleton className="h-8 w-24 rounded-full" />
        </div>
      </div>
    </div>
  );
}

/**
 * SkeletonLoader Component
 * 
 * Displays loading placeholders matching the ProjectCard layout.
 * Includes shimmer animation that respects prefers-reduced-motion.
 */
export function SkeletonLoader({
  count = 6,
  variant = 'card',
  className,
}: SkeletonLoaderProps) {
  // Generate array of skeleton cards
  const skeletons = Array.from({ length: count }, (_, i) => i);

  return (
    <div
      className={cn('w-full', className)}
      role="status"
      aria-busy="true"
      aria-live="polite"
      aria-label="Loading projects"
    >
      {variant === 'card' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {skeletons.map((index) => (
            <SkeletonCard key={`skeleton-${index}`} />
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          {skeletons.map((index) => (
            <SkeletonCard key={`skeleton-${index}`} />
          ))}
        </div>
      )}
      <span className="sr-only">Loading projects, please wait...</span>
    </div>
  );
}

SkeletonLoader.displayName = 'SkeletonLoader';
