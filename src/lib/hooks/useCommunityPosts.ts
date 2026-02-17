'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { ApiClientError } from '@/lib/api/client';
import type { CommunityPostData } from '@/lib/types/community.types';
import toast from 'react-hot-toast';

/**
 * Community Posts Hook State Interface
 */
export interface UseCommunityPostsState {
  posts: CommunityPostData[];
  hasMore: boolean;
  isLoading: boolean;
  error: ApiClientError | null;
}

/**
 * Community Posts Hook Return Interface
 */
export interface UseCommunityPostsReturn extends UseCommunityPostsState {
  createPost: (data: CreatePostData) => Promise<CommunityPostData | null>;
  editPost: (postId: string, content: string) => Promise<void>;
  deletePost: (postId: string) => Promise<void>;
  loadMore: () => Promise<void>;
  refetch: () => Promise<void>;
  isCreating: boolean;
  isEditing: boolean;
  isDeleting: boolean;
}

/**
 * Create Post Data Interface
 */
export interface CreatePostData {
  content: string;
  groupId?: string;
  visibility?: 'PUBLIC' | 'FOLLOWERS' | 'GROUP';
  imageUrls?: string[];
  linkUrls?: string[];
}

/**
 * Convert API errors to user-friendly messages
 */
function getErrorMessage(err: unknown): string {
  if (err instanceof ApiClientError) {
    if (err.statusCode === 401) {
      return 'Please log in to create posts';
    }
    if (err.statusCode === 403) {
      return 'You do not have permission to perform this action';
    }
    if (err.statusCode === 404) {
      return 'Post or group not found';
    }
    if (err.statusCode === 429) {
      return 'You are creating posts too quickly. Please slow down.';
    }
    return err.message || 'An error occurred';
  }
  return err instanceof Error ? err.message : 'An unexpected error occurred';
}

/**
 * Options for useCommunityPosts hook
 */
export interface UseCommunityPostsOptions {
  groupId?: string | null;
  authorId?: string | null;
  limit?: number;
}

/**
 * Custom hook for managing community posts with pagination
 * 
 * Features:
 * - Fetch posts with pagination
 * - Create new posts with optimistic updates
 * - Edit and delete posts
 * - Load more posts (infinite scroll)
 * - Error handling with toast notifications
 * - Loading state management
 * 
 * @param options - Options object with groupId, authorId, and limit
 * 
 * @example
 * ```tsx
 * const { posts, createPost, editPost, deletePost, loadMore } = useCommunityPosts();
 * 
 * // Filter by author
 * const { posts } = useCommunityPosts({ authorId: 'user-id' });
 * 
 * // Filter by group
 * const { posts } = useCommunityPosts({ groupId: 'group-id' });
 * 
 * // Create a post
 * await createPost({
 *   content: 'Hello, community!',
 *   visibility: 'PUBLIC'
 * });
 * 
 * // Edit a post
 * await editPost('post-id', 'Updated content');
 * ```
 */
