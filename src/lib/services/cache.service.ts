/**
 * Cache Service
 * Provides caching functionality with Upstash Redis backend
 * Implements cache-aside pattern with TTL support
 */

import { Redis } from '@upstash/redis'
import { getRedisClient } from '@/lib/redis'
import { performanceMonitor } from '@/lib/services/performance-monitor.service'

/**
 * Cache Service Configuration
 */
export interface CacheConfig {
  defaultTTL: number // Default TTL in seconds
}

/**
 * Cache Service
 */
export class CacheService {
  private client: Redis | null = null
  private config: CacheConfig

  constructor(config?: Partial<CacheConfig>) {
    this.config = {
      defaultTTL: config?.defaultTTL || 300, // 5 minutes default
    }
  }

  /**
   * Initialize the cache service with Redis client
   */
  private initializeClient(): void {
    if (!this.client) {
      this.client = getRedisClient()
    }
  }

  /**
   * Get value from cache
   */
  async get<T>(key: string): Promise<T | null> {
    const startTime = Date.now()
    
    try {
      this.initializeClient()
      const value = await this.client!.get<T>(key)
      const duration = Date.now() - startTime
      
      // Track cache operation
      await performanceMonitor.trackCacheOperation({
        operation: 'get',
        key,
        hit: value !== null,
        duration,
        timestamp: startTime,
      })
      
      return value
    } catch (error) {
      const duration = Date.now() - startTime
      
      // Track failed operation
      await performanceMonitor.trackCacheOperation({
        operation: 'get',
        key,
        hit: false,
        duration,
        timestamp: startTime,
      })
      
      console.error(`[Cache] Error getting key ${key}:`, error)
      return null
    }
  }

  /**
   * Set value in cache with TTL
   */
  async set<T>(key: string, value: T, ttl?: number): Promise<void> {
    const startTime = Date.now()
    
    try {
      this.initializeClient()
      const expirationTime = ttl || this.config.defaultTTL

      await this.client!.set(key, value, { ex: expirationTime })
      const duration = Date.now() - startTime
      
      // Track cache operation
      await performanceMonitor.trackCacheOperation({
        operation: 'set',
        key,
        hit: true,
        duration,
        timestamp: startTime,
      })
    } catch (error) {
      const duration = Date.now() - startTime
      
      // Track failed operation
      await performanceMonitor.trackCacheOperation({
        operation: 'set',
        key,
        hit: false,
        duration,
        timestamp: startTime,
      })
      
      console.error(`[Cache] Error setting key ${key}:`, error)
      throw error
    }
  }

  /**
   * Invalidate cache entries matching a pattern
   */
  async invalidate(pattern: string): Promise<void> {
    const startTime = Date.now()
    
    try {
      this.initializeClient()
      const keys = await this.client!.keys(pattern)
      
      if (keys.length > 0) {
        await this.client!.del(...keys)
        console.log(`[Cache] Invalidated ${keys.length} keys matching pattern: ${pattern}`)
      }
      
      const duration = Date.now() - startTime
      
      // Track cache operation
      await performanceMonitor.trackCacheOperation({
        operation: 'invalidate',
        key: pattern,
        hit: true,
        duration,
        timestamp: startTime,
      })
    } catch (error) {
      const duration = Date.now() - startTime
      
      // Track failed operation
      await performanceMonitor.trackCacheOperation({
        operation: 'invalidate',
        key: pattern,
        hit: false,
        duration,
        timestamp: startTime,
      })
      
      console.error(`[Cache] Error invalidating pattern ${pattern}:`, error)
      throw error
    }
  }

  /**
   * Get or set pattern (cache-aside)
   */
  async getOrSet<T>(
    key: string,
    fetcher: () => Promise<T>,
    ttl?: number
  ): Promise<T> {
    try {
      // Try to get from cache first
      const cachedValue = await this.get<T>(key)
      
      if (cachedValue !== null) {
        return cachedValue
      }

      // Cache miss - fetch data
      const value = await fetcher()
      
      // Store in cache
      await this.set(key, value, ttl)
      
      return value
    } catch (error) {
      console.error(`[Cache] Error in getOrSet for key ${key}:`, error)
      // On error, just fetch the data without caching
      return await fetcher()
    }
  }

