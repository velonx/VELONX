# Centralized Error Handling Guide

## Overview

The VELONX platform now has a comprehensive centralized error handling system that provides:

- **Consistent error responses** across all API endpoints
- **Structured error logging** with severity categorization
- **Error sanitization** to prevent information leakage in production
- **Request tracking** with unique request IDs
- **Critical error alerting** via email, webhook, or console
- **Integration with audit logging** for security events

## Components

### 1. Error Classes (`src/lib/utils/errors.ts`)

Custom error classes for different error types:

```typescript
// Base error class
throw new AppError(statusCode, code, message, details)

// Specific error types
throw new ValidationError(message, details)
throw new AuthenticationError(message)
throw new AuthorizationError(message)
throw new NotFoundError(resource)
throw new RateLimitError(message)
throw new ConflictError(message, details)
throw new DatabaseError(message, details)
throw new ServiceUnavailableError(message)
throw new TimeoutError(message)
throw new BadGatewayError(message)
```

### 2. Error Handler (`src/lib/utils/errors.ts`)

The `handleError` function converts errors into consistent JSON responses:

```typescript
import { handleError } from '@/lib/utils/errors'

// Manual error handling
try {
  // Your code
} catch (error) {
  return handleError(error, requestId)
}
```

### 3. Error Handler Wrapper (`src/lib/utils/errors.ts`)

The `withErrorHandler` wrapper automatically handles errors in API routes:

```typescript
import { withErrorHandler } from '@/lib/utils/errors'

export const GET = withErrorHandler(async (request) => {
  // Your route logic - no try/catch needed!
  // Errors are automatically caught and handled
  return NextResponse.json({ data: 'success' })
})
```

### 4. Error Logger (`src/lib/services/error-logger.service.ts`)

Structured error logging with severity levels:

```typescript
import { ErrorLogger } from '@/lib/services/error-logger.service'

// Log with different severity levels
ErrorLogger.info('CODE', 'Info message', options)
ErrorLogger.warning('CODE', 'Warning message', error, options)
ErrorLogger.error('CODE', 'Error message', error, options)
ErrorLogger.critical('CODE', 'Critical error', error, options)
```

### 5. Alert Service (`src/lib/services/alert.service.ts`)

Sends alerts for critical errors:

```typescript
import { AlertService } from '@/lib/services/alert.service'

// Alerts are automatically sent for critical errors
// Configure via environment variables
```

## Usage

### Updating Existing API Routes

**Before:**
```typescript
export async function GET(request: NextRequest) {
  try {
    // Your route logic
    return NextResponse.json({ data: 'success' })
  } catch (error) {
    return handleError(error)
  }
}
```

**After:**
```typescript
export const GET = withErrorHandler(async (request: NextRequest) => {
  // Your route logic - no try/catch needed!
  return NextResponse.json({ data: 'success' })
})
```

### Creating New API Routes

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { withErrorHandler, NotFoundError } from '@/lib/utils/errors'

export const GET = withErrorHandler(async (request: NextRequest) => {
  const data = await fetchData()
  
  if (!data) {
    throw new NotFoundError('Data')
  }
  
  return NextResponse.json({ success: true, data })
})

export const POST = withErrorHandler(async (request: NextRequest) => {
  const body = await request.json()
  
  // Validation errors are automatically handled
  const result = await createResource(body)
  
  return NextResponse.json({ success: true, data: result }, { status: 201 })
})
```

### Dynamic Routes with Params

```typescript
export const GET = withErrorHandler(async (
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) => {
  const { id } = await params
  const data = await fetchById(id)
  
  if (!data) {
    throw new NotFoundError('Resource')
  }
  
  return NextResponse.json({ success: true, data })
})
```

## Error Response Format

All errors return a consistent format:

```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "User-friendly error message",
    "details": {
      "field": "additional context"
    },
    "requestId": "uuid-v4"
  }
}
```

## Environment Configuration

Configure error handling and alerting via environment variables:

```env
# Node environment (affects error sanitization)
NODE_ENV=production

# Alert configuration
ALERTS_ENABLED=true
ALERT_CHANNELS=console,webhook,email
ALERT_MIN_SEVERITY=critical
ALERT_WEBHOOK_URL=https://your-webhook-url.com
ALERT_EMAIL_RECIPIENTS=admin@example.com,ops@example.com
```

## Logging Levels

- **info**: Successful operations, informational messages
- **warning**: Non-critical issues (slow queries, rate limits approaching)
- **error**: Failed operations, validation errors
- **critical**: System failures, security breaches (triggers alerts)

## Best Practices

1. **Use specific error classes** instead of generic errors:
   ```typescript
   // Good
   throw new NotFoundError('User')
   
   // Avoid
   throw new Error('User not found')
   ```

2. **Include context in error details**:
   ```typescript
   throw new ValidationError('Invalid input', {
     fields: ['email', 'password'],
     reason: 'Email format invalid'
   })
   ```

3. **Let the wrapper handle errors** - don't catch unless you need to:
   ```typescript
   // Good - let wrapper handle
   export const GET = withErrorHandler(async (request) => {
     const data = await riskyOperation()
     return NextResponse.json({ data })
   })
   
   // Only catch if you need custom handling
   export const POST = withErrorHandler(async (request) => {
     try {
       await operation()
     } catch (error) {
       // Custom handling
       if (error instanceof SpecificError) {
         // Handle specifically
       }
       throw error // Re-throw for wrapper to handle
     }
   })
   ```

4. **Use helper logging functions** for common scenarios:
   ```typescript
   import {
     logDatabaseConnectionError,
     logAuthenticationError,
     logRateLimitExceeded,
   } from '@/lib/services/error-logger.service'
   
   logAuthenticationError('Invalid credentials', { request, userId })
   ```

## Migration Checklist

To update an existing API route:

- [ ] Import `withErrorHandler` instead of `handleError`
- [ ] Change `export async function` to `export const ... = withErrorHandler(async`
- [ ] Remove try/catch blocks (unless custom handling needed)
- [ ] Remove manual `handleError(error)` calls
- [ ] Test the route to ensure errors are handled correctly

## Testing Error Handling

```typescript
// Test that errors are properly handled
describe('API Error Handling', () => {
  it('should return 404 for not found', async () => {
    const response = await GET(mockRequest)
    expect(response.status).toBe(404)
    const data = await response.json()
    expect(data.success).toBe(false)
    expect(data.error.code).toBe('NOT_FOUND')
    expect(data.error.requestId).toBeDefined()
  })
})
```

## Examples

See updated routes:
- `src/app/api/notifications/route.ts`
- `src/app/api/notifications/[id]/route.ts`

## Support

For questions or issues with error handling, contact the platform team.
