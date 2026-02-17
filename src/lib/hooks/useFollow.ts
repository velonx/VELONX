'use client';

import { useState, useCallback } from 'react';
import { ApiClientError } from '@/lib/api/client';
import toast from 'react-hot-toast';

/**
 * User Interface
 */
export interface User {
  id: string;
  name: string | null;
  email: string;
  image: string | null;
}

/**
 * Follow Hook Return Interface
 */
export interface UseFollowReturn {
  followUser: (userId: string) => Promise<void>;
  unfollowUser: (userId: string) => Promise<void>;
  checkFollowStatus: (userId: string) => Promise<boolean>;
  isFollowing: boolean;
}

/**
 * Convert API errors to user-friendly messages
 */
function getErrorMessage(err: unknown): string {
  if (err instanceof ApiClientError) {
    if (err.statusCode === 401) {
      return 'Please log in to follow users';
    }
    if (err.statusCode === 403) {
      return 'You cannot follow yourself';
    }
    if (err.statusCode === 404) {
      return 'User not found';
    }
    if (err.statusCode === 409) {
      return 'You are already following this user';
    }
    return err.message || 'An error occurred';
  }
  return err instanceof Error ? err.message : 'An unexpected error occurred';
}

/**
 * Custom hook for managing user follow relationships
 * 
 * Features:
 * - Follow users
 * - Unfollow users
 * - Check follow status
 * - Optimistic UI updates
 * - Error handling with toast notifications
 * - Loading state management
 * 
 * @example
 * ```tsx
 * const { followUser, unfollowUser, checkFollowStatus, isFollowing } = useFollow();
 * 
 * // Follow a user
 * await followUser('user-id-123');
 * 
 * // Unfollow a user
 * await unfollowUser('user-id-123');
 * 
 * // Check if following a user
 * const following = await checkFollowStatus('user-id-123');
 * ```
 */
export function useFollow(): UseFollowReturn {
  const [isFollowing, setIsFollowing] = useState(false);

  /**
   * Follow a user
   */
  const followUser = useCallback(async (userId: string) => {
    setIsFollowing(true);

    try {
      const response = await fetch('/api/community/follow', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new ApiClientError(
          response.status,
          errorData.error?.code || 'FOLLOW_ERROR',
          errorData.error?.message || 'Failed to follow user'
        );
      }
      
      toast.success('User followed successfully');
    } catch (err) {
      console.error('[useFollow] Follow error:', err);
      toast.error(getErrorMessage(err));
      throw err;
    } finally {
      setIsFollowing(false);
    }
  }, []);
  
  /**
   * Unfollow a user
   */
  const unfollowUser = useCallback(async (userId: string) => {
    setIsFollowing(true);

    try {
      const response = await fetch(`/api/community/follow/${userId}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new ApiClientError(
          response.status,
          errorData.error?.code || 'UNFOLLOW_ERROR',
          errorData.error?.message || 'Failed to unfollow user'
        );
      }
      
      toast.success('User unfollowed successfully');
    } catch (err) {
      console.error('[useFollow] Unfollow error:', err);
      toast.error(getErrorMessage(err));
      throw err;
    } finally {
      setIsFollowing(false);
    }
  }, []);
  
  /**
   * Check if currently following a user
   */
  const checkFollowStatus = useCallback(async (userId: string): Promise<boolean> => {
    try {
      const response = await fetch(`/api/community/follow/${userId}/status`);
      
      if (!response.ok) {
        return false;
      }
      
      const data = await response.json();
      return data.data?.isFollowing || false;
    } catch (err) {
      console.error('[useFollow] Check status error:', err);
      return false;
    }
  }, []);

  return {
    followUser,
    unfollowUser,
    checkFollowStatus,
    isFollowing,
  };
}
