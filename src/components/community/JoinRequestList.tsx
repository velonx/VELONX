"use client";

import { GroupJoinRequest } from "@/lib/hooks/useGroupMembers";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { UserPlus, Check, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";

interface JoinRequestListProps {
  requests: GroupJoinRequest[];
  isLoading?: boolean;
  onApprove: (requestId: string) => Promise<void>;
  onReject: (requestId: string) => Promise<void>;
  className?: string;
}

/**
 * JoinRequestList Component
 * Feature: community-discussion-rooms
 * Requirements: 2.3, 2.5
 * 
 * Displays pending join requests for private groups with approve/reject actions.
 * Only visible to group moderators.
 */
export default function JoinRequestList({
  requests,
  isLoading = false,
  onApprove,
  onReject,
  className
}: JoinRequestListProps) {
  const [processingId, setProcessingId] = useState<string | null>(null);

  const getInitials = (name: string | null): string => {
    if (!name) return "?";
    return name
      .split(" ")
      .map(n => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const handleApprove = async (requestId: string) => {
    setProcessingId(requestId);
    try {
      await onApprove(requestId);
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (requestId: string) => {
    setProcessingId(requestId);
    try {
      await onReject(requestId);
    } finally {
      setProcessingId(null);
    }
  };

  if (isLoading) {
    return (
      <Card className={cn("border-border/50 bg-card/50 backdrop-blur-sm", className)}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserPlus className="w-5 h-5" aria-hidden="true" />
            Join Requests
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3">
                <Skeleton className="w-10 h-10 rounded-full" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-3 w-48" />
                </div>
                <div className="flex gap-2">
                  <Skeleton className="h-8 w-20" />
                  <Skeleton className="h-8 w-20" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (requests.length === 0) {
    return (
      <Card className={cn("border-border/50 bg-card/50 backdrop-blur-sm", className)}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserPlus className="w-5 h-5" aria-hidden="true" />
            Join Requests
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <UserPlus className="w-12 h-12 mx-auto mb-2 opacity-50" aria-hidden="true" />
            <p>No pending join requests</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn("border-border/50 bg-card/50 backdrop-blur-sm", className)}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <UserPlus className="w-5 h-5" aria-hidden="true" />
          Join Requests
          <span className="ml-auto text-sm font-normal text-muted-foreground">
            {requests.length} pending
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3 max-h-[400px] overflow-y-auto">
          {requests.map((request) => {
            const requestDate = new Date(request.createdAt).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric'
            });
            const isProcessing = processingId === request.id;

            return (
              <div
                key={request.id}
                className="flex items-center gap-3 p-3 rounded-lg border border-border/50 bg-muted/30"
              >
                <Avatar className="w-10 h-10">
                  <AvatarImage 
                    src={request.user.image || undefined} 
                    alt={request.user.name || "User"} 
                  />
                  <AvatarFallback className="bg-gradient-to-br from-purple-500 to-pink-500 text-white">
                    {getInitials(request.user.name)}
                  </AvatarFallback>
                </Avatar>
                
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-foreground truncate">
                    {request.user.name || "Anonymous User"}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Requested {requestDate}
                  </p>
                </div>

                <div className="flex gap-2 shrink-0">
                  <Button
                    size="sm"
                    variant="default"
                    onClick={() => handleApprove(request.id)}
                    disabled={isProcessing}
                    className="bg-green-600 hover:bg-green-700 text-white"
                    aria-label={`Approve join request from ${request.user.name || 'user'}`}
                  >
                    <Check className="w-4 h-4 mr-1" aria-hidden="true" />
                    Approve
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleReject(request.id)}
                    disabled={isProcessing}
                    className="border-red-500/50 text-red-600 hover:bg-red-50 dark:hover:bg-red-950"
                    aria-label={`Reject join request from ${request.user.name || 'user'}`}
                  >
                    <X className="w-4 h-4 mr-1" aria-hidden="true" />
                    Reject
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
