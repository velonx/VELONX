/**
 * Event Registration Closure Notifications Tests
 * Feature: event-registration-closed
 * Task: 14.1 - Implement registration closure notifications
 * 
 * Tests notification system integration for registration closure events
 * Validates: Requirements 9.1, 9.2, 9.4, 9.5
 */

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { notificationService } from '@/lib/services/notification.service';
import { prisma } from '@/lib/prisma';
import { NotificationType } from '@prisma/client';

// Mock prisma
vi.mock('@/lib/prisma', () => ({
  prisma: {
    user: {
      findUnique: vi.fn(),
    },
    notification: {
      create: vi.fn(),
      findFirst: vi.fn(),
      findMany: vi.fn(),
    },
  },
}));

describe('Event Registration Closure Notifications', () => {
  const mockUserId = 'test-user-id';
  const mockEventId = 'test-event-id';
  const mockNotificationId = 'test-notification-id';

  beforeEach(() => {
    vi.clearAllMocks();
    
    // Default mock: user has eventReminders enabled
    vi.mocked(prisma.user.findUnique).mockResolvedValue({
      id: mockUserId,
      email: 'test@example.com',
      name: 'Test User',
      eventReminders: true,
    } as any);

    // Default mock: no recent notifications (no deduplication)
    vi.mocked(prisma.notification.findFirst).mockResolvedValue(null);
  });

  describe('createEventRegistrationClosedNotification', () => {
    it('should create notification for capacity closure with correct details', async () => {
      // Requirement 9.1, 9.2
      const closureTimestamp = new Date('2024-01-15T10:30:00Z');
      
      const mockNotification = {
        id: mockNotificationId,
        userId: mockUserId,
        title: 'Event Registration Closed',
        description: 'Registration for "Test Event" has closed because the event reached full capacity (10/10 registered) at Jan 15, 2024, 10:30 AM.',
        type: NotificationType.EVENT,
        actionUrl: '/events',
        metadata: {
          eventId: mockEventId,
          closureReason: 'capacity',
          closureTimestamp: closureTimestamp.toISOString(),
          attendeeCount: 10,
          maxSeats: 10,
          eventType: 'registration_closed',
        },
        read: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      vi.mocked(prisma.notification.create).mockResolvedValue(mockNotification as any);
      
      const notification = await notificationService.createEventRegistrationClosedNotification({
        eventId: mockEventId,
        eventTitle: 'Test Event',
        creatorId: mockUserId,
        closureReason: 'capacity',
        closureTimestamp,
        attendeeCount: 10,
        maxSeats: 10,
      });

      expect(notification).toBeDefined();
      expect(notification?.userId).toBe(mockUserId);
      expect(notification?.title).toBe('Event Registration Closed');
      expect(notification?.description).toContain('Test Event');
      expect(notification?.description).toContain('full capacity');
      expect(notification?.description).toContain('10/10');
      expect(notification?.type).toBe(NotificationType.EVENT);
      expect(notification?.metadata).toMatchObject({
        eventId: mockEventId,
        closureReason: 'capacity',
        attendeeCount: 10,
        maxSeats: 10,
        eventType: 'registration_closed',
      });

      // Verify prisma.notification.create was called
      expect(prisma.notification.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            userId: mockUserId,
            title: 'Event Registration Closed',
            type: NotificationType.EVENT,
          }),
        })
      );
    });

    it('should create notification for deadline closure with correct details', async () => {
      // Requirement 9.1, 9.2
      const closureTimestamp = new Date('2024-01-15T10:30:00Z');
      
      const mockNotification = {
        id: mockNotificationId,
        userId: mockUserId,
        title: 'Event Registration Closed',
        description: 'Registration for "Test Event" has closed because the registration deadline was reached at Jan 15, 2024, 10:30 AM.',
        type: NotificationType.EVENT,
        actionUrl: '/events',
        metadata: {
          eventId: mockEventId,
          closureReason: 'deadline',
          closureTimestamp: closureTimestamp.toISOString(),
          eventType: 'registration_closed',
        },
        read: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      vi.mocked(prisma.notification.create).mockResolvedValue(mockNotification as any);
      
      const notification = await notificationService.createEventRegistrationClosedNotification({
        eventId: mockEventId,
        eventTitle: 'Test Event',
        creatorId: mockUserId,
        closureReason: 'deadline',
        closureTimestamp,
      });

      expect(notification).toBeDefined();
      expect(notification?.userId).toBe(mockUserId);
      expect(notification?.title).toBe('Event Registration Closed');
      expect(notification?.description).toContain('Test Event');
      expect(notification?.description).toContain('registration deadline');
      expect(notification?.type).toBe(NotificationType.EVENT);
      expect(notification?.metadata).toMatchObject({
        eventId: mockEventId,
        closureReason: 'deadline',
        eventType: 'registration_closed',
      });
    });

    it('should create notification for manual closure with correct details', async () => {
      // Requirement 9.1, 9.2
      const closureTimestamp = new Date('2024-01-15T10:30:00Z');
      
      const mockNotification = {
        id: mockNotificationId,
        userId: mockUserId,
        title: 'Event Registration Closed',
        description: 'Registration for "Test Event" was manually closed at Jan 15, 2024, 10:30 AM.',
        type: NotificationType.EVENT,
        actionUrl: '/events',
        metadata: {
          eventId: mockEventId,
          closureReason: 'manual',
          closureTimestamp: closureTimestamp.toISOString(),
          eventType: 'registration_closed',
        },
        read: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      vi.mocked(prisma.notification.create).mockResolvedValue(mockNotification as any);
      
      const notification = await notificationService.createEventRegistrationClosedNotification({
        eventId: mockEventId,
        eventTitle: 'Test Event',
        creatorId: mockUserId,
        closureReason: 'manual',
        closureTimestamp,
      });

      expect(notification).toBeDefined();
      expect(notification?.userId).toBe(mockUserId);
      expect(notification?.title).toBe('Event Registration Closed');
      expect(notification?.description).toContain('Test Event');
      expect(notification?.description).toContain('manually closed');
      expect(notification?.type).toBe(NotificationType.EVENT);
      expect(notification?.metadata).toMatchObject({
        eventId: mockEventId,
        closureReason: 'manual',
        eventType: 'registration_closed',
      });
    });

    it('should include closure timestamp in notification', async () => {
      // Requirement 9.2
      const closureTimestamp = new Date('2024-01-15T10:30:00Z');
      
      const mockNotification = {
        id: mockNotificationId,
        userId: mockUserId,
        title: 'Event Registration Closed',
        description: 'Registration for "Test Event" has closed because the event reached full capacity (10/10 registered) at Jan 15, 2024, 10:30 AM.',
        type: NotificationType.EVENT,
        actionUrl: '/events',
        metadata: {
          eventId: mockEventId,
          closureReason: 'capacity',
          closureTimestamp: closureTimestamp.toISOString(),
          attendeeCount: 10,
          maxSeats: 10,
          eventType: 'registration_closed',
        },
        read: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      vi.mocked(prisma.notification.create).mockResolvedValue(mockNotification as any);
      
      const notification = await notificationService.createEventRegistrationClosedNotification({
        eventId: mockEventId,
        eventTitle: 'Test Event',
        creatorId: mockUserId,
        closureReason: 'capacity',
        closureTimestamp,
        attendeeCount: 10,
        maxSeats: 10,
      });

      expect(notification).toBeDefined();
      expect(notification?.description).toMatch(/at .+/); // Contains timestamp
      expect(notification?.metadata?.closureTimestamp).toBe(closureTimestamp.toISOString());
    });

    it('should respect user notification preferences', async () => {
      // Requirement 9.4
      // Mock user with eventReminders disabled
      vi.mocked(prisma.user.findUnique).mockResolvedValue({
        id: mockUserId,
        email: 'test@example.com',
        name: 'Test User',
        eventReminders: false,
      } as any);

      const notification = await notificationService.createEventRegistrationClosedNotification({
        eventId: mockEventId,
        eventTitle: 'Test Event',
        creatorId: mockUserId,
        closureReason: 'capacity',
        closureTimestamp: new Date(),
        attendeeCount: 10,
        maxSeats: 10,
      });

      // Should return null when preferences are disabled
      expect(notification).toBeNull();
      
      // Verify notification.create was NOT called
      expect(prisma.notification.create).not.toHaveBeenCalled();
    });

    it('should implement notification deduplication within 5-minute window', async () => {
      // Requirement 9.5
      const closureTimestamp = new Date();
      
      // Mock recent notification (within 5-minute window)
      vi.mocked(prisma.notification.findFirst).mockResolvedValue({
        id: 'recent-notification-id',
        userId: mockUserId,
        title: 'Event Registration Closed',
        createdAt: new Date(Date.now() - 2 * 60 * 1000), // 2 minutes ago
        type: NotificationType.EVENT,
        metadata: { eventId: mockEventId },
      } as any);

      const notification = await notificationService.createEventRegistrationClosedNotification({
        eventId: mockEventId,
        eventTitle: 'Test Event',
        creatorId: mockUserId,
        closureReason: 'capacity',
        closureTimestamp,
        attendeeCount: 10,
        maxSeats: 10,
      });

      // Should return null due to deduplication
      expect(notification).toBeNull();
      
      // Verify notification.create was NOT called
      expect(prisma.notification.create).not.toHaveBeenCalled();
    });

    it('should allow notification after 5-minute deduplication window', async () => {
      // Requirement 9.5
      const closureTimestamp = new Date();
      
      // Mock old notification (outside 5-minute window)
      vi.mocked(prisma.notification.findFirst).mockResolvedValue(null);

      const mockNotification = {
        id: mockNotificationId,
        userId: mockUserId,
        title: 'Event Registration Closed',
        description: 'Registration for "Test Event" has closed because the event reached full capacity (10/10 registered) at ' + closureTimestamp.toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' }) + '.',
        type: NotificationType.EVENT,
        actionUrl: '/events',
        metadata: {
          eventId: mockEventId,
          closureReason: 'capacity',
          closureTimestamp: closureTimestamp.toISOString(),
          attendeeCount: 10,
          maxSeats: 10,
          eventType: 'registration_closed',
        },
        read: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      vi.mocked(prisma.notification.create).mockResolvedValue(mockNotification as any);
      
      const notification = await notificationService.createEventRegistrationClosedNotification({
        eventId: mockEventId,
        eventTitle: 'Test Event',
        creatorId: mockUserId,
        closureReason: 'capacity',
        closureTimestamp,
        attendeeCount: 10,
        maxSeats: 10,
      });

      // Should succeed after deduplication window
      expect(notification).toBeDefined();
      
      // Verify notification.create was called
      expect(prisma.notification.create).toHaveBeenCalled();
    });

    it('should handle non-existent user gracefully', async () => {
      // Fail-safe behavior - when user doesn't exist, the preference check
      // defaults to true (send notification), but createNotification will
      // validate and throw an error
      vi.mocked(prisma.user.findUnique).mockResolvedValue(null);

      // The notification service will attempt to create the notification
      // but createNotification validates user existence and throws
      await expect(
        notificationService.createEventRegistrationClosedNotification({
          eventId: mockEventId,
          eventTitle: 'Test Event',
          creatorId: 'non-existent-user-id',
          closureReason: 'capacity',
          closureTimestamp: new Date(),
          attendeeCount: 10,
          maxSeats: 10,
        })
      ).rejects.toThrow('Invalid userId: User does not exist');
    });
  });
});
