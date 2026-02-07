/**
 * E2E Navigation Helpers
 * 
 * Utilities for navigating the application in E2E tests
 */

import { Page } from '@playwright/test'

/**
 * Navigate to dashboard based on user role
 */
export async function navigateToDashboard(
  page: Page,
  role: 'STUDENT' | 'ADMIN' = 'STUDENT'
): Promise<void> {
  const dashboardPath = role === 'ADMIN' ? '/dashboard/admin' : '/dashboard/student'
  await page.goto(dashboardPath)
  await page.waitForLoadState('networkidle')
}

/**
 * Navigate to settings page
 */
export async function navigateToSettings(page: Page): Promise<void> {
  await page.goto('/settings')
  await page.waitForLoadState('networkidle')
}

/**
 * Navigate to mentors page
 */
export async function navigateToMentors(page: Page): Promise<void> {
  await page.goto('/mentors')
  await page.waitForLoadState('networkidle')
}

/**
 * Navigate to projects page
 */
export async function navigateToProjects(page: Page): Promise<void> {
  await page.goto('/projects')
  await page.waitForLoadState('networkidle')
}

/**
 * Navigate to resources page
 */
export async function navigateToResources(page: Page): Promise<void> {
  await page.goto('/resources')
  await page.waitForLoadState('networkidle')
}

/**
 * Navigate to events page
 */
export async function navigateToEvents(page: Page): Promise<void> {
  await page.goto('/events')
  await page.waitForLoadState('networkidle')
}

/**
 * Navigate to notifications page
 */
export async function navigateToNotifications(page: Page): Promise<void> {
  await page.goto('/notifications')
  await page.waitForLoadState('networkidle')
}

/**
 * Navigate to leaderboard page
 */
export async function navigateToLeaderboard(page: Page): Promise<void> {
  await page.goto('/leaderboard')
  await page.waitForLoadState('networkidle')
}

/**
 * Navigate to career page
 */
export async function navigateToCareer(page: Page): Promise<void> {
  await page.goto('/career')
  await page.waitForLoadState('networkidle')
}

/**
 * Wait for page to be fully loaded
 */
export async function waitForPageLoad(page: Page): Promise<void> {
  await page.waitForLoadState('networkidle')
  await page.waitForLoadState('domcontentloaded')
}
