import { describe, it, expect, beforeEach, vi } from 'vitest';
import { 
  generateReferralCode, 
  validateReferralCode, 
  createReferralRelationship,
  checkAndAwardProfileCompletion,
  checkAndAwardFirstActivity
} from '@/lib/services/referral.service';
import { prisma } from '@/lib/prisma';
import { awardXP } from '@/lib/utils/xp';

// Mock dependencies
vi.mock('@/lib/prisma', () => ({
  prisma: {
    user: {
      findUnique: vi.fn(),
      update: vi.fn(),
    },
    referralRelationship: {
      create: vi.fn(),
      findFirst: vi.fn(),
      update: vi.fn(),
    },
  },
}));

vi.mock('@/lib/utils/xp', () => ({
  awardXP: vi.fn(),
  XP_REWARDS: {
    REFERRAL_SIGNUP: 25,
    REFERRAL_PROFILE_COMPLETE: 50,
    REFERRAL_FIRST_ACTIVITY: 75,
  },
}));

describe('Referral Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('generateReferralCode', () => {
    it('should generate an 8-character alphanumeric code', async () => {
      vi.mocked(prisma.user.findUnique).mockResolvedValue(null);
      
      const code = await generateReferralCode();
      
      expect(code).toHaveLength(8);
      expect(code).toMatch(/^[A-Za-z0-9]{8}$/);
    });

    it('should retry on collision and generate unique code', async () => {
      vi.mocked(prisma.user.findUnique)
        .mockResolvedValueOnce({ id: 'existing-user' } as any)
        .mockResolvedValueOnce(null);
      
      const code = await generateReferralCode();
      
      expect(code).toHaveLength(8);
      expect(prisma.user.findUnique).toHaveBeenCalledTimes(2);
    });
  });

  describe('validateReferralCode', () => {
    it('should return valid true for existing code', async () => {
      const mockUser = { id: 'user-123' };
      vi.mocked(prisma.user.findUnique).mockResolvedValue(mockUser as any);
      
      const result = await validateReferralCode('ABC12345');
      
      expect(result.valid).toBe(true);
      expect(result.referrerId).toBe('user-123');
      expect(result.error).toBeUndefined();
    });

    it('should return valid false for non-existing code', async () => {
      vi.mocked(prisma.user.findUnique).mockResolvedValue(null);
      
      const result = await validateReferralCode('INVALID1');
      
      expect(result.valid).toBe(false);
      expect(result.error).toBe('Invalid referral code');
      expect(result.referrerId).toBeUndefined();
    });

    it('should handle validation errors gracefully', async () => {
      vi.mocked(prisma.user.findUnique).mockRejectedValue(new Error('Database error'));
      
      const result = await validateReferralCode('ABC12345');
      
      expect(result.valid).toBe(false);
      expect(result.error).toBe('Validation failed');
    });
  });

  describe('createReferralRelationship', () => {
    it('should create relationship and award XP', async () => {
      const referrerId = 'referrer-123';
      const refereeId = 'referee-456';
      const mockRelationship = {
        id: 'rel-789',
        referrerId,
        refereeId,
        totalXPAwarded: 25,
      };
      
      vi.mocked(prisma.referralRelationship.findFirst).mockResolvedValue(null);
      vi.mocked(prisma.user.findUnique).mockResolvedValue({ 
        id: refereeId, 
        name: 'John Doe' 
      } as any);
      vi.mocked(prisma.referralRelationship.create).mockResolvedValue(mockRelationship as any);
      vi.mocked(prisma.user.update).mockResolvedValue({} as any);
      vi.mocked(awardXP).mockResolvedValue({} as any);
      
      const result = await createReferralRelationship(referrerId, refereeId);
      
      expect(result).toEqual(mockRelationship);
      expect(prisma.referralRelationship.create).toHaveBeenCalledWith({
        data: {
          referrerId,
          refereeId,
          totalXPAwarded: 25,
        },
      });
      expect(prisma.user.update).toHaveBeenCalledTimes(2); // Update referee and referrer
      expect(awardXP).toHaveBeenCalledWith(
        referrerId,
        25,
        expect.stringContaining('Referral signup: John Doe')
      );
    });

    it('should prevent self-referral', async () => {
      const userId = 'user-123';
      
      const result = await createReferralRelationship(userId, userId);
      
      expect(result).toBeNull();
      expect(prisma.referralRelationship.create).not.toHaveBeenCalled();
    });

    it('should prevent duplicate referral relationships', async () => {
      const referrerId = 'referrer-123';
      const refereeId = 'referee-456';
      
      vi.mocked(prisma.referralRelationship.findFirst).mockResolvedValue({
        id: 'existing-rel',
        referrerId: 'other-referrer',
        refereeId,
      } as any);
      
      const result = await createReferralRelationship(referrerId, refereeId);
      
      expect(result).toBeNull();
      expect(prisma.referralRelationship.create).not.toHaveBeenCalled();
    });

    it('should handle XP award failure gracefully', async () => {
      const referrerId = 'referrer-123';
      const refereeId = 'referee-456';
      const mockRelationship = {
        id: 'rel-789',
        referrerId,
        refereeId,
        totalXPAwarded: 25,
      };
      
      vi.mocked(prisma.referralRelationship.findFirst).mockResolvedValue(null);
      vi.mocked(prisma.user.findUnique).mockResolvedValue({ 
        id: refereeId, 
        name: 'John Doe' 
      } as any);
      vi.mocked(prisma.referralRelationship.create).mockResolvedValue(mockRelationship as any);
      vi.mocked(prisma.user.update).mockResolvedValue({} as any);
      vi.mocked(awardXP).mockRejectedValue(new Error('XP award failed'));
      
      const result = await createReferralRelationship(referrerId, refereeId);
      
      // Should still return the relationship even if XP award fails
      expect(result).toEqual(mockRelationship);
    });
  });

  describe('checkAndAwardProfileCompletion', () => {
    it('should award XP when profile is complete and milestone not yet awarded', async () => {
      const userId = 'user-123';
      const referrerId = 'referrer-456';
      const mockRelationship = {
        id: 'rel-789',
        referrerId,
        refereeId: userId,
        profileCompletedAt: null,
        totalXPAwarded: 25,
      };
      const mockUser = {
        id: userId,
        name: 'John Doe',
        bio: 'Software developer',
        image: 'https://example.com/avatar.jpg',
      };
      
      vi.mocked(prisma.referralRelationship.findFirst).mockResolvedValue(mockRelationship as any);
      vi.mocked(prisma.user.findUnique).mockResolvedValue(mockUser as any);
      vi.mocked(prisma.referralRelationship.update).mockResolvedValue({} as any);
      vi.mocked(awardXP).mockResolvedValue({} as any);
      
      await checkAndAwardProfileCompletion(userId);
      
      expect(awardXP).toHaveBeenCalledWith(
        referrerId,
        50,
        expect.stringContaining('Referral profile completion: John Doe')
      );
      expect(prisma.referralRelationship.update).toHaveBeenCalledWith({
        where: { id: 'rel-789' },
        data: {
          profileCompletedAt: expect.any(Date),
          totalXPAwarded: { increment: 50 },
        },
      });
    });

    it('should not award XP if profile is incomplete', async () => {
      const userId = 'user-123';
      const mockRelationship = {
        id: 'rel-789',
        referrerId: 'referrer-456',
        refereeId: userId,
        profileCompletedAt: null,
      };
      const mockUser = {
        id: userId,
        name: 'John Doe',
        bio: null, // Missing bio
        image: 'https://example.com/avatar.jpg',
      };
      
      vi.mocked(prisma.referralRelationship.findFirst).mockResolvedValue(mockRelationship as any);
      vi.mocked(prisma.user.findUnique).mockResolvedValue(mockUser as any);
      
      await checkAndAwardProfileCompletion(userId);
      
      expect(awardXP).not.toHaveBeenCalled();
      expect(prisma.referralRelationship.update).not.toHaveBeenCalled();
    });

    it('should not award XP if milestone already completed (idempotence)', async () => {
      const userId = 'user-123';
      const mockRelationship = {
        id: 'rel-789',
        referrerId: 'referrer-456',
        refereeId: userId,
        profileCompletedAt: new Date('2024-01-01'),
      };
      
      vi.mocked(prisma.referralRelationship.findFirst).mockResolvedValue(mockRelationship as any);
      
      await checkAndAwardProfileCompletion(userId);
      
      expect(prisma.user.findUnique).not.toHaveBeenCalled();
      expect(awardXP).not.toHaveBeenCalled();
      expect(prisma.referralRelationship.update).not.toHaveBeenCalled();
    });

    it('should not award XP if user was not referred', async () => {
      const userId = 'user-123';
      
      vi.mocked(prisma.referralRelationship.findFirst).mockResolvedValue(null);
      
      await checkAndAwardProfileCompletion(userId);
      
      expect(awardXP).not.toHaveBeenCalled();
    });

    it('should mark milestone complete even if XP award fails', async () => {
      const userId = 'user-123';
      const referrerId = 'referrer-456';
      const mockRelationship = {
        id: 'rel-789',
        referrerId,
        refereeId: userId,
        profileCompletedAt: null,
      };
      const mockUser = {
        id: userId,
        name: 'John Doe',
        bio: 'Software developer',
        image: 'https://example.com/avatar.jpg',
      };
      
      vi.mocked(prisma.referralRelationship.findFirst).mockResolvedValue(mockRelationship as any);
      vi.mocked(prisma.user.findUnique).mockResolvedValue(mockUser as any);
      vi.mocked(awardXP).mockRejectedValue(new Error('XP award failed'));
      vi.mocked(prisma.referralRelationship.update).mockResolvedValue({} as any);
      
      await checkAndAwardProfileCompletion(userId);
      
      // Should still mark milestone complete
      expect(prisma.referralRelationship.update).toHaveBeenCalled();
    });
  });

  describe('checkAndAwardFirstActivity', () => {
    it('should award XP for valid first activity', async () => {
      const userId = 'user-123';
      const referrerId = 'referrer-456';
      const activityType = 'event_registration';
      const mockRelationship = {
        id: 'rel-789',
        referrerId,
        refereeId: userId,
        firstActivityCompletedAt: null,
      };
      const mockUser = {
        id: userId,
        name: 'John Doe',
        email: 'john@example.com',
      };
      
      vi.mocked(prisma.referralRelationship.findFirst).mockResolvedValue(mockRelationship as any);
      vi.mocked(prisma.user.findUnique).mockResolvedValue(mockUser as any);
      vi.mocked(prisma.referralRelationship.update).mockResolvedValue({} as any);
      vi.mocked(awardXP).mockResolvedValue({} as any);
      
      await checkAndAwardFirstActivity(userId, activityType);
      
      expect(awardXP).toHaveBeenCalledWith(
        referrerId,
        75,
        expect.stringContaining('Referral first activity: John Doe completed event registration')
      );
      expect(prisma.referralRelationship.update).toHaveBeenCalledWith({
        where: { id: 'rel-789' },
        data: {
          firstActivityCompletedAt: expect.any(Date),
          firstActivityType: activityType,
          totalXPAwarded: { increment: 75 },
        },
      });
    });

    it('should handle all valid activity types', async () => {
      const userId = 'user-123';
      const referrerId = 'referrer-456';
      const validActivityTypes = [
        'event_registration',
        'project_completion',
        'mentor_session',
        'group_join',
      ];
      
      for (const activityType of validActivityTypes) {
        vi.clearAllMocks();
        
        const mockRelationship = {
          id: 'rel-789',
          referrerId,
          refereeId: userId,
          firstActivityCompletedAt: null,
        };
        const mockUser = {
          id: userId,
          name: 'John Doe',
        };
        
        vi.mocked(prisma.referralRelationship.findFirst).mockResolvedValue(mockRelationship as any);
        vi.mocked(prisma.user.findUnique).mockResolvedValue(mockUser as any);
        vi.mocked(prisma.referralRelationship.update).mockResolvedValue({} as any);
        vi.mocked(awardXP).mockResolvedValue({} as any);
        
        await checkAndAwardFirstActivity(userId, activityType);
        
        expect(awardXP).toHaveBeenCalled();
        expect(prisma.referralRelationship.update).toHaveBeenCalledWith({
          where: { id: 'rel-789' },
          data: {
            firstActivityCompletedAt: expect.any(Date),
            firstActivityType: activityType,
            totalXPAwarded: { increment: 75 },
          },
        });
      }
    });

    it('should not award XP for invalid activity type', async () => {
      const userId = 'user-123';
      const invalidActivityType = 'invalid_activity';
      
      await checkAndAwardFirstActivity(userId, invalidActivityType);
      
      expect(prisma.referralRelationship.findFirst).not.toHaveBeenCalled();
      expect(awardXP).not.toHaveBeenCalled();
    });

    it('should not award XP if milestone already completed (idempotence)', async () => {
      const userId = 'user-123';
      const activityType = 'event_registration';
      const mockRelationship = {
        id: 'rel-789',
        referrerId: 'referrer-456',
        refereeId: userId,
        firstActivityCompletedAt: new Date('2024-01-01'),
        firstActivityType: 'event_registration',
      };
      
      vi.mocked(prisma.referralRelationship.findFirst).mockResolvedValue(mockRelationship as any);
      
      await checkAndAwardFirstActivity(userId, activityType);
      
      expect(prisma.user.findUnique).not.toHaveBeenCalled();
      expect(awardXP).not.toHaveBeenCalled();
      expect(prisma.referralRelationship.update).not.toHaveBeenCalled();
    });

    it('should not award XP if user was not referred', async () => {
      const userId = 'user-123';
      const activityType = 'event_registration';
      
      vi.mocked(prisma.referralRelationship.findFirst).mockResolvedValue(null);
      
      await checkAndAwardFirstActivity(userId, activityType);
      
      expect(awardXP).not.toHaveBeenCalled();
    });

    it('should mark milestone complete even if XP award fails', async () => {
      const userId = 'user-123';
      const referrerId = 'referrer-456';
      const activityType = 'event_registration';
      const mockRelationship = {
        id: 'rel-789',
        referrerId,
        refereeId: userId,
        firstActivityCompletedAt: null,
      };
      const mockUser = {
        id: userId,
        name: 'John Doe',
      };
      
      vi.mocked(prisma.referralRelationship.findFirst).mockResolvedValue(mockRelationship as any);
      vi.mocked(prisma.user.findUnique).mockResolvedValue(mockUser as any);
      vi.mocked(awardXP).mockRejectedValue(new Error('XP award failed'));
      vi.mocked(prisma.referralRelationship.update).mockResolvedValue({} as any);
      
      await checkAndAwardFirstActivity(userId, activityType);
      
      // Should still mark milestone complete
      expect(prisma.referralRelationship.update).toHaveBeenCalled();
    });
  });
});
