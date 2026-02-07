/**
 * CSRF Protection Middleware
 * Implements CSRF token generation and validation for state-changing requests
 * Compatible with Next.js 15 Edge Runtime
 */

import { NextRequest, NextResponse } from 'next/server'
import { getToken } from 'next-auth/jwt'

// CSRF token configuration
const CSRF_TOKEN_LENGTH = 32
const CSRF_HEADER_NAME = 'x-csrf-token'
const CSRF_COOKIE_NAME = 'csrf-token'
const CSRF_TOKEN_EXPIRY = 24 * 60 * 60 * 1000 // 24 hours

/**
 * Generate a random CSRF token
 */
function generateCSRFToken(): string {
  const array = new Uint8Array(CSRF_TOKEN_LENGTH)
  crypto.getRandomValues(array)
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('')
}

/**
 * Constant-time string comparison to prevent timing attacks
 */
function secureCompare(a: string, b: string): boolean {
  if (a.length !== b.length) {
    return false
  }
  
  let result = 0
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i)
  }
  
  return result === 0
}

/**
 * Extract CSRF token from request
 */
function getCSRFTokenFromRequest(request: NextRequest): string | null {
  // Check header first
  const headerToken = request.headers.get(CSRF_HEADER_NAME)
  if (headerToken) {
    return headerToken
  }
  
  // Check body for form submissions (if content-type is form data)
  // Note: In Edge Runtime, we can't easily parse the body without consuming it
  // So we rely on the header for API requests
  
  return null
}

/**
 * Get CSRF token from cookie
 */
function getCSRFTokenFromCookie(request: NextRequest): string | null {
  const cookieHeader = request.headers.get('cookie')
  if (!cookieHeader) {
    return null
  }
  
  const cookies = cookieHeader.split(';').map(c => c.trim())
  const csrfCookie = cookies.find(c => c.startsWith(`${CSRF_COOKIE_NAME}=`))
  
  if (!csrfCookie) {
    return null
  }
  
  return csrfCookie.split('=')[1]
}

/**
 * Check if request method requires CSRF protection
 */
function requiresCSRFProtection(method: string): boolean {
  return ['POST', 'PUT', 'PATCH', 'DELETE'].includes(method.toUpperCase())
}

/**
 * Check if endpoint should skip CSRF protection
 */
function shouldSkipCSRFProtection(pathname: string): boolean {
  // Skip CSRF for authentication endpoints (they have their own protection)
  const skipPaths = [
    '/api/auth/signin',
    '/api/auth/signout',
    '/api/auth/callback',
    '/api/auth/session',
    '/api/auth/csrf',
    '/api/auth/signup',
    '/api/health',
  ]
  
  return skipPaths.some(path => pathname.startsWith(path))
}

/**
 * Validate CSRF token
 */
export async function validateCSRFToken(request: NextRequest): Promise<boolean> {
  const { pathname } = request.nextUrl
  const method = request.method
  
  // Skip validation for safe methods
  if (!requiresCSRFProtection(method)) {
    return true
  }
  
  // Skip validation for specific endpoints
  if (shouldSkipCSRFProtection(pathname)) {
    return true
  }
  
  // Get token from request
  const requestToken = getCSRFTokenFromRequest(request)
  if (!requestToken) {
    return false
  }
  
  // Get token from cookie
  const cookieToken = getCSRFTokenFromCookie(request)
  if (!cookieToken) {
    return false
  }
  
  // Compare tokens using constant-time comparison
  return secureCompare(requestToken, cookieToken)
}

/**
 * CSRF Protection Middleware
 */
export async function csrfProtection(request: NextRequest): Promise<NextResponse | null> {
  const { pathname } = request.nextUrl
  const method = request.method
  
  // Skip CSRF for non-API routes
  if (!pathname.startsWith('/api/')) {
    return null
  }
  
  // Skip CSRF for safe methods
  if (!requiresCSRFProtection(method)) {
    return null
  }
  
  // Skip CSRF for specific endpoints
  if (shouldSkipCSRFProtection(pathname)) {
    return null
  }
  
  // Validate CSRF token
  const isValid = await validateCSRFToken(request)
  
  if (!isValid) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'CSRF_TOKEN_INVALID',
          message: 'Invalid or missing CSRF token. Please refresh the page and try again.',
        },
      },
      {
        status: 403,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    )
  }
  
  return null // CSRF validation passed
}

/**
 * Add CSRF token to response
 */
export function addCSRFTokenToResponse(
  response: NextResponse,
  request: NextRequest
): NextResponse {
  // Check if token already exists in cookie
  let token = getCSRFTokenFromCookie(request)
  
  // Generate new token if it doesn't exist
  if (!token) {
    token = generateCSRFToken()
    
    // Set cookie with token
    response.cookies.set(CSRF_COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: CSRF_TOKEN_EXPIRY / 1000, // Convert to seconds
      path: '/',
    })
  }
  
  // Add token to response header for client-side access
  response.headers.set(CSRF_HEADER_NAME, token)
  
  return response
}

/**
 * Get CSRF token for client-side use
 * This should be called from an API route to provide the token to the client
 */
export function getCSRFToken(request: NextRequest): string {
  let token = getCSRFTokenFromCookie(request)
  
  if (!token) {
    token = generateCSRFToken()
  }
  
  return token
}
