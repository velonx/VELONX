import { prisma } from "@/lib/prisma";
import { awardXP, XP_REWARDS } from "@/lib/utils/xp";
import crypto from "crypto";

/**
 * Referral Service
 * Handles referral code generation, validation, and milestone tracking
 */

/**
 * Generate a unique 8-character alphanumeric referral code
 * Uses crypto.randomBytes for secure random generation
 * Implements collision detection with retry logic (max 10 attempts)
 * 
 * @returns Promise<string> - The generated unique referral code
 * @throws Error if unable to generate unique code after max attempts
 */
export async function generateReferralCode(): Promise<string> {
  const maxAttempts = 10;
  const codeLength = 8;
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  
  let collisionCount = 0;
  
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    // Generate random bytes
    const randomBytes = crypto.randomBytes(codeLength);
    
    // Convert to alphanumeric string
    let code = '';
    for (let i = 0; i < codeLength; i++) {
      const index = randomBytes[i] % characters.length;
      code += characters[index];
    }
    
    // Check if code already exists
    const existing = await prisma.user.findUnique({
      where: { referralCode: code },
      select: { id: true }
    });
    
    if (!existing) {
      // Log successful generation with metrics
      console.log('Referral code generated successfully', {
        attempt: attempt + 1,
        collisions: collisionCount,
        timestamp: new Date().toISOString()
      });
      return code;
    }
    
    collisionCount++;
    
    // Exponential backoff for retries
    if (attempt < maxAttempts - 1) {
      await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 100));
    }
  }
  
  // Log failure with metrics
  console.error('Failed to generate unique referral code', {
    maxAttempts,
    collisions: collisionCount,
    timestamp: new Date().toISOString()
  });
  
  throw new Error('Failed to generate unique referral code after maximum attempts');
}

/**
 * Validate a referral code and return the referrer's ID if valid
 * Checks that the code exists and the user account is active (not deleted)
 * 
 * @param code - The referral code to validate
 * @returns Promise<{ valid: boolean; referrerId?: string; error?: string }>
 */
export async function validateReferralCode(
  code: string
): Promise<{ valid: boolean; referrerId?: string; error?: string }> {
  try {
    // Check if code exists and get referrer
    // This also validates that the user account still exists (not deleted)
    const referrer = await prisma.user.findUnique({
      where: { referralCode: code },
      select: { id: true }
    });
    
    if (!referrer) {
      return { valid: false, error: 'Invalid referral code' };
    }
    
    return { valid: true, referrerId: referrer.id };
  } catch (error) {
    console.error('Referral code validation error:', error);
    return { valid: false, error: 'Validation failed' };
  }
}

/**
 * Create a referral relationship between referrer and referee
 * Awards signup milestone XP (25 XP) to referrer
 * Increments referrer's referralCount
 * Updates referee's referredBy field
 * 
 * @param referrerId - The ID of the user who made the referral
 * @param refereeId - The ID of the user who was referred
 * @returns Promise<ReferralRelationship | null> - The created relationship or null if failed
 */
export async function createReferralRelationship(
  referrerId: string,
  refereeId: string
): Promise<any | null> {
  try {
    // Prevent self-referral
    if (referrerId === refereeId) {
      console.log('Self-referral attempt blocked');
      return null;
    }
    
    // Check if referee already has a referrer
    const existingRelationship = await prisma.referralRelationship.findFirst({
      where: { refereeId }
    });
    
    if (existingRelationship) {
      console.log('Referee already has a referrer');
      return null;
    }
    
    // Get referee name for XP award reason
    const referee = await prisma.user.findUnique({
      where: { id: refereeId },
      select: { name: true, email: true }
    });
    
    const refereeName = referee?.name || referee?.email || 'New user';
    
    // Create referral relationship
    const relationship = await prisma.referralRelationship.create({
      data: {
        referrerId,
        refereeId,
        totalXPAwarded: XP_REWARDS.REFERRAL_SIGNUP
      }
    });
    
    // Log referral relationship creation
    console.log('Referral relationship created', {
      relationshipId: relationship.id,
      referrerId,
      refereeId,
      refereeName,
      timestamp: new Date().toISOString()
    });
    
    // Update referee's referredBy field
    await prisma.user.update({
      where: { id: refereeId },
      data: { referredBy: referrerId }
    });
    
    // Increment referrer's referralCount
    await prisma.user.update({
      where: { id: referrerId },
      data: { referralCount: { increment: 1 } }
    });
    
    // Award signup milestone XP to referrer
    try {
      await awardXP(
        referrerId,
        XP_REWARDS.REFERRAL_SIGNUP,
        `Referral signup: ${refereeName} joined using your referral code`
      );
      
      // Log XP award
      console.log('Referral signup XP awarded', {
        referrerId,
        refereeId,
        xpAmount: XP_REWARDS.REFERRAL_SIGNUP,
        milestone: 'signup',
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Failed to award signup XP', {
        referrerId,
        refereeId,
        error: error instanceof Error ? error.message : error,
        timestamp: new Date().toISOString()
      });
      // Don't fail the relationship creation if XP award fails
    }
    
    // Run fraud detection asynchronously (don't block referral creation)
    detectFraudulentPattern(referrerId).catch(error => {
      console.error('Fraud detection failed:', error);
      // Errors are already logged in detectFraudulentPattern
    });
    
    return relationship;
  } catch (error: any) {
    if (error.code === 'P2002') {
      // Unique constraint violation
      console.log('Referral relationship already exists');
      return null;
    }
    console.error('Error creating referral relationship:', error);
    throw error;
  }
}

