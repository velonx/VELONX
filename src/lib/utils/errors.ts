import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { ZodError } from "zod";
import { randomUUID } from "crypto";
import { ErrorLogger } from '../services/error-logger.service';
import type { NextRequest } from 'next/server';

/**
 * Base error class for application errors
 */
export class AppError extends Error {
  public readonly requestId?: string;
  
  constructor(
    public statusCode: number,
    public code: string,
    message: string,
    public details?: Record<string, any>,
    requestId?: string
  ) {
    super(message);
    this.name = "AppError";
    this.requestId = requestId;
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Validation error (400 Bad Request)
 */
export class ValidationError extends AppError {
  constructor(message: string, details?: Record<string, any>) {
    super(400, "VALIDATION_ERROR", message, details);
    this.name = "ValidationError";
  }
}

/**
 * Authentication error (401 Unauthorized)
 */
export class AuthenticationError extends AppError {
  constructor(message: string = "Authentication required") {
    super(401, "UNAUTHORIZED", message);
    this.name = "AuthenticationError";
  }
}

/**
 * Authorization error (403 Forbidden)
 */
export class AuthorizationError extends AppError {
  constructor(message: string = "Insufficient permissions") {
    super(403, "FORBIDDEN", message);
    this.name = "AuthorizationError";
  }
}

/**
 * Not found error (404 Not Found)
 */
export class NotFoundError extends AppError {
  constructor(resource: string) {
    super(404, "NOT_FOUND", `${resource} not found`);
    this.name = "NotFoundError";
  }
}

/**
 * Rate limit error (429 Too Many Requests)
 */
export class RateLimitError extends AppError {
  constructor(message: string = "Too many requests") {
    super(429, "RATE_LIMIT_EXCEEDED", message);
    this.name = "RateLimitError";
  }
}

/**
 * Conflict error (409 Conflict)
 */
export class ConflictError extends AppError {
  constructor(message: string, details?: Record<string, any>) {
    super(409, "CONFLICT", message, details);
    this.name = "ConflictError";
  }
}

/**
 * Upload error (500 Internal Server Error)
 */
export class UploadError extends AppError {
  constructor(message: string = "File upload failed", details?: Record<string, any>) {
    super(500, "UPLOAD_FAILED", message, details);
    this.name = "UploadError";
  }
}

/**
 * Network error (503 Service Unavailable)
 */
export class NetworkError extends AppError {
  constructor(message: string = "Network error occurred") {
    super(503, "NETWORK_ERROR", message);
    this.name = "NetworkError";
  }
}

/**
 * File size error (413 Payload Too Large)
 */
export class FileSizeError extends AppError {
  constructor(maxSize: string = "10MB") {
    super(413, "FILE_TOO_LARGE", `File size exceeds maximum allowed size of ${maxSize}`);
    this.name = "FileSizeError";
  }
}

/**
 * Invalid image error (400 Bad Request)
 */
export class InvalidImageError extends AppError {
  constructor(message: string = "Invalid image format") {
    super(400, "INVALID_IMAGE", message);
    this.name = "InvalidImageError";
  }
}

/**
 * Database error (500 Internal Server Error)
 */
export class DatabaseError extends AppError {
  constructor(message: string = "Database operation failed", details?: Record<string, any>) {
    super(500, "DATABASE_ERROR", message, details);
    this.name = "DatabaseError";
  }
}

/**
 * Service unavailable error (503 Service Unavailable)
 */
export class ServiceUnavailableError extends AppError {
  constructor(message: string = "Service temporarily unavailable") {
    super(503, "SERVICE_UNAVAILABLE", message);
    this.name = "ServiceUnavailableError";
  }
}

/**
 * Timeout error (504 Gateway Timeout)
 */
export class TimeoutError extends AppError {
  constructor(message: string = "Request timeout") {
    super(504, "TIMEOUT", message);
    this.name = "TimeoutError";
  }
}

/**
 * Bad gateway error (502 Bad Gateway)
 */
export class BadGatewayError extends AppError {
  constructor(message: string = "Bad gateway") {
    super(502, "BAD_GATEWAY", message);
    this.name = "BadGatewayError";
  }
}

/**
 * Error response interface
 */
interface ErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details?: Record<string, any>;
    requestId: string;
  };
}

/**
 * Sanitize error message to prevent information leakage
 */
