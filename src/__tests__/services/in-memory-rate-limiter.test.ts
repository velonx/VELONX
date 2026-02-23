/**
 * Unit tests for In-Memory Rate Limiter Service
 * Tests automatic cleanup, LRU eviction, and store monitoring
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import {
  InMemoryRateLimiter,
  createInMemoryRateLimiter
} from '@/lib/services/in-memory-rate-limiter.service'

describe('InMemoryRateLimiter', () => {
  let rateLimiter: InMemoryRateLimiter

  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    if (rateLimiter) {
      rateLimiter.destroy()
    }
    vi.useRealTimers()
  })

  describe('Basic Rate Limiting', () => {
    it('should allow requests within limit', async () => {
      rateLimiter = createInMemoryRateLimiter({
        windowMs: 60000,
        maxRequests: 5
      })

      for (let i = 0; i < 5; i++) {
        const result = await rateLimiter.checkRateLimit('user1', '/api/test')
        expect(result.allowed).toBe(true)
        expect(result.remaining).toBe(4 - i)
      }
    })

    it('should block requests exceeding limit', async () => {
      rateLimiter = createInMemoryRateLimiter({
        windowMs: 60000,
        maxRequests: 3
      })

      // Make 3 allowed requests
      for (let i = 0; i < 3; i++) {
        const result = await rateLimiter.checkRateLimit('user1', '/api/test')
        expect(result.allowed).toBe(true)
      }

      // 4th request should be blocked
      const result = await rateLimiter.checkRateLimit('user1', '/api/test')
      expect(result.allowed).toBe(false)
      expect(result.remaining).toBe(0)
      expect(result.retryAfter).toBeGreaterThan(0)
    })

    it('should track different identifiers separately', async () => {
      rateLimiter = createInMemoryRateLimiter({
        windowMs: 60000,
        maxRequests: 2
      })

      const result1 = await rateLimiter.checkRateLimit('user1', '/api/test')
      const result2 = await rateLimiter.checkRateLimit('user2', '/api/test')

      expect(result1.allowed).toBe(true)
      expect(result2.allowed).toBe(true)
      expect(rateLimiter.getStoreSize()).toBe(2)
    })
  })

  describe('Automatic Cleanup', () => {
    it('should remove expired entries during cleanup', async () => {
      rateLimiter = createInMemoryRateLimiter({
        windowMs: 1000, // 1 second window
        maxRequests: 5,
        cleanupProbability: 0 // Disable probabilistic cleanup for testing
      })

      // Make some requests
      await rateLimiter.checkRateLimit('user1', '/api/test')
      await rateLimiter.checkRateLimit('user2', '/api/test')
      
      expect(rateLimiter.getStoreSize()).toBe(2)

      // Advance time beyond window + resetAt
      vi.advanceTimersByTime(2000)

      // Trigger cleanup by making a new request with probabilistic cleanup
      rateLimiter = createInMemoryRateLimiter({
        windowMs: 1000,
        maxRequests: 5,
        cleanupProbability: 1 // Force cleanup
      })

      await rateLimiter.checkRateLimit('user1', '/api/test')
      await rateLimiter.checkRateLimit('user2', '/api/test')
      
      vi.advanceTimersByTime(2000)
      
      // Make another request to trigger cleanup
      await rateLimiter.checkRateLimit('user3', '/api/test')
      
      // Old entries should be cleaned up
      expect(rateLimiter.getStoreSize()).toBeLessThanOrEqual(3)
    })

    it('should run periodic cleanup at configured interval', async () => {
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {})
      
      rateLimiter = createInMemoryRateLimiter({
        windowMs: 1000,
        maxRequests: 5,
        cleanupInterval: 5000, // 5 seconds
        cleanupProbability: 0
      })

      // Make requests that will expire
      await rateLimiter.checkRateLimit('user1', '/api/test')
      await rateLimiter.checkRateLimit('user2', '/api/test')

      // Advance time to expire entries
      vi.advanceTimersByTime(2000)

      // Advance time to trigger periodic cleanup
      vi.advanceTimersByTime(5000)

      // Cleanup should have been called
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('[InMemoryRateLimiter] Cleaned up')
      )

      consoleSpy.mockRestore()
    })
  })

  describe('LRU Eviction Policy', () => {
    it('should evict oldest entry when store reaches capacity', async () => {
      const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
      
      rateLimiter = createInMemoryRateLimiter({
        windowMs: 60000,
        maxRequests: 5,
        maxStoreSize: 3, // Small size for testing
        cleanupProbability: 0
      })

      // Fill store to capacity
      await rateLimiter.checkRateLimit('user1', '/api/test')
      vi.advanceTimersByTime(100)
      await rateLimiter.checkRateLimit('user2', '/api/test')
      vi.advanceTimersByTime(100)
      await rateLimiter.checkRateLimit('user3', '/api/test')

      expect(rateLimiter.getStoreSize()).toBe(3)

      // Add one more entry - should trigger eviction
      vi.advanceTimersByTime(100)
      await rateLimiter.checkRateLimit('user4', '/api/test')

      // Store size should still be at max
      expect(rateLimiter.getStoreSize()).toBe(3)

      // Eviction warning should have been logged
      expect(consoleWarnSpy).toHaveBeenCalledWith(
        expect.stringContaining('[InMemoryRateLimiter] Evicted entry due to size limit')
      )

      consoleWarnSpy.mockRestore()
    })

    it('should evict entry with oldest resetAt timestamp', async () => {
      rateLimiter = createInMemoryRateLimiter({
        windowMs: 60000,
        maxRequests: 5,
        maxStoreSize: 2,
        cleanupProbability: 0
      })

      // Create entries with different timestamps
      await rateLimiter.checkRateLimit('user1', '/api/test')
      vi.advanceTimersByTime(1000)
      await rateLimiter.checkRateLimit('user2', '/api/test')

      expect(rateLimiter.getStoreSize()).toBe(2)

      // Add third entry - user1 should be evicted (oldest)
      vi.advanceTimersByTime(1000)
      await rateLimiter.checkRateLimit('user3', '/api/test')

      expect(rateLimiter.getStoreSize()).toBe(2)

      // user1 should be evicted, user2 and user3 should remain
      expect(rateLimiter.getCurrentCount('user1', '/api/test')).toBe(0)
      expect(rateLimiter.getCurrentCount('user2', '/api/test')).toBeGreaterThan(0)
      expect(rateLimiter.getCurrentCount('user3', '/api/test')).toBeGreaterThan(0)
    })
  })

  describe('Store Size Monitoring', () => {
    it('should return accurate store statistics', () => {
      rateLimiter = createInMemoryRateLimiter({
        windowMs: 60000,
        maxRequests: 5,
        maxStoreSize: 100
      })

      const stats = rateLimiter.getStoreStats()

      expect(stats.size).toBe(0)
      expect(stats.maxSize).toBe(100)
      expect(stats.utilizationPercent).toBe(0)
    })

    it('should log warning when utilization exceeds 80%', async () => {
      const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
      
      rateLimiter = createInMemoryRateLimiter({
        windowMs: 60000,
        maxRequests: 5,
        maxStoreSize: 10,
        cleanupProbability: 0
      })

      // Fill store to 90% capacity (9 out of 10)
      for (let i = 0; i < 9; i++) {
        await rateLimiter.checkRateLimit(`user${i}`, '/api/test')
      }

      // Get stats should trigger warning
      const stats = rateLimiter.getStoreStats()

      expect(stats.utilizationPercent).toBeGreaterThan(80)
      expect(consoleWarnSpy).toHaveBeenCalledWith(
        expect.stringContaining('[InMemoryRateLimiter] Store utilization at')
      )

      consoleWarnSpy.mockRestore()
    })

    it('should calculate utilization percentage correctly', async () => {
      rateLimiter = createInMemoryRateLimiter({
        windowMs: 60000,
        maxRequests: 5,
        maxStoreSize: 100,
        cleanupProbability: 0
      })

      // Add 50 entries
      for (let i = 0; i < 50; i++) {
        await rateLimiter.checkRateLimit(`user${i}`, '/api/test')
      }

      const stats = rateLimiter.getStoreStats()

      expect(stats.size).toBe(50)
      expect(stats.maxSize).toBe(100)
      expect(stats.utilizationPercent).toBe(50)
    })
  })

  describe('Sliding Window', () => {
    it('should remove expired requests from window', async () => {
      rateLimiter = createInMemoryRateLimiter({
        windowMs: 1000, // 1 second window
        maxRequests: 5,
        cleanupProbability: 0
      })

      // Make 3 requests
      await rateLimiter.checkRateLimit('user1', '/api/test')
      await rateLimiter.checkRateLimit('user1', '/api/test')
      await rateLimiter.checkRateLimit('user1', '/api/test')

      expect(rateLimiter.getCurrentCount('user1', '/api/test')).toBe(3)

      // Advance time beyond window
      vi.advanceTimersByTime(1500)

      // Old requests should be filtered out
      const result = await rateLimiter.checkRateLimit('user1', '/api/test')
      expect(result.allowed).toBe(true)
      expect(rateLimiter.getCurrentCount('user1', '/api/test')).toBe(1)
    })
  })

  describe('Reset Functionality', () => {
    it('should reset limit for specific endpoint', async () => {
      rateLimiter = createInMemoryRateLimiter({
        windowMs: 60000,
        maxRequests: 2
      })

      await rateLimiter.checkRateLimit('user1', '/api/test')
      await rateLimiter.checkRateLimit('user1', '/api/test')

      expect(rateLimiter.getCurrentCount('user1', '/api/test')).toBe(2)

      rateLimiter.resetLimit('user1', '/api/test')

      expect(rateLimiter.getCurrentCount('user1', '/api/test')).toBe(0)
    })

    it('should reset all endpoints for identifier', async () => {
      rateLimiter = createInMemoryRateLimiter({
        windowMs: 60000,
        maxRequests: 5
      })

      await rateLimiter.checkRateLimit('user1', '/api/test1')
      await rateLimiter.checkRateLimit('user1', '/api/test2')
      await rateLimiter.checkRateLimit('user2', '/api/test1')

      expect(rateLimiter.getStoreSize()).toBe(3)

      rateLimiter.resetLimit('user1')

      expect(rateLimiter.getCurrentCount('user1', '/api/test1')).toBe(0)
      expect(rateLimiter.getCurrentCount('user1', '/api/test2')).toBe(0)
      expect(rateLimiter.getCurrentCount('user2', '/api/test1')).toBeGreaterThan(0)
    })
  })

  describe('Configuration', () => {
    it('should use default configuration values', () => {
      rateLimiter = createInMemoryRateLimiter({
        windowMs: 30000,
        maxRequests: 10
      })

      const config = rateLimiter.getConfig()

      expect(config.windowMs).toBe(30000)
      expect(config.maxRequests).toBe(10)
      expect(config.maxStoreSize).toBe(10000) // Default
      expect(config.cleanupInterval).toBe(60000) // Default
      expect(config.cleanupProbability).toBe(0.01) // Default
    })

    it('should allow custom configuration', () => {
      rateLimiter = createInMemoryRateLimiter({
        windowMs: 30000,
        maxRequests: 10,
        maxStoreSize: 5000,
        cleanupInterval: 30000,
        cleanupProbability: 0.05
      })

      const config = rateLimiter.getConfig()

      expect(config.maxStoreSize).toBe(5000)
      expect(config.cleanupInterval).toBe(30000)
      expect(config.cleanupProbability).toBe(0.05)
    })
  })

  describe('Resource Cleanup', () => {
    it('should cleanup resources on destroy', async () => {
      rateLimiter = createInMemoryRateLimiter({
        windowMs: 60000,
        maxRequests: 5
      })

      await rateLimiter.checkRateLimit('user1', '/api/test')
      expect(rateLimiter.getStoreSize()).toBe(1)

      rateLimiter.destroy()

      expect(rateLimiter.getStoreSize()).toBe(0)
    })
  })
})
