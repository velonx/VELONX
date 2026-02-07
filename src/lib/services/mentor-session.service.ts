import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { NotFoundError, ConflictError, ValidationError } from "@/lib/utils/errors";
import { notificationService } from "./notification.service";
import { awardXP, XP_REWARDS } from "@/lib/utils/xp";

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
    // Validate mentor exists and is available
    const mentor = await prisma.mentor.findUnique({
      where: { id: data.mentorId },
    });
    
    if (!mentor) {
      throw new NotFoundError("Mentor");
    }
    
    if (!mentor.available) {
      throw new ValidationError("Mentor is not currently available for bookings");
    }
    
    // Check for conflicting sessions
    const sessionDate = new Date(data.date);
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
