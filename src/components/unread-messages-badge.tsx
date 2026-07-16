"use client";

import { useEffect, useState } from "react";
import { MessageSquare } from "lucide-react";

interface UnreadMessagesBadgeProps {
  className?: string;
  onCountChange?: (count: number) => void;
  showLabel?: boolean;
}

export function UnreadMessagesBadge({ className = "", onCountChange, showLabel = false }: UnreadMessagesBadgeProps) {
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);

  const fetchUnreadCount = async () => {
    try {
      const response = await fetch('/api/messages/unread-count');
      const data = await response.json();
      if (data.success && data.data) {
        const count = data.data.count;
        setUnreadCount(count);
        onCountChange?.(count);
      } else {
        setUnreadCount(0);
      }
    } catch (error) {
      // Silently fail - database might not be connected in development
      setUnreadCount(0);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUnreadCount();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Expose refetch function globally for other components to trigger updates
  useEffect(() => {
    if (typeof window !== "undefined") {
      (window as any).refetchUnreadMessagesCount = fetchUnreadCount;
    }
    return () => {
      if (typeof window !== "undefined") {
        delete (window as any).refetchUnreadMessagesCount;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const displayCount = unreadCount > 99 ? "99+" : unreadCount.toString();

  return (
    <div className={`flex flex-col items-center justify-center gap-1 ${className}`}>
      <div className="relative flex items-center justify-center">
        {/* Custom SVG matching the solid chat bubble with 3 dots */}
        <svg 
          width="24" 
          height="24" 
          viewBox="0 0 24 24" 
          fill="currentColor" 
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          <path d="M12 2C6.477 2 2 6.03 2 11c0 2.864 1.487 5.412 3.82 7.086C5.556 19.5 4.86 21.05 4.86 21.05c-.173.396.223.755.597.585 0 0 3.32-.975 5.518-1.554C11.312 20.155 11.652 20 12 20c5.523 0 10-4.03 10-9s-4.477-9-10-9z" fill="currentColor"/>
          <circle cx="8" cy="11" r="1.5" fill="white" />
          <circle cx="12" cy="11" r="1.5" fill="white" />
          <circle cx="16" cy="11" r="1.5" fill="white" />
        </svg>
        {!isLoading && unreadCount > 0 && (
          <>
            <span className="absolute -top-0.5 -right-0.5 flex h-2.5 w-2.5 items-center justify-center rounded-full bg-red-500 shadow-sm ring-2 ring-background">
            </span>
            <span className="sr-only">
              {unreadCount === 1 ? '1 unread message' : `${unreadCount} unread messages`}
            </span>
          </>
        )}
        {!isLoading && unreadCount === 0 && (
          <span className="sr-only">No unread messages</span>
        )}
      </div>
      {showLabel && (
        <span className="text-[10px] font-medium leading-none">Messaging</span>
      )}
    </div>
  );
}
