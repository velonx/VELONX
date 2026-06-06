'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { ApiClientError } from '@/lib/api/client';
import { secureFetch } from '@/lib/utils/csrf';
import type { CommunityGroupData } from '@/lib/types/community.types';
import toast from 'react-hot-toast';

/**
 * Community Groups Hook State Interface
 */
export interface UseCommunityGroupsState {
  groups: CommunityGroupData[];
  memberGroupIds: string[];
  pendingRequestGroupIds: string[];
  isLoading: boolean;
  error: ApiClientError | null;
}

/**
 * Community Groups Hook Return Interface
 */
export interface UseCommunityGroupsReturn extends UseCommunityGroupsState {
  refetch: () => Promise<void>;
  createGroup: (data: CreateGroupData) => Promise<CommunityGroupData | null>;
  updateGroup: (groupId: string, data: UpdateGroupData) => Promise<CommunityGroupData | null>;
  deleteGroup: (groupId: string) => Promise<boolean>;
  joinGroup: (groupId: string) => Promise<void>;
  requestJoinGroup: (groupId: string) => Promise<void>;
  leaveGroup: (groupId: string) => Promise<void>;
  isCreating: boolean;
  isJoining: boolean;
}

/**
 * Create Group Data Interface
 */
export interface CreateGroupData {
  name: string;
  description: string;
  isPrivate: boolean;
  imageUrl?: string;
}

/**
 * Update Group Data Interface
 */
export interface UpdateGroupData {
  name?: string;
  description?: string;
  isPrivate?: boolean;
  imageUrl?: string | null;
}

/**
 * Convert API errors to user-friendly messages
 */
function getErrorMessage(err: unknown): string {
  if (err instanceof ApiClientError) {
    if (err.statusCode === 401) {
      return 'Please log in to access community groups';
    }
    if (err.statusCode === 403) {
      return 'You do not have permission to perform this action';
    }
    if (err.statusCode === 404) {
      return 'Group not found';
    }
    if (err.statusCode === 409) {
      return 'You are already a member of this group or have a pending request';
    }
    return err.message || 'An error occurred';
  }
  return err instanceof Error ? err.message : 'An unexpected error occurred';
}

/**
 * Custom hook for managing community groups
 * 
 * Features:
 * - Fetch all available community groups
 * - Create new community groups
 * - Join public groups or request to join private groups
 * - Leave groups
 * - Optimistic UI updates
 * - Error handling with toast notifications
 * - Loading state management
 * 
 * @example
 * ```tsx
 * const { groups, isLoading, createGroup, joinGroup, requestJoinGroup, leaveGroup } = useCommunityGroups();
 * 
 * // Create a new group
 * await createGroup({
 *   name: 'Web Developers',
 *   description: 'A group for web development enthusiasts',
 *   isPrivate: false
 * });
 * 
 * // Join a public group
 * await joinGroup('group-id-123');
 * 
 * // Request to join a private group
 * await requestJoinGroup('private-group-id');
 * ```
 */
