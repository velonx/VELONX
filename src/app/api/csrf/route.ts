/**
 * CSRF Token API Endpoint
 * Provides CSRF tokens to authenticated clients
 */

import { NextRequest, NextResponse } from 'next/server'
import { getCSRFToken } from '@/lib/middleware/csrf.middleware'

/**
 * GET /api/csrf
 * Returns a CSRF token for the current session
 */
export async function GET(request: NextRequest) {
  try {
    // Generate or retrieve CSRF token
    const csrfToken = getCSRFToken(request)
    
    // Create response with token
    const response = NextResponse.json(
      {
        success: true,
        data: {
          csrfToken,
        },
      },
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    )
    
    // Set CSRF token in cookie
    response.cookies.set('csrf-token', csrfToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
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
          code: 'CSRF_TOKEN_ERROR',
          message: 'Failed to generate CSRF token',
        },
      },
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    )
  }
}
