'use client';

import { useState, useCallback } from 'react';
import { ApiClientError } from '@/lib/api/client';
import toast from 'react-hot-toast';

/**
 * Reaction Type
 */
export type ReactionType = 'LIKE' | 'LOVE' | 'INSIGHTFUL' | 'CELEBRATE';

/**
 * Post Reactions Hook Return Interface
 */
export interface UsePostReactionsReturn {
  addReaction: (postId: string, type: ReactionType) => Promise<void>;
  removeReaction: (postId: string) => Promise<void>;
  isReacting: boolean;
}

/**
 * Convert API errors to user-friendly messages
 */
function getErrorMessage(err: unknown): string {
  if (err instanceof ApiClientError) {
    if (err.statusCode === 401) {
      return 'Please log in to react to posts';
    }
    if (err.statusCode === 403) {
      return 'You do not have permission to react to this post';
    }
    if (err.statusCode === 404) {
      return 'Post not found';
    }
    return err.message || 'An error occurred';
  }
  return err instanceof Error ? err.message : 'An unexpected error occurred';
}

/**
 * Custom hook for managing post reactions
 * 
 * Features:
 * - Add reactions to posts
 * - Remove reactions from posts
 * - Optimistic UI updates
 * - Error handling with toast notifications
 * - Loading state management
 * 
 * @example
 * ```tsx
 * const { addReaction, removeReaction, isReacting } = usePostReactions();
 * 
 * // Add a reaction
 * await addReaction('post-id-123', 'LIKE');
 * 
 * // Remove a reaction
 * await removeReaction('post-id-123');
 * ```
 */
export function usePostReactions(): UsePostReactionsReturn {
  const [isReacting, setIsReacting] = useState(false);

  /**
   * Add a reaction to a post
   */
  const addReaction = useCallback(async (postId: string, type: ReactionType) => {
    setIsReacting(true);

    try {
      const response = await fetch(`/api/community/posts/${postId}/react`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ type }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new ApiClientError(
          response.status,
          errorData.error?.code || 'REACT_ERROR',
          errorData.error?.message || 'Failed to add reaction'
        );
      }
      
      // Success - no toast needed for reactions (too noisy)
    } catch (err) {
      console.error('[usePostReactions] Add reaction error:', err);
      toast.error(getErrorMessage(err));
      throw err;
    } finally {
      setIsReacting(false);
    }
  }, []);
  
  /**
   * Remove a reaction from a post
   */
  const removeReaction = useCallback(async (postId: string) => {
    setIsReacting(true);

    try {
      const response = await fetch(`/api/community/posts/${postId}/react`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new ApiClientError(
          response.status,
          errorData.error?.code || 'UNREACT_ERROR',
          errorData.error?.message || 'Failed to remove reaction'
        );
      }
      
      // Success - no toast needed for reactions (too noisy)
    } catch (err) {
      console.error('[usePostReactions] Remove reaction error:', err);
      toast.error(getErrorMessage(err));
      throw err;
    } finally {
      setIsReacting(false);
    }
  }, []);

  return {
    addReaction,
    removeReaction,
    isReacting,
  };
}