export function useCommunityGroups(): UseCommunityGroupsReturn {
  const [state, setState] = useState<UseCommunityGroupsState>({
    groups: [],
    memberGroupIds: [],
    pendingRequestGroupIds: [],
    isLoading: true,
    error: null,
  });

  const [isCreating, setIsCreating] = useState(false);
  const [isJoining, setIsJoining] = useState(false);
  const { status } = useSession();

  const isMountedRef = useRef(true);

  /**
   * Fetch community groups from API
   */
  const fetchGroups = useCallback(async () => {
    if (!isMountedRef.current) return;
    
    // Only set loading if not already loading or if there's an error to clear
    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const response = await fetch('/api/community/groups');

      if (!response.ok) {
        const errorData = await response.json();
        throw new ApiClientError(
          response.status,
          errorData.error?.code || 'FETCH_ERROR',
          errorData.error?.message || 'Failed to fetch groups'
        );
      }

      const data = await response.json();

      if (!isMountedRef.current) return;

      setState({
        groups: data.data || [],
        memberGroupIds: data.memberGroupIds || [],
        pendingRequestGroupIds: data.pendingRequestGroupIds || [],
        isLoading: false,
        error: null,
      });
    } catch (err) {
      console.error('[useCommunityGroups] Fetch error:', err);

      if (!isMountedRef.current) return;

      const error = err instanceof ApiClientError
        ? err
        : new ApiClientError(500, 'NETWORK_ERROR', getErrorMessage(err));

      setState({
        groups: [],
        memberGroupIds: [],
        pendingRequestGroupIds: [],
        isLoading: false,
        error,
      });
    }
  }, []);

  /**
   * Fetch groups on mount and when authentication status changes
   * Also handles isMountedRef lifecycle to support React 18 Strict Mode
   */
  useEffect(() => {
    isMountedRef.current = true;
    
    // Fetch regardless of authentication status, as public groups are visible
    if (status !== 'loading') {
      fetchGroups();
    }

    return () => {
      isMountedRef.current = false;
    };
  }, [fetchGroups, status]);

  /**
   * Refetch function for manual refresh
   */
  const refetch = useCallback(async () => {
    await fetchGroups();
  }, [fetchGroups]);

  /**
   * Create a new community group
   */
  const createGroup = useCallback(async (data: CreateGroupData): Promise<CommunityGroupData | null> => {
    setIsCreating(true);

    try {
      const response = await secureFetch('/api/community/groups', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new ApiClientError(
          response.status,
          errorData.error?.code || 'CREATE_ERROR',
          errorData.error?.message || 'Failed to create group'
        );
      }

      const result = await response.json();
      const newGroup = result.data;

      // Optimistically add to local state
      if (isMountedRef.current) {
        setState(prev => ({
          ...prev,
          groups: [newGroup, ...prev.groups],
        }));
      }

      toast.success(`Group "${data.name}" created successfully`);
      return newGroup;
    } catch (err) {
      console.error('[useCommunityGroups] Create error:', err);
      toast.error(getErrorMessage(err));
      return null;
    } finally {
      setIsCreating(false);
    }
  }, []);

  /**
   * Join a public community group
   */
  const joinGroup = useCallback(async (groupId: string) => {
    setIsJoining(true);

    try {
      const response = await secureFetch(`/api/community/groups/${groupId}/join`, {
        method: 'POST',
      });

      if (!response.ok) {
        const errorData = await response.json();
        
        // Handle duplicate membership gracefully
        if (response.status === 400 && errorData.error?.message?.includes('already a member')) {
          toast.success("You're already a member of this group");
          // Refresh groups to sync state
          await fetchGroups();
          return;
        }
        
        throw new ApiClientError(
          response.status,
          errorData.error?.code || 'JOIN_ERROR',
          errorData.error?.message || 'Failed to join group'
        );
      }

      // Optimistically update member count
      if (isMountedRef.current) {
        setState(prev => ({
          ...prev,
          groups: prev.groups.map(group =>
            group.id === groupId
              ? { ...group, memberCount: group.memberCount + 1 }
              : group
          ),
        }));
      }

      toast.success('Joined group successfully');
    } catch (err) {
      console.error('[useCommunityGroups] Join error:', err);
      toast.error(getErrorMessage(err));
      throw err;
    } finally {
      setIsJoining(false);
    }
  }, [fetchGroups]);

  /**
   * Request to join a private community group
   */
  const requestJoinGroup = useCallback(async (groupId: string) => {
    setIsJoining(true);

    try {
      const response = await secureFetch(`/api/community/groups/${groupId}/request`, {
        method: 'POST',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new ApiClientError(
          response.status,
          errorData.error?.code || 'REQUEST_ERROR',
          errorData.error?.message || 'Failed to request group membership'
        );
      }

      toast.success('Join request sent successfully. Awaiting moderator approval.');
    } catch (err) {
      console.error('[useCommunityGroups] Request error:', err);
      toast.error(getErrorMessage(err));
      throw err;
    } finally {
      setIsJoining(false);
    }
  }, []);

  /**
   * Leave a community group
   */
  const leaveGroup = useCallback(async (groupId: string) => {
    setIsJoining(true);

    try {
      const response = await secureFetch(`/api/community/groups/${groupId}/leave`, {
        method: 'POST',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new ApiClientError(
          response.status,
          errorData.error?.code || 'LEAVE_ERROR',
          errorData.error?.message || 'Failed to leave group'
        );
      }

      // Optimistically update member count
      if (isMountedRef.current) {
        setState(prev => ({
          ...prev,
          groups: prev.groups.map(group =>
            group.id === groupId
              ? { ...group, memberCount: Math.max(0, group.memberCount - 1) }
              : group
          ),
        }));
      }

      toast.success('Left group successfully');
    } catch (err) {
      console.error('[useCommunityGroups] Leave error:', err);
      toast.error(getErrorMessage(err));
      throw err;
    } finally {
      setIsJoining(false);
    }
  }, []);

  /**
   * Update community group details (owner only)
   */
  const updateGroup = useCallback(async (groupId: string, data: UpdateGroupData): Promise<CommunityGroupData | null> => {
    try {
      const response = await secureFetch(`/api/community/groups/${groupId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new ApiClientError(
          response.status,
          errorData.error?.code || 'UPDATE_ERROR',
          errorData.error?.message || 'Failed to update group'
        );
      }

      const result = await response.json();
      const updated: CommunityGroupData = result.data;

      // Patch the group in local state
      if (isMountedRef.current) {
        setState(prev => ({
          ...prev,
          groups: prev.groups.map(g => g.id === groupId ? { ...g, ...updated } : g),
        }));
      }

      toast.success('Group updated successfully');
      return updated;
    } catch (err) {
      console.error('[useCommunityGroups] Update error:', err);
      toast.error(getErrorMessage(err));
      return null;
    }
  }, []);

  /**
   * Delete a community group (owner only)
   * Returns true on success.
   */
  const deleteGroup = useCallback(async (groupId: string): Promise<boolean> => {
    try {
      const response = await secureFetch(`/api/community/groups/${groupId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new ApiClientError(
          response.status,
          errorData.error?.code || 'DELETE_ERROR',
          errorData.error?.message || 'Failed to delete group'
        );
      }

      // Remove group from local state
      if (isMountedRef.current) {
        setState(prev => ({
          ...prev,
          groups: prev.groups.filter(g => g.id !== groupId),
          memberGroupIds: prev.memberGroupIds.filter(id => id !== groupId),
        }));
      }

      toast.success('Group deleted successfully');
      return true;
    } catch (err) {
      console.error('[useCommunityGroups] Delete error:', err);
      toast.error(getErrorMessage(err));
      return false;
    }
  }, []);

  return {
    ...state,
    refetch,
    createGroup,
    updateGroup,
    deleteGroup,
    joinGroup,
    requestJoinGroup,
    leaveGroup,
    isCreating,
    isJoining,
  };
}
