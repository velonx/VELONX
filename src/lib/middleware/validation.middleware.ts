/**
 * Input Validation Middleware
 * Validates and sanitizes request data using Zod schemas
 */

import { NextRequest, NextResponse } from 'next/server'
import { z, ZodSchema, ZodError } from 'zod'

/**
 * Validation error response
 */
interface ValidationErrorResponse {
  success: false
  error: {
    code: string
    message: string
    details: Array<{
      field: string
      message: string
    }>
  }
}

/**
 * Sanitize string input to prevent XSS attacks
 */
export function sanitizeString(input: string): string {
  // Remove potentially dangerous characters and patterns
  return input
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '') // Remove script tags
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '') // Remove iframe tags
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+\s*=/gi, '') // Remove event handlers (onclick, onload, etc.)
    .trim()
}

/**
 * Recursively sanitize all string values in an object
 */
export function sanitizeObject<T extends Record<string, any>>(obj: T): T {
  const sanitized: any = {}
  
  for (const [key, value] of Object.entries(obj)) {
    if (typeof value === 'string') {
      sanitized[key] = sanitizeString(value)
    } else if (Array.isArray(value)) {
      sanitized[key] = value.map(item =>
        typeof item === 'string'
          ? sanitizeString(item)
          : typeof item === 'object' && item !== null
          ? sanitizeObject(item)
          : item
      )
    } else if (typeof value === 'object' && value !== null) {
      sanitized[key] = sanitizeObject(value)
    } else {
      sanitized[key] = value
    }
  }
  
  return sanitized as T
}

/**
 * Parse and validate request body
 */
export async function parseAndValidateBody<T>(
  request: NextRequest,
  schema: ZodSchema<T>
): Promise<{ success: true; data: T } | { success: false; error: ValidationErrorResponse['error'] }> {
  try {
    // Parse request body
    const body = await request.json()
    
    // Sanitize input
    const sanitized = sanitizeObject(body)
    
    // Validate with schema
    const validated = schema.parse(sanitized)
    
    return {
      success: true,
      data: validated,
    }
  } catch (error) {
    if (error instanceof ZodError) {
      // Format Zod validation errors
      const details = (error as any).errors.map((err: any) => ({
        field: err.path.join('.'),
        message: err.message,
      }))
      
      return {
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid request data',
          details,
        },
      }
    }
    
    // Handle JSON parsing errors
    return {
      success: false,
      error: {
        code: 'INVALID_JSON',
        message: 'Invalid JSON in request body',
        details: [],
      },
    }
  }
}

/**
 * Parse and validate query parameters
 */
export function parseAndValidateQuery<T>(
  request: NextRequest,
  schema: ZodSchema<T>
): { success: true; data: T } | { success: false; error: ValidationErrorResponse['error'] } {
  try {
    // Extract query parameters
    const searchParams = request.nextUrl.searchParams
    const query: Record<string, any> = {}
    
    searchParams.forEach((value, key) => {
      // Handle array parameters (e.g., ?tags=a&tags=b)
      if (query[key]) {
        if (Array.isArray(query[key])) {
          query[key].push(value)
        } else {
          query[key] = [query[key], value]
        }
      } else {
        query[key] = value
      }
    })
    
    // Sanitize input
    const sanitized = sanitizeObject(query)
    
    // Validate with schema
    const validated = schema.parse(sanitized)
    
    return {
      success: true,
      data: validated,
    }
  } catch (error) {
    if (error instanceof ZodError) {
      // Format Zod validation errors
      const details = (error as any).errors.map((err: any) => ({
        field: err.path.join('.'),
        message: err.message,
      }))
      
      return {
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid query parameters',
          details,
        },
      }
    }
    
    return {
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Failed to validate query parameters',
        details: [],
      },
    }
  }
}

/**
 * Validation middleware wrapper for API routes
 * Usage in API route:
 * 
 * const result = await validateRequest(request, {
 *   body: myBodySchema,
 *   query: myQuerySchema,
 * })
 * 
 * if (!result.success) {
 *   return NextResponse.json(result.error, { status: 400 })
 * }
 * 
 * const { body, query } = result.data
 */
export async function validateRequest<
  TBody = any,
  TQuery = any
>(
  request: NextRequest,
  schemas: {
    body?: ZodSchema<TBody>
    query?: ZodSchema<TQuery>
  }
): Promise<
  | { success: true; data: { body?: TBody; query?: TQuery } }
  | { success: false; error: ValidationErrorResponse }
> {
  const result: { body?: TBody; query?: TQuery } = {}
  
  // Validate body if schema provided
  if (schemas.body) {
    const bodyResult = await parseAndValidateBody(request, schemas.body)
    
    if (!bodyResult.success) {
      return {
        success: false,
        error: {
          success: false,
          error: bodyResult.error,
        },
      }
    }
    
    result.body = bodyResult.data
  }
  
  // Validate query if schema provided
  if (schemas.query) {
    const queryResult = parseAndValidateQuery(request, schemas.query)
    
    if (!queryResult.success) {
      return {
        success: false,
        error: {
          success: false,
          error: queryResult.error,
        },
      }
    }
    
    result.query = queryResult.data
  }
  
  return {
    success: true,
    data: result,
  }
}

/**
 * Common validation schemas
 */
export const commonSchemas = {
  // Pagination
  pagination: z.object({
    page: z.coerce.number().int().positive().default(1),
    pageSize: z.coerce.number().int().positive().max(100).default(20),
  }),
  
  // ID parameter
  id: z.object({
    id: z.string().min(1, 'ID is required'),
  }),
  
  // Email
  email: z.string().email('Invalid email address'),
  
  // Password (minimum requirements)
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
  
  // URL
  url: z.string().url('Invalid URL'),
  
  // Date string
  dateString: z.string().datetime('Invalid date format'),
  
  // MongoDB ObjectId
  objectId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid ObjectId'),
}

/**
 * Create a validation error response
 */
export function createValidationErrorResponse(
  message: string,
  details: Array<{ field: string; message: string }> = []
): NextResponse {
  return NextResponse.json(
    {
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message,
        details,
      },
    },
    { status: 400 }
  )
}
