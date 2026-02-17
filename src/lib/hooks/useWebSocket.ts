'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import type { WSMessage } from '@/lib/types/community.types';

/**
 * WebSocket Connection State
 */
export type ConnectionState = 'connecting' | 'connected' | 'disconnected' | 'error';

/**
 * WebSocket Hook State Interface
 */
export interface UseWebSocketState {
  connectionState: ConnectionState;
  isConnected: boolean;
  error: Error | null;
}

/**
 * WebSocket Hook Return Interface
 */
export interface UseWebSocketReturn extends UseWebSocketState {
  sendMessage: (message: WSMessage) => void;
  subscribe: (roomId?: string, groupId?: string) => void;
  unsubscribe: (roomId?: string, groupId?: string) => void;
  reconnect: () => void;
}

/**
 * WebSocket Configuration
 */
interface WebSocketConfig {
  url: string;
  reconnectInterval?: number;
  maxReconnectAttempts?: number;
  heartbeatInterval?: number;
}

/**
 * Default configuration
 */
const DEFAULT_CONFIG: Required<Omit<WebSocketConfig, 'url'>> = {
  reconnectInterval: 3000,
  maxReconnectAttempts: 5,
  heartbeatInterval: 30000,
};

/**
 * Custom hook for managing WebSocket connections
 * 
 * Features:
 * - Automatic connection management
 * - Automatic reconnection with exponential backoff
 * - Heartbeat mechanism for connection health
 * - Subscribe/unsubscribe to rooms and groups
 * - Send messages through WebSocket
 * - Connection state tracking
 * 
 * @param config - WebSocket configuration
 * @param onMessage - Callback for incoming messages
 * 
 * @example
 * ```tsx
 * const { isConnected, sendMessage, subscribe } = useWebSocket(
 *   { url: 'ws://localhost:3000' },
 *   (message) => {
 *     console.log('Received:', message);
 *   }
 * );
 * 
 * // Subscribe to a room
 * subscribe('room-id-123');
 * 
 * // Send a message
 * sendMessage({
 *   type: 'CHAT_MESSAGE',
 *   payload: { content: 'Hello!' }
 * });
 * ```
 */
export function useWebSocket(
  config: WebSocketConfig,
  onMessage?: (message: WSMessage) => void
): UseWebSocketReturn {
  const [state, setState] = useState<UseWebSocketState>({
    connectionState: 'disconnected',
    isConnected: false,
    error: null,
  });
  
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectAttemptsRef = useRef(0);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const heartbeatIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const isMountedRef = useRef(true);
  
  const fullConfig = { ...DEFAULT_CONFIG, ...config };

  /**
   * Clear all timers
   */
  const clearTimers = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
    if (heartbeatIntervalRef.current) {
      clearInterval(heartbeatIntervalRef.current);
      heartbeatIntervalRef.current = null;
    }
  }, []);

  /**
   * Start heartbeat
   */
  const startHeartbeat = useCallback(() => {
    clearTimers();
    
    heartbeatIntervalRef.current = setInterval(() => {
      if (wsRef.current?.readyState === WebSocket.OPEN) {
        wsRef.current.send(JSON.stringify({ type: 'PING' }));
      }
    }, fullConfig.heartbeatInterval);
  }, [fullConfig.heartbeatInterval, clearTimers]);

  /**
   * Connect to WebSocket
   */
  const connect = useCallback(() => {
    if (!isMountedRef.current) return;
    
    // Close existing connection
    if (wsRef.current) {
      wsRef.current.close();
    }
    
    setState(prev => ({ ...prev, connectionState: 'connecting', error: null }));

    try {
      const ws = new WebSocket(fullConfig.url);
      wsRef.current = ws;

      ws.onopen = () => {
        if (!isMountedRef.current) return;
        
        console.log('[WebSocket] Connected');
        reconnectAttemptsRef.current = 0;
        
        setState({
          connectionState: 'connected',
          isConnected: true,
          error: null,
        });
        
        startHeartbeat();
      };

      ws.onmessage = (event) => {
        if (!isMountedRef.current) return;
        
        try {
          const message = JSON.parse(event.data) as WSMessage;
          
          // Handle PONG response
          if (message.type === 'PONG') {
            return;
          }
          
          // Call message handler
          if (onMessage) {
            onMessage(message);
          }
        } catch (err) {
          console.error('[WebSocket] Failed to parse message:', err);
        }
      };

      ws.onerror = (event) => {
        if (!isMountedRef.current) return;
        
        console.error('[WebSocket] Error:', event);
        
        setState(prev => ({
          ...prev,
          connectionState: 'error',
          error: new Error('WebSocket connection error'),
        }));
      };

      ws.onclose = () => {
        if (!isMountedRef.current) return;
        
        console.log('[WebSocket] Disconnected');
        clearTimers();
        
        setState({
          connectionState: 'disconnected',
          isConnected: false,
          error: null,
        });
        
        // Attempt reconnection
        if (reconnectAttemptsRef.current < fullConfig.maxReconnectAttempts) {
          const delay = fullConfig.reconnectInterval * Math.pow(2, reconnectAttemptsRef.current);
          
          console.log(`[WebSocket] Reconnecting in ${delay}ms (attempt ${reconnectAttemptsRef.current + 1}/${fullConfig.maxReconnectAttempts})`);
          
          reconnectTimeoutRef.current = setTimeout(() => {
            reconnectAttemptsRef.current += 1;
            connect();
          }, delay);
        } else {
          console.error('[WebSocket] Max reconnection attempts reached');
          setState(prev => ({
            ...prev,
            error: new Error('Failed to reconnect after maximum attempts'),
          }));
        }
      };
    } catch (err) {
      console.error('[WebSocket] Connection error:', err);
      
      if (!isMountedRef.current) return;
      
      setState({
        connectionState: 'error',
        isConnected: false,
        error: err instanceof Error ? err : new Error('Failed to connect'),
      });
    }
  }, [fullConfig, onMessage, startHeartbeat, clearTimers]);

  /**
   * Connect on mount
   */
  useEffect(() => {
    connect();
    
    return () => {
      isMountedRef.current = false;
      clearTimers();
      
      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
      }
    };
  }, [connect, clearTimers]);

  /**
   * Send a message through WebSocket
   */
  const sendMessage = useCallback((message: WSMessage) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(message));
    } else {
      console.warn('[WebSocket] Cannot send message: not connected');
    }
  }, []);
  
  /**
   * Subscribe to a room or group
   */
  const subscribe = useCallback((roomId?: string, groupId?: string) => {
    sendMessage({
      type: 'SUBSCRIBE',
      payload: { roomId, groupId },
    });
  }, [sendMessage]);
  
  /**
   * Unsubscribe from a room or group
   */
  const unsubscribe = useCallback((roomId?: string, groupId?: string) => {
    sendMessage({
      type: 'UNSUBSCRIBE',
      payload: { roomId, groupId },
    });
  }, [sendMessage]);
  
  /**
   * Manually reconnect
   */
  const reconnect = useCallback(() => {
    reconnectAttemptsRef.current = 0;
    connect();
  }, [connect]);

  return {
    ...state,
    sendMessage,
    subscribe,
    unsubscribe,
    reconnect,
  };
}
