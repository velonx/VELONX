import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { EmailService } from '@/lib/services/email.service';
import { z } from 'zod';

// Validation schema
const sendEmailSchema = z.object({
    type: z.enum([
        'welcome',
        'verification',
        'resetPassword',
        'eventConfirmation',
        'eventReminder',
        'sessionConfirmation',
        'projectInvite',
        'weeklyDigest',
    ]),
    recipient: z.string().email(),
    data: z.record(z.string(), z.any()).optional(),
});

/**
 * POST /api/email/send
 * Send test emails (admin only)
 */
export async function POST(request: NextRequest) {
    try {
        const session = await auth();

        // Check if user is authenticated and is an admin
        if (!session?.user?.email) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        // In production, you should check for admin role
        // For now, only allow testing in development
        if (process.env.NODE_ENV === 'production') {
            return NextResponse.json(
                { error: 'Email sending is disabled in production via this endpoint' },
                { status: 403 }
            );
        }

        const body = await request.json();
        const { type, recipient, data = {} } = sendEmailSchema.parse(body);

        let result;

        switch (type) {
            case 'welcome':
                result = await EmailService.sendWelcomeEmail({
                    email: recipient,
                    name: (data.name as string) || 'Test User',
                });
                break;

            case 'verification':
                result = await EmailService.sendVerificationEmail(
                    {
                        email: recipient,
                        name: (data.name as string) || 'Test User',
                    },
                    (data.verificationUrl as string) ||
                    `${process.env.NEXT_PUBLIC_SITE_URL}/verify-email?token=test123`
                );
                break;

            case 'resetPassword':
                result = await EmailService.sendPasswordResetEmail(
                    {
                        email: recipient,
                        name: (data.name as string) || 'Test User',
                    },
                    (data.resetUrl as string) ||
                    `${process.env.NEXT_PUBLIC_SITE_URL}/reset-password?token=test123`
                );
                break;

            case 'eventConfirmation':
                result = await EmailService.sendEventConfirmation(
                    {
                        id: 'test',
                        email: recipient,
                        name: (data.name as string) || 'Test User',
                    },
                    {
                        title: (data.eventTitle as string) || 'Test Event',
                        description: (data.eventDescription as string) || 'This is a test event',
                        date: new Date((data.eventDate as number) || Date.now() + 86400000),
                        location: data.location as string | undefined,
                        meetingLink: data.meetingLink as string | undefined,
                    }
                );
                break;

            case 'eventReminder':
                result = await EmailService.sendEventReminder(
                    {
                        id: 'test',
                        email: recipient,
                        name: (data.name as string) || 'Test User',
                    },
                    {
                        title: (data.eventTitle as string) || 'Test Event',
                        date: new Date((data.eventDate as number) || Date.now() + 86400000),
                        location: data.location as string | undefined,
                        meetingLink: data.meetingLink as string | undefined,
                    }
                );
                break;

            case 'sessionConfirmation':
                result = await EmailService.sendSessionConfirmation(
                    {
                        id: 'test',
                        email: recipient,
                        name: (data.name as string) || 'Test User',
                    },
                    { name: (data.mentorName as string) || 'Test Mentor' },
                    {
                        date: new Date((data.sessionDate as number) || Date.now() + 86400000),
                        meetingLink: (data.meetingLink as string) || 'https://meet.google.com/test-123',
                    }
                );
                break;

            case 'projectInvite':
                result = await EmailService.sendProjectInvite(
                    {
                        id: 'test',
                        email: recipient,
                        name: (data.name as string) || 'Test User',
                    },
                    {
                        title: (data.projectTitle as string) || 'Test Project',
                        description: (data.projectDescription as string) || 'This is a test project',
                    },
                    { name: (data.inviterName as string) || 'Test Inviter' }
                );
                break;

            case 'weeklyDigest':
                result = await EmailService.sendWeeklyDigest(
                    {
                        id: 'test',
                        email: recipient,
                        name: (data.name as string) || 'Test User',
                    },
                    {
                        upcomingEvents: (data.upcomingEvents as number) || 3,
                        newProjects: (data.newProjects as number) || 5,
                        xpGained: (data.xpGained as number) || 150,
                        leaderboardPosition: (data.leaderboardPosition as number) || 42,
                    }
                );
                break;

            default:
                return NextResponse.json({ error: 'Invalid email type' }, { status: 400 });
        }

        return NextResponse.json({
            success: result.success,
            error: 'error' in result ? result.error : undefined,
        });
    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json(
                { error: 'Invalid request data', details: error.issues },
                { status: 400 }
            );
        }

        console.error('[Email Send] error:', error);
        return NextResponse.json(
            { error: 'Failed to send email' },
            { status: 500 }
        );
    }
}
