/**
 * Redis Pub/Sub for WebSocket Message Broadcasting
 * Enables multi-instance WebSocket server communication
 */

import Redis from 'ioredis'
import { WSMessage } from './server'

// Redis clients for pub/sub (separate from main Redis client)
let publisherClient: Redis | null = null
let subscriberClient: Redis | null = null

// Channel subscriptions
const channelHandlers = new Map<string, Set<(message: WSMessage) => void>>()

/**
 * Initialize Redis Pub/Sub clients
 */
export async function initializePubSub(): Promise<void> {
  if (publisherClient && subscriberClient) {
    console.log('[PubSub] Already initialized')
    return
  }

  try {
    const redisUrl = process.env.UPSTASH_REDIS_REST_URL
    const redisToken = process.env.UPSTASH_REDIS_REST_TOKEN

    if (!redisUrl || !redisToken) {
      throw new Error('Redis credentials not found in environment variables')
    }

    // Parse Upstash REST URL to get connection details
    // Upstash REST URL format: https://[host]
    // We need to convert this to redis://[host]:6379 for ioredis
    const url = new URL(redisUrl)
    const host = url.hostname
    
    // For Upstash, we use TLS connection
    const redisConfig = {
      host,
      port: 6379,
      password: redisToken,
      tls: {
        rejectUnauthorized: false
      },
      retryStrategy: (times: number) => {
        const delay = Math.min(times * 50, 2000)
        return delay
      },
      maxRetriesPerRequest: 3
    }

    // Create separate clients for publishing and subscribing
    publisherClient = new Redis(redisConfig)
    subscriberClient = new Redis(redisConfig)

    // Test connections
    await publisherClient.ping()
    await subscriberClient.ping()

    // Set up message handler for subscriber
    subscriberClient.on('message', (channel: string, message: string) => {
      try {
        const wsMessage: WSMessage = JSON.parse(message)
        const handlers = channelHandlers.get(channel)
        
        if (handlers) {
          handlers.forEach((handler) => {
            try {
              handler(wsMessage)
            } catch (error) {
              console.error('[PubSub] Handler error:', error)
            }
          })
        }
      } catch (error) {
        console.error('[PubSub] Message parsing error:', error)
      }
    })

    // Handle errors
    publisherClient.on('error', (error) => {
      console.error('[PubSub] Publisher error:', error)
    })

    subscriberClient.on('error', (error) => {
      console.error('[PubSub] Subscriber error:', error)
    })

    // Handle reconnection
    publisherClient.on('reconnecting', () => {
      console.log('[PubSub] Publisher reconnecting...')
    })

    subscriberClient.on('reconnecting', () => {
      console.log('[PubSub] Subscriber reconnecting...')
    })

    console.log('[PubSub] Initialized successfully')
  } catch (error) {
    console.error('[PubSub] Initialization failed:', error)
    throw error
  }
}

/**
 * Publish a message to a channel
 */
export async function publishMessage(channel: string, message: WSMessage): Promise<void> {
  if (!publisherClient) {
    console.error('[PubSub] Publisher not initialized')
    return
  }

  try {
    const messageStr = JSON.stringify(message)
    await publisherClient.publish(channel, messageStr)
    
    console.log(`[PubSub] Published to ${channel}:`, message.type)
  } catch (error) {
    console.error('[PubSub] Publish error:', error)
    throw error
  }
}

/**
 * Subscribe to a channel
 */
export async function subscribeToPubSub(
  channel: string,
  handler: (message: WSMessage) => void
): Promise<void> {
  if (!subscriberClient) {
    console.error('[PubSub] Subscriber not initialized')
    return
  }

  try {
    // Add handler to channel handlers
    if (!channelHandlers.has(channel)) {
      channelHandlers.set(channel, new Set())
      // Subscribe to channel if this is the first handler
      await subscriberClient.subscribe(channel)
      console.log(`[PubSub] Subscribed to channel: ${channel}`)
    }

    channelHandlers.get(channel)!.add(handler)
  } catch (error) {
    console.error('[PubSub] Subscribe error:', error)
    throw error
  }
}

/**
 * Unsubscribe from a channel
 */
export async function unsubscribeFromPubSub(
  channel: string,
  handler: (message: WSMessage) => void
): Promise<void> {
  if (!subscriberClient) {
    console.error('[PubSub] Subscriber not initialized')
    return
  }

  try {
    const handlers = channelHandlers.get(channel)
    
    if (handlers) {
      handlers.delete(handler)
      
      // If no more handlers, unsubscribe from channel
      if (handlers.size === 0) {
        channelHandlers.delete(channel)
        await subscriberClient.unsubscribe(channel)
        console.log(`[PubSub] Unsubscribed from channel: ${channel}`)
      }
    }
  } catch (error) {
    console.error('[PubSub] Unsubscribe error:', error)
    throw error
  }
}

/**
 * Publish a chat message to room or group
 */
export async function publishChatMessage(
  roomId: string | undefined,
  groupId: string | undefined,
  message: WSMessage
): Promise<void> {
  const channel = roomId ? `room:${roomId}` : groupId ? `group:${groupId}` : null
  
  if (!channel) {
    console.error('[PubSub] Invalid chat message target')
    return
  }

  await publishMessage(channel, message)
}

/**
 * Publish typing indicator to room or group
 */
