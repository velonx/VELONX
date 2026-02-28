import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { NotFoundError, ConflictError, ValidationError } from "@/lib/utils/errors";
import { notificationService } from "./notification.service";
import { awardXP, XP_REWARDS } from "@/lib/utils/xp";
import { objectIdSchema } from "@/lib/validations/common";

/**
 * Mentor Session Service
 * Handles all business logic for mentor session management
 */
export class MentorSessionService {
  /**
   * List sessions with pagination and filtering
   */
  async listSessions(params: {
    page?: number;
    pageSize?: number;
    userId?: string;
    mentorId?: string;
    status?: string;
    userRole?: 'student' | 'mentor';
  }) {
    const { page = 1, pageSize = 10, userId, mentorId, status, userRole } = params;
    
    // Build where clause for filtering
    const where: Prisma.MentorSessionWhereInput = {};
    
    if (userId && userRole === 'student') {
      where.studentId = userId;
    } else if (userId && userRole === 'mentor') {
      where.mentorId = userId;
    }
    
    if (mentorId) {
      where.mentorId = mentorId;
    }
    
    if (status) {
      where.status = status as any;
    }
    
    // Execute query with pagination
    const [sessions, totalCount] = await Promise.all([
      prisma.mentorSession.findMany({
        where,
        include: {
          mentor: {
            select: {
              id: true,
              name: true,
              email: true,
              company: true,
              imageUrl: true,
              expertise: true,
            },
          },
          student: {
            select: {
              id: true,
              name: true,
              email: true,
              image: true,
            },
          },
          review: true,
        },
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy: {
          date: 'desc',
        },
      }),
      prisma.mentorSession.count({ where }),
    ]);
    
    return {
      sessions,
      pagination: {
        page,
        pageSize,
        totalCount,
        totalPages: Math.ceil(totalCount / pageSize),
      },
    };
  }
  
  /**
   * Get session by ID with full details
   */
  async getSessionById(id: string) {
    const session = await prisma.mentorSession.findUnique({
      where: { id },
      include: {
        mentor: {
          select: {
            id: true,
            name: true,
            email: true,
            company: true,
            imageUrl: true,
            expertise: true,
            linkedinUrl: true,
          },
        },
        student: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
        review: true,
      },
    });
    
    if (!session) {
      throw new NotFoundError("Session");
    }
    
    return session;
  }
  
