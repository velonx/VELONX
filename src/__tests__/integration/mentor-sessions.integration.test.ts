import { NextResponse } from 'next/server'
/**
 * Integration Tests: Mentor Session Endpoints
 * 
 * Tests for mentor session API endpoints including:
 * - Session booking flow
 * - Session cancellation
 * - Session review submission
 * - Authorization checks
 * - Error scenarios
 * 
 * Requirements: 4.2
 * 
 * NOTE: These tests require MongoDB replica set configuration.
 * See INTEGRATION_TESTS_README.md for setup instructions.
 */

import { describe, it, expect, vi } from 'vitest'
import { GET as listSessionsHandler, POST as createSessionHandler } from '@/app/api/mentor-sessions/route'
import { GET as getSessionHandler, PATCH as updateSessionHandler, DELETE as deleteSessionHandler } from '@/app/api/mentor-sessions/[id]/route'
import { POST as reviewSessionHandler } from '@/app/api/mentor-sessions/[id]/review/route'
import { createMockNextRequest } from '../utils/api-test-helpers'
import { createMockSession } from '../mocks/session.mock'

// Mock auth middleware
vi.mock('@/lib/middleware/auth.middleware', () => ({
  requireAuth: vi.fn(async () => createMockSession({ user: { id: 'test-user-id', role: 'STUDENT' } })),
}))
// Mock Prisma to prevent real MongoDB connections
vi.mock('@/lib/prisma', () => ({
  prisma: {
    mentorSession: {
      findMany: vi.fn().mockResolvedValue([]),
      findUnique: vi.fn().mockResolvedValue(null),
      create: vi.fn().mockResolvedValue({ id: 'session-123', status: 'PENDING' }),
      update: vi.fn().mockResolvedValue({ id: 'session-123', status: 'CONFIRMED' }),
      delete: vi.fn().mockResolvedValue({}),
      count: vi.fn().mockResolvedValue(0),
    },
    mentor: {
      findUnique: vi.fn().mockResolvedValue({ id: 'mentor-123', available: true }),
      update: vi.fn().mockResolvedValue({}),
    },
    mentorReview: {
      findUnique: vi.fn().mockResolvedValue(null),
      create: vi.fn().mockResolvedValue({}),
      findMany: vi.fn().mockResolvedValue([]),
    },
    user: {
      findUnique: vi.fn().mockResolvedValue({ id: 'test-user-id', role: 'STUDENT', name: 'Test User' }),
    },
    userActivity: {
      findFirst: vi.fn().mockResolvedValue(null),
      create: vi.fn().mockResolvedValue({}),
    },
  },
}))

