'use client';

import { useState, useEffect, useRef } from 'react';
import { SearchFilters, type SearchFilterType } from './SearchFilters';
import { UserCard } from './UserCard';
import RoomCard from './RoomCard';
import GroupCard from './GroupCard';
import { PostCard } from './PostCard';
import { LoaderIcon, SearchIcon } from 'lucide-react';
import type { SearchResults as SearchResultsData } from '@/lib/hooks/useSearch';

/**
 * Search Results Props Interface
 */
export interface SearchResultsProps {
  results: SearchResultsData;
  isSearching: boolean;
  query: string;
  currentUserId?: string;
  onResultClick?: (type: string, id: string) => void;
  className?: string;
}

/**
 * SearchResults Component
 * 
 * Displays tabbed search results for rooms, groups, posts, and users.
 * 
 * Features:
 * - Tabbed interface with filters
 * - Result counts per category
 * - Loading state
 * - Empty state
 * - Keyboard navigation (arrow keys, Enter to select)
 * - Accessibility support
 * 
 * @example
 * ```tsx
 * <SearchResults
 *   results={searchResults}
 *   isSearching={false}
 *   query="react"
 *   currentUserId="current-user-id"
 *   onResultClick={(type, id) => console.log('Clicked:', type, id)}
 * />
 * ```
 */
export function SearchResults({
  results,
  isSearching,
  query,
  currentUserId,
  onResultClick,
  className,
}: SearchResultsProps) {
  const [activeFilter, setActiveFilter] = useState<SearchFilterType>('all');
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const resultsRef = useRef<HTMLDivElement>(null);

  /**
   * Get filtered results based on active filter
   */
  const getFilteredResults = () => {
    switch (activeFilter) {
      case 'rooms':
        return { rooms: results.rooms, groups: [], posts: [], users: [] };
      case 'groups':
        return { rooms: [], groups: results.groups, posts: [], users: [] };
      case 'posts':
        return { rooms: [], groups: [], posts: results.posts, users: [] };
      case 'users':
        return { rooms: [], groups: [], posts: [], users: results.users };
      default:
        return results;
    }
  };

  const filteredResults = getFilteredResults();
  const hasResults =
    filteredResults.rooms.length > 0 ||
    filteredResults.groups.length > 0 ||
    filteredResults.posts.length > 0 ||
    filteredResults.users.length > 0;

  /**
   * Get all result items as a flat array for keyboard navigation
   */
  const getAllItems = () => {
    const items: Array<{ type: string; id: string }> = [];
    
    filteredResults.rooms.forEach((room) => items.push({ type: 'room', id: room.id }));
    filteredResults.groups.forEach((group) => items.push({ type: 'group', id: group.id }));
    filteredResults.posts.forEach((post) => items.push({ type: 'post', id: post.id }));
    filteredResults.users.forEach((user) => items.push({ type: 'user', id: user.id }));
    
    return items;
  };

  /**
   * Handle keyboard navigation
   */
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const items = getAllItems();
      if (items.length === 0) return;

      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setFocusedIndex((prev) => (prev + 1) % items.length);
          break;
        case 'ArrowUp':
          e.preventDefault();
          setFocusedIndex((prev) => (prev - 1 + items.length) % items.length);
          break;
        case 'Enter':
          if (focusedIndex >= 0 && focusedIndex < items.length) {
            const item = items[focusedIndex];
            onResultClick?.(item.type, item.id);
          }
          break;
        case 'Escape':
          setFocusedIndex(-1);
          break;
      }
    };

    if (resultsRef.current) {
      resultsRef.current.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      if (resultsRef.current) {
        resultsRef.current.removeEventListener('keydown', handleKeyDown);
      }
    };
  }, [focusedIndex, filteredResults, onResultClick]);

  /**
   * Reset focused index when filter changes
   */
  useEffect(() => {
    setFocusedIndex(-1);
  }, [activeFilter]);

  return (
    <div className={className} ref={resultsRef} tabIndex={0}>
      {/* Filters */}
      <SearchFilters
        activeFilter={activeFilter}
        onFilterChange={setActiveFilter}
        counts={{
          rooms: results.rooms.length,
          groups: results.groups.length,
          posts: results.posts.length,
          users: results.users.length,
        }}
        className="mb-4"
      />

      {/* Results */}
      <div
        role="tabpanel"
        id={`search-results-${activeFilter}`}
        aria-labelledby={`filter-${activeFilter}`}
      >
        {isSearching ? (
          <div className="flex items-center justify-center py-12">
            <LoaderIcon className="size-8 animate-spin text-muted-foreground" />
          </div>
        ) : !query ? (
          <div className="text-center py-12">
            <SearchIcon className="size-12 mx-auto text-muted-foreground mb-3" />
            <p className="text-sm text-muted-foreground">
              Enter a search query to find rooms, groups, posts, and users
            </p>
          </div>
        ) : !hasResults ? (
          <div className="text-center py-12">
            <SearchIcon className="size-12 mx-auto text-muted-foreground mb-3" />
            <p className="text-sm text-muted-foreground">
              No results found for &quot;{query}&quot;
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Try different keywords or filters
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Rooms */}
            {filteredResults.rooms.length > 0 && (
              <section aria-labelledby="rooms-heading">
                <h2 id="rooms-heading" className="text-lg font-semibold mb-3">
                  Rooms ({filteredResults.rooms.length})
                </h2>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {filteredResults.rooms.map((room) => (
                    <RoomCard
                      key={room.id}
                      room={room}
                      onViewDetails={() => onResultClick?.('room', room.id)}
                    />
                  ))}
                </div>
              </section>
            )}

            {/* Groups */}
            {filteredResults.groups.length > 0 && (
              <section aria-labelledby="groups-heading">
                <h2 id="groups-heading" className="text-lg font-semibold mb-3">
                  Groups ({filteredResults.groups.length})
                </h2>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {filteredResults.groups.map((group) => (
                    <GroupCard
                      key={group.id}
                      group={group}
                      onViewDetails={() => onResultClick?.('group', group.id)}
                    />
                  ))}
                </div>
              </section>
            )}

            {/* Posts */}
            {filteredResults.posts.length > 0 && (
              <section aria-labelledby="posts-heading">
                <h2 id="posts-heading" className="text-lg font-semibold mb-3">
                  Posts ({filteredResults.posts.length})
                </h2>
                <div className="space-y-4">
                  {filteredResults.posts.map((post) => (
                    <PostCard
                      key={post.id}
                      post={post}
                      currentUserId={currentUserId}
                    />
                  ))}
                </div>
              </section>
            )}

            {/* Users */}
            {filteredResults.users.length > 0 && (
              <section aria-labelledby="users-heading">
                <h2 id="users-heading" className="text-lg font-semibold mb-3">
                  Users ({filteredResults.users.length})
                </h2>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {filteredResults.users.map((user) => (
                    <UserCard
                      key={user.id}
                      user={user}
                      currentUserId={currentUserId}
                      showFollowButton={true}
                      showStats={false}
                      onClick={() => onResultClick?.('user', user.id)}
                    />
                  ))}
                </div>
              </section>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