  /**
   * Create a new mentor session (booking)
   */
  async createSession(data: {
    mentorId: string;
    studentId: string;
    title: string;
    description?: string;
    date: string;
    duration: number;
  }) {
    // Validate mentorId format
    try {
      objectIdSchema.parse(data.mentorId);
    } catch (error) {
      throw new ValidationError("Invalid mentor ID format");
    }
    
    // Validate studentId format
    try {
      objectIdSchema.parse(data.studentId);
    } catch (error) {
      throw new ValidationError("Invalid student identifier");
    }
    
    // Validate student exists and has STUDENT role
    const student = await prisma.user.findUnique({
      where: { id: data.studentId },
      select: { id: true, role: true, name: true },
    });
    
    if (!student) {
      throw new ValidationError("Invalid student identifier");
    }
    
    if (student.role !== 'STUDENT') {
      throw new ValidationError("Invalid student identifier");
    }
    
    // Validate mentor exists and is available
    const mentor = await prisma.mentor.findUnique({
      where: { id: data.mentorId },
    });
    
    if (!mentor) {
      throw new ValidationError("Invalid mentor identifier");
    }
    
    if (!mentor.available) {
      throw new ValidationError("Mentor is not currently available for bookings");
    }
    
    // Validate topic (title) has minimum length of 5 characters
    if (!data.title || data.title.trim().length < 5) {
      throw new ValidationError("Topic must be at least 5 characters");
    }
    
    // Validate duration is between 15 and 180 minutes
    if (data.duration < 15 || data.duration > 180) {
      throw new ValidationError("Duration must be between 15 and 180 minutes");
    }
    
    // Validate scheduledAt is in the future
    const sessionDate = new Date(data.date);
    if (sessionDate <= new Date()) {
      throw new ValidationError("Scheduled date must be in the future");
    }
    
    // Check for conflicting sessions
    const sessionEnd = new Date(sessionDate.getTime() + data.duration * 60000);
    
    const conflictingSessions = await prisma.mentorSession.findMany({
      where: {
        mentorId: data.mentorId,
        status: {
          in: ['PENDING', 'CONFIRMED'],
        },
        date: {
          gte: new Date(sessionDate.getTime() - 2 * 60 * 60000), // 2 hours before
          lte: new Date(sessionDate.getTime() + 2 * 60 * 60000), // 2 hours after
        },
      },
    });
    
    if (conflictingSessions.length > 0) {
      throw new ConflictError("This time slot is not available");
    }
    
    // Create session
    const session = await prisma.mentorSession.create({
      data: {
        mentorId: data.mentorId,
        studentId: data.studentId,
        title: data.title,
        description: data.description,
        date: new Date(data.date),
        duration: data.duration,
        status: 'PENDING',
      },
      include: {
        mentor: {
          select: {
            id: true,
            name: true,
            email: true,
            company: true,
            imageUrl: true,
          },
        },
        student: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
      },
    });
    
    // Update mentor's total sessions count
    await prisma.mentor.update({
      where: { id: data.mentorId },
      data: {
        totalSessions: {
          increment: 1,
        },
      },
    });
    
    // Create notification for mentor about new booking
    try {
      await notificationService.createMentorSessionBookedNotification({
        sessionId: session.id,
        mentorId: data.mentorId,
        studentName: session.student.name || 'A student',
        title: data.title,
        date: new Date(data.date),
      });
    } catch (error) {
      console.error('Failed to create mentor session booked notification:', error);
      // Don't fail the session creation if notification fails
    }
    
    return session;
  }
  
