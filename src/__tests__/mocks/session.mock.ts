/**
 * Mock Session Generator
 * 
 * Utilities for generating mock session data for testing
 */

import type { Session } from 'next-auth'
import { createMockUser, type MockUserOptions } from './user.mock'

export interface MockSessionOptions {
  user?: MockUserOptions
  expires?: Date
}

/**
 * Generate a mock NextAuth session
 */
export function createMockSession(options: MockSessionOptions = {}): Session {
  const user = createMockUser(options.user)
  const expires = options.expires || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days
  
  return {
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      image: user.image,
      role: user.role,
    },
    expires: expires.toISOString(),
  }
}

/**
 * Create a mock student session
 */
export function createMockStudentSession(options: Omit<MockSessionOptions, 'user'> & { user?: Omit<MockUserOptions, 'role'> } = {}): Session {
  return createMockSession({
    ...options,
    user: { ...options.user, role: 'STUDENT' },
  })
}

/**
 * Create a mock mentor session
 */
export function createMockMentorSession(options: Omit<MockSessionOptions, 'user'> & { user?: Omit<MockUserOptions, 'role'> } = {}): Session {
  return createMockSession({
    ...options,
    user: { ...options.user, role: 'MENTOR' },
  })
}

/**
 * Create a mock admin session
 */
export function createMockAdminSession(options: Omit<MockSessionOptions, 'user'> & { user?: Omit<MockUserOptions, 'role'> } = {}): Session {
  return createMockSession({
    ...options,
    user: { ...options.user, role: 'ADMIN' },
  })
}

/**
 * Create a mock unauthenticated session (null)
 */
export function createMockUnauthenticatedSession(): null {
  return null
}

/**
 * Create a mock expired session
 */
export function createMockExpiredSession(options: MockSessionOptions = {}): Session {
  return createMockSession({
    ...options,
    expires: new Date(Date.now() - 1000), // Expired 1 second ago
  })
}
