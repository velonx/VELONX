'use client';

import { useState } from 'react';
import { formatDistanceToNow } from '@/lib/utils/date-helpers';
import type { PostComment } from '@/lib/hooks/usePostComments';
import { AvatarImage } from '@/components/responsive-image';
import { Button } from '@/components/ui/button';
import { ChevronUpIcon, ChevronDownIcon, MessageCircleIcon, Loader2Icon } from 'lucide-react';

/**
 * Comment Item Props Interface
 */
export interface CommentItemProps {
  comment: PostComment;
  onReply?: (content: string, parentId?: string) => Promise<PostComment | null>;
  depth?: number;
}

/**
 * CommentItem Component
 *
 * Displays an individual comment with author info, voting, reply functionality,
 * and recursive rendering of nested replies (threaded view).
 */
export function CommentItem({ comment, onReply, depth = 0 }: CommentItemProps) {
  const [showReplyInput, setShowReplyInput] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [localScore, setLocalScore] = useState(
    (comment.upvotes || 0) - (comment.downvotes || 0)
  );

  const maxDepth = 3; // Limit nested depth for readability

  const handleReplySubmit = async () => {
    if (!onReply || !replyText.trim()) return;

    setIsSubmitting(true);
    try {
      await onReply(replyText.trim(), comment.id);
      setReplyText('');
      setShowReplyInput(false);
    } catch {
      // Error is handled in the hook
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVote = (direction: 'up' | 'down') => {
    setLocalScore(prev => direction === 'up' ? prev + 1 : prev - 1);
    // In a full implementation, this would call a comment vote API
  };

  const authorInitial = (comment.author.name || comment.author.email || 'U').charAt(0).toUpperCase();

  return (
    <div
      className={`relative ${depth > 0 ? 'ml-6 sm:ml-10' : ''}`}
      style={{ paddingTop: depth > 0 ? '0' : '12px' }}
    >
      {/* Thread line for nested comments */}
      {depth > 0 && (
        <div className="absolute left-[-20px] sm:left-[-28px] top-0 bottom-0 w-px bg-border/40 z-0" />
      )}

      <div className="flex gap-3 relative z-10 py-2">
        {/* Author Avatar */}
        <div className="size-7 rounded-full bg-primary/10 flex items-center justify-center shrink-0 overflow-hidden mt-0.5">
          {comment.author.image ? (
            <AvatarImage
              src={comment.author.image}
              alt={comment.author.name || 'User'}
              size={28}
            />
          ) : (
            <span className="text-[10px] font-medium text-primary">
              {authorInitial}
            </span>
          )}
        </div>

        {/* Comment Body */}
        <div className="flex-1 min-w-0">
          {/* Meta line */}
          <div className="flex items-center gap-1.5 text-xs mb-1">
            <span className="font-semibold text-foreground">
              {comment.author.name || comment.author.email || 'Anonymous'}
            </span>
            <span className="text-muted-foreground">•</span>
            <time
              dateTime={new Date(comment.createdAt).toISOString()}
              className="text-muted-foreground"
            >
              {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
            </time>
          </div>

          {/* Content */}
          <p className="text-sm text-foreground/90 whitespace-pre-wrap break-words leading-relaxed mb-1.5">
            {comment.content}
          </p>

          {/* Action bar */}
          <div className="flex items-center gap-1 -ml-1.5">
            {/* Vote controls (inline) */}
            <Button
              variant="ghost"
              size="icon"
              className="size-6 rounded-full text-muted-foreground hover:text-primary"
              onClick={() => handleVote('up')}
              aria-label="Upvote comment"
            >
              <ChevronUpIcon className="size-3.5" />
            </Button>
            <span className="text-xs font-semibold min-w-[20px] text-center">
              {localScore}
            </span>
            <Button
              variant="ghost"
              size="icon"
              className="size-6 rounded-full text-muted-foreground hover:text-destructive"
              onClick={() => handleVote('down')}
              aria-label="Downvote comment"
            >
              <ChevronDownIcon className="size-3.5" />
            </Button>

            {/* Reply toggle */}
            {depth < maxDepth && onReply && (
              <Button
                variant="ghost"
                size="sm"
                className="h-6 px-2 text-xs text-muted-foreground hover:text-foreground gap-1 ml-1"
                onClick={() => setShowReplyInput(!showReplyInput)}
              >
                <MessageCircleIcon className="size-3" />
                Reply
              </Button>
            )}
          </div>

          {/* Reply input */}
          {showReplyInput && (
            <div className="mt-3 space-y-2">
              <textarea
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                placeholder="Write a reply..."
                className="w-full min-h-[60px] px-3 py-2 text-sm border border-border/50 bg-muted/20 rounded-lg resize-none focus:outline-none focus:ring-1 focus:ring-ring focus:bg-background transition-all"
                disabled={isSubmitting}
                autoFocus
              />
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  className="rounded-full px-4 h-7 text-xs font-semibold"
                  onClick={handleReplySubmit}
                  disabled={!replyText.trim() || isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2Icon className="animate-spin size-3 mr-1" />
                      Posting...
                    </>
                  ) : (
                    'Reply'
                  )}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="rounded-full px-4 h-7 text-xs"
                  onClick={() => {
                    setShowReplyInput(false);
                    setReplyText('');
                  }}
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}

          {/* Nested Replies */}
          {comment.replies && comment.replies.length > 0 && (
            <div className="mt-2">
              {comment.replies.map((reply) => (
                <CommentItem
                  key={reply.id}
                  comment={reply}
                  onReply={onReply}
                  depth={depth + 1}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