  /**
   * Delete a specific cache key
   */
  async delete(key: string): Promise<void> {
    const startTime = Date.now()
    
    try {
      this.initializeClient()
      await this.client!.del(key)
      const duration = Date.now() - startTime
      
      // Track cache operation
      await performanceMonitor.trackCacheOperation({
        operation: 'delete',
        key,
        hit: true,
        duration,
        timestamp: startTime,
      })
    } catch (error) {
      const duration = Date.now() - startTime
      
      // Track failed operation
      await performanceMonitor.trackCacheOperation({
        operation: 'delete',
        key,
        hit: false,
        duration,
        timestamp: startTime,
      })
      
      console.error(`[Cache] Error deleting key ${key}:`, error)
      throw error
    }
  }

  /**
   * Check if a key exists in cache
   */
  async exists(key: string): Promise<boolean> {
    try {
      this.initializeClient()
      const result = await this.client!.exists(key)
      return result === 1
    } catch (error) {
      console.error(`[Cache] Error checking existence of key ${key}:`, error)
      return false
    }
  }

  /**
   * Get remaining TTL for a key
   */
  async getTTL(key: string): Promise<number> {
    try {
      this.initializeClient()
      return await this.client!.ttl(key)
    } catch (error) {
      console.error(`[Cache] Error getting TTL for key ${key}:`, error)
      return -2
    }
  }

  /**
   * Clear all cache entries (use with caution!)
   */
  async clear(): Promise<void> {
    try {
      this.initializeClient()
      const keys = await this.client!.keys('*')
      if (keys.length > 0) {
        await this.client!.del(...keys)
      }
      console.log('[Cache] All cache entries cleared')
    } catch (error) {
      console.error('[Cache] Error clearing cache:', error)
      throw error
    }
  }
}

/**
 * Cache key generators for different entity types
 */
export const CacheKeys = {
  user: {
    profile: (userId: string) => `user:${userId}:profile`,
    stats: (userId: string) => `user:${userId}:stats`,
    all: (userId: string) => `user:${userId}:*`,
  },
  
  resource: {
    details: (resourceId: string) => `resource:${resourceId}:details`,
    list: (page: number, category?: string, type?: string, search?: string) => {
      const filters = [category, type, search].filter(Boolean).join(':')
      return `resource:list:${page}${filters ? `:${filters}` : ''}`
    },
    all: () => `resource:*`,
  },
  
  course: {
    details: (courseId: string) => `course:${courseId}:details`,
    list: (page: number) => `course:list:${page}`,
    all: () => `course:*`,
  },
  
  leaderboard: {
    top: (limit: number) => `leaderboard:top:${limit}`,
    all: () => `leaderboard:*`,
  },
  
  blog: {
    post: (postId: string) => `blog:${postId}:post`,
    list: (page: number) => `blog:list:${page}`,
    all: () => `blog:*`,
  },
  
  event: {
    details: (eventId: string) => `event:${eventId}:details`,
    list: (page: number) => `event:list:${page}`,
    all: () => `event:*`,
  },
  
  project: {
    details: (projectId: string) => `project:${projectId}:details`,
    list: (page: number) => `project:list:${page}`,
    all: () => `project:*`,
  },
}

/**
 * TTL constants for different data types (in seconds)
 */
export const CacheTTL = {
  DYNAMIC: 300,           // 5 minutes
  STATIC: 3600,           // 1 hour
  USER_PROFILE: 300,
  USER_STATS: 300,
  RESOURCE_LIST: 300,
  RESOURCE_DETAILS: 300,
  COURSE_DETAILS: 3600,
  COURSE_LIST: 3600,
  LEADERBOARD: 300,
  BLOG_POST: 300,
  BLOG_LIST: 300,
  EVENT_DETAILS: 300,
  EVENT_LIST: 300,
  PROJECT_DETAILS: 300,
  PROJECT_LIST: 300,
}

// Export singleton instance
export const cacheService = new CacheService()
