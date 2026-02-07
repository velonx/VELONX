/**
 * Rate Limiter Service
 * Implements sliding window algorithm using Upstash Redis
 * Protects API endpoints from abuse and DDoS attacks
 */

import { Redis } from '@upstash/redis'
import { redisManager } from '@/lib/redis'

export interface RateLimitConfig {
  windowMs: number // Time window in milliseconds
  maxRequests: number // Maximum requests allowed in window
  keyPrefix?: string // Optional prefix for Redis keys
}

export interface RateLimitResult {
  allowed: boolean
  remaining: number
  resetAt: Date
  retryAfter?: number // Seconds to wait before retrying (only when blocked)
}

export class RateLimiter {
  private redis: Redis
  private config: Required<RateLimitConfig>

  // Default configurations
  public static readonly ANONYMOUS_CONFIG: RateLimitConfig = {
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 100,
    keyPrefix: 'ratelimit:anon'
  }

  public static readonly AUTHENTICATED_CONFIG: RateLimitConfig = {
    windowMs: 60 * 60 * 1000, // 1 hour
    maxRequests: 500,
    keyPrefix: 'ratelimit:auth'
  }

  constructor(config: RateLimitConfig) {
    this.redis = redisManager.getClient()
    this.config = {
      keyPrefix: 'ratelimit',
      ...config
    }
  }

  /**
   * Check if a request should be rate limited
   * Uses sliding window algorithm with Redis sorted sets
   */
  async checkLimit(
    identifier: string,
    endpoint: string
  ): Promise<RateLimitResult> {
    const key = this.buildKey(identifier, endpoint)
    const now = Date.now()
    const windowStart = now - this.config.windowMs

    try {
      // Remove expired entries
      await this.redis.zremrangebyscore(key, 0, windowStart)
      
      // Add current request
      const requestId = `${now}:${Math.random()}`
      await this.redis.zadd(key, { score: now, member: requestId })
      
      // Count requests in current window
      const requestCount = await this.redis.zcard(key)
      
      // Set expiration
      const expirationSeconds = Math.ceil(this.config.windowMs / 1000)
      await this.redis.expire(key, expirationSeconds)
      
      // Calculate remaining requests
      const remaining = Math.max(0, this.config.maxRequests - requestCount)
      const allowed = requestCount <= this.config.maxRequests
      const resetAt = new Date(now + this.config.windowMs)
      
      // Calculate retry after if blocked
      let retryAfter: number | undefined
      if (!allowed) {
        try {
          const oldestRequests = await this.redis.zrange(key, 0, 0, { withScores: true })
          if (oldestRequests && oldestRequests.length > 0) {
            // Get the score (timestamp) from the first element
            let oldestTimestamp = now
            if (typeof oldestRequests[0] === 'object' && oldestRequests[0] && 'score' in oldestRequests[0]) {
              oldestTimestamp = (oldestRequests[0] as { score: number }).score
            }
            const timeUntilOldestExpires = oldestTimestamp + this.config.windowMs - now
            retryAfter = Math.ceil(Math.max(0, timeUntilOldestExpires) / 1000)
          } else {
            retryAfter = Math.ceil(this.config.windowMs / 1000)
          }
        } catch (error) {
          retryAfter = Math.ceil(this.config.windowMs / 1000)
        }
      }
      
      return {
        allowed,
        remaining,
        resetAt,
        retryAfter
      }
    } catch (error) {
      console.error('[RateLimiter] Error checking limit:', error)
      console.warn('[RateLimiter] Failing open due to Redis error')
      
      // Fail open: allow request if Redis is unavailable
      return {
        allowed: true,
        remaining: this.config.maxRequests,
        resetAt: new Date(now + this.config.windowMs)
      }
    }
  }

  /**
   * Reset rate limit for a specific identifier and endpoint
   */
  async resetLimit(identifier: string, endpoint?: string): Promise<void> {
    try {
      if (endpoint) {
        const key = this.buildKey(identifier, endpoint)
        await this.redis.del(key)
      } else {
        // Reset all endpoints for this identifier
        const pattern = `${this.config.keyPrefix}:${identifier}:*`
        const keys = await this.redis.keys(pattern)
        
        if (keys.length > 0) {
          await this.redis.del(...keys)
        }
      }
    } catch (error) {
      console.error('[RateLimiter] Error resetting limit:', error)
      throw error
    }
  }

  /**
   * Get current request count for an identifier and endpoint
   */
  async getCurrentCount(identifier: string, endpoint: string): Promise<number> {
    const key = this.buildKey(identifier, endpoint)
    const now = Date.now()
    const windowStart = now - this.config.windowMs

    try {
      await this.redis.zremrangebyscore(key, 0, windowStart)
      const count = await this.redis.zcard(key)
      return count
    } catch (error) {
      console.error('[RateLimiter] Error getting current count:', error)
      return 0
    }
  }

  /**
   * Build Redis key for rate limiting
   */
  private buildKey(identifier: string, endpoint: string): string {
    const sanitizedEndpoint = endpoint
      .replace(/^\/api\//, '')
      .replace(/\//g, ':')
      .replace(/[^a-zA-Z0-9:_-]/g, '_')

    return `${this.config.keyPrefix}:${identifier}:${sanitizedEndpoint}`
  }

  /**
   * Get configuration for this rate limiter
   */
  getConfig(): Readonly<Required<RateLimitConfig>> {
    return { ...this.config }
  }
}

/**
 * Create a rate limiter for anonymous users
 */
export function createAnonymousRateLimiter(): RateLimiter {
  return new RateLimiter(RateLimiter.ANONYMOUS_CONFIG)
}

/**
 * Create a rate limiter for authenticated users
 */
export function createAuthenticatedRateLimiter(): RateLimiter {
  return new RateLimiter(RateLimiter.AUTHENTICATED_CONFIG)
}

/**
 * Create a custom rate limiter with specific configuration
 */
export function createCustomRateLimiter(config: RateLimitConfig): RateLimiter {
  return new RateLimiter(config)
}
