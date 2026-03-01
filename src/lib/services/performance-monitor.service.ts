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
 * Page load metric data
 */
export interface PageLoadMetric {
  page: string
  loadTime: number
  timestamp: number
  userId?: string
}

/**
 * Bundle size metric data
 */
export interface BundleSizeMetric {
  bundleType: 'js' | 'css' | 'total'
  size: number
  timestamp: number
}

/**
 * Aggregated metrics for display
 */
export interface AggregatedMetrics {
  apiMetrics: {
    endpoint: string
    method: string
    avgResponseTime: number
    p50ResponseTime: number
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
    queryCount: number
  }
  cacheMetrics: {
    hitRate: number
    missRate: number
    totalOperations: number
    avgDuration: number
    hitCount: number
    missCount: number
  }
  pageLoadMetrics: {
    avgLoadTime: number
    p50LoadTime: number
    p95LoadTime: number
    p99LoadTime: number
    sampleCount: number
  }
  bundleMetrics: {
    totalSize: number
    jsSize: number
    cssSize: number
    compressionRatio: number
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
   * Track page load time
   */
  async trackPageLoad(metric: PageLoadMetric): Promise<void> {
    try {
      this.initializeClient()
      
      if (!this.client) {
        return
      }
      
      const key = `metrics:pageload:${metric.page}`
      const timestamp = metric.timestamp || Date.now()
      
      // Store metric in sorted set
      await this.client.zadd(key, {
        score: timestamp,
        member: JSON.stringify({
          loadTime: metric.loadTime,
          userId: metric.userId,
          timestamp,
        }),
      })
      
      // Set expiration
      await this.client.expire(key, this.METRICS_TTL)
      
      // Check for slow page loads and alert
      if (metric.loadTime > 3500) { // Alert if > 3.5 seconds
        await performanceAlertService.checkSlowRequest(
          metric.page,
          'PAGE_LOAD',
          metric.loadTime
        )
      }
    } catch (error) {
      console.error('[Performance] Error tracking page load:', error)
    }
  }

  /**
   * Track bundle size
   */
  async trackBundleSize(metric: BundleSizeMetric): Promise<void> {
    try {
      this.initializeClient()
      
      if (!this.client) {
        return
      }
      
      const key = `metrics:bundle:${metric.bundleType}`
      const timestamp = metric.timestamp || Date.now()
      
      // Store metric in sorted set
      await this.client.zadd(key, {
        score: timestamp,
        member: JSON.stringify({
          size: metric.size,
          timestamp,
        }),
      })
      
      // Set expiration
      await this.client.expire(key, this.METRICS_TTL)
    } catch (error) {
      console.error('[Performance] Error tracking bundle size:', error)
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
      
      // Track hit/miss counts in time-series for accurate reporting
      const countKey = metric.hit ? 'metrics:cache:hit_count' : 'metrics:cache:miss_count'
      await this.client.zadd(countKey, {
        score: timestamp,
        member: JSON.stringify({ timestamp }),
      })
      await this.client.expire(countKey, this.METRICS_TTL)
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
      
      // Get page load metrics
      const pageLoadMetrics = await this.getPageLoadMetrics(startTimestamp, endTimestamp)
      
      // Get bundle metrics
      const bundleMetrics = await this.getBundleMetrics(startTimestamp, endTimestamp)
      
      return {
        apiMetrics,
        databaseMetrics,
        cacheMetrics,
        pageLoadMetrics,
        bundleMetrics,
      }
    } catch (error) {
      console.error('[Performance] Error getting metrics:', error)
      return {
        apiMetrics: [],
        databaseMetrics: {
          avgQueryTime: 0,
          slowQueries: [],
          totalQueries: 0,
          queryCount: 0,
        },
        cacheMetrics: {
          hitRate: 0,
          missRate: 0,
          totalOperations: 0,
          avgDuration: 0,
          hitCount: 0,
          missCount: 0,
        },
        pageLoadMetrics: {
          avgLoadTime: 0,
          p50LoadTime: 0,
          p95LoadTime: 0,
          p99LoadTime: 0,
          sampleCount: 0,
        },
        bundleMetrics: {
          totalSize: 0,
          jsSize: 0,
          cssSize: 0,
          compressionRatio: 0,
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
        
        // Get metrics in time range using zrange with byScore
        const metrics = await this.client!.zrange(
          key,
          startTimestamp,
          endTimestamp,
          { byScore: true }
        )
        
        if (metrics.length === 0) continue
        
        // Parse and aggregate metrics
        const parsedMetrics = (metrics as string[]).map((m) => JSON.parse(m))
        const durations = parsedMetrics.map((m: any) => m.duration)
        const errors = parsedMetrics.filter((m: any) => m.statusCode >= 400).length
        
        // Calculate statistics with percentiles
        const avgResponseTime = durations.reduce((a: number, b: number) => a + b, 0) / durations.length
        const sortedDurations = [...durations].sort((a: number, b: number) => a - b)
        const p50Index = Math.floor(sortedDurations.length * 0.50)
        const p95Index = Math.floor(sortedDurations.length * 0.95)
        const p99Index = Math.floor(sortedDurations.length * 0.99)
        
        apiMetrics.push({
          endpoint,
          method,
          avgResponseTime: Math.round(avgResponseTime),
          p50ResponseTime: sortedDurations[p50Index] || 0,
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
        
        const metrics = await this.client!.zrange(
          key,
          startTimestamp,
          endTimestamp,
          { byScore: true }
        )
        
        const parsedMetrics = (metrics as string[]).map((m) => JSON.parse(m))
        allDurations.push(...parsedMetrics.map((m: any) => m.duration))
      }
      
      // Get slow queries
      const slowQueriesData = await this.client!.zrange(
        'metrics:db:slow_queries',
        startTimestamp,
        endTimestamp,
        { byScore: true }
      )
      
      const slowQueries = (slowQueriesData as string[])
        .map((m) => JSON.parse(m))
        .sort((a: any, b: any) => b.duration - a.duration)
        .slice(0, 10) // Top 10 slowest queries
      
      const avgQueryTime = allDurations.length > 0
        ? Math.round(allDurations.reduce((a, b) => a + b, 0) / allDurations.length)
        : 0
      
      return {
        avgQueryTime,
        slowQueries,
        totalQueries: allDurations.length,
        queryCount: allDurations.length,
      }
    } catch (error) {
      console.error('[Performance] Error getting database metrics:', error)
      return {
        avgQueryTime: 0,
        slowQueries: [],
        totalQueries: 0,
        queryCount: 0,
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
        if (key === 'metrics:cache:hits' || key === 'metrics:cache:misses' || 
            key === 'metrics:cache:hit_count' || key === 'metrics:cache:miss_count') continue
        
        const metrics = await this.client!.zrange(
          key,
          startTimestamp,
          endTimestamp,
          { byScore: true }
        )
        
        // Handle both string and object responses from Redis
        const parsedMetrics = (metrics as (string | object)[]).map((m) => {
          if (typeof m === 'string') {
            try {
              return JSON.parse(m)
            } catch (error) {
              console.error('[Performance] Failed to parse metric:', m, error)
              return null
            }
          }
          return m
        }).filter(Boolean)
        
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
        hitCount: totalHits,
        missCount: totalMisses,
      }
    } catch (error) {
      console.error('[Performance] Error getting cache metrics:', error)
      return {
        hitRate: 0,
        missRate: 0,
        totalOperations: 0,
        avgDuration: 0,
        hitCount: 0,
        missCount: 0,
      }
    }
  }

  /**
   * Get page load metrics for time range
   */
  private async getPageLoadMetrics(
    startTimestamp: number,
    endTimestamp: number
  ): Promise<AggregatedMetrics['pageLoadMetrics']> {
    try {
      // Get all page load metric keys
      const keys = await this.client!.keys('metrics:pageload:*')
      const allLoadTimes: number[] = []
      
      for (const key of keys) {
        const metrics = await this.client!.zrange(
          key,
          startTimestamp,
          endTimestamp,
          { byScore: true }
        )
        
        const parsedMetrics = (metrics as string[]).map((m) => JSON.parse(m))
        allLoadTimes.push(...parsedMetrics.map((m: any) => m.loadTime))
      }
      
      if (allLoadTimes.length === 0) {
        return {
          avgLoadTime: 0,
          p50LoadTime: 0,
          p95LoadTime: 0,
          p99LoadTime: 0,
          sampleCount: 0,
        }
      }
      
      // Calculate statistics with percentiles
      const avgLoadTime = allLoadTimes.reduce((a, b) => a + b, 0) / allLoadTimes.length
      const sortedLoadTimes = [...allLoadTimes].sort((a, b) => a - b)
      const p50Index = Math.floor(sortedLoadTimes.length * 0.50)
      const p95Index = Math.floor(sortedLoadTimes.length * 0.95)
      const p99Index = Math.floor(sortedLoadTimes.length * 0.99)
      
      return {
        avgLoadTime: Math.round(avgLoadTime),
        p50LoadTime: sortedLoadTimes[p50Index] || 0,
        p95LoadTime: sortedLoadTimes[p95Index] || 0,
        p99LoadTime: sortedLoadTimes[p99Index] || 0,
        sampleCount: allLoadTimes.length,
      }
    } catch (error) {
      console.error('[Performance] Error getting page load metrics:', error)
      return {
        avgLoadTime: 0,
        p50LoadTime: 0,
        p95LoadTime: 0,
        p99LoadTime: 0,
        sampleCount: 0,
      }
    }
  }

  /**
   * Get bundle metrics for time range
   */
  private async getBundleMetrics(
    startTimestamp: number,
    endTimestamp: number
  ): Promise<AggregatedMetrics['bundleMetrics']> {
    try {
      // Get latest bundle sizes
      const jsMetrics = await this.client!.zrange(
        'metrics:bundle:js',
        startTimestamp,
        endTimestamp,
        { byScore: true }
      )
      const cssMetrics = await this.client!.zrange(
        'metrics:bundle:css',
        startTimestamp,
        endTimestamp,
        { byScore: true }
      )
      const totalMetrics = await this.client!.zrange(
        'metrics:bundle:total',
        startTimestamp,
        endTimestamp,
        { byScore: true }
      )
      
      // Get most recent values
      const latestJs = jsMetrics.length > 0 
        ? JSON.parse(jsMetrics[jsMetrics.length - 1] as string).size 
        : 0
      const latestCss = cssMetrics.length > 0 
        ? JSON.parse(cssMetrics[cssMetrics.length - 1] as string).size 
        : 0
      const latestTotal = totalMetrics.length > 0 
        ? JSON.parse(totalMetrics[totalMetrics.length - 1] as string).size 
        : latestJs + latestCss
      
      // Calculate compression ratio (assuming uncompressed is ~3x compressed)
      const compressionRatio = latestTotal > 0 ? 3.0 : 0
      
      return {
        totalSize: latestTotal,
        jsSize: latestJs,
        cssSize: latestCss,
        compressionRatio,
      }
    } catch (error) {
      console.error('[Performance] Error getting bundle metrics:', error)
      return {
        totalSize: 0,
        jsSize: 0,
        cssSize: 0,
        compressionRatio: 0,
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

  /**
   * Compare bundle sizes and detect regressions
   */
  async compareBundleSizes(
    currentSize: number,
    bundleType: 'js' | 'css' | 'total'
  ): Promise<{
    currentSize: number
    previousSize: number
    difference: number
    percentageChange: number
    isRegression: boolean
  }> {
    try {
      this.initializeClient()
      
      if (!this.client) {
        return {
          currentSize,
          previousSize: 0,
          difference: 0,
          percentageChange: 0,
          isRegression: false,
        }
      }
      
      // Get previous bundle size (24 hours ago)
      const oneDayAgo = Date.now() - 86400000
      const key = `metrics:bundle:${bundleType}`
      
      const previousMetrics = await this.client.zrange(
        key,
        oneDayAgo - 3600000, // 1 hour window
        oneDayAgo + 3600000,
        { byScore: true }
      )
      
      let previousSize = 0
      if (previousMetrics.length > 0) {
        previousSize = JSON.parse(previousMetrics[previousMetrics.length - 1] as string).size
      }
      
      const difference = currentSize - previousSize
      const percentageChange = previousSize > 0 
        ? (difference / previousSize) * 100 
        : 0
      
      // Regression if bundle size increased by more than 10%
      const isRegression = percentageChange > 10
      
      if (isRegression) {
        await performanceAlertService.alertBundleSizeRegression(
          bundleType,
          currentSize,
          previousSize,
          percentageChange
        )
      }
      
      return {
        currentSize,
        previousSize,
        difference,
        percentageChange: Math.round(percentageChange * 100) / 100,
        isRegression,
      }
    } catch (error) {
      console.error('[Performance] Error comparing bundle sizes:', error)
      return {
        currentSize,
        previousSize: 0,
        difference: 0,
        percentageChange: 0,
        isRegression: false,
      }
    }
  }

  /**
   * Validate target metrics are achieved
   */
  async validateTargetMetrics(timeRange: TimeRange): Promise<{
    pageLoad: { actual: number; target: string; met: boolean }
    apiResponse: { actual: number; target: string; met: boolean }
    bundleSize: { actual: number; target: string; met: boolean }
    payloadSize: { actual: number; target: string; met: boolean }
    allTargetsMet: boolean
  }> {
    try {
      const metrics = await this.getMetrics(timeRange)
      
      // Target: Page load 2-3 seconds
      const pageLoadMet = 
        metrics.pageLoadMetrics.avgLoadTime >= 2000 && 
        metrics.pageLoadMetrics.avgLoadTime <= 3000
      
      // Target: API response 200-400ms
      const apiResponseAvg = metrics.apiMetrics.length > 0
        ? metrics.apiMetrics.reduce((sum, m) => sum + m.avgResponseTime, 0) / metrics.apiMetrics.length
        : 0
      const apiResponseMet = apiResponseAvg >= 200 && apiResponseAvg <= 400
      
      // Target: Bundle size 400-500KB
      const bundleSizeMet = 
        metrics.bundleMetrics.totalSize >= 400000 && 
        metrics.bundleMetrics.totalSize <= 500000
      
      // Target: Payload size 20-30KB (estimated from bundle size / 15)
      const estimatedPayloadSize = metrics.bundleMetrics.totalSize / 15
      const payloadSizeMet = estimatedPayloadSize >= 20000 && estimatedPayloadSize <= 30000
      
      const allTargetsMet = pageLoadMet && apiResponseMet && bundleSizeMet && payloadSizeMet
      
      return {
        pageLoad: {
          actual: metrics.pageLoadMetrics.avgLoadTime,
          target: '2000-3000ms',
          met: pageLoadMet,
        },
        apiResponse: {
          actual: Math.round(apiResponseAvg),
          target: '200-400ms',
          met: apiResponseMet,
        },
        bundleSize: {
          actual: metrics.bundleMetrics.totalSize,
          target: '400000-500000 bytes',
          met: bundleSizeMet,
        },
        payloadSize: {
          actual: Math.round(estimatedPayloadSize),
          target: '20000-30000 bytes',
          met: payloadSizeMet,
        },
        allTargetsMet,
      }
    } catch (error) {
      console.error('[Performance] Error validating target metrics:', error)
      return {
        pageLoad: { actual: 0, target: '2000-3000ms', met: false },
        apiResponse: { actual: 0, target: '200-400ms', met: false },
        bundleSize: { actual: 0, target: '400000-500000 bytes', met: false },
        payloadSize: { actual: 0, target: '20000-30000 bytes', met: false },
        allTargetsMet: false,
      }
    }
  }
}

// Export singleton instance
export const performanceMonitor = new PerformanceMonitorService()
