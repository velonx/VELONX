import { prisma } from "@/lib/prisma";
import { Prisma, NotificationType } from "@prisma/client";
import { NotFoundError, ValidationError, AuthorizationError } from "@/lib/utils/errors";

/**
 * Input type for creating a notification
 */
export interface CreateNotificationInput {
  userId: string;
  title: string;
  description: string;
  type: NotificationType;
  actionUrl?: string;
  metadata?: Record<string, any>;
}

/**
 * Parameters for listing notifications
 */
export interface ListNotificationsParams {
  userId: string;
  page?: number;
  pageSize?: number;
  read?: boolean;
  type?: NotificationType;
}

/**
 * Response type for notification list
 */
export interface NotificationListResponse {
  notifications: any[];
  unreadCount: number;
  pagination: {
    page: number;
    pageSize: number;
    totalCount: number;
    totalPages: number;
  };
}

/**
 * Notification service layer for managing notification operations
 */
export class NotificationService {
  /**
   * Create a new notification
   * Validates that the userId references an existing user
   */
  async createNotification(data: CreateNotificationInput) {
    // Validate that the user exists
    const userExists = await prisma.user.findUnique({
      where: { id: data.userId },
      select: { id: true },
    });

    if (!userExists) {
      throw new ValidationError("Invalid userId: User does not exist");
    }

    // Validate notification type
    const validTypes = Object.values(NotificationType);
    if (!validTypes.includes(data.type)) {
      throw new ValidationError(`Invalid notification type. Must be one of: ${validTypes.join(", ")}`);
    }

    // Create the notification
    const notification = await prisma.notification.create({
      data: {
        userId: data.userId,
        title: data.title,
        description: data.description,
        type: data.type,
        actionUrl: data.actionUrl,
        metadata: data.metadata,
        read: false, // Default read status
      },
    });

    return notification;
  }

