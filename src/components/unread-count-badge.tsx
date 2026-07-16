"use client";

import { useEffect, useState } from "react";
import { notificationsApi } from "@/lib/api/client";
import { Bell } from "lucide-react";

interface UnreadCountBadgeProps {
  className?: string;
  onCountChange?: (count: number) => void;
  showLabel?: boolean;
}

export function UnreadCountBadge({ className = "", onCountChange, showLabel = false }: UnreadCountBadgeProps) {
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const displayCount = unreadCount > 99 ? "99+" : unreadCount.toString();

  return (
    <div className={`flex flex-col items-center justify-center gap-1 ${className}`}>
      <div className="relative flex items-center justify-center">
        <Bell className="w-6 h-6" aria-hidden="true" strokeWidth={2} />
        {!isLoading && unreadCount > 0 && (
          <>
            <span className="absolute -top-0.5 -right-0.5 flex h-2.5 w-2.5 items-center justify-center rounded-full bg-red-500 shadow-sm ring-2 ring-background">
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
      {showLabel && (
        <span className="text-[10px] font-medium leading-none">Alerts</span>
      )}
    </div>
  );
}