export function useCommunityPosts(
  options?: UseCommunityPostsOptions
): UseCommunityPostsReturn {
  const { groupId, authorId, limit = 20 } = options || {};
  const [state, setState] = useState<UseCommunityPostsState>({
    posts: [],
    hasMore: true,
    isLoading: true,
    error: null,
  });
  
  const [isCreating, setIsCreating] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  
  const isMountedRef = useRef(true);
  const cursorRef = useRef<string | null>(null);

  /**
   * Fetch posts from API
   */
  const fetchPosts = useCallback(async (cursor?: string | null) => {
    if (!isMountedRef.current) return;
    
    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const params = new URLSearchParams();
      if (groupId) params.append('groupId', groupId);
      if (authorId) params.append('authorId', authorId);
      params.append('limit', limit.toString());
      if (cursor) params.append('cursor', cursor);
      
      const response = await fetch(`/api/community/posts?${params.toString()}`);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new ApiClientError(
          response.status,
          errorData.error?.code || 'FETCH_ERROR',
          errorData.error?.message || 'Failed to fetch posts'
        );
      }
      
      const data = await response.json();
      
      if (!isMountedRef.current) return;
      
      const newPosts = data.data || [];
      const nextCursor = data.pagination?.cursor || null;
      
      setState(prev => ({
        ...prev,
        posts: cursor ? [...prev.posts, ...newPosts] : newPosts,
        hasMore: !!nextCursor,
        isLoading: false,
        error: null,
      }));
      
      cursorRef.current = nextCursor;
    } catch (err) {
      console.error('[useCommunityPosts] Fetch error:', err);
      
      if (!isMountedRef.current) return;
      
      const error = err instanceof ApiClientError 
        ? err 
        : new ApiClientError(500, 'NETWORK_ERROR', getErrorMessage(err));
      
      setState(prev => ({
        ...prev,
        isLoading: false,
        error,
      }));
    }
  }, [groupId, authorId, limit]);

  /**
   * Fetch posts on mount and when groupId changes
   */
  useEffect(() => {
    cursorRef.current = null;
    fetchPosts();
  }, [fetchPosts]);
  
  /**
   * Cleanup on unmount
   */
  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  /**
   * Refetch function for manual refresh
   */
  const refetch = useCallback(async () => {
    cursorRef.current = null;
    await fetchPosts();
  }, [fetchPosts]);
  
  /**
   * Load more posts (pagination)
   */
  const loadMore = useCallback(async () => {
    if (!state.hasMore || state.isLoading) return;
    await fetchPosts(cursorRef.current);
  }, [state.hasMore, state.isLoading, fetchPosts]);
  
  /**
   * Create a new post with optimistic update
   */
  const createPost = useCallback(async (data: CreatePostData): Promise<CommunityPostData | null> => {
    if (!data.content.trim()) {
      toast.error('Post content cannot be empty');
      return null;
    }
    
    setIsCreating(true);

    // Create optimistic post
    const optimisticPost: CommunityPostData = {
      id: `temp-${Date.now()}`,
      content: data.content.trim(),
      authorId: 'current-user',
      authorName: 'You',
      authorImage: undefined,
      groupId: data.groupId,
      visibility: data.visibility || 'PUBLIC',
      imageUrls: data.imageUrls || [],
      linkUrls: data.linkUrls || [],
      isEdited: false,
      isPinned: false,
      reactionCount: 0,
      commentCount: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // Optimistically add post to state
    if (isMountedRef.current) {
      setState(prev => ({
        ...prev,
        posts: [optimisticPost, ...prev.posts],
      }));
    }

    try {
      const response = await fetch('/api/community/posts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new ApiClientError(
          response.status,
          errorData.error?.code || 'CREATE_ERROR',
          errorData.error?.message || 'Failed to create post'
        );
      }
      
      const result = await response.json();
      const newPost = result.data;
      
      // Replace optimistic post with real post
      if (isMountedRef.current) {
        setState(prev => ({
          ...prev,
          posts: prev.posts.map(post =>
            post.id === optimisticPost.id ? newPost : post
          ),
        }));
      }
      
      toast.success('Post created successfully');
      return newPost;
    } catch (err) {
      console.error('[useCommunityPosts] Create error:', err);
      
      // Remove optimistic post on error
      if (isMountedRef.current) {
        setState(prev => ({
          ...prev,
          posts: prev.posts.filter(post => post.id !== optimisticPost.id),
        }));
      }
      
      toast.error(getErrorMessage(err));
      return null;
    } finally {
      setIsCreating(false);
    }
  }, []);
  
  /**
   * Edit a post
   */
  const editPost = useCallback(async (postId: string, content: string) => {
    if (!content.trim()) {
      toast.error('Post content cannot be empty');
      return;
    }
    
    setIsEditing(true);

    // Store original post for rollback
    const originalPost = state.posts.find(post => post.id === postId);
    
    // Optimistically update post
    if (isMountedRef.current) {
      setState(prev => ({
        ...prev,
        posts: prev.posts.map(post =>
          post.id === postId
            ? { ...post, content: content.trim(), isEdited: true, updatedAt: new Date() }
            : post
        ),
      }));
    }

    try {
      const response = await fetch(`/api/community/posts/${postId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content: content.trim() }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new ApiClientError(
          response.status,
          errorData.error?.code || 'EDIT_ERROR',
          errorData.error?.message || 'Failed to edit post'
        );
      }
      
      const result = await response.json();
      const updatedPost = result.data;
      
      // Update with server response
      if (isMountedRef.current) {
        setState(prev => ({
          ...prev,
          posts: prev.posts.map(post =>
            post.id === postId ? updatedPost : post
          ),
        }));
      }
      
      toast.success('Post updated');
    } catch (err) {
      console.error('[useCommunityPosts] Edit error:', err);
      
      // Rollback on error
      if (originalPost && isMountedRef.current) {
        setState(prev => ({
          ...prev,
          posts: prev.posts.map(post =>
            post.id === postId ? originalPost : post
          ),
        }));
      }
      
      toast.error(getErrorMessage(err));
      throw err;
    } finally {
      setIsEditing(false);
    }
  }, [state.posts]);
  
  /**
   * Delete a post
   */
  const deletePost = useCallback(async (postId: string) => {
    setIsDeleting(true);

    // Store original post for rollback
    const originalPost = state.posts.find(post => post.id === postId);
    
    // Optimistically remove post
    if (isMountedRef.current) {
      setState(prev => ({
        ...prev,
        posts: prev.posts.filter(post => post.id !== postId),
      }));
    }

    try {
      const response = await fetch(`/api/community/posts/${postId}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new ApiClientError(
          response.status,
          errorData.error?.code || 'DELETE_ERROR',
          errorData.error?.message || 'Failed to delete post'
        );
      }
      
      toast.success('Post deleted');
    } catch (err) {
      console.error('[useCommunityPosts] Delete error:', err);
      
      // Rollback on error
      if (originalPost && isMountedRef.current) {
        setState(prev => ({
          ...prev,
          posts: [originalPost, ...prev.posts],
        }));
      }
      
      toast.error(getErrorMessage(err));
      throw err;
    } finally {
      setIsDeleting(false);
    }
  }, [state.posts]);

  return {
    ...state,
    createPost,
    editPost,
    deletePost,
    loadMore,
    refetch,
    isCreating,
    isEditing,
    isDeleting,
  };
}
