/**
 * Performance Metrics API
 * Provides performance metrics for admin dashboard
 */

import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { performanceMonitor } from '@/lib/services/performance-monitor.service'

/**
 * GET /api/admin/performance
 * Get performance metrics for a time range
 */
export async function GET(req: NextRequest) {
  try {
    // Check authentication and admin role
    const session = await auth()

    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    if (session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Forbidden - Admin access required' },
        { status: 403 }
      )
    }

    // Parse query parameters
    const searchParams = req.nextUrl.searchParams
    const timeRange = searchParams.get('timeRange') || '1h'

    // Calculate time range
    const end = new Date()
    const start = new Date()

    switch (timeRange) {
      case '1h':
        start.setHours(start.getHours() - 1)
        break
      case '6h':
        start.setHours(start.getHours() - 6)
        break
      case '24h':
        start.setHours(start.getHours() - 24)
        break
      case '7d':
        start.setDate(start.getDate() - 7)
        break
      default:
        start.setHours(start.getHours() - 1)
    }

    // Get metrics
    const metrics = await performanceMonitor.getMetrics({ start, end })

    return NextResponse.json({
      success: true,
      data: {
        metrics,
        timeRange: {
          start: start.toISOString(),
          end: end.toISOString(),
        },
      },
    })
  } catch (error) {
    console.error('[Performance API] Error:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch performance metrics'
      },
      { status: 500 }
    )
  }
}
