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
  ownerId?: string; // ID of the project owner to show indicator
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
  ownerId,
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
          const isOwner = ownerId && member.userId === ownerId;

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
                      isOwner 
                        ? 'border-yellow-400 bg-yellow-50 ring-2 ring-yellow-400' 
                        : 'border-white bg-gray-100 ring-1 ring-gray-200'
                    )}
                  >
                    {userImage && (
                      <AvatarImage
                        src={userImage}
                        alt={userName}
                      />
                    )}
                    <AvatarFallback className={cn(
                      'font-semibold',
                      isOwner 
                        ? 'bg-gradient-to-br from-yellow-400 to-orange-500 text-white'
                        : 'bg-gradient-to-br from-blue-500 to-purple-600 text-white'
                    )}>
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                  {isOwner && (
                    <div 
                      className="absolute -bottom-0.5 -right-0.5 bg-yellow-400 rounded-full p-0.5 border border-white shadow-sm"
                      aria-label="Project owner"
                      title="Project owner"
                    >
                      <svg 
                        className="w-2.5 h-2.5 text-white" 
                        fill="currentColor" 
                        viewBox="0 0 20 20"
                        aria-hidden="true"
                      >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    </div>
                  )}
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>{userName}{isOwner ? ' (Owner)' : ''}</p>
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
