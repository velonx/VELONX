/**
 * Custom Next.js Server with WebSocket Support
 * Enables real-time communication for community features
 */

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
    const { initializeWebSocketServer } = await import('./src/lib/websocket/server.ts')
    const { initializePubSub } = await import('./src/lib/websocket/pubsub.ts')
    const { initializeRedis } = await import('./src/lib/redis.ts')

    // Initialize Redis first
    await initializeRedis()
    console.log('[Server] Redis initialized')

    // Initialize Redis Pub/Sub
    await initializePubSub()
    console.log('[Server] Redis Pub/Sub initialized')

    // Initialize WebSocket server
    const wss = initializeWebSocketServer(server)
    console.log('[Server] WebSocket server initialized')

    // Graceful shutdown
    process.on('SIGTERM', async () => {
      console.log('[Server] SIGTERM signal received: closing HTTP server')
      
      // Close WebSocket server
      wss.close(() => {
        console.log('[Server] WebSocket server closed')
      })

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
