/**
 * API Route Helpers
 * Utilities for building secure and validated API routes
 */

import { NextRequest, NextResponse } from 'next/server'
import { ZodSchema } from 'zod'
import { validateRequest } from '@/lib/middleware/validation.middleware'
import { AuditLogger } from '@/lib/services/audit.service'
import { auth } from '@/auth'

/**
 * API Handler options
 */
interface ApiHandlerOptions<TBody = any, TQuery = any> {
  bodySchema?: ZodSchema<TBody>
  querySchema?: ZodSchema<TQuery>
  requireAuth?: boolean
  requireAdmin?: boolean
  auditAction?: string
  auditResource?: string
}

/**
 * API Handler context
 */
interface ApiHandlerContext<TBody = any, TQuery = any> {
  request: NextRequest
  body?: TBody
  query?: TQuery
  session?: any
  userId?: string
}

/**
 * Create a validated and secured API handler
 * 
 * Usage:
 * export const POST = createApiHandler({
 *   bodySchema: mySchema,
 *   requireAuth: true,
 *   auditAction: 'CREATE',
 *   auditResource: 'PROJECT',
 * }, async (ctx) => {
 *   const { body, userId } = ctx
 *   // Your handler logic here
 *   return NextResponse.json({ success: true, data: result })
 * })
 */
export function createApiHandler<TBody = any, TQuery = any>(
  options: ApiHandlerOptions<TBody, TQuery>,
  handler: (ctx: ApiHandlerContext<TBody, TQuery>) => Promise<NextResponse>
) {
  return async (request: NextRequest, routeParams?: any): Promise<NextResponse> => {
    try {
      // 1. Validate request data
      if (options.bodySchema || options.querySchema) {
        const validationResult = await validateRequest(request, {
          body: options.bodySchema,
          query: options.querySchema,
        })
        
        if (!validationResult.success) {
          // Log validation failure
          if (options.auditAction && options.auditResource) {
            await AuditLogger.logFromRequest(
              request,
              options.auditAction,
              options.auditResource,
              'failure',
              undefined,
              { reason: 'VALIDATION_ERROR' }
            )
          }
          
          return NextResponse.json(validationResult.error, { status: 400 })
        }
        
        // 2. Check authentication if required
        let session = null
        if (options.requireAuth || options.requireAdmin) {
          session = await auth()
          
          if (!session?.user) {
            // Log unauthorized access
            if (options.auditAction && options.auditResource) {
              await AuditLogger.logAuthorizationFailure(
                request,
                options.auditAction,
                options.auditResource,
                undefined,
                { reason: 'NOT_AUTHENTICATED' }
              )
            }
            
            return NextResponse.json(
              {
                success: false,
                error: {
                  code: 'UNAUTHORIZED',
                  message: 'Authentication required',
                },
              },
              { status: 401 }
            )
          }
          
          // Check admin role if required
          if (options.requireAdmin && session.user.role !== 'ADMIN') {
            // Log unauthorized access
            if (options.auditAction && options.auditResource) {
              await AuditLogger.logAuthorizationFailure(
                request,
                options.auditAction,
                options.auditResource,
                session.user.id,
                { reason: 'INSUFFICIENT_PERMISSIONS' }
              )
            }
            
            return NextResponse.json(
              {
                success: false,
                error: {
                  code: 'FORBIDDEN',
                  message: 'Admin access required',
                },
              },
              { status: 403 }
            )
          }
        }
        
        // 3. Execute handler
        const context: ApiHandlerContext<TBody, TQuery> = {
          request,
          body: validationResult.data.body,
          query: validationResult.data.query,
          session,
          userId: session?.user?.id,
        }
        
        const response = await handler(context)
        
        // 4. Log successful operation
        if (options.auditAction && options.auditResource && response.status < 400) {
          await AuditLogger.logFromRequest(
            request,
            options.auditAction,
            options.auditResource,
            'success',
            session?.user?.id
          )
        }
        
        return response
      } else {
        // No validation required, just check auth
        let session = null
        if (options.requireAuth || options.requireAdmin) {
          session = await auth()
          
          if (!session?.user) {
            if (options.auditAction && options.auditResource) {
              await AuditLogger.logAuthorizationFailure(
                request,
                options.auditAction,
                options.auditResource,
                undefined,
                { reason: 'NOT_AUTHENTICATED' }
              )
            }
            
            return NextResponse.json(
              {
                success: false,
                error: {
                  code: 'UNAUTHORIZED',
                  message: 'Authentication required',
                },
              },
              { status: 401 }
            )
          }
          
          if (options.requireAdmin && session.user.role !== 'ADMIN') {
            if (options.auditAction && options.auditResource) {
              await AuditLogger.logAuthorizationFailure(
                request,
                options.auditAction,
                options.auditResource,
                session.user.id,
                { reason: 'INSUFFICIENT_PERMISSIONS' }
              )
            }
            
            return NextResponse.json(
              {
                success: false,
                error: {
                  code: 'FORBIDDEN',
                  message: 'Admin access required',
                },
              },
              { status: 403 }
            )
          }
        }
        
        const context: ApiHandlerContext<TBody, TQuery> = {
          request,
          session,
          userId: session?.user?.id,
        }
        
        const response = await handler(context)
        
        if (options.auditAction && options.auditResource && response.status < 400) {
          await AuditLogger.logFromRequest(
            request,
            options.auditAction,
            options.auditResource,
            'success',
            session?.user?.id
          )
        }
        
        return response
      }
    } catch (error) {
      console.error('[API Handler] Error:', error)
      
      // Log error
      if (options.auditAction && options.auditResource) {
        try {
          await AuditLogger.logFromRequest(
            request,
            options.auditAction,
            options.auditResource,
            'failure',
            undefined,
            {
              error: error instanceof Error ? error.message : 'Unknown error',
            }
          )
        } catch (auditError) {
          console.error('[API Handler] Failed to log error:', auditError)
        }
      }
      
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'INTERNAL_SERVER_ERROR',
            message: 'An unexpected error occurred',
          },
        },
        { status: 500 }
      )
    }
  }
}

/**
 * Success response helper
 */
export function successResponse<T>(data: T, status = 200): NextResponse {
  return NextResponse.json(
    {
      success: true,
      data,
    },
    { status }
  )
}

/**
 * Error response helper
 */
export function errorResponse(
  code: string,
  message: string,
  status = 400,
  details?: any
): NextResponse {
  return NextResponse.json(
    {
      success: false,
      error: {
        code,
        message,
        ...(details && { details }),
      },
    },
    { status }
  )
}