/**
 * Check if user's profile is complete and award profile completion milestone XP
 * Profile is considered complete when user has name, bio, and image
 * Awards 50 XP to referrer if milestone not already completed
 * 
 * @param userId - The ID of the user (referee) whose profile was updated
 * @returns Promise<void>
 */
export async function checkAndAwardProfileCompletion(userId: string): Promise<void> {
  try {
    // Find referral relationship where user is referee
    const relationship = await prisma.referralRelationship.findFirst({
      where: { refereeId: userId }
    });
    
    if (!relationship) {
      return; // User was not referred
    }
    
    // Check if milestone already completed (idempotence)
    if (relationship.profileCompletedAt) {
      console.log('Profile completion milestone already awarded for user:', userId);
      await logDuplicateAttempt(relationship.id, 'profile_completion');
      return;
    }
    
    // Check if profile is complete (name, bio, and image)
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { name: true, bio: true, image: true }
    });
    
    if (!user?.name || !user?.bio || !user?.image) {
      return; // Profile not complete yet
    }
    
    // Get referee name for XP award reason
    const refereeName = user.name;
    
    // Award XP to referrer
    try {
      await awardXP(
        relationship.referrerId,
        XP_REWARDS.REFERRAL_PROFILE_COMPLETE,
        `Referral profile completion: ${refereeName} completed their profile`
      );
      
      // Log XP award
      console.log('Referral profile completion XP awarded', {
        referrerId: relationship.referrerId,
        refereeId: userId,
        xpAmount: XP_REWARDS.REFERRAL_PROFILE_COMPLETE,
        milestone: 'profile_completion',
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Failed to award profile completion XP', {
        referrerId: relationship.referrerId,
        refereeId: userId,
        error: error instanceof Error ? error.message : error,
        timestamp: new Date().toISOString()
      });
      // Continue to mark milestone complete even if XP award fails
    }
    
    // Mark milestone as completed and increment total XP awarded
    await prisma.referralRelationship.update({
      where: { id: relationship.id },
      data: {
        profileCompletedAt: new Date(),
        totalXPAwarded: { increment: XP_REWARDS.REFERRAL_PROFILE_COMPLETE }
      }
    });
    
    // Log milestone completion
    console.log('Profile completion milestone completed', {
      relationshipId: relationship.id,
      referrerId: relationship.referrerId,
      refereeId: userId,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error checking profile completion milestone:', error);
    // Don't throw - this is a background operation
  }
}

/**
 * Check if user completed their first activity and award first activity milestone XP
 * Valid activity types: event_registration, project_completion, mentor_session, group_join
 * Awards 75 XP to referrer if milestone not already completed
 * 
 * @param userId - The ID of the user (referee) who completed the activity
 * @param activityType - The type of activity completed
 * @returns Promise<void>
 */
