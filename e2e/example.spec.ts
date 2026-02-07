/**
 * Example E2E Test
 * 
 * Demonstrates how to write E2E tests with Playwright
 */

import { test, expect } from '@playwright/test'
import { login, logout, TEST_USERS } from './helpers/auth.helper'
import { navigateToDashboard, waitForPageLoad } from './helpers/navigation.helper'
import { expectToBeOnPage, expectToastVisible } from './helpers/assertions.helper'

test.describe('Example E2E Tests', () => {
  test.describe('Home Page', () => {
    test('should load home page successfully', async ({ page }) => {
      await page.goto('/')
      await waitForPageLoad(page)
      
      // Check that page title is visible
      await expect(page.locator('h1')).toBeVisible()
    })

    test('should have navigation links', async ({ page }) => {
      await page.goto('/')
      
      // Check for common navigation links
      const nav = page.locator('nav')
      await expect(nav).toBeVisible()
    })
  })

  test.describe('Authentication Flow', () => {
    test('should login as student', async ({ page }) => {
      await login(page, TEST_USERS.student)
      
      // Should be redirected to dashboard
      await expectToBeOnPage(page, '/dashboard/student')
    })

    test('should logout successfully', async ({ page }) => {
      // Login first
      await login(page, TEST_USERS.student)
      
      // Then logout
      await logout(page)
      
      // Should be redirected to home or login
      await expectToBeOnPage(page, '/')
    })
  })

  test.describe('Dashboard Navigation', () => {
    test.beforeEach(async ({ page }) => {
      // Login before each test
      await login(page, TEST_USERS.student)
    })

    test('should navigate to student dashboard', async ({ page }) => {
      await navigateToDashboard(page, 'STUDENT')
      await expectToBeOnPage(page, '/dashboard/student')
    })

    test('should display user information', async ({ page }) => {
      await navigateToDashboard(page, 'STUDENT')
      
      // Check that user menu is visible
      const userMenu = page.locator('[data-testid="user-menu"]')
      await expect(userMenu).toBeVisible()
    })
  })

  test.describe('Responsive Design', () => {
    test('should work on mobile viewport', async ({ page }) => {
      // Set mobile viewport
      await page.setViewportSize({ width: 375, height: 667 })
      
      await page.goto('/')
      await waitForPageLoad(page)
      
      // Page should load without horizontal scroll
      const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth)
      const clientWidth = await page.evaluate(() => document.documentElement.clientWidth)
      
      expect(scrollWidth).toBeLessThanOrEqual(clientWidth + 1) // Allow 1px tolerance
    })

    test('should work on tablet viewport', async ({ page }) => {
      // Set tablet viewport
      await page.setViewportSize({ width: 768, height: 1024 })
      
      await page.goto('/')
      await waitForPageLoad(page)
      
      // Check that page renders correctly
      await expect(page.locator('body')).toBeVisible()
    })
  })

  test.describe('Accessibility', () => {
    test('should have proper page title', async ({ page }) => {
      await page.goto('/')
      
      const title = await page.title()
      expect(title).toBeTruthy()
      expect(title.length).toBeGreaterThan(0)
    })

    test('should support keyboard navigation', async ({ page }) => {
      await page.goto('/')
      
      // Tab through interactive elements
      await page.keyboard.press('Tab')
      
      // Check that focus is visible
      const focusedElement = await page.evaluate(() => document.activeElement?.tagName)
      expect(focusedElement).toBeTruthy()
    })
  })
})
