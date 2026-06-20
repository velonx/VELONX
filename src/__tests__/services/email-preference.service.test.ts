import { describe, it, expect, vi, beforeEach } from 'vitest';
import { EmailPreferenceService } from '@/lib/services/email-preference.service';
import { prisma } from '@/lib/prisma';
import {
  EmailNotificationCategory,
  EmailNotificationFrequency,
} from '@/lib/prisma-enums';

// Mock Prisma
vi.mock('@/lib/prisma', () => ({
  prisma: {
    emailNotificationPreference: {
      findUnique: vi.fn(),
      upsert: vi.fn(),
      findMany: vi.fn(),
    },
    user: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
    },
  },
}));

describe('EmailPreferenceService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getFrequency', () => {
    it('should return explicit preference when it exists in DB', async () => {
      vi.mocked(prisma.emailNotificationPreference.findUnique).mockResolvedValue({
        id: 'pref-1',
        userId: 'user-123',
        category: EmailNotificationCategory.EVENT_POSTED,
        frequency: EmailNotificationFrequency.WEEKLY,
        updatedAt: new Date(),
      } as any);

      const freq = await EmailPreferenceService.getFrequency(
        'user-123',
        EmailNotificationCategory.EVENT_POSTED
      );

      expect(freq).toBe(EmailNotificationFrequency.WEEKLY);
      expect(prisma.emailNotificationPreference.findUnique).toHaveBeenCalledWith({
        where: {
          userId_category: {
            userId: 'user-123',
            category: EmailNotificationCategory.EVENT_POSTED,
          },
        },
        select: { frequency: true },
      });
    });

    it('should return category default when no DB row exists', async () => {
      vi.mocked(prisma.emailNotificationPreference.findUnique).mockResolvedValue(null);

      const freq = await EmailPreferenceService.getFrequency(
        'user-123',
        EmailNotificationCategory.RESOURCE_ADDED
      );

      // Default for RESOURCE_ADDED is WEEKLY
      expect(freq).toBe(EmailNotificationFrequency.WEEKLY);
    });
  });

  describe('setFrequency', () => {
    it('should upsert the preference in the database', async () => {
      vi.mocked(prisma.emailNotificationPreference.upsert).mockResolvedValue({} as any);

      await EmailPreferenceService.setFrequency(
        'user-123',
        EmailNotificationCategory.JOB_POSTED,
        EmailNotificationFrequency.OFF
      );

      expect(prisma.emailNotificationPreference.upsert).toHaveBeenCalledWith({
        where: {
          userId_category: {
            userId: 'user-123',
            category: EmailNotificationCategory.JOB_POSTED,
          },
        },
        create: {
          userId: 'user-123',
          category: EmailNotificationCategory.JOB_POSTED,
          frequency: EmailNotificationFrequency.OFF,
        },
        update: {
          frequency: EmailNotificationFrequency.OFF,
        },
      });
    });
  });

  describe('getAllPreferences', () => {
    it('should return all 7 categories with custom or default frequencies', async () => {
      // Mock existing rows in DB (only 2 out of 7 categories configured)
      const mockRows = [
        {
          category: EmailNotificationCategory.JOB_POSTED,
          frequency: EmailNotificationFrequency.DAILY,
        },
        {
          category: EmailNotificationCategory.EVENT_POSTED,
          frequency: EmailNotificationFrequency.OFF,
        },
      ];
      vi.mocked(prisma.emailNotificationPreference.findMany).mockResolvedValue(mockRows as any);

      const preferences = await EmailPreferenceService.getAllPreferences('user-123');

      expect(preferences).toHaveLength(7);
      
      // JOB_POSTED was set to DAILY
      const jobPref = preferences.find((p) => p.category === EmailNotificationCategory.JOB_POSTED);
      expect(jobPref?.frequency).toBe(EmailNotificationFrequency.DAILY);
      expect(jobPref?.label).toBe('New Job Posted');

      // EVENT_POSTED was set to OFF
      const eventPref = preferences.find((p) => p.category === EmailNotificationCategory.EVENT_POSTED);
      expect(eventPref?.frequency).toBe(EmailNotificationFrequency.OFF);

      // RESOURCE_ADDED was not set, so should fallback to default (WEEKLY)
      const resourcePref = preferences.find((p) => p.category === EmailNotificationCategory.RESOURCE_ADDED);
      expect(resourcePref?.frequency).toBe(EmailNotificationFrequency.WEEKLY);

      expect(prisma.emailNotificationPreference.findMany).toHaveBeenCalledWith({
        where: { userId: 'user-123' },
      });
    });
  });

  describe('getInstantRecipients', () => {
    it('should resolve recipients for personal notification', async () => {
      // POST_COMMENT is a personal category with targetUserIds override
      // User 1 has explicit preference (OFF), User 2 has no preference (defaults to INSTANT)
      vi.mocked(prisma.emailNotificationPreference.findMany).mockResolvedValue([
        {
          userId: 'user-1',
          frequency: EmailNotificationFrequency.OFF,
        },
      ] as any);

      const recipients = await EmailPreferenceService.getInstantRecipients(
        EmailNotificationCategory.POST_COMMENT,
        ['user-1', 'user-2']
      );

      // user-1 has OFF, so only user-2 gets notified (default is INSTANT)
      expect(recipients).toEqual(['user-2']);
      expect(prisma.emailNotificationPreference.findMany).toHaveBeenCalledWith({
        where: {
          userId: { in: ['user-1', 'user-2'] },
          category: EmailNotificationCategory.POST_COMMENT,
        },
        select: { userId: true, frequency: true },
      });
    });

    it('should resolve recipients for broadcast notification', async () => {
      // JOB_POSTED is a broadcast category. Default is INSTANT.
      // Mock all active users
      vi.mocked(prisma.user.findMany).mockResolvedValue([
        { id: 'user-1' },
        { id: 'user-2' },
        { id: 'user-3' },
      ] as any);

      // Mock preferences: user-2 explicitly disabled it
      vi.mocked(prisma.emailNotificationPreference.findMany).mockResolvedValue([
        {
          userId: 'user-2',
          frequency: EmailNotificationFrequency.OFF,
        },
      ] as any);

      const recipients = await EmailPreferenceService.getInstantRecipients(
        EmailNotificationCategory.JOB_POSTED
      );

      // user-1 and user-3 fallback to default (INSTANT). user-2 is excluded.
      expect(recipients).toEqual(['user-1', 'user-3']);
      expect(prisma.user.findMany).toHaveBeenCalledWith({
        where: { emailNotifications: true },
        select: { id: true },
      });
    });
  });

  describe('getDigestRecipients', () => {
    it('should resolve users for DAILY digest frequency', async () => {
      // Mock preference rows
      vi.mocked(prisma.emailNotificationPreference.findMany).mockResolvedValueOnce([
        { userId: 'user-1' },
        { userId: 'user-2' },
      ] as any);

      // Mock opted-in users
      vi.mocked(prisma.user.findMany).mockImplementation(async (args: any) => {
        // Mock getDigestRecipients user query
        if (args?.where?.id?.in) {
          return [{ id: 'user-1' }, { id: 'user-2' }] as any;
        }
        // Mock defaultIsDaily active users check
        return [{ id: 'user-1' }, { id: 'user-2' }, { id: 'user-3' }] as any;
      });

      const recipients = await EmailPreferenceService.getDigestRecipients('DAILY');

      expect(recipients).toContain('user-1');
      expect(recipients).toContain('user-2');
      expect(prisma.emailNotificationPreference.findMany).toHaveBeenCalledWith({
        where: { frequency: EmailNotificationFrequency.DAILY },
        select: { userId: true },
        distinct: ['userId'],
      });
    });
  });
});
