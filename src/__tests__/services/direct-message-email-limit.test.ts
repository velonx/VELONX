import { describe, it, expect, vi, beforeEach } from 'vitest';
import { EmailService } from '../../lib/services/email.service';
import { prisma } from '../../lib/prisma';

// Mock Prisma
const mockPrisma = {
  directMessage: {
    findFirst: vi.fn(),
  },
};

vi.mock('@/lib/prisma', () => ({
  prisma: mockPrisma,
}));

// Mock Resend to test EmailService template output
const sendMock = vi.fn().mockResolvedValue({ data: { id: 'test-email-id' }, error: null });
vi.mock('resend', () => {
  return {
    Resend: class {
      constructor(apiKey: string) {}
      emails = {
        send: sendMock,
      };
    },
  };
});

describe('Direct Message Email Notifications', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.RESEND_API_KEY = 're_12345';
    process.env.NEXT_PUBLIC_SITE_URL = 'https://velonx.in';
  });

  describe('EmailService.shouldSendDirectMessageEmail', () => {
    it('should return true if no message has been sent today', async () => {
      // Mock findFirst to return null (no previous messages today)
      mockPrisma.directMessage.findFirst.mockResolvedValue(null);

      const result = await EmailService.shouldSendDirectMessageEmail('sender-1', 'receiver-1', 'msg-new');
      
      expect(result).toBe(true);
      expect(mockPrisma.directMessage.findFirst).toHaveBeenCalledWith({
        where: {
          senderId: 'sender-1',
          receiverId: 'receiver-1',
          id: { not: 'msg-new' },
          createdAt: {
            gte: expect.any(Date),
          },
        },
      });
    });

    it('should return false if a message was already sent today', async () => {
      // Mock findFirst to return a previous message
      mockPrisma.directMessage.findFirst.mockResolvedValue({
        id: 'msg-prev',
        senderId: 'sender-1',
        receiverId: 'receiver-1',
        createdAt: new Date(),
      });

      const result = await EmailService.shouldSendDirectMessageEmail('sender-1', 'receiver-1', 'msg-new');

      expect(result).toBe(false);
      expect(mockPrisma.directMessage.findFirst).toHaveBeenCalled();
    });
  });

  describe('EmailService.sendDirectMessageEmail', () => {
    it('should generate LinkedIn-style email notification without the message body', async () => {
      const receiver = { email: 'receiver@example.com', name: 'Bob' };
      const sender = { name: 'Alice' };

      await EmailService.sendDirectMessageEmail(receiver, sender, 'Hello Bob! This is secret.');

      expect(sendMock).toHaveBeenCalledTimes(1);
      const callArgs = sendMock.mock.calls[0][0];
      
      expect(callArgs.to).toBe('receiver@example.com');
      expect(callArgs.subject).toBe('New message from Alice on VELONX');
      
      // Ensure the message excerpt is NOT in the HTML template
      expect(callArgs.html).not.toContain('Hello Bob! This is secret.');
      
      // Ensure typical LinkedIn-style text is present
      expect(callArgs.html).toContain('You received a new message from <strong>Alice</strong> on VELONX.');
      expect(callArgs.html).toContain('View Message');
      expect(callArgs.html).not.toContain('Reply to Message');
    });
  });
});
