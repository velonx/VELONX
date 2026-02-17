/**
 * WebSocket Server for Real-Time Community Features
 * Handles real-time chat, typing indicators, and online status
 */

import { WebSocketServer, WebSocket } from 'ws'
import { IncomingMessage } from 'http'
import { parse } from 'url'
import { verify } from 'jsonwebtoken'
import { getRedisClient } from '@/lib/redis'
import { subscribeToPubSub, publishMessage } from './pubsub'

// WebSocket message types
export type WSMessageType = 
  | 'CHAT_MESSAGE' 
  | 'TYPING' 
  | 'USER_JOINED' 
  | 'USER_LEFT' 
  | 'MESSAGE_EDIT' 
  | 'MESSAGE_DELETE'
  | 'PING'
  | 'PONG'

export interface WSMessage {
  type: WSMessageType
  payload: unknown
}

export interface ChatMessagePayload {
  id: string
  content: string
  roomId?: string
  groupId?: string
  authorId: string
  authorName: string
  authorImage?: string
  isEdited: boolean
  createdAt: string
}

export interface TypingPayload {
  userId: string
  userName: string
  roomId?: string
  groupId?: string
  isTyping: boolean
}

export interface UserJoinedPayload {
  userId: string
  userName: string
  userImage?: string
  roomId?: string
  groupId?: string
}

export interface UserLeftPayload {
  userId: string
  roomId?: string
  groupId?: string
}

// Extended WebSocket with custom properties
interface ExtendedWebSocket extends WebSocket {
  userId?: string
  isAlive?: boolean
  subscriptions?: Set<string>
}

// Connection pool
const connections = new Map<string, Set<ExtendedWebSocket>>()

// Heartbeat interval (30 seconds)
const HEARTBEAT_INTERVAL = 30000

// Typing indicator TTL (5 seconds)
const TYPING_TTL = 5

/**
 * Initialize WebSocket server
 */
export function initializeWebSocketServer(server: any): WebSocketServer {
  const wss = new WebSocketServer({ 
    noServer: true,
    path: '/api/community/ws'
  })

  // Handle upgrade requests
  server.on('upgrade', async (request: IncomingMessage, socket: any, head: Buffer) => {
    const { pathname } = parse(request.url || '', true)
    
    if (pathname === '/api/community/ws') {
      try {
        // Authenticate the connection
        const userId = await authenticateConnection(request)
        
        if (!userId) {
          socket.write('HTTP/1.1 401 Unauthorized\r\n\r\n')
          socket.destroy()
          return
        }

        // Complete the upgrade
        wss.handleUpgrade(request, socket, head, (ws) => {
          wss.emit('connection', ws, request, userId)
        })
      } catch (error) {
        console.error('[WebSocket] Upgrade error:', error)
        socket.write('HTTP/1.1 500 Internal Server Error\r\n\r\n')
        socket.destroy()
      }
    } else {
      socket.destroy()
    }
  })

  // Handle new connections
  wss.on('connection', async (ws: WebSocket, _request: IncomingMessage, userId: string) => {
    const extWs = ws as ExtendedWebSocket
    console.log(`[WebSocket] User ${userId} connected`)
    
    // Set up connection properties
    extWs.userId = userId
    extWs.isAlive = true
    extWs.subscriptions = new Set()

    // Add to connection pool
    if (!connections.has(userId)) {
      connections.set(userId, new Set())
    }
    connections.get(userId)!.add(extWs)

    // Track online status in Redis
    await trackOnlineStatus(userId, true)

    // Set up ping/pong for connection health
    extWs.on('pong', () => {
      extWs.isAlive = true
    })

    // Handle incoming messages
    extWs.on('message', async (data: Buffer) => {
      try {
        const message: WSMessage = JSON.parse(data.toString())
        await handleMessage(extWs, message)
      } catch (error) {
        console.error('[WebSocket] Message handling error:', error)
        sendError(extWs, 'Invalid message format')
      }
    })

    // Handle disconnection
    extWs.on('close', async () => {
      console.log(`[WebSocket] User ${userId} disconnected`)
      
      // Remove from connection pool
      const userConnections = connections.get(userId)
      if (userConnections) {
        userConnections.delete(extWs)
        if (userConnections.size === 0) {
          connections.delete(userId)
          // User has no more connections, mark as offline
          await trackOnlineStatus(userId, false)
        }
      }

      // Unsubscribe from all channels
      if (extWs.subscriptions) {
        for (const channel of extWs.subscriptions) {
          await unsubscribeFromChannel(extWs, channel)
        }
      }
    })

    // Handle errors
    extWs.on('error', (error: Error) => {
      console.error('[WebSocket] Connection error:', error)
    })

    // Send welcome message
    sendMessage(extWs, {
      type: 'USER_JOINED',
      payload: {
        userId,
        message: 'Connected to WebSocket server'
      }
    })
  })

  // Start heartbeat interval
  const heartbeatInterval = setInterval(() => {
    wss.clients.forEach((ws: WebSocket) => {
      const extWs = ws as ExtendedWebSocket
      
      if (extWs.isAlive === false) {
        console.log(`[WebSocket] Terminating inactive connection for user ${extWs.userId}`)
        return ws.terminate()
      }

      extWs.isAlive = false
      ws.ping()
    })
  }, HEARTBEAT_INTERVAL)

  // Clean up on server close
  wss.on('close', () => {
    clearInterval(heartbeatInterval)
  })

  console.log('[WebSocket] Server initialized')
  return wss
}

