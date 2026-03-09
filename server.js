/**
 * Custom Next.js Server with WebSocket Support
 * Enables real-time communication for community features
 */

// Load environment variables from .env file
// Note: Using fs-based loading to avoid Node.js v24 built-in dotenv conflict
try {
  const fs = require('fs');
  const path = require('path');
  const envPath = path.resolve(process.cwd(), '.env');
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf8');
    envContent.split('\n').forEach(line => {
      const trimmed = line.trim();
      if (trimmed && !trimmed.startsWith('#')) {
        const eqIdx = trimmed.indexOf('=');
        if (eqIdx > 0) {
          const key = trimmed.slice(0, eqIdx).trim();
          const val = trimmed.slice(eqIdx + 1).trim().replace(/^['"]|['"]$/g, '');
          if (!process.env[key]) process.env[key] = val;
        }
      }
    });
  }
} catch (e) {
  console.warn('[Server] Could not load .env file:', e.message);
}

const { createServer } = require('http')
const { parse } = require('url')
const next = require('next')

const dev = process.env.NODE_ENV !== 'production'
const hostname = process.env.HOSTNAME || 'localhost'
const port = parseInt(process.env.PORT || '3000', 10)

// Initialize Next.js app
const app = next({ dev, hostname, port })
const handle = app.getRequestHandler()

const backupDatabaseUrl = process.env.DATABASE_URL;
app.prepare().then(async () => {
  // Restore DATABASE_URL if Next.js app.prepare() clears it
  if (backupDatabaseUrl) {
    process.env.DATABASE_URL = backupDatabaseUrl;
  }

  // Initialize Prisma database connection first
  try {
    // Import from the source during development, from build during production
    const prismaPath = dev ? './src/lib/prisma.ts' : './src/lib/prisma';
    const prismaModule = await import(prismaPath);
    const { initializePrisma } = prismaModule;

    if (typeof initializePrisma !== 'function') {
      throw new Error(`initializePrisma is not a function. Type: ${typeof initializePrisma}`);
    }

    await initializePrisma()
    console.log('[Server] Database initialized')
  } catch (error) {
    console.error('[Server] Failed to initialize database:', error.stack || error)
    console.error('[Server] Please check your DATABASE_URL environment variable')

    // In production, this is a fatal error
    if (!dev) {
      process.exit(1)
    }
  }

  // Create HTTP server
  const server = createServer(async (req, res) => {
    try {
      const parsedUrl = parse(req.url, true)
      await handle(req, res, parsedUrl)
    } catch (err) {
      console.error('Error occurred handling', req.url, err)
      res.statusCode = 500
      res.end('Internal server error')
    }
  })

  // Initialize WebSocket server (dynamic import for ES modules)
  try {
    const { getWebSocketServer } = await import(dev ? './src/lib/websocket/server.ts' : './src/lib/websocket/server')
    const { initializePubSub } = await import(dev ? './src/lib/websocket/pubsub.ts' : './src/lib/websocket/pubsub')
    const { initializeRedis } = await import(dev ? './src/lib/redis.ts' : './src/lib/redis')
    const { disconnectPrisma } = await import(dev ? './src/lib/prisma.ts' : './src/lib/prisma')

    // Initialize Redis first
    await initializeRedis()
    console.log('[Server] Redis initialized')

    // Initialize Redis Pub/Sub
    await initializePubSub()
    console.log('[Server] Redis Pub/Sub initialized')

    // Get WebSocket server singleton (initializes on first call, reuses on subsequent calls)
    const wss = getWebSocketServer(server)
    console.log('[Server] WebSocket server ready')

    // Graceful shutdown
    process.on('SIGTERM', async () => {
      console.log('[Server] SIGTERM signal received: closing HTTP server')

      // Close WebSocket server
      wss.close(() => {
        console.log('[Server] WebSocket server closed')
      })

      // Disconnect Prisma
      await disconnectPrisma()

      // Close HTTP server
      server.close(() => {
        console.log('[Server] HTTP server closed')
        process.exit(0)
      })
    })

    process.on('SIGINT', async () => {
      console.log('[Server] SIGINT signal received: closing HTTP server')

      // Close WebSocket server
      wss.close(() => {
        console.log('[Server] WebSocket server closed')
      })

      // Disconnect Prisma
      await disconnectPrisma()

      // Close HTTP server
      server.close(() => {
        console.log('[Server] HTTP server closed')
        process.exit(0)
      })
    })
  } catch (error) {
    console.error('[Server] Failed to initialize WebSocket server:', error)
    console.log('[Server] Continuing without WebSocket support')
  }

  // Start listening
  server.listen(port, (err) => {
    if (err) throw err
    console.log(`[Server] Ready on http://${hostname}:${port}`)
    console.log(`[Server] WebSocket available at ws://${hostname}:${port}/api/community/ws`)
  })
}).catch((err) => {
  console.error('[Server] Failed to prepare app:', err)
  process.exit(1)
})