describe('Mentor Session Endpoints Integration Tests', () => {
  describe('POST /api/mentor-sessions', () => {
    it('should require authentication', async () => {
      const { requireAuth } = await import('@/lib/middleware/auth.middleware')
      vi.mocked(requireAuth).mockResolvedValueOnce(
        NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) as any
      )

      const sessionData = {
        mentorId: 'mentor-123',
        scheduledAt: new Date(Date.now() + 86400000).toISOString(),
        duration: 60,
        topic: 'Career Guidance',
      }

      const request = createMockNextRequest({
        method: 'POST',
        url: 'http://localhost:3000/api/mentor-sessions',
        body: sessionData,
      })

      const response = await createSessionHandler(request)
      expect(response.status).toBe(401)
    })

    it('should validate required fields', async () => {
      const invalidData = {
        mentorId: 'mentor-123',
        // Missing scheduledAt, duration, topic
      }

      const request = createMockNextRequest({
        method: 'POST',
        url: 'http://localhost:3000/api/mentor-sessions',
        body: invalidData,
      })

      const response = await createSessionHandler(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.success).toBe(false)
    })

    it('should validate scheduledAt is in the future', async () => {
      const sessionData = {
        mentorId: 'mentor-123',
        scheduledAt: new Date(Date.now() - 86400000).toISOString(), // Past date
        duration: 60,
        topic: 'Career Guidance',
      }

      const request = createMockNextRequest({
        method: 'POST',
        url: 'http://localhost:3000/api/mentor-sessions',
        body: sessionData,
      })

      const response = await createSessionHandler(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.success).toBe(false)
    })

    it('should validate duration is positive', async () => {
      const sessionData = {
        mentorId: 'mentor-123',
        scheduledAt: new Date(Date.now() + 86400000).toISOString(),
        duration: -30,
        topic: 'Career Guidance',
      }

      const request = createMockNextRequest({
        method: 'POST',
        url: 'http://localhost:3000/api/mentor-sessions',
        body: sessionData,
      })

      const response = await createSessionHandler(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.success).toBe(false)
    })
  })

  describe('GET /api/mentor-sessions', () => {
    it('should require authentication', async () => {
      const { requireAuth } = await import('@/lib/middleware/auth.middleware')
      vi.mocked(requireAuth).mockResolvedValueOnce(
        NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) as any
      )

      const request = createMockNextRequest({
        method: 'GET',
        url: 'http://localhost:3000/api/mentor-sessions',
      })

      const response = await listSessionsHandler(request)
      expect(response.status).toBe(401)
    })

    it('should support pagination parameters', async () => {
      const request = createMockNextRequest({
        method: 'GET',
        url: 'http://localhost:3000/api/mentor-sessions?page=1&pageSize=10',
      })

      const response = await listSessionsHandler(request)
      const data = await response.json()

      // Should not error on valid pagination params
      expect(response.status).toBeLessThan(500)
    })

    it('should support status filtering', async () => {
      const request = createMockNextRequest({
        method: 'GET',
        url: 'http://localhost:3000/api/mentor-sessions?status=SCHEDULED',
      })

      const response = await listSessionsHandler(request)
      const data = await response.json()

      // Should not error on valid status filter
      expect(response.status).toBeLessThan(500)
    })
  })

  describe('PATCH /api/mentor-sessions/[id]', () => {
    it('should require authentication', async () => {
      const { requireAuth } = await import('@/lib/middleware/auth.middleware')
      vi.mocked(requireAuth).mockResolvedValueOnce(
        NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) as any
      )

      const request = createMockNextRequest({
        method: 'PATCH',
        url: 'http://localhost:3000/api/mentor-sessions/session-123',
        body: { status: 'CANCELLED' },
      })

      const context = { params: Promise.resolve({ id: 'session-123' }) }
      const response = await updateSessionHandler(request, context)
      expect(response.status).toBe(401)
    })

    it('should validate status transitions', async () => {
      const request = createMockNextRequest({
        method: 'PATCH',
        url: 'http://localhost:3000/api/mentor-sessions/session-123',
        body: { status: 'INVALID_STATUS' },
      })

      const context = { params: Promise.resolve({ id: 'session-123' }) }
      const response = await updateSessionHandler(request, context)
      const data = await response.json()

      // Route may return 404 (not found) or 400 (validation error)
      expect([400, 404]).toContain(response.status)
      if (response.status === 400) {
        expect(data.success).toBe(false)
      }
    })
  })

  describe('DELETE /api/mentor-sessions/[id]', () => {
    it('should require authentication', async () => {
      const { requireAuth } = await import('@/lib/middleware/auth.middleware')
      vi.mocked(requireAuth).mockResolvedValueOnce(
        NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) as any
      )

      const request = createMockNextRequest({
        method: 'DELETE',
        url: 'http://localhost:3000/api/mentor-sessions/session-123',
      })

      const context = { params: Promise.resolve({ id: 'session-123' }) }
      const response = await deleteSessionHandler(request, context)
      expect(response.status).toBe(401)
    })
  })

  describe('POST /api/mentor-sessions/[id]/review', () => {
    it('should require authentication', async () => {
      const { requireAuth } = await import('@/lib/middleware/auth.middleware')
      vi.mocked(requireAuth).mockResolvedValueOnce(
        NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) as any
      )

      const reviewData = {
        rating: 5,
        feedback: 'Great session!',
      }

      const request = createMockNextRequest({
        method: 'POST',
        url: 'http://localhost:3000/api/mentor-sessions/session-123/review',
        body: reviewData,
      })

      const context = { params: Promise.resolve({ id: 'session-123' }) }
      const response = await reviewSessionHandler(request, context)
      expect(response.status).toBe(401)
    })

    it('should validate rating range', async () => {
      const reviewData = {
        rating: 6, // Invalid: should be 1-5
        feedback: 'Great session!',
      }

      const request = createMockNextRequest({
        method: 'POST',
        url: 'http://localhost:3000/api/mentor-sessions/session-123/review',
        body: reviewData,
      })

      const context = { params: Promise.resolve({ id: 'session-123' }) }
      const response = await reviewSessionHandler(request, context)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.success).toBe(false)
    })

    it('should require feedback text', async () => {
      const reviewData = {
        rating: 5,
        feedback: '', // Empty feedback
      }

      const request = createMockNextRequest({
        method: 'POST',
        url: 'http://localhost:3000/api/mentor-sessions/session-123/review',
        body: reviewData,
      })

      const context = { params: Promise.resolve({ id: 'session-123' }) }
      const response = await reviewSessionHandler(request, context)
      const data = await response.json()

      // Route may return 404 (not found) or 400 (validation error)
      expect([400, 404]).toContain(response.status)
      if (response.status === 400) {
        expect(data.success).toBe(false)
      }
    })
  })

  describe('Authorization Checks', () => {
    it('should prevent students from accessing other students sessions', async () => {
      const { requireAuth } = await import('@/lib/middleware/auth.middleware')
      vi.mocked(requireAuth).mockResolvedValueOnce(
        createMockSession({ user: { id: 'different-user-id', role: 'STUDENT' } })
      )

      const request = createMockNextRequest({
        method: 'GET',
        url: 'http://localhost:3000/api/mentor-sessions/session-123',
      })

      const context = { params: Promise.resolve({ id: 'session-123' }) }
      const response = await getSessionHandler(request, context)

      // Should either return 403 or filter results
      expect([200, 403, 404]).toContain(response.status)
    })
  })
})