function sanitizeErrorMessage(message: string, isProduction: boolean = process.env.NODE_ENV === 'production'): string {
  if (!isProduction) {
    return message;
  }
  
  // In production, sanitize potentially sensitive information
  const sensitivePatterns = [
    /password/gi,
    /token/gi,
    /secret/gi,
    /api[_-]?key/gi,
    /authorization/gi,
    /mongodb:\/\//gi,
    /postgres:\/\//gi,
    /mysql:\/\//gi,
    /redis:\/\//gi,
  ];
  
  let sanitized = message;
  for (const pattern of sensitivePatterns) {
    sanitized = sanitized.replace(pattern, '[REDACTED]');
  }
  
  return sanitized;
}

/**
 * Sanitize error details to prevent information leakage
 */
function sanitizeErrorDetails(details: Record<string, any> | undefined, isProduction: boolean = process.env.NODE_ENV === 'production'): Record<string, any> | undefined {
  if (!details || !isProduction) {
    return details;
  }
  
  const sanitized: Record<string, any> = {};
  const sensitiveKeys = ['password', 'token', 'secret', 'apiKey', 'authorization', 'connectionString'];
  
  for (const [key, value] of Object.entries(details)) {
    if (sensitiveKeys.some(sk => key.toLowerCase().includes(sk.toLowerCase()))) {
      sanitized[key] = '[REDACTED]';
    } else if (typeof value === 'object' && value !== null) {
      sanitized[key] = sanitizeErrorDetails(value as Record<string, any>, isProduction);
    } else {
      sanitized[key] = value;
    }
  }
  
  return sanitized;
}

/**
 * Central error handler for API routes
 * Converts various error types into consistent JSON responses
 */
export function handleError(error: unknown, requestId?: string): NextResponse<ErrorResponse> {
  const errorId = requestId || randomUUID();
  const isProduction = process.env.NODE_ENV === 'production';
  
  // Log detailed error information for debugging
  console.error("=== API Error ===");
  console.error("Request ID:", errorId);
  console.error("Timestamp:", new Date().toISOString());
  console.error("Error:", error);
  
  if (error instanceof Error) {
    console.error("Error Name:", error.name);
    console.error("Error Message:", error.message);
    if (!isProduction) {
      console.error("Error Stack:", error.stack);
    }
  }
  console.error("================");
  
  // Handle custom AppError instances
  if (error instanceof AppError) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: error.code,
          message: sanitizeErrorMessage(error.message, isProduction),
          details: sanitizeErrorDetails(error.details, isProduction),
          requestId: errorId,
        },
      },
      { status: error.statusCode }
    );
  }
  
  // Handle Prisma errors
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    console.error("Prisma Error Code:", error.code);
    console.error("Prisma Error Meta:", error.meta);
    
    // P2002: Unique constraint violation
    if (error.code === "P2002") {
      const target = error.meta?.target as string[] | undefined;
      const field = target ? target[0] : "field";
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "UNIQUE_CONSTRAINT_VIOLATION",
            message: `A record with this ${field} already exists`,
            details: sanitizeErrorDetails({ field: target }, isProduction),
            requestId: errorId,
          },
        },
        { status: 400 }
      );
    }
    
    // P2025: Record not found
    if (error.code === "P2025") {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "NOT_FOUND",
            message: "Record not found",
            requestId: errorId,
          },
        },
        { status: 404 }
      );
    }
    
    // P2003: Foreign key constraint violation
    if (error.code === "P2003") {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "FOREIGN_KEY_VIOLATION",
            message: "Referenced record does not exist",
            details: sanitizeErrorDetails({ field: error.meta?.field_name }, isProduction),
            requestId: errorId,
          },
        },
        { status: 400 }
      );
    }
    
    // Other Prisma errors
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "DATABASE_ERROR",
          message: "A database error occurred. Please try again later.",
          details: isProduction ? undefined : { code: error.code },
          requestId: errorId,
        },
      },
      { status: 500 }
    );
  }
  
  // Handle Prisma connection errors
  if (error instanceof Prisma.PrismaClientInitializationError) {
    console.error("Prisma Initialization Error:", error.message);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "DATABASE_CONNECTION_ERROR",
          message: "Unable to connect to the database. Please try again later.",
          requestId: errorId,
        },
      },
      { status: 503 }
    );
  }
  
  // Handle Prisma validation errors
  if (error instanceof Prisma.PrismaClientValidationError) {
    console.error("Prisma Validation Error:", error.message);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "DATABASE_VALIDATION_ERROR",
          message: "Invalid data provided for database operation.",
          requestId: errorId,
        },
      },
      { status: 400 }
    );
  }
  
  // Handle Zod validation errors
  if (error instanceof ZodError) {
    const formattedErrors = error.issues.map((err) => ({
      field: err.path.join("."),
      message: err.message,
      code: err.code,
    }));
    
    console.error("Validation Errors:", formattedErrors);
    
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "VALIDATION_ERROR",
          message: "Invalid input data. Please check your entries and try again.",
          details: { errors: formattedErrors },
          requestId: errorId,
        },
      },
      { status: 400 }
    );
  }
  
  // Handle standard Error instances
  if (error instanceof Error) {
    // Check for specific error patterns
    const errorMessage = error.message.toLowerCase();
    
    // Network/timeout errors
    if (errorMessage.includes("timeout") || errorMessage.includes("network")) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "NETWORK_ERROR",
            message: "Network error occurred. Please check your connection and try again.",
            requestId: errorId,
          },
        },
        { status: 503 }
      );
    }
    
    // Cloudinary errors
    if (errorMessage.includes("cloudinary")) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "UPLOAD_FAILED",
            message: "Failed to upload image. Please try again or use a different image.",
            requestId: errorId,
          },
        },
        { status: 500 }
      );
    }
    
    // File size errors
    if (errorMessage.includes("file") && errorMessage.includes("large")) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "FILE_TOO_LARGE",
            message: "File size exceeds maximum allowed size of 10MB. Please use a smaller image.",
            requestId: errorId,
          },
        },
        { status: 413 }
      );
    }
    
    // Generic error - sanitize message in production
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "INTERNAL_SERVER_ERROR",
          message: sanitizeErrorMessage(error.message || "An unexpected error occurred. Please try again.", isProduction),
          requestId: errorId,
        },
      },
      { status: 500 }
    );
  }
  
  // Handle unknown error types
  console.error("Unknown error type:", typeof error);
  return NextResponse.json(
    {
      success: false,
      error: {
        code: "INTERNAL_SERVER_ERROR",
        message: "An unexpected error occurred. Please try again.",
        requestId: errorId,
      },
    },
    { status: 500 }
  );
}


