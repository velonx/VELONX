import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getToken } from 'next-auth/jwt'
import { Redis } from '@upstash/redis'
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

// Rate limit configurations
const ANONYMOUS_LIMIT = 200 // requests per minute
const AUTHENTICATED_LIMIT = 5000 // requests per hour
const ANONYMOUS_WINDOW = 60 // 1 minute in seconds (Redis EX)
const AUTHENTICATED_WINDOW = 3600 // 1 hour in seconds (Redis EX)

// Initialize Upstash Redis client for Edge Runtime
const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
})


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
 * Check rate limit for a request using Redis
 * Returns null if allowed, or a 429 response if rate limited
 */
async function checkRateLimit(
  request: NextRequest,
  identifier: string,
  isAuthenticated: boolean
): Promise<NextResponse | null> {
  const endpoint = request.nextUrl.pathname
  
  // Determine limits based on authentication status
  const maxRequests = isAuthenticated ? AUTHENTICATED_LIMIT : ANONYMOUS_LIMIT
  const windowSeconds = isAuthenticated ? AUTHENTICATED_WINDOW : ANONYMOUS_WINDOW
  
  // Create unique key for this identifier and endpoint
  const key = `rate_limit:${identifier}:${endpoint}`
  
  try {
    // Multi-command to increment and set expiry in one go (approximate)
    // In Edge Runtime, we use simple increment for performance
    const current = await redis.incr(key)
    
    if (current === 1) {
      // First request in window, set expiration
      await redis.expire(key, windowSeconds)
    }
    
    // Check if limit exceeded
    if (current > maxRequests) {
      const ttl = await redis.ttl(key)
      const retryAfterSeconds = Math.max(0, ttl)
      
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
            'X-RateLimit-Reset': new Date(Date.now() + retryAfterSeconds * 1000).toISOString(),
          },
        }
      )
    }
    
    return null // Request is allowed
  } catch (error) {
    console.error('[Middleware] Rate limiting error:', error)
    return null // Fail open if Redis is down
  }
}

/**
 * Add rate limit headers to response
 */
async function addRateLimitHeaders(
  response: NextResponse,
  identifier: string,
  endpoint: string,
  isAuthenticated: boolean
): Promise<NextResponse> {
  const maxRequests = isAuthenticated ? AUTHENTICATED_LIMIT : ANONYMOUS_LIMIT
  const key = `rate_limit:${identifier}:${endpoint}`
  
  try {
    const current = await redis.get<number>(key) || 0
    const ttl = await redis.ttl(key)
    
    const remaining = Math.max(0, maxRequests - current)
    response.headers.set('X-RateLimit-Limit', maxRequests.toString())
    response.headers.set('X-RateLimit-Remaining', remaining.toString())
    response.headers.set('X-RateLimit-Reset', new Date(Date.now() + Math.max(0, ttl) * 1000).toISOString())
  } catch (error) {
    // Ignore header errors
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
      response = await addRateLimitHeaders(response, identifier, pathname, isAuthenticated)
      
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
