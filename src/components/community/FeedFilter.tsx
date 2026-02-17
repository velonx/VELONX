'use client';

import { Button } from '@/components/ui/button';
import { GlobeIcon, UsersIcon, UserIcon } from 'lucide-react';
import type { FeedFilter as FeedFilterType } from '@/lib/hooks/useFeed';
import { cn } from '@/lib/utils';

/**
 * Feed Filter Props Interface
 */
export interface FeedFilterProps {
  currentFilter: FeedFilterType;
  onFilterChange: (filter: FeedFilterType) => void;
  className?: string;
}

/**
 * Filter Options
 */
const FILTER_OPTIONS: {
  value: FeedFilterType;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
}[] = [
  {
    value: 'ALL',
    label: 'All Posts',
    icon: GlobeIcon,
    description: 'See all public posts',
  },
  {
    value: 'FOLLOWING',
    label: 'Following',
    icon: UserIcon,
    description: 'Posts from people you follow',
  },
  {
    value: 'GROUPS',
    label: 'Groups',
    icon: UsersIcon,
    description: 'Posts from your groups',
  },
];

/**
 * FeedFilter Component
 * 
 * Filter buttons for the community feed.
 * 
 * Features:
 * - Filter by ALL, FOLLOWING, or GROUPS
 * - Visual feedback for active filter
 * - Responsive design (tabs on desktop, dropdown on mobile)
 * - Accessibility support
 * 
 * @example
 * ```tsx
 * <FeedFilter
 *   currentFilter="FOLLOWING"
 *   onFilterChange={setFilter}
 * />
 * ```
 */
export function FeedFilter({
  currentFilter,
  onFilterChange,
  className,
}: FeedFilterProps) {
  return (
    <div className={cn('flex flex-col sm:flex-row gap-2', className)}>
      {/* Desktop: Tabs */}
      <div className="hidden sm:flex gap-1 p-1 bg-muted rounded-lg">
        {FILTER_OPTIONS.map(({ value, label, icon: Icon }) => (
          <button
            key={value}
            onClick={() => onFilterChange(value)}
            className={cn(
              'flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors',
              currentFilter === value
                ? 'bg-background text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            )}
            aria-label={label}
            aria-pressed={currentFilter === value}
          >
            <Icon className="size-4" />
            {label}
          </button>
        ))}
      </div>

      {/* Mobile: Buttons */}
      <div className="flex sm:hidden gap-2">
        {FILTER_OPTIONS.map(({ value, label, icon: Icon, description }) => (
          <Button
            key={value}
            variant={currentFilter === value ? 'default' : 'outline'}
            size="sm"
            onClick={() => onFilterChange(value)}
            className="flex-1"
            aria-label={description}
            aria-pressed={currentFilter === value}
          >
            <Icon className="size-4" />
            <span className="hidden xs:inline">{label}</span>
          </Button>
        ))}
      </div>
    </div>
  );
}
