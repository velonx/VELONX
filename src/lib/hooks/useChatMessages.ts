'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { ApiClientError } from '@/lib/api/client';
import type { ChatMessageData } from '@/lib/types/community.types';
import toast from 'react-hot-toast';

/**
 * Chat Messages Hook State Interface
 */
export interface UseChatMessagesState {
  messages: ChatMessageData[];
  hasMore: boolean;
  isLoading: boolean;
  error: ApiClientError | null;
}

/**
 * Chat Messages Hook Return Interface
 */
export interface UseChatMessagesReturn extends UseChatMessagesState {
  sendMessage: (content: string) => Promise<ChatMessageData | null>;
  editMessage: (messageId: string, content: string) => Promise<void>;
  deleteMessage: (messageId: string) => Promise<void>;
  loadMore: () => Promise<void>;
  refetch: () => Promise<void>;
  isSending: boolean;
  isEditing: boolean;
  isDeleting: boolean;
}

/**
 * Send Message Data Interface
 */
export interface SendMessageData {
  content: string;
  roomId?: string;
  groupId?: string;
}

/**
 * Convert API errors to user-friendly messages
 */
function getErrorMessage(err: unknown): string {
  if (err instanceof ApiClientError) {
    if (err.statusCode === 401) {
      return 'Please log in to send messages';
    }
    if (err.statusCode === 403) {
      return 'You do not have permission to send messages';
    }
    if (err.statusCode === 404) {
      return 'Room or group not found';
    }
    if (err.statusCode === 429) {
      return 'You are sending messages too quickly. Please slow down.';
    }
    return err.message || 'An error occurred';
  }
  return err instanceof Error ? err.message : 'An unexpected error occurred';
}

/**
 * Custom hook for managing chat messages with pagination
 * 
 * Features:
 * - Fetch messages with pagination
 * - Send new messages with optimistic updates
 * - Edit and delete messages
 * - Load more messages (infinite scroll)
 * - Error handling with toast notifications
 * - Loading state management
 * 
 * @param roomId - The ID of the room (optional)
 * @param groupId - The ID of the group (optional)
 * @param limit - Number of messages to fetch per page (default: 50)
 * 
 * @example
 * ```tsx
 * const { messages, sendMessage, editMessage, deleteMessage, loadMore } = useChatMessages('room-id-123');
 * 
 * // Send a message
 * await sendMessage('Hello, world!');
 * 
 * // Edit a message
 * await editMessage('message-id', 'Updated content');
 * 
 * // Load more messages
 * await loadMore();
 * ```
 */
