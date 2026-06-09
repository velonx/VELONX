import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { EmailService } from '@/lib/services/email.service';

export async function GET(request: Request) {
    try {
        // Verify Cron Secret to prevent unauthorized access
        const authHeader = request.headers.get('authorization');

        // Fail closed: if CRON_SECRET is not set, or auth header does not match, return 401
        if (!process.env.CRON_SECRET || authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
            return new NextResponse('Unauthorized', { status: 401 });
        }

        const now = new Date();
        // The cron runs every hour. Look for events starting exactly between 23 and 24 hours from now
        // to prevent duplicate sends.
        const tomorrowMin = new Date(now.getTime() + 23 * 60 * 60 * 1000);
        const tomorrowMax = new Date(now.getTime() + 24 * 60 * 60 * 1000);

        const upcomingEvents = await prisma.event.findMany({
            where: {
                status: 'UPCOMING',
                date: {
                    gte: tomorrowMin,
                    lt: tomorrowMax,
                },
            },
            include: {
                attendees: {
                    where: {
                        status: 'REGISTERED',
                    },
                    include: {
                        user: {
                            select: {
                                id: true,
                                email: true,
                                name: true,
                                eventReminders: true,
                                emailNotifications: true,
                            },
                        },
                    },
                },
            },
        });

        let totalRemindersSent = 0;
        let totalErrors = 0;

        for (const event of upcomingEvents) {
            for (const attendee of event.attendees) {
                const user = attendee.user;

                // Check preferences
                if (user.emailNotifications !== false && user.eventReminders !== false) {
                    try {
                        const result = await EmailService.sendEventReminder(user, {
                            title: event.title,
                            date: event.date,
                            location: event.location,
                            meetingLink: event.meetingLink,
                        });

                        const isSkipped = 'skipped' in result && result.skipped === true;

                        if (result.success && !isSkipped) {
                            totalRemindersSent++;
                        }
                    } catch (err) {
                        console.error(`Failed to send reminder for event ${event.id} to user ${user.id}`, err);
                        totalErrors++;
                    }
                }
            }
        }

        return NextResponse.json({
            success: true,
            message: `Processed ${upcomingEvents.length} upcoming events.`,
            stats: {
                eventsFound: upcomingEvents.length,
                remindersSent: totalRemindersSent,
                errors: totalErrors,
            },
        });
    } catch (error) {
        console.error('[CRON_EVENT_REMINDERS]', error);
        return new NextResponse('Internal Server Error', { status: 500 });
    }
}
