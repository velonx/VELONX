import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/middleware/auth.middleware";
import { handleError } from "@/lib/utils/errors";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/events/[id]/attendees
 * Get all attendees for a specific event
 * Admin only
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Check admin authentication
    const sessionOrResponse = await requireAdmin();
    if (sessionOrResponse instanceof NextResponse) {
      return sessionOrResponse;
    }
    
    const { id } = await params;
    
    // Get event with attendees
    const event = await prisma.event.findUnique({
      where: { id },
      include: {
        attendees: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                image: true,
                createdAt: true,
              },
            },
          },
          orderBy: {
            createdAt: 'desc',
          },
        },
      },
    });
    
    if (!event) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "NOT_FOUND",
            message: "Event not found",
          },
        },
        { status: 404 }
      );
    }
    
    return NextResponse.json(
      {
        success: true,
        data: {
          event: {
            id: event.id,
            title: event.title,
            date: event.date,
            maxSeats: event.maxSeats,
          },
          attendees: event.attendees,
          totalAttendees: event.attendees.length,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    return handleError(error);
  }
}
