/**
 * Digest Email Cron
 *
 * Runs on a schedule (e.g. daily at 07:00 and weekly on Mondays at 08:00).
 * Collects content published during the digest window and sends a combined
 * email to each opted-in user.
 *
 * Trigger manually for testing:
 *   GET /api/cron/digest-email?frequency=DAILY
 *   GET /api/cron/digest-email?frequency=WEEKLY
 *
 * Protected by CRON_SECRET.
 */

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { EmailService } from '@/lib/services/email.service';
import { EmailPreferenceService } from '@/lib/services/email-preference.service';
import { EmailNotificationCategory, EmailNotificationFrequency } from '@/lib/prisma-enums';


export async function GET(request: Request) {
    try {
        // ── Auth ──────────────────────────────────────────────────────────────
        const authHeader = request.headers.get('authorization');
        if (!process.env.CRON_SECRET || authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
            return new NextResponse('Unauthorized', { status: 401 });
        }

        // ── Determine frequency ───────────────────────────────────────────────
        const url = new URL(request.url);
        const freqParam = url.searchParams.get('frequency')?.toUpperCase();
        const frequency: 'DAILY' | 'WEEKLY' =
            freqParam === 'WEEKLY' ? 'WEEKLY' : 'DAILY';

        const now = new Date();
        // Window: past 24 h for daily, past 7 days for weekly
        const windowMs = frequency === 'DAILY' ? 24 * 60 * 60 * 1000 : 7 * 24 * 60 * 60 * 1000;
        const windowStart = new Date(now.getTime() - windowMs);

        const periodLabel =
            frequency === 'DAILY'
                ? `Today, ${now.toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}`
                : `This Week (${windowStart.toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                  })} – ${now.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })})`;

        // ── Fetch content published in the window ─────────────────────────────
        const [events, projects, resources, blogPosts] = await Promise.all([
            prisma.event.findMany({
                where: { createdAt: { gte: windowStart }, status: 'UPCOMING' },
                select: { id: true, title: true, date: true, location: true },
                orderBy: { date: 'asc' },
                take: 10,
            }).then((rows) => rows.map((e) => ({ ...e, location: e.location ?? undefined }))),
            prisma.project.findMany({
                where: { updatedAt: { gte: windowStart } },
                select: { id: true, title: true, status: true },
                orderBy: { updatedAt: 'desc' },
                take: 10,
            }),
            prisma.resource.findMany({
                where: { createdAt: { gte: windowStart } },
                select: { id: true, title: true, category: true, type: true },
                orderBy: { createdAt: 'desc' },
                take: 10,
            }),
            prisma.blogPost.findMany({
                where: { createdAt: { gte: windowStart }, status: 'PUBLISHED' },
                select: { id: true, title: true, excerpt: true, slug: true },
                orderBy: { createdAt: 'desc' },
                take: 10,
            }).then((rows) => rows.map((p) => ({
                ...p,
                excerpt: p.excerpt ?? undefined,
                slug: p.slug ?? undefined,
            }))),
        ]);

        // Swag: using raw query since SwagItem may have a different schema
        // Placeholder — replace `swagItems` below with actual Prisma query once the Swag model is confirmed
        const swagItems: Array<{ id: string; name: string }> = [];

        // ── Get recipients ───────────────────────────────────────────────────
        const recipientIds = await EmailPreferenceService.getDigestRecipients(frequency);

        if (!recipientIds.length) {
            return NextResponse.json({
                success: true,
                message: 'No recipients for this frequency.',
                frequency,
                stats: { emailsSent: 0, skipped: 0, errors: 0 },
            });
        }

        const users = await prisma.user.findMany({
            where: { id: { in: recipientIds }, emailNotifications: true, email: { not: '' } },
            select: { id: true, email: true, name: true },
        });

        let emailsSent = 0;
        let skipped = 0;
        let errors = 0;

        // ── Per-user digest send ─────────────────────────────────────────────
        for (const user of users) {
            try {
                // Determine which categories the user subscribes to at this frequency
                const [
                    wantsEvents,
                    wantsProjects,
                    wantsResources,
                    wantsBlog,
                    wantsSwag,
                ] = await Promise.all([
                    EmailPreferenceService.getFrequency(user.id, EmailNotificationCategory.EVENT_POSTED),
                    EmailPreferenceService.getFrequency(user.id, EmailNotificationCategory.PROJECT_UPDATED),
                    EmailPreferenceService.getFrequency(user.id, EmailNotificationCategory.RESOURCE_ADDED),
                    EmailPreferenceService.getFrequency(user.id, EmailNotificationCategory.BLOG_POST_PUBLISHED),
                    EmailPreferenceService.getFrequency(user.id, EmailNotificationCategory.SWAG_ANNOUNCED),
                ]);

                const targetFreq = EmailNotificationFrequency[frequency];

                const userDigest = {
                    frequency,
                    periodLabel,
                    events: wantsEvents === targetFreq ? events : [],
                    projects: wantsProjects === targetFreq ? projects : [],
                    resources: wantsResources === targetFreq ? resources : [],
                    blogPosts: wantsBlog === targetFreq ? blogPosts : [],
                    swagItems: wantsSwag === targetFreq ? swagItems : [],
                };

                // Skip if no sections have content
                const hasContent =
                    userDigest.events.length > 0 ||
                    userDigest.projects.length > 0 ||
                    userDigest.resources.length > 0 ||
                    userDigest.blogPosts.length > 0 ||
                    userDigest.swagItems.length > 0;

                if (!hasContent) {
                    skipped++;
                    continue;
                }

                const result = await EmailService.sendDigestEmail(user, userDigest);
                const wasSkipped = 'skipped' in result && result.skipped === true;
                if (result.success && !wasSkipped) {
                    emailsSent++;
                } else {
                    skipped++;
                }
            } catch (err) {
                console.error(`[Digest Cron] Failed to send digest to user ${user.id}:`, err);
                errors++;
            }
        }

        return NextResponse.json({
            success: true,
            frequency,
            periodLabel,
            stats: {
                recipientsFound: users.length,
                emailsSent,
                skipped,
                errors,
            },
        });
    } catch (error) {
        console.error('[CRON_DIGEST_EMAIL]', error);
        return new NextResponse('Internal Server Error', { status: 500 });
    }
}
