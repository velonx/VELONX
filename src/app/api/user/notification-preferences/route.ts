/**
 * GET  /api/user/notification-preferences  — return all 7 preferences for the authed user
 * PATCH /api/user/notification-preferences  — update one or more preferences
 */

import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { EmailPreferenceService } from '@/lib/services/email-preference.service';
import {
    EmailNotificationCategory,
    EmailNotificationFrequency,
} from '@/lib/prisma-enums';


const VALID_CATEGORIES = Object.values(EmailNotificationCategory) as string[];
const VALID_FREQUENCIES = Object.values(EmailNotificationFrequency) as string[];

// ── GET ────────────────────────────────────────────────────────────────────

export async function GET() {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const preferences = await EmailPreferenceService.getAllPreferences(session.user.id);

        return NextResponse.json({ preferences });
    } catch (error) {
        console.error('[API/notification-preferences GET]', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

// ── PATCH ──────────────────────────────────────────────────────────────────

/**
 * Body: Array of { category, frequency } objects
 * Example:
 *   [{ category: "JOB_POSTED", frequency: "INSTANT" }, { category: "BLOG_POST_PUBLISHED", frequency: "OFF" }]
 */
export async function PATCH(request: Request) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        let body: unknown;
        try {
            body = await request.json();
        } catch {
            return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
        }

        if (!Array.isArray(body) || body.length === 0) {
            return NextResponse.json(
                { error: 'Body must be a non-empty array of { category, frequency } objects' },
                { status: 400 }
            );
        }

        // Validate each item
        const updates: Array<{
            category: EmailNotificationCategory;
            frequency: EmailNotificationFrequency;
        }> = [];

        for (const item of body) {
            if (typeof item !== 'object' || item === null) {
                return NextResponse.json({ error: 'Each item must be an object' }, { status: 400 });
            }

            const { category, frequency } = item as Record<string, unknown>;

            if (typeof category !== 'string' || !VALID_CATEGORIES.includes(category)) {
                return NextResponse.json(
                    {
                        error: `Invalid category "${category}". Must be one of: ${VALID_CATEGORIES.join(', ')}`,
                    },
                    { status: 400 }
                );
            }

            if (typeof frequency !== 'string' || !VALID_FREQUENCIES.includes(frequency)) {
                return NextResponse.json(
                    {
                        error: `Invalid frequency "${frequency}". Must be one of: ${VALID_FREQUENCIES.join(', ')}`,
                    },
                    { status: 400 }
                );
            }

            updates.push({
                category: category as EmailNotificationCategory,
                frequency: frequency as EmailNotificationFrequency,
            });
        }

        // Apply all updates
        await Promise.all(
            updates.map(({ category, frequency }) =>
                EmailPreferenceService.setFrequency(session.user.id!, category, frequency)
            )
        );

        // Return updated state
        const preferences = await EmailPreferenceService.getAllPreferences(session.user.id!);

        return NextResponse.json({ preferences, updated: updates.length });
    } catch (error) {
        console.error('[API/notification-preferences PATCH]', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
