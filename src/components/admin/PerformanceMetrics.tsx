'use client'

/**
 * Performance Metrics Dashboard Component
 * Displays API response times, database query times, and cache metrics
 */

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Activity, Database, Layers, TrendingUp, AlertTriangle } from 'lucide-react'

interface APIMetric {
  endpoint: string
  avgResponseTime: number
  p95ResponseTime: number
  p99ResponseTime: number
  requestCount: number
  errorRate: number
}

interface DatabaseMetrics {
  avgQueryTime: number
  slowQueries: {
    model: string
    action: string
    duration: number
    timestamp: number
  }[]
  totalQueries: number
}

interface CacheMetrics {
  hitRate: number
  missRate: number
  totalOperations: number
  avgDuration: number
}

interface PerformanceMetrics {
  apiMetrics: APIMetric[]
  databaseMetrics: DatabaseMetrics
  cacheMetrics: CacheMetrics
}

export default function PerformanceMetrics() {
  const [timeRange, setTimeRange] = useState('1h')
  const [metrics, setMetrics] = useState<PerformanceMetrics | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchMetrics()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timeRange])

  const fetchMetrics = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await fetch(`/api/admin/performance?timeRange=${timeRange}`)
      
      if (!response.ok) {
        throw new Error('Failed to fetch metrics')
      }
      
      const data = await response.json()
      setMetrics(data.data.metrics)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load metrics')
    } finally {
      setLoading(false)
    }
  }

  const formatDuration = (ms: number) => {
    if (ms < 1000) return `${ms}ms`
    return `${(ms / 1000).toFixed(2)}s`
  }

  const getPerformanceBadge = (duration: number) => {
    if (duration < 500) return <Badge className="bg-green-500">Fast</Badge>
    if (duration < 1000) return <Badge className="bg-yellow-500">Good</Badge>
    if (duration < 2000) return <Badge className="bg-orange-500">Slow</Badge>
    return <Badge className="bg-red-500">Critical</Badge>
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <Activity className="h-8 w-8 animate-spin mx-auto mb-2" />
          <p className="text-sm text-muted-foreground">Loading metrics...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-2 text-red-500">
            <AlertTriangle className="h-5 w-5" />
            <p>{error}</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!metrics) {
    return null
  }

  return (
    <div className="space-y-6">
      {/* Header with time range selector */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Performance Metrics</h2>
          <p className="text-sm text-muted-foreground">
            Monitor API response times, database queries, and cache performance
          </p>
        </div>
        <Select value={timeRange} onValueChange={setTimeRange}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select time range" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="1h">Last Hour</SelectItem>
            <SelectItem value="6h">Last 6 Hours</SelectItem>
            <SelectItem value="24h">Last 24 Hours</SelectItem>
            <SelectItem value="7d">Last 7 Days</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg API Response</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {metrics.apiMetrics.length > 0
                ? formatDuration(
                    Math.round(
                      metrics.apiMetrics.reduce((sum, m) => sum + m.avgResponseTime, 0) /
                        metrics.apiMetrics.length
                    )
                  )
                : 'N/A'}
            </div>
            <p className="text-xs text-muted-foreground">
              {metrics.apiMetrics.reduce((sum, m) => sum + m.requestCount, 0)} total requests
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg DB Query Time</CardTitle>
            <Database className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatDuration(metrics.databaseMetrics.avgQueryTime)}
            </div>
            <p className="text-xs text-muted-foreground">
              {metrics.databaseMetrics.totalQueries} total queries
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cache Hit Rate</CardTitle>
            <Layers className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {metrics.cacheMetrics.hitRate.toFixed(1)}%
            </div>
            <p className="text-xs text-muted-foreground">
              {metrics.cacheMetrics.totalOperations} total operations
            </p>
          </CardContent>
        </Card>
      </div>

      {/* API Metrics Table */}
      <Card>
        <CardHeader>
          <CardTitle>API Endpoints</CardTitle>
          <CardDescription>Response times and error rates by endpoint</CardDescription>
        </CardHeader>
        <CardContent>
          {metrics.apiMetrics.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Endpoint</TableHead>
                  <TableHead>Avg Time</TableHead>
                  <TableHead>P95</TableHead>
                  <TableHead>P99</TableHead>
                  <TableHead>Requests</TableHead>
                  <TableHead>Error Rate</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {metrics.apiMetrics
                  .sort((a, b) => b.avgResponseTime - a.avgResponseTime)
                  .slice(0, 10)
                  .map((metric, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-mono text-sm">{metric.endpoint}</TableCell>
                      <TableCell>{formatDuration(metric.avgResponseTime)}</TableCell>
                      <TableCell>{formatDuration(metric.p95ResponseTime)}</TableCell>
                      <TableCell>{formatDuration(metric.p99ResponseTime)}</TableCell>
                      <TableCell>{metric.requestCount}</TableCell>
                      <TableCell>
                        {metric.errorRate > 0 ? (
                          <span className="text-red-500">{metric.errorRate.toFixed(1)}%</span>
                        ) : (
                          <span className="text-green-500">0%</span>
                        )}
                      </TableCell>
                      <TableCell>{getPerformanceBadge(metric.avgResponseTime)}</TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-4">
              No API metrics available for this time range
            </p>
          )}
        </CardContent>
      </Card>

      {/* Slow Queries Table */}
      <Card>
        <CardHeader>
          <CardTitle>Slow Database Queries</CardTitle>
          <CardDescription>Queries taking longer than 1 second</CardDescription>
        </CardHeader>
        <CardContent>
          {metrics.databaseMetrics.slowQueries.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Model</TableHead>
                  <TableHead>Action</TableHead>
                  <TableHead>Duration</TableHead>
                  <TableHead>Timestamp</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {metrics.databaseMetrics.slowQueries.slice(0, 10).map((query, index) => (
                  <TableRow key={index}>
                    <TableCell className="font-mono">{query.model}</TableCell>
                    <TableCell className="font-mono">{query.action}</TableCell>
                    <TableCell>
                      <span className="text-red-500 font-semibold">
                        {formatDuration(query.duration)}
                      </span>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {new Date(query.timestamp).toLocaleString()}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-4">
              No slow queries detected in this time range
            </p>
          )}
        </CardContent>
      </Card>

      {/* Cache Performance */}
      <Card>
        <CardHeader>
          <CardTitle>Cache Performance</CardTitle>
          <CardDescription>Cache hit/miss ratios and operation times</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Hit Rate</span>
                <span className="text-2xl font-bold text-green-500">
                  {metrics.cacheMetrics.hitRate.toFixed(1)}%
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Miss Rate</span>
                <span className="text-2xl font-bold text-orange-500">
                  {metrics.cacheMetrics.missRate.toFixed(1)}%
                </span>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Total Operations</span>
                <span className="text-2xl font-bold">{metrics.cacheMetrics.totalOperations}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Avg Duration</span>
                <span className="text-2xl font-bold">
                  {formatDuration(metrics.cacheMetrics.avgDuration)}
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
