# Health Check Endpoint

The VELONX platform includes a comprehensive health check endpoint for monitoring service availability and performance.

## Endpoint

```
GET /api/health
```

## Response Format

### Healthy Response (200 OK)

```json
{
  "status": "healthy",
  "checks": {
    "redis": {
      "healthy": true,
      "latency": 5,
      "error": null,
      "status": "connected"
    },
    "database": {
      "healthy": true,
      "lastCheck": "2026-01-22T10:30:00.000Z",
      "message": "Connection healthy",
      "error": null,
      "poolStatus": {
        "active": 2,
        "idle": 8
      }
    },
    "application": {
      "version": "1.0.0",
      "environment": "production",
      "uptime": 3600,
      "memory": {
        "used": 150,
        "total": 512,
        "unit": "MB"
      }
    },
    "timestamp": "2026-01-22T10:30:00.000Z"
  },
  "responseTime": "45ms"
}
```

### Degraded Response (200 OK)

When some services are healthy but others are not:

```json
{
  "status": "degraded",
  "checks": {
    "redis": {
      "healthy": false,
      "latency": null,
      "error": "Connection timeout",
      "status": "disconnected"
    },
    "database": {
      "healthy": true,
      "lastCheck": "2026-01-22T10:30:00.000Z",
      "message": "Connection healthy",
      "error": null,
      "poolStatus": {
        "active": 3,
        "idle": 7
      }
    },
    "application": {
      "version": "1.0.0",
      "environment": "production",
      "uptime": 3600,
      "memory": {
        "used": 150,
        "total": 512,
        "unit": "MB"
      }
    },
    "timestamp": "2026-01-22T10:30:00.000Z"
  },
  "responseTime": "120ms"
}
```

### Unhealthy Response (503 Service Unavailable)

When all critical services are down:

```json
{
  "status": "unhealthy",
  "checks": {
    "redis": {
      "healthy": false,
      "latency": null,
      "error": "Connection refused",
      "status": "disconnected"
    },
    "database": {
      "healthy": false,
      "lastCheck": "2026-01-22T10:30:00.000Z",
      "message": "Connection unhealthy: Connection timeout",
      "error": "Connection timeout",
      "poolStatus": null
    },
    "application": {
      "version": "1.0.0",
      "environment": "production",
      "uptime": 3600,
      "memory": {
        "used": 150,
        "total": 512,
        "unit": "MB"
      }
    },
    "timestamp": "2026-01-22T10:30:00.000Z"
  },
  "responseTime": "5000ms"
}
```

## Status Codes

- **200 OK**: All services healthy or degraded (some services down but application still functional)
- **503 Service Unavailable**: All critical services are down
- **500 Internal Server Error**: Health check itself failed

## Health Check Components

### Redis

Checks Redis connection status and latency:
- **healthy**: Boolean indicating if Redis is accessible
- **latency**: Response time in milliseconds
- **status**: Connection status (connected/disconnected/unknown)
- **error**: Error message if unhealthy

### Database

Checks MongoDB connection via Prisma:
- **healthy**: Boolean indicating if database is accessible
- **lastCheck**: Timestamp of last health check
- **message**: Human-readable status message
- **poolStatus**: Connection pool information
  - **active**: Number of active connections
  - **idle**: Number of idle connections
- **error**: Error message if unhealthy

### Application

Provides application-level metrics:
- **version**: Application version
- **environment**: Current environment (development/production)
- **uptime**: Process uptime in seconds
- **memory**: Memory usage statistics
  - **used**: Heap memory used (MB)
  - **total**: Total heap memory (MB)

## Usage

### Manual Testing

```bash
curl http://localhost:3000/api/health
```

### Load Balancer Configuration

Configure your load balancer to use this endpoint for health checks:

**AWS Application Load Balancer:**
```
Health Check Path: /api/health
Health Check Interval: 30 seconds
Healthy Threshold: 2
Unhealthy Threshold: 3
Timeout: 5 seconds
Success Codes: 200
```

