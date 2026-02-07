/**
 * Error Logging Service
 * Provides structured error logging with severity categorization
 * Integrates with audit logger for critical errors
 */

import { AuditLogger } from './audit.service'
import { AlertService } from './alert.service'
import type { NextRequest } from 'next/server'

export type ErrorSeverity = 'info' | 'warning' | 'error' | 'critical'

export interface ErrorLogEntry {
  severity: ErrorSeverity
  code: string
  message: string
  error?: Error
  context?: Record<string, any>
  requestId?: string
  userId?: string
  ipAddress?: string
  userAgent?: string
  endpoint?: string
  method?: string
  timestamp: Date
}

export interface ErrorLogOptions {
  severity?: ErrorSeverity
  context?: Record<string, any>
  requestId?: string
  userId?: string
  request?: NextRequest | Request
}

/**
 * Error Logger Service
 */
export class ErrorLogger {
  /**
   * Log an error with structured information
   */
  static log(
    code: string,
    message: string,
    error?: Error,
    options: ErrorLogOptions = {}
  ): void {
    const {
      severity = 'error',
      context = {},
      requestId,
      userId,
      request,
    } = options

    const entry: ErrorLogEntry = {
      severity,
      code,
      message,
      error,
      context,
      requestId,
      userId,
      timestamp: new Date(),
    }

    // Extract request information if available
    if (request) {
      entry.ipAddress = this.getClientIP(request)
      entry.userAgent = this.getUserAgent(request)
      entry.endpoint = this.getEndpoint(request)
      entry.method = request.method
    }

    // Log to console with appropriate level
    this.logToConsole(entry)

    // For critical errors, also log to audit system and send alerts
    if (severity === 'critical') {
      if (request) {
        this.logToAudit(entry, request).catch((err) => {
          console.error('[Error Logger] Failed to log to audit system:', err)
        })
      }
      
      // Send alert for critical errors
      AlertService.sendAlert(entry).catch((err) => {
        console.error('[Error Logger] Failed to send alert:', err)
      })
    }
  }

  /**
   * Log info level message
   */
  static info(
    code: string,
    message: string,
    options: ErrorLogOptions = {}
  ): void {
    this.log(code, message, undefined, { ...options, severity: 'info' })
  }

  /**
   * Log warning level message
   */
  static warning(
    code: string,
    message: string,
    error?: Error,
    options: ErrorLogOptions = {}
  ): void {
    this.log(code, message, error, { ...options, severity: 'warning' })
  }

  /**
   * Log error level message
   */
  static error(
    code: string,
    message: string,
    error?: Error,
    options: ErrorLogOptions = {}
  ): void {
    this.log(code, message, error, { ...options, severity: 'error' })
  }

  /**
   * Log critical level message
   */
  static critical(
    code: string,
    message: string,
    error?: Error,
    options: ErrorLogOptions = {}
  ): void {
    this.log(code, message, error, { ...options, severity: 'critical' })
  }

  /**
   * Log to console with structured format
   */
  private static logToConsole(entry: ErrorLogEntry): void {
    const logPrefix = `[${entry.severity.toUpperCase()}]`
    const timestamp = entry.timestamp.toISOString()
    const requestInfo = entry.requestId ? ` [Request: ${entry.requestId}]` : ''
    const userInfo = entry.userId ? ` [User: ${entry.userId}]` : ''
    
    const logMessage = `${logPrefix} ${timestamp}${requestInfo}${userInfo} [${entry.code}] ${entry.message}`

    // Choose console method based on severity
    switch (entry.severity) {
      case 'info':
        console.info(logMessage)
        break
      case 'warning':
        console.warn(logMessage)
        break
      case 'error':
      case 'critical':
        console.error(logMessage)
        break
    }

    // Log additional context if available
    if (Object.keys(entry.context || {}).length > 0) {
      console.log('Context:', entry.context)
    }

    // Log error details if available
    if (entry.error) {
      console.error('Error Details:', {
        name: entry.error.name,
        message: entry.error.message,
        stack: entry.error.stack,
      })
    }

    // Log request details if available
    if (entry.endpoint) {
      console.log('Request:', {
        method: entry.method,
        endpoint: entry.endpoint,
        ipAddress: entry.ipAddress,
        userAgent: entry.userAgent,
      })
    }
  }

  /**
   * Log critical errors to audit system
   */
  private static async logToAudit(
    entry: ErrorLogEntry,
    request: NextRequest | Request
  ): Promise<void> {
    try {
      await AuditLogger.logFromRequest(
        request,
        'CRITICAL_ERROR',
        entry.code,
        'failure',
        entry.userId,
        {
          message: entry.message,
          errorName: entry.error?.name,
          errorMessage: entry.error?.message,
          context: entry.context,
          requestId: entry.requestId,
        }
      )
    } catch (error) {
      // Silently fail - we don't want audit logging to break error logging
      console.error('[Error Logger] Failed to log to audit:', error)
    }
  }

