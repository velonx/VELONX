/**
 * Brute Force Protection Service
 * Implements progressive delays and account lockout for authentication attempts
 * Uses Upstash Redis to track failed login attempts
 */

import { Redis } from '@upstash/redis'

// Initialize Upstash Redis client
const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
})

/**
 * Brute force protection configuration
 */
const BRUTE_FORCE_CONFIG = {
  // Maximum failed attempts before lockout
  maxAttempts: 5,
  
  // Base delay in milliseconds (starts at 1 second)
  baseDelay: 1000,
  
  // Maximum delay in milliseconds (caps at 5 minutes)
  maxDelay: 5 * 60 * 1000,
  
  // Time window for tracking attempts (15 minutes)
  windowMs: 15 * 60 * 1000,
  
  // Lockout duration after max attempts (30 minutes)
  lockoutDuration: 30 * 60 * 1000,
}

/**
 * Brute Force Protection Result
 */
export interface BruteForceCheckResult {
  allowed: boolean
  attemptsRemaining: number
  delayMs: number
  lockedUntil?: Date
  message?: string
}

/**
 * Brute Force Protection Service
 */
export class BruteForceProtection {
  /**
   * Get Redis key for tracking attempts
   */
  private static getAttemptsKey(identifier: string): string {
    return `auth:attempts:${identifier}`
  }

  /**
   * Get Redis key for lockout
   */
  private static getLockoutKey(identifier: string): string {
    return `auth:lockout:${identifier}`
  }

  /**
   * Calculate exponential backoff delay
   */
  private static calculateDelay(attempts: number): number {
    const delay = BRUTE_FORCE_CONFIG.baseDelay * Math.pow(2, attempts - 1)
    return Math.min(delay, BRUTE_FORCE_CONFIG.maxDelay)
  }

  /**
   * Check if authentication attempt is allowed
   */
  static async checkAttempt(identifier: string): Promise<BruteForceCheckResult> {
    try {
      // Check if account is locked out
      const lockoutKey = this.getLockoutKey(identifier)
      const lockoutUntil = await redis.get<string>(lockoutKey)
      
      if (lockoutUntil) {
        const lockedUntilDate = new Date(parseInt(lockoutUntil))
        
        if (lockedUntilDate > new Date()) {
          return {
            allowed: false,
            attemptsRemaining: 0,
            delayMs: 0,
            lockedUntil: lockedUntilDate,
            message: `Account is locked due to too many failed attempts. Try again after ${lockedUntilDate.toLocaleString()}.`,
          }
        } else {
          // Lockout expired, clean up
          await redis.del(lockoutKey)
          await redis.del(this.getAttemptsKey(identifier))
        }
      }
      
      // Get current attempt count
      const attemptsKey = this.getAttemptsKey(identifier)
      const attemptsStr = await redis.get<string>(attemptsKey)
      const attempts = attemptsStr ? parseInt(attemptsStr) : 0
      
      // Check if max attempts reached
      if (attempts >= BRUTE_FORCE_CONFIG.maxAttempts) {
        // Lock the account
        const lockedUntilDate = new Date(Date.now() + BRUTE_FORCE_CONFIG.lockoutDuration)
        await redis.set(
          lockoutKey,
          lockedUntilDate.getTime().toString(),
          { px: BRUTE_FORCE_CONFIG.lockoutDuration }
        )
        
        return {
          allowed: false,
          attemptsRemaining: 0,
          delayMs: 0,
          lockedUntil: lockedUntilDate,
          message: `Too many failed attempts. Account locked for ${BRUTE_FORCE_CONFIG.lockoutDuration / 60000} minutes.`,
        }
      }
      
      // Calculate delay for this attempt
      const delayMs = attempts > 0 ? this.calculateDelay(attempts) : 0
      
      return {
        allowed: true,
        attemptsRemaining: BRUTE_FORCE_CONFIG.maxAttempts - attempts,
        delayMs,
      }
    } catch (error) {
      console.error('[Brute Force Protection] Error checking attempt:', error)
      
      // Fail open: allow attempt if Redis is unavailable
      return {
        allowed: true,
        attemptsRemaining: BRUTE_FORCE_CONFIG.maxAttempts,
        delayMs: 0,
      }
    }
  }

