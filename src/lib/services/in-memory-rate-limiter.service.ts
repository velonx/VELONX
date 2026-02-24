/**
 * In-Memory Rate Limiter Service
 * Implements sliding window algorithm with automatic cleanup and LRU eviction
 * Fixes memory leak issues by implementing proper cleanup and size limits
 */

export interface RateLimitEntry {
  requests: number[]
  resetAt: number
}

export interface RateLimitConfig {
  windowMs: number // Time window in milliseconds
  maxRequests: number // Maximum requests allowed in window
  maxStoreSize?: number // Maximum number of entries in store
  cleanupInterval?: number // Cleanup interval in milliseconds
  cleanupProbability?: number // Probability of cleanup on each request (0-1)
}

export interface RateLimitResult {
  allowed: boolean
  remaining: number
  resetAt: Date
  retryAfter?: number
}

export interface StoreStats {
  size: number
  maxSize: number
  utilizationPercent: number
}

export class InMemoryRateLimiter {
  private store: Map<string, RateLimitEntry> = new Map()
  private config: Required<RateLimitConfig>
  private cleanupIntervalId?: NodeJS.Timeout

  // Default configuration
  private static readonly DEFAULT_CONFIG: Required<RateLimitConfig> = {
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 100,
    maxStoreSize: 10000,
    cleanupInterval: 60000, // 60 seconds
    cleanupProbability: 0.01 // 1% chance
  }

  constructor(config: RateLimitConfig) {
    this.config = {
      ...InMemoryRateLimiter.DEFAULT_CONFIG,
      ...config
    }

    // Start periodic cleanup
    this.startPeriodicCleanup()
  }

  /**
   * Check if a request should be rate limited
   * Uses sliding window algorithm with in-memory store
   */
  async checkRateLimit(
    identifier: string,
    endpoint: string
  ): Promise<RateLimitResult> {
    const key = this.buildKey(identifier, endpoint)
    const now = Date.now()

    // Probabilistic cleanup (1% chance per request)
    if (Math.random() < this.config.cleanupProbability) {
      this.cleanup(now)
    }

    // Check store size and enforce limit
    if (this.store.size >= this.config.maxStoreSize) {
      this.evictOldest()
    }

    // Get or create entry
    let entry = this.store.get(key)
    if (!entry) {
      entry = {
        requests: [now],
        resetAt: now + this.config.windowMs
      }
      this.store.set(key, entry)

      return {
        allowed: true,
        remaining: this.config.maxRequests - 1,
        resetAt: new Date(entry.resetAt)
      }
    }

    // Remove expired requests (sliding window)
    const windowStart = now - this.config.windowMs
    entry.requests = entry.requests.filter(ts => ts > windowStart)

    // Update resetAt
    entry.resetAt = now + this.config.windowMs

    // Check limit
    if (entry.requests.length >= this.config.maxRequests) {
      // Calculate retry after
      const oldestRequest = entry.requests[0]
      const timeUntilOldestExpires = oldestRequest + this.config.windowMs - now
      const retryAfter = Math.ceil(Math.max(0, timeUntilOldestExpires) / 1000)

      return {
        allowed: false,
        remaining: 0,
        resetAt: new Date(entry.resetAt),
        retryAfter
      }
    }

    // Add current request
    entry.requests.push(now)

    return {
      allowed: true,
      remaining: this.config.maxRequests - entry.requests.length,
      resetAt: new Date(entry.resetAt)
    }
  }

  /**
   * Cleanup expired entries from the store
   * Removes entries where resetAt < current time and requests array is empty
   */
  private cleanup(now: number): void {
    const keysToDelete: string[] = []
    const windowStart = now - this.config.windowMs

    for (const [key, entry] of this.store.entries()) {
      // Remove expired requests from entry
      entry.requests = entry.requests.filter(ts => ts > windowStart)

      // If entry has no requests and is expired, mark for deletion
      if (entry.requests.length === 0 && entry.resetAt < now) {
        keysToDelete.push(key)
      }
    }

    // Delete expired entries
    keysToDelete.forEach(key => this.store.delete(key))

    if (keysToDelete.length > 0) {
      console.log(`[InMemoryRateLimiter] Cleaned up ${keysToDelete.length} expired entries`)
    }
  }

