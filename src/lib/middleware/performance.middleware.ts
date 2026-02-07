/**
 * Performance Monitoring Middleware
 * Tracks API request timing and logs performance metrics
 */

import { NextRequest, NextResponse } from 'next/server'
import { performanceMonitor } from '@/lib/services/performance-monitor.service'

/**
 * Performance monitoring middleware
 * Wraps API route handlers to track request timing
 */
export function withPerformanceMonitoring(
  handler: (req: NextRequest, context?: any) => Promise<NextResponse>
) {
  return async (req: NextRequest, context?: any): Promise<NextResponse> => {
    const startTime = Date.now()
    let response: NextResponse
    
    try {
      // Execute the handler
      response = await handler(req, context)
      
      // Track the request
      const duration = Date.now() - startTime
      const endpoint = new URL(req.url).pathname
      const method = req.method
      
      await performanceMonitor.trackRequest({
        endpoint,
        method,
        statusCode: response.status,
        duration,
        timestamp: startTime,
      })
      
      // Add performance headers to response
      response.headers.set('X-Response-Time', `${duration}ms`)
      
      return response
    } catch (error) {
      // Track failed request
      const duration = Date.now() - startTime
      const endpoint = new URL(req.url).pathname
      const method = req.method
      
      await performanceMonitor.trackRequest({
        endpoint,
        method,
        statusCode: 500,
        duration,
        timestamp: startTime,
      })
      
      throw error
    }
  }
}

/**
 * Simple performance tracking for API routes
 * Use this in API route handlers
 */
export async function trackAPIPerformance(
  req: NextRequest,
  handler: () => Promise<NextResponse>
): Promise<NextResponse> {
  const startTime = Date.now()
  const endpoint = new URL(req.url).pathname
  const method = req.method
  
  try {
    const response = await handler()
    const duration = Date.now() - startTime
    
    // Track the request
    await performanceMonitor.trackRequest({
      endpoint,
      method,
      statusCode: response.status,
      duration,
      timestamp: startTime,
    })
    
    // Add performance header
    response.headers.set('X-Response-Time', `${duration}ms`)
    
    return response
  } catch (error) {
    const duration = Date.now() - startTime
    
    // Track failed request
    await performanceMonitor.trackRequest({
      endpoint,
      method,
      statusCode: 500,
      duration,
      timestamp: startTime,
    })
    
    throw error
  }
}
