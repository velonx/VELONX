import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getToken } from 'next-auth/jwt'
import { csrfProtection, addCSRFTokenToResponse } from '@/lib/middleware/csrf.middleware'
import { addSecurityHeaders } from '@/lib/middleware/security-headers.middleware'
// Note: Audit logging is disabled in middleware due to Edge Runtime limitations
// Audit logs should be created in API routes instead

/**
 * Security Middleware for Next.js
 * Applies rate limiting, CSRF protection, and security headers to all routes
 * Uses sliding window algorithm for rate limiting
 * Uses double-submit cookie pattern for CSRF protection
 * Adds comprehensive security headers to all responses
 */

// Note: We can't import the RateLimiter service directly in middleware
// because middleware runs in Edge Runtime which has limitations.
// Instead, we'll create a lightweight implementation here.

interface RateLimitStore {
  [key: string]: {
    requests: number[]
    resetAt: number
  }
}

// In-memory store for rate limiting (for Edge Runtime compatibility)
// In production, this should use Redis via API route or Edge-compatible Redis client
const rateLimitStore: RateLimitStore = {}

// Rate limit configurations
const ANONYMOUS_LIMIT = 100 // requests per minute
const AUTHENTICATED_LIMIT = 500 // requests per hour
const ANONYMOUS_WINDOW = 60 * 1000 // 1 minute in ms
const AUTHENTICATED_WINDOW = 60 * 60 * 1000 // 1 hour in ms

/**
 * Extract IP address from request
 * Handles various proxy headers
 */
function getClientIdentifier(request: NextRequest): string {
  // Try to get real IP from various headers (in order of preference)
  const forwardedFor = request.headers.get('x-forwarded-for')
  const realIp = request.headers.get('x-real-ip')
  const cfConnectingIp = request.headers.get('cf-connecting-ip')
  
  if (forwardedFor) {
    // x-forwarded-for can contain multiple IPs, take the first one
    return forwardedFor.split(',')[0].trim()
  }
  
  if (realIp) {
    return realIp
  }
  
  if (cfConnectingIp) {
    return cfConnectingIp
  }
  
  // Fallback to a default identifier
  return 'unknown'
}

/**
 * Check rate limit for a request
 * Returns null if allowed, or a 429 response if rate limited
 */
async function checkRateLimit(
  request: NextRequest,
  identifier: string,
  isAuthenticated: boolean
): Promise<NextResponse | null> {
  const endpoint = request.nextUrl.pathname
  const now = Date.now()
  
  // Determine limits based on authentication status
  const maxRequests = isAuthenticated ? AUTHENTICATED_LIMIT : ANONYMOUS_LIMIT
  const windowMs = isAuthenticated ? AUTHENTICATED_WINDOW : ANONYMOUS_WINDOW
  
  // Create unique key for this identifier and endpoint
  const key = `${identifier}:${endpoint}`
  
  // Initialize store for this key if it doesn't exist
  if (!rateLimitStore[key]) {
    rateLimitStore[key] = {
      requests: [],
      resetAt: now + windowMs
    }
  }
  
  const store = rateLimitStore[key]
  
  // Remove expired requests (sliding window)
  const windowStart = now - windowMs
  store.requests = store.requests.filter(timestamp => timestamp > windowStart)
  
  // Check if limit exceeded
  if (store.requests.length >= maxRequests) {
    // Calculate retry after
    const oldestRequest = store.requests[0]
    const retryAfterMs = oldestRequest + windowMs - now
    const retryAfterSeconds = Math.ceil(retryAfterMs / 1000)
    
    // Return 429 response with headers
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'RATE_LIMIT_EXCEEDED',
          message: 'Too many requests. Please try again later.',
        },
      },
      {
        status: 429,
        headers: {
          'Retry-After': retryAfterSeconds.toString(),
          'X-RateLimit-Limit': maxRequests.toString(),
          'X-RateLimit-Remaining': '0',
          'X-RateLimit-Reset': new Date(now + windowMs).toISOString(),
        },
      }
    )
  }
  
  // Add current request
  store.requests.push(now)
  store.resetAt = now + windowMs
  
  // Clean up old entries periodically (simple cleanup)
  if (Math.random() < 0.01) { // 1% chance to cleanup
    cleanupExpiredEntries(now)
  }
  
  return null // Request is allowed
}

/**
 * Clean up expired entries from the rate limit store
 */
function cleanupExpiredEntries(now: number): void {
  const keys = Object.keys(rateLimitStore)
  for (const key of keys) {
    const store = rateLimitStore[key]
    if (store.resetAt < now && store.requests.length === 0) {
      delete rateLimitStore[key]
    }
  }
}

/**
 * Add rate limit headers to response
 */
function addRateLimitHeaders(
  response: NextResponse,
  identifier: string,
  endpoint: string,
  isAuthenticated: boolean
): NextResponse {
  const maxRequests = isAuthenticated ? AUTHENTICATED_LIMIT : ANONYMOUS_LIMIT
  const key = `${identifier}:${endpoint}`
  const store = rateLimitStore[key]
  
  if (store) {
    const remaining = Math.max(0, maxRequests - store.requests.length)
    response.headers.set('X-RateLimit-Limit', maxRequests.toString())
    response.headers.set('X-RateLimit-Remaining', remaining.toString())
    response.headers.set('X-RateLimit-Reset', new Date(store.resetAt).toISOString())
  }
  
  return response
}

/**
 * Main middleware function
 */
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  
  // Skip middleware for health check endpoint
  if (pathname === '/api/health') {
    return NextResponse.next()
  }
  
  try {
    let response: NextResponse
    let token: any = null
    
    // Apply different middleware based on route type
    if (pathname.startsWith('/api/')) {
      // API routes: Apply CSRF protection and rate limiting
      
      // Get authentication token first (needed for logging)
      token = await getToken({ 
        req: request,
        secret: process.env.NEXTAUTH_SECRET 
      })
      
      // 1. CSRF Protection (for state-changing requests)
      const csrfResponse = await csrfProtection(request)
      if (csrfResponse) {
        // CSRF validation failed
        // Note: Audit logging happens in API routes, not in Edge Runtime middleware
        
        // Add security headers before returning
        return addSecurityHeaders(csrfResponse)
      }
      
      // 2. Rate Limiting
      const identifier = getClientIdentifier(request)
      const isAuthenticated = !!token
      
      // Check rate limit
      const rateLimitResponse = await checkRateLimit(request, identifier, isAuthenticated)
      
      if (rateLimitResponse) {
        // Rate limit exceeded
        // Note: Audit logging happens in API routes, not in Edge Runtime middleware
        
        // Add security headers before returning
        return addSecurityHeaders(rateLimitResponse)
      }
      
      // Continue with request
      response = NextResponse.next()
      
      // Add rate limit headers
      response = addRateLimitHeaders(response, identifier, pathname, isAuthenticated)
      
      // Add CSRF token to response (for GET requests)
      response = addCSRFTokenToResponse(response, request)
    } else {
      // Non-API routes: Just continue
      response = NextResponse.next()
    }
    
    // 3. Add security headers to all responses
    response = addSecurityHeaders(response)
    
    return response
    
  } catch (error) {
    console.error('[Middleware] Security middleware error:', error)
    
    // Fail open: allow request if middleware fails, but still add security headers
    const response = NextResponse.next()
    return addSecurityHeaders(response)
  }
}

/**
 * Configure which routes the middleware should run on
 */
export const config = {
  matcher: [
    /*
     * Match all routes except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder files
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
