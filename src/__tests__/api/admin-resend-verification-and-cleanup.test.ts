import { describe, it, expect, vi, beforeEach } from 'vitest';
import { POST as resendHandler } from '../../app/api/admin/verifications/resend/route';
import { GET as cleanupHandler } from '../../app/api/cron/cleanup-unverified/route';
import { GET as exportHandler } from '../../app/api/admin/users/export/route';
import { createMockNextRequest } from '../utils/api-test-helpers';
import { createMockSession } from '../mocks/session.mock';
import { NextResponse } from 'next/server';

const mockPrisma = vi.hoisted(() => ({
  user: {
    findUnique: vi.fn(),
    findMany: vi.fn(),
    deleteMany: vi.fn(),
  },
  verificationToken: {
    deleteMany: vi.fn(),
    create: vi.fn(),
  },
  $transaction: vi.fn(),
}));

vi.mock('../../lib/prisma', () => ({
  prisma: mockPrisma,
}));

vi.mock('../../lib/services/email.service', () => ({
  EmailService: {
    sendVerificationEmail: vi.fn().mockResolvedValue({ success: true }),
  },
}));

vi.mock('../../lib/middleware/auth.middleware', () => ({
  requireAdmin: vi.fn(async () => createMockSession({ user: { role: 'ADMIN' } })),
}));

