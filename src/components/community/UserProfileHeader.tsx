'use client';

import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { FollowButton } from './FollowButton';
import { FollowersList } from './FollowersList';
import { FollowingList } from './FollowingList';
import { UserIcon, MailIcon, CalendarIcon } from 'lucide-react';
import { formatDistanceToNow } from '@/lib/utils/date-helpers';

/**
 * User Profile Data Interface
 */
export interface UserProfileData {
  id: string;
  name: string | null;
  email: string;
  image: string | null;
  role?: string;
  bio?: string;
  location?: string;
  website?: string;
  followerCount: number;
  followingCount: number;
  postCount?: number;
  isFollowing?: boolean;
  createdAt: Date;
}

/**
 * User Profile Header Props Interface
 */
export interface UserProfileHeaderProps {
  user: UserProfileData;
  currentUserId?: string;
  onFollowChange?: (isFollowing: boolean) => void;
  className?: string;
}

/**
 * UserProfileHeader Component
 * 
 * Displays a user profile header with follower counts and follow button.
 * 
 * Features:
 * - User avatar and info
 * - Follow button
 * - Follower/following counts (clickable)
 * - Post count
 * - Bio and additional info
 * - Modals for followers/following lists
 * - Accessibility support
 * 
 * @example
 * ```tsx
 * <UserProfileHeader
 *   user={userProfileData}
 *   currentUserId="current-user-id"
 *   onFollowChange={(isFollowing) => console.log('Follow status:', isFollowing)}
 * />
 * ```
 */
export function UserProfileHeader({
  user,
  currentUserId,
  onFollowChange,
  className,
}: UserProfileHeaderProps) {
  const [showFollowers, setShowFollowers] = useState(false);
  const [showFollowing, setShowFollowing] = useState(false);
  const [localFollowerCount, setLocalFollowerCount] = useState(user.followerCount);
  const [localIsFollowing, setLocalIsFollowing] = useState(user.isFollowing);

  const displayName = user.name || user.email.split('@')[0];
  const isSelf = currentUserId === user.id;

  /**
   * Handle follow status change
   */
  const handleFollowChange = (isFollowing: boolean) => {
    setLocalIsFollowing(isFollowing);
    setLocalFollowerCount(prev => isFollowing ? prev + 1 : prev - 1);
    onFollowChange?.(isFollowing);
  };

  return (
    <>
      <Card className={className}>
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row gap-6">
            {/* Avatar */}
            <div className="shrink-0">
              <div className="size-24 sm:size-32 rounded-full bg-primary/10 flex items-center justify-center overflow-hidden">
                {user.image ? (
                  <img
                    src={user.image}
                    alt={displayName}
                    className="size-full object-cover"
                  />
                ) : (
                  <UserIcon className="size-12 sm:size-16 text-primary" />
                )}
              </div>
            </div>

            {/* User Info */}
            <div className="flex-1 min-w-0">
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <h1 className="text-2xl font-bold truncate">{displayName}</h1>
                  
                  <div className="flex items-center gap-2 mt-1 flex-wrap">
                    {user.role && (
                      <Badge variant="secondary">{user.role}</Badge>
                    )}
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <CalendarIcon className="size-4" />
                      <span>
                        Joined {formatDistanceToNow(user.createdAt, { addSuffix: true })}
                      </span>
                    </div>
                  </div>

                  {user.email && (
                    <div className="flex items-center gap-1 text-sm text-muted-foreground mt-2">
                      <MailIcon className="size-4" />
                      <span className="truncate">{user.email}</span>
                    </div>
                  )}
                </div>

                {/* Follow Button */}
                {!isSelf && (
                  <FollowButton
                    userId={user.id}
                    initialFollowing={localIsFollowing}
                    currentUserId={currentUserId}
                    onFollowChange={handleFollowChange}
                  />
                )}
              </div>

              {/* Bio */}
              {user.bio && (
                <p className="text-sm text-muted-foreground mt-4 whitespace-pre-wrap">
                  {user.bio}
                </p>
              )}

              {/* Additional Info */}
              {(user.location || user.website) && (
                <div className="flex items-center gap-4 mt-4 text-sm text-muted-foreground flex-wrap">
                  {user.location && <span>📍 {user.location}</span>}
                  {user.website && (
                    <a
                      href={user.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline truncate"
                    >
                      🔗 {user.website}
                    </a>
                  )}
                </div>
              )}

              {/* Stats */}
              <div className="flex items-center gap-6 mt-4 text-sm">
                {user.postCount !== undefined && (
                  <div>
                    <span className="font-semibold text-foreground">
                      {user.postCount}
                    </span>{' '}
                    <span className="text-muted-foreground">posts</span>
                  </div>
                )}
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowFollowers(true)}
                  className="p-0 h-auto hover:bg-transparent"
                  aria-label={`View ${localFollowerCount} followers`}
                >
                  <span className="font-semibold text-foreground">
                    {localFollowerCount}
                  </span>{' '}
                  <span className="text-muted-foreground hover:underline">
                    followers
                  </span>
                </Button>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowFollowing(true)}
                  className="p-0 h-auto hover:bg-transparent"
                  aria-label={`View ${user.followingCount} following`}
                >
                  <span className="font-semibold text-foreground">
                    {user.followingCount}
                  </span>{' '}
                  <span className="text-muted-foreground hover:underline">
                    following
                  </span>
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Followers Modal */}
      <FollowersList
        userId={user.id}
        currentUserId={currentUserId}
        isOpen={showFollowers}
        onClose={() => setShowFollowers(false)}
      />

      {/* Following Modal */}
      <FollowingList
        userId={user.id}
        currentUserId={currentUserId}
        isOpen={showFollowing}
        onClose={() => setShowFollowing(false)}
      />
    </>
  );
}
