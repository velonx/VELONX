# API Documentation

## Overview

The VELONX platform provides comprehensive API documentation using OpenAPI 3.0 specification and Swagger UI for interactive exploration.

## Accessing the Documentation

### Interactive Documentation (Swagger UI)

Visit the interactive API documentation at:

```
http://localhost:3000/api-docs
```

Or in production:

```
https://your-domain.com/api-docs
```

### OpenAPI Specification (JSON)

The raw OpenAPI specification is available at:

```
http://localhost:3000/api/docs
```

## Features

### Interactive Testing
- Try out API endpoints directly from the documentation
- See request/response examples
- Test authentication flows
- View response schemas

### Comprehensive Coverage
The documentation includes:
- All API endpoints with descriptions
- Request/response schemas
- Authentication requirements
- Query parameters and request bodies
- Response codes and error formats
- Example requests and responses

### Organized by Tags
Endpoints are organized into logical groups:
- **Authentication**: Login, signup, session management
- **Users**: User management and profiles
- **Notifications**: Notification CRUD operations
- **Mentor Sessions**: Session booking and management
- **Projects**: Project submission and collaboration
- **Resources**: Learning resource access
- **Career**: Job opportunities and mock interviews
- **Admin**: Administrative endpoints

## API Endpoints Documented

### Events

#### GET /api/events/{id}/export

Generate calendar export data for an event. Returns ICS file content, Google Calendar URL, and Outlook Calendar URL.

**Authentication**: Optional (meeting link only included for registered users)

**Parameters**:
- `id` (path, required): Event ID

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "icsData": "BEGIN:VCALENDAR\nVERSION:2.0\n...",
    "googleCalendarUrl": "https://calendar.google.com/calendar/render?...",
    "outlookUrl": "https://outlook.live.com/calendar/0/deeplink/compose?..."
  }
}
```

**Features**:
- ICS file content follows RFC 5545 standard
- Meeting link included only for registered users
- Handles events with/without end dates (defaults to 1 hour duration)
- Properly escapes special characters in ICS format
- Google Calendar and Outlook URLs pre-filled with event details

**Example Usage**:
```typescript
// Fetch export data
const response = await fetch('/api/events/event-123/export');
const { data } = await response.json();

// Download ICS file
const blob = new Blob([data.icsData], { type: 'text/calendar' });
const url = URL.createObjectURL(blob);
const link = document.createElement('a');
link.href = url;
link.download = 'event.ics';
link.click();

// Or open Google Calendar
window.open(data.googleCalendarUrl, '_blank');

// Or open Outlook Calendar
window.open(data.outlookUrl, '_blank');
```

### Notifications
- `GET /api/notifications` - List user notifications with pagination
- `POST /api/notifications` - Create a new notification
- `PATCH /api/notifications/{id}` - Mark notification as read
- `DELETE /api/notifications/{id}` - Delete a notification

### Events
- `GET /api/events` - List events with pagination and filtering
- `POST /api/events` - Create a new event (Admin only)
- `GET /api/events/{id}` - Get event details
- `PATCH /api/events/{id}` - Update an event (Admin only)
- `DELETE /api/events/{id}` - Delete an event (Admin only)
- `POST /api/events/{id}/register` - Register for an event
- `DELETE /api/events/{id}/register` - Unregister from an event
- `GET /api/events/{id}/export` - Get calendar export data (ICS, Google Calendar, Outlook)

### Mentor Sessions
- `GET /api/mentor-sessions` - List mentor sessions
- `POST /api/mentor-sessions` - Book a mentor session

### Projects
- `GET /api/projects` - List projects with filtering
- `POST /api/projects` - Create a new project

### Users (Admin)
- `GET /api/users` - List all users (admin only)

## Authentication

Most endpoints require authentication using session-based auth:

```typescript
// Session cookie authentication
sessionAuth: {
  type: 'apiKey',
  in: 'cookie',
  name: 'next-auth.session-token'
}
```

## Response Format

### Success Response
```json
{
  "success": true,
  "data": { /* response data */ },
  "message": "Operation completed successfully"
}
```

### Error Response
```json
{
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable error message",
    "details": { /* additional error details */ },
    "requestId": "unique-request-id"
  }
}
```

## Rate Limiting

All API endpoints are rate-limited:
- Anonymous users: 100 requests per minute
- Authenticated users: 500 requests per hour

When rate limit is exceeded, the API returns:
- Status: `429 Too Many Requests`
- Header: `Retry-After` (seconds until limit resets)

## Adding Documentation to New Endpoints

When creating new API endpoints, add JSDoc annotations:

```typescript
/**
 * @swagger
 * /api/your-endpoint:
 *   get:
 *     summary: Brief description
 *     description: Detailed description
 *     tags:
 *       - YourTag
 *     security:
 *       - sessionAuth: []
 *     parameters:
 *       - in: query
 *         name: paramName
 *         schema:
 *           type: string
 *         description: Parameter description
 *     responses:
 *       200:
 *         description: Success response
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 */
export async function GET(request: NextRequest) {
  // Implementation
}
```

## Updating Documentation

The OpenAPI specification is automatically generated from JSDoc annotations in the API route files. To update the documentation:

1. Add or modify JSDoc annotations in your API route files
2. The documentation will be automatically updated
3. Refresh the `/api-docs` page to see changes

## Common Schemas

The following schemas are available for reuse:

- `Error` - Standard error response format
- `User` - User object schema
- `Notification` - Notification object schema
- `MentorSession` - Mentor session object schema
- `Project` - Project object schema

Reference them in your documentation:
```yaml
$ref: '#/components/schemas/User'
```

## Best Practices

1. **Always document authentication requirements** using the `security` field
2. **Include examples** for request bodies and responses
3. **Document all query parameters** with types and descriptions
4. **Use appropriate HTTP status codes** in responses
5. **Group related endpoints** using tags
6. **Keep descriptions clear and concise**
7. **Document error responses** for each endpoint

## Troubleshooting

### Documentation not loading
- Check that the Next.js server is running
- Verify the `/api/docs` endpoint returns valid JSON
- Check browser console for errors

### Missing endpoints
- Ensure JSDoc annotations are properly formatted
- Verify the API route file is in the `src/app/api` directory
- Check that the route exports are named correctly (GET, POST, etc.)

### Swagger UI styling issues
- Ensure `swagger-ui-react/swagger-ui.css` is imported
- Check for CSS conflicts with your application styles

## Additional Resources

- [OpenAPI 3.0 Specification](https://swagger.io/specification/)
- [Swagger UI Documentation](https://swagger.io/tools/swagger-ui/)
- [next-swagger-doc](https://github.com/jellydn/next-swagger-doc)
