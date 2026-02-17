'use client';

import { useEffect, useRef, useCallback } from 'react';
import { Loader2Icon } from 'lucide-react';
import { useFeed, type FeedFilter } from '@/lib/hooks/useFeed';
import { PostCard } from './PostCard';
import { FeedSkeleton } from './FeedSkeleton';

/**
 * Feed Props Interface
 */
export interface FeedProps {
  filter?: FeedFilter;
  limit?: number;
  currentUserId?: string;
  onEditPost?: (postId: string, content: string) => Promise<void>;
  onDeletePost?: (postId: string) => Promise<void>;
  onPinPost?: (postId: string) => Promise<void>;
  onUnpinPost?: (postId: string) => Promise<void>;
}

/**
 * Feed Component
 * 
 * Displays a personalized feed of community posts with infinite scroll.
 * 
 * Features:
 * - Infinite scroll with intersection observer
 * - Filter by ALL, FOLLOWING, or GROUPS
 * - Pull-to-refresh on mobile
 * - Loading states and skeletons
 * - Error handling
 * - Accessibility support
 * 
 * @example
 * ```tsx
 * <Feed
 *   filter="FOLLOWING"
 *   currentUserId="user-123"
 *   onEditPost={editPost}
 *   onDeletePost={deletePost}
 * />
 * ```
 */
export function Feed({
  filter: externalFilter,
  limit = 20,
  currentUserId,
  onEditPost,
  onDeletePost,
  onPinPost,
  onUnpinPost,
}: FeedProps) {
  const { items, hasMore, isLoading, error, loadMore, filter, setFilter } = useFeed(limit);
  
  const observerRef = useRef<IntersectionObserver | null>(null);
  const loadMoreRef = useRef<HTMLDivElement>(null);
  const isLoadingMoreRef = useRef(false);

  // Sync external filter with internal filter
  useEffect(() => {
    if (externalFilter && externalFilter !== filter) {
      setFilter(externalFilter);
    }
  }, [externalFilter, filter, setFilter]);

  /**
   * Handle intersection observer callback
   */
  const handleIntersection = useCallback(
    (entries: IntersectionObserverEntry[]) => {
      const [entry] = entries;
      
      if (entry.isIntersecting && hasMore && !isLoading && !isLoadingMoreRef.current) {
        isLoadingMoreRef.current = true;
        loadMore().finally(() => {
          isLoadingMoreRef.current = false;
        });
      }
    },
    [hasMore, isLoading, loadMore]
  );

  /**
   * Set up intersection observer for infinite scroll
   */
  useEffect(() => {
    const currentLoadMoreRef = loadMoreRef.current;
    
    if (!currentLoadMoreRef) return;

    observerRef.current = new IntersectionObserver(handleIntersection, {
      root: null,
      rootMargin: '200px',
      threshold: 0.1,
    });

    observerRef.current.observe(currentLoadMoreRef);

    return () => {
      if (observerRef.current && currentLoadMoreRef) {
        observerRef.current.unobserve(currentLoadMoreRef);
      }
    };
  }, [handleIntersection]);

  /**
   * Pull-to-refresh handler (mobile)
   */
  useEffect(() => {
    let startY = 0;
    let isPulling = false;

    const handleTouchStart = (e: TouchEvent) => {
      if (window.scrollY === 0) {
        startY = e.touches[0].clientY;
        isPulling = true;
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!isPulling) return;

      const currentY = e.touches[0].clientY;
      const pullDistance = currentY - startY;

      if (pullDistance > 100 && window.scrollY === 0) {
        isPulling = false;
        window.location.reload();
      }
    };

    const handleTouchEnd = () => {
      isPulling = false;
    };

    document.addEventListener('touchstart', handleTouchStart);
    document.addEventListener('touchmove', handleTouchMove);
    document.addEventListener('touchend', handleTouchEnd);

    return () => {
      document.removeEventListener('touchstart', handleTouchStart);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleTouchEnd);
    };
  }, []);

  // Initial loading state
  if (isLoading && items.length === 0) {
    return <FeedSkeleton count={3} />;
  }

  // Error state
  if (error && items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 px-4">
        <p className="text-muted-foreground text-center mb-4">
          Failed to load feed. Please try again.
        </p>
        <button
          onClick={() => window.location.reload()}
          className="text-primary hover:underline"
        >
          Refresh
        </button>
      </div>
    );
  }

  // Empty state
  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 px-4">
        <p className="text-muted-foreground text-center">
          {filter === 'FOLLOWING'
            ? 'No posts from people you follow yet. Start following users to see their posts here!'
            : filter === 'GROUPS'
            ? 'No posts from your groups yet. Join groups to see their posts here!'
            : 'No posts yet. Be the first to share something!'}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Feed Items */}
      {items.map((item) => (
        <PostCard
          key={item.post.id}
          post={item.post}
          currentUserId={currentUserId}
          onEdit={onEditPost}
          onDelete={onDeletePost}
          onPin={onPinPost}
          onUnpin={onUnpinPost}
        />
      ))}

      {/* Load More Trigger */}
      <div
        ref={loadMoreRef}
        className="flex justify-center py-4"
        aria-live="polite"
        aria-busy={isLoading}
      >
        {isLoading && (
          <div className="flex items-center gap-2 text-muted-foreground">
            <Loader2Icon className="size-5 animate-spin" />
            <span className="text-sm">Loading more posts...</span>
          </div>
        )}
        {!hasMore && items.length > 0 && (
          <p className="text-sm text-muted-foreground">
            You've reached the end of the feed
          </p>
        )}
      </div>
    </div>
  );
}
