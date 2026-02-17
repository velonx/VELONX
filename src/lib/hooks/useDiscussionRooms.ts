'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { ApiClientError } from '@/lib/api/client';
import { getCSRFToken } from '@/lib/utils/csrf';
import type { DiscussionRoomData } from '@/lib/types/community.types';
import toast from 'react-hot-toast';

/**
 * Discussion Rooms Hook State Interface
 */
export interface UseDiscussionRoomsState {
  rooms: DiscussionRoomData[];
  isLoading: boolean;
  error: ApiClientError | null;
}

/**
 * Discussion Rooms Hook Return Interface
 */
export interface UseDiscussionRoomsReturn extends UseDiscussionRoomsState {
  refetch: () => Promise<void>;
  createRoom: (data: CreateRoomData) => Promise<DiscussionRoomData | null>;
  joinRoom: (roomId: string) => Promise<void>;
  leaveRoom: (roomId: string) => Promise<void>;
  isCreating: boolean;
  isJoining: boolean;
}

/**
 * Create Room Data Interface
 */
export interface CreateRoomData {
  name: string;
  description: string;
  isPrivate: boolean;
  imageUrl?: string;
}

/**
 * Convert API errors to user-friendly messages
 */
function getErrorMessage(err: unknown): string {
  if (err instanceof ApiClientError) {
    if (err.statusCode === 401) {
      return 'Please log in to access discussion rooms';
    }
    if (err.statusCode === 403) {
      return 'You do not have permission to perform this action';
    }
    if (err.statusCode === 404) {
      return 'Room not found';
    }
    if (err.statusCode === 409) {
      return 'You are already a member of this room';
    }
    return err.message || 'An error occurred';
  }
  return err instanceof Error ? err.message : 'An unexpected error occurred';
}

/**
 * Custom hook for managing discussion rooms
 * 
 * Features:
 * - Fetch all available discussion rooms
 * - Create new discussion rooms
 * - Join and leave rooms
 * - Optimistic UI updates
 * - Error handling with toast notifications
 * - Loading state management
 * 
 * @example
 * ```tsx
 * const { rooms, isLoading, createRoom, joinRoom, leaveRoom } = useDiscussionRooms();
 * 
 * // Create a new room
 * await createRoom({
 *   name: 'React Developers',
 *   description: 'Discuss React and Next.js',
 *   isPrivate: false
 * });
 * 
 * // Join a room
 * await joinRoom('room-id-123');
 * ```
 */
export function useDiscussionRooms(): UseDiscussionRoomsReturn {
  const [state, setState] = useState<UseDiscussionRoomsState>({
    rooms: [],
    isLoading: true,
    error: null,
  });
  
  const [isCreating, setIsCreating] = useState(false);
  const [isJoining, setIsJoining] = useState(false);
  
  const isMountedRef = useRef(true);

  /**
   * Fetch discussion rooms from API
   */
  const fetchRooms = useCallback(async () => {
    if (!isMountedRef.current) return;
    
    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const response = await fetch('/api/community/rooms');
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new ApiClientError(
          response.status,
          errorData.error?.code || 'FETCH_ERROR',
          errorData.error?.message || 'Failed to fetch rooms'
        );
      }
      
      const data = await response.json();
      
      if (!isMountedRef.current) return;
      
      setState({
        rooms: data.data || [],
        isLoading: false,
        error: null,
      });
    } catch (err) {
      console.error('[useDiscussionRooms] Fetch error:', err);
      
      if (!isMountedRef.current) return;
      
      const error = err instanceof ApiClientError 
        ? err 
        : new ApiClientError(500, 'NETWORK_ERROR', getErrorMessage(err));
      
      setState({
        rooms: [],
        isLoading: false,
        error,
      });
    }
  }, []);

  /**
   * Fetch rooms on mount
   */
  useEffect(() => {
    fetchRooms();
  }, [fetchRooms]);
  
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
    await fetchRooms();
  }, [fetchRooms]);
  
  /**
   * Create a new discussion room
   */
  const createRoom = useCallback(async (data: CreateRoomData): Promise<DiscussionRoomData | null> => {
    setIsCreating(true);

    try {
      // Get CSRF token
      const csrfToken = await getCSRFToken();
      
      const response = await fetch('/api/community/rooms', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-csrf-token': csrfToken,
        },
        credentials: 'include',
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new ApiClientError(
          response.status,
          errorData.error?.code || 'CREATE_ERROR',
          errorData.error?.message || 'Failed to create room'
        );
      }
      
      const result = await response.json();
      const newRoom = result.data;
      
      // Optimistically add to local state
      if (isMountedRef.current) {
        setState(prev => ({
          ...prev,
          rooms: [newRoom, ...prev.rooms],
        }));
      }
      
      toast.success(`Room "${data.name}" created successfully`);
      return newRoom;
    } catch (err) {
      console.error('[useDiscussionRooms] Create error:', err);
      toast.error(getErrorMessage(err));
      return null;
    } finally {
      setIsCreating(false);
    }
  }, []);
  
  /**
   * Join a discussion room
   */
  const joinRoom = useCallback(async (roomId: string) => {
    setIsJoining(true);

    try {
      // Get CSRF token
      const csrfToken = await getCSRFToken();
      
      const response = await fetch(`/api/community/rooms/${roomId}/join`, {
        method: 'POST',
        headers: {
          'x-csrf-token': csrfToken,
        },
        credentials: 'include',
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new ApiClientError(
          response.status,
          errorData.error?.code || 'JOIN_ERROR',
          errorData.error?.message || 'Failed to join room'
        );
      }
      
      // Optimistically update member count
      if (isMountedRef.current) {
        setState(prev => ({
          ...prev,
          rooms: prev.rooms.map(room =>
            room.id === roomId
              ? { ...room, memberCount: room.memberCount + 1 }
              : room
          ),
        }));
      }
      
      toast.success('Joined room successfully');
    } catch (err) {
      console.error('[useDiscussionRooms] Join error:', err);
      toast.error(getErrorMessage(err));
      throw err;
    } finally {
      setIsJoining(false);
    }
  }, []);
  
  /**
   * Leave a discussion room
   */
  const leaveRoom = useCallback(async (roomId: string) => {
    setIsJoining(true);

    try {
      // Get CSRF token
      const csrfToken = await getCSRFToken();
      
      const response = await fetch(`/api/community/rooms/${roomId}/leave`, {
        method: 'POST',
        headers: {
          'x-csrf-token': csrfToken,
        },
        credentials: 'include',
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new ApiClientError(
          response.status,
          errorData.error?.code || 'LEAVE_ERROR',
          errorData.error?.message || 'Failed to leave room'
        );
      }
      
      // Optimistically update member count
      if (isMountedRef.current) {
        setState(prev => ({
          ...prev,
          rooms: prev.rooms.map(room =>
            room.id === roomId
              ? { ...room, memberCount: Math.max(0, room.memberCount - 1) }
              : room
          ),
        }));
      }
      
      toast.success('Left room successfully');
    } catch (err) {
      console.error('[useDiscussionRooms] Leave error:', err);
      toast.error(getErrorMessage(err));
      throw err;
    } finally {
      setIsJoining(false);
    }
  }, []);

  return {
    ...state,
    refetch,
    createRoom,
    joinRoom,
    leaveRoom,
    isCreating,
    isJoining,
  };
}
