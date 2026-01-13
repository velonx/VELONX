// Calendar utility functions for events page

export interface ScheduledMeeting {
    id: string;
    title: string;
    description: string;
    date: Date;
    time: string;
    timezone: string;
    meetingLink: string;
    platform: 'google-meet' | 'zoom' | 'teams' | 'discord';
    type: 'workshop' | 'hackathon' | 'networking' | 'webinar';
    status: 'upcoming' | 'ongoing' | 'completed';
    maxAttendees: number;
    currentAttendees: number;
    createdBy: string;
}

export interface CalendarDay {
    date: Date;
    isCurrentMonth: boolean;
    isToday: boolean;
    hasEvents: boolean;
    eventCount: number;
}

/**
 * Get calendar days for a given month
 */
export function getCalendarDays(year: number, month: number): CalendarDay[] {
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startingDayOfWeek = firstDay.getDay(); // 0 = Sunday
    const daysInMonth = lastDay.getDate();

    const days: CalendarDay[] = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Add previous month's days
    const prevMonthLastDay = new Date(year, month, 0).getDate();
    for (let i = startingDayOfWeek - 1; i >= 0; i--) {
        const date = new Date(year, month - 1, prevMonthLastDay - i);
        days.push({
            date,
            isCurrentMonth: false,
            isToday: false,
            hasEvents: false,
            eventCount: 0,
        });
    }

    // Add current month's days
    for (let day = 1; day <= daysInMonth; day++) {
        const date = new Date(year, month, day);
        const isToday = date.getTime() === today.getTime();
        days.push({
            date,
            isCurrentMonth: true,
            isToday,
            hasEvents: false,
            eventCount: 0,
        });
    }

    // Add next month's days to complete the grid (42 days = 6 weeks)
    const remainingDays = 42 - days.length;
    for (let day = 1; day <= remainingDays; day++) {
        const date = new Date(year, month + 1, day);
        days.push({
            date,
            isCurrentMonth: false,
            isToday: false,
            hasEvents: false,
            eventCount: 0,
        });
    }

    return days;
}

/**
 * Mark calendar days that have events
 */
export function markEventsOnCalendar(
    calendarDays: CalendarDay[],
    meetings: ScheduledMeeting[]
): CalendarDay[] {
    return calendarDays.map(day => {
        const dayStart = new Date(day.date);
        dayStart.setHours(0, 0, 0, 0);
        const dayEnd = new Date(day.date);
        dayEnd.setHours(23, 59, 59, 999);

        const eventsOnDay = meetings.filter(meeting => {
            const meetingDate = new Date(meeting.date);
            return meetingDate >= dayStart && meetingDate <= dayEnd;
        });

        return {
            ...day,
            hasEvents: eventsOnDay.length > 0,
            eventCount: eventsOnDay.length,
        };
    });
}

/**
 * Get meetings for a specific date
 */
export function getMeetingsForDate(
    date: Date,
    meetings: ScheduledMeeting[]
): ScheduledMeeting[] {
    const dayStart = new Date(date);
    dayStart.setHours(0, 0, 0, 0);
    const dayEnd = new Date(date);
    dayEnd.setHours(23, 59, 59, 999);

    return meetings
        .filter(meeting => {
            const meetingDate = new Date(meeting.date);
            return meetingDate >= dayStart && meetingDate <= dayEnd;
        })
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
}

/**
 * Format time with timezone
 */
export function formatMeetingTime(time: string, timezone: string): string {
    return `${time} (${timezone})`;
}

/**
 * Get platform icon name
 */
export function getPlatformIcon(platform: ScheduledMeeting['platform']): string {
    const icons = {
        'google-meet': '🎥',
        'zoom': '📹',
        'teams': '👥',
        'discord': '💬',
    };
    return icons[platform] || '🔗';
}

/**
 * Get status color
 */
export function getStatusColor(status: ScheduledMeeting['status']): string {
    const colors = {
        upcoming: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/30',
        ongoing: 'text-green-400 bg-green-500/10 border-green-500/30',
        completed: 'text-gray-400 bg-gray-500/10 border-gray-500/30',
    };
    return colors[status] || colors.upcoming;
}

/**
 * Check if date is in the past
 */
export function isPastDate(date: Date): boolean {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const checkDate = new Date(date);
    checkDate.setHours(0, 0, 0, 0);
    return checkDate < today;
}

/**
 * Get month name
 */
export function getMonthName(month: number): string {
    const months = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
    ];
    return months[month];
}
