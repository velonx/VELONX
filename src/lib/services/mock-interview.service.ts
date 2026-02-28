import { prisma } from "@/lib/prisma";
import { Prisma, MockInterviewStatus, InterviewType, ExperienceLevel } from "@prisma/client";
import { NotFoundError, ValidationError } from "@/lib/utils/errors";
import { notificationService } from "./notification.service";

/**
 * Input type for creating a mock interview
 */
export interface MockInterviewInput {
  email: string;
  preferredDate: Date;
  preferredTime: string;
  interviewType: InterviewType;
  experienceLevel: ExperienceLevel;
}

/**
 * Mock Interview Service
 * Handles all business logic for mock interview management
 */
export class MockInterviewService {
  /**
   * Create a new mock interview request
   * @param userId - Student user ID
   * @param data - Interview request data
   * @returns Created interview with PENDING status
   */
  async create(userId: string, data: MockInterviewInput) {
    // Validate that the user exists
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true, name: true },
    });
    
    if (!user) {
      throw new ValidationError("Invalid user identifier");
    }
    
    // Validate email format (already validated by Zod schema, but double-check)
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(data.email)) {
      throw new ValidationError("Invalid email format");
    }
    
    // Validate email matches user's registered email
    if (data.email !== user.email) {
      throw new ValidationError("Email must match your registered email");
    }
    
    // Validate preferred date is in the future
    if (new Date(data.preferredDate) <= new Date()) {
      throw new ValidationError("Preferred date must be in the future");
    }
    
    // Validate interviewType is valid enum value
    const validInterviewTypes = ['TECHNICAL_FRONTEND', 'TECHNICAL_BACKEND', 'DSA', 'SYSTEM_DESIGN', 'BEHAVIORAL'];
    if (!validInterviewTypes.includes(data.interviewType)) {
      throw new ValidationError("Invalid interview type");
    }
    
    // Validate experienceLevel is valid enum value
    const validExperienceLevels = ['INTERN', 'JUNIOR', 'SENIOR'];
    if (!validExperienceLevels.includes(data.experienceLevel)) {
      throw new ValidationError("Invalid experience level");
    }
    
    // Create mock interview
    const interview = await prisma.mockInterview.create({
      data: {
        userId,
        email: data.email,
        preferredDate: new Date(data.preferredDate),
        preferredTime: data.preferredTime,
        interviewType: data.interviewType,
        experienceLevel: data.experienceLevel,
        status: MockInterviewStatus.PENDING,
      },
    });
    
    return interview;
  }
  
  /**
   * Get all mock interviews (admin) or filtered by status
   * @param params - Filter parameters including status
   * @returns List of mock interviews
   */
  async getAll(params: { status?: MockInterviewStatus } = {}) {
    const where: Prisma.MockInterviewWhereInput = {};
    
    if (params.status) {
      where.status = params.status;
    }
    
    const interviews = await prisma.mockInterview.findMany({
      where,
      orderBy: {
        createdAt: 'desc',
      },
    });
    
    return interviews;
  }
  
  /**
   * Get mock interviews by user ID
   * @param userId - Student user ID
   * @returns User's mock interviews
   */
  async getByUserId(userId: string) {
    const interviews = await prisma.mockInterview.findMany({
      where: {
        userId,
      },
      orderBy: {
        preferredDate: 'asc',
      },
    });
    
    return interviews;
  }
  
  /**
   * Get mock interview by ID
   * @param id - Interview ID
   * @returns Mock interview
   */
  async getById(id: string) {
    const interview = await prisma.mockInterview.findUnique({
      where: { id },
    });
    
    if (!interview) {
      throw new NotFoundError("Mock interview");
    }
    
    return interview;
  }
  
  /**
   * Approve a pending mock interview (admin only)
   * @param id - Interview ID
   * @param adminId - Admin user ID
   * @returns Updated interview with APPROVED status
   * @throws NOT_FOUND if interview doesn't exist
   * @throws INVALID_STATUS if interview is not PENDING
   */
  async approve(id: string, adminId: string) {
    // Check if interview exists
    const existingInterview = await prisma.mockInterview.findUnique({
      where: { id },
    });
    
    if (!existingInterview) {
      throw new NotFoundError("Mock interview");
    }
    
    // Check if interview is in PENDING status
    if (existingInterview.status !== MockInterviewStatus.PENDING) {
      throw new ValidationError("Only pending interviews can be approved");
    }
    
    // Update interview status to APPROVED
    const interview = await prisma.mockInterview.update({
      where: { id },
      data: {
        status: MockInterviewStatus.APPROVED,
        reviewedBy: adminId,
        reviewedAt: new Date(),
      },
    });
    
    // Create approval notification for student
    try {
      await notificationService.createMockInterviewApprovedNotification({
        interviewId: interview.id,
        userId: interview.userId,
        interviewType: interview.interviewType,
        experienceLevel: interview.experienceLevel,
        preferredDate: interview.preferredDate,
      });
    } catch (error) {
      console.error('Failed to create mock interview approval notification:', error);
      // Don't fail the approval if notification fails
    }
    
    return interview;
  }
  
  /**
   * Reject a pending mock interview (admin only)
   * @param id - Interview ID
   * @param adminId - Admin user ID
   * @param feedback - Rejection reason (min 10 characters)
   * @returns Updated interview with REJECTED status
   * @throws NOT_FOUND if interview doesn't exist
   * @throws INVALID_STATUS if interview is not PENDING
   * @throws VALIDATION_ERROR if feedback is too short
   */
  async reject(id: string, adminId: string, feedback: string) {
    // Validate feedback length
    if (!feedback || feedback.trim().length < 10) {
      throw new ValidationError("Rejection reason must be at least 10 characters");
    }
    
    // Check if interview exists
    const existingInterview = await prisma.mockInterview.findUnique({
      where: { id },
    });
    
    if (!existingInterview) {
      throw new NotFoundError("Mock interview");
    }
    
    // Check if interview is in PENDING status
    if (existingInterview.status !== MockInterviewStatus.PENDING) {
      throw new ValidationError("Only pending interviews can be rejected");
    }
    
    // Update interview status to REJECTED with feedback
    const interview = await prisma.mockInterview.update({
      where: { id },
      data: {
        status: MockInterviewStatus.REJECTED,
        feedback: feedback,
        reviewedBy: adminId,
        reviewedAt: new Date(),
      },
    });
    
    // Create rejection notification for student
    try {
      await notificationService.createMockInterviewRejectedNotification({
        interviewId: interview.id,
        userId: interview.userId,
        feedback: feedback,
      });
    } catch (error) {
      console.error('Failed to create mock interview rejection notification:', error);
      // Don't fail the rejection if notification fails
    }
    
    return interview;
  }
}

// Export singleton instance
export const mockInterviewService = new MockInterviewService();
