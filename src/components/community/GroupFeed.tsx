"use client";

import { CommunityPostData } from "@/lib/types/community.types";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { MessageSquare, Loader2Icon } from "lucide-react";
import { PostCard } from "./PostCard";
import { cn } from "@/lib/utils";

interface GroupFeedProps {
  posts: CommunityPostData[];
  isLoading?: boolean;
  hasMore?: boolean;
  onLoadMore?: () => void;
  isMember?: boolean;
  currentUserId?: string;
  className?: string;
}

/**
 * GroupFeed Component — Uses PostCard for Reddit-style display
 */
export default function GroupFeed({
  posts,
  isLoading = false,
  hasMore = false,
  onLoadMore,
  isMember = false,
  currentUserId,
  className
}: GroupFeedProps) {
  if (isLoading && posts.length === 0) {
    return (
      <div className={cn("space-y-4", className)}>
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="rounded-xl border border-border/40 bg-card p-5 space-y-3">
            <div className="flex items-center gap-3">
              <Skeleton className="w-10 h-10 rounded-full" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-3 w-24" />
              </div>
            </div>
            <Skeleton className="h-20 w-full rounded-lg" />
            <div className="flex gap-4">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-4 w-20" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (posts.length === 0) {
    return (
      <div className={cn("text-center py-16", className)}>
        <MessageSquare className="w-12 h-12 mx-auto mb-3 text-muted-foreground/40" />
        <h3 className="text-lg font-semibold mb-1 text-foreground">No Posts Yet</h3>
        <p className="text-sm text-muted-foreground">
          {isMember
            ? "Be the first to share something with this group!"
            : "Join this group to see and create posts"
          }
        </p>
      </div>
    );
  }

  return (
    <div className={cn("space-y-4", className)}>
      {posts.map((post) => (
        <PostCard
          key={post.id}
          post={post}
          currentUserId={currentUserId}
        />
      ))}

      {/* Load More */}
      {hasMore && onLoadMore && (
        <div className="flex justify-center pt-4">
          <Button
            onClick={onLoadMore}
            variant="ghost"
            size="sm"
            className="text-primary hover:text-primary/80 font-medium"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2Icon className="animate-spin mr-1.5 size-3" />
                Loading...
              </>
            ) : (
              "View more posts"
            )}
          </Button>
        </div>
      )}
    </div>
  );
}
