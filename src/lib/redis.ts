/**
 * Upstash Redis Connection Manager
 * Provides a singleton Redis client using Upstash REST API
 * Optimized for serverless environments
 */

import { Redis } from '@upstash/redis'

interface RedisHealthStatus {
  isHealthy: boolean
  latency: number | null
  lastCheck: Date
}

class UpstashRedisManager {
  private static instance: UpstashRedisManager
  private client: Redis | null = null
  private healthCheckInterval: NodeJS.Timeout | null = null
  private lastHealthStatus: RedisHealthStatus = {
    isHealthy: false,
    latency: null,
    lastCheck: new Date()
  }

  private constructor() {}

  /**
   * Get singleton instance
   */
  public static getInstance(): UpstashRedisManager {
    if (!UpstashRedisManager.instance) {
      UpstashRedisManager.instance = new UpstashRedisManager()
    }
    return UpstashRedisManager.instance
  }

  /**
   * Initialize Upstash Redis connection
   */
  public async initialize(): Promise<void> {
    if (this.client) {
      console.log('[Redis] Already connected to Upstash')
      return
    }

    try {
      const upstashUrl = process.env.UPSTASH_REDIS_REST_URL
      const upstashToken = process.env.UPSTASH_REDIS_REST_TOKEN

      if (!upstashUrl || !upstashToken) {
        throw new Error('Upstash Redis credentials not found in environment variables')
      }

      console.log('[Redis] Connecting to Upstash Redis...')
      this.client = new Redis({
        url: upstashUrl,
        token: upstashToken,
      })
      
      // Test connection
      await this.client.ping()
      console.log('[Redis] Connected to Upstash successfully!')
      
      // Start health check monitoring
      this.startHealthCheck()
      
    } catch (error) {
      console.error('[Redis] Connection failed:', error)
      throw error
    }
  }

  /**
   * Start periodic health checks
   */
  private startHealthCheck(): void {
    // Check health every 30 seconds
    this.healthCheckInterval = setInterval(async () => {
      await this.performHealthCheck()
    }, 30000)

    // Perform initial health check
    this.performHealthCheck()
  }

  /**
   * Perform health check on Redis connection
   */
  private async performHealthCheck(): Promise<void> {
    if (!this.client) {
      this.lastHealthStatus = {
        isHealthy: false,
        latency: null,
        lastCheck: new Date()
      }
      return
    }

    try {
      const start = Date.now()
      await this.client.ping()
      const latency = Date.now() - start

      this.lastHealthStatus = {
        isHealthy: true,
        latency,
        lastCheck: new Date()
      }
    } catch (error) {
      console.error('[Redis] Health check failed:', error)
      this.lastHealthStatus = {
        isHealthy: false,
        latency: null,
        lastCheck: new Date()
      }
    }
  }

  /**
   * Get Redis client instance
   */
  public getClient(): Redis {
    if (!this.client) {
      throw new Error('Redis client not initialized. Call initialize() first.')
    }
    return this.client
  }

  /**
   * Get current health status
   */
  public getHealthStatus(): RedisHealthStatus {
    return { ...this.lastHealthStatus }
  }

  /**
   * Check if Redis is healthy
   */
  public isHealthy(): boolean {
    return this.lastHealthStatus.isHealthy
  }

  /**
   * Manually trigger reconnection
   */
  public async reconnect(): Promise<void> {
    console.log('[Redis] Manual reconnection triggered')
    
    if (this.client) {
      await this.disconnect()
    }

    await this.initialize()
  }

  /**
   * Disconnect from Redis
   */
  public async disconnect(): Promise<void> {
    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval)
      this.healthCheckInterval = null
    }

    this.client = null
    console.log('[Redis] Disconnected')
  }
}

// Export singleton instance
export const redisManager = UpstashRedisManager.getInstance()

// Export convenience functions
export const getRedisClient = (): Redis => {
  return redisManager.getClient()
}

export const getRedisHealth = (): RedisHealthStatus => {
  return redisManager.getHealthStatus()
}

export const initializeRedis = async (): Promise<void> => {
  await redisManager.initialize()
}

// Export type
export type { RedisHealthStatus }
