import { PrismaClient } from '@prisma/client';

// NOTE: Do NOT import server services here (performance-monitor, audit, etc.)
// as prisma.ts is a foundational module and importing those services creates
// circular dependencies that can pull Prisma into the browser bundle.

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

/**
 * Create a simple Prisma client
 */
function createPrismaClient() {
  const client = new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
    datasources: {
      db: {
        url: process.env.DATABASE_URL,
      },
    },
  });

  // Add middleware for slow query logging
  client.$use(async (params, next) => {
    const startTime = Date.now();

    try {
      const result = await next(params);
      const duration = Date.now() - startTime;

      // Log slow queries (> 1 second)
      if (duration > 1000) {
        console.warn(
          `[Prisma] Slow query: ${params.model || 'unknown'}.${params.action} took ${duration}ms`
        );
      }

      return result;
    } catch (error) {
      const duration = Date.now() - startTime;
      console.error(
        `[Prisma] Failed query: ${params.model || 'unknown'}.${params.action} after ${duration}ms`
      );
      throw error;
    }
  });

  return client;
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

/**
 * Validate DATABASE_URL environment variable
 */
function validateDatabaseUrl(): void {
  const databaseUrl = process.env.DATABASE_URL;

  if (!databaseUrl) {
    throw new Error(
      '[Prisma] DATABASE_URL environment variable is not set. ' +
      'Please ensure your .env file contains a valid MongoDB connection string.'
    );
  }

  // Basic format validation for MongoDB connection strings
  const isValidFormat =
    databaseUrl.startsWith('mongodb://') ||
    databaseUrl.startsWith('mongodb+srv://');

  if (!isValidFormat) {
    throw new Error(
      '[Prisma] DATABASE_URL must be a valid MongoDB connection string ' +
      '(starting with mongodb:// or mongodb+srv://). ' +
      `Current value starts with: ${databaseUrl.substring(0, 20)}...`
    );
  }
}

/**
 * Initialize Prisma connection explicitly
 * Should be called during server startup with proper error handling
 */
export async function initializePrisma(): Promise<void> {
  // Validate connection string before attempting to connect
  validateDatabaseUrl();

  try {
    await prisma.$connect();
    console.log('[Prisma] Database connection established successfully');
  } catch (error) {
    console.error('[Prisma] Failed to connect to database:', error);
    throw error;
  }
}

/**
 * Graceful shutdown handler
 */
export async function disconnectPrisma(): Promise<void> {
  try {
    await prisma.$disconnect();
    console.log('[Prisma] Disconnected successfully');
  } catch (error) {
    console.error('[Prisma] Error during disconnect:', error);
  }
}

// NOTE: Eager connection removed - connection is now initialized explicitly in server.js
// This prevents connection attempts before proper error handling is in place