  /**
   * Update session status
   */
  async updateSession(
    id: string,
    data: {
      status?: string;
      date?: string;
      duration?: number;
      meetingLink?: string;
      notes?: string;
    }
  ) {
    // Check if session exists
    const existingSession = await prisma.mentorSession.findUnique({
      where: { id },
      include: {
        mentor: {
          select: {
            id: true,
            name: true,
          },
        },
        student: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });
    
    if (!existingSession) {
      throw new NotFoundError("Session");
    }
    
    // Build update data
    const updateData: Prisma.MentorSessionUpdateInput = {};
    
    if (data.status !== undefined) updateData.status = data.status as any;
    if (data.date !== undefined) updateData.date = new Date(data.date);
    if (data.duration !== undefined) updateData.duration = data.duration;
    if (data.meetingLink !== undefined) updateData.meetingLink = data.meetingLink;
    if (data.notes !== undefined) updateData.notes = data.notes;
    
    const session = await prisma.mentorSession.update({
      where: { id },
      data: updateData,
      include: {
        mentor: {
          select: {
            id: true,
            name: true,
            email: true,
            company: true,
            imageUrl: true,
          },
        },
        student: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
      },
    });
    
    // Create notifications based on status change
    if (data.status && data.status !== existingSession.status) {
      try {
        if (data.status === 'CONFIRMED') {
          // Notify student about confirmation
          await notificationService.createMentorSessionConfirmedNotification({
            sessionId: session.id,
            studentId: session.studentId,
            mentorName: session.mentor.name || 'Your mentor',
            title: session.title,
            date: session.date,
            meetingLink: session.meetingLink || undefined,
          });
        } else if (data.status === 'COMPLETED') {
          // Award XP to student for completing the session
          try {
            await awardXP(
              session.studentId,
              XP_REWARDS.MENTOR_SESSION,
              `Completed session with ${session.mentor.name}: ${session.title}`
            );
          } catch (error) {
            console.error('Failed to award XP for mentor session completion:', error);
            // Don't fail the update if XP award fails
          }

          // Check and award first activity milestone (async, don't block response)
          const { checkAndAwardFirstActivity } = await import('@/lib/services/referral.service');
          checkAndAwardFirstActivity(session.studentId, 'mentor_session').catch((error) => {
            console.error('Failed to check first activity milestone:', error);
          });
          
          // Notify student to leave a review
          await notificationService.createMentorSessionCompletedNotification({
            sessionId: session.id,
            studentId: session.studentId,
            mentorName: session.mentor.name || 'Your mentor',
            title: session.title,
          });
        }
      } catch (error) {
        console.error('Failed to create mentor session status notification:', error);
        // Don't fail the update if notification fails
      }
    }
    
    return session;
  }
  
  /**
   * Cancel a session
   */
  async cancelSession(id: string, userId: string) {
    const session = await this.getSessionById(id);
    
    // Check if user is authorized to cancel
    if (session.studentId !== userId && session.mentorId !== userId) {
      throw new ValidationError("You are not authorized to cancel this session");
    }
    
    // Check if session can be cancelled
    if (session.status === 'COMPLETED' || session.status === 'CANCELLED') {
      throw new ValidationError("This session cannot be cancelled");
    }
    
    // Determine who cancelled
    const cancelledBy = session.studentId === userId ? 'student' : 'mentor';
    
    // Update session status
    const updatedSession = await this.updateSession(id, { status: 'CANCELLED' });
    
    // Create cancellation notifications for both parties
    try {
      await notificationService.createMentorSessionCancelledNotification({
        sessionId: session.id,
        studentId: session.studentId,
        mentorId: session.mentorId,
        studentName: session.student.name || 'Student',
        mentorName: session.mentor.name || 'Mentor',
        title: session.title,
        date: session.date,
        cancelledBy,
      });
    } catch (error) {
      console.error('Failed to create mentor session cancelled notification:', error);
      // Don't fail the cancellation if notification fails
    }
    
    return updatedSession;
  }
  
  /**
   * Complete a session
   */
  async completeSession(id: string) {
    return this.updateSession(id, { status: 'COMPLETED' });
  }
  
  /**
   * Approve a pending mentor session (admin only)
   * @param id - Session ID
   * @param adminId - Admin user ID for audit trail
   * @returns Updated session with CONFIRMED status
   * @throws NOT_FOUND if session doesn't exist
   * @throws INVALID_STATUS if session is not PENDING
   */
  async approveSession(id: string, adminId: string) {
    // Check if session exists
    const existingSession = await prisma.mentorSession.findUnique({
      where: { id },
      include: {
        mentor: {
          select: {
            id: true,
            name: true,
          },
        },
        student: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });
    
    if (!existingSession) {
      throw new NotFoundError("Mentor session");
    }
    
    // Check if session is in PENDING status
    if (existingSession.status !== 'PENDING') {
      throw new ValidationError("Only pending sessions can be approved");
    }
    
    // Update session status to CONFIRMED
    const session = await prisma.mentorSession.update({
      where: { id },
      data: {
        status: 'CONFIRMED',
      },
      include: {
        mentor: {
          select: {
            id: true,
            name: true,
            email: true,
            company: true,
            imageUrl: true,
          },
        },
        student: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
      },
    });
    
    // Create approval notifications for student and mentor
    try {
      await notificationService.createMentorSessionApprovedNotification({
        sessionId: session.id,
        studentId: session.studentId,
        mentorName: session.mentor.name || 'Your mentor',
        topic: session.title,
        scheduledAt: session.date,
      });
      
      // Also notify mentor about the approval
      await notificationService.createNotification({
        userId: session.mentorId,
        title: 'Session Approved',
        description: `Your session "${session.title}" with ${session.student.name || 'a student'} has been approved by admin.`,
        type: 'SUCCESS',
        actionUrl: `/dashboard/admin?tab=sessions`,
        metadata: {
          sessionId: session.id,
          eventType: 'session_approved',
        },
      });
    } catch (error) {
      console.error('Failed to create mentor session approval notification:', error);
      // Don't fail the approval if notification fails
    }
    
    return session;
  }
  
  /**
   * Reject a pending mentor session (admin only)
   * @param id - Session ID
   * @param adminId - Admin user ID for audit trail
   * @param reason - Rejection reason (min 10 characters)
   * @returns Updated session with CANCELLED status
   * @throws NOT_FOUND if session doesn't exist
   * @throws INVALID_STATUS if session is not PENDING
   * @throws VALIDATION_ERROR if reason is too short
   */
  async rejectSession(id: string, adminId: string, reason: string) {
    // Validate rejection reason length
    if (!reason || reason.trim().length < 10) {
      throw new ValidationError("Rejection reason must be at least 10 characters");
    }
    
    // Check if session exists
    const existingSession = await prisma.mentorSession.findUnique({
      where: { id },
      include: {
        mentor: {
          select: {
            id: true,
            name: true,
          },
        },
        student: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });
    
    if (!existingSession) {
      throw new NotFoundError("Mentor session");
    }
    
    // Check if session is in PENDING status
    if (existingSession.status !== 'PENDING') {
      throw new ValidationError("Only pending sessions can be rejected");
    }
    
    // Update session status to CANCELLED with rejection reason in notes
    const session = await prisma.mentorSession.update({
      where: { id },
      data: {
        status: 'CANCELLED',
        notes: reason,
      },
      include: {
        mentor: {
          select: {
            id: true,
            name: true,
            email: true,
            company: true,
            imageUrl: true,
          },
        },
        student: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
      },
    });
    
    // Create rejection notification for student
    try {
      await notificationService.createMentorSessionRejectedNotification({
        sessionId: session.id,
        studentId: session.studentId,
        reason: reason,
      });
    } catch (error) {
      console.error('Failed to create mentor session rejection notification:', error);
      // Don't fail the rejection if notification fails
    }
    
    return session;
  }
  
  /**
   * Get pending sessions for admin review
   * @param params - Pagination and filter parameters
   * @returns List of pending sessions with student and mentor details
   */
  async getPendingSessions(params: {
    page?: number;
    pageSize?: number;
  }) {
    const { page = 1, pageSize = 10 } = params;
    
    // Execute query with pagination
    const [sessions, totalCount] = await Promise.all([
      prisma.mentorSession.findMany({
        where: {
          status: 'PENDING',
        },
        include: {
          mentor: {
            select: {
              id: true,
              name: true,
              email: true,
              company: true,
              imageUrl: true,
              expertise: true,
            },
          },
          student: {
            select: {
              id: true,
              name: true,
              email: true,
              image: true,
            },
          },
        },
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy: {
          createdAt: 'desc', // Newest first
        },
      }),
      prisma.mentorSession.count({
        where: {
          status: 'PENDING',
        },
      }),
    ]);
    
    return {
      sessions,
      pagination: {
        page,
        pageSize,
        totalCount,
        totalPages: Math.ceil(totalCount / pageSize),
      },
    };
  }
  
  /**
   * Submit a review for a session
   */
  async submitReview(data: {
    sessionId: string;
    studentId: string;
    rating: number;
    comment?: string;
  }) {
    // Check if session exists and is completed
    const session = await this.getSessionById(data.sessionId);
    
    if (session.status !== 'COMPLETED') {
      throw new ValidationError("Can only review completed sessions");
    }
    
    if (session.studentId !== data.studentId) {
      throw new ValidationError("Only the student can review this session");
    }
    
    // Check if review already exists
    const existingReview = await prisma.mentorReview.findUnique({
      where: { sessionId: data.sessionId },
    });
    
    if (existingReview) {
      throw new ConflictError("Review already submitted for this session");
    }
    
    // Validate rating
    if (data.rating < 1 || data.rating > 5) {
      throw new ValidationError("Rating must be between 1 and 5");
    }
    
    // Create review
    const review = await prisma.mentorReview.create({
      data: {
        sessionId: data.sessionId,
        mentorId: session.mentorId,
        studentId: data.studentId,
        rating: data.rating,
        comment: data.comment,
      },
    });
    
    // Update mentor's average rating
    const allReviews = await prisma.mentorReview.findMany({
      where: { mentorId: session.mentorId },
    });
    
    const averageRating = allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length;
    
    await prisma.mentor.update({
      where: { id: session.mentorId },
      data: { rating: averageRating },
    });
    
    return review;
  }
}

// Export singleton instance
export const mentorSessionService = new MentorSessionService();