/**
 * API Route Handler type
 */
type APIRouteHandler<TContext = any> = (
  request: NextRequest,
  context: TContext
) => Promise<NextResponse> | NextResponse;

/**
 * Wrap API route handler with centralized error handling
 * 
 * Usage:
 * export const GET = withErrorHandler(async (request, context) => {
 *   const { id } = await context.params;
 *   // Your route logic here
 *   return NextResponse.json({ data: 'success' })
 * })
 */
export function withErrorHandler<TContext = any>(handler: APIRouteHandler<TContext>): APIRouteHandler<TContext> {
  return async (request: NextRequest, context: TContext) => {
    const requestId = randomUUID();
    const startTime = Date.now();
    
    try {
      // Add request ID to headers for tracking
      const response = await handler(request, context);
      
      // Add request ID to response headers
      response.headers.set('X-Request-ID', requestId);
      
      // Log slow requests
      const duration = Date.now() - startTime;
      if (duration > 2000) {
        const url = new URL(request.url);
        ErrorLogger.warning(
          'SLOW_REQUEST',
          `Request took ${duration}ms`,
          undefined,
          {
            requestId,
            request,
            context: {
              endpoint: url.pathname,
              method: request.method,
              duration,
            },
          }
        );
      }
      
      return response;
    } catch (error) {
      // Log the error with context
      const url = new URL(request.url);
      const severity = error instanceof AppError && error.statusCode < 500 ? 'warning' : 'error';
      
      ErrorLogger.log(
        error instanceof AppError ? error.code : 'UNHANDLED_ERROR',
        error instanceof Error ? error.message : 'An unexpected error occurred',
        error instanceof Error ? error : undefined,
        {
          severity,
          requestId,
          request,
          context: {
            endpoint: url.pathname,
            method: request.method,
            duration: Date.now() - startTime,
          },
        }
      );
      
      // Return error response
      const response = handleError(error, requestId);
      response.headers.set('X-Request-ID', requestId);
      return response;
    }
  };
}

/**
 * Async wrapper for API route handlers (alternative syntax)
 * 
 * Usage:
 * export const GET = asyncHandler(async (request) => {
 *   // Your route logic here
 *   return NextResponse.json({ data: 'success' })
 * })
 */
export const asyncHandler = withErrorHandler;
