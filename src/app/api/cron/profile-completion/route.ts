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

        // Find students whose profiles are not complete and who opted in to email notifications
        const incompleteStudents = await prisma.user.findMany({
            where: {
                role: 'STUDENT',
                profileComplete: false,
                emailNotifications: true,
                email: { not: '' },
            },
            select: {
                id: true,
                email: true,
                name: true,
            },
        });

        if (incompleteStudents.length === 0) {
            return NextResponse.json({
                success: true,
                message: 'No student users with incomplete profiles to notify.',
                stats: { emailsSent: 0, errors: 0 },
            });
        }

        let emailsSent = 0;
        let errors = 0;

        for (const user of incompleteStudents) {
            try {
                const result = await EmailService.sendProfileCompletionEmail(user);
                if (result.success) {
                    emailsSent++;
                } else {
                    errors++;
                    console.error(`[CRON_PROFILE_COMPLETION] Failed to send email to ${user.email}:`, result.error);
                }
            } catch (err) {
                console.error(`[CRON_PROFILE_COMPLETION] Error sending email to ${user.email}:`, err);
                errors++;
            }
        }

        return NextResponse.json({
            success: true,
            message: `Processed profile completion reminders.`,
            stats: {
                totalRecipients: incompleteStudents.length,
                emailsSent,
                errors,
            },
        });
    } catch (error) {
        console.error('[CRON_PROFILE_COMPLETION]', error);
        return new NextResponse('Internal Server Error', { status: 500 });
    }
}
