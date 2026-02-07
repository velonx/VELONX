/**
 * General Test Helpers
 * 
 * Utility functions for testing
 */

import { vi } from 'vitest'

/**
 * Wait for a specified amount of time
 */
export function wait(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

/**
 * Create a mock function with implementation
 */
export function createMockFn<T extends (...args: any[]) => any>(
  implementation?: T
): ReturnType<typeof vi.fn> {
  return implementation ? vi.fn(implementation) : vi.fn()
}

/**
 * Mock Date.now() to return a specific timestamp
 */
export function mockDateNow(timestamp: number): void {
  vi.spyOn(Date, 'now').mockReturnValue(timestamp)
}

/**
 * Restore Date.now() to original implementation
 */
export function restoreDateNow(): void {
  vi.restoreAllMocks()
}

/**
 * Mock console methods to suppress output during tests
 */
export function mockConsole(): {
  log: ReturnType<typeof vi.fn>
  error: ReturnType<typeof vi.fn>
  warn: ReturnType<typeof vi.fn>
  info: ReturnType<typeof vi.fn>
} {
  return {
    log: vi.spyOn(console, 'log').mockImplementation(() => {}),
    error: vi.spyOn(console, 'error').mockImplementation(() => {}),
    warn: vi.spyOn(console, 'warn').mockImplementation(() => {}),
    info: vi.spyOn(console, 'info').mockImplementation(() => {}),
  }
}

/**
 * Restore console methods
 */
export function restoreConsole(): void {
  vi.restoreAllMocks()
}

/**
 * Create a mock Request object
 */
export function createMockRequest(options: {
  method?: string
  url?: string
  headers?: Record<string, string>
  body?: any
} = {}): Request {
  const {
    method = 'GET',
    url = 'http://localhost:3000/api/test',
    headers = {},
    body,
  } = options

  return new Request(url, {
    method,
    headers: new Headers(headers),
    body: body ? JSON.stringify(body) : undefined,
  })
}

/**
 * Create a mock Response object
 */
export function createMockResponse(options: {
  status?: number
  statusText?: string
  headers?: Record<string, string>
  body?: any
} = {}): Response {
  const {
    status = 200,
    statusText = 'OK',
    headers = {},
    body,
  } = options

  return new Response(body ? JSON.stringify(body) : null, {
    status,
    statusText,
    headers: new Headers(headers),
  })
}

/**
 * Extract JSON from Response
 */
export async function getResponseJSON<T = any>(response: Response): Promise<T> {
  return response.json()
}

/**
 * Assert that a function throws an error
 */
export async function expectToThrow(
  fn: () => any | Promise<any>,
  errorMessage?: string | RegExp
): Promise<void> {
  let error: Error | undefined

  try {
    await fn()
  } catch (e) {
    error = e as Error
  }

  if (!error) {
    throw new Error('Expected function to throw an error')
  }

  if (errorMessage) {
    if (typeof errorMessage === 'string') {
      if (!error.message.includes(errorMessage)) {
        throw new Error(
          `Expected error message to include "${errorMessage}", but got "${error.message}"`
        )
      }
    } else {
      if (!errorMessage.test(error.message)) {
        throw new Error(
          `Expected error message to match ${errorMessage}, but got "${error.message}"`
        )
      }
    }
  }
}

/**
 * Generate a random string
 */
export function randomString(length: number = 10): string {
  const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  return Array.from({ length }, () => chars[Math.floor(Math.random() * chars.length)]).join('')
}

/**
 * Generate a random number in range
 */
export function randomNumber(min: number = 0, max: number = 100): number {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

/**
 * Generate a random email
 */
export function randomEmail(): string {
  return `${randomString(8)}@example.com`
}

/**
 * Generate a random MongoDB ObjectId
 */
export function randomObjectId(): string {
  return Array.from({ length: 24 }, () => 
    Math.floor(Math.random() * 16).toString(16)
  ).join('')
}
