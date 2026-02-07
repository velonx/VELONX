/**
 * API Test Helpers
 * 
 * Utilities for testing API routes
 */

import { NextRequest } from 'next/server'
import { createMockSession } from '../mocks/session.mock'
import type { Session } from 'next-auth'

/**
 * Create a mock NextRequest for API route testing
 */
export function createMockNextRequest(options: {
  method?: string
  url?: string
  headers?: Record<string, string>
  body?: any
  searchParams?: Record<string, string>
} = {}): NextRequest {
  const {
    method = 'GET',
    url = 'http://localhost:3000/api/test',
    headers = {},
    body,
    searchParams = {},
  } = options

  // Build URL with search params
  const urlObj = new URL(url)
  Object.entries(searchParams).forEach(([key, value]) => {
    urlObj.searchParams.set(key, value)
  })

  const request = new NextRequest(urlObj.toString(), {
    method,
    headers: new Headers(headers),
    body: body ? JSON.stringify(body) : undefined,
  })

  return request
}

/**
 * Mock getServerSession for API route testing
 */
export function mockGetServerSession(session: Session | null = null) {
  return async () => session
}

/**
 * Create authenticated request context
 */
export function createAuthenticatedContext(
  role: 'STUDENT' | 'MENTOR' | 'ADMIN' = 'STUDENT'
) {
  const session = createMockSession({
    user: { role },
  })

  return {
    session,
    getServerSession: mockGetServerSession(session),
  }
}

/**
 * Create unauthenticated request context
 */
export function createUnauthenticatedContext() {
  return {
    session: null,
    getServerSession: mockGetServerSession(null),
  }
}

/**
 * Parse JSON response from API route
 */
export async function parseJSONResponse<T = any>(response: Response): Promise<T> {
  const text = await response.text()
  return JSON.parse(text)
}

/**
 * Assert API response status
 */
export function assertResponseStatus(response: Response, expectedStatus: number): void {
  if (response.status !== expectedStatus) {
    throw new Error(
      `Expected status ${expectedStatus}, but got ${response.status}`
    )
  }
}

/**
 * Assert API response is successful (2xx)
 */
export function assertResponseSuccess(response: Response): void {
  if (response.status < 200 || response.status >= 300) {
    throw new Error(
      `Expected successful response, but got status ${response.status}`
    )
  }
}

/**
 * Assert API response is error (4xx or 5xx)
 */
export function assertResponseError(response: Response): void {
  if (response.status < 400) {
    throw new Error(
      `Expected error response, but got status ${response.status}`
    )
  }
}

/**
 * Create mock API route context
 */
export function createMockAPIContext(options: {
  params?: Record<string, string>
  searchParams?: Record<string, string>
} = {}) {
  return {
    params: options.params || {},
    searchParams: options.searchParams || {},
  }
}

/**
 * Test API route with different methods
 */
export async function testAPIRoute(
  handler: (req: NextRequest, context?: any) => Promise<Response>,
  options: {
    method?: string
    url?: string
    headers?: Record<string, string>
    body?: any
    context?: any
  } = {}
): Promise<Response> {
  const request = createMockNextRequest(options)
  return handler(request, options.context)
}
