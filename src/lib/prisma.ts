import { PrismaClient } from '@prisma/client';
import { performanceMonitor } from '@/lib/services/performance-monitor.service';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// Connection pool configuration
const POOL_CONFIG = {
  maxConnections: 10,
  minConnections: 2,
  connectionTimeout: 10000, // 10 seconds
  retryAttempts: 5,
  baseRetryDelay: 1000, // 1 second
  maxQueueSize: 100,
  queueWarningThreshold: 50,
};

// Connection health monitoring
let connectionHealthy = true;
let lastHealthCheck = Date.now();
const HEALTH_CHECK_INTERVAL = 30000; // 30 seconds

// Exponential backoff retry mechanism
async function retryWithBackoff<T>(
  operation: () => Promise<T>,
  attemptNumber = 0
): Promise<T> {
  try {
    return await operation();
  } catch (error) {
    if (attemptNumber >= POOL_CONFIG.retryAttempts) {
      console.error(
        `[Prisma] Operation failed after ${POOL_CONFIG.retryAttempts} attempts:`,
        error
      );
      throw error;
    }

    const delay = POOL_CONFIG.baseRetryDelay * Math.pow(2, attemptNumber);
    console.warn(
      `[Prisma] Operation failed (attempt ${attemptNumber + 1}/${POOL_CONFIG.retryAttempts}), retrying in ${delay}ms...`,
      error instanceof Error ? error.message : error
    );

    await new Promise((resolve) => setTimeout(resolve, delay));
    return retryWithBackoff(operation, attemptNumber + 1);
  }
}

// Create Prisma client with enhanced configuration
function createPrismaClient() {
  const client = new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
    datasources: {
      db: {
        url: process.env.DATABASE_URL,
      },
    },
  });

  // Add middleware for connection monitoring and retry logic
  client.$use(async (params, next) => {
    try {
      const result = await retryWithBackoff(() => next(params));
      connectionHealthy = true;
      return result;
    } catch (error) {
      connectionHealthy = false;
      console.error('[Prisma] Database operation failed:', error);
      throw error;
    }
  });

  // Add middleware for performance monitoring
  client.$use(async (params, next) => {
    const startTime = Date.now();
    
    try {
      const result = await next(params);
      const duration = Date.now() - startTime;
      
      // Track query performance
      await performanceMonitor.trackDatabaseQuery({
        model: params.model || 'unknown',
        action: params.action,
        duration,
        timestamp: startTime,
      });
      
      return result;
    } catch (error) {
      const duration = Date.now() - startTime;
      
      // Track failed query
      await performanceMonitor.trackDatabaseQuery({
        model: params.model || 'unknown',
        action: params.action,
        duration,
        timestamp: startTime,
      });
      
      throw error;
    }
  });

  return client;
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

// Connection health check function
export async function checkConnectionHealth(): Promise<{
  isHealthy: boolean;
  lastCheck: Date;
  message: string;
  activeConnections?: number;
  idleConnections?: number;
}> {
  const now = Date.now();
  
  // Only perform actual health check if interval has passed
  if (now - lastHealthCheck < HEALTH_CHECK_INTERVAL && connectionHealthy) {
    return {
      isHealthy: connectionHealthy,
      lastCheck: new Date(lastHealthCheck),
      message: 'Connection healthy (cached)',
      activeConnections: 0,
      idleConnections: 0,
    };
  }

  try {
    // Simple query to test connection
    await prisma.$queryRaw`SELECT 1`;
    connectionHealthy = true;
    lastHealthCheck = now;
    
    // Get connection pool metrics (Prisma doesn't expose this directly, so we estimate)
    const metrics = await prisma.$metrics.json().catch(() => null);
    
    return {
      isHealthy: true,
      lastCheck: new Date(lastHealthCheck),
      message: 'Connection healthy',
      activeConnections: metrics?.counters?.find((c: any) => c.key === 'prisma_client_queries_active')?.value || 0,
      idleConnections: POOL_CONFIG.maxConnections - (metrics?.counters?.find((c: any) => c.key === 'prisma_client_queries_active')?.value || 0),
    };
  } catch (error) {
    connectionHealthy = false;
    lastHealthCheck = now;
    
    console.error('[Prisma] Health check failed:', error);
    
    // Attempt to reconnect
    try {
      await prisma.$disconnect();
      await prisma.$connect();
      connectionHealthy = true;
      
      return {
        isHealthy: true,
        lastCheck: new Date(lastHealthCheck),
        message: 'Connection restored after reconnection',
        activeConnections: 0,
        idleConnections: POOL_CONFIG.maxConnections,
      };
    } catch (reconnectError) {
      console.error('[Prisma] Reconnection failed:', reconnectError);
      
      return {
        isHealthy: false,
        lastCheck: new Date(lastHealthCheck),
        message: `Connection unhealthy: ${reconnectError instanceof Error ? reconnectError.message : 'Unknown error'}`,
        activeConnections: 0,
        idleConnections: 0,
      };
    }
  }
}

// Graceful shutdown handler
export async function disconnectPrisma(): Promise<void> {
  try {
    await prisma.$disconnect();
    console.log('[Prisma] Disconnected successfully');
  } catch (error) {
    console.error('[Prisma] Error during disconnect:', error);
  }
}

// Initialize connection on startup
if (typeof window === 'undefined') {
  prisma.$connect().catch((error) => {
    console.error('[Prisma] Failed to connect on startup:', error);
  });
}