  /**
   * Record a failed authentication attempt
   */
  static async recordFailedAttempt(identifier: string): Promise<void> {
    try {
      const attemptsKey = this.getAttemptsKey(identifier)
      
      // Increment attempt count
      const attempts = await redis.incr(attemptsKey)
      
      // Set expiry on first attempt (Upstash uses seconds for expire)
      if (attempts === 1) {
        await redis.expire(attemptsKey, Math.floor(BRUTE_FORCE_CONFIG.windowMs / 1000))
      }
      
      console.log(`[Brute Force Protection] Failed attempt recorded for ${identifier}. Total attempts: ${attempts}`)
    } catch (error) {
      console.error('[Brute Force Protection] Error recording failed attempt:', error)
    }
  }

  /**
   * Record a successful authentication (clears failed attempts)
   */
  static async recordSuccessfulAttempt(identifier: string): Promise<void> {
    try {
      const attemptsKey = this.getAttemptsKey(identifier)
      const lockoutKey = this.getLockoutKey(identifier)
      
      // Clear attempts and lockout
      await redis.del(attemptsKey)
      await redis.del(lockoutKey)
      
      console.log(`[Brute Force Protection] Successful attempt recorded for ${identifier}. Counters cleared.`)
    } catch (error) {
      console.error('[Brute Force Protection] Error recording successful attempt:', error)
    }
  }

  /**
   * Manually unlock an account (admin function)
   */
  static async unlockAccount(identifier: string): Promise<void> {
    try {
      const attemptsKey = this.getAttemptsKey(identifier)
      const lockoutKey = this.getLockoutKey(identifier)
      
      await redis.del(attemptsKey)
      await redis.del(lockoutKey)
      
      console.log(`[Brute Force Protection] Account unlocked: ${identifier}`)
    } catch (error) {
      console.error('[Brute Force Protection] Error unlocking account:', error)
      throw error
    }
  }

  /**
   * Get current status for an identifier
   */
  static async getStatus(identifier: string): Promise<{
    attempts: number
    isLocked: boolean
    lockedUntil?: Date
    attemptsRemaining: number
  }> {
    try {
      const attemptsKey = this.getAttemptsKey(identifier)
      const lockoutKey = this.getLockoutKey(identifier)
      
      const [attemptsStr, lockoutStr] = await Promise.all([
        redis.get<string>(attemptsKey),
        redis.get<string>(lockoutKey),
      ])
      
      const attempts = attemptsStr ? parseInt(attemptsStr) : 0
      const lockedUntil = lockoutStr ? new Date(parseInt(lockoutStr)) : undefined
      const isLocked = lockedUntil ? lockedUntil > new Date() : false
      
      return {
        attempts,
        isLocked,
        lockedUntil: isLocked ? lockedUntil : undefined,
        attemptsRemaining: Math.max(0, BRUTE_FORCE_CONFIG.maxAttempts - attempts),
      }
    } catch (error) {
      console.error('[Brute Force Protection] Error getting status:', error)
      
      return {
        attempts: 0,
        isLocked: false,
        attemptsRemaining: BRUTE_FORCE_CONFIG.maxAttempts,
      }
    }
  }

  /**
   * Apply progressive delay (sleep)
   */
  static async applyDelay(delayMs: number): Promise<void> {
    if (delayMs > 0) {
      await new Promise(resolve => setTimeout(resolve, delayMs))
    }
  }
}

/**
 * Helper function to create identifier from email and IP
 */
export function createBruteForceIdentifier(email: string, ipAddress: string): string {
  // Use both email and IP to prevent distributed attacks
  return `${email.toLowerCase()}:${ipAddress}`
}

/**
 * Helper function to create identifier from IP only
 */
export function createIPBasedIdentifier(ipAddress: string): string {
  return `ip:${ipAddress}`
}
