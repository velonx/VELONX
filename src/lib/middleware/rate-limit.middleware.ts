import { NextRequest, NextResponse } from 'next/server'
import { 
  RateLimiter, 
  createAnonymousRateLimiter, 
  createAuthenticatedRateLimiter,
  createCustomRateLimiter,
  RateLimitConfig
} from '@/lib/services/rate-limiter.service'

/**
 * Rate Limiting Middleware for API Routes
 * Can be used within API route handlers for granular control
 */

/**
 * Extract IP address from request headers
 */
export function getClientIp(request: NextRequest | Request): string {
  // Handle NextRequest
  if ('nextUrl' in request) {
    const forwardedFor = request.headers.get('x-forwarded-for')
    const realIp = request.headers.get('x-real-ip')
    const cfConnectingIp = request.headers.get('cf-connecting-ip')
    
    if (forwardedFor) {
      return forwardedFor.split(',')[0].trim()
    }
    if (realIp) return realIp
    if (cfConnectingIp) return cfConnectingIp
    
    return 'unknown'
  }
  
  // Handle standard Request
  const forwardedFor = request.headers.get('x-forwarded-for')
  const realIp = request.headers.get('x-real-ip')
  const cfConnectingIp = request.headers.get('cf-connecting-ip')
  
  if (forwardedFor) {
    return forwardedFor.split(',')[0].trim()
  }
  if (realIp) return realIp
  if (cfConnectingIp) return cfConnectingIp
  
  return 'unknown'
}

/**
 * Apply rate limiting to an API route
 * Returns null if allowed, or a 429 response if rate limited
 * 
 * @param request - The incoming request
 * @param identifier - Unique identifier (IP or user ID)
 * @param rateLimiter - RateLimiter instance to use
 * @param endpoint - Optional endpoint override (defaults to request pathname)
 */
export async function applyRateLimit(
  request: NextRequest | Request,
  identifier: string,
  rateLimiter: RateLimiter,
  endpoint?: string
): Promise<NextResponse | null> {
  // Determine endpoint
  let path: string
  if ('nextUrl' in request) {
    path = endpoint || request.nextUrl.pathname
  } else {
    path = endpoint || new URL(request.url).pathname
  }
  
  try {
    // Check rate limit
    const result = await rateLimiter.checkLimit(identifier, path)
    
    if (!result.allowed) {
      // Rate limit exceeded
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
            'Retry-After': result.retryAfter?.toString() || '60',
            'X-RateLimit-Limit': rateLimiter.getConfig().maxRequests.toString(),
            'X-RateLimit-Remaining': result.remaining.toString(),
            'X-RateLimit-Reset': result.resetAt.toISOString(),
          },
        }
      )
    }
    
    return null // Request is allowed
  } catch (error) {
    console.error('[RateLimitMiddleware] Error applying rate limit:', error)
    // Fail open: allow request if rate limiting fails
    return null
  }
}

/**
 * Add rate limit headers to a response
 */
export function addRateLimitHeaders(
  response: NextResponse,
  remaining: number,
  limit: number,
  resetAt: Date
): NextResponse {
  response.headers.set('X-RateLimit-Limit', limit.toString())
  response.headers.set('X-RateLimit-Remaining', remaining.toString())
  response.headers.set('X-RateLimit-Reset', resetAt.toISOString())
  return response
}

/**
 * Wrapper function to apply anonymous rate limiting
 */
export async function applyAnonymousRateLimit(
  request: NextRequest | Request,
  endpoint?: string
): Promise<NextResponse | null> {
  const identifier = getClientIp(request)
  const rateLimiter = createAnonymousRateLimiter()
  return applyRateLimit(request, identifier, rateLimiter, endpoint)
}

/**
 * Wrapper function to apply authenticated rate limiting
 */
export async function applyAuthenticatedRateLimit(
  request: NextRequest | Request,
  userId: string,
  endpoint?: string
): Promise<NextResponse | null> {
  const rateLimiter = createAuthenticatedRateLimiter()
  return applyRateLimit(request, userId, rateLimiter, endpoint)
}

/**
 * Wrapper function to apply custom rate limiting
 */
export async function applyCustomRateLimit(
  request: NextRequest | Request,
  identifier: string,
  config: RateLimitConfig,
  endpoint?: string
): Promise<NextResponse | null> {
  const rateLimiter = createCustomRateLimiter(config)
  return applyRateLimit(request, identifier, rateLimiter, endpoint)
}

/**
 * Higher-order function to wrap API route handlers with rate limiting
 * 
 * @example
 * export const POST = withRateLimit(
 *   async (request) => {
 *     // Your handler logic
 *   },
 *   { maxRequests: 10, windowMs: 60000 }
 * )
 */
export function withRateLimit(
  handler: (request: NextRequest) => Promise<NextResponse>,
  config?: RateLimitConfig
) {
  return async (request: NextRequest): Promise<NextResponse> => {
    const identifier = getClientIp(request)
    
    let rateLimiter: RateLimiter
    if (config) {
      rateLimiter = createCustomRateLimiter(config)
    } else {
      rateLimiter = createAnonymousRateLimiter()
    }
    
    const rateLimitResponse = await applyRateLimit(request, identifier, rateLimiter)
    
    if (rateLimitResponse) {
      return rateLimitResponse
    }
    
    return handler(request)
  }
}
