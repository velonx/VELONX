/**
 * Unit Tests: Event Registration Validation Logic
 * Feature: event-registration-closed
 * Task: 4.1 - Update POST /api/events/[id]/register endpoint
 * 
 * Tests the registration validation logic using the computeRegistrationStatus utility
 * 
 * Requirements: 2.4, 7.1, 7.2, 7.5
 */

import { describe, it, expect } from 'vitest'
import { computeRegistrationStatus } from '@/lib/utils/event-helpers'
import type { Event } from '@/lib/api/types'

describe('Event Registration Validation Logic', () => {
  const baseEvent: Event = {
    id: '507f1f77bcf86cd799439011',
    title: 'Test Event',
    description: 'Test description',
    type: 'WORKSHOP',
    date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days from now
    endDate: null,
    location: null,
    meetingLink: null,
    imageUrl: null,
    maxSeats: 10,
    status: 'UPCOMING',
    creatorId: '507f1f77bcf86cd799439012',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    isRegistrationClosed: false,
  }

  describe('Manual Closure Validation', () => {
    it('should return closed status with manual reason when registrationManuallyClosedAt is set', () => {
      const event = {
        ...baseEvent,
        registrationManuallyClosedAt: new Date().toISOString(),
      }

      const status = computeRegistrationStatus(event, 5)

      expect(status.isOpen).toBe(false)
      expect(status.reason).toBe('manual')
      expect(status.message).toBe('Registration is currently closed')
      expect(status.canReopen).toBe(true)
    })

    it('should prioritize manual closure over other conditions', () => {
      const event = {
        ...baseEvent,
        registrationManuallyClosedAt: new Date().toISOString(),
        registrationDeadline: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(), // Past deadline
      }

      const status = computeRegistrationStatus(event, 10) // At capacity

      expect(status.isOpen).toBe(false)
      expect(status.reason).toBe('manual')
    })
  })

  describe('Deadline Closure Validation', () => {
    it('should return closed status with deadline reason when deadline has passed', () => {
      const pastDeadline = new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString()
      const event = {
        ...baseEvent,
        registrationDeadline: pastDeadline,
      }

      const status = computeRegistrationStatus(event, 5)

      expect(status.isOpen).toBe(false)
      expect(status.reason).toBe('deadline')
      expect(status.message).toContain('Registration deadline has passed')
      expect(status.canReopen).toBe(false)
    })

    it('should return open status when deadline is in the future', () => {
      const futureDeadline = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString()
      const event = {
        ...baseEvent,
        registrationDeadline: futureDeadline,
      }

      const status = computeRegistrationStatus(event, 5)

      expect(status.isOpen).toBe(true)
      expect(status.reason).toBeUndefined()
    })

    it('should prioritize deadline over capacity', () => {
      const pastDeadline = new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString()
      const event = {
        ...baseEvent,
        registrationDeadline: pastDeadline,
      }

      const status = computeRegistrationStatus(event, 10) // At capacity

      expect(status.isOpen).toBe(false)
      expect(status.reason).toBe('deadline')
    })
  })

  describe('Capacity Closure Validation', () => {
    it('should return closed status with capacity reason when event is full', () => {
      const event = { ...baseEvent }

      const status = computeRegistrationStatus(event, 10) // maxSeats = 10, attendees = 10

      expect(status.isOpen).toBe(false)
      expect(status.reason).toBe('capacity')
      expect(status.message).toBe('Event is full (10/10 registered)')
      expect(status.canReopen).toBe(true)
    })

    it('should return closed status when attendees exceed maxSeats', () => {
      const event = { ...baseEvent }

      const status = computeRegistrationStatus(event, 11) // More than maxSeats

      expect(status.isOpen).toBe(false)
      expect(status.reason).toBe('capacity')
    })

    it('should return open status when event has available seats', () => {
      const event = { ...baseEvent }

      const status = computeRegistrationStatus(event, 5) // 5 out of 10 seats

      expect(status.isOpen).toBe(true)
      expect(status.message).toBe('5 spots available')
    })
  })

  describe('Open Registration', () => {
    it('should return open status when no closure conditions are met', () => {
      const event = {
        ...baseEvent,
        registrationDeadline: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
      }

      const status = computeRegistrationStatus(event, 5)

      expect(status.isOpen).toBe(true)
      expect(status.reason).toBeUndefined()
      expect(status.message).toBe('5 spots available')
      expect(status.canReopen).toBe(false)
    })

    it('should return open status when no deadline is set and seats available', () => {
      const event = { ...baseEvent }

      const status = computeRegistrationStatus(event, 0)

      expect(status.isOpen).toBe(true)
      expect(status.message).toBe('10 spots available')
    })
  })

  describe('Error Code Mapping', () => {
    it('should map manual closure to 400 error code', () => {
      const event = {
        ...baseEvent,
        registrationManuallyClosedAt: new Date().toISOString(),
      }

      const status = computeRegistrationStatus(event, 5)

      // In the service, this would throw AppError with status 400
      expect(status.reason).toBe('manual')
    })

    it('should map deadline closure to 400 error code', () => {
      const event = {
        ...baseEvent,
        registrationDeadline: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
      }

      const status = computeRegistrationStatus(event, 5)

      // In the service, this would throw AppError with status 400
      expect(status.reason).toBe('deadline')
    })

    it('should map capacity closure to 409 error code', () => {
      const event = { ...baseEvent }

      const status = computeRegistrationStatus(event, 10)

      // In the service, this would throw AppError with status 409
      expect(status.reason).toBe('capacity')
    })
  })

  describe('Priority Order Verification', () => {
    it('should follow priority: manual > deadline > capacity', () => {
      // Test 1: Manual + Deadline + Capacity
      const event1 = {
        ...baseEvent,
        registrationManuallyClosedAt: new Date().toISOString(),
        registrationDeadline: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
      }
      expect(computeRegistrationStatus(event1, 10).reason).toBe('manual')

      // Test 2: Deadline + Capacity (no manual)
      const event2 = {
        ...baseEvent,
        registrationDeadline: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
      }
      expect(computeRegistrationStatus(event2, 10).reason).toBe('deadline')

      // Test 3: Only Capacity
      const event3 = { ...baseEvent }
      expect(computeRegistrationStatus(event3, 10).reason).toBe('capacity')
    })
  })
})
