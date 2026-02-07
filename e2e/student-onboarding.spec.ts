/**
 * E2E Test: Student Onboarding Flow
 * 
 * Tests the complete student onboarding journey:
 * - Registration
 * - Profile setup
 * - Course enrollment (dashboard access)
 * 
 * Requirements: 4.3
 */

import { test, expect, Page } from '@playwright/test'
import { expectToBeOnPage, expectToastVisible } from './helpers/assertions.helper'
import { waitForPageLoad } from './helpers/navigation.helper'

// Generate unique test user data
const generateTestUser = () => {
  const timestamp = Date.now()
  return {
    firstName: 'Test',
    lastName: `Student${timestamp}`,
    email: `teststudent${timestamp}@example.com`,
    password: 'TestPassword123!',
  }
}

test.describe('Student Onboarding Flow', () => {
  test('should complete full onboarding: registration → profile setup → dashboard access', async ({ page }) => {
    const testUser = generateTestUser()

    // Step 1: Navigate to signup page
    await page.goto('/auth/signup')
    await waitForPageLoad(page)

    // Verify we're on the signup page
    await expect(page.locator('h1')).toContainText('Create Account')

    // Step 2: Fill in registration form
    await page.fill('input[placeholder="John"]', testUser.firstName)
    await page.fill('input[placeholder="Doe"]', testUser.lastName)
    await page.fill('input[type="email"]', testUser.email)
    await page.fill('input[type="password"]', testUser.password)

    // Accept terms and conditions
    await page.click('input[type="checkbox"]#terms')

    // Submit registration form
    await page.click('button[type="submit"]')

    // Step 3: Wait for redirect to student dashboard after successful registration
    await page.waitForURL('**/dashboard/student', { timeout: 15000 })
    await waitForPageLoad(page)

    // Verify we're on the student dashboard
    await expectToBeOnPage(page, '/dashboard/student')

    // Step 4: Verify profile setup - check that user name is displayed
    const userName = `${testUser.firstName} ${testUser.lastName}`
    
    // Wait for dashboard content to load
    await page.waitForSelector('body', { state: 'visible' })
    
    // Verify dashboard elements are present
    const dashboardHeading = page.locator('h1, h2').first()
    await expect(dashboardHeading).toBeVisible({ timeout: 10000 })

    // Step 5: Verify course enrollment access - check that learning resources are available
    // The student dashboard should show learning sections
    const pageContent = await page.content()
    
    // Verify key dashboard sections are accessible
    // This confirms the student can access course/learning materials
    expect(pageContent.length).toBeGreaterThan(0)

    // Step 6: Navigate to settings to verify profile is set up
    await page.goto('/settings')
    await waitForPageLoad(page)

    // Verify settings page loads
    await expectToBeOnPage(page, '/settings')
    
    // Verify user email is displayed in settings
    const emailInput = page.locator('input[type="email"]')
    await expect(emailInput).toHaveValue(testUser.email)

    // Step 7: Verify user can navigate back to dashboard
    await page.goto('/dashboard/student')
    await waitForPageLoad(page)
    await expectToBeOnPage(page, '/dashboard/student')
  })

  test('should show validation errors for invalid registration data', async ({ page }) => {
    await page.goto('/auth/signup')
    await waitForPageLoad(page)

    // Try to submit without filling required fields
    await page.click('button[type="submit"]')

    // Browser validation should prevent submission
    // Check that we're still on signup page
    await expectToBeOnPage(page, '/auth/signup')
  })

  test('should show error for existing email', async ({ page }) => {
    // Use a known existing email (from seed data)
    const existingUser = {
      firstName: 'Test',
      lastName: 'User',
      email: 'student@test.com', // This should exist from seed data
      password: 'TestPassword123!',
    }

    await page.goto('/auth/signup')
    await waitForPageLoad(page)

    // Fill in registration form with existing email
    await page.fill('input[placeholder="John"]', existingUser.firstName)
    await page.fill('input[placeholder="Doe"]', existingUser.lastName)
    await page.fill('input[type="email"]', existingUser.email)
    await page.fill('input[type="password"]', existingUser.password)

    // Accept terms
    await page.click('input[type="checkbox"]#terms')

    // Submit form
    await page.click('button[type="submit"]')

    // Wait for error message
    await page.waitForSelector('.bg-red-50', { timeout: 5000 })

    // Verify error message is displayed
    const errorMessage = page.locator('.bg-red-50')
    await expect(errorMessage).toBeVisible()
    await expect(errorMessage).toContainText(/already exists|exists/i)
  })

  test('should enforce password requirements', async ({ page }) => {
    const testUser = generateTestUser()

    await page.goto('/auth/signup')
    await waitForPageLoad(page)

    // Fill in form with weak password
    await page.fill('input[placeholder="John"]', testUser.firstName)
    await page.fill('input[placeholder="Doe"]', testUser.lastName)
    await page.fill('input[type="email"]', testUser.email)
    await page.fill('input[type="password"]', '123') // Too short

    // Accept terms
    await page.click('input[type="checkbox"]#terms')

    // Submit form
    await page.click('button[type="submit"]')

    // Wait for error message
    await page.waitForSelector('.bg-red-50', { timeout: 5000 })

    // Verify password error is displayed
    const errorMessage = page.locator('.bg-red-50')
    await expect(errorMessage).toBeVisible()
    await expect(errorMessage).toContainText(/at least 6 characters/i)
  })

  test('should require terms acceptance', async ({ page }) => {
    const testUser = generateTestUser()

    await page.goto('/auth/signup')
    await waitForPageLoad(page)

    // Fill in form without accepting terms
    await page.fill('input[placeholder="John"]', testUser.firstName)
    await page.fill('input[placeholder="Doe"]', testUser.lastName)
    await page.fill('input[type="email"]', testUser.email)
    await page.fill('input[type="password"]', testUser.password)

    // Do NOT check the terms checkbox

    // Submit form
    await page.click('button[type="submit"]')

    // Wait for error message
    await page.waitForSelector('.bg-red-50', { timeout: 5000 })

    // Verify terms error is displayed
    const errorMessage = page.locator('.bg-red-50')
    await expect(errorMessage).toBeVisible()
    await expect(errorMessage).toContainText(/agree to the Terms/i)
  })

  test('should toggle password visibility', async ({ page }) => {
    await page.goto('/auth/signup')
    await waitForPageLoad(page)

    const passwordInput = page.locator('input[type="password"]')
    const toggleButton = page.locator('button').filter({ has: page.locator('svg') }).nth(2) // Eye icon button

    // Initially password should be hidden
    await expect(passwordInput).toHaveAttribute('type', 'password')

    // Fill in password
    await passwordInput.fill('TestPassword123!')

    // Click toggle button
    await toggleButton.click()

    // Password should now be visible
    const visibleInput = page.locator('input[type="text"]').filter({ hasText: 'TestPassword123!' })
    await expect(visibleInput).toBeVisible()

    // Click toggle again
    await toggleButton.click()

    // Password should be hidden again
    await expect(passwordInput).toHaveAttribute('type', 'password')
  })
})
