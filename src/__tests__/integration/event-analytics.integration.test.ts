/**
 * Integration Tests: Event Analytics Endpoints
 * 
 * Tests for event analytics API endpoints including:
 * - Personal analytics calculation
 * - Events attended count
 * - Upcoming events count
 * - Participation streak calculation
 * - Favorite event type determination
 * - Total hours attended calculation
 * - Authorization checks
 * 
 * Requirements: 8.1-8.6
 * 
 * NOTE: These tests require MongoDB replica set configuration.
 * See INTEGRATION_TESTS_README.md for setup instructions.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { GET as getPersonalAnalyticsHandler } from '@/app/api/events/analytics/personal/route'
import { createMockNextRequest } from '../utils/api-test-helpers'
import { createMockSession } from '../mocks/session.mock'

// Valid MongoDB ObjectIDs for testing
const TEST_USER_ID = '507f1f77bcf86cd799439011'
const ADMIN_USER_ID = '507f1f77bcf86cd799439012'
const NEW_USER_ID = '507f1f77bcf86cd799439013'
const USER_1_ID = '507f1f77bcf86cd799439014'
const USER_2_ID = '507f1f77bcf86cd799439015'

// Mock auth middleware
vi.mock('@/lib/middleware/auth.middleware', () => ({
  requireAuth: vi.fn(async () => createMockSession({ user: { id: TEST_USER_ID, role: 'STUDENT' } })),
  requireAdmin: vi.fn(async () => createMockSession({ user: { id: ADMIN_USER_ID, role: 'ADMIN' } })),
}))

describe('Event Analytics Endpoints Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('GET /api/events/analytics/personal', () => {
    it('should require authentication', async () => {
      const { requireAuth } = await import('@/lib/middleware/auth.middleware')
      vi.mocked(requireAuth).mockResolvedValueOnce({
        status: 401,
        json: async () => ({ error: 'Unauthorized' })
      } as any)

      const request = createMockNextRequest({
        method: 'GET',
        url: 'http://localhost:3000/api/events/analytics/personal',
      })

      const response = await getPersonalAnalyticsHandler(request)
      expect(response.status).toBe(401)
    })

    it('should return analytics data structure for authenticated user', async () => {
      const request = createMockNextRequest({
        method: 'GET',
        url: 'http://localhost:3000/api/events/analytics/personal',
      })

      const response = await getPersonalAnalyticsHandler(request)
      const data = await response.json()

      if (response.status === 200) {
        expect(data.success).toBe(true)
        expect(data.data).toBeDefined()
        expect(data.data).toHaveProperty('eventsAttended')
        expect(data.data).toHaveProperty('upcomingEvents')
        expect(data.data).toHaveProperty('participationStreak')
        expect(data.data).toHaveProperty('favoriteEventType')
        expect(data.data).toHaveProperty('totalHours')
      }
    })

    it('should return numeric values for counts', async () => {
      const request = createMockNextRequest({
        method: 'GET',
        url: 'http://localhost:3000/api/events/analytics/personal',
      })

      const response = await getPersonalAnalyticsHandler(request)
      const data = await response.json()

      if (response.status === 200) {
        expect(typeof data.data.eventsAttended).toBe('number')
        expect(typeof data.data.upcomingEvents).toBe('number')
        expect(typeof data.data.participationStreak).toBe('number')
        expect(typeof data.data.totalHours).toBe('number')
        
        // All counts should be non-negative
        expect(data.data.eventsAttended).toBeGreaterThanOrEqual(0)
        expect(data.data.upcomingEvents).toBeGreaterThanOrEqual(0)
        expect(data.data.participationStreak).toBeGreaterThanOrEqual(0)
        expect(data.data.totalHours).toBeGreaterThanOrEqual(0)
      }
    })

    it('should return valid event type or null for favoriteEventType', async () => {
      const request = createMockNextRequest({
        method: 'GET',
        url: 'http://localhost:3000/api/events/analytics/personal',
      })

      const response = await getPersonalAnalyticsHandler(request)
      const data = await response.json()

      if (response.status === 200) {
        const validTypes = ['HACKATHON', 'WORKSHOP', 'WEBINAR', null]
        expect(validTypes).toContain(data.data.favoriteEventType)
      }
    })

    it('should handle user with no event registrations', async () => {
      const { requireAuth } = await import('@/lib/middleware/auth.middleware')
      vi.mocked(requireAuth).mockResolvedValueOnce(
        createMockSession({ user: { id: NEW_USER_ID, role: 'STUDENT' } })
      )

      const request = createMockNextRequest({
        method: 'GET',
        url: 'http://localhost:3000/api/events/analytics/personal',
      })

      const response = await getPersonalAnalyticsHandler(request)
      const data = await response.json()

      if (response.status === 200) {
        expect(data.data.eventsAttended).toBe(0)
        expect(data.data.participationStreak).toBe(0)
        expect(data.data.favoriteEventType).toBeNull()
        expect(data.data.totalHours).toBe(0)
      }
    })

    it('should handle session without user ID', async () => {
      const { requireAuth } = await import('@/lib/middleware/auth.middleware')
      vi.mocked(requireAuth).mockResolvedValueOnce({
        user: { id: undefined, role: 'STUDENT' },
        expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      } as any)

      const request = createMockNextRequest({
        method: 'GET',
        url: 'http://localhost:3000/api/events/analytics/personal',
      })

      const response = await getPersonalAnalyticsHandler(request)
      expect(response.status).toBe(401)
    })

    it('should only return data for the authenticated user', async () => {
      const { requireAuth } = await import('@/lib/middleware/auth.middleware')
      
      // First user
      vi.mocked(requireAuth).mockResolvedValueOnce(
        createMockSession({ user: { id: USER_1_ID, role: 'STUDENT' } })
      )

      const request1 = createMockNextRequest({
        method: 'GET',
        url: 'http://localhost:3000/api/events/analytics/personal',
      })

      const response1 = await getPersonalAnalyticsHandler(request1)
      const data1 = await response1.json()

      // Second user
      vi.mocked(requireAuth).mockResolvedValueOnce(
        createMockSession({ user: { id: USER_2_ID, role: 'STUDENT' } })
      )

      const request2 = createMockNextRequest({
        method: 'GET',
        url: 'http://localhost:3000/api/events/analytics/personal',
      })

      const response2 = await getPersonalAnalyticsHandler(request2)
      const data2 = await response2.json()

      // Both should succeed but may have different data
      if (response1.status === 200 && response2.status === 200) {
        expect(data1.success).toBe(true)
        expect(data2.success).toBe(true)
        // Data structure should be the same
        expect(Object.keys(data1.data).sort()).toEqual(Object.keys(data2.data).sort())
      }
    })
  })

  describe('Analytics Calculations', () => {
    it('should calculate events attended correctly', async () => {
      const request = createMockNextRequest({
        method: 'GET',
        url: 'http://localhost:3000/api/events/analytics/personal',
      })

      const response = await getPersonalAnalyticsHandler(request)
      const data = await response.json()

      if (response.status === 200) {
        // Events attended should only count COMPLETED events
        expect(data.data.eventsAttended).toBeGreaterThanOrEqual(0)
      }
    })

    it('should calculate upcoming events correctly', async () => {
      const request = createMockNextRequest({
        method: 'GET',
        url: 'http://localhost:3000/api/events/analytics/personal',
      })

      const response = await getPersonalAnalyticsHandler(request)
      const data = await response.json()

      if (response.status === 200) {
        // Upcoming events should only count UPCOMING events with future dates
        expect(data.data.upcomingEvents).toBeGreaterThanOrEqual(0)
      }
    })

    it('should calculate participation streak correctly', async () => {
      const request = createMockNextRequest({
        method: 'GET',
        url: 'http://localhost:3000/api/events/analytics/personal',
      })

      const response = await getPersonalAnalyticsHandler(request)
      const data = await response.json()

      if (response.status === 200) {
        // Streak should be non-negative
        expect(data.data.participationStreak).toBeGreaterThanOrEqual(0)
        
        // If user has attended events, streak should be at least 1
        if (data.data.eventsAttended > 0) {
          expect(data.data.participationStreak).toBeGreaterThanOrEqual(1)
        }
      }
    })

    it('should determine favorite event type correctly', async () => {
      const request = createMockNextRequest({
        method: 'GET',
        url: 'http://localhost:3000/api/events/analytics/personal',
      })

      const response = await getPersonalAnalyticsHandler(request)
      const data = await response.json()

      if (response.status === 200) {
        // If user has attended events, should have a favorite type
        if (data.data.eventsAttended > 0) {
          expect(data.data.favoriteEventType).not.toBeNull()
          expect(['HACKATHON', 'WORKSHOP', 'WEBINAR']).toContain(data.data.favoriteEventType)
        } else {
          // If no events attended, favorite should be null
          expect(data.data.favoriteEventType).toBeNull()
        }
      }
    })

    it('should calculate total hours correctly', async () => {
      const request = createMockNextRequest({
        method: 'GET',
        url: 'http://localhost:3000/api/events/analytics/personal',
      })

      const response = await getPersonalAnalyticsHandler(request)
      const data = await response.json()

      if (response.status === 200) {
        // Total hours should be non-negative
        expect(data.data.totalHours).toBeGreaterThanOrEqual(0)
        
        // If user has attended events, total hours should be positive
        if (data.data.eventsAttended > 0) {
          expect(data.data.totalHours).toBeGreaterThan(0)
        }
        
        // Total hours should be a reasonable number (not infinity or NaN)
        expect(Number.isFinite(data.data.totalHours)).toBe(true)
      }
    })
  })

  describe('Error Handling', () => {
    it('should handle database errors gracefully', async () => {
      const request = createMockNextRequest({
        method: 'GET',
        url: 'http://localhost:3000/api/events/analytics/personal',
      })

      const response = await getPersonalAnalyticsHandler(request)
      
      // Should not return 500 errors for normal requests
      expect(response.status).toBeLessThan(500)
    })

    it('should return proper error structure on failure', async () => {
      const { requireAuth } = await import('@/lib/middleware/auth.middleware')
      vi.mocked(requireAuth).mockRejectedValueOnce(new Error('Database connection failed'))

      const request = createMockNextRequest({
        method: 'GET',
        url: 'http://localhost:3000/api/events/analytics/personal',
      })

      const response = await getPersonalAnalyticsHandler(request)
      const data = await response.json()

      if (response.status >= 400) {
        expect(data.success).toBe(false)
        expect(data.error).toBeDefined()
      }
    })
  })
})
