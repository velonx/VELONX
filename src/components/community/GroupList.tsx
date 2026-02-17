"use client";

import { useState } from "react";
import GroupCard from "./GroupCard";
import { GroupCardSkeletonLoader } from "./GroupCardSkeleton";
import { CommunityGroupData } from "@/lib/types/community.types";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Plus, Filter } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface GroupListProps {
  groups: CommunityGroupData[];
  isLoading?: boolean;
  onJoinGroup?: (groupId: string) => void;
  onRequestJoinGroup?: (groupId: string) => void;
  onViewDetails?: (group: CommunityGroupData) => void;
  onCreateGroup?: () => void;
  memberGroupIds?: string[];
  pendingRequestGroupIds?: string[];
  className?: string;
}

type FilterType = "all" | "public" | "private";

/**
 * GroupList Component
 * Feature: community-discussion-rooms
 * Requirements: 2.1, 2.2
 * 
 * Displays a grid of community groups with filters and loading states.
 * Follows existing VELONX patterns from events/resources pages.
 */
export default function GroupList({
  groups,
  isLoading = false,
  onJoinGroup,
  onRequestJoinGroup,
  onViewDetails,
  onCreateGroup,
  memberGroupIds = [],
  pendingRequestGroupIds = [],
  className
}: GroupListProps) {
  const [filter, setFilter] = useState<FilterType>("all");

  // Filter groups based on selected filter
  const filteredGroups = groups.filter(group => {
    if (filter === "public") return !group.isPrivate;
    if (filter === "private") return group.isPrivate;
    return true;
  });

  // Show loading state
  if (isLoading) {
    return <GroupCardSkeletonLoader count={6} className={className} />;
  }

  // Show empty state
  if (groups.length === 0) {
    return (
      <div className={cn("flex flex-col items-center justify-center py-12 px-4", className)}>
        <div className="text-6xl mb-4">👥</div>
        <h3 className="text-xl font-bold text-foreground mb-2">No Community Groups Yet</h3>
        <p className="text-muted-foreground text-center mb-6 max-w-md">
          Be the first to create a community group and bring people together around shared interests!
        </p>
        {onCreateGroup && (
          <Button
            onClick={onCreateGroup}
            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:scale-105 text-white font-bold rounded-lg flex items-center gap-2 transition-all shadow-lg shadow-purple-600/20"
          >
            <Plus className="w-4 h-4" aria-hidden="true" />
            Create First Group
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className={cn("w-full space-y-6", className)}>
      {/* Filter Bar */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-muted-foreground" aria-hidden="true" />
          <Select value={filter} onValueChange={(value) => setFilter(value as FilterType)}>
            <SelectTrigger className="w-[180px]" aria-label="Filter groups by type">
              <SelectValue placeholder="Filter groups" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Groups</SelectItem>
              <SelectItem value="public">Public Only</SelectItem>
              <SelectItem value="private">Private Only</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {onCreateGroup && (
          <Button
            onClick={onCreateGroup}
            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:scale-105 text-white font-bold rounded-lg flex items-center gap-2 transition-all shadow-lg shadow-purple-600/20"
          >
            <Plus className="w-4 h-4" aria-hidden="true" />
            Create Group
          </Button>
        )}
      </div>

      {/* Groups Grid */}
      {filteredGroups.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 px-4">
          <div className="text-4xl mb-4">🔍</div>
          <h3 className="text-lg font-semibold text-foreground mb-2">No Groups Found</h3>
          <p className="text-muted-foreground text-center max-w-md">
            No groups match your current filter. Try adjusting your filters or create a new group.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredGroups.map((group) => (
            <GroupCard
              key={group.id}
              group={group}
              onJoin={onJoinGroup}
              onRequest={onRequestJoinGroup}
              onViewDetails={onViewDetails}
              isMember={memberGroupIds.includes(group.id)}
              hasPendingRequest={pendingRequestGroupIds.includes(group.id)}
            />
          ))}
        </div>
      )}

      {/* Results Count */}
      <div className="text-sm text-muted-foreground text-center">
        Showing {filteredGroups.length} of {groups.length} {groups.length === 1 ? 'group' : 'groups'}
      </div>
    </div>
  );
}
