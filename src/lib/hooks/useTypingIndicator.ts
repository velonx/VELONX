'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import type { TypingPayload } from '@/lib/types/community.types';

/**
 * Typing User Interface
 */
export interface TypingUser {
  userId: string;
  userName: string;
}

/**
 * Typing Indicator Hook Return Interface
 */
export interface UseTypingIndicatorReturn {
  typingUsers: TypingUser[];
  sendTypingStatus: (isTyping: boolean) => void;
  handleTypingMessage: (payload: TypingPayload) => void;
}

/**
 * Typing timeout duration (3 seconds)
 */
const TYPING_TIMEOUT = 3000;

/**
 * Custom hook for managing typing indicators
 * 
 * Features:
 * - Track users who are currently typing
 * - Send typing status updates
 * - Automatic timeout for stale typing indicators
 * - Handle incoming typing messages
 * 
 * @param roomId - Optional room ID
 * @param groupId - Optional group ID
 * @param sendMessage - Function to send WebSocket messages
 * 
 * @example
 * ```tsx
 * const { typingUsers, sendTypingStatus, handleTypingMessage } = useTypingIndicator(
 *   'room-id-123',
 *   null,
 *   (message) => ws.send(message)
 * );
 * 
 * // Send typing status
 * sendTypingStatus(true);
 * 
 * // Handle incoming typing message
 * handleTypingMessage({
 *   userId: 'user-123',
 *   userName: 'John',
 *   isTyping: true
 * });
 * ```
 */
export function useTypingIndicator(
  roomId?: string | null,
  groupId?: string | null,
  sendMessage?: (message: any) => void
): UseTypingIndicatorReturn {
  const [typingUsers, setTypingUsers] = useState<TypingUser[]>([]);
  
  const typingTimeoutsRef = useRef<Map<string, NodeJS.Timeout>>(new Map());
  const lastTypingStatusRef = useRef<boolean>(false);
  const typingThrottleRef = useRef<NodeJS.Timeout | null>(null);

  /**
   * Cleanup timeouts on unmount
   */
  useEffect(() => {
    return () => {
      typingTimeoutsRef.current.forEach(timeout => clearTimeout(timeout));
      typingTimeoutsRef.current.clear();
      
      if (typingThrottleRef.current) {
        clearTimeout(typingThrottleRef.current);
      }
    };
  }, []);

  /**
   * Send typing status (throttled)
   */
  const sendTypingStatus = useCallback((isTyping: boolean) => {
    if (!sendMessage || (!roomId && !groupId)) return;
    
    // Don't send duplicate status
    if (lastTypingStatusRef.current === isTyping) return;
    
    // Throttle typing status updates (max once per second)
    if (typingThrottleRef.current) return;
    
    lastTypingStatusRef.current = isTyping;
    
    sendMessage({
      type: 'TYPING',
      payload: {
        roomId,
        groupId,
        isTyping,
      },
    });
    
    // Set throttle timeout
    typingThrottleRef.current = setTimeout(() => {
      typingThrottleRef.current = null;
    }, 1000);
    
    // Auto-stop typing after timeout
    if (isTyping) {
      setTimeout(() => {
        if (lastTypingStatusRef.current) {
          sendTypingStatus(false);
        }
      }, TYPING_TIMEOUT);
    }
  }, [roomId, groupId, sendMessage]);

  /**
   * Handle incoming typing message
   */
  const handleTypingMessage = useCallback((payload: TypingPayload) => {
    const { userId, userName, isTyping } = payload;
    
    // Clear existing timeout for this user
    const existingTimeout = typingTimeoutsRef.current.get(userId);
    if (existingTimeout) {
      clearTimeout(existingTimeout);
      typingTimeoutsRef.current.delete(userId);
    }
    
    if (isTyping) {
      // Add user to typing list
      setTypingUsers(prev => {
        const exists = prev.some(user => user.userId === userId);
        if (exists) return prev;
        return [...prev, { userId, userName }];
      });
      
      // Set timeout to remove user after TYPING_TIMEOUT
      const timeout = setTimeout(() => {
        setTypingUsers(prev => prev.filter(user => user.userId !== userId));
        typingTimeoutsRef.current.delete(userId);
      }, TYPING_TIMEOUT);
      
      typingTimeoutsRef.current.set(userId, timeout);
    } else {
      // Remove user from typing list
      setTypingUsers(prev => prev.filter(user => user.userId !== userId));
    }
  }, []);

  return {
    typingUsers,
    sendTypingStatus,
    handleTypingMessage,
  };
}
