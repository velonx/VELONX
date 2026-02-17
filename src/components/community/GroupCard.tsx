"use client";

import { CommunityGroupData } from "@/lib/types/community.types";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Users, Lock, Globe, MessageSquare } from "lucide-react";
import { cn } from "@/lib/utils";
import Image from "next/image";

interface GroupCardProps {
  group: CommunityGroupData;
  onJoin?: (groupId: string) => void;
  onRequest?: (groupId: string) => void;
  onViewDetails?: (group: CommunityGroupData) => void;
  isMember?: boolean;
  hasPendingRequest?: boolean;
  className?: string;
}

/**
 * GroupCard Component
 * Feature: community-discussion-rooms
 * Requirements: 2.1, 2.2
 * 
 * Displays a community group preview with join button and privacy badge.
 * Follows existing VELONX card patterns from events/resources pages.
 */
export function GroupCard({
  group,
  onJoin,
  onRequest,
  onViewDetails,
  isMember = false,
  hasPendingRequest = false,
  className
}: GroupCardProps) {
  const handleJoinClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (group.isPrivate && onRequest) {
      onRequest(group.id);
    } else if (onJoin) {
      onJoin(group.id);
    }
  };

  const handleCardClick = () => {
    if (onViewDetails) {
      onViewDetails(group);
    }
  };

  return (
    <Card
      className={cn(
        "group cursor-pointer transition-all duration-300 hover:shadow-lg hover:scale-[1.02] border-border/50 bg-card/50 backdrop-blur-sm",
        className
      )}
      onClick={handleCardClick}
      role="article"
      aria-label={`${group.name} - ${group.isPrivate ? 'Private' : 'Public'} group with ${group.memberCount} members`}
    >
      <CardHeader className="pb-3">
        {/* Group Image */}
        {group.imageUrl ? (
          <div className="relative w-full h-32 mb-3 rounded-lg overflow-hidden bg-muted">
            <Image
              src={group.imageUrl}
              alt={`${group.name} cover image`}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          </div>
        ) : (
          <div className="w-full h-32 mb-3 rounded-lg bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center">
            <Users className="w-12 h-12 text-purple-500/50" aria-hidden="true" />
          </div>
        )}

        {/* Group Name and Privacy Badge */}
        <div className="flex items-start justify-between gap-2">
          <h3 className="text-lg font-bold text-foreground line-clamp-1 flex-1">
            {group.name}
          </h3>
          <Badge
            variant={group.isPrivate ? "secondary" : "outline"}
            className={cn(
              "shrink-0",
              group.isPrivate 
                ? "bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20" 
                : "bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/20"
            )}
          >
            {group.isPrivate ? (
              <>
                <Lock className="w-3 h-3" aria-hidden="true" />
                Private
              </>
            ) : (
              <>
                <Globe className="w-3 h-3" aria-hidden="true" />
                Public
              </>
            )}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="pb-3">
        {/* Description */}
        <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
          {group.description}
        </p>

        {/* Stats */}
        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          <div className="flex items-center gap-1" aria-label={`${group.memberCount} members`}>
            <Users className="w-4 h-4" aria-hidden="true" />
            <span>{group.memberCount} {group.memberCount === 1 ? 'member' : 'members'}</span>
          </div>
          <div className="flex items-center gap-1" aria-label={`${group.postCount} posts`}>
            <MessageSquare className="w-4 h-4" aria-hidden="true" />
            <span>{group.postCount} {group.postCount === 1 ? 'post' : 'posts'}</span>
          </div>
        </div>
      </CardContent>

      <CardFooter className="pt-3 border-t border-border/50">
        {isMember ? (
          <Button
            variant="outline"
            className="w-full"
            disabled
            aria-label="Already a member of this group"
          >
            <Users className="w-4 h-4 mr-2" aria-hidden="true" />
            Member
          </Button>
        ) : hasPendingRequest ? (
          <Button
            variant="outline"
            className="w-full"
            disabled
            aria-label="Join request pending approval"
          >
            <Lock className="w-4 h-4 mr-2" aria-hidden="true" />
            Request Pending
          </Button>
        ) : (
          <Button
            onClick={handleJoinClick}
            className={cn(
              "w-full font-semibold transition-all",
              group.isPrivate
                ? "bg-amber-600 hover:bg-amber-700 text-white"
                : "bg-gradient-to-r from-purple-600 to-pink-600 hover:scale-105 text-white"
            )}
            aria-label={group.isPrivate ? `Request to join ${group.name}` : `Join ${group.name}`}
          >
            {group.isPrivate ? (
              <>
                <Lock className="w-4 h-4 mr-2" aria-hidden="true" />
                Request to Join
              </>
            ) : (
              <>
                <Users className="w-4 h-4 mr-2" aria-hidden="true" />
                Join Group
              </>
            )}
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}

export default GroupCard;