export async function checkAndAwardFirstActivity(
  userId: string,
  activityType: string
): Promise<void> {
  try {
    // Validate activity type
    const validActivityTypes = [
      'event_registration',
      'project_completion',
      'mentor_session',
      'group_join'
    ];
    
    if (!validActivityTypes.includes(activityType)) {
      console.error('Invalid activity type:', activityType);
      return;
    }
    
    // Find referral relationship where user is referee
    const relationship = await prisma.referralRelationship.findFirst({
      where: { refereeId: userId }
    });
    
    if (!relationship) {
      return; // User was not referred
    }
    
    // Check if milestone already completed (idempotence)
    if (relationship.firstActivityCompletedAt) {
      console.log('First activity milestone already awarded for user:', userId);
      await logDuplicateAttempt(relationship.id, 'first_activity');
      return;
    }
    
    // Get referee name for XP award reason
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { name: true, email: true }
    });
    
    const refereeName = user?.name || user?.email || 'User';
    
    // Format activity type for display
    const activityDisplayName = activityType.replace(/_/g, ' ');
    
    // Award XP to referrer
    try {
      await awardXP(
        relationship.referrerId,
        XP_REWARDS.REFERRAL_FIRST_ACTIVITY,
        `Referral first activity: ${refereeName} completed ${activityDisplayName}`
      );
      
      // Log XP award
      console.log('Referral first activity XP awarded', {
        referrerId: relationship.referrerId,
        refereeId: userId,
        xpAmount: XP_REWARDS.REFERRAL_FIRST_ACTIVITY,
        milestone: 'first_activity',
        activityType,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Failed to award first activity XP', {
        referrerId: relationship.referrerId,
        refereeId: userId,
        activityType,
        error: error instanceof Error ? error.message : error,
        timestamp: new Date().toISOString()
      });
      // Continue to mark milestone complete even if XP award fails
    }
    
    // Mark milestone as completed and increment total XP awarded
    await prisma.referralRelationship.update({
      where: { id: relationship.id },
      data: {
        firstActivityCompletedAt: new Date(),
        firstActivityType: activityType,
        totalXPAwarded: { increment: XP_REWARDS.REFERRAL_FIRST_ACTIVITY }
      }
    });
    
    // Log milestone completion
    console.log('First activity milestone completed', {
      relationshipId: relationship.id,
      referrerId: relationship.referrerId,
      refereeId: userId,
      activityType,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error checking first activity milestone:', error);
    // Don't throw - this is a background operation
  }
}

/**
 * Log duplicate milestone award attempts for monitoring
 * 
 * @param relationshipId - The referral relationship ID
 * @param milestoneType - The type of milestone (profile_completion, first_activity)
 */
async function logDuplicateAttempt(relationshipId: string, milestoneType: string): Promise<void> {
  try {
    console.warn('Duplicate milestone attempt detected', {
      relationshipId,
      milestoneType,
      timestamp: new Date().toISOString()
    });
    // In production, this could:
    // - Log to a monitoring service (e.g., Sentry, DataDog)
    // - Track metrics for duplicate prevention effectiveness
    // - Alert if duplicate attempts spike (potential bug)
  } catch (error) {
    console.error('Error logging duplicate attempt:', error);
  }
}

/**
 * Get referral statistics for a user
 * Calculates total referrals, active referrals, total XP earned, and milestone counts
 * Uses database aggregation for efficiency
 * 
 * @param userId - The ID of the referrer
 * @returns Promise<ReferralStats> - The referral statistics
 */
export async function getReferralStats(userId: string): Promise<{
  totalReferrals: number;
  activeReferrals: number;
  totalXPEarned: number;
  milestones: {
    signups: number;
    profileCompletions: number;
    firstActivities: number;
  };
}> {
  try {
    // Get all referral relationships for this referrer
    const relationships = await prisma.referralRelationship.findMany({
      where: { referrerId: userId },
      select: {
        profileCompletedAt: true,
        firstActivityCompletedAt: true,
        totalXPAwarded: true
      }
    });
    
    // Calculate statistics
    const totalReferrals = relationships.length;
    const activeReferrals = relationships.filter(r => r.profileCompletedAt !== null).length;
    const totalXPEarned = relationships.reduce((sum, r) => sum + r.totalXPAwarded, 0);
    
    // Calculate milestone counts
    const signups = totalReferrals; // All relationships represent completed signups
    const profileCompletions = relationships.filter(r => r.profileCompletedAt !== null).length;
    const firstActivities = relationships.filter(r => r.firstActivityCompletedAt !== null).length;
    
    return {
      totalReferrals,
      activeReferrals,
      totalXPEarned,
      milestones: {
        signups,
        profileCompletions,
        firstActivities
      }
    };
  } catch (error) {
    console.error('Error getting referral stats:', error);
    throw error;
  }
}

/**
 * Get referral history for a user with pagination and filtering
 * Returns list of referrals with referee details and milestone status
 * Ordered by creation date descending (most recent first)
 * 
 * @param userId - The ID of the referrer
 * @param options - Pagination and filtering options
 * @returns Promise<ReferralHistory> - The referral history with pagination metadata
 */
