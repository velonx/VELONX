# WebSocket Server Guide

## Overview

The VELONX platform includes a custom WebSocket server for real-time community features including:
- Real-time chat in discussion rooms and groups
- Typing indicators
- Online status tracking
- Message broadcasting across multiple server instances

## Architecture

### Components

1. **WebSocket Server** (`src/lib/websocket/server.ts`)
   - Handles WebSocket connections
   - Manages connection pooling
   - Implements heartbeat mechanism
   - Authenticates connections using JWT tokens

2. **Redis Pub/Sub** (`src/lib/websocket/pubsub.ts`)
   - Enables multi-instance message broadcasting
   - Manages channel subscriptions
   - Publishes messages to Redis channels
   - Subscribes to Redis channels for incoming messages

3. **Custom Server** (`server.js`)
   - Next.js custom server with WebSocket support
   - Initializes Redis and Pub/Sub
   - Handles HTTP upgrade requests for WebSocket connections

## Setup

### 1. Install Dependencies

```bash
npm install
```

Required packages:
- `ws` - WebSocket server implementation
- `ioredis` - Redis client for Pub/Sub
- `jsonwebtoken` - JWT token verification

### 2. Environment Variables

Add the following to your `.env` file:

```env
# NextAuth (required for WebSocket authentication)
NEXTAUTH_SECRET=your-secret-key

# Redis (required for Pub/Sub)
UPSTASH_REDIS_REST_URL=your-redis-url
UPSTASH_REDIS_REST_TOKEN=your-redis-token
```

### 3. Start the Server

Development:
```bash
npm run dev
```

Production:
```bash
npm run build
npm start
```

The WebSocket server will be available at:
```
ws://localhost:3000/api/community/ws
```

## Client Usage

### 1. Obtain JWT Token

First, authenticate the user and obtain a JWT token from NextAuth:

```typescript
import { getSession } from 'next-auth/react'

const session = await getSession()
const token = session?.accessToken // or generate a JWT token
```

### 2. Connect to WebSocket

```typescript
const ws = new WebSocket(`ws://localhost:3000/api/community/ws?token=${token}`)

ws.onopen = () => {
  console.log('Connected to WebSocket server')
}

ws.onmessage = (event) => {
  const message = JSON.parse(event.data)
  console.log('Received message:', message)
}

ws.onerror = (error) => {
  console.error('WebSocket error:', error)
}

ws.onclose = () => {
  console.log('Disconnected from WebSocket server')
}
```

### 3. Send Messages

#### Typing Indicator

```typescript
ws.send(JSON.stringify({
  type: 'TYPING',
  payload: {
    userId: 'user-123',
    userName: 'John Doe',
    roomId: 'room-456', // or groupId
    isTyping: true
  }
}))
```

#### Ping/Pong (Connection Health)

```typescript
ws.send(JSON.stringify({
  type: 'PING',
  payload: {}
}))

// Server will respond with PONG
```

### 4. Receive Messages

The server broadcasts the following message types:

#### Chat Message

```typescript
{
  type: 'CHAT_MESSAGE',
  payload: {
    id: 'msg-123',
    content: 'Hello, world!',
    roomId: 'room-456',
    authorId: 'user-123',
    authorName: 'John Doe',
    authorImage: 'https://example.com/avatar.jpg',
    isEdited: false,
    createdAt: '2024-01-01T00:00:00.000Z'
  }
}
```

#### Typing Indicator

```typescript
{
  type: 'TYPING',
  payload: {
    userId: 'user-123',
    userName: 'John Doe',
    roomId: 'room-456',
    isTyping: true
  }
}
```

#### User Joined

```typescript
{
  type: 'USER_JOINED',
  payload: {
    userId: 'user-123',
    userName: 'John Doe',
    userImage: 'https://example.com/avatar.jpg',
    roomId: 'room-456'
  }
}
```

#### User Left

```typescript
{
  type: 'USER_LEFT',
  payload: {
    userId: 'user-123',
    roomId: 'room-456'
  }
}
```

#### Message Edit

```typescript
{
  type: 'MESSAGE_EDIT',
  payload: {
    messageId: 'msg-123',
    content: 'Updated content',
    roomId: 'room-456'
  }
}
```

#### Message Delete

```typescript
{
  type: 'MESSAGE_DELETE',
  payload: {
    messageId: 'msg-123',
    roomId: 'room-456'
  }
}
```

## API Integration

### Sending Chat Messages

Chat messages should be sent via the REST API, not directly through WebSocket:

```typescript
// Send message via API
const response = await fetch('/api/community/messages', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    content: 'Hello, world!',
    roomId: 'room-456'
  })
})

// The API will:
// 1. Store the message in MongoDB
// 2. Publish to Redis Pub/Sub
// 3. All WebSocket servers receive and broadcast to connected clients
```

### Broadcasting Messages

The ChatService automatically broadcasts messages:

```typescript
import { ChatService } from '@/lib/services/chat.service'

const chatService = new ChatService()

