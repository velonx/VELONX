'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { ApiClientError } from '@/lib/api/client';
import { getCSRFToken, secureFetch } from '@/lib/utils/csrf';
import toast from 'react-hot-toast';

/**
 * Post Comment Interface
 */
export interface PostComment {
  id: string;
  postId: string;
  authorId: string;
  content: string;
  parentId: string | null;
  upvotes: number;
  downvotes: number;
  replies?: PostComment[];
  createdAt: Date;
  updatedAt: Date;
  author: {
    id: string;
    name: string | null;
    email?: string;
    image: string | null;
  };
}

/**
 * Post Comments Hook State Interface
 */
export interface UsePostCommentsState {
  comments: PostComment[];
  hasMore: boolean;
  isLoading: boolean;
  error: ApiClientError | null;
}

/**
 * Post Comments Hook Return Interface
 */
export interface UsePostCommentsReturn extends UsePostCommentsState {
  createComment: (content: string, parentId?: string) => Promise<PostComment | null>;
  loadMore: () => Promise<void>;
  refetch: () => Promise<void>;
  isCreating: boolean;
}

/**
 * Convert API errors to user-friendly messages
 */
function getErrorMessage(err: unknown): string {
  if (err instanceof ApiClientError) {
    if (err.statusCode === 401) {
      return 'Please log in to comment on posts';
    }
    if (err.statusCode === 403) {
      return 'You do not have permission to comment on this post';
    }
    if (err.statusCode === 404) {
      return 'Post not found';
    }
    return err.message || 'An error occurred';
  }
  return err instanceof Error ? err.message : 'An unexpected error occurred';
}

/**
 * Custom hook for managing post comments with pagination
 * 
 * Features:
 * - Fetch comments for a post with pagination
 * - Create new comments with optimistic updates
 * - Load more comments (infinite scroll)
 * - Error handling with toast notifications
 * - Loading state management
 * 
 * @param postId - The ID of the post to fetch comments for
 * @param limit - Number of comments to fetch per page (default: 20)
 * 
 * @example
 * ```tsx
 * const { comments, createComment, loadMore } = usePostComments('post-id-123');
 * 
 * // Create a comment
 * await createComment('Great post!');
 * 
 * // Load more comments
 * await loadMore();
 * ```
 */
