import { describe, it, expect, vi, beforeEach } from 'vitest';
import { EventService } from '@/lib/services/event.service';
import { prisma } from '@/lib/prisma';
import { notificationService } from '@/lib/services/notification.service';
import { eventAnalyticsService } from '@/lib/services/event-analytics.service';

vi.mock('@/lib/prisma', () => ({
  prisma: {
    event: {
      findUnique: vi.fn(),
      update: vi.fn(),
      findFirst: vi.fn(),
    },
  },
}));

vi.mock('@/lib/services/notification.service', () => ({
  notificationService: {
    createEventCancelledNotification: vi.fn(),
    createEventOngoingNotification: vi.fn(),
  },
}));

vi.mock('@/lib/services/event-analytics.service', () => ({
  eventAnalyticsService: {
    hasClosureBeenTracked: vi.fn(),
    trackRegistrationClosure: vi.fn(),
  },
}));

describe('EventService', () => {
  let eventService: EventService;

  beforeEach(() => {
    eventService = new EventService();
    vi.clearAllMocks();
  });

  describe('updateEvent', () => {
    it('should catch and log error if notificationService.createEventCancelledNotification fails, but still succeed', async () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      const mockEventId = 'event-123';
      const mockEvent = {
        id: mockEventId,
        title: 'Test Event',
        date: new Date(),
        status: 'UPCOMING',
        attendees: [{ userId: 'user-1' }, { userId: 'user-2' }],
        _count: { attendees: 2 },
        maxSeats: 10,
        creatorId: 'creator-1',
      };

      vi.mocked(prisma.event.findUnique).mockResolvedValue(mockEvent as any);
      vi.mocked(prisma.event.update).mockResolvedValue({ ...mockEvent, status: 'CANCELLED' } as any);
      vi.mocked(prisma.event.findFirst).mockResolvedValue(null); // for generateUniqueEventSlug

      const notificationError = new Error('Notification Service Failed');
      vi.mocked(notificationService.createEventCancelledNotification).mockRejectedValue(notificationError);

      const result = await eventService.updateEvent(mockEventId, { status: 'CANCELLED' });

      expect(prisma.event.findUnique).toHaveBeenCalledWith(
        expect.objectContaining({ where: { id: mockEventId } })
      );
      expect(prisma.event.update).toHaveBeenCalled();
      expect(notificationService.createEventCancelledNotification).toHaveBeenCalledWith(
        expect.objectContaining({
          eventId: mockEventId,
          eventTitle: mockEvent.title,
          attendeeIds: ['user-1', 'user-2'],
        })
      );

      expect(consoleSpy).toHaveBeenCalledWith('Failed to create event status notification:', notificationError);
      expect(result).toBeDefined();
      expect(result.status).toBe('CANCELLED');

      consoleSpy.mockRestore();
    });

    it('should catch and log error if notificationService.createEventOngoingNotification fails, but still succeed', async () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      const mockEventId = 'event-123';
      const mockEvent = {
        id: mockEventId,
        title: 'Test Event',
        date: new Date(),
        status: 'UPCOMING',
        attendees: [{ userId: 'user-1' }, { userId: 'user-2' }],
        _count: { attendees: 2 },
        maxSeats: 10,
        creatorId: 'creator-1',
      };

      vi.mocked(prisma.event.findUnique).mockResolvedValue(mockEvent as any);
      vi.mocked(prisma.event.update).mockResolvedValue({ ...mockEvent, status: 'ONGOING' } as any);
      vi.mocked(prisma.event.findFirst).mockResolvedValue(null); // for generateUniqueEventSlug

      const notificationError = new Error('Notification Service Failed');
      vi.mocked(notificationService.createEventOngoingNotification).mockRejectedValue(notificationError);

      const result = await eventService.updateEvent(mockEventId, { status: 'ONGOING' });

      expect(prisma.event.findUnique).toHaveBeenCalledWith(
        expect.objectContaining({ where: { id: mockEventId } })
      );
      expect(prisma.event.update).toHaveBeenCalled();
      expect(notificationService.createEventOngoingNotification).toHaveBeenCalledWith(
        expect.objectContaining({
          eventId: mockEventId,
          eventTitle: mockEvent.title,
          attendeeIds: ['user-1', 'user-2'],
        })
      );

      expect(consoleSpy).toHaveBeenCalledWith('Failed to create event status notification:', notificationError);
      expect(result).toBeDefined();
      expect(result.status).toBe('ONGOING');

      consoleSpy.mockRestore();
    });
  });
});
