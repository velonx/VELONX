"use client";

import { cn } from "@/lib/utils";

interface TypingIndicatorProps {
  userNames: string[];
  className?: string;
}

/**
 * TypingIndicator Component
 * Feature: community-discussion-rooms
 * Requirements: 3.7
 * 
 * Displays animated typing indicator with user names.
 */
export default function TypingIndicator({ userNames, className }: TypingIndicatorProps) {
  if (userNames.length === 0) {
    return null;
  }

  const displayText = (() => {
    if (userNames.length === 1) {
      return `${userNames[0]} is typing...`;
    } else if (userNames.length === 2) {
      return `${userNames[0]} and ${userNames[1]} are typing...`;
    } else if (userNames.length === 3) {
      return `${userNames[0]}, ${userNames[1]}, and ${userNames[2]} are typing...`;
    } else {
      return `${userNames[0]}, ${userNames[1]}, and ${userNames.length - 2} others are typing...`;
    }
  })();

  return (
    <div
      className={cn("flex items-center gap-2 px-3 py-2 text-sm text-muted-foreground", className)}
      role="status"
      aria-live="polite"
      aria-label={displayText}
    >
      <div className="flex gap-1">
        <span className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
        <span className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
        <span className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
      </div>
      <span className="text-xs">{displayText}</span>
    </div>
  );
}