describe('Admin Resend Verification and Cleanup Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.CRON_SECRET = 'test-secret';
  });

  describe('POST /api/admin/verifications/resend', () => {
    it('should require admin authorization', async () => {
      const { requireAdmin } = await import('../../lib/middleware/auth.middleware');
      vi.mocked(requireAdmin).mockResolvedValueOnce(
        NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      );

      const request = createMockNextRequest({
        method: 'POST',
        url: 'http://localhost:3000/api/admin/verifications/resend',
        body: { email: 'test@example.com' },
      });

      const response = await resendHandler(request);
      expect(response.status).toBe(401);
    });

    it('should validate that email is required', async () => {
      const request = createMockNextRequest({
        method: 'POST',
        url: 'http://localhost:3000/api/admin/verifications/resend',
        body: {},
      });

      const response = await resendHandler(request);
      const data = await response.json();
      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error).toBe('Email is required');
    });

    it('should return 444 if user is not found', async () => {
      mockPrisma.user.findUnique.mockResolvedValueOnce(null);

      const request = createMockNextRequest({
        method: 'POST',
        url: 'http://localhost:3000/api/admin/verifications/resend',
        body: { email: 'missing@example.com' },
      });

      const response = await resendHandler(request);
      const data = await response.json();
      expect(response.status).toBe(444);
      expect(data.success).toBe(false);
      expect(data.error).toBe('User not found');
    });

    it('should return 400 if user is already verified', async () => {
      mockPrisma.user.findUnique.mockResolvedValueOnce({
        email: 'verified@example.com',
        emailVerified: new Date(),
        accounts: [],
      });

      const request = createMockNextRequest({
        method: 'POST',
        url: 'http://localhost:3000/api/admin/verifications/resend',
        body: { email: 'verified@example.com' },
      });

      const response = await resendHandler(request);
      const data = await response.json();
      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error).toBe('User is already verified');
    });

    it('should return 400 if user is OAuth (has linked accounts)', async () => {
      mockPrisma.user.findUnique.mockResolvedValueOnce({
        email: 'oauth@example.com',
        emailVerified: null,
        accounts: [{ id: 'acc-1', provider: 'google' }],
      });

      const request = createMockNextRequest({
        method: 'POST',
        url: 'http://localhost:3000/api/admin/verifications/resend',
        body: { email: 'oauth@example.com' },
      });

      const response = await resendHandler(request);
      const data = await response.json();
      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error).toContain('does not need email verification');
    });

    it('should resend email verification for valid unverified credentials user', async () => {
      mockPrisma.user.findUnique.mockResolvedValueOnce({
        email: 'credentials@example.com',
        name: 'Credentials User',
        emailVerified: null,
        accounts: [],
      });

      mockPrisma.$transaction.mockResolvedValueOnce([
        { count: 1 },
        { identifier: 'credentials@example.com', token: 'new-token' },
      ]);

      const request = createMockNextRequest({
        method: 'POST',
        url: 'http://localhost:3000/api/admin/verifications/resend',
        body: { email: 'credentials@example.com' },
      });

      const response = await resendHandler(request);
      const data = await response.json();
      
      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.message).toBe('Verification email resent successfully');
      expect(mockPrisma.$transaction).toHaveBeenCalled();
    });
  });

  describe('GET /api/cron/cleanup-unverified', () => {
    it('should require a valid authorization secret', async () => {
      const request = createMockNextRequest({
        method: 'GET',
        url: 'http://localhost:3000/api/cron/cleanup-unverified',
        headers: {
          authorization: 'Bearer wrong-secret',
        },
      });

      const response = await cleanupHandler(request);
      expect(response.status).toBe(401);
    });

    it('should return no users message if no users found to cleanup', async () => {
      mockPrisma.user.findMany.mockResolvedValueOnce([]);

      const request = createMockNextRequest({
        method: 'GET',
        url: 'http://localhost:3000/api/cron/cleanup-unverified',
        headers: {
          authorization: 'Bearer test-secret',
        },
      });

      const response = await cleanupHandler(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.deletedCount).toBe(0);
    });

    it('should clean up unverified credentials users if found', async () => {
      const mockUnverifiedUsers = [
        { id: 'user-1', email: 'user1@example.com' },
        { id: 'user-2', email: 'user2@example.com' },
      ];
      mockPrisma.user.findMany.mockResolvedValueOnce(mockUnverifiedUsers);
      mockPrisma.$transaction.mockResolvedValueOnce([
        { count: 2 }, // deleted tokens
        { count: 2 }, // deleted users
      ]);

      const request = createMockNextRequest({
        method: 'GET',
        url: 'http://localhost:3000/api/cron/cleanup-unverified',
        headers: {
          authorization: 'Bearer test-secret',
        },
      });

      const response = await cleanupHandler(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.deletedCount).toBe(2);
      expect(mockPrisma.user.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            emailVerified: null,
            role: 'STUDENT',
            accounts: { none: {} },
          }),
        })
      );
    });
  });

  describe('GET /api/admin/users/export', () => {
    it('should require admin authorization', async () => {
      const { requireAdmin } = await import('../../lib/middleware/auth.middleware');
      vi.mocked(requireAdmin).mockResolvedValueOnce(
        NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      );

      const request = createMockNextRequest({
        method: 'GET',
        url: 'http://localhost:3000/api/admin/users/export',
      });

      const response = await exportHandler(request);
      expect(response.status).toBe(401);
    });

    it('should export all users in CSV format', async () => {
      const mockUsers = [
        {
          id: 'user-1',
          name: 'John Doe',
          email: 'john@example.com',
          role: 'STUDENT',
          emailVerified: null,
          xp: 100,
          level: 2,
          referralCode: 'REF123',
          createdAt: new Date('2024-01-01T00:00:00.000Z'),
          accounts: [{ provider: 'google' }],
        },
        {
          id: 'user-2',
          name: 'Jane Smith',
          email: 'jane@example.com',
          role: 'STUDENT',
          emailVerified: null,
          xp: 0,
          level: 1,
          referralCode: 'REF456',
          createdAt: new Date('2024-01-02T00:00:00.000Z'),
          accounts: [],
        },
      ];

      mockPrisma.user.findMany.mockResolvedValueOnce(mockUsers);

      const request = createMockNextRequest({
        method: 'GET',
        url: 'http://localhost:3000/api/admin/users/export',
      });

      const response = await exportHandler(request);
      expect(response.status).toBe(200);
      expect(response.headers.get('Content-Type')).toContain('text/csv');
      expect(response.headers.get('Content-Disposition')).toContain('attachment; filename=users-export.csv');

      const csvContent = await response.text();
      const lines = csvContent.split('\n');
      expect(lines[0]).toBe('ID,Name,Email,Role,Email Verified,Provider,XP,Level,Referral Code,Created At');
      expect(lines[1]).toContain('user-1,John Doe,john@example.com,STUDENT,Yes,google,100,2,REF123,2024-01-01T00:00:00.000Z');
      expect(lines[2]).toContain('user-2,Jane Smith,jane@example.com,STUDENT,No,credentials,0,1,REF456,2024-01-02T00:00:00.000Z');
    });
  });
});
