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
 * Following List Props Interface
 */
export interface FollowingListProps {
  userId: string;
  currentUserId?: string;
  isOpen: boolean;
  onClose: () => void;
}

/**
 * FollowingList Component
 * 
 * Modal displaying a list of users that the specified user follows.
 * 
 * Features:
 * - Fetches following list
 * - Displays user cards
 * - Loading state
 * - Empty state
 * - Error handling
 * - Scrollable list
 * - Accessibility support
 * 
 * @example
 * ```tsx
 * <FollowingList
 *   userId="user-123"
 *   currentUserId="current-user-id"
 *   isOpen={showFollowing}
 *   onClose={() => setShowFollowing(false)}
 * />
 * ```
 */
export function FollowingList({
  userId,
  currentUserId,
  isOpen,
  onClose,
}: FollowingListProps) {
  const [following, setFollowing] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Fetch following when modal opens
   */
  useEffect(() => {
    if (!isOpen) return;

    const fetchFollowing = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch(`/api/community/follow/following?userId=${userId}`);

        if (!response.ok) {
          throw new Error('Failed to fetch following');
        }

        const data = await response.json();
        setFollowing(data.data || []);
      } catch (err) {
        console.error('[FollowingList] Fetch error:', err);
        setError(err instanceof Error ? err.message : 'Failed to load following');
      } finally {
        setIsLoading(false);
      }
    };

    fetchFollowing();
  }, [isOpen, userId]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UsersIcon className="size-5" />
            Following
          </DialogTitle>
          <DialogDescription>
            People this user follows
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
          ) : following.length === 0 ? (
            <div className="text-center py-8">
              <UsersIcon className="size-12 mx-auto text-muted-foreground mb-2" />
              <p className="text-sm text-muted-foreground">Not following anyone yet</p>
            </div>
          ) : (
            <div className="space-y-2">
              {following.map((user) => (
                <UserCard
                  key={user.id}
                  user={user}
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
