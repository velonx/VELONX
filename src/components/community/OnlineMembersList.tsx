"use client";

import { Avatar } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { Users } from "lucide-react";
import Image from "next/image";

interface OnlineMember {
  id: string;
  name: string;
  image?: string;
  isOnline: boolean;
}

interface OnlineMembersListProps {
  members: OnlineMember[];
  className?: string;
}

/**
 * OnlineMembersList Component
 * Feature: community-discussion-rooms
 * Requirements: 1.2, 3.7
 * 
 * Displays a sidebar list of online members with status indicators.
 */
export default function OnlineMembersList({ members, className }: OnlineMembersListProps) {
  const onlineMembers = members.filter(m => m.isOnline);
  const offlineMembers = members.filter(m => !m.isOnline);

  return (
    <div className={cn("flex flex-col h-full bg-card border-l border-border", className)}>
      {/* Header */}
      <div className="p-3 sm:p-4 border-b border-border">
        <div className="flex items-center gap-2">
          <Users className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
          <h3 className="font-semibold text-sm text-foreground">
            Members ({members.length})
          </h3>
        </div>
        <p className="text-xs text-muted-foreground mt-1">
          {onlineMembers.length} online
        </p>
      </div>

      {/* Members List */}
      <ScrollArea className="flex-1">
        <div className="p-2 space-y-1">
          {/* Online Members */}
          {onlineMembers.length > 0 && (
            <>
              <div className="px-2 py-1">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Online — {onlineMembers.length}
                </p>
              </div>
              {onlineMembers.map((member) => (
                <MemberItem key={member.id} member={member} />
              ))}
            </>
          )}

          {/* Offline Members */}
          {offlineMembers.length > 0 && (
            <>
              <div className="px-2 py-1 mt-3">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Offline — {offlineMembers.length}
                </p>
              </div>
              {offlineMembers.map((member) => (
                <MemberItem key={member.id} member={member} />
              ))}
            </>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}

function MemberItem({ member }: { member: OnlineMember }) {
  return (
    <div
      className={cn(
        "flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer",
        !member.isOnline && "opacity-60"
      )}
      role="button"
      tabIndex={0}
      aria-label={`${member.name} - ${member.isOnline ? 'Online' : 'Offline'}`}
    >
      {/* Avatar with Status Indicator */}
      <div className="relative flex-shrink-0">
        <Avatar className="h-8 w-8">
          {member.image ? (
            <Image
              src={member.image}
              alt={member.name}
              fill
              className="object-cover"
            />
          ) : (
            <div className="flex items-center justify-center w-full h-full bg-gradient-to-br from-purple-600 to-pink-600 text-white font-bold text-xs">
              {member.name.charAt(0).toUpperCase()}
            </div>
          )}
        </Avatar>
        {/* Online Status Dot */}
        <span
          className={cn(
            "absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-card",
            member.isOnline ? "bg-green-500" : "bg-gray-400"
          )}
          aria-hidden="true"
        />
      </div>

      {/* Member Name */}
      <span className="text-sm font-medium text-foreground truncate flex-1">
        {member.name}
      </span>
    </div>
  );
}
