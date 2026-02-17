'use client';

import { useState } from 'react';
import { Card, CardHeader, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  MoreVerticalIcon,
  MessageCircleIcon,
  PinIcon,
  EditIcon,
  TrashIcon,
  LinkIcon,
} from 'lucide-react';
import { formatDistanceToNow } from '@/lib/utils/date-helpers';
import type { CommunityPostData } from '@/lib/types/community.types';
import { PostReactions } from './PostReactions';
import { CommentSection } from './CommentSection';

/**
 * Post Card Props Interface
 */
export interface PostCardProps {
  post: CommunityPostData;
  onEdit?: (postId: string, content: string) => Promise<void>;
  onDelete?: (postId: string) => Promise<void>;
  onPin?: (postId: string) => Promise<void>;
  onUnpin?: (postId: string) => Promise<void>;
  currentUserId?: string;
  isModerator?: boolean;
  showComments?: boolean;
}

/**
 * PostCard Component
 * 
 * Displays a community post with reactions, comments, and actions.
 * 
 * Features:
 * - Post content with images and links
 * - Reaction buttons
 * - Comment section (expandable)
 * - Edit/delete actions for post author
 * - Pin/unpin actions for moderators
 * - Accessibility support
 * 
 * @example
 * ```tsx
 * <PostCard
 *   post={postData}
 *   onEdit={editPost}
 *   onDelete={deletePost}
 *   currentUserId="user-123"
 * />
 * ```
 */
