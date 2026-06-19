import { Resend } from 'resend';

// Lazy initialization of Resend client
let resend: Resend | null = null;

function getResendClient(): Resend {
    if (!resend) {
        const apiKey = process.env.RESEND_API_KEY;
        if (!apiKey) {
            throw new Error('RESEND_API_KEY environment variable is not set');
        }
        resend = new Resend(apiKey);
    }
    return resend;
}

// Email configuration
const EMAIL_FROM = process.env.EMAIL_FROM || 'VELONX <noreply@velonx.in>';
const EMAIL_REPLY_TO = process.env.EMAIL_REPLY_TO || 'support@velonx.in';

// Email service class
export class EmailService {
    /**
     * Send an email with retry logic
     */
    private static async sendWithRetry(
        to: string,
        subject: string,
        html: string,
        maxRetries = 3
    ): Promise<{ success: boolean; error?: string }> {
        for (let attempt = 1; attempt <= maxRetries; attempt++) {
            try {
                const client = getResendClient();
                const { data, error } = await client.emails.send({
                    from: EMAIL_FROM,
                    to,
                    subject,
                    html,
                    replyTo: EMAIL_REPLY_TO,
                });

                if (error) {
                    console.error(`[Email] Attempt ${attempt} failed:`, error);
                    if (attempt === maxRetries) {
                        return { success: false, error: error.message };
                    }
                    // Wait before retry (exponential backoff)
                    await new Promise((resolve) => setTimeout(resolve, Math.pow(2, attempt) * 1000));
                    continue;
                }

                console.log(`[Email] Sent successfully to ${to}:`, data?.id);
                return { success: true };
            } catch (error) {
                console.error(`[Email] Attempt ${attempt} error:`, error);
                if (attempt === maxRetries) {
                    return { success: false, error: String(error) };
                }
                await new Promise((resolve) => setTimeout(resolve, Math.pow(2, attempt) * 1000));
            }
        }

        return { success: false, error: 'Max retries exceeded' };
    }

    /**
     * Check if email notifications are enabled for user
     */
    private static async canSendEmail(
        userId: string,
        type: 'event' | 'mentor' | 'project' | 'digest'
    ): Promise<boolean> {
        try {
            const { prisma } = await import('@/lib/prisma');
            const user = await prisma.user.findUnique({
                where: { id: userId },
                select: {
                    emailNotifications: true,
                    eventReminders: true,
                    mentorNotifications: true,
                    projectNotifications: true,
                    weeklyDigest: true,
                },
            });

            if (!user || !user.emailNotifications) return false;

            switch (type) {
                case 'event':
                    return user.eventReminders ?? true;
                case 'mentor':
                    return user.mentorNotifications ?? true;
                case 'project':
                    return user.projectNotifications ?? true;
                case 'digest':
                    return user.weeklyDigest ?? true;
                default:
                    return true;
            }
        } catch (error) {
            console.error('[Email] Error checking preferences:', error);
            return true; // Default to sending if check fails
        }
    }

    /**
     * Send welcome email to new user
     */
    static async sendWelcomeEmail(user: { email: string; name: string | null }) {
        const { render } = await import('@react-email/components');
        const { WelcomeEmail } = await import('@/emails/welcome');

        const html = await render(WelcomeEmail({ userName: user.name || 'there' }));

        return this.sendWithRetry(user.email, 'Welcome to VELONX! 🚀', html);
    }

    /**
     * Send badge earned notification email
     */
    static async sendBadgeEarnedEmail(
        user: { email: string; name: string | null },
        badge: { name: string; description: string; icon?: string; xpAwarded: number }
    ) {
        const { render } = await import('@react-email/components');
        const { BadgeEarnedEmail } = await import('@/emails/badge-earned');

        const html = await render(
            BadgeEarnedEmail({
                userName: user.name || 'there',
                badgeName: badge.name,
                badgeDescription: badge.description,
                badgeIcon: badge.icon,
                xpAwarded: badge.xpAwarded,
            })
        );

        return this.sendWithRetry(
            user.email,
            `Congratulations! You earned the ${badge.name} badge! 🏆`,
            html
        );
    }

    /**
     * Send email verification
     */
    static async sendVerificationEmail(
        user: { email: string; name: string | null },
        verificationUrl: string
    ) {
        const { render } = await import('@react-email/components');
        const { VerifyEmailTemplate } = await import('@/emails/verify-email');

        const html = await render(
            VerifyEmailTemplate({
                userName: user.name || 'there',
                verificationUrl,
            })
        );

        return this.sendWithRetry(user.email, 'Verify your VELONX email', html);
    }

