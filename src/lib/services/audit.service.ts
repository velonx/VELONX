/**
 * Audit Logging Service
 * Tracks security-relevant events for compliance and security monitoring
 */

import { prisma } from '@/lib/prisma'
import type { NextRequest } from 'next/server'

export interface AuditLogEntry {
  userId?: string
  action: string
  resource: string
  ipAddress: string
  userAgent: string
  result: 'success' | 'failure'
  metadata?: Record<string, any>
}

export interface AuditLogFilters {
  userId?: string
  action?: string
  resource?: string
  result?: 'success' | 'failure'
  startDate?: Date
  endDate?: Date
  page?: number
  pageSize?: number
}

/**
 * Extract client IP address from request
 */
function getClientIP(request: NextRequest | Request): string {
  // Try various headers in order of preference
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
function getUserAgent(request: NextRequest | Request): string {
  if ('headers' in request && typeof request.headers.get === 'function') {
    return request.headers.get('user-agent') || 'unknown'
  }
  
  return 'unknown'
}

/**
 * Audit Logger Service
 */
export class AuditLogger {
  /**
   * Log a security event
   */
  static async log(entry: AuditLogEntry): Promise<void> {
    try {
      await prisma.auditLog.create({
        data: {
          userId: entry.userId,
          action: entry.action,
          resource: entry.resource,
          ipAddress: entry.ipAddress,
          userAgent: entry.userAgent,
          result: entry.result,
          metadata: entry.metadata || {},
        },
      })
    } catch (error) {
      // Log to console if database logging fails
      console.error('[Audit Logger] Failed to log event:', error)
      console.error('[Audit Logger] Event details:', entry)
    }
  }

  /**
   * Log event from a Next.js request
   */
  static async logFromRequest(
    request: NextRequest | Request,
    action: string,
    resource: string,
    result: 'success' | 'failure',
    userId?: string,
    metadata?: Record<string, any>
  ): Promise<void> {
    const ipAddress = getClientIP(request)
    const userAgent = getUserAgent(request)
    
    await this.log({
      userId,
      action,
      resource,
      ipAddress,
      userAgent,
      result,
      metadata,
    })
  }

  /**
   * Log authentication event
   */
  static async logAuth(
    request: NextRequest | Request,
    action: 'LOGIN' | 'LOGOUT' | 'SIGNUP' | 'PASSWORD_RESET',
    result: 'success' | 'failure',
    userId?: string,
    metadata?: Record<string, any>
  ): Promise<void> {
    await this.logFromRequest(request, action, 'AUTH', result, userId, metadata)
  }

  /**
   * Log authorization failure
   */
  static async logAuthorizationFailure(
    request: NextRequest | Request,
    action: string,
    resource: string,
    userId?: string,
    metadata?: Record<string, any>
  ): Promise<void> {
    await this.logFromRequest(request, action, resource, 'failure', userId, {
      ...metadata,
      reason: 'UNAUTHORIZED',
    })
  }

  /**
   * Log data access
   */
  static async logDataAccess(
    request: NextRequest | Request,
    resource: string,
    resourceId: string,
    userId?: string,
    metadata?: Record<string, any>
  ): Promise<void> {
    await this.logFromRequest(request, 'ACCESS', resource, 'success', userId, {
      ...metadata,
      resourceId,
    })
  }

  /**
   * Log data modification
   */
  static async logDataModification(
    request: NextRequest | Request,
    action: 'CREATE' | 'UPDATE' | 'DELETE',
    resource: string,
    resourceId: string,
    result: 'success' | 'failure',
    userId?: string,
    metadata?: Record<string, any>
  ): Promise<void> {
    await this.logFromRequest(request, action, resource, result, userId, {
      ...metadata,
      resourceId,
    })
  }

  /**
   * Log security event (CSRF, rate limit, etc.)
   */
  static async logSecurityEvent(
    request: NextRequest | Request,
    event: 'CSRF_FAILURE' | 'RATE_LIMIT_EXCEEDED' | 'BRUTE_FORCE_DETECTED' | 'INVALID_TOKEN',
    userId?: string,
    metadata?: Record<string, any>
  ): Promise<void> {
    await this.logFromRequest(request, event, 'SECURITY', 'failure', userId, metadata)
  }

  /**
   * Query audit logs with filters
   */
  static async query(filters: AuditLogFilters = {}) {
    const {
      userId,
      action,
      resource,
      result,
      startDate,
      endDate,
      page = 1,
      pageSize = 50,
    } = filters

    const where: any = {}

    if (userId) {
      where.userId = userId
    }

    if (action) {
      where.action = action
    }

    if (resource) {
      where.resource = resource
    }

    if (result) {
      where.result = result
    }

    if (startDate || endDate) {
      where.timestamp = {}
      if (startDate) {
        where.timestamp.gte = startDate
      }
      if (endDate) {
        where.timestamp.lte = endDate
      }
    }

    const [logs, total] = await Promise.all([
      prisma.auditLog.findMany({
        where,
        orderBy: { timestamp: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      prisma.auditLog.count({ where }),
    ])

    return {
      logs,
      pagination: {
        page,
        pageSize,
        total,
        totalPages: Math.ceil(total / pageSize),
      },
    }
  }

  /**
   * Get audit log statistics
   */
  static async getStats(startDate?: Date, endDate?: Date) {
    const where: any = {}

    if (startDate || endDate) {
      where.timestamp = {}
      if (startDate) {
        where.timestamp.gte = startDate
      }
      if (endDate) {
        where.timestamp.lte = endDate
      }
    }

    const [
      totalEvents,
      successfulEvents,
      failedEvents,
      uniqueUsers,
      topActions,
      topResources,
    ] = await Promise.all([
      prisma.auditLog.count({ where }),
      prisma.auditLog.count({ where: { ...where, result: 'success' } }),
      prisma.auditLog.count({ where: { ...where, result: 'failure' } }),
      prisma.auditLog.findMany({
        where,
        select: { userId: true },
        distinct: ['userId'],
      }),
      prisma.auditLog.groupBy({
        by: ['action'],
        where,
        _count: { action: true },
        orderBy: { _count: { action: 'desc' } },
        take: 10,
      }),
      prisma.auditLog.groupBy({
        by: ['resource'],
        where,
        _count: { resource: true },
        orderBy: { _count: { resource: 'desc' } },
        take: 10,
      }),
    ])

    return {
      totalEvents,
      successfulEvents,
      failedEvents,
      uniqueUsers: uniqueUsers.length,
      topActions: topActions.map(a => ({
        action: a.action,
        count: a._count.action,
      })),
      topResources: topResources.map(r => ({
        resource: r.resource,
        count: r._count.resource,
      })),
    }
  }

  /**
   * Clean up old audit logs (for data retention compliance)
   */
  static async cleanup(olderThan: Date): Promise<number> {
    try {
      const result = await prisma.auditLog.deleteMany({
        where: {
          timestamp: {
            lt: olderThan,
          },
        },
      })

      return result.count
    } catch (error) {
      console.error('[Audit Logger] Failed to cleanup old logs:', error)
      return 0
    }
  }
}

/**
 * Helper functions for common audit logging scenarios
 */

export async function logSuccessfulLogin(
  request: NextRequest | Request,
  userId: string,
  email: string
): Promise<void> {
  await AuditLogger.logAuth(request, 'LOGIN', 'success', userId, { email })
}

export async function logFailedLogin(
  request: NextRequest | Request,
  email: string,
  reason: string
): Promise<void> {
  await AuditLogger.logAuth(request, 'LOGIN', 'failure', undefined, {
    email,
    reason,
  })
}

export async function logSignup(
  request: NextRequest | Request,
  userId: string,
  email: string
): Promise<void> {
  await AuditLogger.logAuth(request, 'SIGNUP', 'success', userId, { email })
}

export async function logLogout(
  request: NextRequest | Request,
  userId: string
): Promise<void> {
  await AuditLogger.logAuth(request, 'LOGOUT', 'success', userId)
}

export async function logUnauthorizedAccess(
  request: NextRequest | Request,
  resource: string,
  action: string,
  userId?: string
): Promise<void> {
  await AuditLogger.logAuthorizationFailure(request, action, resource, userId)
}

export async function logCSRFFailure(
  request: NextRequest | Request,
  userId?: string
): Promise<void> {
  await AuditLogger.logSecurityEvent(request, 'CSRF_FAILURE', userId)
}

export async function logRateLimitExceeded(
  request: NextRequest | Request,
  userId?: string
): Promise<void> {
  await AuditLogger.logSecurityEvent(request, 'RATE_LIMIT_EXCEEDED', userId)
}

export async function logBruteForceDetected(
  request: NextRequest | Request,
  email: string
): Promise<void> {
  await AuditLogger.logSecurityEvent(request, 'BRUTE_FORCE_DETECTED', undefined, {
    email,
  })
}
