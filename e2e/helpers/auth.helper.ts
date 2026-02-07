/**
 * E2E Authentication Helpers
 * 
 * Utilities for handling authentication in E2E tests
 */

import { Page } from '@playwright/test'

export interface TestUser {
  email: string
  password: string
  name: string
  role: 'STUDENT' | 'MENTOR' | 'ADMIN'
}

/**
 * Default test users for E2E testing
 */
export const TEST_USERS = {
  student: {
    email: 'student@test.com',
    password: 'TestPassword123!',
    name: 'Test Student',
    role: 'STUDENT' as const,
  },
  mentor: {
    email: 'mentor@test.com',
    password: 'TestPassword123!',
    name: 'Test Mentor',
    role: 'MENTOR' as const,
  },
  admin: {
    email: 'admin@test.com',
    password: 'TestPassword123!',
    name: 'Test Admin',
    role: 'ADMIN' as const,
  },
}

/**
 * Login helper for E2E tests
 */
export async function login(page: Page, user: TestUser): Promise<void> {
  await page.goto('/auth/login')
  
  // Fill in login form
  await page.fill('input[name="email"]', user.email)
  await page.fill('input[name="password"]', user.password)
  
  // Submit form
  await page.click('button[type="submit"]')
  
  // Wait for navigation to complete
  await page.waitForURL('**/dashboard/**', { timeout: 10000 })
}

/**
 * Logout helper for E2E tests
 */
export async function logout(page: Page): Promise<void> {
  // Click user menu
  await page.click('[data-testid="user-menu"]')
  
  // Click logout button
  await page.click('[data-testid="logout-button"]')
  
  // Wait for redirect to home or login
  await page.waitForURL(/\/(auth\/login)?$/, { timeout: 5000 })
}

/**
 * Check if user is authenticated
 */
export async function isAuthenticated(page: Page): Promise<boolean> {
  try {
    await page.waitForSelector('[data-testid="user-menu"]', { timeout: 2000 })
    return true
  } catch {
    return false
  }
}

/**
 * Setup authenticated session for tests
 */
export async function setupAuthenticatedSession(
  page: Page,
  role: 'STUDENT' | 'MENTOR' | 'ADMIN' = 'STUDENT'
): Promise<void> {
  const user = TEST_USERS[role.toLowerCase() as keyof typeof TEST_USERS]
  await login(page, user)
}