    /**
     * Send password reset email
     */
    static async sendPasswordResetEmail(
        user: { email: string; name: string | null },
        resetUrl: string
    ) {
        const { render } = await import('@react-email/components');
        const { ResetPasswordEmail } = await import('@/emails/reset-password');

        const html = await render(
            ResetPasswordEmail({
                userName: user.name || 'there',
                resetUrl,
            })
        );

        return this.sendWithRetry(user.email, 'Reset your VELONX password', html);
    }

    /**
     * Send event confirmation email
     */
    static async sendEventConfirmation(
        user: { id: string; email: string; name: string | null },
        event: {
            title: string;
            description: string;
            date: Date;
            location?: string | null;
            meetingLink?: string | null;
        }
    ) {
        const canSend = await this.canSendEmail(user.id, 'event');
        if (!canSend) return { success: true, skipped: true };

        const { render } = await import('@react-email/components');
        const { EventConfirmationEmail } = await import('@/emails/event-confirmation');

        const html = await render(
            EventConfirmationEmail({
                userName: user.name || 'there',
                eventTitle: event.title,
                eventDescription: event.description,
                eventDate: event.date,
                eventLocation: event.location || undefined,
                meetingLink: event.meetingLink || undefined,
            })
        );

        return this.sendWithRetry(
            user.email,
            `You're registered: ${event.title}`,
            html
        );
    }

    /**
     * Send event reminder (24 hours before)
     */
    static async sendEventReminder(
        user: { id: string; email: string; name: string | null },
        event: {
            title: string;
            date: Date;
            location?: string | null;
            meetingLink?: string | null;
        }
    ) {
        const canSend = await this.canSendEmail(user.id, 'event');
        if (!canSend) return { success: true, skipped: true };

        const { render } = await import('@react-email/components');
        const { EventReminderEmail } = await import('@/emails/event-reminder');

        const html = await render(
            EventReminderEmail({
                userName: user.name || 'there',
                eventTitle: event.title,
                eventDate: event.date,
                eventLocation: event.location || undefined,
                meetingLink: event.meetingLink || undefined,
            })
        );

        return this.sendWithRetry(
            user.email,
            `Reminder: ${event.title} starts tomorrow!`,
            html
        );
    }

    /**
     * Send mentor session confirmation
     */
    static async sendSessionConfirmation(
        user: { id: string; email: string; name: string | null },
        mentor: { name: string | null },
        session: { date: Date; meetingLink: string }
    ) {
        const canSend = await this.canSendEmail(user.id, 'mentor');
        if (!canSend) return { success: true, skipped: true };

        const { render } = await import('@react-email/components');
        const { SessionConfirmationEmail } = await import('@/emails/session-confirmation');

        const html = await render(
            SessionConfirmationEmail({
                userName: user.name || 'there',
                mentorName: mentor.name || 'your mentor',
                sessionDate: session.date,
                meetingLink: session.meetingLink,
            })
        );

        return this.sendWithRetry(
            user.email,
            `Session confirmed with ${mentor.name || 'your mentor'}`,
            html
        );
    }

    /**
     * Send project collaboration invite
     */
    static async sendProjectInvite(
        invitee: { id: string; email: string; name: string | null },
        project: { title: string; description: string },
        inviter: { name: string | null }
    ) {
        const canSend = await this.canSendEmail(invitee.id, 'project');
        if (!canSend) return { success: true, skipped: true };

        const { render } = await import('@react-email/components');
        const { ProjectInviteEmail } = await import('@/emails/project-invite');

        const html = await render(
            ProjectInviteEmail({
                inviteeName: invitee.name || 'there',
                inviterName: inviter.name || 'A team member',
                projectTitle: project.title,
                projectDescription: project.description,
            })
        );

        return this.sendWithRetry(
            invitee.email,
            `You've been invited to collaborate on ${project.title}`,
            html
        );
    }

    /**
     * Send weekly digest
     */
    static async sendWeeklyDigest(
        user: { id: string; email: string; name: string | null },
        stats: {
            upcomingEvents: number;
            newProjects: number;
            xpGained: number;
            leaderboardPosition: number;
        }
    ) {
        const canSend = await this.canSendEmail(user.id, 'digest');
        if (!canSend) return { success: true, skipped: true };

        const { render } = await import('@react-email/components');
        const { WeeklyDigestEmail } = await import('@/emails/weekly-digest');

        const html = await render(
            WeeklyDigestEmail({
                userName: user.name || 'there',
                ...stats,
            })
        );

        return this.sendWithRetry(user.email, 'Your VELONX week in review', html);
    }

