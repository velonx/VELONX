import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import crypto from 'crypto';
import { EmailPreferenceService } from '@/lib/services/email-preference.service';
import {
    EmailNotificationCategory,
    EmailNotificationFrequency,
} from '@/lib/prisma-enums';


// Force dynamic rendering - skip pre-rendering during build
export const dynamic = 'force-dynamic';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://velonx.in';
const VALID_CATEGORIES = Object.values(EmailNotificationCategory) as string[];

/**
 * GET /api/email/unsubscribe?token=xxx[&category=CATEGORY]
 *
 * - Without `category` (or category=all): disables ALL email notifications (original behavior)
 * - With a specific category: sets that category's frequency to OFF via EmailPreferenceService
 */
export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const token = searchParams.get('token');
        const category = searchParams.get('category') ?? 'all';

        if (!token) {
            return errorHtml('Missing unsubscribe token.', 400);
        }

        // Find user by unsubscribe token
        const user = await prisma.user.findFirst({
            where: { unsubscribeToken: token },
            select: { id: true, email: true, name: true },
        });

        if (!user) {
            return errorHtml('Invalid or expired unsubscribe link.', 404);
        }

        let categoryLabel: string;

        if (category === 'all' || !VALID_CATEGORIES.includes(category)) {
            // Disable all email notifications (original behavior)
            await prisma.user.update({
                where: { id: user.id },
                data: {
                    emailNotifications: false,
                    eventReminders: false,
                    mentorNotifications: false,
                    projectNotifications: false,
                    weeklyDigest: false,
                },
            });
            // Also turn off all per-category preferences
            await Promise.all(
                Object.values(EmailNotificationCategory).map((cat) =>
                    EmailPreferenceService.setFrequency(
                        user.id,
                        cat,
                        EmailNotificationFrequency.OFF
                    )
                )
            );
            categoryLabel = 'all VELONX email notifications';
        } else {
            // Turn off just the specified category
            await EmailPreferenceService.setFrequency(
                user.id,
                category as EmailNotificationCategory,
                EmailNotificationFrequency.OFF
            );
            categoryLabel = `"${category.replace(/_/g, ' ').toLowerCase()}" emails`;
        }

        return new NextResponse(
            `<!DOCTYPE html>
<html>
  <head>
    <title>Unsubscribed - VELONX</title>
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <style>
      body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; display: flex; align-items: center; justify-content: center; min-height: 100vh; margin: 0; background: linear-gradient(135deg, #226CE0 0%, #1A234A 100%); }
      .container { background: white; padding: 48px; border-radius: 16px; text-align: center; max-width: 500px; margin: 20px; box-shadow: 0 20px 60px rgba(0,0,0,0.3); }
      h1 { color: #1A234A; margin: 0 0 16px; font-size: 32px; }
      p { color: #374151; line-height: 1.6; margin: 0 0 24px; }
      a { display: inline-block; background: #226CE0; color: white; padding: 12px 32px; border-radius: 8px; text-decoration: none; font-weight: bold; }
      a:hover { background: #1A234A; }
    </style>
  </head>
  <body>
    <div class="container">
      <h1>✓ Unsubscribed</h1>
      <p>You've been unsubscribed from ${categoryLabel}.</p>
      <p>You can update your preferences anytime from your account settings.</p>
      <a href="${SITE_URL}/settings/notifications">Manage Preferences</a>
    </div>
  </body>
</html>`,
            { status: 200, headers: { 'Content-Type': 'text/html' } }
        );
    } catch (error) {
        console.error('[Email Unsubscribe] error:', error);
        return NextResponse.json({ error: 'Failed to unsubscribe' }, { status: 500 });
    }
}

function errorHtml(message: string, status: number) {
    return new NextResponse(
        `<!DOCTYPE html>
<html>
  <head><title>Error - VELONX</title></head>
  <body style="font-family:sans-serif;display:flex;align-items:center;justify-content:center;min-height:100vh;background:#f6f9fc">
    <div style="background:#fff;padding:48px;border-radius:16px;text-align:center;max-width:480px">
      <h1 style="color:#1A234A">⚠️ Error</h1>
      <p style="color:#6B7280">${message}</p>
      <a href="${SITE_URL}/settings/notifications" style="display:inline-block;background:#226CE0;color:#fff;padding:12px 32px;border-radius:8px;text-decoration:none;font-weight:bold">Manage Preferences</a>
    </div>
  </body>
</html>`,
        { status, headers: { 'Content-Type': 'text/html' } }
    );
}



/**
 * POST /api/email/unsubscribe
 * Generate unsubscribe token for user
 */
export async function POST(request: NextRequest) {
    try {
        const { email } = await request.json();

        if (!email) {
            return NextResponse.json(
                { error: 'Email is required' },
                { status: 400 }
            );
        }

        const user = await prisma.user.findUnique({
            where: { email },
            select: { id: true, unsubscribeToken: true },
        });

        if (!user) {
            return NextResponse.json(
                { error: 'User not found' },
                { status: 404 }
            );
        }

        // Generate token if it doesn't exist
        let token = user.unsubscribeToken;
        if (!token) {
            token = crypto.randomBytes(32).toString('hex');
            await prisma.user.update({
                where: { id: user.id },
                data: { unsubscribeToken: token },
            });
        }

        const unsubscribeUrl = `${process.env.NEXT_PUBLIC_SITE_URL || 'https://velonx.in'}/api/email/unsubscribe?token=${token}`;

        return NextResponse.json({
            success: true,
            unsubscribeUrl,
        });
    } catch (error) {
        console.error('[Email Unsubscribe] POST error:', error);
        return NextResponse.json(
            { error: 'Failed to generate unsubscribe link' },
            { status: 500 }
        );
    }
}
