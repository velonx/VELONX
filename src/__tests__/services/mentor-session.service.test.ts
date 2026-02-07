/**
 * Unit Tests for Mentor Session Service
 * Tests session creation, updates, cancellation, review submission, and edge cases
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { MentorSessionService } from '@/lib/services/mentor-session.service'
import { prisma } from '@/lib/prisma'
import { NotFoundError, ConflictError, ValidationError } from '@/lib/utils/errors'
import { notificationService } from '@/lib/services/notification.service'
import { awardXP, XP_REWARDS } from '@/lib/utils/xp'

// Mock dependencies
vi.mock('@/lib/prisma', () => ({
  prisma: {
    mentorSession: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      count: vi.fn(),
    },
    mentor: {
      findUnique: vi.fn(),
      update: vi.fn(),
    },
    mentorReview: {
      findUnique: vi.fn(),
      findMany: vi.fn(),
      create: vi.fn(),
    },
  },
}))

vi.mock('@/lib/services/notification.service', () => ({
  notificationService: {
    createMentorSessionBookedNotification: vi.fn(),
    createMentorSessionConfirmedNotification: vi.fn(),
    createMentorSessionCompletedNotification: vi.fn(),
    createMentorSessionCancelledNotification: vi.fn(),
  },
}))

vi.mock('@/lib/utils/xp', () => ({
  awardXP: vi.fn(),
  XP_REWARDS: {
    MENTOR_SESSION: 50,
  },
}))

describe('MentorSessionService', () => {
  let service: MentorSessionService

  beforeEach(() => {
    service = new MentorSessionService()
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('listSessions', () => {
    it('should list sessions with pagination', async () => {
      const mockSessions = [
        {
          id: '1',
          title: 'Test Session',
          status: 'PENDING',
          date: new Date(),
          mentor: { id: 'm1', name: 'Mentor 1' },
          student: { id: 's1', name: 'Student 1' },
        },
      ]

      vi.mocked(prisma.mentorSession.findMany).mockResolvedValue(mockSessions as any)
      vi.mocked(prisma.mentorSession.count).mockResolvedValue(1)

      const result = await service.listSessions({ page: 1, pageSize: 10 })

      expect(result.sessions).toEqual(mockSessions)
      expect(result.pagination).toEqual({
        page: 1,
        pageSize: 10,
        totalCount: 1,
        totalPages: 1,
      })
    })

    it('should filter sessions by student userId', async () => {
      vi.mocked(prisma.mentorSession.findMany).mockResolvedValue([])
      vi.mocked(prisma.mentorSession.count).mockResolvedValue(0)

      await service.listSessions({ userId: 's1', userRole: 'student' })

      expect(prisma.mentorSession.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ studentId: 's1' }),
        })
      )
    })

    it('should filter sessions by mentor userId', async () => {
      vi.mocked(prisma.mentorSession.findMany).mockResolvedValue([])
      vi.mocked(prisma.mentorSession.count).mockResolvedValue(0)

      await service.listSessions({ userId: 'm1', userRole: 'mentor' })

      expect(prisma.mentorSession.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ mentorId: 'm1' }),
        })
      )
    })
  })

  describe('getSessionById', () => {
    it('should return session when found', async () => {
      const mockSession = {
        id: '1',
        title: 'Test Session',
        mentor: { id: 'm1', name: 'Mentor 1' },
        student: { id: 's1', name: 'Student 1' },
      }

      vi.mocked(prisma.mentorSession.findUnique).mockResolvedValue(mockSession as any)

      const result = await service.getSessionById('1')

      expect(result).toEqual(mockSession)
    })

    it('should throw NotFoundError when session not found', async () => {
      vi.mocked(prisma.mentorSession.findUnique).mockResolvedValue(null)

      await expect(service.getSessionById('invalid')).rejects.toThrow(NotFoundError)
    })
  })

  describe('createSession', () => {
    const validSessionData = {
      mentorId: 'm1',
      studentId: 's1',
      title: 'Career Guidance',
      description: 'Discuss career path',
      date: new Date('2024-12-01T10:00:00Z').toISOString(),
      duration: 60,
    }

    it('should create session successfully', async () => {
      const mockMentor = { id: 'm1', available: true }
      const mockSession = {
        id: '1',
        ...validSessionData,
        status: 'PENDING',
        mentor: { id: 'm1', name: 'Mentor 1' },
        student: { id: 's1', name: 'Student 1' },
      }

      vi.mocked(prisma.mentor.findUnique).mockResolvedValue(mockMentor as any)
      vi.mocked(prisma.mentorSession.findMany).mockResolvedValue([])
      vi.mocked(prisma.mentorSession.create).mockResolvedValue(mockSession as any)
      vi.mocked(prisma.mentor.update).mockResolvedValue({} as any)

      const result = await service.createSession(validSessionData)

      expect(result).toEqual(mockSession)
      expect(prisma.mentor.update).toHaveBeenCalledWith({
        where: { id: 'm1' },
        data: { totalSessions: { increment: 1 } },
      })
    })

    it('should throw NotFoundError when mentor does not exist', async () => {
      vi.mocked(prisma.mentor.findUnique).mockResolvedValue(null)

      await expect(service.createSession(validSessionData)).rejects.toThrow(NotFoundError)
    })

    it('should throw ValidationError when mentor is not available', async () => {
      const mockMentor = { id: 'm1', available: false }
      vi.mocked(prisma.mentor.findUnique).mockResolvedValue(mockMentor as any)

      await expect(service.createSession(validSessionData)).rejects.toThrow(ValidationError)
      await expect(service.createSession(validSessionData)).rejects.toThrow(
        'Mentor is not currently available for bookings'
      )
    })

    it('should throw ConflictError when time slot is not available', async () => {
      const mockMentor = { id: 'm1', available: true }
      const conflictingSession = {
        id: '2',
        mentorId: 'm1',
        status: 'CONFIRMED',
        date: new Date('2024-12-01T10:30:00Z'),
      }

      vi.mocked(prisma.mentor.findUnique).mockResolvedValue(mockMentor as any)
      vi.mocked(prisma.mentorSession.findMany).mockResolvedValue([conflictingSession] as any)

      await expect(service.createSession(validSessionData)).rejects.toThrow(ConflictError)
      await expect(service.createSession(validSessionData)).rejects.toThrow(
        'This time slot is not available'
      )
    })

    it('should create notification for mentor', async () => {
      const mockMentor = { id: 'm1', available: true }
      const mockSession = {
        id: '1',
        ...validSessionData,
        date: new Date(validSessionData.date),
        mentor: { id: 'm1', name: 'Mentor 1' },
        student: { id: 's1', name: 'Student 1' },
      }

      vi.mocked(prisma.mentor.findUnique).mockResolvedValue(mockMentor as any)
      vi.mocked(prisma.mentorSession.findMany).mockResolvedValue([])
      vi.mocked(prisma.mentorSession.create).mockResolvedValue(mockSession as any)
      vi.mocked(prisma.mentor.update).mockResolvedValue({} as any)

      await service.createSession(validSessionData)

      expect(notificationService.createMentorSessionBookedNotification).toHaveBeenCalledWith({
        sessionId: '1',
        mentorId: 'm1',
        studentName: 'Student 1',
        title: validSessionData.title,
        date: mockSession.date,
      })
    })
  })

  describe('updateSession', () => {
    it('should update session status', async () => {
      const mockSession = {
        id: '1',
        status: 'PENDING',
        mentor: { id: 'm1', name: 'Mentor 1' },
        student: { id: 's1', name: 'Student 1' },
        studentId: 's1',
        mentorId: 'm1',
      }

      vi.mocked(prisma.mentorSession.findUnique).mockResolvedValue(mockSession as any)
      vi.mocked(prisma.mentorSession.update).mockResolvedValue({
        ...mockSession,
        status: 'CONFIRMED',
      } as any)

      const result = await service.updateSession('1', { status: 'CONFIRMED' })

      expect(result.status).toBe('CONFIRMED')
    })

    it('should throw NotFoundError when session does not exist', async () => {
      vi.mocked(prisma.mentorSession.findUnique).mockResolvedValue(null)

      await expect(service.updateSession('invalid', { status: 'CONFIRMED' })).rejects.toThrow(
        NotFoundError
      )
    })

    it('should create notification when status changes to CONFIRMED', async () => {
      const mockSession = {
        id: '1',
        status: 'PENDING',
        title: 'Test Session',
        date: new Date(),
        studentId: 's1',
        mentorId: 'm1',
        mentor: { id: 'm1', name: 'Mentor 1' },
        student: { id: 's1', name: 'Student 1' },
        meetingLink: 'https://meet.example.com',
      }

      vi.mocked(prisma.mentorSession.findUnique).mockResolvedValue(mockSession as any)
      vi.mocked(prisma.mentorSession.update).mockResolvedValue({
        ...mockSession,
        status: 'CONFIRMED',
      } as any)

      await service.updateSession('1', { status: 'CONFIRMED' })

      expect(notificationService.createMentorSessionConfirmedNotification).toHaveBeenCalled()
    })

    it('should award XP and create notification when status changes to COMPLETED', async () => {
      const mockSession = {
        id: '1',
        status: 'CONFIRMED',
        title: 'Test Session',
        date: new Date(),
        studentId: 's1',
        mentorId: 'm1',
        mentor: { id: 'm1', name: 'Mentor 1' },
        student: { id: 's1', name: 'Student 1' },
      }

      vi.mocked(prisma.mentorSession.findUnique).mockResolvedValue(mockSession as any)
      vi.mocked(prisma.mentorSession.update).mockResolvedValue({
        ...mockSession,
        status: 'COMPLETED',
      } as any)

      await service.updateSession('1', { status: 'COMPLETED' })

      expect(awardXP).toHaveBeenCalledWith(
        's1',
        XP_REWARDS.MENTOR_SESSION,
        expect.stringContaining('Completed session')
      )
      expect(notificationService.createMentorSessionCompletedNotification).toHaveBeenCalled()
    })
  })

  describe('cancelSession', () => {
    it('should cancel session when user is student', async () => {
      const mockSession = {
        id: '1',
        status: 'PENDING',
        studentId: 's1',
        mentorId: 'm1',
        title: 'Test Session',
        date: new Date(),
        mentor: { id: 'm1', name: 'Mentor 1' },
        student: { id: 's1', name: 'Student 1' },
      }

      vi.mocked(prisma.mentorSession.findUnique).mockResolvedValue(mockSession as any)
      vi.mocked(prisma.mentorSession.update).mockResolvedValue({
        ...mockSession,
        status: 'CANCELLED',
      } as any)

      await service.cancelSession('1', 's1')

      expect(prisma.mentorSession.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: '1' },
          data: expect.objectContaining({ status: 'CANCELLED' }),
        })
      )
    })

    it('should throw ValidationError when user is not authorized', async () => {
      const mockSession = {
        id: '1',
        status: 'PENDING',
        studentId: 's1',
        mentorId: 'm1',
        mentor: { id: 'm1', name: 'Mentor 1' },
        student: { id: 's1', name: 'Student 1' },
      }

      vi.mocked(prisma.mentorSession.findUnique).mockResolvedValue(mockSession as any)

      await expect(service.cancelSession('1', 'unauthorized')).rejects.toThrow(ValidationError)
      await expect(service.cancelSession('1', 'unauthorized')).rejects.toThrow(
        'You are not authorized to cancel this session'
      )
    })

    it('should throw ValidationError when session is already completed', async () => {
      const mockSession = {
        id: '1',
        status: 'COMPLETED',
        studentId: 's1',
        mentorId: 'm1',
        mentor: { id: 'm1', name: 'Mentor 1' },
        student: { id: 's1', name: 'Student 1' },
      }

      vi.mocked(prisma.mentorSession.findUnique).mockResolvedValue(mockSession as any)

      await expect(service.cancelSession('1', 's1')).rejects.toThrow(ValidationError)
      await expect(service.cancelSession('1', 's1')).rejects.toThrow(
        'This session cannot be cancelled'
      )
    })

    it('should create cancellation notifications for both parties', async () => {
      const mockSession = {
        id: '1',
        status: 'PENDING',
        studentId: 's1',
        mentorId: 'm1',
        title: 'Test Session',
        date: new Date(),
        mentor: { id: 'm1', name: 'Mentor 1' },
        student: { id: 's1', name: 'Student 1' },
      }

      vi.mocked(prisma.mentorSession.findUnique).mockResolvedValue(mockSession as any)
      vi.mocked(prisma.mentorSession.update).mockResolvedValue({
        ...mockSession,
        status: 'CANCELLED',
      } as any)

      await service.cancelSession('1', 's1')

      expect(notificationService.createMentorSessionCancelledNotification).toHaveBeenCalledWith(
        expect.objectContaining({
          sessionId: '1',
          cancelledBy: 'student',
        })
      )
    })
  })

  describe('submitReview', () => {
    it('should submit review successfully', async () => {
      const mockSession = {
        id: '1',
        status: 'COMPLETED',
        studentId: 's1',
        mentorId: 'm1',
        mentor: { id: 'm1', name: 'Mentor 1' },
        student: { id: 's1', name: 'Student 1' },
      }

      const mockReview = {
        id: 'r1',
        sessionId: '1',
        mentorId: 'm1',
        studentId: 's1',
        rating: 5,
        comment: 'Great session!',
      }

      vi.mocked(prisma.mentorSession.findUnique).mockResolvedValue(mockSession as any)
      vi.mocked(prisma.mentorReview.findUnique).mockResolvedValue(null)
      vi.mocked(prisma.mentorReview.create).mockResolvedValue(mockReview as any)
      vi.mocked(prisma.mentorReview.findMany).mockResolvedValue([mockReview] as any)
      vi.mocked(prisma.mentor.update).mockResolvedValue({} as any)

      const result = await service.submitReview({
        sessionId: '1',
        studentId: 's1',
        rating: 5,
        comment: 'Great session!',
      })

      expect(result).toEqual(mockReview)
      expect(prisma.mentor.update).toHaveBeenCalledWith({
        where: { id: 'm1' },
        data: { rating: 5 },
      })
    })

    it('should throw ValidationError when session is not completed', async () => {
      const mockSession = {
        id: '1',
        status: 'PENDING',
        studentId: 's1',
        mentorId: 'm1',
        mentor: { id: 'm1', name: 'Mentor 1' },
        student: { id: 's1', name: 'Student 1' },
      }

      vi.mocked(prisma.mentorSession.findUnique).mockResolvedValue(mockSession as any)

      await expect(
        service.submitReview({
          sessionId: '1',
          studentId: 's1',
          rating: 5,
        })
      ).rejects.toThrow(ValidationError)
      await expect(
        service.submitReview({
          sessionId: '1',
          studentId: 's1',
          rating: 5,
        })
      ).rejects.toThrow('Can only review completed sessions')
    })

    it('should throw ValidationError when student is not authorized', async () => {
      const mockSession = {
        id: '1',
        status: 'COMPLETED',
        studentId: 's1',
        mentorId: 'm1',
        mentor: { id: 'm1', name: 'Mentor 1' },
        student: { id: 's1', name: 'Student 1' },
      }

      vi.mocked(prisma.mentorSession.findUnique).mockResolvedValue(mockSession as any)

      await expect(
        service.submitReview({
          sessionId: '1',
          studentId: 'unauthorized',
          rating: 5,
        })
      ).rejects.toThrow(ValidationError)
      await expect(
        service.submitReview({
          sessionId: '1',
          studentId: 'unauthorized',
          rating: 5,
        })
      ).rejects.toThrow('Only the student can review this session')
    })

    it('should throw ConflictError when review already exists', async () => {
      const mockSession = {
        id: '1',
        status: 'COMPLETED',
        studentId: 's1',
        mentorId: 'm1',
        mentor: { id: 'm1', name: 'Mentor 1' },
        student: { id: 's1', name: 'Student 1' },
      }

      const existingReview = { id: 'r1', sessionId: '1' }

      vi.mocked(prisma.mentorSession.findUnique).mockResolvedValue(mockSession as any)
      vi.mocked(prisma.mentorReview.findUnique).mockResolvedValue(existingReview as any)

      await expect(
        service.submitReview({
          sessionId: '1',
          studentId: 's1',
          rating: 5,
        })
      ).rejects.toThrow(ConflictError)
      await expect(
        service.submitReview({
          sessionId: '1',
          studentId: 's1',
          rating: 5,
        })
      ).rejects.toThrow('Review already submitted for this session')
    })

    it('should throw ValidationError when rating is out of range', async () => {
      const mockSession = {
        id: '1',
        status: 'COMPLETED',
        studentId: 's1',
        mentorId: 'm1',
        mentor: { id: 'm1', name: 'Mentor 1' },
        student: { id: 's1', name: 'Student 1' },
      }

      vi.mocked(prisma.mentorSession.findUnique).mockResolvedValue(mockSession as any)
      vi.mocked(prisma.mentorReview.findUnique).mockResolvedValue(null)

      await expect(
        service.submitReview({
          sessionId: '1',
          studentId: 's1',
          rating: 6,
        })
      ).rejects.toThrow(ValidationError)
      await expect(
        service.submitReview({
          sessionId: '1',
          studentId: 's1',
          rating: 6,
        })
      ).rejects.toThrow('Rating must be between 1 and 5')
    })

    it('should calculate average rating correctly', async () => {
      const mockSession = {
        id: '1',
        status: 'COMPLETED',
        studentId: 's1',
        mentorId: 'm1',
        mentor: { id: 'm1', name: 'Mentor 1' },
        student: { id: 's1', name: 'Student 1' },
      }

      const existingReviews = [
        { id: 'r1', rating: 4 },
        { id: 'r2', rating: 5 },
      ]

      const newReview = {
        id: 'r3',
        sessionId: '1',
        mentorId: 'm1',
        studentId: 's1',
        rating: 3,
      }

      vi.mocked(prisma.mentorSession.findUnique).mockResolvedValue(mockSession as any)
      vi.mocked(prisma.mentorReview.findUnique).mockResolvedValue(null)
      vi.mocked(prisma.mentorReview.create).mockResolvedValue(newReview as any)
      vi.mocked(prisma.mentorReview.findMany).mockResolvedValue([
        ...existingReviews,
        newReview,
      ] as any)
      vi.mocked(prisma.mentor.update).mockResolvedValue({} as any)

      await service.submitReview({
        sessionId: '1',
        studentId: 's1',
        rating: 3,
      })

      expect(prisma.mentor.update).toHaveBeenCalledWith({
        where: { id: 'm1' },
        data: { rating: 4 }, // (4 + 5 + 3) / 3 = 4
      })
    })
  })
})
