# Redis Quick Start Guide

Get Redis up and running in 5 minutes!

## Step 1: Install Redis

### Option A: Docker (Recommended)
```bash
docker run -d --name velonx-redis -p 6379:6379 redis:7-alpine
```

### Option B: Homebrew (macOS)
```bash
brew install redis
brew services start redis
```

### Option C: Native (Linux)
```bash
sudo apt-get install redis-server
sudo systemctl start redis-server
```

## Step 2: Verify Redis is Running

```bash
redis-cli ping
# Should return: PONG
```

## Step 3: Configure Environment

Your `.env` file already has Redis configuration:
```env
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=
REDIS_DB=0
```

No changes needed for local development!

## Step 4: Test Connection

```bash
cd VELONX
node test-redis-connection.js
```

You should see:
```
✅ Connected to Redis successfully!
🎉 All tests passed! Redis is ready to use.
```

## Step 5: Start Your App

```bash
npm run dev
```

Redis will automatically initialize when the app starts.

## Step 6: Verify Health

Open your browser or use curl:
```bash
curl http://localhost:3000/api/health
```

You should see:
```json
{
  "status": "healthy",
  "checks": {
    "redis": {
      "healthy": true,
      "latency": 2,
      "error": null
    },
    "database": {
      "healthy": true,
      "error": null
    }
  }
}
```

## That's It! 🎉

Redis is now running and integrated with your application.

## Troubleshooting

### Redis not running?
```bash
# Check if Redis is running
docker ps | grep redis
# or
redis-cli ping
```

### Connection refused?
Make sure Redis is running on port 6379:
```bash
redis-cli -p 6379 ping
```

### Still having issues?
See the full guide: `REDIS_SETUP.md`

## Next Steps

- Implement rate limiting (Task 3)
- Implement caching (Task 5)
- Set up performance monitoring (Task 9)

## Useful Commands

```bash
# Stop Redis (Docker)
docker stop velonx-redis

# Start Redis (Docker)
docker start velonx-redis

# View Redis logs (Docker)
docker logs velonx-redis

# Connect to Redis CLI
redis-cli

# Monitor Redis commands
redis-cli MONITOR
```
