import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GET as profileCompletionHandler } from '../../app/api/cron/profile-completion/route';
import { createMockNextRequest } from '../utils/api-test-helpers';

const mockPrisma = vi.hoisted(() => ({
  user: {
    findMany: vi.fn(),
  },
}));

vi.mock('../../lib/prisma', () => ({
  prisma: mockPrisma,
}));

const mockSendProfileCompletionEmail = vi.fn().mockResolvedValue({ success: true });

vi.mock('../../lib/services/email.service', () => ({
  EmailService: {
    sendProfileCompletionEmail: (...args: any[]) => mockSendProfileCompletionEmail(...args),
  },
}));

describe('Profile Completion Cron Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.CRON_SECRET = 'test-secret';
  });

  it('should require a valid authorization secret', async () => {
    const request = createMockNextRequest({
      method: 'GET',
      url: 'http://localhost:3000/api/cron/profile-completion',
      headers: {
        authorization: 'Bearer wrong-secret',
      },
    });

    const response = await profileCompletionHandler(request);
    expect(response.status).toBe(401);
  });

  it('should return success and 0 emails sent if no incomplete profiles are found', async () => {
    mockPrisma.user.findMany.mockResolvedValueOnce([]);

    const request = createMockNextRequest({
      method: 'GET',
      url: 'http://localhost:3000/api/cron/profile-completion',
      headers: {
        authorization: 'Bearer test-secret',
      },
    });

    const response = await profileCompletionHandler(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.stats.emailsSent).toBe(0);
    expect(mockPrisma.user.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          role: 'STUDENT',
          profileComplete: false,
          emailNotifications: true,
        }),
      })
    );
  });

  it('should send profile completion emails to users and return correct stats', async () => {
    const mockIncompleteUsers = [
      { id: 'user-1', email: 'user1@example.com', name: 'Alice' },
      { id: 'user-2', email: 'user2@example.com', name: 'Bob' },
    ];
    mockPrisma.user.findMany.mockResolvedValueOnce(mockIncompleteUsers);

    mockSendProfileCompletionEmail
      .mockResolvedValueOnce({ success: true })
      .mockResolvedValueOnce({ success: false, error: 'Resend API error' });

    const request = createMockNextRequest({
      method: 'GET',
      url: 'http://localhost:3000/api/cron/profile-completion',
      headers: {
        authorization: 'Bearer test-secret',
      },
    });

    const response = await profileCompletionHandler(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.stats.totalRecipients).toBe(2);
    expect(data.stats.emailsSent).toBe(1);
    expect(data.stats.errors).toBe(1);

    expect(mockSendProfileCompletionEmail).toHaveBeenCalledTimes(2);
    expect(mockSendProfileCompletionEmail).toHaveBeenNthCalledWith(1, mockIncompleteUsers[0]);
    expect(mockSendProfileCompletionEmail).toHaveBeenNthCalledWith(2, mockIncompleteUsers[1]);
  });
});
