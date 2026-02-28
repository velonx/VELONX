import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { NotFoundError, ConflictError, ValidationError, AppError } from "@/lib/utils/errors";
import { notificationService } from "./notification.service";
import { awardXP, XP_REWARDS } from "@/lib/utils/xp";
import { computeRegistrationStatus } from "@/lib/utils/event-helpers";
import { eventAnalyticsService } from "./event-analytics.service";

/**
 * Event Service
 * Handles all business logic for event management
 */
export class EventService {
  /**
   * List events with pagination and filtering
   * Optimized for mobile: reduced payload size by selecting only necessary fields
   */
  async listEvents(params: {
    page?: number;
    pageSize?: number;
    type?: string;
    status?: string;
    startDate?: string;
    endDate?: string;
  }) {
    const { page = 1, pageSize = 10, type, status, startDate, endDate } = params;
    
    // Build where clause for filtering
    const where: Prisma.EventWhereInput = {};
    
    if (type) {
      where.type = type as any;
    }
    
    // Handle status filtering with date-based logic
    // Events are considered "past" if their date (or endDate) has passed
    if (status) {
      const now = new Date();
      
      if (status === 'UPCOMING') {
        // Upcoming events: date is in the future AND not cancelled
        // For multi-day events, check if endDate (if exists) is in the future
        where.AND = [
          {
            OR: [
              { date: { gt: now } },
              { 
                AND: [
                  { endDate: { not: null } },
                  { endDate: { gt: now } }
                ]
              }
            ]
          },
          { status: { not: 'CANCELLED' } }
        ];
      } else if (status === 'COMPLETED') {
        // Past/Completed events: date has passed OR status is explicitly COMPLETED
        // For multi-day events, check if endDate has also passed
        where.OR = [
          { status: 'COMPLETED' },
          { 
            AND: [
              { date: { lte: now } },
              { 
                OR: [
                  { endDate: null },
                  { endDate: { lte: now } }
                ]
              },
              { status: { not: 'CANCELLED' } }
            ]
          }
        ];
      } else {
        // For other statuses (ONGOING, CANCELLED), use the status field directly
        where.status = status as any;
      }
    }
    
    // Date range filtering
    if (startDate || endDate) {
      if (!where.AND) {
        where.AND = [];
      }
      const dateFilter: any = {};
      if (startDate) {
        dateFilter.gte = new Date(startDate);
      }
      if (endDate) {
        dateFilter.lte = new Date(endDate);
      }
      (where.AND as any[]).push({ date: dateFilter });
    }
    
    // Execute query with pagination
    // Optimized: Select only necessary fields to reduce payload size (Requirement 6.9, 6.10)
    // Feature: event-registration-closed - Include registration closure fields
    const [events, totalCount] = await Promise.all([
      prisma.event.findMany({
        where,
        select: {
          id: true,
          title: true,
          description: true,
          type: true,
          status: true,
          date: true,
          endDate: true,
          location: true,
          imageUrl: true,
          maxSeats: true,
          meetingLink: true,
          createdAt: true,
          registrationDeadline: true,
          registrationManuallyClosedAt: true,
          creator: {
            select: {
              id: true,
              name: true,
              image: true,
              // Exclude email for privacy in list view
            },
          },
          _count: {
            select: {
              attendees: true,
            },
          },
        },
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy: {
          date: "asc",
        },
      }),
      prisma.event.count({ where }),
    ]);
    
    // Add available seats to each event
    const eventsWithSeats = events.map((event) => ({
      ...event,
      attendeeCount: event._count.attendees,
      availableSeats: event.maxSeats - event._count.attendees,
    }));
    
    return {
      events: eventsWithSeats,
      pagination: {
        page,
        pageSize,
        totalCount,
        totalPages: Math.ceil(totalCount / pageSize),
      },
    };
  }
  
