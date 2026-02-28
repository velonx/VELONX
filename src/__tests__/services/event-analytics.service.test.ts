/**
 * Event Analytics Service Tests
 * Feature: event-registration-closed
 * Requirements: 7.4, 10.1, 10.2, 10.3, 10.5
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { eventAnalyticsService } from '@/lib/services/event-analytics.service';
import { prisma } from '@/lib/prisma';

// Mock prisma
vi.mock('@/lib/prisma', () => ({
  prisma: {
    eventRegistrationClosure: {
      create: vi.fn(),
      findFirst: vi.fn(),
      count: vi.fn(),
    },
    failedRegistrationAttempt: {
      create: vi.fn(),
      count: vi.fn(),
    },
  },
}));

describe('Event Analytics Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('trackRegistrationClosure', () => {
    it('should record closure timestamp and reason', async () => {
      const mockData = {
        eventId: 'event-123',
        closureReason: 'capacity' as const,
        attendeeCount: 50,
        eventCreatedAt: new Date('2024-01-01T00:00:00Z'),
      };

      vi.mocked(prisma.eventRegistrationClosure.create).mockResolvedValue({
        id: 'closure-123',
        eventId: mockData.eventId,
        closureTimestamp: new Date(),
        closureReason: mockData.closureReason,
        attendeeCountAtClosure: mockData.attendeeCount,
        timeToClosureMs: 86400000,
        createdAt: new Date(),
      });

      await eventAnalyticsService.trackRegistrationClosure(mockData);

      expect(prisma.eventRegistrationClosure.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          eventId: mockData.eventId,
          closureReason: mockData.closureReason,
          attendeeCountAtClosure: mockData.attendeeCount,
          timeToClosureMs: expect.any(Number),
        }),
      });
    });

    it('should calculate time to closure correctly', async () => {
      const eventCreatedAt = new Date('2024-01-01T00:00:00Z');
      const mockData = {
        eventId: 'event-123',
        closureReason: 'capacity' as const,
        attendeeCount: 50,
        eventCreatedAt,
      };

      let capturedTimeToClosureMs: number | undefined;

      vi.mocked(prisma.eventRegistrationClosure.create).mockImplementation(async (args: any) => {
        capturedTimeToClosureMs = args.data.timeToClosureMs;
        return {
          id: 'closure-123',
          eventId: mockData.eventId,
          closureTimestamp: new Date(),
          closureReason: mockData.closureReason,
          attendeeCountAtClosure: mockData.attendeeCount,
          timeToClosureMs: capturedTimeToClosureMs!,
          createdAt: new Date(),
        };
      });

      await eventAnalyticsService.trackRegistrationClosure(mockData);

      expect(capturedTimeToClosureMs).toBeGreaterThan(0);
      expect(capturedTimeToClosureMs).toBeDefined();
    });

    it('should not throw error if tracking fails', async () => {
      const mockData = {
        eventId: 'event-123',
        closureReason: 'capacity' as const,
        attendeeCount: 50,
        eventCreatedAt: new Date(),
      };

      vi.mocked(prisma.eventRegistrationClosure.create).mockRejectedValue(
        new Error('Database error')
      );

      // Should not throw
      await expect(
        eventAnalyticsService.trackRegistrationClosure(mockData)
      ).resolves.not.toThrow();
    });
  });

  describe('logFailedRegistrationAttempt', () => {
    it('should log failed attempt with all required fields', async () => {
      const mockData = {
        eventId: 'event-123',
        userId: 'user-456',
        closureReason: 'deadline' as const,
        errorCode: 'REGISTRATION_CLOSED_DEADLINE',
      };

      vi.mocked(prisma.failedRegistrationAttempt.create).mockResolvedValue({
        id: 'attempt-123',
        eventId: mockData.eventId,
        userId: mockData.userId,
        attemptTimestamp: new Date(),
        closureReason: mockData.closureReason,
        errorCode: mockData.errorCode,
      });

      await eventAnalyticsService.logFailedRegistrationAttempt(mockData);

      expect(prisma.failedRegistrationAttempt.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          eventId: mockData.eventId,
          userId: mockData.userId,
          closureReason: mockData.closureReason,
          errorCode: mockData.errorCode,
          attemptTimestamp: expect.any(Date),
        }),
      });
    });

    it('should not throw error if logging fails', async () => {
      const mockData = {
        eventId: 'event-123',
        userId: 'user-456',
        closureReason: 'manual' as const,
        errorCode: 'REGISTRATION_CLOSED_MANUAL',
      };

      vi.mocked(prisma.failedRegistrationAttempt.create).mockRejectedValue(
        new Error('Database error')
      );

      // Should not throw
      await expect(
        eventAnalyticsService.logFailedRegistrationAttempt(mockData)
      ).resolves.not.toThrow();
    });
  });

  describe('getFailedAttemptCount', () => {
    it('should return count of failed attempts for event', async () => {
      const eventId = 'event-123';
      const expectedCount = 5;

      vi.mocked(prisma.failedRegistrationAttempt.count).mockResolvedValue(expectedCount);

      const count = await eventAnalyticsService.getFailedAttemptCount(eventId);

      expect(count).toBe(expectedCount);
      expect(prisma.failedRegistrationAttempt.count).toHaveBeenCalledWith({
        where: { eventId },
      });
    });

    it('should return 0 if query fails', async () => {
      const eventId = 'event-123';

      vi.mocked(prisma.failedRegistrationAttempt.count).mockRejectedValue(
        new Error('Database error')
      );

      const count = await eventAnalyticsService.getFailedAttemptCount(eventId);

      expect(count).toBe(0);
    });
  });

  describe('getRegistrationClosureAnalytics', () => {
    it('should return complete analytics data', async () => {
      const eventId = 'event-123';
      const mockClosure = {
        id: 'closure-123',
        eventId,
        closureTimestamp: new Date('2024-01-02T00:00:00Z'),
        closureReason: 'capacity',
        attendeeCountAtClosure: 50,
        timeToClosureMs: 86400000,
        createdAt: new Date(),
      };

      vi.mocked(prisma.eventRegistrationClosure.findFirst).mockResolvedValue(mockClosure);
      vi.mocked(prisma.failedRegistrationAttempt.count).mockResolvedValue(3);

      const analytics = await eventAnalyticsService.getRegistrationClosureAnalytics(eventId);

      expect(analytics).toEqual({
        closureTimestamp: mockClosure.closureTimestamp,
        closureReason: mockClosure.closureReason,
        attendeeCountAtClosure: mockClosure.attendeeCountAtClosure,
        timeToClosureMs: mockClosure.timeToClosureMs,
        failedAttempts: 3,
      });
    });

    it('should return null if no closure found', async () => {
      const eventId = 'event-123';

      vi.mocked(prisma.eventRegistrationClosure.findFirst).mockResolvedValue(null);

      const analytics = await eventAnalyticsService.getRegistrationClosureAnalytics(eventId);

      expect(analytics).toBeNull();
    });

    it('should return null if query fails', async () => {
      const eventId = 'event-123';

      vi.mocked(prisma.eventRegistrationClosure.findFirst).mockRejectedValue(
        new Error('Database error')
      );

      const analytics = await eventAnalyticsService.getRegistrationClosureAnalytics(eventId);

      expect(analytics).toBeNull();
    });
  });

  describe('hasClosureBeenTracked', () => {
    it('should return true if recent closure exists', async () => {
      const eventId = 'event-123';
      const reason = 'capacity' as const;
      const recentClosure = {
        id: 'closure-123',
        eventId,
        closureTimestamp: new Date(), // Recent
        closureReason: reason,
        attendeeCountAtClosure: 50,
        timeToClosureMs: 86400000,
        createdAt: new Date(),
      };

      vi.mocked(prisma.eventRegistrationClosure.findFirst).mockResolvedValue(recentClosure);

      const tracked = await eventAnalyticsService.hasClosureBeenTracked(eventId, reason);

      expect(tracked).toBe(true);
    });

    it('should return false if closure is old', async () => {
      const eventId = 'event-123';
      const reason = 'capacity' as const;
      const oldClosure = {
        id: 'closure-123',
        eventId,
        closureTimestamp: new Date(Date.now() - 10 * 60 * 1000), // 10 minutes ago
        closureReason: reason,
        attendeeCountAtClosure: 50,
        timeToClosureMs: 86400000,
        createdAt: new Date(),
      };

      vi.mocked(prisma.eventRegistrationClosure.findFirst).mockResolvedValue(oldClosure);

      const tracked = await eventAnalyticsService.hasClosureBeenTracked(eventId, reason);

      expect(tracked).toBe(false);
    });

    it('should return false if no closure found', async () => {
      const eventId = 'event-123';
      const reason = 'capacity' as const;

      vi.mocked(prisma.eventRegistrationClosure.findFirst).mockResolvedValue(null);

      const tracked = await eventAnalyticsService.hasClosureBeenTracked(eventId, reason);

      expect(tracked).toBe(false);
    });

    it('should return false if query fails', async () => {
      const eventId = 'event-123';
      const reason = 'capacity' as const;

      vi.mocked(prisma.eventRegistrationClosure.findFirst).mockRejectedValue(
        new Error('Database error')
      );

      const tracked = await eventAnalyticsService.hasClosureBeenTracked(eventId, reason);

      expect(tracked).toBe(false);
    });
  });
});