export function usePostComments(
  postId: string | null,
  limit: number = 20
): UsePostCommentsReturn {
  const [state, setState] = useState<UsePostCommentsState>({
    comments: [],
    hasMore: true,
    isLoading: true,
    error: null,
  });

  const [isCreating, setIsCreating] = useState(false);

  // isMountedRef is only used by createComment (not the main fetch effect)
  const isMountedRef = useRef(true);
  const cursorRef = useRef<string | null>(null);

  useEffect(() => {
    isMountedRef.current = true;
    return () => { isMountedRef.current = false; };
  }, []);

  /**
   * Fetch comments from API
   */
  const fetchComments = useCallback(async (cursor?: string | null, signal?: AbortSignal) => {
    if (!postId) return;

    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const params = new URLSearchParams();
      params.append('limit', limit.toString());
      if (cursor) params.append('cursor', cursor);

      const response = await fetch(`/api/community/posts/${postId}/comments?${params.toString()}`, {
        credentials: 'include',
        signal,
      });

      if (signal?.aborted) return;

      if (!response.ok) {
        const errorData = await response.json();
        throw new ApiClientError(
          response.status,
          errorData.error?.code || 'FETCH_ERROR',
          errorData.error?.message || 'Failed to fetch comments'
        );
      }

      const data = await response.json();

      if (signal?.aborted) return;

      const newComments = data.data || [];
      const nextCursor = data.pagination?.cursor || null;

      setState(prev => ({
        ...prev,
        comments: cursor ? [...prev.comments, ...newComments] : newComments,
        hasMore: !!nextCursor,
        isLoading: false,
        error: null,
      }));

      cursorRef.current = nextCursor;
    } catch (err) {
      // Ignore abort errors — they're intentional cleanup
      if (err instanceof Error && err.name === 'AbortError') return;

      console.error('[usePostComments] Fetch error:', err);

      setState(prev => ({
        ...prev,
        isLoading: false,
        error: err instanceof ApiClientError
          ? err
          : new ApiClientError(500, 'NETWORK_ERROR', getErrorMessage(err)),
      }));
    }
  }, [postId, limit]);

  /**
   * Fetch comments on mount and when postId changes.
   * Uses AbortController so cleanup correctly cancels in-flight requests
   * (works correctly in React Strict Mode double-invoke).
   */
  useEffect(() => {
    if (!postId) return;
    const controller = new AbortController();
    cursorRef.current = null;
    fetchComments(null, controller.signal);
    return () => controller.abort();
  }, [postId, limit, fetchComments]);



  /**
   * Refetch function for manual refresh
   */
  const refetch = useCallback(async () => {
    cursorRef.current = null;
    await fetchComments();
  }, [fetchComments]);

  /**
   * Load more comments (pagination)
   */
  const loadMore = useCallback(async () => {
    if (!state.hasMore || state.isLoading) return;
    await fetchComments(cursorRef.current);
  }, [state.hasMore, state.isLoading, fetchComments]);

  /**
   * Create a new comment with optimistic update
   */
  const createComment = useCallback(async (content: string, parentId?: string): Promise<PostComment | null> => {
    if (!postId) {
      toast.error('Post ID is required');
      return null;
    }

    if (!content.trim()) {
      toast.error('Comment cannot be empty');
      return null;
    }

    setIsCreating(true);

    // Create optimistic comment
    const optimisticComment: PostComment = {
      id: `temp-${Date.now()}`,
      postId,
      authorId: 'current-user',
      content: content.trim(),
      parentId: parentId || null,
      upvotes: 0,
      downvotes: 0,
      replies: [],
      createdAt: new Date(),
      updatedAt: new Date(),
      author: {
        id: 'current-user',
        name: 'You',
        image: null,
      },
    };

    // Optimistically add comment to state
    if (isMountedRef.current) {
      setState(prev => {
        // If it's a reply, find the parent and add it to its replies
        if (parentId) {
          return {
            ...prev,
            comments: prev.comments.map(c =>
              c.id === parentId
                ? { ...c, replies: [...(c.replies || []), optimisticComment] }
                : c
            )
          };
        }
        // Top level comment
        return {
          ...prev,
          comments: [optimisticComment, ...prev.comments],
        };
      });
    }

    try {
      const response = await secureFetch(`/api/community/posts/${postId}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content: content.trim(), parentId }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new ApiClientError(
          response.status,
          errorData.error?.code || 'CREATE_ERROR',
          errorData.error?.message || 'Failed to create comment'
        );
      }

      const result = await response.json();
      const newComment = result.data;

      // Replace optimistic comment with real comment
      if (isMountedRef.current) {
        setState(prev => {
          if (parentId) {
            return {
              ...prev,
              comments: prev.comments.map(c =>
                c.id === parentId
                  ? { ...c, replies: (c.replies || []).map(r => r.id === optimisticComment.id ? newComment : r) }
                  : c
              )
            };
          }
          return {
            ...prev,
            comments: prev.comments.map(comment =>
              comment.id === optimisticComment.id ? newComment : comment
            ),
          };
        });
      }

      toast.success('Comment added');
      return newComment;
    } catch (err) {
      console.error('[usePostComments] Create error:', err);

      // Remove optimistic comment on error
      if (isMountedRef.current) {
        setState(prev => {
          if (parentId) {
            return {
              ...prev,
              comments: prev.comments.map(c =>
                c.id === parentId
                  ? { ...c, replies: (c.replies || []).filter(r => r.id !== optimisticComment.id) }
                  : c
              )
            };
          }
          return {
            ...prev,
            comments: prev.comments.filter(comment => comment.id !== optimisticComment.id),
          };
        });
      }

      toast.error(getErrorMessage(err));
      return null;
    } finally {
      setIsCreating(false);
    }
  }, [postId]);

  return {
    ...state,
    createComment,
    loadMore,
    refetch,
    isCreating,
  };
}
