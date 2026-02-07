import { NextRequest, NextResponse } from "next/server";
import { eventService } from "@/lib/services/event.service";
import { auth } from "@/auth";
import { handleError } from "@/lib/utils/errors";

/**
 * GET /api/events/[id]/export
 * Generate calendar export data for an event
 * Public endpoint, but meeting link only included for registered users
 * 
 * Returns:
 * - icsData: ICS file content for download
 * - googleCalendarUrl: URL to add event to Google Calendar
 * - outlookUrl: URL to add event to Outlook Calendar
 * 
 * Requirements: 4.1-4.5
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    // Get event details
    const event = await eventService.getEventById(id);
    
    // Check if user is authenticated and registered for the event
    const session = await auth();
    let isRegistered = false;
    
    if (session?.user?.id) {
      // Check if user is registered for this event
      const registration = event.attendees?.find(
        (attendee) => attendee.userId === session.user.id
      );
      isRegistered = !!registration;
    }
    
    // Generate calendar export data
    const exportData = generateCalendarExportData(event, isRegistered);
    
    return NextResponse.json(
      {
        success: true,
        data: exportData,
      },
      { status: 200 }
    );
  } catch (error) {
    return handleError(error);
  }
}

/**
 * Helper function to generate calendar export data
 */
function generateCalendarExportData(
  event: any,
  isRegistered: boolean
): {
  icsData: string;
  googleCalendarUrl: string;
  outlookUrl: string;
} {
  const startDate = new Date(event.date);
  const endDate = event.endDate ? new Date(event.endDate) : new Date(startDate.getTime() + 60 * 60 * 1000);
  
  // Generate ICS data
  const icsData = generateICSData(event, startDate, endDate, isRegistered);
  
  // Generate Google Calendar URL
  const googleCalendarUrl = generateGoogleCalendarUrl(event, startDate, endDate, isRegistered);
  
  // Generate Outlook URL
  const outlookUrl = generateOutlookUrl(event, startDate, endDate, isRegistered);
  
  return {
    icsData,
    googleCalendarUrl,
    outlookUrl,
  };
}

/**
 * Generate ICS file content
 */
function generateICSData(
  event: any,
  startDate: Date,
  endDate: Date,
  isRegistered: boolean
): string {
  const now = new Date();
  const dtstamp = formatICSDate(now);
  const dtstart = formatICSDate(startDate);
  const dtend = formatICSDate(endDate);
  
  // Escape special characters in text fields
  const escapeICSText = (text: string): string => {
    return text
      .replace(/\\/g, '\\\\')
      .replace(/;/g, '\\;')
      .replace(/,/g, '\\,')
      .replace(/\n/g, '\\n');
  };
  
  const title = escapeICSText(event.title);
  const description = escapeICSText(event.description || '');
  const location = event.location ? escapeICSText(event.location) : '';
  
  // Build ICS content
  let icsContent = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//VELONX//Event Calendar//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:${event.id}@velonx.com`,
    `DTSTAMP:${dtstamp}`,
    `DTSTART:${dtstart}`,
    `DTEND:${dtend}`,
    `SUMMARY:${title}`,
    `DESCRIPTION:${description}`,
  ];
  
  if (location) {
    icsContent.push(`LOCATION:${location}`);
  }
  
  // Add meeting link only if user is registered
  if (isRegistered && event.meetingLink) {
    const meetingLink = escapeICSText(event.meetingLink);
    icsContent.push(`URL:${meetingLink}`);
  }
  
  icsContent.push(
    'STATUS:CONFIRMED',
    'SEQUENCE:0',
    'END:VEVENT',
    'END:VCALENDAR'
  );
  
  return icsContent.join('\r\n');
}

/**
 * Generate Google Calendar URL
 */
function generateGoogleCalendarUrl(
  event: any,
  startDate: Date,
  endDate: Date,
  isRegistered: boolean
): string {
  const formatGoogleDate = (date: Date): string => {
    return formatICSDate(date).replace(/[-:]/g, '');
  };
  
  const dates = `${formatGoogleDate(startDate)}/${formatGoogleDate(endDate)}`;
  
  // Build description with meeting link if registered
  let description = event.description || '';
  if (isRegistered && event.meetingLink) {
    description += `\n\nMeeting Link: ${event.meetingLink}`;
  }
  
  // Build Google Calendar URL
  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: event.title,
    dates: dates,
    details: description,
  });
  
  if (event.location) {
    params.append('location', event.location);
  }
  
  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

/**
 * Generate Outlook Calendar URL
 */
function generateOutlookUrl(
  event: any,
  startDate: Date,
  endDate: Date,
  isRegistered: boolean
): string {
  const startISO = startDate.toISOString();
  const endISO = endDate.toISOString();
  
  // Build description with meeting link if registered
  let description = event.description || '';
  if (isRegistered && event.meetingLink) {
    description += `\n\nMeeting Link: ${event.meetingLink}`;
  }
  
  // Build Outlook Calendar URL
  const params = new URLSearchParams({
    path: '/calendar/action/compose',
    rru: 'addevent',
    subject: event.title,
    startdt: startISO,
    enddt: endISO,
    body: description,
  });
  
  if (event.location) {
    params.append('location', event.location);
  }
  
  return `https://outlook.live.com/calendar/0/deeplink/compose?${params.toString()}`;
}

/**
 * Format date to ICS format (YYYYMMDDTHHMMSSZ)
 */
function formatICSDate(date: Date): string {
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, '0');
  const day = String(date.getUTCDate()).padStart(2, '0');
  const hours = String(date.getUTCHours()).padStart(2, '0');
  const minutes = String(date.getUTCMinutes()).padStart(2, '0');
  const seconds = String(date.getUTCSeconds()).padStart(2, '0');
  
  return `${year}${month}${day}T${hours}${minutes}${seconds}Z`;
}
