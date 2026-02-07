/**
 * Performance Monitoring Service
 * Tracks API response times, database query times, and cache metrics
 * Stores metrics in Redis for analysis and alerting
 */

import { Redis } from '@upstash/redis'
import { getRedisClient } from '@/lib/redis'
import { performanceAlertService } from '@/lib/services/performance-alert.service'

/**
 * Metric types
 */
export enum MetricType {
  API_REQUEST = 'api_request',
  DATABASE_QUERY = 'database_query',
  CACHE_OPERATION = 'cache_operation',
}

/**
 * Time range for metrics queries
 */
export interface TimeRange {
  start: Date
  end: Date
}

/**
 * API metric data
 */
export interface APIMetric {
  endpoint: string
  method: string
  statusCode: number
  duration: number
  timestamp: number
  userId?: string
}

/**
 * Database query metric data
 */
export interface DatabaseMetric {
  model: string
  action: string
  duration: number
  timestamp: number
}

/**
 * Cache operation metric data
 */
export interface CacheMetric {
  operation: 'get' | 'set' | 'delete' | 'invalidate'
  key: string
  hit: boolean
  duration: number
  timestamp: number
}

/**
 * Aggregated metrics for display
 */
export interface AggregatedMetrics {
  apiMetrics: {
    endpoint: string
    avgResponseTime: number
    p95ResponseTime: number
    p99ResponseTime: number
    requestCount: number
    errorRate: number
  }[]
  databaseMetrics: {
    avgQueryTime: number
    slowQueries: {
      model: string
      action: string
      duration: number
      timestamp: number
    }[]
    totalQueries: number
  }
  cacheMetrics: {
    hitRate: number
    missRate: number
    totalOperations: number
    avgDuration: number
  }
}

/**
 * Performance alert threshold
 */
const SLOW_REQUEST_THRESHOLD = 2000 // 2 seconds

/**
 * Performance Monitor Service
 */
export class PerformanceMonitorService {
  private client: Redis | null = null
  private readonly METRICS_TTL = 86400 // 24 hours
  private readonly SLOW_QUERY_THRESHOLD = 1000 // 1 second

  /**
   * Initialize Redis client
   */
  private initializeClient(): void {
    if (!this.client) {
      try {
        this.client = getRedisClient()
      } catch (error) {
        // Redis not initialized yet - fail silently for performance monitoring
        console.warn('[Performance] Redis not initialized, metrics will not be stored')
      }
    }
  }

  /**
   * Track API request
   */
  async trackRequest(metric: APIMetric): Promise<void> {
    try {
      this.initializeClient()
      
      if (!this.client) {
        // Redis not available, skip metric storage
        return
      }
      
      const key = `metrics:api:${metric.endpoint}:${metric.method}`
      const timestamp = metric.timestamp || Date.now()
      
      // Store metric in sorted set with timestamp as score
      await this.client.zadd(key, {
        score: timestamp,
        member: JSON.stringify({
          duration: metric.duration,
          statusCode: metric.statusCode,
          userId: metric.userId,
          timestamp,
        }),
      })
      
      // Set expiration
      await this.client.expire(key, this.METRICS_TTL)
      
      // Check for slow requests and alert
      await performanceAlertService.checkSlowRequest(
        metric.endpoint,
        metric.method,
        metric.duration
      )
    } catch (error) {
      console.error('[Performance] Error tracking API request:', error)
    }
  }

  /**
   * Track database query
   */
  async trackDatabaseQuery(metric: DatabaseMetric): Promise<void> {
    try {
      this.initializeClient()
      
      if (!this.client) {
        // Redis not available, skip metric storage
        return
      }
      
      const key = `metrics:db:${metric.model}:${metric.action}`
      const timestamp = metric.timestamp || Date.now()
      
      // Store metric in sorted set
      await this.client.zadd(key, {
        score: timestamp,
        member: JSON.stringify({
          duration: metric.duration,
          timestamp,
        }),
      })
      
      // Set expiration
      await this.client.expire(key, this.METRICS_TTL)
      
      // Track slow queries separately
      if (metric.duration > this.SLOW_QUERY_THRESHOLD) {
        const slowQueryKey = 'metrics:db:slow_queries'
        await this.client.zadd(slowQueryKey, {
          score: timestamp,
          member: JSON.stringify({
            model: metric.model,
            action: metric.action,
            duration: metric.duration,
            timestamp,
          }),
        })
        await this.client.expire(slowQueryKey, this.METRICS_TTL)
        
        // Alert on slow query
        await performanceAlertService.checkSlowQuery(
          metric.model,
          metric.action,
          metric.duration
        )
      }
    } catch (error) {
      console.error('[Performance] Error tracking database query:', error)
    }
  }

