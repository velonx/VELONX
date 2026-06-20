import { describe, it, expect, vi, beforeEach } from 'vitest';
import { InstantEmailService } from '@/lib/services/instant-email.service';
import { EmailPreferenceService } from '@/lib/services/email-preference.service';
import { EmailService } from '@/lib/services/email.service';
import { prisma } from '@/lib/prisma';
import { EmailNotificationCategory } from '@/lib/prisma-enums';

// Mock EmailPreferenceService
vi.mock('@/lib/services/email-preference.service', () => ({
  EmailPreferenceService: {
    getInstantRecipients: vi.fn(),
  },
}));

// Mock EmailService
vi.mock('@/lib/services/email.service', () => ({
  EmailService: {
    sendJobAlert: vi.fn(),
    sendEventAnnouncement: vi.fn(),
    sendSwagAnnouncement: vi.fn(),
    sendPostCommentAlert: vi.fn(),
  },
}));

// Mock Prisma
vi.mock('@/lib/prisma', () => ({
  prisma: {
    user: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
    },
  },
}));

describe('InstantEmailService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('JOB_POSTED', () => {
    it('should fetch instant recipients and trigger sendJobAlert for each', async () => {
      const payload = {
        opportunityId: 'job-123',
        slug: 'software-engineer',
        title: 'Software Engineer',
        company: 'Velonx',
        location: 'Remote',
        type: 'JOB' as const,
        applyUrl: 'https://velonx.in/jobs/123',
      };

      vi.mocked(EmailPreferenceService.getInstantRecipients).mockResolvedValue(['user-1', 'user-2']);
      vi.mocked(prisma.user.findMany).mockResolvedValue([
        { id: 'user-1', email: 'user1@example.com', name: 'User One' },
        { id: 'user-2', email: 'user2@example.com', name: 'User Two' },
      ] as any);
      vi.mocked(EmailService.sendJobAlert).mockResolvedValue({} as any);

      await InstantEmailService.dispatch({
        category: 'JOB_POSTED',
        payload,
      });

      expect(EmailPreferenceService.getInstantRecipients).toHaveBeenCalledWith(
        EmailNotificationCategory.JOB_POSTED
      );
      expect(prisma.user.findMany).toHaveBeenCalledWith({
        where: { id: { in: ['user-1', 'user-2'] } },
        select: { id: true, email: true, name: true },
      });
      expect(EmailService.sendJobAlert).toHaveBeenCalledTimes(2);
      expect(EmailService.sendJobAlert).toHaveBeenCalledWith(
        { id: 'user-1', email: 'user1@example.com', name: 'User One' },
        payload
      );
    });

    it('should do nothing if no recipients found', async () => {
      vi.mocked(EmailPreferenceService.getInstantRecipients).mockResolvedValue([]);

      await InstantEmailService.dispatch({
        category: 'JOB_POSTED',
        payload: {
          opportunityId: 'job-123',
          slug: 'software-engineer',
          title: 'Software Engineer',
          company: 'Velonx',
          location: 'Remote',
          type: 'JOB' as const,
          applyUrl: 'https://velonx.in/jobs/123',
        },
      });

      expect(prisma.user.findMany).not.toHaveBeenCalled();
      expect(EmailService.sendJobAlert).not.toHaveBeenCalled();
    });
  });

  describe('SWAG_ANNOUNCED', () => {
    it('should trigger sendSwagAnnouncement for instant recipients', async () => {
      const payload = {
        swagId: 'swag-1',
        name: 'Cool Hoodie',
        description: 'Premium cotton hoodie',
        imageUrl: 'https://velonx.in/hoodie.jpg',
      };

      vi.mocked(EmailPreferenceService.getInstantRecipients).mockResolvedValue(['user-1']);
      vi.mocked(prisma.user.findMany).mockResolvedValue([
        { id: 'user-1', email: 'user1@example.com', name: 'User One' },
      ] as any);
      vi.mocked(EmailService.sendSwagAnnouncement).mockResolvedValue({} as any);

      await InstantEmailService.dispatch({
        category: 'SWAG_ANNOUNCED',
        payload,
      });

      expect(EmailService.sendSwagAnnouncement).toHaveBeenCalledWith(
        { id: 'user-1', email: 'user1@example.com', name: 'User One' },
        payload
      );
    });
  });

  describe('POST_COMMENT', () => {
    it('should target the post author and trigger sendPostCommentAlert', async () => {
      const payload = {
        postId: 'post-1',
        postAuthorId: 'author-123',
        postExcerpt: 'Hello world',
        commenterName: 'Alice',
        commentExcerpt: 'Great post!',
      };

      vi.mocked(EmailPreferenceService.getInstantRecipients).mockResolvedValue(['author-123']);
      vi.mocked(prisma.user.findUnique).mockResolvedValue({
        id: 'author-123',
        email: 'author@example.com',
        name: 'Post Author',
      } as any);
      vi.mocked(EmailService.sendPostCommentAlert).mockResolvedValue({} as any);

      await InstantEmailService.dispatch({
        category: 'POST_COMMENT',
        payload,
      });

      expect(EmailPreferenceService.getInstantRecipients).toHaveBeenCalledWith(
        EmailNotificationCategory.POST_COMMENT,
        ['author-123']
      );
      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { id: 'author-123' },
        select: { id: true, email: true, name: true },
      });
      expect(EmailService.sendPostCommentAlert).toHaveBeenCalledWith(
        { id: 'author-123', email: 'author@example.com', name: 'Post Author' },
        payload
      );
    });
  });
});