export function PostCard({
  post,
  onEdit,
  onDelete,
  onPin,
  onUnpin,
  currentUserId,
  isModerator = false,
  showComments: initialShowComments = false,
}: PostCardProps) {
  const [showComments, setShowComments] = useState(initialShowComments);
  const [showActions, setShowActions] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(post.content);

  const isAuthor = currentUserId === post.authorId;
  const canEdit = isAuthor && onEdit;
  const canDelete = (isAuthor || isModerator) && onDelete;
  const canPin = isModerator && (onPin || onUnpin);

  /**
   * Handle edit submission
   */
  const handleEditSubmit = async () => {
    if (!onEdit || !editContent.trim()) return;

    try {
      await onEdit(post.id, editContent.trim());
      setIsEditing(false);
    } catch (error) {
      // Error handling is done in the hook
      console.error('[PostCard] Edit error:', error);
    }
  };

  /**
   * Handle delete
   */
  const handleDelete = async () => {
    if (!onDelete) return;

    if (!confirm('Are you sure you want to delete this post?')) return;

    try {
      await onDelete(post.id);
    } catch (error) {
      // Error handling is done in the hook
      console.error('[PostCard] Delete error:', error);
    }
  };

  /**
   * Handle pin/unpin
   */
  const handleTogglePin = async () => {
    try {
      if (post.isPinned && onUnpin) {
        await onUnpin(post.id);
      } else if (!post.isPinned && onPin) {
        await onPin(post.id);
      }
    } catch (error) {
      console.error('[PostCard] Pin toggle error:', error);
    }
  };

  return (
    <Card className="w-full">
      {/* Header */}
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3 flex-1 min-w-0">
            {/* Author Avatar */}
            <div className="size-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
              {post.authorImage ? (
                <img
                  src={post.authorImage}
                  alt={post.authorName}
                  className="size-10 rounded-full object-cover"
                />
              ) : (
                <span className="text-sm font-medium text-primary">
                  {post.authorName.charAt(0).toUpperCase()}
                </span>
              )}
            </div>

            {/* Author Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-semibold text-sm truncate">
                  {post.authorName}
                </span>
                {post.isPinned && (
                  <Badge variant="secondary" className="gap-1">
                    <PinIcon className="size-3" />
                    Pinned
                  </Badge>
                )}
                {post.isEdited && (
                  <span className="text-xs text-muted-foreground">(edited)</span>
                )}
              </div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <time dateTime={post.createdAt.toISOString()}>
                  {formatDistanceToNow(post.createdAt, { addSuffix: true })}
                </time>
                {post.visibility !== 'PUBLIC' && (
                  <>
                    <span>•</span>
                    <Badge variant="outline" className="text-xs">
                      {post.visibility === 'FOLLOWERS' ? 'Followers' : 'Group'}
                    </Badge>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Actions Menu */}
          {(canEdit || canDelete || canPin) && (
            <div className="relative">
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={() => setShowActions(!showActions)}
                aria-label="Post actions"
                aria-expanded={showActions}
              >
                <MoreVerticalIcon />
              </Button>

              {showActions && (
                <div className="absolute right-0 top-full mt-1 w-48 bg-background border rounded-md shadow-lg z-10">
                  {canEdit && (
                    <button
                      onClick={() => {
                        setIsEditing(true);
                        setShowActions(false);
                      }}
                      className="w-full px-4 py-2 text-left text-sm hover:bg-accent flex items-center gap-2"
                    >
                      <EditIcon className="size-4" />
                      Edit
                    </button>
                  )}
                  {canPin && (
                    <button
                      onClick={() => {
                        handleTogglePin();
                        setShowActions(false);
                      }}
                      className="w-full px-4 py-2 text-left text-sm hover:bg-accent flex items-center gap-2"
                    >
                      <PinIcon className="size-4" />
                      {post.isPinned ? 'Unpin' : 'Pin'}
                    </button>
                  )}
                  {canDelete && (
                    <button
                      onClick={() => {
                        handleDelete();
                        setShowActions(false);
                      }}
                      className="w-full px-4 py-2 text-left text-sm hover:bg-accent text-destructive flex items-center gap-2"
                    >
                      <TrashIcon className="size-4" />
                      Delete
                    </button>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </CardHeader>

      {/* Content */}
      <CardContent className="space-y-4">
        {isEditing ? (
          <div className="space-y-2">
            <textarea
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              className="w-full min-h-24 px-3 py-2 text-sm border rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-ring"
              aria-label="Edit post content"
            />
            <div className="flex gap-2">
              <Button size="sm" onClick={handleEditSubmit}>
                Save
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  setIsEditing(false);
                  setEditContent(post.content);
                }}
              >
                Cancel
              </Button>
            </div>
          </div>
        ) : (
          <p className="text-sm whitespace-pre-wrap break-words">{post.content}</p>
        )}

        {/* Images */}
        {post.imageUrls.length > 0 && (
          <div
            className={`grid gap-2 ${
              post.imageUrls.length === 1
                ? 'grid-cols-1'
                : post.imageUrls.length === 2
                ? 'grid-cols-2'
                : 'grid-cols-2 sm:grid-cols-3'
            }`}
          >
            {post.imageUrls.map((url, index) => (
              <div
                key={index}
                className="relative aspect-square overflow-hidden rounded-md border"
              >
                <img
                  src={url}
                  alt={`Post image ${index + 1}`}
                  className="w-full h-full object-cover hover:scale-105 transition-transform cursor-pointer"
                  onClick={() => window.open(url, '_blank')}
                />
              </div>
            ))}
          </div>
        )}

        {/* Links */}
        {post.linkUrls.length > 0 && (
          <div className="space-y-2">
            {post.linkUrls.map((url, index) => (
              <a
                key={index}
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 p-3 bg-muted rounded-md text-sm hover:bg-muted/80 transition-colors"
              >
                <LinkIcon className="size-4 text-muted-foreground shrink-0" />
                <span className="flex-1 truncate text-primary">{url}</span>
              </a>
            ))}
          </div>
        )}
      </CardContent>

      {/* Footer */}
      <CardFooter className="flex-col gap-3 pt-0">
        {/* Reactions and Comment Count */}
        <div className="flex items-center justify-between w-full text-xs text-muted-foreground">
          <span>{post.reactionCount} reactions</span>
          <button
            onClick={() => setShowComments(!showComments)}
            className="hover:underline"
            aria-label={`${showComments ? 'Hide' : 'Show'} comments`}
            aria-expanded={showComments}
          >
            {post.commentCount} comments
          </button>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 w-full border-t pt-3">
          <PostReactions postId={post.id} />
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowComments(!showComments)}
            className="flex-1"
          >
            <MessageCircleIcon />
            Comment
          </Button>
        </div>

        {/* Comments Section */}
        {showComments && (
          <div className="w-full border-t pt-3">
            <CommentSection postId={post.id} />
          </div>
        )}
      </CardFooter>
    </Card>
  );
}
