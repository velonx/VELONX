"use client";

import { GroupMember } from "@/lib/hooks/useGroupMembers";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Users, Crown, Shield } from "lucide-react";
import { cn } from "@/lib/utils";

interface GroupMembersProps {
  members: GroupMember[];
  isLoading?: boolean;
  ownerId?: string;
  moderatorIds?: string[];
  className?: string;
}

/**
 * GroupMembers Component
 * Feature: community-discussion-rooms
 * Requirements: 2.3, 2.4
 * 
 * Displays a list of group members with their roles (owner, moderator, member).
 */
export default function GroupMembers({
  members,
  isLoading = false,
  ownerId,
  moderatorIds = [],
  className
}: GroupMembersProps) {
  const getInitials = (name: string | null): string => {
    if (!name) return "?";
    return name
      .split(" ")
      .map(n => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const getMemberRole = (userId: string): "owner" | "moderator" | "member" => {
    if (userId === ownerId) return "owner";
    if (moderatorIds.includes(userId)) return "moderator";
    return "member";
  };

  const getRoleBadge = (role: "owner" | "moderator" | "member") => {
    switch (role) {
      case "owner":
        return (
          <Badge variant="default" className="bg-purple-600 text-white">
            <Crown className="w-3 h-3 mr-1" aria-hidden="true" />
            Owner
          </Badge>
        );
      case "moderator":
        return (
          <Badge variant="secondary" className="bg-blue-600/10 text-blue-700 dark:text-blue-400 border-blue-600/20">
            <Shield className="w-3 h-3 mr-1" aria-hidden="true" />
            Moderator
          </Badge>
        );
      default:
        return null;
    }
  };

  if (isLoading) {
    return (
      <Card className={cn("border-border/50 bg-card/50 backdrop-blur-sm", className)}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" aria-hidden="true" />
            Members
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3">
                <Skeleton className="w-10 h-10 rounded-full" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-3 w-48" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (members.length === 0) {
    return (
      <Card className={cn("border-border/50 bg-card/50 backdrop-blur-sm", className)}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" aria-hidden="true" />
            Members
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <Users className="w-12 h-12 mx-auto mb-2 opacity-50" aria-hidden="true" />
            <p>No members yet</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Sort members: owner first, then moderators, then regular members
  const sortedMembers = [...members].sort((a, b) => {
    const roleA = getMemberRole(a.userId);
    const roleB = getMemberRole(b.userId);
    
    const roleOrder = { owner: 0, moderator: 1, member: 2 };
    return roleOrder[roleA] - roleOrder[roleB];
  });

  return (
    <Card className={cn("border-border/50 bg-card/50 backdrop-blur-sm", className)}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="w-5 h-5" aria-hidden="true" />
          Members
          <Badge variant="outline" className="ml-auto">
            {members.length}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3 max-h-[500px] overflow-y-auto">
          {sortedMembers.map((member) => {
            const role = getMemberRole(member.userId);
            const joinDate = new Date(member.joinedAt).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric'
            });

            return (
              <div
                key={member.id}
                className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors"
              >
                <Avatar className="w-10 h-10">
                  <AvatarImage src={member.user.image || undefined} alt={member.user.name || "User"} />
                  <AvatarFallback className="bg-gradient-to-br from-purple-500 to-pink-500 text-white">
                    {getInitials(member.user.name)}
                  </AvatarFallback>
                </Avatar>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-medium text-foreground truncate">
                      {member.user.name || "Anonymous User"}
                    </p>
                    {getRoleBadge(role)}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Joined {joinDate}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
