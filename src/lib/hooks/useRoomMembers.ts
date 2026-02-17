'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { ApiClientError } from '@/lib/api/client';

/**
 * Room Member Interface
 */
export interface RoomMember {
  id: string;
  userId: string;
  roomId: string;
  joinedAt: string;
  user: {
    id: string;
    name: string | null;
    email: string;
    image: string | null;
  };
}

/**
 * Room Members Hook State Interface
 */
export interface UseRoomMembersState {
  members: RoomMember[];
  onlineMembers: Set<string>;
  isLoading: boolean;
  error: ApiClientError | null;
}

/**
 * Room Members Hook Return Interface
 */
export interface UseRoomMembersReturn extends UseRoomMembersState {
  refetch: () => Promise<void>;
  isUserOnline: (userId: string) => boolean;
}

/**
 * Convert API errors to user-friendly messages
 */
function getErrorMessage(err: unknown): string {
  if (err instanceof ApiClientError) {
    if (err.statusCode === 401) {
      return 'Please log in to view room members';
    }
    if (err.statusCode === 403) {
      return 'You do not have permission to view this room';
    }
    if (err.statusCode === 404) {
      return 'Room not found';
    }
    return err.message || 'An error occurred';
  }
  return err instanceof Error ? err.message : 'An unexpected error occurred';
}

/**
 * Custom hook for managing room members and online status
 * 
 * Features:
 * - Fetch room members
 * - Track online members (requires WebSocket connection)
 * - Check if specific user is online
 * - Error handling
 * - Loading state management
 * 
 * @param roomId - The ID of the room to fetch members for
 * 
 * @example
 * ```tsx
 * const { members, onlineMembers, isLoading, isUserOnline } = useRoomMembers('room-id-123');
 * 
 * // Check if a user is online
 * const isOnline = isUserOnline('user-id-456');
 * ```
 */
export function useRoomMembers(roomId: string | null): UseRoomMembersReturn {
  const [state, setState] = useState<UseRoomMembersState>({
    members: [],
    onlineMembers: new Set<string>(),
    isLoading: true,
    error: null,
  });
  
  const isMountedRef = useRef(true);

  /**
   * Fetch room members from API
   */
  const fetchMembers = useCallback(async () => {
    if (!roomId || !isMountedRef.current) return;
    
    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const response = await fetch(`/api/community/rooms/${roomId}/members`);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new ApiClientError(
          response.status,
          errorData.error?.code || 'FETCH_ERROR',
          errorData.error?.message || 'Failed to fetch room members'
        );
      }
      
      const data = await response.json();
      
      if (!isMountedRef.current) return;
      
      setState(prev => ({
        ...prev,
        members: data.data || [],
        isLoading: false,
        error: null,
      }));
    } catch (err) {
      console.error('[useRoomMembers] Fetch error:', err);
      
      if (!isMountedRef.current) return;
      
      const error = err instanceof ApiClientError 
        ? err 
        : new ApiClientError(500, 'NETWORK_ERROR', getErrorMessage(err));
      
      setState(prev => ({
        ...prev,
        members: [],
        isLoading: false,
        error,
      }));
    }
  }, [roomId]);

  /**
   * Fetch members on mount and when roomId changes
   */
  useEffect(() => {
    fetchMembers();
  }, [fetchMembers]);
  
  /**
   * Cleanup on unmount
   */
  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  /**
   * Refetch function for manual refresh
   */
  const refetch = useCallback(async () => {
    await fetchMembers();
  }, [fetchMembers]);
  
  /**
   * Check if a user is online
   */
  const isUserOnline = useCallback((userId: string): boolean => {
    return state.onlineMembers.has(userId);
  }, [state.onlineMembers]);

  return {
    ...state,
    refetch,
    isUserOnline,
  };
}
