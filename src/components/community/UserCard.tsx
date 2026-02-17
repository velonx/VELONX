'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { FollowButton } from './FollowButton';
import { UserIcon } from 'lucide-react';
import Link from 'next/link';

/**
 * User Interface
 */
export interface User {
  id: string;
  name: string | null;
  email: string;
  image: string | null;
  role?: string;
  bio?: string;
  followerCount?: number;
  followingCount?: number;
  isFollowing?: boolean;
}

/**
 * User Card Props Interface
 */
export interface UserCardProps {
  user: User;
  currentUserId?: string;
  showFollowButton?: boolean;
  showStats?: boolean;
  onClick?: (userId: string) => void;
  className?: string;
}

/**
 * UserCard Component
 * 
 * Displays a user preview card with follow status and optional stats.
 * 
 * Features:
 * - User avatar and name
 * - Follow button
 * - Follower/following counts
 * - Role badge
 * - Bio preview
 * - Clickable to view profile
 * - Accessibility support
 * 
 * @example
 * ```tsx
 * <UserCard
 *   user={userData}
 *   currentUserId="current-user-id"
 *   showFollowButton={true}
 *   showStats={true}
 * />
 * ```
 */
export function UserCard({
  user,
  currentUserId,
  showFollowButton = true,
  showStats = true,
  onClick,
  className,
}: UserCardProps) {
  const displayName = user.name || user.email.split('@')[0];
  const isSelf = currentUserId === user.id;

  /**
   * Handle card click
   */
  const handleClick = () => {
    if (onClick) {
      onClick(user.id);
    }
  };

  return (
    <Card className={className}>
      <CardContent className="p-4">
        <div className="flex items-start gap-4">
          {/* Avatar */}
          <Link
            href={`/profile/${user.id}`}
            className="shrink-0 focus:outline-none focus:ring-2 focus:ring-ring rounded-full"
          >
            <div className="size-12 rounded-full bg-primary/10 flex items-center justify-center overflow-hidden">
              {user.image ? (
                <img
                  src={user.image}
                  alt={displayName}
                  className="size-12 object-cover"
                />
              ) : (
                <UserIcon className="size-6 text-primary" />
              )}
            </div>
          </Link>

          {/* User Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <Link
                  href={`/profile/${user.id}`}
                  className="font-semibold text-sm hover:underline focus:outline-none focus:underline truncate block"
                  onClick={handleClick}
                >
                  {displayName}
                </Link>
                
                {user.role && (
                  <Badge variant="secondary" className="mt-1 text-xs">
                    {user.role}
                  </Badge>
                )}
              </div>

              {/* Follow Button */}
              {showFollowButton && !isSelf && (
                <FollowButton
                  userId={user.id}
                  initialFollowing={user.isFollowing}
                  currentUserId={currentUserId}
                  size="sm"
                  showIcon={false}
                />
              )}
            </div>

            {/* Bio */}
            {user.bio && (
              <p className="text-xs text-muted-foreground mt-2 line-clamp-2">
                {user.bio}
              </p>
            )}

            {/* Stats */}
            {showStats && (user.followerCount !== undefined || user.followingCount !== undefined) && (
              <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                {user.followerCount !== undefined && (
                  <span>
                    <span className="font-semibold text-foreground">
                      {user.followerCount}
                    </span>{' '}
                    followers
                  </span>
                )}
                {user.followingCount !== undefined && (
                  <span>
                    <span className="font-semibold text-foreground">
                      {user.followingCount}
                    </span>{' '}
                    following
                  </span>
                )}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
