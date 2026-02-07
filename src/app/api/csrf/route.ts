/**
 * CSRF Token API Endpoint
 * Provides CSRF tokens to clients for form submissions and API requests
 */

import { NextRequest, NextResponse } from 'next/server'
import { getCSRFToken } from '@/lib/middleware/csrf.middleware'

/**
 * GET /api/csrf
 * Returns a CSRF token for the client to use in subsequent requests
 */
export async function GET(request: NextRequest) {
  try {
    const token = getCSRFToken(request)
    
    const response = NextResponse.json(
      {
        success: true,
        data: {
          csrfToken: token,
        },
      },
      { status: 200 }
    )
    
    // Set the token in a cookie
    response.cookies.set('csrf-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 24 * 60 * 60, // 24 hours
      path: '/',
    })
    
    return response
  } catch (error) {
    console.error('[CSRF API] Error generating token:', error)
    
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'CSRF_TOKEN_GENERATION_FAILED',
          message: 'Failed to generate CSRF token',
        },
      },
      { status: 500 }
    )
  }
}
