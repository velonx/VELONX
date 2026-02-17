'use client';

import { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { TrendingUpIcon, Loader2Icon } from 'lucide-react';
import { formatDistanceToNow } from '@/lib/utils/date-helpers';
import type { CommunityPostData } from '@/lib/types/community.types';

/**
 * Trending Posts Props Interface
 */
export interface TrendingPostsProps {
  limit?: number;
  className?: string;
}

/**
 * TrendingPosts Component
 * 
 * Sidebar widget displaying trending posts based on engagement.
 * 
 * Features:
 * - Fetch trending posts from API
 * - Display post preview with author and engagement metrics
 * - Click to navigate to full post
 * - Loading and error states
 * - Accessibility support
 * 
 * @example
 * ```tsx
 * <TrendingPosts limit={5} />
 * ```
 */
export function TrendingPosts({ limit = 5, className }: TrendingPostsProps) {
  const [posts, setPosts] = useState<CommunityPostData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  /**
   * Fetch trending posts
   */
  useEffect(() => {
    const fetchTrendingPosts = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch(`/api/community/feed/trending?limit=${limit}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch trending posts');
        }

        const data = await response.json();
        setPosts(data.data || []);
      } catch (err) {
        console.error('[TrendingPosts] Fetch error:', err);
        setError(err instanceof Error ? err.message : 'Failed to load trending posts');
      } finally {
        setIsLoading(false);
      }
    };

    fetchTrendingPosts();
  }, [limit]);

  /**
   * Truncate text to specified length
   */
  const truncateText = (text: string, maxLength: number) => {
    if (text.length <= maxLength) return text;
    return text.slice(0, maxLength).trim() + '...';
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <TrendingUpIcon className="size-5" />
          Trending Posts
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center py-8">
            <Loader2Icon className="size-6 animate-spin text-muted-foreground" />
          </div>
        ) : error ? (
          <div className="text-center py-8 text-sm text-muted-foreground">
            {error}
          </div>
        ) : posts.length === 0 ? (
          <div className="text-center py-8 text-sm text-muted-foreground">
            No trending posts yet
          </div>
        ) : (
          <div className="space-y-4">
            {posts.map((post, index) => (
              <div
                key={post.id}
                className="group cursor-pointer"
                onClick={() => {
                  // Navigate to post detail (implement based on routing)
                  console.log('Navigate to post:', post.id);
                }}
              >
                <div className="flex gap-3">
                  {/* Rank Badge */}
                  <div className="flex items-center justify-center size-6 rounded-full bg-primary/10 text-primary text-xs font-bold shrink-0">
                    {index + 1}
                  </div>

                  {/* Post Preview */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium line-clamp-2 group-hover:text-primary transition-colors">
                      {truncateText(post.content, 100)}
                    </p>
                    
                    <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                      <span className="truncate">{post.authorName}</span>
                      <span>•</span>
                      <time dateTime={post.createdAt.toISOString()}>
                        {formatDistanceToNow(post.createdAt, { addSuffix: true })}
                      </time>
                    </div>

                    <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                      <span>{post.reactionCount} reactions</span>
                      <span>•</span>
                      <span>{post.commentCount} comments</span>
                    </div>
                  </div>
                </div>

                {/* Divider (except for last item) */}
                {index < posts.length - 1 && (
                  <div className="mt-4 border-t" />
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
