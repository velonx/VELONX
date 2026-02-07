"use client";

import { useEffect, useState } from "react";
import { notificationsApi } from "@/lib/api/client";
import { Bell } from "lucide-react";

interface UnreadCountBadgeProps {
  className?: string;
  onCountChange?: (count: number) => void;
}

export function UnreadCountBadge({ className = "", onCountChange }: UnreadCountBadgeProps) {
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);

  const fetchUnreadCount = async () => {
    try {
      const response = await notificationsApi.getUnreadCount();
      const count = response.data.count;
      setUnreadCount(count);
      onCountChange?.(count);
    } catch (error) {
      // Silently fail - database might not be connected in development
      setUnreadCount(0);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUnreadCount();
  }, []);

  // Expose refetch function globally for other components to trigger updates
  useEffect(() => {
    if (typeof window !== "undefined") {
      (window as any).refetchUnreadCount = fetchUnreadCount;
    }
    return () => {
      if (typeof window !== "undefined") {
        delete (window as any).refetchUnreadCount;
      }
    };
  }, []);

  const displayCount = unreadCount > 99 ? "99+" : unreadCount.toString();

  return (
    <div className={`relative ${className}`}>
      <Bell className="w-5 h-5" aria-hidden="true" />
      {!isLoading && unreadCount > 0 && (
        <>
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1">
            {displayCount}
          </span>
          <span className="sr-only">
            {unreadCount === 1 ? '1 unread notification' : `${unreadCount} unread notifications`}
          </span>
        </>
      )}
      {!isLoading && unreadCount === 0 && (
        <span className="sr-only">No unread notifications</span>
      )}
    </div>
  );
}
