/**
 * Unit Tests for Push Notification Service
 * Tests subscription saving, removal, push dispatching, and expired subscription cleanup
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { PushNotificationService } from '@/lib/services/push-notification.service';
import { prisma } from '@/lib/prisma';
import webpush from 'web-push';

// Mock Prisma
vi.mock('@/lib/prisma', () => ({
  prisma: {
    pushSubscription: {
      create: vi.fn(),
      findUnique: vi.fn(),
      findMany: vi.fn(),
      update: vi.fn(),
      deleteMany: vi.fn(),
    },
  },
}));

// Mock web-push
vi.mock('web-push', () => ({
  default: {
    setVapidDetails: vi.fn(),
    sendNotification: vi.fn(),
    // Used when no VAPID env keys are configured (as in CI)
    generateVAPIDKeys: vi.fn(() => ({
      publicKey: 'BTestPublicVapidKey0123456789abcdefghijklmnopqrstuvwxyz',
      privateKey: 'test-private-vapid-key',
    })),
  },
}));

describe('PushNotificationService', () => {
  let service: PushNotificationService;

  beforeEach(() => {
    service = new PushNotificationService();
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('getPublicKey', () => {
    it('should return a non-empty public VAPID key', () => {
      const key = service.getPublicKey();
      expect(key).toBeDefined();
      expect(typeof key).toBe('string');
      expect(key.length).toBeGreaterThan(10);
    });
  });

  describe('saveSubscription', () => {
    const mockSubscription = {
      endpoint: 'https://fcm.googleapis.com/fcm/send/test-endpoint',
      keys: {
        p256dh: 'test-p256dh-key',
        auth: 'test-auth-key',
      },
    };

    it('should create new subscription if not existing', async () => {
      vi.mocked((prisma as any).pushSubscription.findUnique).mockResolvedValue(null);
      vi.mocked((prisma as any).pushSubscription.create).mockResolvedValue({
        id: 'sub-1',
        userId: 'user-123',
        endpoint: mockSubscription.endpoint,
        p256dh: mockSubscription.keys.p256dh,
        auth: mockSubscription.keys.auth,
        userAgent: 'Chrome',
        createdAt: new Date(),
        updatedAt: new Date(),
      } as any);

      const result = await service.saveSubscription('user-123', mockSubscription, 'Chrome');

      expect((prisma as any).pushSubscription.findUnique).toHaveBeenCalledWith({
        where: { endpoint: mockSubscription.endpoint },
      });
      expect((prisma as any).pushSubscription.create).toHaveBeenCalledWith({
        data: {
          userId: 'user-123',
          endpoint: mockSubscription.endpoint,
          p256dh: mockSubscription.keys.p256dh,
          auth: mockSubscription.keys.auth,
          userAgent: 'Chrome',
        },
      });
      expect(result.id).toBe('sub-1');
    });

    it('should update existing subscription when already registered', async () => {
      vi.mocked((prisma as any).pushSubscription.findUnique).mockResolvedValue({
        id: 'sub-1',
        endpoint: mockSubscription.endpoint,
        userAgent: 'Old Browser',
      } as any);
      vi.mocked((prisma as any).pushSubscription.update).mockResolvedValue({
        id: 'sub-1',
        userId: 'user-123',
        endpoint: mockSubscription.endpoint,
        p256dh: mockSubscription.keys.p256dh,
        auth: mockSubscription.keys.auth,
        userAgent: 'New Browser',
        createdAt: new Date(),
        updatedAt: new Date(),
      } as any);

      const result = await service.saveSubscription('user-123', mockSubscription, 'New Browser');

      expect((prisma as any).pushSubscription.update).toHaveBeenCalled();
      expect(result.id).toBe('sub-1');
    });

    it('should throw validation error if userId is missing', async () => {
      await expect(service.saveSubscription('', mockSubscription)).rejects.toThrow();
    });
  });

  describe('removeSubscription', () => {
    it('should remove subscription by endpoint for a user', async () => {
      vi.mocked((prisma as any).pushSubscription.deleteMany).mockResolvedValue({ count: 1 });

      const result = await service.removeSubscription('user-123', 'https://push.example.com/sub');

      expect((prisma as any).pushSubscription.deleteMany).toHaveBeenCalledWith({
        where: {
          userId: 'user-123',
          endpoint: 'https://push.example.com/sub',
        },
      });
      expect(result.success).toBe(true);
      expect(result.count).toBe(1);
    });
  });

  describe('sendPushToUser', () => {
    it('should return sent: 0 if user has no registered push subscriptions', async () => {
      vi.mocked((prisma as any).pushSubscription.findMany).mockResolvedValue([]);

      const result = await service.sendPushToUser('user-123', {
        title: 'Test Notification',
        body: 'Hello World',
      });

      expect(result).toEqual({ sent: 0, failed: 0, removed: 0 });
      expect(webpush.sendNotification).not.toHaveBeenCalled();
    });

    it('should send notifications to all registered device subscriptions for user', async () => {
      vi.mocked((prisma as any).pushSubscription.findMany).mockResolvedValue([
        {
          id: 'sub-1',
          userId: 'user-123',
          endpoint: 'https://push.example.com/desktop',
          p256dh: 'p256-1',
          auth: 'auth-1',
          userAgent: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 'sub-2',
          userId: 'user-123',
          endpoint: 'https://push.example.com/mobile',
          p256dh: 'p256-2',
          auth: 'auth-2',
          userAgent: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ]);
      vi.mocked(webpush.sendNotification).mockResolvedValue({} as any);

      const result = await service.sendPushToUser('user-123', {
        title: 'New Mentor Session',
        body: 'You have a session scheduled tomorrow',
        actionUrl: '/mentors',
      });

      expect(result.sent).toBe(2);
      expect(result.failed).toBe(0);
      expect(webpush.sendNotification).toHaveBeenCalledTimes(2);
    });

    it('should automatically remove 410 Gone / expired subscriptions', async () => {
      vi.mocked((prisma as any).pushSubscription.findMany).mockResolvedValue([
        {
          id: 'sub-expired',
          userId: 'user-123',
          endpoint: 'https://push.example.com/expired-sub',
          p256dh: 'p256-1',
          auth: 'auth-1',
          userAgent: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ]);
      const goneError = new Error('Subscription expired');
      (goneError as any).statusCode = 410;
      vi.mocked(webpush.sendNotification).mockRejectedValue(goneError);
      vi.mocked((prisma as any).pushSubscription.deleteMany).mockResolvedValue({ count: 1 });

      const result = await service.sendPushToUser('user-123', {
        title: 'Alert',
        body: 'Test',
      });

      expect(result.failed).toBe(1);
      expect(result.removed).toBe(1);
      expect((prisma as any).pushSubscription.deleteMany).toHaveBeenCalledWith({
        where: {
          endpoint: { in: ['https://push.example.com/expired-sub'] },
        },
      });
    });
  });
});
