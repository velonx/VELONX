'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { ApiClientError } from '@/lib/api/client';
import toast from 'react-hot-toast';

/**
 * Group Member Interface
 */
export interface GroupMember {
  id: string;
  userId: string;
  groupId: string;
  joinedAt: string;
  user: {
    id: string;
    name: string | null;
    email: string;
    image: string | null;
  };
}

/**
 * Group Join Request Interface
 */
export interface GroupJoinRequest {
  id: string;
  groupId: string;
  userId: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  createdAt: string;
  user: {
    id: string;
    name: string | null;
    email: string;
    image: string | null;
  };
}

/**
 * Group Members Hook State Interface
 */
export interface UseGroupMembersState {
  members: GroupMember[];
  joinRequests: GroupJoinRequest[];
  isLoading: boolean;
  error: ApiClientError | null;
}

/**
 * Group Members Hook Return Interface
 */
export interface UseGroupMembersReturn extends UseGroupMembersState {
  refetch: () => Promise<void>;
  fetchJoinRequests: () => Promise<void>;
  approveRequest: (requestId: string) => Promise<void>;
  rejectRequest: (requestId: string) => Promise<void>;
  isManagingRequest: boolean;
}

/**
 * Convert API errors to user-friendly messages
 */
function getErrorMessage(err: unknown): string {
  if (err instanceof ApiClientError) {
    if (err.statusCode === 401) {
      return 'Please log in to view group members';
    }
    if (err.statusCode === 403) {
      return 'You do not have permission to perform this action';
    }
    if (err.statusCode === 404) {
      return 'Group not found';
    }
    return err.message || 'An error occurred';
  }
  return err instanceof Error ? err.message : 'An unexpected error occurred';
}

/**
 * Custom hook for managing group members and join requests
 * 
 * Features:
 * - Fetch group members
 * - Fetch pending join requests (for moderators)
 * - Approve or reject join requests
 * - Error handling with toast notifications
 * - Loading state management
 * 
 * @param groupId - The ID of the group to fetch members for
 * 
 * @example
 * ```tsx
 * const { members, joinRequests, approveRequest, rejectRequest } = useGroupMembers('group-id-123');
 * 
 * // Approve a join request
 * await approveRequest('request-id-456');
 * 
 * // Reject a join request
 * await rejectRequest('request-id-789');
 * ```
 */
export function useGroupMembers(groupId: string | null): UseGroupMembersReturn {
  const [state, setState] = useState<UseGroupMembersState>({
    members: [],
    joinRequests: [],
    isLoading: true,
    error: null,
  });
  
  const [isManagingRequest, setIsManagingRequest] = useState(false);
  
  const isMountedRef = useRef(true);

  /**
   * Fetch group members from API
   */
  const fetchMembers = useCallback(async () => {
    if (!groupId || !isMountedRef.current) return;
    
    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const response = await fetch(`/api/community/groups/${groupId}/members`);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new ApiClientError(
          response.status,
          errorData.error?.code || 'FETCH_ERROR',
          errorData.error?.message || 'Failed to fetch group members'
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
      console.error('[useGroupMembers] Fetch error:', err);
      
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
  }, [groupId]);

  /**
   * Fetch pending join requests from API (for moderators)
   */
  const fetchJoinRequests = useCallback(async () => {
    if (!groupId || !isMountedRef.current) return;

    try {
      const response = await fetch(`/api/community/groups/${groupId}/requests`);
      
      if (!response.ok) {
        // If 403, user is not a moderator - silently skip
        if (response.status === 403) {
          return;
        }
        
        const errorData = await response.json();
        throw new ApiClientError(
          response.status,
          errorData.error?.code || 'FETCH_ERROR',
          errorData.error?.message || 'Failed to fetch join requests'
        );
      }
      
      const data = await response.json();
      
      if (!isMountedRef.current) return;
      
      setState(prev => ({
        ...prev,
        joinRequests: data.data || [],
      }));
    } catch (err) {
      console.error('[useGroupMembers] Fetch join requests error:', err);
      // Don't update error state for join requests - they're optional
    }
  }, [groupId]);

  /**
   * Fetch members on mount and when groupId changes
   */
  useEffect(() => {
    fetchMembers();
    fetchJoinRequests();
  }, [fetchMembers, fetchJoinRequests]);
  
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
    await fetchJoinRequests();
  }, [fetchMembers, fetchJoinRequests]);
  
  /**
   * Approve a join request
   */
  const approveRequest = useCallback(async (requestId: string) => {
    setIsManagingRequest(true);

    try {
      const response = await fetch(`/api/community/groups/requests/${requestId}/approve`, {
        method: 'POST',
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new ApiClientError(
          response.status,
          errorData.error?.code || 'APPROVE_ERROR',
          errorData.error?.message || 'Failed to approve request'
        );
      }
      
      // Optimistically remove from join requests
      if (isMountedRef.current) {
        setState(prev => ({
          ...prev,
          joinRequests: prev.joinRequests.filter(req => req.id !== requestId),
        }));
      }
      
      // Refetch members to include the newly approved member
      await fetchMembers();
      
      toast.success('Join request approved successfully');
    } catch (err) {
      console.error('[useGroupMembers] Approve error:', err);
      toast.error(getErrorMessage(err));
      throw err;
    } finally {
      setIsManagingRequest(false);
    }
  }, [fetchMembers]);
  
  /**
   * Reject a join request
   */
  const rejectRequest = useCallback(async (requestId: string) => {
    setIsManagingRequest(true);

    try {
      const response = await fetch(`/api/community/groups/requests/${requestId}/reject`, {
        method: 'POST',
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new ApiClientError(
          response.status,
          errorData.error?.code || 'REJECT_ERROR',
          errorData.error?.message || 'Failed to reject request'
        );
      }
      
      // Optimistically remove from join requests
      if (isMountedRef.current) {
        setState(prev => ({
          ...prev,
          joinRequests: prev.joinRequests.filter(req => req.id !== requestId),
        }));
      }
      
      toast.success('Join request rejected');
    } catch (err) {
      console.error('[useGroupMembers] Reject error:', err);
      toast.error(getErrorMessage(err));
      throw err;
    } finally {
      setIsManagingRequest(false);
    }
  }, []);

  return {
    ...state,
    refetch,
    fetchJoinRequests,
    approveRequest,
    rejectRequest,
    isManagingRequest,
  };
}
