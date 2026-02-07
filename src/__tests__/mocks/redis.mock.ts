/**
 * Mock Redis Client
 * 
 * In-memory Redis mock for unit testing
 */

import { vi } from 'vitest'

export class MockRedisClient {
  private store: Map<string, { value: string; expiry?: number }> = new Map()
  private sortedSets: Map<string, Map<string, number>> = new Map()

  /**
   * Get a value from the store
   */
  async get(key: string): Promise<string | null> {
    const entry = this.store.get(key)
    
    if (!entry) {
      return null
    }
    
    // Check if expired
    if (entry.expiry && Date.now() > entry.expiry) {
      this.store.delete(key)
      return null
    }
    
    return entry.value
  }

  /**
   * Set a value in the store
   */
  async set(key: string, value: string, options?: { EX?: number; PX?: number }): Promise<'OK'> {
    let expiry: number | undefined
    
    if (options?.EX) {
      expiry = Date.now() + options.EX * 1000
    } else if (options?.PX) {
      expiry = Date.now() + options.PX
    }
    
    this.store.set(key, { value, expiry })
    return 'OK'
  }

  /**
   * Set with expiration time
   */
  async setex(key: string, seconds: number, value: string): Promise<'OK'> {
    return this.set(key, value, { EX: seconds })
  }

  /**
   * Delete a key
   */
  async del(...keys: string[]): Promise<number> {
    let deleted = 0
    for (const key of keys) {
      if (this.store.delete(key)) {
        deleted++
      }
      if (this.sortedSets.delete(key)) {
        deleted++
      }
    }
    return deleted
  }

  /**
   * Check if key exists
   */
  async exists(...keys: string[]): Promise<number> {
    let count = 0
    for (const key of keys) {
      if (this.store.has(key) || this.sortedSets.has(key)) {
        count++
      }
    }
    return count
  }

  /**
   * Set expiration on a key
   */
  async expire(key: string, seconds: number): Promise<number> {
    const entry = this.store.get(key)
    if (!entry) {
      return 0
    }
    
    entry.expiry = Date.now() + seconds * 1000
    return 1
  }

  /**
   * Get time to live for a key
   */
  async ttl(key: string): Promise<number> {
    const entry = this.store.get(key)
    if (!entry) {
      return -2 // Key doesn't exist
    }
    
    if (!entry.expiry) {
      return -1 // No expiration set
    }
    
    const ttl = Math.ceil((entry.expiry - Date.now()) / 1000)
    return ttl > 0 ? ttl : -2
  }

  /**
   * Add member to sorted set
   */
  async zadd(key: string, score: number, member: string): Promise<number> {
    if (!this.sortedSets.has(key)) {
      this.sortedSets.set(key, new Map())
    }
    
    const set = this.sortedSets.get(key)!
    const isNew = !set.has(member)
    set.set(member, score)
    
    return isNew ? 1 : 0
  }

  /**
   * Get members in sorted set by score range
   */
  async zrangebyscore(key: string, min: number | string, max: number | string): Promise<string[]> {
    const set = this.sortedSets.get(key)
    if (!set) {
      return []
    }
    
    const minScore = typeof min === 'string' ? parseFloat(min) : min
    const maxScore = typeof max === 'string' ? parseFloat(max) : max
    
    return Array.from(set.entries())
      .filter(([_, score]) => score >= minScore && score <= maxScore)
      .sort((a, b) => a[1] - b[1])
      .map(([member]) => member)
  }

  /**
   * Remove members from sorted set by score range
   */
  async zremrangebyscore(key: string, min: number | string, max: number | string): Promise<number> {
    const set = this.sortedSets.get(key)
    if (!set) {
      return 0
    }
    
    const minScore = typeof min === 'string' ? parseFloat(min) : min
    const maxScore = typeof max === 'string' ? parseFloat(max) : max
    
    let removed = 0
    for (const [member, score] of set.entries()) {
      if (score >= minScore && score <= maxScore) {
        set.delete(member)
        removed++
      }
    }
    
    return removed
  }

  /**
   * Count members in sorted set
   */
  async zcard(key: string): Promise<number> {
    const set = this.sortedSets.get(key)
    return set ? set.size : 0
  }

  /**
   * Increment value
   */
  async incr(key: string): Promise<number> {
    const current = await this.get(key)
    const value = current ? parseInt(current, 10) + 1 : 1
    await this.set(key, value.toString())
    return value
  }

  /**
   * Decrement value
   */
  async decr(key: string): Promise<number> {
    const current = await this.get(key)
    const value = current ? parseInt(current, 10) - 1 : -1
    await this.set(key, value.toString())
    return value
  }

  /**
   * Get all keys matching pattern
   */
  async keys(pattern: string): Promise<string[]> {
    const regex = new RegExp('^' + pattern.replace(/\*/g, '.*') + '$')
    return Array.from(this.store.keys()).filter(key => regex.test(key))
  }

  /**
   * Flush all data
   */
  async flushall(): Promise<'OK'> {
    this.store.clear()
    this.sortedSets.clear()
    return 'OK'
  }

  /**
   * Flush database
   */
  async flushdb(): Promise<'OK'> {
    return this.flushall()
  }

  /**
   * Ping Redis
   */
  async ping(): Promise<'PONG'> {
    return 'PONG'
  }

  /**
   * Disconnect (no-op for mock)
   */
  async disconnect(): Promise<void> {
    // No-op
  }

  /**
   * Quit (no-op for mock)
   */
  async quit(): Promise<void> {
    // No-op
  }
}

/**
 * Create a mock Redis client
 */
export function createMockRedis(): MockRedisClient {
  return new MockRedisClient()
}

/**
 * Create a vitest mock for Redis
 */
export function createVitestRedisMock() {
  const mockRedis = createMockRedis()
  
  return {
    get: vi.fn((...args) => mockRedis.get(...args)),
    set: vi.fn((...args) => mockRedis.set(...args)),
    setex: vi.fn((...args) => mockRedis.setex(...args)),
    del: vi.fn((...args) => mockRedis.del(...args)),
    exists: vi.fn((...args) => mockRedis.exists(...args)),
    expire: vi.fn((...args) => mockRedis.expire(...args)),
    ttl: vi.fn((...args) => mockRedis.ttl(...args)),
    zadd: vi.fn((...args) => mockRedis.zadd(...args)),
    zrangebyscore: vi.fn((...args) => mockRedis.zrangebyscore(...args)),
    zremrangebyscore: vi.fn((...args) => mockRedis.zremrangebyscore(...args)),
    zcard: vi.fn((...args) => mockRedis.zcard(...args)),
    incr: vi.fn((...args) => mockRedis.incr(...args)),
    decr: vi.fn((...args) => mockRedis.decr(...args)),
    keys: vi.fn((...args) => mockRedis.keys(...args)),
    flushall: vi.fn((...args) => mockRedis.flushall(...args)),
    flushdb: vi.fn((...args) => mockRedis.flushdb(...args)),
    ping: vi.fn((...args) => mockRedis.ping(...args)),
    disconnect: vi.fn((...args) => mockRedis.disconnect(...args)),
    quit: vi.fn((...args) => mockRedis.quit(...args)),
  }
}