  /**
   * Get event by ID with full details
   */
  async getEventById(id: string) {
    const event = await prisma.event.findUnique({
      where: { id },
      include: {
        creator: {
          select: {
            id: true,
            name: true,
            image: true,
            email: true,
          },
        },
        attendees: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                image: true,
                email: true,
              },
            },
          },
        },
        _count: {
          select: {
            attendees: true,
          },
        },
      },
    });
    
    if (!event) {
      throw new NotFoundError("Event");
    }
    
    // Add available seats
    return {
      ...event,
      attendeeCount: event._count.attendees,
      availableSeats: event.maxSeats - event._count.attendees,
    };
  }
  
  /**
   * Create a new event
   */
  async createEvent(data: {
    title: string;
    description: string;
    type: string;
    date: string;
    endDate?: string;
    location?: string;
    imageUrl?: string;
    maxSeats: number;
    status?: string;
    creatorId: string;
  }) {
    const event = await prisma.event.create({
      data: {
        title: data.title,
        description: data.description,
        type: data.type as any,
        date: new Date(data.date),
        endDate: data.endDate ? new Date(data.endDate) : null,
        location: data.location,
        imageUrl: data.imageUrl,
        maxSeats: data.maxSeats,
        status: (data.status as any) || "UPCOMING",
        creatorId: data.creatorId,
      },
      include: {
        creator: {
          select: {
            id: true,
            name: true,
            image: true,
            email: true,
          },
        },
        _count: {
          select: {
            attendees: true,
          },
        },
      },
    });
    
    return {
      ...event,
      attendeeCount: event._count.attendees,
      availableSeats: event.maxSeats - event._count.attendees,
    };
  }
  
  /**
   * Update an existing event
   */
  async updateEvent(
    id: string,
    data: {
      title?: string;
      description?: string;
      type?: string;
      date?: string;
      endDate?: string;
      location?: string;
      imageUrl?: string;
      maxSeats?: number;
      status?: string;
      registrationDeadline?: string;
      registrationManuallyClosedAt?: string;
    }
  ) {
    // Check if event exists
    const existingEvent = await prisma.event.findUnique({
      where: { id },
      include: {
        attendees: {
          select: {
            userId: true,
          },
        },
        _count: {
          select: {
            attendees: true,
          },
        },
      },
    });
    
    if (!existingEvent) {
      throw new NotFoundError("Event");
    }
    
    // Build update data
    const updateData: Prisma.EventUpdateInput = {};
    
    if (data.title !== undefined) updateData.title = data.title;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.type !== undefined) updateData.type = data.type as any;
    if (data.date !== undefined) updateData.date = new Date(data.date);
    if (data.endDate !== undefined) updateData.endDate = data.endDate ? new Date(data.endDate) : null;
    if (data.location !== undefined) updateData.location = data.location;
    if (data.imageUrl !== undefined) updateData.imageUrl = data.imageUrl;
    if (data.maxSeats !== undefined) updateData.maxSeats = data.maxSeats;
    if (data.status !== undefined) updateData.status = data.status as any;
    if (data.registrationDeadline !== undefined) {
      updateData.registrationDeadline = data.registrationDeadline ? new Date(data.registrationDeadline) : null;
    }
    if (data.registrationManuallyClosedAt !== undefined) {
      updateData.registrationManuallyClosedAt = data.registrationManuallyClosedAt ? new Date(data.registrationManuallyClosedAt) : null;
    }
    
    // Validate registrationDeadline is before event date
    if (data.registrationDeadline) {
      const eventDate = data.date ? new Date(data.date) : existingEvent.date;
      const deadline = new Date(data.registrationDeadline);
      
      if (deadline >= eventDate) {
        throw new ValidationError("Registration deadline must be before event start date");
      }
    }
    
    const event = await prisma.event.update({
      where: { id },
      data: updateData,
      include: {
        creator: {
          select: {
            id: true,
            name: true,
            image: true,
            email: true,
          },
        },
        _count: {
          select: {
            attendees: true,
          },
        },
      },
    });
    
    // Track manual closure if registration was manually closed
    // Requirements: 10.1, 10.2, 10.5, 9.1, 9.2, 9.4, 9.5
    if (data.registrationManuallyClosedAt && !existingEvent.registrationManuallyClosedAt) {
      eventAnalyticsService.hasClosureBeenTracked(id, 'manual').then((tracked) => {
        if (!tracked) {
          eventAnalyticsService.trackRegistrationClosure({
            eventId: id,
            closureReason: 'manual',
            attendeeCount: existingEvent._count.attendees,
            eventCreatedAt: existingEvent.createdAt,
          }).catch((error) => {
            console.error('Failed to track manual closure:', error);
          });
        }
      });

      // Send notification to event creator about manual closure
      // Requirements: 9.1, 9.2, 9.4, 9.5
      notificationService.createEventRegistrationClosedNotification({
        eventId: id,
        eventTitle: event.title,
        creatorId: event.creatorId,
        closureReason: 'manual',
        closureTimestamp: new Date(),
        attendeeCount: existingEvent._count.attendees,
        maxSeats: event.maxSeats,
      }).catch((error) => {
        console.error('Failed to send manual closure notification:', error);
        // Don't fail the update if notification fails
      });
    }
    
    // Track deadline closure if deadline was set and is in the past
    // Requirements: 10.1, 10.2, 10.5, 9.1, 9.2, 9.4, 9.5
    if (data.registrationDeadline && !existingEvent.registrationDeadline) {
      const deadline = new Date(data.registrationDeadline);
      if (deadline < new Date()) {
        eventAnalyticsService.hasClosureBeenTracked(id, 'deadline').then((tracked) => {
          if (!tracked) {
            eventAnalyticsService.trackRegistrationClosure({
              eventId: id,
              closureReason: 'deadline',
              attendeeCount: existingEvent._count.attendees,
              eventCreatedAt: existingEvent.createdAt,
            }).catch((error) => {
              console.error('Failed to track deadline closure:', error);
            });
          }
        });

        // Send notification to event creator about deadline closure
        // Requirements: 9.1, 9.2, 9.4, 9.5
        notificationService.createEventRegistrationClosedNotification({
          eventId: id,
          eventTitle: event.title,
          creatorId: event.creatorId,
          closureReason: 'deadline',
          closureTimestamp: deadline,
          attendeeCount: existingEvent._count.attendees,
          maxSeats: event.maxSeats,
        }).catch((error) => {
          console.error('Failed to send deadline closure notification:', error);
          // Don't fail the update if notification fails
        });
      }
    }
    
    // Create notifications based on status change
    if (data.status && data.status !== existingEvent.status) {
      const attendeeIds = existingEvent.attendees.map(a => a.userId);
      
      try {
        if (data.status === 'CANCELLED') {
          // Notify all attendees about cancellation
          await notificationService.createEventCancelledNotification({
            eventId: id,
            eventTitle: event.title,
            eventDate: event.date,
            location: event.location || undefined,
            attendeeIds,
          });
        } else if (data.status === 'ONGOING') {
          // Notify all attendees that event is now ongoing
          await notificationService.createEventOngoingNotification({
            eventId: id,
            eventTitle: event.title,
            eventDate: event.date,
            location: event.location || undefined,
            attendeeIds,
          });
        }
      } catch (error) {
        console.error('Failed to create event status notification:', error);
        // Don't fail the update if notification fails
      }
    }
    
    return {
      ...event,
      attendeeCount: event._count.attendees,
      availableSeats: event.maxSeats - event._count.attendees,
    };
  }
  
  /**
   * Delete an event
   */
  async deleteEvent(id: string) {
    // Check if event exists
    const existingEvent = await prisma.event.findUnique({
      where: { id },
    });
    
    if (!existingEvent) {
      throw new NotFoundError("Event");
    }
    
    await prisma.event.delete({
      where: { id },
    });
    
    return { success: true };
  }
  
  /**
   * Register a user for an event
   */
  async registerForEvent(eventId: string, userId: string) {
    // Use database transaction to prevent race conditions
    // Requirements: 2.4, 7.1, 7.2, 7.5
    return await prisma.$transaction(async (tx) => {
      // Check if event exists and get current attendee count
      const event = await tx.event.findUnique({
        where: { id: eventId },
        include: {
          _count: {
            select: {
              attendees: true,
            },
          },
        },
      });
      
      if (!event) {
        throw new NotFoundError("Event");
      }
      
      // Check if user is already registered
      const existingRegistration = await tx.eventAttendee.findUnique({
        where: {
          eventId_userId: {
            eventId,
            userId,
          },
        },
      });
      
      if (existingRegistration) {
        throw new ConflictError("Already registered for this event");
      }
      
      // Compute registration status before processing
      // Requirements: 2.4, 7.1, 7.2
      const registrationStatus = computeRegistrationStatus(
        event as any,
        event._count.attendees
      );
      
      // Validate registration is open
      if (!registrationStatus.isOpen) {
        // Log failed registration attempt for analytics
        // Requirements: 7.4, 10.3
        const errorCode = registrationStatus.reason === 'manual' 
          ? 'REGISTRATION_CLOSED_MANUAL'
          : registrationStatus.reason === 'deadline'
          ? 'REGISTRATION_CLOSED_DEADLINE'
          : 'REGISTRATION_CLOSED_CAPACITY';
        
        // Log asynchronously (don't block the error response)
        eventAnalyticsService.logFailedRegistrationAttempt({
          eventId,
          userId,
          closureReason: registrationStatus.reason!,
          errorCode,
        }).catch((error) => {
          console.error('Failed to log registration attempt:', error);
        });
        
        // Track registration closure if not already tracked
        // Requirements: 10.1, 10.2, 10.5
        eventAnalyticsService.hasClosureBeenTracked(eventId, registrationStatus.reason!).then((tracked) => {
          if (!tracked) {
            eventAnalyticsService.trackRegistrationClosure({
              eventId,
              closureReason: registrationStatus.reason!,
              attendeeCount: event._count.attendees,
              eventCreatedAt: event.createdAt,
            }).catch((error) => {
              console.error('Failed to track closure:', error);
            });
          }
        });
        
        // Return appropriate error based on closure reason
        // Requirements: 7.5
        switch (registrationStatus.reason) {
          case 'manual':
            // HTTP 400 for manual closure
            throw new AppError(
              400,
              'REGISTRATION_CLOSED_MANUAL',
              registrationStatus.message,
              { reason: 'manual' }
            );
          case 'deadline':
            // HTTP 400 for deadline closure
            throw new AppError(
              400,
              'REGISTRATION_CLOSED_DEADLINE',
              registrationStatus.message,
              { reason: 'deadline' }
            );
          case 'capacity':
            // HTTP 409 for capacity closure
            throw new AppError(
              409,
              'REGISTRATION_CLOSED_CAPACITY',
              registrationStatus.message,
              {
                reason: 'capacity',
                maxSeats: event.maxSeats,
                currentAttendees: event._count.attendees,
              }
            );
          default:
            throw new ValidationError('Registration is not available', {
              code: 'REGISTRATION_CLOSED',
            });
        }
      }
      
      // Register user for event
      const registration = await tx.eventAttendee.create({
        data: {
          eventId,
          userId,
          status: "REGISTERED",
        },
        include: {
          event: {
            select: {
              id: true,
              title: true,
              date: true,
              location: true,
            },
          },
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      });
      
      // Check if this registration caused the event to reach capacity
      // Requirements: 10.1, 10.2, 10.5, 9.1, 9.2, 9.4, 9.5
      const newAttendeeCount = event._count.attendees + 1;
      if (newAttendeeCount >= event.maxSeats) {
        // Track capacity closure asynchronously
        eventAnalyticsService.hasClosureBeenTracked(eventId, 'capacity').then((tracked) => {
          if (!tracked) {
            eventAnalyticsService.trackRegistrationClosure({
              eventId,
              closureReason: 'capacity',
              attendeeCount: newAttendeeCount,
              eventCreatedAt: event.createdAt,
            }).catch((error) => {
              console.error('Failed to track capacity closure:', error);
            });
          }
        });

        // Send notification to event creator about registration closure
        // Requirements: 9.1, 9.2, 9.4, 9.5
        notificationService.createEventRegistrationClosedNotification({
          eventId,
          eventTitle: event.title,
          creatorId: event.creatorId,
          closureReason: 'capacity',
          closureTimestamp: new Date(),
          attendeeCount: newAttendeeCount,
          maxSeats: event.maxSeats,
        }).catch((error) => {
          console.error('Failed to send registration closure notification:', error);
          // Don't fail the registration if notification fails
        });
      }
      
      // Award XP for event registration
      try {
        await awardXP(
          userId,
          XP_REWARDS.EVENT_ATTENDANCE,
          `Registered for event: ${registration.event.title}`
        );
      } catch (error) {
        console.error('Failed to award XP for event registration:', error);
        // Don't fail the registration if XP award fails
      }

      // Check and award first activity milestone (async, don't block response)
      const { checkAndAwardFirstActivity } = await import('@/lib/services/referral.service');
      checkAndAwardFirstActivity(userId, 'event_registration').catch((error) => {
        console.error('Failed to check first activity milestone:', error);
      });
      
      // Create notification for user about event registration
      try {
        await notificationService.createEventRegistrationNotification({
          eventId,
          userId,
          eventTitle: registration.event.title,
          eventDate: registration.event.date,
          location: registration.event.location || undefined,
        });
      } catch (error) {
        console.error('Failed to create event registration notification:', error);
        // Don't fail the registration if notification fails
      }
      
      return registration;
    });
  }
  
  /**
   * Unregister a user from an event
   */
  async unregisterFromEvent(eventId: string, userId: string) {
    // Check if registration exists
    const existingRegistration = await prisma.eventAttendee.findUnique({
      where: {
        eventId_userId: {
          eventId,
          userId,
        },
      },
    });
    
    if (!existingRegistration) {
      throw new NotFoundError("Event registration");
    }
    
    // Delete registration
    await prisma.eventAttendee.delete({
      where: {
        eventId_userId: {
          eventId,
          userId,
        },
      },
    });
    
    return { success: true };
  }
}

// Export singleton instance
export const eventService = new EventService();