// Send message (automatically broadcasts via Redis Pub/Sub)
const message = await chatService.sendMessage({
  content: 'Hello, world!',
  roomId: 'room-456'
}, 'user-123')
```

## Health Check

Check WebSocket server health:

```bash
curl http://localhost:3000/api/community/ws/health
```

Response:

```json
{
  "success": true,
  "data": {
    "websocket": {
      "totalConnections": 10,
      "uniqueUsers": 8,
      "averageConnectionsPerUser": 1.25,
      "isHealthy": true
    },
    "pubsub": {
      "isHealthy": true,
      "publisherConnected": true,
      "subscriberConnected": true,
      "subscribedChannels": 5,
      "totalSubscriptions": 12
    },
    "timestamp": "2024-01-01T00:00:00.000Z"
  }
}
```

## Channel Naming Convention

Channels follow a consistent naming pattern:

- **Room channels**: `room:{roomId}`
- **Group channels**: `group:{groupId}`
- **Online users**: `{channel}:online`
- **Typing indicators**: `{channel}:typing`

Example:
```
room:abc123           # Room channel
room:abc123:online    # Online users in room
room:abc123:typing    # Typing indicators in room
```

## Connection Management

### Heartbeat Mechanism

The server sends ping frames every 30 seconds to check connection health. Clients should respond with pong frames. Connections that don't respond are terminated.

### Automatic Reconnection

Clients should implement automatic reconnection with exponential backoff:

```typescript
let reconnectAttempts = 0
const maxReconnectAttempts = 5
const baseDelay = 1000

function connect() {
  const ws = new WebSocket(`ws://localhost:3000/api/community/ws?token=${token}`)
  
  ws.onclose = () => {
    if (reconnectAttempts < maxReconnectAttempts) {
      const delay = baseDelay * Math.pow(2, reconnectAttempts)
      reconnectAttempts++
      
      console.log(`Reconnecting in ${delay}ms...`)
      setTimeout(connect, delay)
    }
  }
  
  ws.onopen = () => {
    reconnectAttempts = 0 // Reset on successful connection
  }
}
```

## Multi-Instance Support

The WebSocket server supports horizontal scaling through Redis Pub/Sub:

1. Multiple server instances can run simultaneously
2. Each instance maintains its own WebSocket connections
3. Messages are published to Redis channels
4. All instances subscribe to relevant channels
5. Each instance broadcasts to its connected clients

This enables:
- Load balancing across multiple servers
- High availability
- Seamless scaling

## Security

### Authentication

- All WebSocket connections require a valid JWT token
- Tokens are verified using `NEXTAUTH_SECRET`
- Invalid tokens result in connection rejection

### Authorization

- Users can only subscribe to rooms/groups they are members of
- Message broadcasting respects membership rules
- Blocked users don't receive messages from blockers

## Monitoring

### Connection Stats

```typescript
import { getConnectionStats } from '@/lib/websocket/server'

const stats = getConnectionStats()
console.log(stats)
// {
//   totalConnections: 10,
//   uniqueUsers: 8,
//   averageConnectionsPerUser: 1.25
// }
```

### Pub/Sub Health

```typescript
import { getPubSubHealth } from '@/lib/websocket/pubsub'

const health = await getPubSubHealth()
console.log(health)
// {
//   isHealthy: true,
//   publisherConnected: true,
//   subscriberConnected: true,
//   subscribedChannels: 5,
//   totalSubscriptions: 12
// }
```

## Troubleshooting

### Connection Refused

**Problem**: WebSocket connection fails with "Connection refused"

**Solution**:
1. Ensure the custom server is running (`npm run dev`)
2. Check that port 3000 is not blocked by firewall
3. Verify `NEXTAUTH_SECRET` is set in `.env`

### Authentication Failed

**Problem**: Connection rejected with 401 Unauthorized

**Solution**:
1. Verify JWT token is valid and not expired
2. Check `NEXTAUTH_SECRET` matches between client and server
3. Ensure token is passed in query parameter: `?token=...`

### Messages Not Broadcasting

**Problem**: Messages sent but not received by other clients

**Solution**:
1. Check Redis connection: `curl http://localhost:3000/api/community/ws/health`
2. Verify Redis Pub/Sub is initialized
3. Check Redis credentials in `.env`
4. Ensure all server instances use the same Redis instance

### High Memory Usage

**Problem**: Server memory usage increases over time

**Solution**:
1. Check for connection leaks (connections not properly closed)
2. Monitor connection count: `getConnectionStats()`
3. Implement connection limits per user
4. Review heartbeat mechanism is working

## Best Practices

1. **Always authenticate**: Never allow unauthenticated WebSocket connections
2. **Implement reconnection**: Handle disconnections gracefully with exponential backoff
3. **Rate limiting**: Limit message frequency per user to prevent spam
4. **Message validation**: Validate all incoming messages before processing
5. **Error handling**: Catch and log all errors, don't crash the server
6. **Monitoring**: Track connection counts, message rates, and error rates
7. **Graceful shutdown**: Close all connections properly on server shutdown

## Testing

Run WebSocket server tests:

```bash
npm test -- src/__tests__/integration/websocket-server.integration.test.ts
```

## References

- [WebSocket API (MDN)](https://developer.mozilla.org/en-US/docs/Web/API/WebSocket)
- [ws Library Documentation](https://github.com/websockets/ws)
- [Redis Pub/Sub](https://redis.io/docs/manual/pubsub/)
- [Next.js Custom Server](https://nextjs.org/docs/advanced-features/custom-server)
