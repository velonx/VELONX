'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { HeartIcon, SparklesIcon, LightbulbIcon, PartyPopperIcon } from 'lucide-react';
import { usePostReactions, type ReactionType } from '@/lib/hooks/usePostReactions';
import { cn } from '@/lib/utils';

/**
 * Post Reactions Props Interface
 */
export interface PostReactionsProps {
  postId: string;
  currentReaction?: ReactionType | null;
  className?: string;
}

/**
 * Reaction Icon Mapping
 */
const REACTION_ICONS: Record<ReactionType, { icon: React.ComponentType<{ className?: string }>; label: string; color: string }> = {
  LIKE: {
    icon: HeartIcon,
    label: 'Like',
    color: 'text-red-500',
  },
  LOVE: {
    icon: ({ className }) => <HeartIcon className={cn('fill-current', className)} />,
    label: 'Love',
    color: 'text-pink-500',
  },
  INSIGHTFUL: {
    icon: LightbulbIcon,
    label: 'Insightful',
    color: 'text-yellow-500',
  },
  CELEBRATE: {
    icon: PartyPopperIcon,
    label: 'Celebrate',
    color: 'text-purple-500',
  },
};

/**
 * PostReactions Component
 * 
 * Reaction buttons for community posts with visual feedback.
 * 
 * Features:
 * - Multiple reaction types (Like, Love, Insightful, Celebrate)
 * - Toggle reactions on/off
 * - Visual feedback for active reactions
 * - Optimistic UI updates
 * - Accessibility support
 * 
 * @example
 * ```tsx
 * <PostReactions
 *   postId="post-123"
 *   currentReaction="LIKE"
 * />
 * ```
 */
export function PostReactions({
  postId,
  currentReaction: initialReaction = null,
  className,
}: PostReactionsProps) {
  const [currentReaction, setCurrentReaction] = useState<ReactionType | null>(initialReaction);
  const [showReactions, setShowReactions] = useState(false);
  const { addReaction, removeReaction, isReacting } = usePostReactions();

  /**
   * Handle reaction click
   */
  const handleReaction = async (type: ReactionType) => {
    // Optimistic update
    const previousReaction = currentReaction;
    
    try {
      if (currentReaction === type) {
        // Remove reaction if clicking the same one
        setCurrentReaction(null);
        await removeReaction(postId);
      } else {
        // Add or change reaction
        setCurrentReaction(type);
        await addReaction(postId, type);
      }
      setShowReactions(false);
    } catch (error) {
      // Rollback on error
      setCurrentReaction(previousReaction);
    }
  };

  /**
   * Get the primary reaction button
   */
  const getPrimaryButton = () => {
    if (currentReaction) {
      const reaction = REACTION_ICONS[currentReaction];
      const Icon = reaction.icon;
      return (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => handleReaction(currentReaction)}
          disabled={isReacting}
          className={cn('flex-1', reaction.color)}
          aria-label={`Remove ${reaction.label} reaction`}
        >
          <Icon className="size-4" />
          {reaction.label}
        </Button>
      );
    }

    return (
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setShowReactions(!showReactions)}
        disabled={isReacting}
        className="flex-1"
        aria-label="React to post"
        aria-expanded={showReactions}
      >
        <HeartIcon />
        React
      </Button>
    );
  };

  return (
    <div className={cn('relative', className)}>
      {getPrimaryButton()}

      {/* Reaction Picker */}
      {showReactions && !currentReaction && (
        <div className="absolute bottom-full left-0 mb-2 flex gap-1 p-2 bg-background border rounded-lg shadow-lg z-10">
          {(Object.entries(REACTION_ICONS) as [ReactionType, typeof REACTION_ICONS[ReactionType]][]).map(
            ([type, { icon: Icon, label, color }]) => (
              <button
                key={type}
                onClick={() => handleReaction(type)}
                disabled={isReacting}
                className={cn(
                  'p-2 rounded-md hover:bg-accent transition-colors',
                  color
                )}
                aria-label={label}
                title={label}
              >
                <Icon className="size-5" />
              </button>
            )
          )}
        </div>
      )}
    </div>
  );
}