export async function getReferralHistory(
  userId: string,
  options: {
    page?: number;
    limit?: number;
    milestoneType?: 'signup' | 'profile' | 'activity' | 'all';
  } = {}
): Promise<{
  referrals: Array<{
    id: string;
    refereeName: string;
    refereeImage: string;
    signupDate: string;
    profileCompleted: boolean;
    firstActivityCompleted: boolean;
    firstActivityType?: string;
    totalXPEarned: number;
  }>;
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}> {
  try {
    // Parse and validate pagination parameters
    const page = Math.max(1, options.page || 1);
    const limit = Math.min(100, Math.max(1, options.limit || 20));
    const skip = (page - 1) * limit;
    const milestoneType = options.milestoneType || 'all';
    
    // Build filter based on milestone type
    let where: any = { referrerId: userId };
    
    switch (milestoneType) {
      case 'profile':
        where.profileCompletedAt = { not: null };
        break;
      case 'activity':
        where.firstActivityCompletedAt = { not: null };
        break;
      case 'signup':
      case 'all':
      default:
        // No additional filter - all relationships represent signups
        break;
    }
    
    // Get total count for pagination
    const total = await prisma.referralRelationship.count({ where });
    
    // Get referral relationships with referee details
    const relationships = await prisma.referralRelationship.findMany({
      where,
      include: {
        referee: {
          select: {
            name: true,
            email: true,
            image: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      skip,
      take: limit
    });
    
    // Format response
    const referrals = relationships.map(rel => ({
      id: rel.id,
      refereeName: rel.referee.name || rel.referee.email || 'User',
      refereeImage: rel.referee.image || '',
      signupDate: rel.signupCompletedAt.toISOString(),
      profileCompleted: rel.profileCompletedAt !== null,
      firstActivityCompleted: rel.firstActivityCompletedAt !== null,
      firstActivityType: rel.firstActivityType || undefined,
      totalXPEarned: rel.totalXPAwarded
    }));
    
    // Calculate pagination metadata
    const totalPages = Math.ceil(total / limit);
    
    return {
      referrals,
      pagination: {
        page,
        limit,
        total,
        totalPages
      }
    };
  } catch (error) {
    console.error('Error getting referral history:', error);
    throw error;
  }
}

/**
 * Detect fraudulent referral patterns for a referrer
 * Checks for:
 * - High referral rate (>5 in 24 hours)
 * - High incomplete profile rate (>70%)
 * Runs asynchronously and doesn't block referral creation
 * 
 * @param referrerId - The ID of the referrer to check
 * @returns Promise<boolean> - True if suspicious patterns detected
 */
export async function detectFraudulentPattern(referrerId: string): Promise<boolean> {
  try {
    // Get referrals from last 24 hours
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    
    const recentReferrals = await prisma.referralRelationship.findMany({
      where: {
        referrerId,
        createdAt: { gte: twentyFourHoursAgo }
      },
      select: {
        id: true,
        profileCompletedAt: true
      }
    });
    
    // Check for high referral rate (>5 in 24 hours)
    if (recentReferrals.length > 5) {
      await logSuspiciousActivity(referrerId, 'high_referral_rate', {
        count: recentReferrals.length,
        timeWindow: '24h'
      });
      return true;
    }
    
    // Check for high incomplete profile rate (>70%)
    if (recentReferrals.length > 0) {
      const incompleteProfiles = recentReferrals.filter(
        r => r.profileCompletedAt === null
      ).length;
      
      const incompleteRate = incompleteProfiles / recentReferrals.length;
      
      if (incompleteRate > 0.7) {
        await logSuspiciousActivity(referrerId, 'high_incomplete_profile_rate', {
          incompleteCount: incompleteProfiles,
          totalCount: recentReferrals.length,
          rate: incompleteRate
        });
        return true;
      }
    }
    
    return false;
  } catch (error) {
    console.error('Fraud detection error:', error);
    // Log but don't fail - fraud detection shouldn't block legitimate referrals
    await logFraudDetectionFailure(referrerId, error);
    return false;
  }
}

/**
 * Log suspicious referral activity for manual review
 * 
 * @param referrerId - The ID of the referrer
 * @param patternType - The type of suspicious pattern detected
 * @param details - Additional details about the pattern
 */
async function logSuspiciousActivity(
  referrerId: string,
  patternType: string,
  details: any
): Promise<void> {
  try {
    console.warn('Suspicious referral activity detected:', {
      referrerId,
      patternType,
      details,
      timestamp: new Date().toISOString()
    });
    
    // In production, this could:
    // - Log to a monitoring service (e.g., Sentry, DataDog)
    // - Create a database record for admin review
    // - Send alert to admin team
    // - Flag the user account for review
  } catch (error) {
    console.error('Error logging suspicious activity:', error);
  }
}

/**
 * Log fraud detection failures for monitoring
 * 
 * @param referrerId - The ID of the referrer
 * @param error - The error that occurred
 */
async function logFraudDetectionFailure(referrerId: string, error: any): Promise<void> {
  try {
    console.error('Fraud detection failure:', {
      referrerId,
      error: error.message || error,
      timestamp: new Date().toISOString()
    });
    
    // In production, this could log to a monitoring service
  } catch (err) {
    console.error('Error logging fraud detection failure:', err);
  }
}

export const referralService = {
  generateReferralCode,
  validateReferralCode,
  createReferralRelationship,
  checkAndAwardProfileCompletion,
  checkAndAwardFirstActivity,
  getReferralStats,
  getReferralHistory,
  detectFraudulentPattern
};
