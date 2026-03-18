'use client';

import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Loader2Icon, MessageCircleIcon, SendIcon } from 'lucide-react';
import { usePostComments } from '@/lib/hooks/usePostComments';
import { CommentItem } from './CommentItem';

export interface CommentSectionProps {
  postId: string;
  limit?: number;
}

/** Skeleton placeholder shown while comments are loading */
function CommentSkeleton() {
  return (
    <div className="space-y-4 py-2 animate-pulse">
      {[1, 2, 3].map((i) => (
        <div key={i} className="flex gap-3">
          <div className="size-8 rounded-full bg-muted/60 shrink-0" />
          <div className="flex-1 space-y-2 pt-1">
            <div className="h-3 w-24 rounded-full bg-muted/60" />
            <div className="h-3 w-full rounded-full bg-muted/40" />
            <div className="h-3 w-3/4 rounded-full bg-muted/40" />
          </div>
        </div>
      ))}
    </div>
  );
}

/**
 * CommentSection Component
 * Displays comments with threaded replies. Input bar at bottom (Reddit-style).
 */
export function CommentSection({ postId, limit = 10 }: CommentSectionProps) {
  const [commentText, setCommentText] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const {
    comments,
    hasMore,
    isLoading,
    error,
    createComment,
    loadMore,
    isCreating,
  } = usePostComments(postId, limit);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedText = commentText.trim();
    if (!trimmedText) return;
    const success = await createComment(trimmedText);
    if (success) {
      setCommentText('');
      textareaRef.current?.focus();
    }
  };

  return (
    <div className="flex flex-col pt-4">
      {/* Comment count header — shown once loaded */}
      {!isLoading && comments.length > 0 && (
        <div className="flex items-center justify-between mb-4">
          <span className="text-sm font-semibold text-foreground">
            {comments.length} Comment{comments.length !== 1 ? 's' : ''}
          </span>
          <span className="text-[11px] text-muted-foreground uppercase tracking-wider font-medium">
            Sort by: <span className="text-primary">Top Voted</span>
          </span>
        </div>
      )}

      {/* Comments List */}
      {isLoading && comments.length === 0 ? (
        <CommentSkeleton />
      ) : error ? (
        <div className="text-center py-6 text-sm text-muted-foreground">
          Failed to load comments. Please try again.
        </div>
      ) : comments.length === 0 ? (
        <div className="text-center py-8 text-sm text-muted-foreground flex flex-col items-center justify-center">
          <MessageCircleIcon className="size-6 text-muted-foreground/40 mb-2" />
          <p>No comments yet</p>
          <p className="text-xs mt-0.5 text-muted-foreground/60">Be the first to share your thoughts!</p>
        </div>
      ) : (
        <div className="space-y-0">
          {comments.map((comment) => (
            <CommentItem
              key={comment.id}
              comment={comment}
              onReply={createComment}
            />
          ))}

          {/* Load More Button */}
          {hasMore && (
            <div className="flex justify-center pt-4 pb-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={loadMore}
                className="text-primary hover:text-primary/80 font-medium text-xs"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2Icon className="animate-spin mr-1.5 size-3" />
                    Loading...
                  </>
                ) : (
                  'View more comments'
                )}
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Comment Input — always visible at the bottom */}
      <form onSubmit={handleSubmit} className="mt-4 pt-4 border-t border-border/30">
        <div className="flex items-start gap-3">
          <textarea
            ref={textareaRef}
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            placeholder="Add to the discussion..."
            rows={1}
            className="flex-1 min-h-[40px] max-h-32 px-4 py-2.5 text-sm border border-border/50 bg-muted/20 rounded-full resize-none focus:outline-none focus:ring-1 focus:ring-ring focus:bg-background focus:rounded-xl focus:min-h-[60px] transition-all"
            disabled={isCreating}
            aria-label="Comment text"
          />
          <Button
            type="submit"
            size="sm"
            className="rounded-full px-5 h-10 font-semibold gap-1.5 shrink-0"
            disabled={!commentText.trim() || isCreating}
          >
            {isCreating ? (
              <Loader2Icon className="animate-spin size-4" />
            ) : (
              <>Send <SendIcon className="size-3.5" /></>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
