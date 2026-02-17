"use client";

import { useState } from "react";
import RoomCard from "./RoomCard";
import { RoomCardSkeletonLoader } from "./RoomCardSkeleton";
import { DiscussionRoomData } from "@/lib/types/community.types";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

interface RoomListProps {
  rooms: DiscussionRoomData[];
  isLoading?: boolean;
  onJoinRoom?: (roomId: string) => void;
  onViewDetails?: (room: DiscussionRoomData) => void;
  onCreateRoom?: () => void;
  memberRoomIds?: string[];
  className?: string;
}

/**
 * RoomList Component
 * Feature: community-discussion-rooms
 * Requirements: 1.1, 1.4
 * 
 * Displays a grid of discussion rooms with loading states and empty state.
 * Follows existing VELONX patterns from events/resources pages.
 */
export default function RoomList({
  rooms,
  isLoading = false,
  onJoinRoom,
  onViewDetails,
  onCreateRoom,
  memberRoomIds = [],
  className
}: RoomListProps) {
  // Show loading state
  if (isLoading) {
    return <RoomCardSkeletonLoader count={6} className={className} />;
  }

  // Show empty state
  if (rooms.length === 0) {
    return (
      <div className={cn("flex flex-col items-center justify-center py-12 px-4", className)}>
        <div className="text-6xl mb-4">💬</div>
        <h3 className="text-xl font-bold text-foreground mb-2">No Discussion Rooms Yet</h3>
        <p className="text-muted-foreground text-center mb-6 max-w-md">
          Be the first to create a discussion room and start connecting with the community!
        </p>
        {onCreateRoom && (
          <Button
            onClick={onCreateRoom}
            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:scale-105 text-white font-bold rounded-lg flex items-center gap-2 transition-all shadow-lg shadow-purple-600/20"
          >
            <Plus className="w-4 h-4" aria-hidden="true" />
            Create First Room
          </Button>
        )}
      </div>
    );
  }

  // Show rooms grid
  return (
    <div className={cn("w-full", className)}>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {rooms.map((room) => (
          <RoomCard
            key={room.id}
            room={room}
            onJoin={onJoinRoom}
            onViewDetails={onViewDetails}
            isMember={memberRoomIds.includes(room.id)}
          />
        ))}
      </div>
    </div>
  );
}
