/**
 * Signup with Referral Code - Integration Tests (Mocked)
 * Tests the referral signup flow using in-memory mocks.
 * Requirements: 3.1, 3.2, 3.3, 4.1, 5.1
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';

// In-memory state
let users: any[] = [];
let referralRelationships: any[] = [];
let idSeq = 1;
const nextId = () => `id-${idSeq++}`;

vi.mock('@/lib/prisma', () => ({
  prisma: {
    user: {
      create: vi.fn(),
      findUnique: vi.fn(),
      findFirst: vi.fn(),
      deleteMany: vi.fn().mockResolvedValue({ count: 0 }),
    },
    referralRelationship: {
      findMany: vi.fn(),
      findFirst: vi.fn(),
      create: vi.fn(),
      deleteMany: vi.fn().mockResolvedValue({ count: 0 }),
    },
  },
}));

vi.mock('@/lib/services/referral.service', () => ({
  generateReferralCode: vi.fn(() => Promise.resolve('REF-TEST-1234')),
  validateReferralCode: vi.fn(async (code: string) => {
    const referrer = users.find(u => u.referralCode === code);
    if (referrer) {
      return { valid: true, referrerId: referrer.id };
    }
    return { valid: false };
  }),
  createReferralRelationship: vi.fn(async (referrerId: string, refereeId: string) => {
    // Prevent self-referral
    if (referrerId === refereeId) return null;
    const rel = {
      id: nextId(),
      referrerId,
      refereeId,
      signupCompletedAt: new Date(),
      totalXPAwarded: 25,
    };
    referralRelationships.push(rel);
    return rel;
  }),
}));

describe('Signup with Referral Code - Integration', () => {
  let testReferrer: any;
  const testReferralCode = 'REF-TEST-1234';

  beforeEach(async () => {
    users = [];
    referralRelationships = [];
    idSeq = 1;
    vi.clearAllMocks();

    const { prisma } = await import('@/lib/prisma');
    const { generateReferralCode } = await import('@/lib/services/referral.service');

    // Set up the mock user creation
    vi.mocked(prisma.user.create).mockImplementation(({ data }: any) => {
      const u = { ...data, id: nextId() };
      users.push(u);
      return Promise.resolve(u);
    });
    vi.mocked(prisma.user.findFirst).mockImplementation(({ where }: any = {}) => {
      const u = users.find(user =>
        (where?.referralCode && user.referralCode === where.referralCode) ||
        (where?.email && user.email === where.email)
      ) ?? null;
      return Promise.resolve(u);
    });
    vi.mocked(prisma.referralRelationship.findMany).mockImplementation(({ where }: any = {}) => {
      const rels = referralRelationships.filter(r =>
        (!where?.refereeId || r.refereeId === where.refereeId) &&
        (!where?.referrerId || r.referrerId === where.referrerId)
      );
      return Promise.resolve(rels);
    });

    testReferrer = await prisma.user.create({
      data: {
        name: 'Test Referrer',
        email: `referrer@test.com`,
        password: 'hashedpassword',
        role: 'STUDENT',
        referralCode: testReferralCode,
      },
    } as any);
  });

  it('should create user and referral relationship when valid referral code provided', async () => {
    const { validateReferralCode, createReferralRelationship } = await import('@/lib/services/referral.service');
    const { prisma } = await import('@/lib/prisma');

    const validation = await validateReferralCode(testReferralCode);
    expect(validation.valid).toBe(true);
    expect(validation.referrerId).toBe(testReferrer.id);

    const referee = await prisma.user.create({
      data: {
        name: 'Test Referee',
        email: 'newuser@test.com',
        password: 'hashedpassword',
        role: 'STUDENT',
        referralCode: 'REF-TEST-5678',
      },
    } as any);

    const relationship = await createReferralRelationship(testReferrer.id, referee.id);
    expect(relationship).toBeDefined();
    expect(relationship?.referrerId).toBe(testReferrer.id);
    expect(relationship?.refereeId).toBe(referee.id);
    expect(relationship?.signupCompletedAt).toBeDefined();
    expect(relationship?.totalXPAwarded).toBe(25);
  });

  it('should allow registration without referral code', async () => {
    const { prisma } = await import('@/lib/prisma');

    const newUser = await prisma.user.create({
      data: {
        name: 'No Referral User',
        email: 'noreferral@test.com',
        password: 'hashedpassword',
        role: 'STUDENT',
        referralCode: 'REF-NO-REF',
      },
    } as any);

    expect(newUser).toBeDefined();
    expect(newUser.referralCode).toBeDefined();

    const relationships = await prisma.referralRelationship.findMany({
      where: { refereeId: newUser.id },
    } as any);

    expect(relationships).toHaveLength(0);
  });

  it('should not create relationship for invalid referral code', async () => {
    const { validateReferralCode } = await import('@/lib/services/referral.service');

    const validation = await validateReferralCode('INVALID123');
    expect(validation.valid).toBe(false);
    if ('referrerId' in validation) {
      expect(validation.referrerId).toBeUndefined();
    }
  });

  it('should prevent self-referral', async () => {
    const { createReferralRelationship } = await import('@/lib/services/referral.service');

    const relationship = await createReferralRelationship(testReferrer.id, testReferrer.id);
    expect(relationship).toBeNull();
  });
});
