'use client';

import { useState, useCallback, useEffect } from 'react';

/**
 * Online Status Hook Return Interface
 */
export interface UseOnlineStatusReturn {
  onlineUsers: Set<string>;
  isUserOnline: (userId: string) => boolean;
  handleUserJoined: (userId: string) => void;
  handleUserLeft: (userId: string) => void;
  setOnlineUsers: (users: string[]) => void;
}

/**
 * Custom hook for tracking online users in rooms and groups
 * 
 * Features:
 * - Track online users
 * - Check if specific user is online
 * - Handle user join/leave events
 * - Set initial online users list
 * 
 * @example
 * ```tsx
 * const { onlineUsers, isUserOnline, handleUserJoined, handleUserLeft } = useOnlineStatus();
 * 
 * // Check if user is online
 * const isOnline = isUserOnline('user-id-123');
 * 
 * // Handle user joined
 * handleUserJoined('user-id-456');
 * 
 * // Handle user left
 * handleUserLeft('user-id-789');
 * ```
 */
export function useOnlineStatus(): UseOnlineStatusReturn {
  const [onlineUsers, setOnlineUsersState] = useState<Set<string>>(new Set());

  /**
   * Check if a user is online
   */
  const isUserOnline = useCallback((userId: string): boolean => {
    return onlineUsers.has(userId);
  }, [onlineUsers]);

  /**
   * Handle user joined event
   */
  const handleUserJoined = useCallback((userId: string) => {
    setOnlineUsersState(prev => {
      const newSet = new Set(prev);
      newSet.add(userId);
      return newSet;
    });
  }, []);

  /**
   * Handle user left event
   */
  const handleUserLeft = useCallback((userId: string) => {
    setOnlineUsersState(prev => {
      const newSet = new Set(prev);
      newSet.delete(userId);
      return newSet;
    });
  }, []);

  /**
   * Set online users list (for initial load)
   */
  const setOnlineUsers = useCallback((users: string[]) => {
    setOnlineUsersState(new Set(users));
  }, []);

  /**
   * Clear online users on unmount
   */
  useEffect(() => {
    return () => {
      setOnlineUsersState(new Set());
    };
  }, []);

  return {
    onlineUsers,
    isUserOnline,
    handleUserJoined,
    handleUserLeft,
    setOnlineUsers,
  };
}
