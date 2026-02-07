import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { NotFoundError, ConflictError } from "@/lib/utils/errors";
import { notificationService } from "./notification.service";

/**
 * Meeting Service
 * Handles all business logic for meeting management
 */
export class MeetingService {
  /**
   * List meetings with pagination and filtering
   */
  async listMeetings(params: {
    page?: number;
    pageSize?: number;
    startDate?: string;
    endDate?: string;
    userId?: string;
  }) {
    const { page = 1, pageSize = 10, startDate, endDate, userId } = params;
    
    // Build where clause for filtering
    const where: Prisma.MeetingWhereInput = {};
    
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
    
    // Filter by attendee
    if (userId) {
      where.attendees = {
        some: {
          userId,
        },
      };
    }
    
    // Execute query with pagination
    const [meetings, totalCount] = await Promise.all([
      prisma.meeting.findMany({
        where,
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
              user: true,
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
      prisma.meeting.count({ where }),
    ]);

    // Filter out attendees with null users and format the response
    const formattedMeetings = meetings.map(meeting => ({
      ...meeting,
      attendees: meeting.attendees
        .filter(attendee => attendee.user !== null)
        .map(attendee => ({
          ...attendee,
          user: {
            id: attendee.user!.id,
            name: attendee.user!.name,
            image: attendee.user!.image,
            email: attendee.user!.email,
          },
        })),
    }));
    
    return {
      meetings: formattedMeetings,
      pagination: {
        page,
        pageSize,
        totalCount,
        totalPages: Math.ceil(totalCount / pageSize),
      },
    };
  }
  
  /**
   * Get meeting by ID with full details
   */
  async getMeetingById(id: string) {
    const meeting = await prisma.meeting.findUnique({
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
      },
    });
    
    if (!meeting) {
      throw new NotFoundError("Meeting");
    }
    
    return meeting;
  }
  
  /**
   * Create a new meeting
   */
  async createMeeting(data: {
    title: string;
    description?: string;
    date: string;
    duration: number;
    platform: string;
    meetingLink?: string;
    creatorId: string;
  }) {
    const meeting = await prisma.meeting.create({
      data: {
        title: data.title,
        description: data.description,
        date: new Date(data.date),
        duration: data.duration,
        platform: data.platform,
        meetingLink: data.meetingLink,
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
      },
    });
    
    return meeting;
  }
  
  /**
   * Update an existing meeting
   */
  async updateMeeting(
    id: string,
    data: {
      title?: string;
      description?: string;
      date?: string;
      duration?: number;
      platform?: string;
      meetingLink?: string;
    }
  ) {
    // Check if meeting exists
    const existingMeeting = await prisma.meeting.findUnique({
      where: { id },
    });
    
    if (!existingMeeting) {
      throw new NotFoundError("Meeting");
    }
    
    // Build update data
    const updateData: Prisma.MeetingUpdateInput = {};
    
    if (data.title !== undefined) updateData.title = data.title;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.date !== undefined) updateData.date = new Date(data.date);
    if (data.duration !== undefined) updateData.duration = data.duration;
    if (data.platform !== undefined) updateData.platform = data.platform;
    if (data.meetingLink !== undefined) updateData.meetingLink = data.meetingLink;
    
    const meeting = await prisma.meeting.update({
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
      },
    });
    
    return meeting;
  }
  
  /**
   * Delete a meeting
   */
  async deleteMeeting(id: string) {
    // Check if meeting exists
    const existingMeeting = await prisma.meeting.findUnique({
      where: { id },
    });
    
    if (!existingMeeting) {
      throw new NotFoundError("Meeting");
    }
    
    await prisma.meeting.delete({
      where: { id },
    });
    
    return { success: true };
  }
  
  /**
   * Add an attendee to a meeting
   */
  async addMeetingAttendee(meetingId: string, userId: string) {
    // Check if meeting exists
    const meeting = await prisma.meeting.findUnique({
      where: { id: meetingId },
      include: {
        creator: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });
    
    if (!meeting) {
      throw new NotFoundError("Meeting");
    }
    
    // Check if user is already an attendee
    const existingAttendee = await prisma.meetingAttendee.findUnique({
      where: {
        meetingId_userId: {
          meetingId,
          userId,
        },
      },
    });
    
    if (existingAttendee) {
      throw new ConflictError("User is already an attendee of this meeting");
    }
    
    // Add attendee with INVITED status
    const attendee = await prisma.meetingAttendee.create({
      data: {
        meetingId,
        userId,
        status: "INVITED",
      },
      include: {
        meeting: {
          select: {
            id: true,
            title: true,
            date: true,
            platform: true,
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
    
    // Create notification for invitee about meeting invitation
    try {
      await notificationService.createMeetingInvitationNotification({
        meetingId,
        inviteeId: userId,
        meetingTitle: attendee.meeting.title,
        meetingDate: attendee.meeting.date,
        platform: attendee.meeting.platform || undefined,
        inviterName: meeting.creator.name || 'Someone',
      });
    } catch (error) {
      console.error('Failed to create meeting invitation notification:', error);
      // Don't fail the invitation if notification fails
    }
    
    return attendee;
  }
  
  /**
   * Update attendee status
   */
  async updateAttendeeStatus(
    meetingId: string,
    userId: string,
    status: string
  ) {
    // Check if attendee exists
    const existingAttendee = await prisma.meetingAttendee.findUnique({
      where: {
        meetingId_userId: {
          meetingId,
          userId,
        },
      },
    });
    
    if (!existingAttendee) {
      throw new NotFoundError("Meeting attendee");
    }
    
    // Update status
    const attendee = await prisma.meetingAttendee.update({
      where: {
        meetingId_userId: {
          meetingId,
          userId,
        },
      },
      data: {
        status: status as any,
      },
      include: {
        meeting: {
          select: {
            id: true,
            title: true,
            date: true,
            platform: true,
            creatorId: true,
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
    
    // Create notifications based on status change
    if (status !== existingAttendee.status) {
      try {
        if (status === 'ACCEPTED') {
          // Notify meeting creator about acceptance
          await notificationService.createMeetingAcceptedNotification({
            meetingId,
            creatorId: attendee.meeting.creatorId,
            meetingTitle: attendee.meeting.title,
            meetingDate: attendee.meeting.date,
            platform: attendee.meeting.platform || undefined,
            acceptedByName: attendee.user.name || 'Someone',
          });
        } else if (status === 'DECLINED') {
          // Notify meeting creator about decline
          await notificationService.createMeetingDeclinedNotification({
            meetingId,
            creatorId: attendee.meeting.creatorId,
            meetingTitle: attendee.meeting.title,
            meetingDate: attendee.meeting.date,
            platform: attendee.meeting.platform || undefined,
            declinedByName: attendee.user.name || 'Someone',
          });
        }
      } catch (error) {
        console.error('Failed to create meeting status notification:', error);
        // Don't fail the status update if notification fails
      }
    }
    
    return attendee;
  }
}

// Export singleton instance
export const meetingService = new MeetingService();
