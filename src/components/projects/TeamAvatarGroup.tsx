/**
 * TeamAvatarGroup Component
 * Feature: project-page-ui-improvements
 * 
 * Displays team member avatars in an overlapping layout with tooltips
 * Requirements: 10.1, 10.2, 10.3, 10.4, 10.5
 */

'use client';

import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import { ProjectMember } from '@/lib/api/types';

export interface TeamAvatarGroupProps {
  members: ProjectMember[];
  maxDisplay?: number;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const SIZE_CLASSES = {
  sm: 'size-6 text-xs',
  md: 'size-8 text-sm',
  lg: 'size-10 text-base',
};

const BORDER_WIDTH = {
  sm: 'border-2',
  md: 'border-2',
  lg: 'border-[3px]',
};

/**
 * Get initials from a name
 * @param name - User's full name
 * @returns Two-letter initials
 */
function getInitials(name: string | null | undefined): string {
  if (!name || name.trim() === '') return 'UU'; // Unknown User
  
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) {
    return parts[0].substring(0, 2).toUpperCase();
  }
  
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

/**
 * TeamAvatarGroup Component
 * 
 * Displays team member avatars in an overlapping layout.
 * Shows up to maxDisplay avatars with a "+N more" indicator for overflow.
 * Each avatar shows a tooltip with the member's name on hover.
 */
export function TeamAvatarGroup({
  members,
  maxDisplay = 4,
  size = 'md',
  className,
}: TeamAvatarGroupProps) {
  const displayMembers = members.slice(0, maxDisplay);
  const remainingCount = Math.max(0, members.length - maxDisplay);
  const hasOverflow = remainingCount > 0;

  // Calculate overlap offset based on size
  const overlapOffset = size === 'sm' ? '-ml-2' : size === 'md' ? '-ml-3' : '-ml-4';

  return (
    <TooltipProvider>
      <div
        className={cn('flex items-center', className)}
        role="group"
        aria-label={`Team members: ${members.length} total`}
      >
        {displayMembers.map((member, index) => {
          const userName = member.user?.name || 'Unknown User';
          const userImage = member.user?.image;
          const initials = getInitials(userName);

          return (
            <Tooltip key={member.id}>
              <TooltipTrigger asChild>
                <div
                  className={cn(
                    'relative',
                    index > 0 && overlapOffset
                  )}
                  style={{ zIndex: displayMembers.length - index }}
                >
                  <Avatar
                    className={cn(
                      SIZE_CLASSES[size],
                      BORDER_WIDTH[size],
                      'border-white bg-gray-100 ring-1 ring-gray-200'
                    )}
                  >
                    {userImage && (
                      <AvatarImage
                        src={userImage}
                        alt={userName}
                      />
                    )}
                    <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white font-semibold">
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>{userName}</p>
              </TooltipContent>
            </Tooltip>
          );
        })}

        {hasOverflow && (
          <Tooltip>
            <TooltipTrigger asChild>
              <div
                className={cn(
                  'relative',
                  overlapOffset
                )}
                style={{ zIndex: 0 }}
              >
                <Avatar
                  className={cn(
                    SIZE_CLASSES[size],
                    BORDER_WIDTH[size],
                    'border-white bg-gray-200 ring-1 ring-gray-300'
                  )}
                >
                  <AvatarFallback className="bg-gray-200 text-gray-700 font-semibold">
                    +{remainingCount}
                  </AvatarFallback>
                </Avatar>
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p>{remainingCount} more member{remainingCount !== 1 ? 's' : ''}</p>
            </TooltipContent>
          </Tooltip>
        )}
      </div>
    </TooltipProvider>
  );
}
