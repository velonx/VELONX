/**
 * Unit tests for GET /api/referral/stats endpoint
 * 
 * Note: Full integration tests require MongoDB replica set.
 * These tests verify the endpoint structure and response format.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GET } from '@/app/api/referral/stats/route';
import { NextResponse } from 'next/server';

// Mock the auth middleware
vi.mock('@/lib/middleware/auth.middleware', () => ({
  requireAuth: vi.fn()
}));

// Mock the referral service
vi.mock('@/lib/services/referral.service', () => ({
  getReferralStats: vi.fn()
}));

import { requireAuth } from '@/lib/middleware/auth.middleware';
import { getReferralStats } from '@/lib/services/referral.service';

describe('GET /api/referral/stats', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return stats with correct structure for authenticated user', async () => {
    // Mock auth to return test user
    vi.mocked(requireAuth).mockResolvedValue({
      user: { id: 'test-user-id', email: 'test@example.com' }
    } as any);

    // Mock stats response
    vi.mocked(getReferralStats).mockResolvedValue({
      totalReferrals: 5,
      activeReferrals: 3,
      totalXPEarned: 375,
      milestones: {
        signups: 5,
        profileCompletions: 3,
        firstActivities: 2
      }
    });

    const response = await GET();
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.data).toHaveProperty('totalReferrals');
    expect(data.data).toHaveProperty('activeReferrals');
    expect(data.data).toHaveProperty('totalXPEarned');
    expect(data.data).toHaveProperty('milestones');
    expect(data.data.milestones).toHaveProperty('signups');
    expect(data.data.milestones).toHaveProperty('profileCompletions');
    expect(data.data.milestones).toHaveProperty('firstActivities');
  });

  it('should return empty stats for user with no referrals', async () => {
    vi.mocked(requireAuth).mockResolvedValue({
      user: { id: 'test-user-id', email: 'test@example.com' }
    } as any);

    vi.mocked(getReferralStats).mockResolvedValue({
      totalReferrals: 0,
      activeReferrals: 0,
      totalXPEarned: 0,
      milestones: {
        signups: 0,
        profileCompletions: 0,
        firstActivities: 0
      }
    });

    const response = await GET();
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.data.totalReferrals).toBe(0);
    expect(data.data.activeReferrals).toBe(0);
    expect(data.data.totalXPEarned).toBe(0);
  });

  it('should return 401 when not authenticated', async () => {
    // Mock auth to return unauthorized response
    vi.mocked(requireAuth).mockResolvedValue(
      NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    );

    const response = await GET();
    expect(response.status).toBe(401);
  });

  it('should return 500 on database error', async () => {
    vi.mocked(requireAuth).mockResolvedValue({
      user: { id: 'test-user-id', email: 'test@example.com' }
    } as any);

    // Mock database error
    vi.mocked(getReferralStats).mockRejectedValue(new Error('Database error'));

    const response = await GET();
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.success).toBe(false);
    expect(data.error.code).toBe('DATABASE_ERROR');
  });

  it('should return 401 when user ID is missing from session', async () => {
    vi.mocked(requireAuth).mockResolvedValue({
      user: { email: 'test@example.com' }
    } as any);

    const response = await GET();
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data.success).toBe(false);
    expect(data.error.code).toBe('INVALID_SESSION');
  });
});
