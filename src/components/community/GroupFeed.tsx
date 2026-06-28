"use client";

import { CommunityPostData } from "@/lib/types/community.types";
import { Button } from "@/components/ui/button";
import { BoneyardLoader, FeedPostBoneSkeleton } from "@/components/boneyard";
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
      <BoneyardLoader
        skeleton={FeedPostBoneSkeleton}
        count={3}
        layout="list"
        label="Loading feed posts"
        className={className}
      />
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
