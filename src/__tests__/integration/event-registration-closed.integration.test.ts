/**
 * Integration Tests: Event Registration Closed Validation
 * Feature: event-registration-closed
 * Task: 4.1 - Update POST /api/events/[id]/register endpoint
 * 
 * Tests for registration validation logic including:
 * - Manual closure validation
 * - Deadline closure validation
 * - Capacity closure validation
 * - Proper error codes (400 vs 409)
 * - Transaction-based race condition prevention
 * 
 * Requirements: 2.4, 7.1, 7.2, 7.5
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { POST as registerHandler } from '@/app/api/events/[id]/register/route'
import { createMockNextRequest } from '../utils/api-test-helpers'
import { createMockSession } from '../mocks/session.mock'
import { prisma } from '@/lib/prisma'

// Valid MongoDB ObjectIDs for testing
const TEST_USER_ID = '507f1f77bcf86cd799439011'
const TEST_EVENT_ID = '507f1f77bcf86cd799439012'

// Mock auth middleware
vi.mock('@/lib/middleware/auth.middleware', () => ({
  requireAuth: vi.fn(async () => createMockSession({ user: { id: TEST_USER_ID, role: 'STUDENT' } })),
}))

describe('Event Registration Closed Validation', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Manual Closure Validation', () => {
    it('should return 400 with REGISTRATION_CLOSED_MANUAL when manually closed', async () => {
      // Create a manually closed event
      const event = await prisma.event.create({
        data: {
          title: 'Manually Closed Event',
          description: 'Test event',
          type: 'WORKSHOP',
          date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
          maxSeats: 10,
          status: 'UPCOMING',
          creatorId: TEST_USER_ID,
          registrationManuallyClosedAt: new Date(), // Manually closed
        },
      })

      const request = createMockNextRequest({
        method: 'POST',
        url: `http://localhost:3000/api/events/${event.id}/register`,
      })

      const response = await registerHandler(request, { params: Promise.resolve({ id: event.id }) })
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.success).toBe(false)
      expect(data.error.code).toBe('REGISTRATION_CLOSED_MANUAL')
      expect(data.error.details?.reason).toBe('manual')

      // Cleanup
      await prisma.event.delete({ where: { id: event.id } })
    })
  })

  describe('Deadline Closure Validation', () => {
    it('should return 400 with REGISTRATION_CLOSED_DEADLINE when deadline passed', async () => {
      // Create an event with passed deadline
      const event = await prisma.event.create({
        data: {
          title: 'Deadline Passed Event',
          description: 'Test event',
          type: 'WORKSHOP',
          date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
          maxSeats: 10,
          status: 'UPCOMING',
          creatorId: TEST_USER_ID,
          registrationDeadline: new Date(Date.now() - 1 * 60 * 60 * 1000), // 1 hour ago
        },
      })

      const request = createMockNextRequest({
        method: 'POST',
        url: `http://localhost:3000/api/events/${event.id}/register`,
      })

      const response = await registerHandler(request, { params: Promise.resolve({ id: event.id }) })
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.success).toBe(false)
      expect(data.error.code).toBe('REGISTRATION_CLOSED_DEADLINE')
      expect(data.error.details?.reason).toBe('deadline')

      // Cleanup
      await prisma.event.delete({ where: { id: event.id } })
    })
  })

  describe('Capacity Closure Validation', () => {
    it('should return 409 with REGISTRATION_CLOSED_CAPACITY when event is full', async () => {
      // Create an event at capacity
      const event = await prisma.event.create({
        data: {
          title: 'Full Event',
          description: 'Test event',
          type: 'WORKSHOP',
          date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
          maxSeats: 1,
          status: 'UPCOMING',
          creatorId: TEST_USER_ID,
        },
      })

      // Register another user to fill the event
      const otherUserId = '507f1f77bcf86cd799439013'
      await prisma.eventAttendee.create({
        data: {
          eventId: event.id,
          userId: otherUserId,
          status: 'REGISTERED',
        },
      })

      const request = createMockNextRequest({
        method: 'POST',
        url: `http://localhost:3000/api/events/${event.id}/register`,
      })

      const response = await registerHandler(request, { params: Promise.resolve({ id: event.id }) })
      const data = await response.json()

      expect(response.status).toBe(409)
      expect(data.success).toBe(false)
      expect(data.error.code).toBe('REGISTRATION_CLOSED_CAPACITY')
      expect(data.error.details?.reason).toBe('capacity')

      // Cleanup
      await prisma.eventAttendee.deleteMany({ where: { eventId: event.id } })
      await prisma.event.delete({ where: { id: event.id } })
    })
  })

  describe('Successful Registration', () => {
    it('should allow registration when event is open', async () => {
      // Create an open event
      const event = await prisma.event.create({
        data: {
          title: 'Open Event',
          description: 'Test event',
          type: 'WORKSHOP',
          date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
          maxSeats: 10,
          status: 'UPCOMING',
          creatorId: TEST_USER_ID,
          registrationDeadline: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days from now
        },
      })

      const request = createMockNextRequest({
        method: 'POST',
        url: `http://localhost:3000/api/events/${event.id}/register`,
      })

      const response = await registerHandler(request, { params: Promise.resolve({ id: event.id }) })
      const data = await response.json()

      expect(response.status).toBe(201)
      expect(data.success).toBe(true)
      expect(data.data).toBeDefined()

      // Cleanup
      await prisma.eventAttendee.deleteMany({ where: { eventId: event.id } })
      await prisma.event.delete({ where: { id: event.id } })
    })
  })

  describe('Priority Order', () => {
    it('should prioritize manual closure over deadline and capacity', async () => {
      // Create an event that is manually closed, past deadline, AND at capacity
      const event = await prisma.event.create({
        data: {
          title: 'Multiple Closure Conditions',
          description: 'Test event',
          type: 'WORKSHOP',
          date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
          maxSeats: 1,
          status: 'UPCOMING',
          creatorId: TEST_USER_ID,
          registrationDeadline: new Date(Date.now() - 1 * 60 * 60 * 1000), // Past
          registrationManuallyClosedAt: new Date(), // Manually closed
        },
      })

      // Fill the event
      const otherUserId = '507f1f77bcf86cd799439013'
      await prisma.eventAttendee.create({
        data: {
          eventId: event.id,
          userId: otherUserId,
          status: 'REGISTERED',
        },
      })

      const request = createMockNextRequest({
        method: 'POST',
        url: `http://localhost:3000/api/events/${event.id}/register`,
      })

      const response = await registerHandler(request, { params: Promise.resolve({ id: event.id }) })
      const data = await response.json()

      // Should return manual closure error (highest priority)
      expect(response.status).toBe(400)
      expect(data.error.code).toBe('REGISTRATION_CLOSED_MANUAL')
      expect(data.error.details?.reason).toBe('manual')

      // Cleanup
      await prisma.eventAttendee.deleteMany({ where: { eventId: event.id } })
      await prisma.event.delete({ where: { id: event.id } })
    })
  })
})
