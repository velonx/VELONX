import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { NotFoundError, ConflictError } from "@/lib/utils/errors";
import { notificationService } from "./notification.service";
import { awardXP, XP_REWARDS } from "@/lib/utils/xp";

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
    
    if (status) {
      where.status = status as any;
    }
    
    // Date range filtering
    if (startDate || endDate) {
      where.date = {};
      if (startDate) {
        where.date.gte = new Date(startDate);
      }
      if (endDate) {
        where.date.lte = new Date(endDate);
      }
    }
    
    // Execute query with pagination
    // Optimized: Select only necessary fields to reduce payload size (Requirement 6.9, 6.10)
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
    // Check if event exists and get current attendee count
    const event = await prisma.event.findUnique({
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
    
    // Check if event is full
    if (event._count.attendees >= event.maxSeats) {
      throw new ConflictError("Event is full", {
        maxSeats: event.maxSeats,
        currentAttendees: event._count.attendees,
      });
    }
    
    // Check if user is already registered
    const existingRegistration = await prisma.eventAttendee.findUnique({
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
    
    // Register user for event
    const registration = await prisma.eventAttendee.create({
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
