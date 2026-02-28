/**
 * Custom Next.js Server with WebSocket Support
 * Enables real-time communication for community features
 */

// Load environment variables from .env file
require('dotenv').config()

const { createServer } = require('http')
const { parse } = require('url')
const next = require('next')

const dev = process.env.NODE_ENV !== 'production'
const hostname = process.env.HOSTNAME || 'localhost'
const port = parseInt(process.env.PORT || '3000', 10)

// Initialize Next.js app
const app = next({ dev, hostname, port })
const handle = app.getRequestHandler()

app.prepare().then(async () => {
  // Initialize Prisma database connection first
  try {
    const { initializePrisma } = await import('./src/lib/prisma.ts')
    await initializePrisma()
    console.log('[Server] Database initialized')
  } catch (error) {
    console.error('[Server] Failed to initialize database:', error)
    console.error('[Server] Please check your DATABASE_URL environment variable')
    process.exit(1)
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
    const { getWebSocketServer } = await import('./src/lib/websocket/server.ts')
    const { initializePubSub } = await import('./src/lib/websocket/pubsub.ts')
    const { initializeRedis } = await import('./src/lib/redis.ts')
    const { disconnectPrisma } = await import('./src/lib/prisma.ts')

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
})
