/**
 * WebSocket Health Check Endpoint
 * Returns status of WebSocket server and Redis Pub/Sub
 */

import { NextResponse } from 'next/server'
import { getConnectionStats } from '@/lib/websocket/server'
import { getPubSubHealth } from '@/lib/websocket/pubsub'

export async function GET() {
  try {
    // Get WebSocket connection stats
    const connectionStats = getConnectionStats()

    // Get Pub/Sub health
    const pubSubHealth = await getPubSubHealth()

    return NextResponse.json({
      success: true,
      data: {
        websocket: {
          ...connectionStats,
          isHealthy: true
        },
        pubsub: pubSubHealth,
        timestamp: new Date().toISOString()
      }
    })
  } catch (error) {
    console.error('[WebSocket Health] Error:', error)
    
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'HEALTH_CHECK_FAILED',
          message: 'Failed to retrieve WebSocket health status'
        }
      },
      { status: 500 }
    )
  }
}
