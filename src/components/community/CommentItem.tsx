'use client';

import { formatDistanceToNow } from '@/lib/utils/date-helpers';
import type { PostComment } from '@/lib/hooks/usePostComments';

/**
 * Comment Item Props Interface
 */
export interface CommentItemProps {
  comment: PostComment;
}

/**
 * CommentItem Component
 * 
 * Displays an individual comment with author information and timestamp.
 * 
 * Features:
 * - Author avatar and name
 * - Comment content
 * - Relative timestamp
 * - Accessibility support
 * 
 * @example
 * ```tsx
 * <CommentItem comment={commentData} />
 * ```
 */
export function CommentItem({ comment }: CommentItemProps) {
  return (
    <div className="flex gap-3">
      {/* Author Avatar */}
      <div className="size-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
        {comment.author.image ? (
          <img
            src={comment.author.image}
            alt={comment.author.name || 'User'}
            className="size-8 rounded-full object-cover"
          />
        ) : (
          <span className="text-xs font-medium text-primary">
            {(comment.author.name || comment.author.email).charAt(0).toUpperCase()}
          </span>
        )}
      </div>

      {/* Comment Content */}
      <div className="flex-1 min-w-0">
        <div className="bg-muted rounded-lg px-3 py-2">
          <div className="flex items-center gap-2 mb-1">
            <span className="font-semibold text-sm">
              {comment.author.name || comment.author.email}
            </span>
            <time
              dateTime={comment.createdAt.toISOString()}
              className="text-xs text-muted-foreground"
            >
              {formatDistanceToNow(comment.createdAt, { addSuffix: true })}
            </time>
          </div>
          <p className="text-sm whitespace-pre-wrap break-words">
            {comment.content}
          </p>
        </div>
      </div>
    </div>
  );
}
