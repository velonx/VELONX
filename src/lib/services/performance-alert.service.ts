/**
 * Performance Alert Service
 * Detects and alerts on performance issues
 */

import { alertService } from '@/lib/services/alert.service'

/**
 * Performance thresholds
 */
export const PERFORMANCE_THRESHOLDS = {
  SLOW_REQUEST: 2000, // 2 seconds
  SLOW_QUERY: 1000, // 1 second
  HIGH_ERROR_RATE: 5, // 5%
  LOW_CACHE_HIT_RATE: 50, // 50%
}

/**
 * Performance alert types
 */
export enum PerformanceAlertType {
  SLOW_REQUEST = 'slow_request',
  SLOW_QUERY = 'slow_query',
  HIGH_ERROR_RATE = 'high_error_rate',
  LOW_CACHE_HIT_RATE = 'low_cache_hit_rate',
}

/**
 * Performance alert data
 */
export interface PerformanceAlert {
  type: PerformanceAlertType
  severity: 'warning' | 'critical'
  message: string
  metadata: Record<string, any>
  timestamp: Date
}

/**
 * Performance Alert Service
 */
export class PerformanceAlertService {
  /**
   * Check for slow request and alert if necessary
   */
  async checkSlowRequest(
    endpoint: string,
    method: string,
    duration: number
  ): Promise<void> {
    if (duration > PERFORMANCE_THRESHOLDS.SLOW_REQUEST) {
      const severity = duration > PERFORMANCE_THRESHOLDS.SLOW_REQUEST * 2 ? 'critical' : 'warning'
      
      const alert: PerformanceAlert = {
        type: PerformanceAlertType.SLOW_REQUEST,
        severity,
        message: `Slow request detected: ${method} ${endpoint} took ${duration}ms`,
        metadata: {
          endpoint,
          method,
          duration,
          threshold: PERFORMANCE_THRESHOLDS.SLOW_REQUEST,
        },
        timestamp: new Date(),
      }
      
      await this.sendAlert(alert)
    }
  }

  /**
   * Check for slow query and alert if necessary
   */
  async checkSlowQuery(
    model: string,
    action: string,
    duration: number
  ): Promise<void> {
    if (duration > PERFORMANCE_THRESHOLDS.SLOW_QUERY) {
      const severity = duration > PERFORMANCE_THRESHOLDS.SLOW_QUERY * 2 ? 'critical' : 'warning'
      
      const alert: PerformanceAlert = {
        type: PerformanceAlertType.SLOW_QUERY,
        severity,
        message: `Slow database query detected: ${model}.${action} took ${duration}ms`,
        metadata: {
          model,
          action,
          duration,
          threshold: PERFORMANCE_THRESHOLDS.SLOW_QUERY,
        },
        timestamp: new Date(),
      }
      
      await this.sendAlert(alert)
    }
  }

  /**
   * Check error rate and alert if necessary
   */
  async checkErrorRate(
    endpoint: string,
    errorRate: number,
    requestCount: number
  ): Promise<void> {
    if (errorRate > PERFORMANCE_THRESHOLDS.HIGH_ERROR_RATE && requestCount > 10) {
      const severity = errorRate > PERFORMANCE_THRESHOLDS.HIGH_ERROR_RATE * 2 ? 'critical' : 'warning'
      
      const alert: PerformanceAlert = {
        type: PerformanceAlertType.HIGH_ERROR_RATE,
        severity,
        message: `High error rate detected: ${endpoint} has ${errorRate.toFixed(2)}% error rate`,
        metadata: {
          endpoint,
          errorRate,
          requestCount,
          threshold: PERFORMANCE_THRESHOLDS.HIGH_ERROR_RATE,
        },
        timestamp: new Date(),
      }
      
      await this.sendAlert(alert)
    }
  }

  /**
   * Check cache hit rate and alert if necessary
   */
  async checkCacheHitRate(hitRate: number, totalOperations: number): Promise<void> {
    if (hitRate < PERFORMANCE_THRESHOLDS.LOW_CACHE_HIT_RATE && totalOperations > 100) {
      const alert: PerformanceAlert = {
        type: PerformanceAlertType.LOW_CACHE_HIT_RATE,
        severity: 'warning',
        message: `Low cache hit rate detected: ${hitRate.toFixed(2)}%`,
        metadata: {
          hitRate,
          totalOperations,
          threshold: PERFORMANCE_THRESHOLDS.LOW_CACHE_HIT_RATE,
        },
        timestamp: new Date(),
      }
      
      await this.sendAlert(alert)
    }
  }

  /**
   * Send performance alert
   */
  private async sendAlert(alert: PerformanceAlert): Promise<void> {
    try {
      // Log the alert
      if (alert.severity === 'critical') {
        console.error(`[Performance Alert] ${alert.message}`, alert.metadata)
      } else {
        console.warn(`[Performance Alert] ${alert.message}`, alert.metadata)
      }
      
      // Send alert through alert service for critical issues
      if (alert.severity === 'critical') {
        await alertService.sendAlert({
          subject: `Performance Alert: ${alert.type}`,
          message: alert.message,
          severity: 'high',
          metadata: alert.metadata,
        })
      }
    } catch (error) {
      console.error('[Performance Alert] Error sending alert:', error)
    }
  }

  /**
   * Get performance alert summary
   */
  getAlertThresholds() {
    return PERFORMANCE_THRESHOLDS
  }
}

// Export singleton instance
export const performanceAlertService = new PerformanceAlertService()
