/**
 * Mock User Generator
 * 
 * Utilities for generating mock user data for testing
 */

import type { User } from '@prisma/client'

export interface MockUserOptions {
  id?: string
  name?: string
  email?: string
  role?: 'STUDENT' | 'MENTOR' | 'ADMIN'
  image?: string
  bio?: string
  xp?: number
  level?: number
  streak?: number
}

/**
 * Generate a mock user with default or custom values
 */
export function createMockUser(options: MockUserOptions = {}): User {
  const id = options.id || generateMockId()
  const timestamp = new Date()
  
  return {
    id,
    name: options.name || 'Test User',
    email: options.email || `test-${id}@example.com`,
    emailVerified: timestamp,
    image: options.image || '/avatars/cool-ape.png',
    password: '$2a$10$mockhashedpassword', // Mock bcrypt hash
    role: options.role || 'STUDENT',
    bio: options.bio || 'Test user bio',
    xp: options.xp || 0,
    level: options.level || 1,
    streak: options.streak || 0,
    lastCheckIn: timestamp,
    createdAt: timestamp,
    updatedAt: timestamp,
  }
}

/**
 * Generate multiple mock users
 */
export function createMockUsers(count: number, options: MockUserOptions = {}): User[] {
  return Array.from({ length: count }, (_, index) => 
    createMockUser({
      ...options,
      name: options.name || `Test User ${index + 1}`,
      email: options.email || `test-user-${index + 1}@example.com`,
    })
  )
}

/**
 * Create a mock student user
 */
export function createMockStudent(options: Omit<MockUserOptions, 'role'> = {}): User {
  return createMockUser({ ...options, role: 'STUDENT' })
}

/**
 * Create a mock mentor user
 */
export function createMockMentor(options: Omit<MockUserOptions, 'role'> = {}): User {
  return createMockUser({ ...options, role: 'MENTOR' })
}

/**
 * Create a mock admin user
 */
export function createMockAdmin(options: Omit<MockUserOptions, 'role'> = {}): User {
  return createMockUser({ ...options, role: 'ADMIN' })
}

/**
 * Generate a mock MongoDB ObjectId
 */
export function generateMockId(): string {
  return Array.from({ length: 24 }, () => 
    Math.floor(Math.random() * 16).toString(16)
  ).join('')
}

/**
 * Create a mock user with high XP and level
 */
export function createMockHighLevelUser(options: MockUserOptions = {}): User {
  return createMockUser({
    ...options,
    xp: options.xp || 5000,
    level: options.level || 7,
    streak: options.streak || 30,
  })
}

/**
 * Create a mock user with specific XP for testing level calculations
 */
export function createMockUserWithXP(xp: number, options: MockUserOptions = {}): User {
  // Calculate level based on XP thresholds
  const thresholds = [0, 100, 250, 500, 1000, 2000, 4000, 7000, 10000]
  let level = 1
  for (let i = 0; i < thresholds.length; i++) {
    if (xp >= thresholds[i]) {
      level = i + 1
    }
  }
  
  return createMockUser({
    ...options,
    xp,
    level,
  })
}