export function useChatMessages(
  roomId?: string | null,
  groupId?: string | null,
  limit: number = 50
): UseChatMessagesReturn {
  const [state, setState] = useState<UseChatMessagesState>({
    messages: [],
    hasMore: true,
    isLoading: true,
    error: null,
  });
  
  const [isSending, setIsSending] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  
  const isMountedRef = useRef(true);
  const cursorRef = useRef<string | null>(null);

  /**
   * Fetch messages from API
   */
  const fetchMessages = useCallback(async (cursor?: string | null) => {
    if ((!roomId && !groupId) || !isMountedRef.current) return;
    
    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const params = new URLSearchParams();
      if (roomId) params.append('roomId', roomId);
      if (groupId) params.append('groupId', groupId);
      params.append('limit', limit.toString());
      if (cursor) params.append('cursor', cursor);
      
      const response = await fetch(`/api/community/messages?${params.toString()}`);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new ApiClientError(
          response.status,
          errorData.error?.code || 'FETCH_ERROR',
          errorData.error?.message || 'Failed to fetch messages'
        );
      }
      
      const data = await response.json();
      
      if (!isMountedRef.current) return;
      
      const newMessages = data.data || [];
      const nextCursor = data.pagination?.cursor || null;
      
      setState(prev => ({
        ...prev,
        messages: cursor ? [...prev.messages, ...newMessages] : newMessages,
        hasMore: !!nextCursor,
        isLoading: false,
        error: null,
      }));
      
      cursorRef.current = nextCursor;
    } catch (err) {
      console.error('[useChatMessages] Fetch error:', err);
      
      if (!isMountedRef.current) return;
      
      const error = err instanceof ApiClientError 
        ? err 
        : new ApiClientError(500, 'NETWORK_ERROR', getErrorMessage(err));
      
      setState(prev => ({
        ...prev,
        isLoading: false,
        error,
      }));
    }
  }, [roomId, groupId, limit]);

  /**
   * Fetch messages on mount and when roomId/groupId changes
   */
  useEffect(() => {
    cursorRef.current = null;
    fetchMessages();
  }, [fetchMessages]);
  
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
    cursorRef.current = null;
    await fetchMessages();
  }, [fetchMessages]);
  
  /**
   * Load more messages (pagination)
   */
  const loadMore = useCallback(async () => {
    if (!state.hasMore || state.isLoading) return;
    await fetchMessages(cursorRef.current);
  }, [state.hasMore, state.isLoading, fetchMessages]);
  
  /**
   * Send a new message with optimistic update
   */
  const sendMessage = useCallback(async (content: string): Promise<ChatMessageData | null> => {
    if (!content.trim()) {
      toast.error('Message cannot be empty');
      return null;
    }
    
    setIsSending(true);

    // Create optimistic message
    const optimisticMessage: ChatMessageData = {
      id: `temp-${Date.now()}`,
      content: content.trim(),
      roomId: roomId || undefined,
      groupId: groupId || undefined,
      authorId: 'current-user', // Will be replaced by server response
      authorName: 'You',
      authorImage: undefined,
      isEdited: false,
      isDeleted: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // Optimistically add message to state
    if (isMountedRef.current) {
      setState(prev => ({
        ...prev,
        messages: [optimisticMessage, ...prev.messages],
      }));
    }

    try {
      const response = await fetch('/api/community/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: content.trim(),
          roomId,
          groupId,
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new ApiClientError(
          response.status,
          errorData.error?.code || 'SEND_ERROR',
          errorData.error?.message || 'Failed to send message'
        );
      }
      
      const result = await response.json();
      const newMessage = result.data;
      
      // Replace optimistic message with real message
      if (isMountedRef.current) {
        setState(prev => ({
          ...prev,
          messages: prev.messages.map(msg =>
            msg.id === optimisticMessage.id ? newMessage : msg
          ),
        }));
      }
      
      return newMessage;
    } catch (err) {
      console.error('[useChatMessages] Send error:', err);
      
      // Remove optimistic message on error
      if (isMountedRef.current) {
        setState(prev => ({
          ...prev,
          messages: prev.messages.filter(msg => msg.id !== optimisticMessage.id),
        }));
      }
      
      toast.error(getErrorMessage(err));
      return null;
    } finally {
      setIsSending(false);
    }
  }, [roomId, groupId]);
  
  /**
   * Edit a message
   */
  const editMessage = useCallback(async (messageId: string, content: string) => {
    if (!content.trim()) {
      toast.error('Message cannot be empty');
      return;
    }
    
    setIsEditing(true);

    // Store original message for rollback
    const originalMessage = state.messages.find(msg => msg.id === messageId);
    
    // Optimistically update message
    if (isMountedRef.current) {
      setState(prev => ({
        ...prev,
        messages: prev.messages.map(msg =>
          msg.id === messageId
            ? { ...msg, content: content.trim(), isEdited: true, updatedAt: new Date() }
            : msg
        ),
      }));
    }

    try {
      const response = await fetch(`/api/community/messages/${messageId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content: content.trim() }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new ApiClientError(
          response.status,
          errorData.error?.code || 'EDIT_ERROR',
          errorData.error?.message || 'Failed to edit message'
        );
      }
      
      const result = await response.json();
      const updatedMessage = result.data;
      
      // Update with server response
      if (isMountedRef.current) {
        setState(prev => ({
          ...prev,
          messages: prev.messages.map(msg =>
            msg.id === messageId ? updatedMessage : msg
          ),
        }));
      }
      
      toast.success('Message updated');
    } catch (err) {
      console.error('[useChatMessages] Edit error:', err);
      
      // Rollback on error
      if (originalMessage && isMountedRef.current) {
        setState(prev => ({
          ...prev,
          messages: prev.messages.map(msg =>
            msg.id === messageId ? originalMessage : msg
          ),
        }));
      }
      
      toast.error(getErrorMessage(err));
      throw err;
    } finally {
      setIsEditing(false);
    }
  }, [state.messages]);
  
  /**
   * Delete a message
   */
  const deleteMessage = useCallback(async (messageId: string) => {
    setIsDeleting(true);

    // Store original message for rollback
    const originalMessage = state.messages.find(msg => msg.id === messageId);
    
    // Optimistically remove message
    if (isMountedRef.current) {
      setState(prev => ({
        ...prev,
        messages: prev.messages.filter(msg => msg.id !== messageId),
      }));
    }

    try {
      const response = await fetch(`/api/community/messages/${messageId}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new ApiClientError(
          response.status,
          errorData.error?.code || 'DELETE_ERROR',
          errorData.error?.message || 'Failed to delete message'
        );
      }
      
      toast.success('Message deleted');
    } catch (err) {
      console.error('[useChatMessages] Delete error:', err);
      
      // Rollback on error
      if (originalMessage && isMountedRef.current) {
        setState(prev => ({
          ...prev,
          messages: [originalMessage, ...prev.messages],
        }));
      }
      
      toast.error(getErrorMessage(err));
      throw err;
    } finally {
      setIsDeleting(false);
    }
  }, [state.messages]);

  return {
    ...state,
    sendMessage,
    editMessage,
    deleteMessage,
    loadMore,
    refetch,
    isSending,
    isEditing,
    isDeleting,
  };
}
