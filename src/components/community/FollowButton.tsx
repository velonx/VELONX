'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { UserPlusIcon, UserMinusIcon, LoaderIcon } from 'lucide-react';
import { useFollow } from '@/lib/hooks/useFollow';

/**
 * Follow Button Props Interface
 */
export interface FollowButtonProps {
  userId: string;
  initialFollowing?: boolean;
  currentUserId?: string;
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'default' | 'sm' | 'lg';
  showIcon?: boolean;
  className?: string;
  onFollowChange?: (isFollowing: boolean) => void;
}

/**
 * FollowButton Component
 * 
 * A button component for following/unfollowing users with optimistic updates.
 * 
 * Features:
 * - Follow/unfollow functionality
 * - Optimistic UI updates
 * - Loading state
 * - Prevents self-follow
 * - Customizable appearance
 * - Accessibility support
 * 
 * @example
 * ```tsx
 * <FollowButton
 *   userId="user-123"
 *   initialFollowing={false}
 *   currentUserId="current-user-id"
 *   onFollowChange={(isFollowing) => console.log('Follow status:', isFollowing)}
 * />
 * ```
 */
export function FollowButton({
  userId,
  initialFollowing = false,
  currentUserId,
  variant = 'default',
  size = 'default',
  showIcon = true,
  className,
  onFollowChange,
}: FollowButtonProps) {
  const [isFollowing, setIsFollowing] = useState(initialFollowing);
  const [isLoading, setIsLoading] = useState(false);
  const { followUser, unfollowUser } = useFollow();

  // Update local state when initialFollowing changes
  useEffect(() => {
    setIsFollowing(initialFollowing);
  }, [initialFollowing]);

  // Prevent following yourself
  const isSelf = currentUserId === userId;

  /**
   * Handle follow/unfollow action
   */
  const handleToggleFollow = async () => {
    if (isSelf || isLoading) return;

    // Optimistic update
    const previousState = isFollowing;
    setIsFollowing(!isFollowing);
    setIsLoading(true);

    try {
      if (isFollowing) {
        await unfollowUser(userId);
        onFollowChange?.(false);
      } else {
        await followUser(userId);
        onFollowChange?.(true);
      }
    } catch (error) {
      // Revert on error
      setIsFollowing(previousState);
      console.error('[FollowButton] Toggle follow error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Don't show button for self
  if (isSelf) {
    return null;
  }

  return (
    <Button
      variant={isFollowing ? 'outline' : variant}
      size={size}
      onClick={handleToggleFollow}
      disabled={isLoading}
      className={className}
      aria-label={isFollowing ? 'Unfollow user' : 'Follow user'}
      aria-pressed={isFollowing}
    >
      {isLoading ? (
        <>
          <LoaderIcon className="animate-spin" />
          {isFollowing ? 'Unfollowing...' : 'Following...'}
        </>
      ) : (
        <>
          {showIcon && (
            isFollowing ? <UserMinusIcon /> : <UserPlusIcon />
          )}
          {isFollowing ? 'Following' : 'Follow'}
        </>
      )}
    </Button>
  );
}
