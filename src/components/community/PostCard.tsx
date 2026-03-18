'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  MoreVerticalIcon,
  MessageCircleIcon,
  PinIcon,
  EditIcon,
  TrashIcon,
  LinkIcon,
  ChevronUpIcon,
  ChevronDownIcon,
} from 'lucide-react';
import { formatDistanceToNow } from '@/lib/utils/date-helpers';
import type { CommunityPostData } from '@/lib/types/community.types';
import { useSession } from 'next-auth/react';
import { toast } from 'react-hot-toast';
import { CommentSection } from './CommentSection';
import { AvatarImage, CardImage } from '@/components/responsive-image';

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
 * PostCard Component — Reddit-style layout with voting sidebar
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
  const [localScore, setLocalScore] = useState(post.score || 0);

  const { data: session } = useSession();
  const loggedInUserId = session?.user?.id;

  const isAuthor = currentUserId === post.authorId;
  const canEdit = isAuthor && onEdit;
  const canDelete = (isAuthor || isModerator) && onDelete;
  const canPin = isModerator && (onPin || onUnpin);

  const handleVote = async (action: 'upvote' | 'downvote') => {
    if (!loggedInUserId) {
      toast.error('You must be signed in to vote');
      return;
    }
    // Optimistic update
    setLocalScore(prev => action === 'upvote' ? prev + 1 : prev - 1);
    try {
      const { getCSRFToken } = await import('@/lib/utils/csrf');
      const csrfToken = await getCSRFToken();
      const res = await fetch(`/api/community/posts/${post.id}/vote`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json', 'x-csrf-token': csrfToken },
        body: JSON.stringify({ action }),
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.error?.message || 'Failed to vote');

      // Server returns the real score after voting — sync local state
      if (data.data?.score !== undefined) {
        setLocalScore(data.data.score);
      }
      // If already voted in same direction, server returns success=true with a message but
      // no score change needed — just keep the optimistic update as-is
    } catch (error: any) {
      toast.error(error.message || 'Failed to vote');
      // Revert optimistic update on real errors
      setLocalScore(prev => action === 'upvote' ? prev - 1 : prev + 1);
    }
  };

  const handleEditSubmit = async () => {
    if (!onEdit || !editContent.trim()) return;
    try {
      await onEdit(post.id, editContent.trim());
      setIsEditing(false);
    } catch (error) {
      console.error('[PostCard] Edit error:', error);
    }
  };

  const handleDelete = async () => {
    if (!onDelete) return;
    if (!confirm('Are you sure you want to delete this post?')) return;
    try {
      await onDelete(post.id);
    } catch (error) {
      console.error('[PostCard] Delete error:', error);
    }
  };

  const handleTogglePin = async () => {
    try {
      if (post.isPinned && onUnpin) await onUnpin(post.id);
      else if (!post.isPinned && onPin) await onPin(post.id);
    } catch (error) {
      console.error('[PostCard] Pin toggle error:', error);
    }
  };

  return (
    <Card className="w-full border border-border/40 shadow-sm bg-card overflow-hidden rounded-xl">
      <div className="flex">
        {/* ── Left Voting Sidebar ── */}
        <div className="hidden sm:flex flex-col items-center py-5 px-3 bg-muted/30 border-r border-border/30 shrink-0 gap-0.5">
          <Button
            variant="ghost"
            size="icon"
            className="size-8 rounded-full hover:bg-primary/10 text-muted-foreground hover:text-primary transition-colors"
            onClick={() => handleVote('upvote')}
            aria-label="Upvote"
          >
            <ChevronUpIcon className="size-5" />
          </Button>
          <span className="text-sm font-bold text-foreground tabular-nums py-0.5">
            {localScore}
          </span>
          <Button
            variant="ghost"
            size="icon"
            className="size-8 rounded-full hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
            onClick={() => handleVote('downvote')}
            aria-label="Downvote"
          >
            <ChevronDownIcon className="size-5" />
          </Button>
        </div>

        {/* ── Main Content ── */}
        <div className="flex-1 min-w-0 flex flex-col">
          {/* Header: Author + Meta + Actions */}
          <div className="flex items-start justify-between gap-3 px-5 pt-5 pb-2">
            <div className="flex items-center gap-3 min-w-0">
              {/* Avatar */}
              <div className="size-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0 overflow-hidden ring-2 ring-background">
                {post.authorImage ? (
                  <AvatarImage src={post.authorImage} alt={post.authorName} size={40} />
                ) : (
                  <span className="text-sm font-semibold text-primary">
                    {post.authorName.charAt(0).toUpperCase()}
                  </span>
                )}
              </div>

              {/* Author name + meta */}
              <div className="min-w-0">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="font-semibold text-sm text-foreground">{post.authorName}</span>
                  {isAuthor && (
                    <Badge variant="default" className="text-[10px] h-4 px-1.5 rounded bg-blue-500/10 text-blue-600 hover:bg-blue-500/20 shadow-none border-blue-500/20 uppercase tracking-wider font-bold">
                      OP
                    </Badge>
                  )}
                  {post.isPinned && (
                    <Badge variant="secondary" className="gap-1 text-[10px] h-4 px-1.5">
                      <PinIcon className="size-2.5" />
                      Pinned
                    </Badge>
                  )}
                </div>
                <div className="flex items-center gap-1 text-xs text-muted-foreground mt-0.5">
                  <time dateTime={new Date(post.createdAt).toISOString()}>
                    {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
                  </time>
                  {post.isEdited && <span>• edited</span>}
                  {post.visibility !== 'PUBLIC' && (
                    <>
                      <span>•</span>
                      <span>{post.visibility === 'FOLLOWERS' ? 'Followers' : 'Group'}</span>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Actions dropdown */}
            {(canEdit || canDelete || canPin) && (
              <div className="relative shrink-0">
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-8 rounded-full text-muted-foreground hover:text-foreground"
                  onClick={() => setShowActions(!showActions)}
                  aria-label="Post actions"
                >
                  <MoreVerticalIcon className="size-4" />
                </Button>
                {showActions && (
                  <div className="absolute right-0 top-full mt-1 w-44 bg-card border border-border rounded-lg shadow-lg z-20 py-1">
                    {canEdit && (
                      <button onClick={() => { setIsEditing(true); setShowActions(false); }} className="w-full px-3 py-2 text-left text-sm hover:bg-muted flex items-center gap-2">
                        <EditIcon className="size-4" /> Edit
                      </button>
                    )}
                    {canPin && (
                      <button onClick={() => { handleTogglePin(); setShowActions(false); }} className="w-full px-3 py-2 text-left text-sm hover:bg-muted flex items-center gap-2">
                        <PinIcon className="size-4" /> {post.isPinned ? 'Unpin' : 'Pin'}
                      </button>
                    )}
                    {canDelete && (
                      <button onClick={() => { handleDelete(); setShowActions(false); }} className="w-full px-3 py-2 text-left text-sm hover:bg-muted text-destructive flex items-center gap-2">
                        <TrashIcon className="size-4" /> Delete
                      </button>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Post Content */}
          <div className="px-5 pb-3">
            {isEditing ? (
              <div className="space-y-3">
                <textarea
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  className="w-full min-h-24 px-3 py-2 text-sm border border-border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-ring bg-background"
                  aria-label="Edit post content"
                />
                <div className="flex gap-2">
                  <Button size="sm" className="rounded-full px-4" onClick={handleEditSubmit}>Save</Button>
                  <Button size="sm" variant="outline" className="rounded-full px-4" onClick={() => { setIsEditing(false); setEditContent(post.content); }}>Cancel</Button>
                </div>
              </div>
            ) : (
              <div className="mt-1">
                {post.content.includes('\n\n') ? (
                  <>
                    <h2 className="text-lg sm:text-xl font-bold text-foreground mb-2 leading-snug">
                      {post.content.split('\n\n')[0]}
                    </h2>
                    <p className="text-sm text-foreground/80 whitespace-pre-wrap break-words leading-relaxed">
                      {post.content.substring(post.content.indexOf('\n\n') + 2)}
                    </p>
                  </>
                ) : (
                  <p className="text-sm sm:text-base text-foreground whitespace-pre-wrap break-words leading-relaxed">
                    {post.content}
                  </p>
                )}
              </div>
            )}

            {/* Tags */}
            <div className="flex flex-wrap gap-1.5 mt-3">
              {['#discussion', '#community'].map(tag => (
                <Badge key={tag} variant="secondary" className="bg-muted/60 text-muted-foreground text-[11px] font-normal hover:bg-muted rounded-full px-2.5 py-0.5">
                  {tag}
                </Badge>
              ))}
            </div>

            {/* Images */}
            {post.imageUrls.length > 0 && (
              <div className={`grid gap-2 mt-3 ${post.imageUrls.length === 1 ? 'grid-cols-1' : post.imageUrls.length === 2 ? 'grid-cols-2' : 'grid-cols-2 sm:grid-cols-3'}`}>
                {post.imageUrls.map((url, i) => (
                  <div key={i} className="cursor-pointer rounded-lg overflow-hidden" onClick={() => window.open(url, '_blank')}>
                    <CardImage src={url} alt={`Post image ${i + 1}`} aspectRatio="16/9" className="hover:scale-105 transition-transform" />
                  </div>
                ))}
              </div>
            )}

            {/* Links */}
            {post.linkUrls.length > 0 && (
              <div className="space-y-2 mt-3">
                {post.linkUrls.map((url, i) => (
                  <a key={i} href={url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 p-2.5 bg-muted/50 rounded-lg text-sm hover:bg-muted transition-colors">
                    <LinkIcon className="size-4 text-muted-foreground shrink-0" />
                    <span className="flex-1 truncate text-primary">{url}</span>
                  </a>
                ))}
              </div>
            )}
          </div>

          {/* Footer: Comment count + mobile vote */}
          <div className="px-5 py-3 border-t border-border/30 flex items-center gap-3">
            {/* Mobile voting (hidden on sm+) */}
            <div className="flex sm:hidden items-center gap-0.5 mr-2">
              <Button variant="ghost" size="icon" className="size-7 rounded-full text-muted-foreground hover:text-primary" onClick={() => handleVote('upvote')}>
                <ChevronUpIcon className="size-4" />
              </Button>
              <span className="text-xs font-bold tabular-nums min-w-[20px] text-center">{localScore}</span>
              <Button variant="ghost" size="icon" className="size-7 rounded-full text-muted-foreground hover:text-destructive" onClick={() => handleVote('downvote')}>
                <ChevronDownIcon className="size-4" />
              </Button>
            </div>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowComments(!showComments)}
              className="text-muted-foreground hover:text-foreground gap-1.5 h-8 px-3 rounded-full"
            >
              <MessageCircleIcon className="size-4" />
              <span className="text-sm">{post.commentCount} Comments</span>
            </Button>
          </div>

          {/* Comments Section */}
          {showComments && (
            <div className="px-5 pb-5 border-t border-border/30">
              <CommentSection postId={post.id} />
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}
