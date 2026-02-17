'use client';

import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Loader2Icon } from 'lucide-react';
import { usePostComments } from '@/lib/hooks/usePostComments';
import { CommentItem } from './CommentItem';

/**
 * Comment Section Props Interface
 */
export interface CommentSectionProps {
  postId: string;
  limit?: number;
}

/**
 * CommentSection Component
 * 
 * Displays and manages comments for a post with pagination.
 * 
 * Features:
 * - Comment list with pagination
 * - Comment input with submit
 * - Load more comments
 * - Optimistic UI updates
 * - Accessibility support
 * 
 * @example
 * ```tsx
 * <CommentSection postId="post-123" />
 * ```
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

  /**
   * Handle comment submission
   */
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

  /**
   * Handle load more
   */
  const handleLoadMore = async () => {
    await loadMore();
  };

  return (
    <div className="space-y-4">
      {/* Comment Input */}
      <form onSubmit={handleSubmit} className="space-y-2">
        <textarea
          ref={textareaRef}
          value={commentText}
          onChange={(e) => setCommentText(e.target.value)}
          placeholder="Write a comment..."
          className="w-full min-h-16 px-3 py-2 text-sm border rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-ring"
          disabled={isCreating}
          aria-label="Comment text"
        />
        <div className="flex justify-end">
          <Button
            type="submit"
            size="sm"
            disabled={!commentText.trim() || isCreating}
          >
            {isCreating ? (
              <>
                <Loader2Icon className="animate-spin" />
                Posting...
              </>
            ) : (
              'Comment'
            )}
          </Button>
        </div>
      </form>

      {/* Comments List */}
      {isLoading && comments.length === 0 ? (
        <div className="flex justify-center py-8">
          <Loader2Icon className="size-6 animate-spin text-muted-foreground" />
        </div>
      ) : error ? (
        <div className="text-center py-8 text-sm text-muted-foreground">
          Failed to load comments. Please try again.
        </div>
      ) : comments.length === 0 ? (
        <div className="text-center py-8 text-sm text-muted-foreground">
          No comments yet. Be the first to comment!
        </div>
      ) : (
        <div className="space-y-3">
          {comments.map((comment) => (
            <CommentItem key={comment.id} comment={comment} />
          ))}

          {/* Load More Button */}
          {hasMore && (
            <div className="flex justify-center pt-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLoadMore}
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2Icon className="animate-spin" />
                    Loading...
                  </>
                ) : (
                  'Load more comments'
                )}
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
