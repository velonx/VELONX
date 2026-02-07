import { NextResponse } from 'next/server'
import { redisManager } from '@/lib/redis'
import { checkConnectionHealth } from '@/lib/prisma'
import { initializeServices } from '@/lib/init'

/**
 * Health Check Endpoint
 * GET /api/health
 * 
 * Returns the health status of critical services:
 * - Redis connection
 * - Database connection with pool monitoring
 * - Application version and uptime
 * - System resources
 * 
 * @swagger
 * /api/health:
 *   get:
 *     summary: Health check endpoint
 *     description: Returns the health status of all critical services
 *     tags:
 *       - System
 *     responses:
 *       200:
 *         description: All services are healthy
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   enum: [healthy, degraded, unhealthy]
 *                 version:
 *                   type: string
 *                 uptime:
 *                   type: number
 *                 checks:
 *                   type: object
 *       503:
 *         description: One or more services are unhealthy
 */
export async function GET() {
  const startTime = Date.now()
  
  // Ensure services are initialized
  await initializeServices().catch(() => {
    // Ignore initialization errors - we'll report them in health check
  })

  try {
    const checks = {
      redis: { 
        healthy: false, 
        latency: null as number | null, 
        error: null as string | null,
        status: 'unknown' as 'connected' | 'disconnected' | 'unknown'
      },
      database: { 
        healthy: false, 
        lastCheck: null as string | null, 
        message: null as string | null, 
        error: null as string | null,
        poolStatus: null as any
      },
      application: {
        version: process.env.npm_package_version || '1.0.0',
        environment: process.env.NODE_ENV || 'development',
        uptime: process.uptime(),
        memory: {
          used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
          total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024),
          unit: 'MB'
        }
      },
      timestamp: new Date().toISOString()
    }

    // Check Redis health
    try {
      const redisHealth = redisManager.getHealthStatus()
      checks.redis = {
        healthy: redisHealth.isHealthy,
        latency: redisHealth.latency,
        error: null,
        status: redisHealth.isHealthy ? 'connected' : 'disconnected'
      }
    } catch (error) {
      checks.redis = {
        healthy: false,
        latency: null,
        error: error instanceof Error ? error.message : 'Unknown error',
        status: 'disconnected'
      }
    }

    // Check Database health with enhanced monitoring
    try {
      const dbHealth = await checkConnectionHealth()
      checks.database = {
        healthy: dbHealth.isHealthy,
        lastCheck: dbHealth.lastCheck.toISOString(),
        message: dbHealth.message,
        error: null,
        poolStatus: {
          active: dbHealth.activeConnections || 0,
          idle: dbHealth.idleConnections || 0
        }
      }
    } catch (error) {
      checks.database = {
        healthy: false,
        lastCheck: null,
        message: null,
        error: error instanceof Error ? error.message : 'Unknown error',
        poolStatus: null
      }
    }

    // Determine overall health status
    const allHealthy = checks.redis.healthy && checks.database.healthy
    const someHealthy = checks.redis.healthy || checks.database.healthy
    
    let status: 'healthy' | 'degraded' | 'unhealthy'
    let statusCode: number
    
    if (allHealthy) {
      status = 'healthy'
      statusCode = 200
    } else if (someHealthy) {
      status = 'degraded'
      statusCode = 200 // Still return 200 for degraded state
    } else {
      status = 'unhealthy'
      statusCode = 503
    }

    const responseTime = Date.now() - startTime

    return NextResponse.json({
      status,
      checks,
      responseTime: `${responseTime}ms`
    }, { 
      status: statusCode,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    })

  } catch (error) {
    const responseTime = Date.now() - startTime
    
    return NextResponse.json({
      status: 'error',
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString(),
      responseTime: `${responseTime}ms`
    }, { 
      status: 500,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    })
  }
}