**Kubernetes Liveness Probe:**
```yaml
livenessProbe:
  httpGet:
    path: /api/health
    port: 3000
  initialDelaySeconds: 30
  periodSeconds: 10
  timeoutSeconds: 5
  failureThreshold: 3
```

**Kubernetes Readiness Probe:**
```yaml
readinessProbe:
  httpGet:
    path: /api/health
    port: 3000
  initialDelaySeconds: 10
  periodSeconds: 5
  timeoutSeconds: 3
  failureThreshold: 2
```

### Monitoring Integration

#### Prometheus

```yaml
scrape_configs:
  - job_name: 'velonx-health'
    metrics_path: '/api/health'
    scrape_interval: 30s
    static_configs:
      - targets: ['localhost:3000']
```

#### Datadog

```javascript
const axios = require('axios');

setInterval(async () => {
  try {
    const response = await axios.get('http://localhost:3000/api/health');
    const { status, checks } = response.data;
    
    // Send metrics to Datadog
    dogstatsd.gauge('velonx.health.redis.latency', checks.redis.latency);
    dogstatsd.gauge('velonx.health.database.active_connections', checks.database.poolStatus.active);
    dogstatsd.gauge('velonx.health.memory.used', checks.application.memory.used);
  } catch (error) {
    console.error('Health check failed:', error);
  }
}, 30000);
```

## Alerting

### Alert Conditions

**Critical Alerts:**
- Status is "unhealthy" for more than 2 minutes
- Database connection fails
- Response time exceeds 5 seconds

**Warning Alerts:**
- Status is "degraded" for more than 5 minutes
- Redis connection fails
- Memory usage exceeds 80%
- Response time exceeds 2 seconds

### Example Alert Configuration (PagerDuty)

```javascript
const checkHealth = async () => {
  const response = await fetch('http://localhost:3000/api/health');
  const data = await response.json();
  
  if (data.status === 'unhealthy') {
    // Trigger critical alert
    await pagerduty.trigger({
      severity: 'critical',
      summary: 'VELONX platform is unhealthy',
      details: data
    });
  } else if (data.status === 'degraded') {
    // Trigger warning alert
    await pagerduty.trigger({
      severity: 'warning',
      summary: 'VELONX platform is degraded',
      details: data
    });
  }
};
```

## Caching

The health check endpoint includes cache control headers to prevent caching:

```
Cache-Control: no-cache, no-store, must-revalidate
Pragma: no-cache
Expires: 0
```

This ensures that health checks always return current status.

## Performance Considerations

- Health checks are throttled to run at most once every 30 seconds per service
- Cached results are returned between checks to reduce load
- Database queries use simple `SELECT 1` for minimal overhead
- Redis checks use PING command for fast response

## Troubleshooting

### Health Check Always Returns Unhealthy

1. Check service logs for connection errors
2. Verify environment variables are set correctly
3. Ensure Redis and MongoDB are running and accessible
4. Check network connectivity and firewall rules

### Health Check Times Out

1. Increase timeout in load balancer configuration
2. Check for slow database queries
3. Verify Redis is responding quickly
4. Review application logs for blocking operations

### Intermittent Failures

1. Check for connection pool exhaustion
2. Review database connection limits
3. Monitor Redis memory usage
4. Check for network instability

## Best Practices

1. **Monitor regularly**: Check health endpoint every 30-60 seconds
2. **Set appropriate thresholds**: Don't alert on single failures
3. **Use for deployment**: Verify health before routing traffic
4. **Track trends**: Monitor response times and resource usage over time
5. **Test failure scenarios**: Regularly test how system behaves when services fail

## Related Documentation

- [Performance Monitoring](./PERFORMANCE_MONITORING_IMPLEMENTATION.md)
- [Database Connection Pool](./DATABASE_CONNECTION_POOL_IMPLEMENTATION.md)
- [Redis Setup](./REDIS_SETUP.md)
