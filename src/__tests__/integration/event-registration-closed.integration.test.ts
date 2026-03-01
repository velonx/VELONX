/**
 * Integration Tests: Event Registration Closed Validation
 * Feature: event-registration-closed
 *
 * Tests for registration validation logic:
 * - Manual closure: REGISTRATION_CLOSED_MANUAL (400)
 * - Deadline closure: REGISTRATION_CLOSED_DEADLINE (400)
 * - Capacity closure: REGISTRATION_CLOSED_CAPACITY (409)
 * - Priority order check
 *
 * NOTE: Uses in-memory Prisma mocks — no real DB required.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { POST as registerHandler } from '@/app/api/events/[id]/register/route'
import { createMockNextRequest } from '../utils/api-test-helpers'
import { createMockSession } from '../mocks/session.mock'

const TEST_USER_ID = '507f1f77bcf86cd799439011'
const OTHER_USER_ID = '507f1f77bcf86cd799439013'

// ─── Single shared mock event ID ─────────────────────────────────────────────
const TEST_EVENT_ID = '507f1f77bcf86cd799439012'

vi.mock('@/lib/prisma', () => ({
  prisma: {
    event: {
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      findMany: vi.fn().mockResolvedValue([]),
    },
    eventAttendee: {
      findFirst: vi.fn(),
      count: vi.fn(),
      create: vi.fn().mockResolvedValue({ id: 'attendee-123' }),
      deleteMany: vi.fn().mockResolvedValue({ count: 0 }),
      findMany: vi.fn().mockResolvedValue([]),
    },
    eventRegistration: {
      findFirst: vi.fn().mockResolvedValue(null),
      create: vi.fn().mockResolvedValue({ id: 'reg-123' }),
      findMany: vi.fn().mockResolvedValue([]),
      count: vi.fn().mockResolvedValue(0),
      update: vi.fn().mockResolvedValue({}),
      delete: vi.fn().mockResolvedValue({}),
    },
    user: {
      findUnique: vi.fn().mockResolvedValue({ id: '507f1f77bcf86cd799439011', name: 'Test User', role: 'STUDENT' }),
    },
  },
}))

vi.mock('@/lib/middleware/auth.middleware', () => ({
  requireAuth: vi.fn(async () =>
    createMockSession({ user: { id: '507f1f77bcf86cd799439011', role: 'STUDENT' } })
  ),
}))

describe.skip('Event Registration Closed Validation (Feature: Registration Closed - pending route implementation)', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Manual Closure Validation', () => {
    it('should return 400 with REGISTRATION_CLOSED_MANUAL when manually closed', async () => {
      const { prisma } = await import('@/lib/prisma')
      const closedEvent = {
        id: TEST_EVENT_ID,
        title: 'Manually Closed Event',
        type: 'WORKSHOP',
        date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        maxSeats: 10,
        status: 'UPCOMING',
        creatorId: TEST_USER_ID,
        registrationManuallyClosedAt: new Date(), // closed
        registrationDeadline: null,
      }
      vi.mocked(prisma.event.findUnique).mockResolvedValue(closedEvent as any)
      vi.mocked(prisma.eventAttendee.findFirst).mockResolvedValue(null)
      vi.mocked(prisma.eventAttendee.count).mockResolvedValue(0)
      vi.mocked((prisma as any).eventRegistration.findFirst).mockResolvedValue(null)
      vi.mocked(prisma.user.findUnique).mockResolvedValue({
        id: TEST_USER_ID, name: 'Test User', role: 'STUDENT'
      } as any)

      const request = createMockNextRequest({
        method: 'POST',
        url: `http://localhost:3000/api/events/${TEST_EVENT_ID}/register`,
      })
      const response = await registerHandler(request, { params: Promise.resolve({ id: TEST_EVENT_ID }) })
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.success).toBe(false)
      expect(data.error.code).toBe('REGISTRATION_CLOSED_MANUAL')
    })
  })

  describe('Deadline Closure Validation', () => {
    it('should return 400 with REGISTRATION_CLOSED_DEADLINE when deadline passed', async () => {
      const { prisma } = await import('@/lib/prisma')
      const deadlineEvent = {
        id: TEST_EVENT_ID,
        title: 'Deadline Passed Event',
        type: 'WORKSHOP',
        date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        maxSeats: 10,
        status: 'UPCOMING',
        creatorId: TEST_USER_ID,
        registrationManuallyClosedAt: null,
        registrationDeadline: new Date(Date.now() - 60 * 60 * 1000), // 1 hour ago
      }
      vi.mocked(prisma.event.findUnique).mockResolvedValue(deadlineEvent as any)
      vi.mocked(prisma.eventAttendee.findFirst).mockResolvedValue(null)
      vi.mocked(prisma.eventAttendee.count).mockResolvedValue(0)
      vi.mocked((prisma as any).eventRegistration.findFirst).mockResolvedValue(null)
      vi.mocked(prisma.user.findUnique).mockResolvedValue({
        id: TEST_USER_ID, name: 'Test User', role: 'STUDENT'
      } as any)

      const request = createMockNextRequest({
        method: 'POST',
        url: `http://localhost:3000/api/events/${TEST_EVENT_ID}/register`,
      })
      const response = await registerHandler(request, { params: Promise.resolve({ id: TEST_EVENT_ID }) })
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.success).toBe(false)
      expect(data.error.code).toBe('REGISTRATION_CLOSED_DEADLINE')
    })
  })

  describe('Capacity Closure Validation', () => {
    it('should return 409 with REGISTRATION_CLOSED_CAPACITY when event is full', async () => {
      const { prisma } = await import('@/lib/prisma')
      const fullEvent = {
        id: TEST_EVENT_ID,
        title: 'Full Event',
        type: 'WORKSHOP',
        date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        maxSeats: 1,
        status: 'UPCOMING',
        creatorId: TEST_USER_ID,
        registrationManuallyClosedAt: null,
        registrationDeadline: null,
      }
      vi.mocked(prisma.event.findUnique).mockResolvedValue(fullEvent as any)
      vi.mocked(prisma.eventAttendee.findFirst).mockResolvedValue(null)
      // count returns 1 (= maxSeats), so event is full
      vi.mocked(prisma.eventAttendee.count).mockResolvedValue(1)
      vi.mocked((prisma as any).eventRegistration.findFirst).mockResolvedValue(null)
      vi.mocked(prisma.user.findUnique).mockResolvedValue({
        id: TEST_USER_ID, name: 'Test User', role: 'STUDENT'
      } as any)

      const request = createMockNextRequest({
        method: 'POST',
        url: `http://localhost:3000/api/events/${TEST_EVENT_ID}/register`,
      })
      const response = await registerHandler(request, { params: Promise.resolve({ id: TEST_EVENT_ID }) })
      const data = await response.json()

      expect(response.status).toBe(409)
      expect(data.success).toBe(false)
      expect(data.error.code).toBe('REGISTRATION_CLOSED_CAPACITY')
    })
  })

  describe('Priority Order', () => {
    it('should prioritize manual closure over deadline and capacity', async () => {
      const { prisma } = await import('@/lib/prisma')
      const multiClosedEvent = {
        id: TEST_EVENT_ID,
        title: 'Multiple Closure Conditions',
        type: 'WORKSHOP',
        date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        maxSeats: 1,
        status: 'UPCOMING',
        creatorId: TEST_USER_ID,
        registrationDeadline: new Date(Date.now() - 60 * 60 * 1000), // past
        registrationManuallyClosedAt: new Date(), // manually closed
      }
      vi.mocked(prisma.event.findUnique).mockResolvedValue(multiClosedEvent as any)
      vi.mocked(prisma.eventAttendee.findFirst).mockResolvedValue(null)
      vi.mocked(prisma.eventAttendee.count).mockResolvedValue(1) // full
      vi.mocked((prisma as any).eventRegistration.findFirst).mockResolvedValue(null)
      vi.mocked(prisma.user.findUnique).mockResolvedValue({
        id: TEST_USER_ID, name: 'Test User', role: 'STUDENT'
      } as any)

      const request = createMockNextRequest({
        method: 'POST',
        url: `http://localhost:3000/api/events/${TEST_EVENT_ID}/register`,
      })
      const response = await registerHandler(request, { params: Promise.resolve({ id: TEST_EVENT_ID }) })
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error.code).toBe('REGISTRATION_CLOSED_MANUAL')
    })
  })
})
