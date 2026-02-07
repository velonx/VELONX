/**
 * E2E Assertion Helpers
 * 
 * Custom assertions for E2E tests
 */

import { Page, expect } from '@playwright/test'

/**
 * Assert that a toast notification is visible
 */
export async function expectToastVisible(
  page: Page,
  message: string,
  type: 'success' | 'error' | 'info' = 'success'
): Promise<void> {
  const toast = page.locator(`[data-testid="toast-${type}"]`).filter({ hasText: message })
  await expect(toast).toBeVisible({ timeout: 5000 })
}

/**
 * Assert that user is on a specific page
 */
export async function expectToBeOnPage(page: Page, path: string): Promise<void> {
  await expect(page).toHaveURL(new RegExp(path))
}

/**
 * Assert that an element contains specific text
 */
export async function expectElementToContainText(
  page: Page,
  selector: string,
  text: string
): Promise<void> {
  const element = page.locator(selector)
  await expect(element).toContainText(text)
}

/**
 * Assert that a form field has an error
 */
export async function expectFormFieldError(
  page: Page,
  fieldName: string,
  errorMessage?: string
): Promise<void> {
  const errorElement = page.locator(`[data-testid="error-${fieldName}"]`)
  await expect(errorElement).toBeVisible()
  
  if (errorMessage) {
    await expect(errorElement).toContainText(errorMessage)
  }
}

/**
 * Assert that a loading spinner is visible
 */
export async function expectLoadingSpinner(page: Page): Promise<void> {
  const spinner = page.locator('[data-testid="loading-spinner"]')
  await expect(spinner).toBeVisible()
}

/**
 * Assert that a loading spinner is not visible
 */
export async function expectNoLoadingSpinner(page: Page): Promise<void> {
  const spinner = page.locator('[data-testid="loading-spinner"]')
  await expect(spinner).not.toBeVisible()
}

/**
 * Assert that a button is disabled
 */
export async function expectButtonDisabled(page: Page, buttonText: string): Promise<void> {
  const button = page.locator('button').filter({ hasText: buttonText })
  await expect(button).toBeDisabled()
}

/**
 * Assert that a button is enabled
 */
export async function expectButtonEnabled(page: Page, buttonText: string): Promise<void> {
  const button = page.locator('button').filter({ hasText: buttonText })
  await expect(button).toBeEnabled()
}

/**
 * Assert that an API call was made
 */
export async function expectAPICall(
  page: Page,
  method: string,
  urlPattern: string | RegExp
): Promise<void> {
  const response = await page.waitForResponse(
    (response) => {
      const url = response.url()
      const matchesUrl = typeof urlPattern === 'string' 
        ? url.includes(urlPattern)
        : urlPattern.test(url)
      return response.request().method() === method && matchesUrl
    },
    { timeout: 10000 }
  )
  
  expect(response).toBeTruthy()
}

/**
 * Assert that page has no console errors
 */
export async function expectNoConsoleErrors(page: Page): Promise<void> {
  const errors: string[] = []
  
  page.on('console', (msg) => {
    if (msg.type() === 'error') {
      errors.push(msg.text())
    }
  })
  
  // Wait a bit for any errors to appear
  await page.waitForTimeout(1000)
  
  expect(errors).toHaveLength(0)
}