  /**
   * Track cache operation
   */
  async trackCacheOperation(metric: CacheMetric): Promise<void> {
    try {
      this.initializeClient()
      
      if (!this.client) {
        // Redis not available, skip metric storage
        return
      }
      
      const key = `metrics:cache:${metric.operation}`
      const timestamp = metric.timestamp || Date.now()
      
      // Store metric in sorted set
      await this.client.zadd(key, {
        score: timestamp,
        member: JSON.stringify({
          hit: metric.hit,
          duration: metric.duration,
          timestamp,
        }),
      })
      
      // Set expiration
      await this.client.expire(key, this.METRICS_TTL)
      
      // Track hit/miss ratio
      const hitMissKey = metric.hit ? 'metrics:cache:hits' : 'metrics:cache:misses'
      await this.client.incr(hitMissKey)
      await this.client.expire(hitMissKey, this.METRICS_TTL)
    } catch (error) {
      console.error('[Performance] Error tracking cache operation:', error)
    }
  }

  /**
   * Get aggregated metrics for a time range
   */
  async getMetrics(timeRange: TimeRange): Promise<AggregatedMetrics> {
    try {
      this.initializeClient()
      
      const startTimestamp = timeRange.start.getTime()
      const endTimestamp = timeRange.end.getTime()
      
      // Get API metrics
      const apiMetrics = await this.getAPIMetrics(startTimestamp, endTimestamp)
      
      // Get database metrics
      const databaseMetrics = await this.getDatabaseMetrics(startTimestamp, endTimestamp)
      
      // Get cache metrics
      const cacheMetrics = await this.getCacheMetrics(startTimestamp, endTimestamp)
      
      return {
        apiMetrics,
        databaseMetrics,
        cacheMetrics,
      }
    } catch (error) {
      console.error('[Performance] Error getting metrics:', error)
      return {
        apiMetrics: [],
        databaseMetrics: {
          avgQueryTime: 0,
          slowQueries: [],
          totalQueries: 0,
        },
        cacheMetrics: {
          hitRate: 0,
          missRate: 0,
          totalOperations: 0,
          avgDuration: 0,
        },
      }
    }
  }

  /**
   * Get API metrics for time range
   */
  private async getAPIMetrics(
    startTimestamp: number,
    endTimestamp: number
  ): Promise<AggregatedMetrics['apiMetrics']> {
    try {
      // Get all API metric keys
      const keys = await this.client!.keys('metrics:api:*')
      const apiMetrics: AggregatedMetrics['apiMetrics'] = []
      
      for (const key of keys) {
        // Extract endpoint and method from key
        const parts = key.split(':')
        const method = parts[parts.length - 1]
        const endpoint = parts.slice(2, -1).join(':')
        
        // Get metrics in time range
        const metrics = await this.client!.zrangebyscore(
          key,
          startTimestamp,
          endTimestamp
        )
        
        if (metrics.length === 0) continue
        
        // Parse and aggregate metrics
        const parsedMetrics = metrics.map((m) => JSON.parse(m as string))
        const durations = parsedMetrics.map((m) => m.duration)
        const errors = parsedMetrics.filter((m) => m.statusCode >= 400).length
        
        // Calculate statistics
        const avgResponseTime = durations.reduce((a, b) => a + b, 0) / durations.length
        const sortedDurations = [...durations].sort((a, b) => a - b)
        const p95Index = Math.floor(sortedDurations.length * 0.95)
        const p99Index = Math.floor(sortedDurations.length * 0.99)
        
        apiMetrics.push({
          endpoint,
          avgResponseTime: Math.round(avgResponseTime),
          p95ResponseTime: sortedDurations[p95Index] || 0,
          p99ResponseTime: sortedDurations[p99Index] || 0,
          requestCount: metrics.length,
          errorRate: (errors / metrics.length) * 100,
        })
      }
      
      return apiMetrics
    } catch (error) {
      console.error('[Performance] Error getting API metrics:', error)
      return []
    }
  }