  /**
   * Start periodic cleanup interval
   */
  private startPeriodicCleanup(): void {
    this.cleanupIntervalId = setInterval(() => {
      const now = Date.now()
      this.cleanup(now)
    }, this.config.cleanupInterval)

    // Ensure cleanup stops when process exits
    if (typeof process !== 'undefined') {
      process.on('beforeExit', () => this.stopPeriodicCleanup())
    }
  }

  /**
   * Stop periodic cleanup interval
   */
  private stopPeriodicCleanup(): void {
    if (this.cleanupIntervalId) {
      clearInterval(this.cleanupIntervalId)
      this.cleanupIntervalId = undefined
    }
  }

  /**
   * Evict oldest entry when store reaches capacity
   * Uses LRU (Least Recently Used) eviction policy based on resetAt
   */
  private evictOldest(): void {
    let oldestKey: string | null = null
    let oldestResetAt = Infinity

    for (const [key, entry] of this.store.entries()) {
      if (entry.resetAt < oldestResetAt) {
        oldestResetAt = entry.resetAt
        oldestKey = key
      }
    }

    if (oldestKey) {
      this.store.delete(oldestKey)
      console.warn(`[InMemoryRateLimiter] Evicted entry due to size limit: ${oldestKey}`)
    }
  }

  /**
   * Get store size
   */
  getStoreSize(): number {
    return this.store.size
  }

  /**
   * Get store statistics and utilization
   */
  getStoreStats(): StoreStats {
    const size = this.store.size
    const maxSize = this.config.maxStoreSize
    const utilizationPercent = (size / maxSize) * 100

    // Log warning if utilization exceeds 80%
    if (utilizationPercent > 80) {
      console.warn(
        `[InMemoryRateLimiter] Store utilization at ${utilizationPercent.toFixed(2)}% ` +
        `(${size}/${maxSize} entries)`
      )
    }

    return {
      size,
      maxSize,
      utilizationPercent
    }
  }

  /**
   * Reset rate limit for a specific identifier and endpoint
   */
  resetLimit(identifier: string, endpoint?: string): void {
    if (endpoint) {
      const key = this.buildKey(identifier, endpoint)
      this.store.delete(key)
    } else {
      // Reset all endpoints for this identifier
      const prefix = `${identifier}:`
      const keysToDelete: string[] = []

      for (const key of this.store.keys()) {
        if (key.startsWith(prefix)) {
          keysToDelete.push(key)
        }
      }

      keysToDelete.forEach(key => this.store.delete(key))
    }
  }

  /**
   * Get current request count for an identifier and endpoint
   */
  getCurrentCount(identifier: string, endpoint: string): number {
    const key = this.buildKey(identifier, endpoint)
    const entry = this.store.get(key)

    if (!entry) {
      return 0
    }

    const now = Date.now()
    const windowStart = now - this.config.windowMs

    // Filter expired requests
    const validRequests = entry.requests.filter(ts => ts > windowStart)
    return validRequests.length
  }

  /**
   * Build key for rate limiting
   */
  private buildKey(identifier: string, endpoint: string): string {
    const sanitizedEndpoint = endpoint
      .replace(/^\/api\//, '')
      .replace(/\//g, ':')
      .replace(/[^a-zA-Z0-9:_-]/g, '_')

    return `${identifier}:${sanitizedEndpoint}`
  }

  /**
   * Get configuration
   */
  getConfig(): Readonly<Required<RateLimitConfig>> {
    return { ...this.config }
  }

  /**
   * Cleanup resources
   */
  destroy(): void {
    this.stopPeriodicCleanup()
    this.store.clear()
  }
}

/**
 * Create an in-memory rate limiter with custom configuration
 */
export function createInMemoryRateLimiter(config: RateLimitConfig): InMemoryRateLimiter {
  return new InMemoryRateLimiter(config)
}
