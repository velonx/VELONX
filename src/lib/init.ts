/**
 * Application Initialization Module
 * 
 * This module handles initialization of external services like Redis.
 * It's designed to be called once when the application starts.
 */

import { redisManager } from './redis'

let isInitialized = false
let initializationPromise: Promise<void> | null = null

/**
 * Initialize all external services
 * This function is idempotent - it can be called multiple times safely
 */
export async function initializeServices(): Promise<void> {
  // If already initialized, return immediately
  if (isInitialized) {
    return
  }

  // If initialization is in progress, wait for it
  if (initializationPromise) {
    return initializationPromise
  }

  // Start initialization
  initializationPromise = (async () => {
    try {
      // Initialize Redis
      try {
        await redisManager.initialize()
      } catch (error) {
        console.error('[Init] Redis initialization failed:', error)
        console.warn('[Init] Application will continue without Redis')
        // Don't throw - allow app to continue without Redis
      }

      isInitialized = true
    } catch (error) {
      console.error('[Init] Service initialization failed:', error)
      initializationPromise = null
      throw error
    }
  })()

  return initializationPromise
}

/**
 * Check if services are initialized
 */
export function areServicesInitialized(): boolean {
  return isInitialized
}

/**
 * Reset initialization state (useful for testing)
 */
export function resetInitialization(): void {
  isInitialized = false
  initializationPromise = null
}
