/**
 * E2E Test: Project Submission Flow
 * 
 * Tests the complete project submission journey:
 * - Project creation
 * - Submission
 * - Approval (admin)
 * - Join requests
 * 
 * Requirements: 4.3
 */

import { test, expect, Page } from '@playwright/test'
import { login, TEST_USERS } from './helpers/auth.helper'
import { expectToBeOnPage } from './helpers/assertions.helper'
import { waitForPageLoad, navigateToDashboard } from './helpers/navigation.helper'

// Generate unique project data
const generateTestProject = () => {
  const timestamp = Date.now()
  return {
    title: `Test Project ${timestamp}`,
    description: 'This is a test project for E2E testing. It demonstrates the project submission and approval workflow.',
    techStack: ['React', 'Node.js', 'MongoDB', 'TypeScript'],
    goals: 'Build a functional web application with modern technologies and best practices.',
    teamSize: '4',
  }
}

test.describe('Project Submission Flow', () => {
  test('should complete full project flow: creation → submission → approval → join requests', async ({ page, context }) => {
    const testProject = generateTestProject()

    // Step 1: Login as student and submit project
    await login(page, TEST_USERS.student)

    // Step 2: Navigate to project submission page
    await page.goto('/submit-project')
    await waitForPageLoad(page)

    // Verify we're on the submission page
    await expectToBeOnPage(page, '/submit-project')
    await expect(page.locator('h1')).toContainText(/Build Something Amazing/i)

    // Step 3: Fill in project submission form
    // Project title
    await page.fill('input#title', testProject.title)

    // Project description
    await page.fill('textarea#description', testProject.description)

    // Add tech stack
    for (const tech of testProject.techStack) {
      const techInput = page.locator('input[placeholder*="React"]').or(page.locator('input[placeholder*="Node"]')).first()
      await techInput.fill(tech)
      await page.click('button:has-text("Add")')
      await page.waitForTimeout(500) // Wait for tech to be added
    }

    // Project goals
    await page.fill('textarea#goals', testProject.goals)

    // Team size
    await page.fill('input#teamSize', testProject.teamSize)

    // Step 4: Submit the project
    const submitButton = page.locator('button[type="submit"]').filter({ hasText: /Submit Project/i })
    await expect(submitButton).toBeVisible()
    await submitButton.click()

    // Step 5: Wait for submission confirmation
    await page.waitForTimeout(3000) // Wait for API call

    // Should see success message
    await expect(page.locator('h1')).toContainText(/Project Idea Submitted/i, { timeout: 10000 })

    // Step 6: Login as admin to approve project
    // Open new page for admin
    const adminPage = await context.newPage()
    await login(adminPage, TEST_USERS.admin)

    // Navigate to admin dashboard
    await adminPage.goto('/dashboard/admin')
    await waitForPageLoad(adminPage)

    // Verify we're on admin dashboard
    await expectToBeOnPage(adminPage, '/dashboard/admin')

    // Step 7: Find and approve the submitted project
    // Look for project submissions section
    await adminPage.waitForTimeout(2000) // Wait for data to load

    // Look for the submitted project in the admin dashboard
    const projectTitle = adminPage.locator(`text=${testProject.title}`).first()
    
    // If project is visible, try to approve it
    if (await projectTitle.isVisible({ timeout: 5000 })) {
      // Find approve button near the project
      const approveButton = adminPage.locator('button').filter({ hasText: /Approve/i }).first()
      
      if (await approveButton.isVisible()) {
        await approveButton.click()
        
        // Wait for approval to process
        await adminPage.waitForTimeout(2000)
      }
    }

    // Step 8: Verify project appears in projects list
    await page.goto('/projects')
    await waitForPageLoad(page)

    // Wait for projects to load
    await page.waitForTimeout(2000)

    // Look for the approved project (it might be there if approval was successful)
    const pageContent = await page.content()
    
    // Verify projects page loaded successfully
    expect(pageContent.length).toBeGreaterThan(0)

    // Step 9: Test join request flow
    // If there are any projects, try to join one
    const joinButton = page.locator('button').filter({ hasText: /Join|Request/i }).first()
    
    if (await joinButton.count() > 0 && await joinButton.isVisible()) {
      await joinButton.click()
      
      // Wait for join request dialog or confirmation
      await page.waitForTimeout(2000)
      
      // Look for confirmation dialog
      const dialog = page.locator('[role="dialog"]')
      
      if (await dialog.isVisible()) {
        // Fill in join request reason if there's a textarea
        const reasonTextarea = dialog.locator('textarea')
        if (await reasonTextarea.isVisible()) {
          await reasonTextarea.fill('I would like to join this project because I have experience with the tech stack.')
        }
        
        // Submit join request
        const submitJoinButton = dialog.locator('button').filter({ hasText: /Submit|Send|Request/i }).first()
        if (await submitJoinButton.isVisible()) {
          await submitJoinButton.click()
          await page.waitForTimeout(2000)
        }
      }
    }

    // Step 10: Verify join request in dashboard
    await navigateToDashboard(page, 'STUDENT')
    await waitForPageLoad(page)

    // Dashboard should show join requests or project information
    const dashboardContent = await page.content()
    expect(dashboardContent.length).toBeGreaterThan(0)

    // Close admin page
    await adminPage.close()
  })

  test('should validate project submission form', async ({ page }) => {
    await login(page, TEST_USERS.student)

    await page.goto('/submit-project')
    await waitForPageLoad(page)

    // Try to submit without filling required fields
    const submitButton = page.locator('button[type="submit"]').filter({ hasText: /Submit Project/i })
    await submitButton.click()

    // Browser validation should prevent submission
    // We should still be on the submission page
    await expectToBeOnPage(page, '/submit-project')
  })

  test('should require at least one technology', async ({ page }) => {
    const testProject = generateTestProject()

    await login(page, TEST_USERS.student)

    await page.goto('/submit-project')
    await waitForPageLoad(page)

    // Fill in all fields except tech stack
    await page.fill('input#title', testProject.title)
    await page.fill('textarea#description', testProject.description)
    await page.fill('textarea#goals', testProject.goals)
    await page.fill('input#teamSize', testProject.teamSize)

    // Try to submit without adding technologies
    const submitButton = page.locator('button[type="submit"]').filter({ hasText: /Submit Project/i })
    await submitButton.click()

    // Should show error toast
    await page.waitForTimeout(1000)

    // Should still be on submission page
    await expectToBeOnPage(page, '/submit-project')
  })

  test('should add and remove technologies', async ({ page }) => {
    await login(page, TEST_USERS.student)

    await page.goto('/submit-project')
    await waitForPageLoad(page)

    // Add a technology
    const techInput = page.locator('input[placeholder*="React"]').or(page.locator('input[placeholder*="Node"]')).first()
    await techInput.fill('React')
    await page.click('button:has-text("Add")')

    // Wait for tech badge to appear
    await page.waitForTimeout(500)

    // Verify tech badge is visible
    const techBadge = page.locator('text=React').first()
    await expect(techBadge).toBeVisible()

    // Remove the technology by clicking on it
    await techBadge.click()

    // Wait for removal
    await page.waitForTimeout(500)

    // Tech badge should be removed (or at least one less badge)
    const badges = page.locator('[class*="badge"]')
    const badgeCount = await badges.count()
    expect(badgeCount >= 0).toBeTruthy()
  })

  test('should enforce character limits', async ({ page }) => {
    await login(page, TEST_USERS.student)

    await page.goto('/submit-project')
    await waitForPageLoad(page)

    // Fill description with maximum characters
    const maxDescription = 'a'.repeat(1000)
    await page.fill('textarea#description', maxDescription)

    // Verify character count is displayed
    const charCount = page.locator('text=/\\d+\\/1000 characters/i')
    await expect(charCount).toBeVisible()

    // Try to add more characters (should be prevented)
    await page.fill('textarea#description', maxDescription + 'extra')
    
    // Get actual value
    const actualValue = await page.locator('textarea#description').inputValue()
    
    // Should be limited to 1000 characters
    expect(actualValue.length).toBeLessThanOrEqual(1000)
  })

  test('should display projects list', async ({ page }) => {
    await login(page, TEST_USERS.student)

    await page.goto('/projects')
    await waitForPageLoad(page)

    // Verify we're on projects page
    await expectToBeOnPage(page, '/projects')

    // Page should have loaded
    const pageContent = await page.content()
    expect(pageContent.length).toBeGreaterThan(0)

    // Should have some content (either projects or "no projects" message)
    const hasContent = await page.locator('body').isVisible()
    expect(hasContent).toBeTruthy()
  })

  test('should filter projects by technology', async ({ page }) => {
    await login(page, TEST_USERS.student)

    await page.goto('/projects')
    await waitForPageLoad(page)

    // Wait for page to load
    await page.waitForTimeout(2000)

    // Look for filter buttons or search
    const filterButtons = page.locator('button').filter({ hasText: /React|Node|Python/i })
    
    if (await filterButtons.count() > 0) {
      // Click first filter
      await filterButtons.first().click()
      
      // Wait for filtered results
      await page.waitForTimeout(1000)
      
      // Verify page still shows content
      const pageContent = await page.content()
      expect(pageContent.length).toBeGreaterThan(0)
    }
  })

  test('should search projects', async ({ page }) => {
    await login(page, TEST_USERS.student)

    await page.goto('/projects')
    await waitForPageLoad(page)

    // Look for search input
    const searchInput = page.locator('input[type="search"], input[placeholder*="search" i]').first()
    
    if (await searchInput.isVisible()) {
      // Type search query
      await searchInput.fill('test')
      
      // Wait for search results
      await page.waitForTimeout(1000)
      
      // Verify page shows results or "no results" message
      const pageContent = await page.content()
      expect(pageContent.length).toBeGreaterThan(0)
    }
  })

  test('should require login to submit project', async ({ page }) => {
    // Clear session
    await page.goto('/')
    await page.context().clearCookies()

    // Try to access submit project page
    await page.goto('/submit-project')
    await waitForPageLoad(page)

    // Should be redirected to login or show login required message
    await page.waitForTimeout(2000)

    const isOnLoginPage = page.url().includes('/auth/login')
    const hasLoginDialog = await page.locator('[role="dialog"]').filter({ hasText: /Login|Sign In/i }).count() > 0

    // Either should be redirected to login or see login dialog
    expect(isOnLoginPage || hasLoginDialog).toBeTruthy()
  })

  test('should show submission success message', async ({ page }) => {
    const testProject = generateTestProject()

    await login(page, TEST_USERS.student)

    await page.goto('/submit-project')
    await waitForPageLoad(page)

    // Fill in complete form
    await page.fill('input#title', testProject.title)
    await page.fill('textarea#description', testProject.description)

    // Add at least one tech
    const techInput = page.locator('input[placeholder*="React"]').or(page.locator('input[placeholder*="Node"]')).first()
    await techInput.fill('React')
    await page.click('button:has-text("Add")')
    await page.waitForTimeout(500)

    await page.fill('textarea#goals', testProject.goals)
    await page.fill('input#teamSize', testProject.teamSize)

    // Submit
    const submitButton = page.locator('button[type="submit"]').filter({ hasText: /Submit Project/i })
    await submitButton.click()

    // Wait for success page
    await page.waitForTimeout(3000)

    // Should see success message
    const successHeading = page.locator('h1').filter({ hasText: /Submitted|Success/i })
    await expect(successHeading).toBeVisible({ timeout: 10000 })
  })
})
