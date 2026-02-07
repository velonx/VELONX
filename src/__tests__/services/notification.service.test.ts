/**
 * Unit Tests for Notification Service
 * Tests notification creation, retrieval, marking as read, and filtering
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { NotificationService } from '@/lib/services/notification.service'
import { prisma } from '@/lib/prisma'
import { NotificationType } from '@prisma/client'
import { NotFoundError, ValidationError, AuthorizationError } from '@/lib/utils/errors'

// Mock Prisma
vi.mock('@/lib/prisma', () => ({
  prisma: {
    notification: {
      create: vi.fn(),
      findMany: vi.fn(),
      findUnique: vi.fn(),
      update: vi.fn(),
      updateMany: vi.fn(),
      delete: vi.fn(),
      deleteMany: vi.fn(),
      count: vi.fn(),
    },
    user: {
      findUnique: vi.fn(),
    },
  },
}))

describe('NotificationService', () => {
  let service: NotificationService

  beforeEach(() => {
    service = new NotificationService()
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('createNotification', () => {
    const validNotificationData = {
      userId: 'user1',
      title: 'Test Notification',
      description: 'This is a test notification',
      type: NotificationType.INFO,
      actionUrl: '/test',
    }

    it('should create notification successfully', async () => {
      const mockNotification = {
        id: 'n1',
        ...validNotificationData,
        read: false,
        createdAt: new Date(),
      }

      vi.mocked(prisma.user.findUnique).mockResolvedValue({ id: 'user1' } as any)
      vi.mocked(prisma.notification.create).mockResolvedValue(mockNotification as any)

      const result = await service.createNotification(validNotificationData)

      expect(result).toEqual(mockNotification)
      expect(prisma.notification.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          userId: 'user1',
          title: 'Test Notification',
          read: false,
        }),
      })
    })

    it('should throw ValidationError when user does not exist', async () => {
      vi.mocked(prisma.user.findUnique).mockResolvedValue(null)

      await expect(service.createNotification(validNotificationData)).rejects.toThrow(
        ValidationError
      )
      await expect(service.createNotification(validNotificationData)).rejects.toThrow(
        'Invalid userId: User does not exist'
      )
    })

    it('should throw ValidationError for invalid notification type', async () => {
      vi.mocked(prisma.user.findUnique).mockResolvedValue({ id: 'user1' } as any)

      await expect(
        service.createNotification({
          ...validNotificationData,
          type: 'INVALID_TYPE' as any,
        })
      ).rejects.toThrow(ValidationError)
    })

    it('should create notification with metadata', async () => {
      const metadata = { sessionId: 's1', eventType: 'session_booked' }
      const mockNotification = {
        id: 'n1',
        ...validNotificationData,
        metadata,
        read: false,
        createdAt: new Date(),
      }

      vi.mocked(prisma.user.findUnique).mockResolvedValue({ id: 'user1' } as any)
      vi.mocked(prisma.notification.create).mockResolvedValue(mockNotification as any)

      const result = await service.createNotification({
        ...validNotificationData,
        metadata,
      })

      expect(result.metadata).toEqual(metadata)
    })
  })

  describe('listNotifications', () => {
    it('should list notifications with pagination', async () => {
      const mockNotifications = [
        {
          id: 'n1',
          userId: 'user1',
          title: 'Notification 1',
          read: false,
          createdAt: new Date(),
        },
        {
          id: 'n2',
          userId: 'user1',
          title: 'Notification 2',
          read: true,
          createdAt: new Date(),
        },
      ]

      vi.mocked(prisma.notification.findMany).mockResolvedValue(mockNotifications as any)
      vi.mocked(prisma.notification.count)
        .mockResolvedValueOnce(2) // totalCount
        .mockResolvedValueOnce(1) // unreadCount

      const result = await service.listNotifications({
        userId: 'user1',
        page: 1,
        pageSize: 20,
      })

      expect(result.notifications).toEqual(mockNotifications)
      expect(result.unreadCount).toBe(1)
      expect(result.pagination).toEqual({
        page: 1,
        pageSize: 20,
        totalCount: 2,
        totalPages: 1,
      })
    })

    it('should filter notifications by read status', async () => {
      vi.mocked(prisma.notification.findMany).mockResolvedValue([])
      vi.mocked(prisma.notification.count).mockResolvedValue(0)

      await service.listNotifications({
        userId: 'user1',
        read: false,
      })

      expect(prisma.notification.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            userId: 'user1',
            read: false,
          }),
        })
      )
    })

    it('should filter notifications by type', async () => {
      vi.mocked(prisma.notification.findMany).mockResolvedValue([])
      vi.mocked(prisma.notification.count).mockResolvedValue(0)

      await service.listNotifications({
        userId: 'user1',
        type: NotificationType.SUCCESS,
      })

      expect(prisma.notification.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            userId: 'user1',
            type: NotificationType.SUCCESS,
          }),
        })
      )
    })

    it('should order notifications by creation date descending', async () => {
      vi.mocked(prisma.notification.findMany).mockResolvedValue([])
      vi.mocked(prisma.notification.count).mockResolvedValue(0)

      await service.listNotifications({ userId: 'user1' })

      expect(prisma.notification.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          orderBy: { createdAt: 'desc' },
        })
      )
    })
  })

  describe('getNotificationById', () => {
    it('should return notification when found', async () => {
      const mockNotification = {
        id: 'n1',
        userId: 'user1',
        title: 'Test Notification',
        read: false,
      }

      vi.mocked(prisma.notification.findUnique).mockResolvedValue(mockNotification as any)

      const result = await service.getNotificationById('n1')

      expect(result).toEqual(mockNotification)
    })

    it('should throw NotFoundError when notification not found', async () => {
      vi.mocked(prisma.notification.findUnique).mockResolvedValue(null)

      await expect(service.getNotificationById('invalid')).rejects.toThrow(NotFoundError)
    })
  })

  describe('markAsRead', () => {
    it('should mark notification as read', async () => {
      const mockNotification = {
        id: 'n1',
        userId: 'user1',
        title: 'Test Notification',
        read: false,
      }

      const updatedNotification = { ...mockNotification, read: true }

      vi.mocked(prisma.notification.findUnique).mockResolvedValue(mockNotification as any)
      vi.mocked(prisma.notification.update).mockResolvedValue(updatedNotification as any)

      const result = await service.markAsRead('n1', 'user1')

      expect(result.read).toBe(true)
      expect(prisma.notification.update).toHaveBeenCalledWith({
        where: { id: 'n1' },
        data: { read: true },
      })
    })

    it('should throw NotFoundError when notification not found', async () => {
      vi.mocked(prisma.notification.findUnique).mockResolvedValue(null)

      await expect(service.markAsRead('invalid', 'user1')).rejects.toThrow(NotFoundError)
    })

    it('should throw AuthorizationError when user does not own notification', async () => {
      const mockNotification = {
        id: 'n1',
        userId: 'user1',
        title: 'Test Notification',
        read: false,
      }

      vi.mocked(prisma.notification.findUnique).mockResolvedValue(mockNotification as any)

      await expect(service.markAsRead('n1', 'user2')).rejects.toThrow(AuthorizationError)
      await expect(service.markAsRead('n1', 'user2')).rejects.toThrow(
        'You are not authorized to access this notification'
      )
    })
  })

  describe('markAllAsRead', () => {
    it('should mark all unread notifications as read', async () => {
      vi.mocked(prisma.notification.updateMany).mockResolvedValue({ count: 5 } as any)

      const result = await service.markAllAsRead('user1')

      expect(result.count).toBe(5)
      expect(prisma.notification.updateMany).toHaveBeenCalledWith({
        where: {
          userId: 'user1',
          read: false,
        },
        data: {
          read: true,
        },
      })
    })
  })

  describe('deleteNotification', () => {
    it('should delete notification', async () => {
      const mockNotification = {
        id: 'n1',
        userId: 'user1',
        title: 'Test Notification',
      }

      vi.mocked(prisma.notification.findUnique).mockResolvedValue(mockNotification as any)
      vi.mocked(prisma.notification.delete).mockResolvedValue(mockNotification as any)

      await service.deleteNotification('n1', 'user1')

      expect(prisma.notification.delete).toHaveBeenCalledWith({
        where: { id: 'n1' },
      })
    })

    it('should throw NotFoundError when notification not found', async () => {
      vi.mocked(prisma.notification.findUnique).mockResolvedValue(null)

      await expect(service.deleteNotification('invalid', 'user1')).rejects.toThrow(NotFoundError)
    })

    it('should throw AuthorizationError when user does not own notification', async () => {
      const mockNotification = {
        id: 'n1',
        userId: 'user1',
        title: 'Test Notification',
      }

      vi.mocked(prisma.notification.findUnique).mockResolvedValue(mockNotification as any)

      await expect(service.deleteNotification('n1', 'user2')).rejects.toThrow(AuthorizationError)
    })
  })

  describe('deleteAllNotifications', () => {
    it('should delete all notifications for user', async () => {
      vi.mocked(prisma.notification.deleteMany).mockResolvedValue({ count: 10 } as any)

      const result = await service.deleteAllNotifications('user1')

      expect(result.count).toBe(10)
      expect(prisma.notification.deleteMany).toHaveBeenCalledWith({
        where: { userId: 'user1' },
      })
    })
  })

  describe('getUnreadCount', () => {
    it('should return unread notification count', async () => {
      vi.mocked(prisma.notification.count).mockResolvedValue(3)

      const result = await service.getUnreadCount('user1')

      expect(result).toBe(3)
      expect(prisma.notification.count).toHaveBeenCalledWith({
        where: {
          userId: 'user1',
          read: false,
        },
      })
    })
  })

  describe('Notification Helper Methods', () => {
    beforeEach(() => {
      vi.mocked(prisma.user.findUnique).mockResolvedValue({ id: 'user1' } as any)
      vi.mocked(prisma.notification.create).mockResolvedValue({
        id: 'n1',
        userId: 'user1',
        title: 'Test',
        description: 'Test',
        type: NotificationType.INFO,
        read: false,
        createdAt: new Date(),
      } as any)
    })

    it('should create mentor session booked notification', async () => {
      await service.createMentorSessionBookedNotification({
        sessionId: 's1',
        mentorId: 'm1',
        studentName: 'John Doe',
        title: 'Career Guidance',
        date: new Date('2024-12-01T10:00:00Z'),
      })

      expect(prisma.notification.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            userId: 'm1',
            title: 'New Session Booking',
            type: NotificationType.INFO,
          }),
        })
      )
    })

    it('should create project approved notification', async () => {
      await service.createProjectApprovedNotification({
        projectId: 'p1',
        ownerId: 'user1',
        projectTitle: 'My Project',
      })

      expect(prisma.notification.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            userId: 'user1',
            title: 'Project Approved',
            type: NotificationType.SUCCESS,
          }),
        })
      )
    })

    it('should create XP award notification', async () => {
      await service.createXPAwardNotification({
        userId: 'user1',
        xpAmount: 50,
        reason: 'completing a session',
      })

      expect(prisma.notification.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            userId: 'user1',
            title: 'XP Awarded!',
            type: NotificationType.AWARD,
          }),
        })
      )
    })

    it('should create level up notification', async () => {
      await service.createLevelUpNotification({
        userId: 'user1',
        newLevel: 5,
      })

      expect(prisma.notification.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            userId: 'user1',
            title: 'Level Up!',
            type: NotificationType.AWARD,
          }),
        })
      )
    })

    it('should create event registration notification', async () => {
      await service.createEventRegistrationNotification({
        eventId: 'e1',
        userId: 'user1',
        eventTitle: 'Tech Talk',
        eventDate: new Date('2024-12-01T18:00:00Z'),
        location: 'Main Hall',
      })

      expect(prisma.notification.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            userId: 'user1',
            title: 'Event Registration Confirmed',
            type: NotificationType.EVENT,
          }),
        })
      )
    })

    it('should create event cancelled notifications for all attendees', async () => {
      const attendeeIds = ['user1', 'user2', 'user3']

      await service.createEventCancelledNotification({
        eventId: 'e1',
        eventTitle: 'Tech Talk',
        eventDate: new Date('2024-12-01T18:00:00Z'),
        location: 'Main Hall',
        attendeeIds,
      })

      expect(prisma.notification.create).toHaveBeenCalledTimes(3)
    })

    it('should create meeting invitation notification', async () => {
      await service.createMeetingInvitationNotification({
        meetingId: 'm1',
        inviteeId: 'user2',
        meetingTitle: 'Project Discussion',
        meetingDate: new Date('2024-12-01T14:00:00Z'),
        platform: 'Zoom',
        inviterName: 'John Doe',
      })

      expect(prisma.notification.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            userId: 'user2',
            title: 'Meeting Invitation',
            type: NotificationType.EVENT,
          }),
        })
      )
    })
  })
})
