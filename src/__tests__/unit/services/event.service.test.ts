import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { EventService } from '@/lib/services/event.service';
import { notificationService } from '@/lib/services/notification.service';
import { prisma } from '@/lib/prisma';
import * as referralService from '@/lib/services/referral.service';

vi.mock('@/lib/prisma', () => ({
  prisma: {
    $transaction: vi.fn((cb) => cb(prisma)),
    event: {
      findUnique: vi.fn(),
    },
    eventAttendee: {
      findUnique: vi.fn(),
      create: vi.fn(),
    },
  },
}));

vi.mock('@/lib/services/notification.service', () => ({
  notificationService: {
    createEventRegistrationNotification: vi.fn(),
    createEventRegistrationClosedNotification: vi.fn(),
  },
}));

vi.mock('@/lib/services/event-analytics.service', () => ({
  eventAnalyticsService: {
    logFailedRegistrationAttempt: vi.fn().mockResolvedValue(undefined),
    hasClosureBeenTracked: vi.fn().mockResolvedValue(false),
    trackRegistrationClosure: vi.fn().mockResolvedValue(undefined),
  },
}));

vi.mock('@/lib/services/referral.service', () => ({
  checkAndAwardFirstActivity: vi.fn().mockResolvedValue(undefined),
}));

describe('EventService', () => {
  let eventService: EventService;

  beforeEach(() => {
    vi.clearAllMocks();
    eventService = new EventService();
  });

  describe('registerForEvent', () => {
    it('should catch error when creating event registration notification fails, but still return the registration', async () => {
      const mockEventId = 'event-123';
      const mockUserId = 'user-123';

      const mockEvent = {
        id: mockEventId,
        title: 'Test Event',
        date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days in the future
        location: 'Test Location',
        maxSeats: 10,
        creatorId: 'creator-123',
        createdAt: new Date(),
        status: 'UPCOMING',
        isRegistrationClosed: false,
        _count: {
          attendees: 5,
        },
      };

      const mockRegistration = {
        eventId: mockEventId,
        userId: mockUserId,
        status: 'REGISTERED',
        event: {
          id: mockEventId,
          title: 'Test Event',
          date: mockEvent.date,
          location: 'Test Location',
        },
        user: {
          id: mockUserId,
          name: 'Test User',
          email: 'test@example.com',
        },
      };

      vi.mocked(prisma.event.findUnique).mockResolvedValue(mockEvent as any);
      vi.mocked(prisma.eventAttendee.findUnique).mockResolvedValue(null);
      vi.mocked(prisma.eventAttendee.create).mockResolvedValue(mockRegistration as any);

      const notificationError = new Error('Notification failed');
      vi.mocked(notificationService.createEventRegistrationNotification).mockRejectedValue(notificationError);

      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      const result = await eventService.registerForEvent(mockEventId, mockUserId);

      expect(result).toEqual(mockRegistration);
      expect(notificationService.createEventRegistrationNotification).toHaveBeenCalled();
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Failed to create event registration notification:',
        notificationError
      );

      consoleErrorSpy.mockRestore();
    });
  });
});