/**
 * Authenticate WebSocket connection using JWT token
 */
async function authenticateConnection(request: IncomingMessage): Promise<string | null> {
  try {
    const { query } = parse(request.url || '', true)
    const token = query.token as string

    if (!token) {
      console.error('[WebSocket] No token provided')
      return null
    }

    // Verify JWT token
    const secret = process.env.NEXTAUTH_SECRET
    if (!secret) {
      console.error('[WebSocket] NEXTAUTH_SECRET not configured')
      return null
    }

    const decoded = verify(token, secret) as { sub?: string }
    
    if (!decoded.sub) {
      console.error('[WebSocket] Invalid token payload')
      return null
    }

    return decoded.sub
  } catch (error) {
    console.error('[WebSocket] Authentication error:', error)
    return null
  }
}

/**
 * Handle incoming WebSocket messages
 */
async function handleMessage(ws: ExtendedWebSocket, message: WSMessage): Promise<void> {
  const { type, payload } = message

  switch (type) {
    case 'PING':
      sendMessage(ws, { type: 'PONG', payload: {} })
      break

    case 'TYPING':
      await handleTypingIndicator(ws, payload as TypingPayload)
      break

    case 'CHAT_MESSAGE':
      // Chat messages are handled via API routes and broadcasted via Redis Pub/Sub
      // This is just for receiving acknowledgment
      break

    default:
      console.warn(`[WebSocket] Unknown message type: ${type}`)
  }
}

/**
 * Handle typing indicator
 */
async function handleTypingIndicator(ws: ExtendedWebSocket, payload: TypingPayload): Promise<void> {
  if (!ws.userId) return

  const { roomId, groupId, isTyping } = payload
  const channel = roomId ? `room:${roomId}` : groupId ? `group:${groupId}` : null

  if (!channel) {
    console.error('[WebSocket] Invalid typing indicator payload')
    return
  }

  try {
    const redis = getRedisClient()
    const typingKey = `${channel}:typing`

    if (isTyping) {
      // Add user to typing set with TTL
      await redis.hset(typingKey, { [ws.userId]: Date.now().toString() })
      await redis.expire(typingKey, TYPING_TTL)
    } else {
      // Remove user from typing set
      await redis.hdel(typingKey, ws.userId)
    }

    // Broadcast typing indicator to all users in the channel
    await publishMessage(channel, {
      type: 'TYPING',
      payload: {
        userId: ws.userId,
        userName: payload.userName,
        roomId,
        groupId,
        isTyping
      }
    })
  } catch (error) {
    console.error('[WebSocket] Typing indicator error:', error)
  }
}