    /**
     * Send instant job / internship alert
     */
    static async sendJobAlert(
        user: { id: string; email: string; name: string | null },
        opportunity: {
            opportunityId: string;
            slug?: string;
            title: string;
            company: string;
            location: string;
            type: 'JOB' | 'INTERNSHIP';
            applyUrl: string;
            salary?: string;
        }
    ) {
        const canSend = await this.canSendEmail(user.id, 'digest'); // reuses global pref; fine-grained check done by EmailPreferenceService
        if (!canSend) return { success: true, skipped: true };

        const { render } = await import('@react-email/components');
        const { JobAlertEmail } = await import('@/emails/job-alert');

        const html = await render(
            JobAlertEmail({
                userName: user.name || 'there',
                ...opportunity,
            })
        );

        const label = opportunity.type === 'INTERNSHIP' ? 'Internship' : 'Job';
        return this.sendWithRetry(
            user.email,
            `New ${label}: ${opportunity.title} at ${opportunity.company}`,
            html
        );
    }

    /**
     * Send new event announcement email
     */
    static async sendEventAnnouncement(
        user: { id: string; email: string; name: string | null },
        event: {
            eventId: string;
            title: string;
            description: string;
            date: Date;
            location?: string;
            meetingLink?: string;
            type: string;
        }
    ) {
        const canSend = await this.canSendEmail(user.id, 'event');
        if (!canSend) return { success: true, skipped: true };

        const { render } = await import('@react-email/components');
        const { EventAnnouncedEmail } = await import('@/emails/event-announced');

        const html = await render(
            EventAnnouncedEmail({
                userName: user.name || 'there',
                eventTitle: event.title,
                eventDescription: event.description,
                eventDate: event.date,
                eventType: event.type,
                location: event.location,
                meetingLink: event.meetingLink,
                eventId: event.eventId,
            })
        );

        return this.sendWithRetry(user.email, `New Event: ${event.title}`, html);
    }

    /**
     * Send post comment alert (instant)
     */
    static async sendPostCommentAlert(
        user: { id: string; email: string; name: string | null },
        commentData: {
            postId: string;
            commenterName: string;
            postExcerpt: string;
            commentExcerpt: string;
        }
    ) {
        const canSend = await this.canSendEmail(user.id, 'digest');
        if (!canSend) return { success: true, skipped: true };

        const { render } = await import('@react-email/components');
        const { PostCommentAlertEmail } = await import('@/emails/post-comment-alert');
        const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://velonx.in';

        const html = await render(
            PostCommentAlertEmail({
                userName: user.name || 'there',
                commenterName: commentData.commenterName,
                postExcerpt: commentData.postExcerpt,
                commentExcerpt: commentData.commentExcerpt,
                postUrl: `${SITE_URL}/community/posts/${commentData.postId}`,
            })
        );

        return this.sendWithRetry(
            user.email,
            `${commentData.commenterName} commented on your post`,
            html
        );
    }

    /**
     * Send swag announcement email
     */
    static async sendSwagAnnouncement(
        user: { id: string; email: string; name: string | null },
        swag: {
            swagId: string;
            name: string;
            description: string;
            imageUrl?: string;
        }
    ) {
        const canSend = await this.canSendEmail(user.id, 'digest');
        if (!canSend) return { success: true, skipped: true };

        // Reuses the event announcement template with swag-specific copy (dedicated template can be added later)
        const { render } = await import('@react-email/components');
        const { EventAnnouncedEmail } = await import('@/emails/event-announced');

        const html = await render(
            EventAnnouncedEmail({
                userName: user.name || 'there',
                eventTitle: `🎽 Swag Drop: ${swag.name}`,
                eventDescription: swag.description,
                eventDate: new Date(),
                eventType: 'WEBINAR',
                eventId: swag.swagId,
            })
        );

        return this.sendWithRetry(user.email, `Swag Drop: ${swag.name} is now available!`, html);
    }

    /**
     * Send combined daily or weekly digest
     */
    static async sendDigestEmail(
        user: { id: string; email: string; name: string | null },
        digestData: {
            frequency: 'DAILY' | 'WEEKLY';
            periodLabel: string;
            events?: Array<{ id: string; title: string; date: Date; location?: string }>;
            projects?: Array<{ id: string; title: string; status: string }>;
            resources?: Array<{ id: string; title: string; category: string; type: string }>;
            blogPosts?: Array<{ id: string; title: string; excerpt?: string; slug?: string }>;
            swagItems?: Array<{ id: string; name: string }>;
        }
    ) {
        const canSend = await this.canSendEmail(user.id, 'digest');
        if (!canSend) return { success: true, skipped: true };

        const { render } = await import('@react-email/components');
        const { DigestEmail } = await import('@/emails/digest');

        const html = await render(
            DigestEmail({
                userName: user.name || 'there',
                ...digestData,
            })
        );

        const label = digestData.frequency === 'DAILY' ? 'Daily' : 'Weekly';
        return this.sendWithRetry(
            user.email,
            `Your VELONX ${label} Digest — ${digestData.periodLabel}`,
            html
        );
    }
}
