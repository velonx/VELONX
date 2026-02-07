import { createSwaggerSpec } from 'next-swagger-doc';

export const getApiDocs = () => {
  const spec = createSwaggerSpec({
    apiFolder: 'src/app/api',
    definition: {
      openapi: '3.0.0',
      info: {
        title: 'VELONX API Documentation',
        version: '1.0.0',
        description: 'Comprehensive API documentation for the VELONX educational platform',
        contact: {
          name: 'VELONX Support',
          email: 'support@velonx.com',
        },
      },
      servers: [
        {
          url: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000',
          description: 'Development server',
        },
      ],
      components: {
        securitySchemes: {
          bearerAuth: {
            type: 'http',
            scheme: 'bearer',
            bearerFormat: 'JWT',
          },
          sessionAuth: {
            type: 'apiKey',
            in: 'cookie',
            name: 'next-auth.session-token',
          },
        },
        schemas: {
          Error: {
            type: 'object',
            properties: {
              error: {
                type: 'object',
                properties: {
                  code: {
                    type: 'string',
                    description: 'Error code',
                  },
                  message: {
                    type: 'string',
                    description: 'Error message',
                  },
                  details: {
                    type: 'object',
                    description: 'Additional error details',
                  },
                  requestId: {
                    type: 'string',
                    description: 'Request ID for tracking',
                  },
                },
              },
            },
          },
          User: {
            type: 'object',
            properties: {
              id: {
                type: 'string',
                description: 'User ID',
              },
              name: {
                type: 'string',
                description: 'User name',
              },
              email: {
                type: 'string',
                format: 'email',
                description: 'User email',
              },
              role: {
                type: 'string',
                enum: ['STUDENT', 'MENTOR', 'ADMIN'],
                description: 'User role',
              },
              avatar: {
                type: 'string',
                description: 'Avatar URL or identifier',
              },
              xp: {
                type: 'number',
                description: 'Experience points',
              },
              level: {
                type: 'number',
                description: 'User level',
              },
            },
          },
          Notification: {
            type: 'object',
            properties: {
              id: {
                type: 'string',
                description: 'Notification ID',
              },
              userId: {
                type: 'string',
                description: 'User ID',
              },
              type: {
                type: 'string',
                enum: ['INFO', 'SUCCESS', 'WARNING', 'ERROR'],
                description: 'Notification type',
              },
              title: {
                type: 'string',
                description: 'Notification title',
              },
              message: {
                type: 'string',
                description: 'Notification message',
              },
              read: {
                type: 'boolean',
                description: 'Read status',
              },
              createdAt: {
                type: 'string',
                format: 'date-time',
                description: 'Creation timestamp',
              },
            },
          },
          MentorSession: {
            type: 'object',
            properties: {
              id: {
                type: 'string',
                description: 'Session ID',
              },
              mentorId: {
                type: 'string',
                description: 'Mentor user ID',
              },
              studentId: {
                type: 'string',
                description: 'Student user ID',
              },
              scheduledAt: {
                type: 'string',
                format: 'date-time',
                description: 'Scheduled time',
              },
              duration: {
                type: 'number',
                description: 'Duration in minutes',
              },
              status: {
                type: 'string',
                enum: ['SCHEDULED', 'COMPLETED', 'CANCELLED'],
                description: 'Session status',
              },
              topic: {
                type: 'string',
                description: 'Session topic',
              },
              notes: {
                type: 'string',
                description: 'Session notes',
              },
            },
          },
          Project: {
            type: 'object',
            properties: {
              id: {
                type: 'string',
                description: 'Project ID',
              },
              title: {
                type: 'string',
                description: 'Project title',
              },
              description: {
                type: 'string',
                description: 'Project description',
              },
              status: {
                type: 'string',
                enum: ['DRAFT', 'SUBMITTED', 'APPROVED', 'REJECTED'],
                description: 'Project status',
              },
              creatorId: {
                type: 'string',
                description: 'Creator user ID',
              },
              githubUrl: {
                type: 'string',
                description: 'GitHub repository URL',
              },
              liveUrl: {
                type: 'string',
                description: 'Live demo URL',
              },
              tags: {
                type: 'array',
                items: {
                  type: 'string',
                },
                description: 'Project tags',
              },
            },
          },
        },
      },
      tags: [
        {
          name: 'Authentication',
          description: 'Authentication and authorization endpoints',
        },
        {
          name: 'Users',
          description: 'User management endpoints',
        },
        {
          name: 'Notifications',
          description: 'Notification management endpoints',
        },
        {
          name: 'Mentor Sessions',
          description: 'Mentor session booking and management',
        },
        {
          name: 'Projects',
          description: 'Project submission and management',
        },
        {
          name: 'Resources',
          description: 'Learning resource management',
        },
        {
          name: 'Career',
          description: 'Career opportunities and mock interviews',
        },
        {
          name: 'Admin',
          description: 'Administrative endpoints',
        },
      ],
    },
  });

  return spec;
};
