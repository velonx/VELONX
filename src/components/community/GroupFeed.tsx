"use client";

import { CommunityPostData } from "@/lib/types/community.types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { MessageSquare, Plus } from "lucide-react";
import { cn } from "@/lib/utils";

interface GroupFeedProps {
  posts: CommunityPostData[];
  isLoading?: boolean;
  hasMore?: boolean;
  onLoadMore?: () => void;
  onCreatePost?: () => void;
  isMember?: boolean;
  className?: string;
}

/**
 * GroupFeed Component
 * Feature: community-discussion-rooms
 * Requirements: 2.3, 4.4
 * 
 * Displays group-specific posts in a feed format.
 * This is a simplified version - full post rendering will be implemented in Task 25.
 */
export default function GroupFeed({
  posts,
  isLoading = false,
  hasMore = false,
  onLoadMore,
  onCreatePost,
  isMember = false,
  className
}: GroupFeedProps) {
  if (isLoading && posts.length === 0) {
    return (
      <Card className={cn("border-border/50 bg-card/50 backdrop-blur-sm", className)}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5" aria-hidden="true" />
            Group Feed
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="space-y-3 p-4 rounded-lg border border-border/50">
                <div className="flex items-center gap-3">
                  <Skeleton className="w-10 h-10 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-3 w-24" />
                  </div>
                </div>
                <Skeleton className="h-20 w-full" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn("border-border/50 bg-card/50 backdrop-blur-sm", className)}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5" aria-hidden="true" />
            Group Feed
          </CardTitle>
          {isMember && onCreatePost && (
            <Button
              onClick={onCreatePost}
              size="sm"
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:scale-105 text-white font-bold"
            >
              <Plus className="w-4 h-4 mr-2" aria-hidden="true" />
              New Post
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {posts.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <MessageSquare className="w-12 h-12 mx-auto mb-3 opacity-50" aria-hidden="true" />
            <h3 className="text-lg font-semibold mb-2">No Posts Yet</h3>
            <p className="text-sm mb-4">
              {isMember 
                ? "Be the first to share something with this group!"
                : "Join this group to see and create posts"
              }
            </p>
            {isMember && onCreatePost && (
              <Button
                onClick={onCreatePost}
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:scale-105 text-white font-bold"
              >
                <Plus className="w-4 h-4 mr-2" aria-hidden="true" />
                Create First Post
              </Button>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {/* Simplified Post Preview - Full implementation in Task 25 */}
            {posts.map((post) => (
              <div
                key={post.id}
                className="p-4 rounded-lg border border-border/50 bg-muted/30 hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-start gap-3 mb-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold">
                    {post.authorName.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-foreground">{post.authorName}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(post.createdAt).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                </div>
                
                <p className="text-sm text-foreground whitespace-pre-wrap line-clamp-4">
                  {post.content}
                </p>

                {post.imageUrls.length > 0 && (
                  <div className="mt-3 text-xs text-muted-foreground">
                    📷 {post.imageUrls.length} {post.imageUrls.length === 1 ? 'image' : 'images'}
                  </div>
                )}

                <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground">
                  <span>{post.reactionCount} reactions</span>
                  <span>{post.commentCount} comments</span>
                </div>
              </div>
            ))}

            {/* Load More Button */}
            {hasMore && onLoadMore && (
              <Button
                onClick={onLoadMore}
                variant="outline"
                className="w-full"
                disabled={isLoading}
              >
                {isLoading ? "Loading..." : "Load More Posts"}
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
