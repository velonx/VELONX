"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Users, MessageSquare, Lock, Globe, ArrowRight } from "lucide-react";
import { DiscussionRoomData } from "@/lib/types/community.types";
import { cn } from "@/lib/utils";
import Image from "next/image";

interface RoomCardProps {
  room: DiscussionRoomData;
  onJoin?: (roomId: string) => void;
  onViewDetails?: (room: DiscussionRoomData) => void;
  isMember?: boolean;
  className?: string;
}

/**
 * RoomCard Component
 * Feature: community-discussion-rooms
 * Requirements: 1.1, 1.4
 * 
 * Displays a discussion room preview with member count, activity, and join button.
 * Follows existing VELONX card patterns from events/resources pages.
 */
export function RoomCard({
  room,
  onJoin,
  onViewDetails,
  isMember = false,
  className
}: RoomCardProps) {
  // Calculate activity level based on lastActivity
  const getActivityLevel = () => {
    if (!room.lastActivity) return 'inactive';
    
    const now = new Date();
    const lastActivity = new Date(room.lastActivity);
    const hoursSinceActivity = (now.getTime() - lastActivity.getTime()) / (1000 * 60 * 60);
    
    if (hoursSinceActivity < 1) return 'very-active';
    if (hoursSinceActivity < 24) return 'active';
    if (hoursSinceActivity < 168) return 'moderate';
    return 'inactive';
  };

  const activityLevel = getActivityLevel();

  const activityConfig = {
    'very-active': {
      label: 'Very Active',
      color: 'bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20',
      dot: 'bg-green-500'
    },
    'active': {
      label: 'Active',
      color: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20',
      dot: 'bg-blue-500'
    },
    'moderate': {
      label: 'Moderate',
      color: 'bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 border-yellow-500/20',
      dot: 'bg-yellow-500'
    },
    'inactive': {
      label: 'Quiet',
      color: 'bg-gray-500/10 text-gray-600 dark:text-gray-400 border-gray-500/20',
      dot: 'bg-gray-500'
    }
  };

  const activity = activityConfig[activityLevel];

  return (
    <Card
      className={cn(
        "bg-card border border-border rounded-[24px] overflow-hidden shadow-lg",
        "hover:shadow-xl hover:-translate-y-1 transition-all duration-300",
        "backdrop-blur-sm",
        "active:scale-[0.98] touch-manipulation",
        className
      )}
      role="article"
      aria-label={`Discussion room: ${room.name}`}
    >
      {/* Header Section with Image or Gradient */}
      <div className={`relative h-24 sm:h-32 ${!room.imageUrl ? 'bg-gradient-to-br from-purple-600 to-pink-600' : 'bg-card'} flex items-center justify-center overflow-hidden`}>
        {room.imageUrl ? (
          <>
            <Image
              src={room.imageUrl}
              alt={`Banner for ${room.name} discussion room`}
              fill
              className="object-cover"
              sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, 33vw"
              quality={85}
              loading="lazy"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/20" />
          </>
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br opacity-100" />
        )}

        {/* Privacy Badge */}
        <div className="absolute top-1.5 sm:top-2 left-1.5 sm:left-2 z-10">
          <Badge className="bg-white/30 text-white border-0 uppercase text-[8px] sm:text-[9px] font-bold tracking-widest px-1.5 sm:px-2 py-0.5 backdrop-blur-md shadow-lg">
            {room.isPrivate ? (
              <><Lock className="w-2 h-2 sm:w-2.5 sm:h-2.5 mr-0.5" aria-hidden="true" /> Private</>
            ) : (
              <><Globe className="w-2 h-2 sm:w-2.5 sm:h-2.5 mr-0.5" aria-hidden="true" /> Public</>
            )}
          </Badge>
        </div>

        {/* Activity Badge */}
        <div className="absolute top-1.5 sm:top-2 right-1.5 sm:right-2 z-10">
          <Badge className={cn('text-[8px] sm:text-[9px] border backdrop-blur-md shadow-lg font-semibold', activity.color)}>
            <span className={cn('w-1.5 h-1.5 rounded-full mr-1', activity.dot)} aria-hidden="true" />
            {activity.label}
          </Badge>
        </div>

        {/* Icon when no image */}
        {!room.imageUrl && (
          <div className="text-3xl sm:text-5xl z-10">
            💬
          </div>
        )}
      </div>

      {/* Content Section */}
      <CardHeader className="p-3 sm:p-4 pb-0">
        {/* Room Name */}
        <h3 className="text-foreground text-lg sm:text-xl font-bold leading-tight mb-1.5 sm:mb-2 line-clamp-2">
          {room.name}
        </h3>

        {/* Description */}
        <p className="text-muted-foreground text-[11px] sm:text-xs line-clamp-3 leading-relaxed mb-2 sm:mb-3">
          {room.description}
        </p>

        {/* Stats */}
        <div className="flex items-center gap-3 sm:gap-4 mb-2 sm:mb-3 text-[10px] sm:text-xs">
          <div className="flex items-center gap-1 text-muted-foreground">
            <Users className="w-3 h-3 sm:w-3.5 sm:h-3.5" aria-hidden="true" />
            <span><span className="sr-only">Members: </span>{room.memberCount} {room.memberCount === 1 ? 'member' : 'members'}</span>
          </div>
          {room.lastActivity && (
            <div className="flex items-center gap-1 text-muted-foreground">
              <MessageSquare className="w-3 h-3 sm:w-3.5 sm:h-3.5" aria-hidden="true" />
              <span><span className="sr-only">Last activity: </span>{new Date(room.lastActivity).toLocaleDateString()}</span>
            </div>
          )}
        </div>

        {/* Created Date */}
        <div className="text-[9px] sm:text-[10px] text-muted-foreground">
          Created {new Date(room.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
        </div>
      </CardHeader>

      {/* Footer - Action Buttons */}
      <CardFooter className="p-3 sm:p-4 pt-3 flex gap-2">
        {onViewDetails && (
          <Button
            onClick={() => onViewDetails(room)}
            variant="outline"
            className="flex-1 h-9 sm:h-10 border border-border hover:border-primary hover:bg-primary/5 text-foreground hover:text-primary font-semibold rounded-lg transition-all touch-manipulation active:scale-95 text-xs sm:text-sm"
            aria-label={`View details for ${room.name}`}
          >
            View Details
          </Button>
        )}

        {isMember ? (
          <Button
            onClick={() => onViewDetails?.(room)}
            className="flex-1 h-9 sm:h-10 bg-green-600 hover:bg-green-700 text-white font-bold rounded-lg flex items-center justify-center gap-1 sm:gap-1.5 transition-all touch-manipulation active:scale-95 text-xs sm:text-sm"
            aria-label={`You are a member of ${room.name}. Click to open`}
          >
            Open Room <ArrowRight className="w-3 h-3 sm:w-3.5 sm:h-3.5" aria-hidden="true" />
          </Button>
        ) : (
          <Button
            onClick={() => onJoin?.(room.id)}
            className="flex-1 h-9 sm:h-10 bg-gradient-to-r from-purple-600 to-pink-600 hover:scale-[1.02] active:scale-95 text-white font-bold rounded-lg flex items-center justify-center gap-1 sm:gap-1.5 transition-all touch-manipulation shadow-lg shadow-purple-600/20 text-xs sm:text-sm"
            aria-label={`Join ${room.name}`}
          >
            {room.isPrivate ? 'Request to Join' : 'Join Room'} <ArrowRight className="w-3 h-3 sm:w-3.5 sm:h-3.5" aria-hidden="true" />
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}

export default RoomCard;