  /**
   * List notifications with pagination and filtering
   * Returns notifications ordered by creation date descending (newest first)
   */
  async listNotifications(params: ListNotificationsParams): Promise<NotificationListResponse> {
    const { userId, page = 1, pageSize = 20, read, type } = params;

    // Build where clause
    const where: Prisma.NotificationWhereInput = {
      userId,
    };

    // Add read status filter if provided
    if (read !== undefined) {
      where.read = read;
    }

    // Add type filter if provided
    if (type !== undefined) {
      where.type = type;
    }

    // Execute queries in parallel
    const [notifications, totalCount, unreadCount] = await Promise.all([
      prisma.notification.findMany({
        where,
        orderBy: { createdAt: "desc" }, // Chronological ordering (newest first)
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      prisma.notification.count({ where }),
      prisma.notification.count({
        where: {
          userId,
          read: false,
        },
      }),
    ]);

    return {
      notifications,
      unreadCount,
      pagination: {
        page,
        pageSize,
        totalCount,
        totalPages: Math.ceil(totalCount / pageSize),
      },
    };
  }

  /**
   * Get a notification by ID
   */
  async getNotificationById(id: string) {
    const notification = await prisma.notification.findUnique({
      where: { id },
    });

    if (!notification) {
      throw new NotFoundError("Notification");
    }

    return notification;
  }

  /**
   * Mark a notification as read
   * Validates that the user owns the notification
   */
  async markAsRead(id: string, userId: string) {
    // Get the notification
    const notification = await prisma.notification.findUnique({
      where: { id },
    });

    if (!notification) {
      throw new NotFoundError("Notification");
    }

    // Check authorization - user must own the notification
    if (notification.userId !== userId) {
      throw new AuthorizationError("You are not authorized to access this notification");
    }

    // Update the notification
    const updatedNotification = await prisma.notification.update({
      where: { id },
      data: { read: true },
    });

    return updatedNotification;
  }

  /**
   * Mark all notifications as read for a user
   */
  async markAllAsRead(userId: string) {
    const result = await prisma.notification.updateMany({
      where: {
        userId,
        read: false,
      },
      data: {
        read: true,
      },
    });

    return { count: result.count };
  }

  /**
   * Delete a notification
   * Validates that the user owns the notification
   */
  async deleteNotification(id: string, userId: string) {
    // Get the notification
    const notification = await prisma.notification.findUnique({
      where: { id },
    });

    if (!notification) {
      throw new NotFoundError("Notification");
    }

    // Check authorization - user must own the notification
    if (notification.userId !== userId) {
      throw new AuthorizationError("You are not authorized to access this notification");
    }

    // Delete the notification
    await prisma.notification.delete({
      where: { id },
    });
  }

  /**
   * Delete all notifications for a user
   */
  async deleteAllNotifications(userId: string) {
    const result = await prisma.notification.deleteMany({
      where: { userId },
    });

    return { count: result.count };
  }

  /**
   * Get the count of unread notifications for a user
   */
  async getUnreadCount(userId: string): Promise<number> {
    const count = await prisma.notification.count({
      where: {
        userId,
        read: false,
      },
    });

    return count;
  }

  // ============================================================================
  // Mentor Session Notification Helpers
  // ============================================================================

  /**
   * Create notification when a mentor session is booked
   * Notifies the mentor about the new booking
   */
  async createMentorSessionBookedNotification(sessionData: {
    sessionId: string;
    mentorId: string;
    studentName: string;
    title: string;
    date: Date;
  }) {
    const formattedDate = new Date(sessionData.date).toLocaleString('en-US', {
      dateStyle: 'medium',
      timeStyle: 'short',
    });

    return this.createNotification({
      userId: sessionData.mentorId,
      title: 'New Session Booking',
      description: `${sessionData.studentName} has booked a session "${sessionData.title}" on ${formattedDate}`,
      type: NotificationType.INFO,
      actionUrl: `/dashboard/admin?tab=sessions`,
      metadata: {
        sessionId: sessionData.sessionId,
        eventType: 'session_booked',
      },
    });
  }

  /**
   * Create notification when a mentor session is confirmed
   * Notifies the student about the confirmation
   */
  async createMentorSessionConfirmedNotification(sessionData: {
    sessionId: string;
    studentId: string;
    mentorName: string;
    title: string;
    date: Date;
    meetingLink?: string;
  }) {
    const formattedDate = new Date(sessionData.date).toLocaleString('en-US', {
      dateStyle: 'medium',
      timeStyle: 'short',
    });

    const description = sessionData.meetingLink
      ? `Your session "${sessionData.title}" with ${sessionData.mentorName} on ${formattedDate} has been confirmed. Meeting link: ${sessionData.meetingLink}`
      : `Your session "${sessionData.title}" with ${sessionData.mentorName} on ${formattedDate} has been confirmed.`;

    return this.createNotification({
      userId: sessionData.studentId,
      title: 'Session Confirmed',
      description,
      type: NotificationType.SUCCESS,
      actionUrl: `/dashboard/student?tab=sessions`,
      metadata: {
        sessionId: sessionData.sessionId,
        eventType: 'session_confirmed',
      },
    });
  }

  /**
   * Create notification when a mentor session is completed
   * Notifies the student to leave a review
   */
  async createMentorSessionCompletedNotification(sessionData: {
    sessionId: string;
    studentId: string;
    mentorName: string;
    title: string;
  }) {
    return this.createNotification({
      userId: sessionData.studentId,
      title: 'Session Completed - Leave a Review',
      description: `Your session "${sessionData.title}" with ${sessionData.mentorName} has been completed. Please take a moment to leave a review.`,
      type: NotificationType.INFO,
      actionUrl: `/dashboard/student?tab=sessions`,
      metadata: {
        sessionId: sessionData.sessionId,
        eventType: 'session_completed',
      },
    });
  }

  /**
   * Create notifications when a mentor session is cancelled
   * Notifies both the student and mentor about the cancellation
   */
  async createMentorSessionCancelledNotification(sessionData: {
    sessionId: string;
    studentId: string;
    mentorId: string;
    studentName: string;
    mentorName: string;
    title: string;
    date: Date;
    cancelledBy: 'student' | 'mentor';
  }) {
    const formattedDate = new Date(sessionData.date).toLocaleString('en-US', {
      dateStyle: 'medium',
      timeStyle: 'short',
    });

    const notifications = [];

    // Notify the student
    const studentDescription = sessionData.cancelledBy === 'student'
      ? `You have cancelled your session "${sessionData.title}" with ${sessionData.mentorName} scheduled for ${formattedDate}.`
      : `${sessionData.mentorName} has cancelled the session "${sessionData.title}" scheduled for ${formattedDate}.`;

    notifications.push(
      this.createNotification({
        userId: sessionData.studentId,
        title: 'Session Cancelled',
        description: studentDescription,
        type: NotificationType.WARNING,
        actionUrl: `/dashboard/student?tab=sessions`,
        metadata: {
          sessionId: sessionData.sessionId,
          eventType: 'session_cancelled',
          cancelledBy: sessionData.cancelledBy,
        },
      })
    );

    // Notify the mentor
    const mentorDescription = sessionData.cancelledBy === 'mentor'
      ? `You have cancelled the session "${sessionData.title}" with ${sessionData.studentName} scheduled for ${formattedDate}.`
      : `${sessionData.studentName} has cancelled the session "${sessionData.title}" scheduled for ${formattedDate}.`;

    notifications.push(
      this.createNotification({
        userId: sessionData.mentorId,
        title: 'Session Cancelled',
        description: mentorDescription,
        type: NotificationType.WARNING,
        actionUrl: `/dashboard/admin?tab=sessions`,
        metadata: {
          sessionId: sessionData.sessionId,
          eventType: 'session_cancelled',
          cancelledBy: sessionData.cancelledBy,
        },
      })
    );

    // Execute all notification creations in parallel
    return Promise.all(notifications);
  }

  // ============================================================================
  // Project Notification Helpers
  // ============================================================================

  /**
   * Create notification when a project is approved by admin
   * Notifies the project owner about the approval
   */
  async createProjectApprovedNotification(projectData: {
    projectId: string;
    ownerId: string;
    projectTitle: string;
  }) {
    return this.createNotification({
      userId: projectData.ownerId,
      title: 'Project Approved',
      description: `Your project "${projectData.projectTitle}" has been approved and is now visible to the community!`,
      type: NotificationType.SUCCESS,
      actionUrl: `/projects`,
      metadata: {
        projectId: projectData.projectId,
        eventType: 'project_approved',
      },
    });
  }

  /**
   * Create notification when a project is rejected by admin
   * Notifies the project owner about the rejection with reason
   */
  async createProjectRejectedNotification(projectData: {
    projectId: string;
    ownerId: string;
    projectTitle: string;
    reason?: string;
  }) {
    const description = projectData.reason
      ? `Your project "${projectData.projectTitle}" was not approved. Reason: ${projectData.reason}`
      : `Your project "${projectData.projectTitle}" was not approved. Please review and resubmit.`;

    return this.createNotification({
      userId: projectData.ownerId,
      title: 'Project Not Approved',
      description,
      type: NotificationType.WARNING,
      actionUrl: `/submit-project`,
      metadata: {
        projectId: projectData.projectId,
        eventType: 'project_rejected',
        reason: projectData.reason,
      },
    });
  }

  /**
   * Create notification when a user requests to join a project
   * Notifies the project owner about the join request
   */
  async createProjectJoinRequestNotification(requestData: {
    requestId: string;
    projectId: string;
    projectTitle: string;
    ownerId: string;
    requesterName: string;
  }) {
    return this.createNotification({
      userId: requestData.ownerId,
      title: 'New Join Request',
      description: `${requestData.requesterName} has requested to join your project "${requestData.projectTitle}"`,
      type: NotificationType.INFO,
      actionUrl: `/dashboard/student?tab=projects`,
      metadata: {
        requestId: requestData.requestId,
        projectId: requestData.projectId,
        eventType: 'join_request_received',
      },
    });
  }

  /**
   * Create notification when a join request is approved
   * Notifies the requesting user about the approval
   */
  async createJoinRequestApprovedNotification(requestData: {
    requestId: string;
    projectId: string;
    projectTitle: string;
    requesterId: string;
  }) {
    return this.createNotification({
      userId: requestData.requesterId,
      title: 'Join Request Approved',
      description: `Your request to join "${requestData.projectTitle}" has been approved! You are now a member of the project.`,
      type: NotificationType.SUCCESS,
      actionUrl: `/projects`,
      metadata: {
        requestId: requestData.requestId,
        projectId: requestData.projectId,
        eventType: 'join_request_approved',
      },
    });
  }

  /**
   * Create notification when a join request is rejected
   * Notifies the requesting user about the rejection
   */
  async createJoinRequestRejectedNotification(requestData: {
    requestId: string;
    projectId: string;
    projectTitle: string;
    requesterId: string;
  }) {
    return this.createNotification({
      userId: requestData.requesterId,
      title: 'Join Request Declined',
      description: `Your request to join "${requestData.projectTitle}" was not approved at this time.`,
      type: NotificationType.WARNING,
      actionUrl: `/projects`,
      metadata: {
        requestId: requestData.requestId,
        projectId: requestData.projectId,
        eventType: 'join_request_rejected',
      },
    });
  }

  // ============================================================================
  // XP and Level Notification Helpers
  // ============================================================================

  /**
   * Create notification when a user is awarded XP
   * Notifies the user about the XP award with amount and reason
   */
  async createXPAwardNotification(xpData: {
    userId: string;
    xpAmount: number;
    reason: string;
  }) {
    return this.createNotification({
      userId: xpData.userId,
      title: 'XP Awarded!',
      description: `You earned ${xpData.xpAmount} XP for ${xpData.reason}`,
      type: NotificationType.AWARD,
      actionUrl: `/leaderboard`,
      metadata: {
        xpAmount: xpData.xpAmount,
        reason: xpData.reason,
        eventType: 'xp_awarded',
      },
    });
  }

  /**
   * Create notification when a user levels up
   * Notifies the user about their new level with congratulatory message
   */
  async createLevelUpNotification(levelData: {
    userId: string;
    newLevel: number;
  }) {
    return this.createNotification({
      userId: levelData.userId,
      title: 'Level Up!',
      description: `Congratulations! You've reached Level ${levelData.newLevel}! Keep up the great work!`,
      type: NotificationType.AWARD,
      actionUrl: `/leaderboard`,
      metadata: {
        newLevel: levelData.newLevel,
        eventType: 'level_up',
      },
    });
  }

  // ============================================================================
  // Event Notification Helpers
  // ============================================================================

  /**
   * Create notification when a user registers for an event
   * Notifies the user with event confirmation details including title, date, and location
   */
  async createEventRegistrationNotification(eventData: {
    eventId: string;
    userId: string;
    eventTitle: string;
    eventDate: Date;
    location?: string;
  }) {
    const formattedDate = new Date(eventData.eventDate).toLocaleString('en-US', {
      dateStyle: 'medium',
      timeStyle: 'short',
    });

    const locationText = eventData.location ? ` at ${eventData.location}` : '';
    const description = `You have successfully registered for "${eventData.eventTitle}" on ${formattedDate}${locationText}. We look forward to seeing you there!`;

    return this.createNotification({
      userId: eventData.userId,
      title: 'Event Registration Confirmed',
      description,
      type: NotificationType.EVENT,
      actionUrl: `/events`,
      metadata: {
        eventId: eventData.eventId,
        eventType: 'event_registration',
      },
    });
  }

  /**
   * Create notifications when an event is cancelled
   * Notifies all registered attendees about the cancellation with event details
   */
  async createEventCancelledNotification(eventData: {
    eventId: string;
    eventTitle: string;
    eventDate: Date;
    location?: string;
    attendeeIds: string[];
  }) {
    const formattedDate = new Date(eventData.eventDate).toLocaleString('en-US', {
      dateStyle: 'medium',
      timeStyle: 'short',
    });

    const locationText = eventData.location ? ` at ${eventData.location}` : '';
    const description = `The event "${eventData.eventTitle}" scheduled for ${formattedDate}${locationText} has been cancelled. We apologize for any inconvenience.`;

    // Create notifications for all attendees
    const notifications = eventData.attendeeIds.map((userId) =>
      this.createNotification({
        userId,
        title: 'Event Cancelled',
        description,
        type: NotificationType.WARNING,
        actionUrl: `/events`,
        metadata: {
          eventId: eventData.eventId,
          eventType: 'event_cancelled',
        },
      })
    );

    // Execute all notification creations in parallel
    return Promise.all(notifications);
  }

  /**
   * Create notifications when an event status changes to ongoing
   * Notifies all registered attendees that the event is now happening
   */
  async createEventOngoingNotification(eventData: {
    eventId: string;
    eventTitle: string;
    eventDate: Date;
    location?: string;
    attendeeIds: string[];
  }) {
    const formattedDate = new Date(eventData.eventDate).toLocaleString('en-US', {
      dateStyle: 'medium',
      timeStyle: 'short',
    });

    const locationText = eventData.location ? ` at ${eventData.location}` : '';
    const description = `The event "${eventData.eventTitle}" is now ongoing! Join us${locationText}. Don't miss out!`;

    // Create notifications for all attendees
    const notifications = eventData.attendeeIds.map((userId) =>
      this.createNotification({
        userId,
        title: 'Event Now Ongoing',
        description,
        type: NotificationType.EVENT,
        actionUrl: `/events`,
        metadata: {
          eventId: eventData.eventId,
          eventType: 'event_ongoing',
        },
      })
    );

    // Execute all notification creations in parallel
    return Promise.all(notifications);
  }

  // ============================================================================
  // Meeting Notification Helpers
  // ============================================================================

  /**
   * Create notification when a user is invited to a meeting
   * Notifies the invitee with meeting details including title, date, and platform
   */
  async createMeetingInvitationNotification(meetingData: {
    meetingId: string;
    inviteeId: string;
    meetingTitle: string;
    meetingDate: Date;
    platform?: string;
    inviterName: string;
  }) {
    const formattedDate = new Date(meetingData.meetingDate).toLocaleString('en-US', {
      dateStyle: 'medium',
      timeStyle: 'short',
    });

    const platformText = meetingData.platform ? ` on ${meetingData.platform}` : '';
    const description = `${meetingData.inviterName} has invited you to "${meetingData.meetingTitle}" on ${formattedDate}${platformText}`;

    return this.createNotification({
      userId: meetingData.inviteeId,
      title: 'Meeting Invitation',
      description,
      type: NotificationType.EVENT,
      actionUrl: `/events`,
      metadata: {
        meetingId: meetingData.meetingId,
        eventType: 'meeting_invitation',
      },
    });
  }

  /**
   * Create notification when a meeting invitation is accepted
   * Notifies the meeting creator that an invitee has accepted
   */
  async createMeetingAcceptedNotification(meetingData: {
    meetingId: string;
    creatorId: string;
    meetingTitle: string;
    meetingDate: Date;
    platform?: string;
    acceptedByName: string;
  }) {
    const formattedDate = new Date(meetingData.meetingDate).toLocaleString('en-US', {
      dateStyle: 'medium',
      timeStyle: 'short',
    });

    const platformText = meetingData.platform ? ` on ${meetingData.platform}` : '';
    const description = `${meetingData.acceptedByName} has accepted your invitation to "${meetingData.meetingTitle}" on ${formattedDate}${platformText}`;

    return this.createNotification({
      userId: meetingData.creatorId,
      title: 'Meeting Invitation Accepted',
      description,
      type: NotificationType.EVENT,
      actionUrl: `/events`,
      metadata: {
        meetingId: meetingData.meetingId,
        eventType: 'meeting_accepted',
      },
    });
  }

  /**
   * Create notification when a meeting invitation is declined
   * Notifies the meeting creator that an invitee has declined
   */
  async createMeetingDeclinedNotification(meetingData: {
    meetingId: string;
    creatorId: string;
    meetingTitle: string;
    meetingDate: Date;
    platform?: string;
    declinedByName: string;
  }) {
    const formattedDate = new Date(meetingData.meetingDate).toLocaleString('en-US', {
      dateStyle: 'medium',
      timeStyle: 'short',
    });

    const platformText = meetingData.platform ? ` on ${meetingData.platform}` : '';
    const description = `${meetingData.declinedByName} has declined your invitation to "${meetingData.meetingTitle}" on ${formattedDate}${platformText}`;

    return this.createNotification({
      userId: meetingData.creatorId,
      title: 'Meeting Invitation Declined',
      description,
      type: NotificationType.EVENT,
      actionUrl: `/events`,
      metadata: {
        meetingId: meetingData.meetingId,
        eventType: 'meeting_declined',
      },
    });
  }
}

export const notificationService = new NotificationService();