export async function publishTypingIndicator(
  roomId: string | undefined,
  groupId: string | undefined,
  userId: string,
  userName: string,
  isTyping: boolean
): Promise<void> {
  const channel = roomId ? `room:${roomId}` : groupId ? `group:${groupId}` : null
  
  if (!channel) {
    console.error('[PubSub] Invalid typing indicator target')
    return
  }

  await publishMessage(channel, {
    type: 'TYPING',
    payload: {
      userId,
      userName,
      roomId,
      groupId,
      isTyping
    }
  })
}

/**
 * Publish user joined event to room or group
 */
export async function publishUserJoined(
  roomId: string | undefined,
  groupId: string | undefined,
  userId: string,
  userName: string,
  userImage?: string
): Promise<void> {
  const channel = roomId ? `room:${roomId}` : groupId ? `group:${groupId}` : null
  
  if (!channel) {
    console.error('[PubSub] Invalid user joined target')
    return
  }

  await publishMessage(channel, {
    type: 'USER_JOINED',
    payload: {
      userId,
      userName,
      userImage,
      roomId,
      groupId
    }
  })

  // Track online user in Redis
  try {
    if (publisherClient) {
      const onlineKey = `${channel}:online`
      await publisherClient.sadd(onlineKey, userId)
    }
  } catch (error) {
    console.error('[PubSub] Track online user error:', error)
  }
}

/**
 * Publish user left event to room or group
 */
export async function publishUserLeft(
  roomId: string | undefined,
  groupId: string | undefined,
  userId: string
): Promise<void> {
  const channel = roomId ? `room:${roomId}` : groupId ? `group:${groupId}` : null
  
  if (!channel) {
    console.error('[PubSub] Invalid user left target')
    return
  }

  await publishMessage(channel, {
    type: 'USER_LEFT',
    payload: {
      userId,
      roomId,
      groupId
    }
  })

  // Remove from online users in Redis
  try {
    if (publisherClient) {
      const onlineKey = `${channel}:online`
      await publisherClient.srem(onlineKey, userId)
    }
  } catch (error) {
    console.error('[PubSub] Remove online user error:', error)
  }
}

/**
 * Publish message edit event
 */
export async function publishMessageEdit(
  roomId: string | undefined,
  groupId: string | undefined,
  messageId: string,
  content: string
): Promise<void> {
  const channel = roomId ? `room:${roomId}` : groupId ? `group:${groupId}` : null
  
  if (!channel) {
    console.error('[PubSub] Invalid message edit target')
    return
  }

  await publishMessage(channel, {
    type: 'MESSAGE_EDIT',
    payload: {
      messageId,
      content,
      roomId,
      groupId
    }
  })
}

/**
 * Publish message delete event
 */
export async function publishMessageDelete(
  roomId: string | undefined,
  groupId: string | undefined,
  messageId: string
): Promise<void> {
  const channel = roomId ? `room:${roomId}` : groupId ? `group:${groupId}` : null
  
  if (!channel) {
    console.error('[PubSub] Invalid message delete target')
    return
  }

  await publishMessage(channel, {
    type: 'MESSAGE_DELETE',
    payload: {
      messageId,
      roomId,
      groupId
    }
  })
}

/**
 * Get all subscribed channels
 */
export function getSubscribedChannels(): string[] {
  return Array.from(channelHandlers.keys())
}

/**
 * Get subscription count for a channel
 */
export function getChannelSubscriptionCount(channel: string): number {
  const handlers = channelHandlers.get(channel)
  return handlers ? handlers.size : 0
}

/**
 * Get total subscription count across all channels
 */
export function getTotalSubscriptionCount(): number {
  let count = 0
  channelHandlers.forEach((handlers) => {
    count += handlers.size
  })
  return count
}

/**
 * Disconnect Pub/Sub clients
 */
export async function disconnectPubSub(): Promise<void> {
  try {
    if (subscriberClient) {
      await subscriberClient.quit()
      subscriberClient = null
    }

    if (publisherClient) {
      await publisherClient.quit()
      publisherClient = null
    }

    channelHandlers.clear()
    console.log('[PubSub] Disconnected')
  } catch (error) {
    console.error('[PubSub] Disconnect error:', error)
  }
}

/**
 * Check if Pub/Sub is initialized
 */
export function isPubSubInitialized(): boolean {
  return publisherClient !== null && subscriberClient !== null
}

/**
 * Get Pub/Sub health status
 */
export async function getPubSubHealth(): Promise<{
  isHealthy: boolean
  publisherConnected: boolean
  subscriberConnected: boolean
  subscribedChannels: number
  totalSubscriptions: number
}> {
  let publisherConnected = false
  let subscriberConnected = false

  try {
    if (publisherClient) {
      await publisherClient.ping()
      publisherConnected = true
    }
  } catch (error) {
    console.error('[PubSub] Publisher health check failed:', error)
  }

  try {
    if (subscriberClient) {
      await subscriberClient.ping()
      subscriberConnected = true
    }
  } catch (error) {
    console.error('[PubSub] Subscriber health check failed:', error)
  }

  return {
    isHealthy: publisherConnected && subscriberConnected,
    publisherConnected,
    subscriberConnected,
    subscribedChannels: channelHandlers.size,
    totalSubscriptions: getTotalSubscriptionCount()
  }
}
