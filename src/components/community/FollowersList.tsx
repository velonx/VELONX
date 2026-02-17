'use client';

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { UserCard, type User } from './UserCard';
import { LoaderIcon, UsersIcon } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';

/**
 * Followers List Props Interface
 */
export interface FollowersListProps {
  userId: string;
  currentUserId?: string;
  isOpen: boolean;
  onClose: () => void;
}

/**
 * FollowersList Component
 * 
 * Modal displaying a list of users who follow the specified user.
 * 
 * Features:
 * - Fetches followers list
 * - Displays user cards
 * - Loading state
 * - Empty state
 * - Error handling
 * - Scrollable list
 * - Accessibility support
 * 
 * @example
 * ```tsx
 * <FollowersList
 *   userId="user-123"
 *   currentUserId="current-user-id"
 *   isOpen={showFollowers}
 *   onClose={() => setShowFollowers(false)}
 * />
 * ```
 */
export function FollowersList({
  userId,
  currentUserId,
  isOpen,
  onClose,
}: FollowersListProps) {
  const [followers, setFollowers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Fetch followers when modal opens
   */
  useEffect(() => {
    if (!isOpen) return;

    const fetchFollowers = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch(`/api/community/follow/followers?userId=${userId}`);

        if (!response.ok) {
          throw new Error('Failed to fetch followers');
        }

        const data = await response.json();
        setFollowers(data.data || []);
      } catch (err) {
        console.error('[FollowersList] Fetch error:', err);
        setError(err instanceof Error ? err.message : 'Failed to load followers');
      } finally {
        setIsLoading(false);
      }
    };

    fetchFollowers();
  }, [isOpen, userId]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UsersIcon className="size-5" />
            Followers
          </DialogTitle>
          <DialogDescription>
            People who follow this user
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[60vh]">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <LoaderIcon className="size-6 animate-spin text-muted-foreground" />
            </div>
          ) : error ? (
            <div className="text-center py-8">
              <p className="text-sm text-destructive">{error}</p>
            </div>
          ) : followers.length === 0 ? (
            <div className="text-center py-8">
              <UsersIcon className="size-12 mx-auto text-muted-foreground mb-2" />
              <p className="text-sm text-muted-foreground">No followers yet</p>
            </div>
          ) : (
            <div className="space-y-2">
              {followers.map((follower) => (
                <UserCard
                  key={follower.id}
                  user={follower}
                  currentUserId={currentUserId}
                  showFollowButton={true}
                  showStats={false}
                />
              ))}
            </div>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