  /**
   * Get database metrics for time range
   */
  private async getDatabaseMetrics(
    startTimestamp: number,
    endTimestamp: number
  ): Promise<AggregatedMetrics['databaseMetrics']> {
    try {
      // Get all database metric keys
      const keys = await this.client!.keys('metrics:db:*')
      const allDurations: number[] = []
      
      for (const key of keys) {
        if (key === 'metrics:db:slow_queries') continue
        
        const metrics = await this.client!.zrangebyscore(
          key,
          startTimestamp,
          endTimestamp
        )
        
        const parsedMetrics = metrics.map((m) => JSON.parse(m as string))
        allDurations.push(...parsedMetrics.map((m) => m.duration))
      }
      
      // Get slow queries
      const slowQueriesData = await this.client!.zrangebyscore(
        'metrics:db:slow_queries',
        startTimestamp,
        endTimestamp
      )
      
      const slowQueries = slowQueriesData
        .map((m) => JSON.parse(m as string))
        .sort((a, b) => b.duration - a.duration)
        .slice(0, 10) // Top 10 slowest queries
      
      const avgQueryTime = allDurations.length > 0
        ? Math.round(allDurations.reduce((a, b) => a + b, 0) / allDurations.length)
        : 0
      
      return {
        avgQueryTime,
        slowQueries,
        totalQueries: allDurations.length,
      }
    } catch (error) {
      console.error('[Performance] Error getting database metrics:', error)
      return {
        avgQueryTime: 0,
        slowQueries: [],
        totalQueries: 0,
      }
    }
  }

  /**
   * Get cache metrics for time range
   */
  private async getCacheMetrics(
    startTimestamp: number,
    endTimestamp: number
  ): Promise<AggregatedMetrics['cacheMetrics']> {
    try {
      // Get cache operation keys
      const keys = await this.client!.keys('metrics:cache:*')
      let totalHits = 0
      let totalMisses = 0
      const allDurations: number[] = []
      
      for (const key of keys) {
        if (key === 'metrics:cache:hits' || key === 'metrics:cache:misses') continue
        
        const metrics = await this.client!.zrangebyscore(
          key,
          startTimestamp,
          endTimestamp
        )
        
        const parsedMetrics = metrics.map((m) => JSON.parse(m as string))
        
        for (const metric of parsedMetrics) {
          if (metric.hit) {
            totalHits++
          } else {
            totalMisses++
          }
          allDurations.push(metric.duration)
        }
      }
      
      const totalOperations = totalHits + totalMisses
      const hitRate = totalOperations > 0 ? (totalHits / totalOperations) * 100 : 0
      const missRate = totalOperations > 0 ? (totalMisses / totalOperations) * 100 : 0
      const avgDuration = allDurations.length > 0
        ? Math.round(allDurations.reduce((a, b) => a + b, 0) / allDurations.length)
        : 0
      
      return {
        hitRate: Math.round(hitRate * 100) / 100,
        missRate: Math.round(missRate * 100) / 100,
        totalOperations,
        avgDuration,
      }
    } catch (error) {
      console.error('[Performance] Error getting cache metrics:', error)
      return {
        hitRate: 0,
        missRate: 0,
        totalOperations: 0,
        avgDuration: 0,
      }
    }
  }

  /**
   * Clear old metrics (cleanup)
   */
  async clearOldMetrics(olderThan: Date): Promise<void> {
    try {
      this.initializeClient()
      
      const timestamp = olderThan.getTime()
      const keys = await this.client!.keys('metrics:*')
      
      for (const key of keys) {
        if (key === 'metrics:cache:hits' || key === 'metrics:cache:misses') continue
        
        // Remove old entries from sorted sets
        await this.client!.zremrangebyscore(key, 0, timestamp)
      }
      
      console.log(`[Performance] Cleared metrics older than ${olderThan.toISOString()}`)
    } catch (error) {
      console.error('[Performance] Error clearing old metrics:', error)
    }
  }
}

// Export singleton instance
export const performanceMonitor = new PerformanceMonitorService()
