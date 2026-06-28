/**
 * BoneyardLoader — a generic, accessible grid/list skeleton loader.
 *
 * Replaces every `Array.from({ length: N }).map(…)` pattern with a
 * single declarative component.
 *
 * @example
 * <BoneyardLoader skeleton={MentorCardSkeleton} count={4} columns={4} />
 * <BoneyardLoader skeleton={LeaderboardRowSkeleton} count={10} layout="list" />
 */

'use client';

import { cn } from '@/lib/utils';
import type { ComponentType } from 'react';

export interface BoneyardLoaderProps {
  /** The skeleton component to render */
  skeleton: ComponentType<{ className?: string }>;
  /** Number of skeleton items to render @default 6 */
  count?: number;
  /** Grid columns (ignored when layout="list") @default 3 */
  columns?: 1 | 2 | 3 | 4;
  /** Layout mode @default "grid" */
  layout?: 'grid' | 'list';
  /** Accessible loading label @default "Loading content" */
  label?: string;
  /** Additional CSS classes for the outer wrapper */
  className?: string;
  /** Additional CSS classes for the inner grid/list container */
  gridClassName?: string;
  /** Gap class @default "gap-6" */
  gap?: string;
}

const colClasses: Record<number, string> = {
  1: 'grid-cols-1',
  2: 'grid-cols-1 md:grid-cols-2',
  3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
  4: 'grid-cols-1 sm:grid-cols-2 md:grid-cols-4',
};

export function BoneyardLoader({
  skeleton: SkeletonComponent,
  count = 6,
  columns = 3,
  layout = 'grid',
  label = 'Loading content',
  className,
  gridClassName,
  gap = 'gap-6',
}: BoneyardLoaderProps) {
  const items = Array.from({ length: count }, (_, i) => i);

  return (
    <div
      className={cn('w-full', className)}
      role="status"
      aria-busy="true"
      aria-live="polite"
      aria-label={label}
    >
      <div
        className={cn(
          layout === 'grid'
            ? `grid ${colClasses[columns] || colClasses[3]} ${gap}`
            : 'space-y-4',
          gridClassName,
        )}
      >
        {items.map((index) => (
          <SkeletonComponent key={`boneyard-${index}`} />
        ))}
      </div>
      <span className="sr-only">{label}, please wait...</span>
    </div>
  );
}

BoneyardLoader.displayName = 'BoneyardLoader';
