'use client';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  MessageSquareIcon,
  UsersIcon,
  FileTextIcon,
  UserIcon,
} from 'lucide-react';

/**
 * Search Filter Type
 */
export type SearchFilterType = 'all' | 'rooms' | 'groups' | 'posts' | 'users';

/**
 * Search Filters Props Interface
 */
export interface SearchFiltersProps {
  activeFilter: SearchFilterType;
  onFilterChange: (filter: SearchFilterType) => void;
  counts?: {
    rooms: number;
    groups: number;
    posts: number;
    users: number;
  };
  className?: string;
}

/**
 * Filter Configuration
 */
const FILTERS: Array<{
  type: SearchFilterType;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}> = [
  { type: 'all', label: 'All', icon: FileTextIcon },
  { type: 'rooms', label: 'Rooms', icon: MessageSquareIcon },
  { type: 'groups', label: 'Groups', icon: UsersIcon },
  { type: 'posts', label: 'Posts', icon: FileTextIcon },
  { type: 'users', label: 'Users', icon: UserIcon },
];

/**
 * SearchFilters Component
 * 
 * Filter buttons for search results by content type.
 * 
 * Features:
 * - Filter by type (all, rooms, groups, posts, users)
 * - Result counts per filter
 * - Active filter indication
 * - Keyboard navigation
 * - Accessibility support
 * 
 * @example
 * ```tsx
 * <SearchFilters
 *   activeFilter="all"
 *   onFilterChange={(filter) => console.log('Filter:', filter)}
 *   counts={{ rooms: 5, groups: 3, posts: 12, users: 8 }}
 * />
 * ```
 */
export function SearchFilters({
  activeFilter,
  onFilterChange,
  counts,
  className,
}: SearchFiltersProps) {
  /**
   * Get count for a filter type
   */
  const getCount = (type: SearchFilterType): number | undefined => {
    if (!counts || type === 'all') return undefined;
    return counts[type as keyof typeof counts];
  };

  /**
   * Get total count for 'all' filter
   */
  const getTotalCount = (): number | undefined => {
    if (!counts) return undefined;
    return counts.rooms + counts.groups + counts.posts + counts.users;
  };

  return (
    <div
      className={`flex items-center gap-2 overflow-x-auto pb-2 ${className}`}
      role="tablist"
      aria-label="Search result filters"
    >
      {FILTERS.map((filter) => {
        const Icon = filter.icon;
        const count = filter.type === 'all' ? getTotalCount() : getCount(filter.type);
        const isActive = activeFilter === filter.type;

        return (
          <Button
            key={filter.type}
            variant={isActive ? 'default' : 'outline'}
            size="sm"
            onClick={() => onFilterChange(filter.type)}
            className="shrink-0 gap-2"
            role="tab"
            aria-selected={isActive}
            aria-controls={`search-results-${filter.type}`}
          >
            <Icon className="size-4" />
            <span>{filter.label}</span>
            {count !== undefined && (
              <Badge
                variant={isActive ? 'secondary' : 'outline'}
                className="ml-1 px-1.5 py-0 text-xs"
              >
                {count}
              </Badge>
            )}
          </Button>
        );
      })}
    </div>
  );
}