/**
 * Subscribe to a room or group channel
 */
export async function subscribeToChannel(ws: ExtendedWebSocket, channel: string): Promise<void> {
  if (!ws.subscriptions) {
    ws.subscriptions = new Set()
  }

  ws.subscriptions.add(channel)
  
  // Subscribe to Redis Pub/Sub for this channel
  await subscribeToPubSub(channel, (message: WSMessage) => {
    // Broadcast to this specific connection
    if (ws.readyState === WebSocket.OPEN) {
      sendMessage(ws, message)
    }
  })

  console.log(`[WebSocket] User ${ws.userId} subscribed to ${channel}`)
}

/**
 * Unsubscribe from a channel
 */
async function unsubscribeFromChannel(ws: ExtendedWebSocket, channel: string): Promise<void> {
  if (ws.subscriptions) {
    ws.subscriptions.delete(channel)
  }
  
  console.log(`[WebSocket] User ${ws.userId} unsubscribed from ${channel}`)
}

/**
 * Track user online status in Redis
 */
async function trackOnlineStatus(userId: string, isOnline: boolean): Promise<void> {
  try {
    const redis = getRedisClient()
    const onlineKey = 'users:online'

    if (isOnline) {
      await redis.sadd(onlineKey, userId)
    } else {
      await redis.srem(onlineKey, userId)
    }
  } catch (error) {
    console.error('[WebSocket] Online status tracking error:', error)
  }
}

/**
 * Send message to a specific WebSocket connection
 */
function sendMessage(ws: ExtendedWebSocket, message: WSMessage): void {
  if (ws.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify(message))
  }
}

/**
 * Send error message to a WebSocket connection
 */
function sendError(ws: ExtendedWebSocket, error: string): void {
  sendMessage(ws, {
    type: 'MESSAGE_EDIT', // Reusing type for error
    payload: { error }
  })
}

/**
 * Broadcast message to all connections of a user
 */
export function broadcastToUser(userId: string, message: WSMessage): void {
  const userConnections = connections.get(userId)
  if (userConnections) {
    userConnections.forEach((ws) => {
      sendMessage(ws, message)
    })
  }
}

/**
 * Broadcast message to all users in a room or group
 */
export async function broadcastToChannel(channel: string, message: WSMessage): Promise<void> {
  // Publish to Redis Pub/Sub so all server instances can broadcast
  await publishMessage(channel, message)
}

/**
 * Get online users in a room or group
 */
export async function getOnlineUsers(roomId?: string, groupId?: string): Promise<string[]> {
  try {
    const redis = getRedisClient()
    const channel = roomId ? `room:${roomId}` : groupId ? `group:${groupId}` : null
    
    if (!channel) return []

    const onlineKey = `${channel}:online`
    const onlineUsers = await redis.smembers(onlineKey)
    
    return onlineUsers
  } catch (error) {
    console.error('[WebSocket] Get online users error:', error)
    return []
  }
}

/**
 * Get all active connections count
 */
export function getActiveConnectionsCount(): number {
  let count = 0
  connections.forEach((userConnections) => {
    count += userConnections.size
  })
  return count
}

/**
 * Get connection pool stats
 */
export function getConnectionStats(): {
  totalConnections: number
  uniqueUsers: number
  averageConnectionsPerUser: number
} {
  const totalConnections = getActiveConnectionsCount()
  const uniqueUsers = connections.size
  const averageConnectionsPerUser = uniqueUsers > 0 ? totalConnections / uniqueUsers : 0

  return {
    totalConnections,
    uniqueUsers,
    averageConnectionsPerUser: Math.round(averageConnectionsPerUser * 100) / 100
  }
}