  /**
   * Extract client IP address from request
   */
  private static getClientIP(request: NextRequest | Request): string {
    if ('headers' in request && typeof request.headers.get === 'function') {
      const forwardedFor = request.headers.get('x-forwarded-for')
      const realIp = request.headers.get('x-real-ip')
      const cfConnectingIp = request.headers.get('cf-connecting-ip')

      if (forwardedFor) {
        return forwardedFor.split(',')[0].trim()
      }

      if (realIp) {
        return realIp
      }

      if (cfConnectingIp) {
        return cfConnectingIp
      }
    }

    return 'unknown'
  }

  /**
   * Extract user agent from request
   */
  private static getUserAgent(request: NextRequest | Request): string {
    if ('headers' in request && typeof request.headers.get === 'function') {
      return request.headers.get('user-agent') || 'unknown'
    }

    return 'unknown'
  }

  /**
   * Extract endpoint from request
   */
  private static getEndpoint(request: NextRequest | Request): string {
    if ('url' in request) {
      try {
        const url = new URL(request.url)
        return url.pathname
      } catch {
        return 'unknown'
      }
    }

    return 'unknown'
  }
}

/**
 * Helper functions for common error logging scenarios
 */

/**
 * Log database connection error
 */
export function logDatabaseConnectionError(
  error: Error,
  options: ErrorLogOptions = {}
): void {
  ErrorLogger.critical(
    'DATABASE_CONNECTION_ERROR',
    'Failed to connect to database',
    error,
    options
  )
}

/**
 * Log database query error
 */
export function logDatabaseQueryError(
  query: string,
  error: Error,
  options: ErrorLogOptions = {}
): void {
  ErrorLogger.error(
    'DATABASE_QUERY_ERROR',
    'Database query failed',
    error,
    {
      ...options,
      context: {
        ...options.context,
        query: query.substring(0, 200), // Truncate long queries
      },
    }
  )
}

/**
 * Log authentication error
 */
export function logAuthenticationError(
  reason: string,
  options: ErrorLogOptions = {}
): void {
  ErrorLogger.warning(
    'AUTHENTICATION_ERROR',
    `Authentication failed: ${reason}`,
    undefined,
    options
  )
}

/**
 * Log authorization error
 */
export function logAuthorizationError(
  resource: string,
  action: string,
  options: ErrorLogOptions = {}
): void {
  ErrorLogger.warning(
    'AUTHORIZATION_ERROR',
    `Unauthorized access attempt to ${resource} (${action})`,
    undefined,
    {
      ...options,
      context: {
        ...options.context,
        resource,
        action,
      },
    }
  )
}

/**
 * Log validation error
 */
export function logValidationError(
  fields: string[],
  options: ErrorLogOptions = {}
): void {
  ErrorLogger.info(
    'VALIDATION_ERROR',
    `Validation failed for fields: ${fields.join(', ')}`,
    undefined,
    {
      ...options,
      context: {
        ...options.context,
        fields,
      },
    }
  )
}

/**
 * Log rate limit exceeded
 */
export function logRateLimitExceeded(
  identifier: string,
  endpoint: string,
  options: ErrorLogOptions = {}
): void {
  ErrorLogger.warning(
    'RATE_LIMIT_EXCEEDED',
    `Rate limit exceeded for ${identifier} on ${endpoint}`,
    undefined,
    {
      ...options,
      context: {
        ...options.context,
        identifier,
        endpoint,
      },
    }
  )
}

/**
 * Log external service error
 */
export function logExternalServiceError(
  service: string,
  error: Error,
  options: ErrorLogOptions = {}
): void {
  ErrorLogger.error(
    'EXTERNAL_SERVICE_ERROR',
    `External service error: ${service}`,
    error,
    {
      ...options,
      context: {
        ...options.context,
        service,
      },
    }
  )
}

/**
 * Log file upload error
 */
export function logFileUploadError(
  filename: string,
  error: Error,
  options: ErrorLogOptions = {}
): void {
  ErrorLogger.error(
    'FILE_UPLOAD_ERROR',
    `File upload failed: ${filename}`,
    error,
    {
      ...options,
      context: {
        ...options.context,
        filename,
      },
    }
  )
}

/**
 * Log cache error
 */
export function logCacheError(
  operation: string,
  key: string,
  error: Error,
  options: ErrorLogOptions = {}
): void {
  ErrorLogger.warning(
    'CACHE_ERROR',
    `Cache ${operation} failed for key: ${key}`,
    error,
    {
      ...options,
      context: {
        ...options.context,
        operation,
        key,
      },
    }
  )
}

/**
 * Log slow query warning
 */
export function logSlowQuery(
  query: string,
  duration: number,
  options: ErrorLogOptions = {}
): void {
  ErrorLogger.warning(
    'SLOW_QUERY',
    `Slow query detected (${duration}ms)`,
    undefined,
    {
      ...options,
      context: {
        ...options.context,
        query: query.substring(0, 200),
        duration,
      },
    }
  )
}

/**
 * Log slow request warning
 */
export function logSlowRequest(
  endpoint: string,
  method: string,
  duration: number,
  options: ErrorLogOptions = {}
): void {
  ErrorLogger.warning(
    'SLOW_REQUEST',
    `Slow request detected: ${method} ${endpoint} (${duration}ms)`,
    undefined,
    {
      ...options,
      context: {
        ...options.context,
        endpoint,
        method,
        duration,
      },
    }
  )
}
