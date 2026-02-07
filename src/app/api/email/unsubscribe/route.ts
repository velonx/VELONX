import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import crypto from 'crypto';

/**
 * GET /api/email/unsubscribe?token=xxx
 * Unsubscribe user from all emails
 */
export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const token = searchParams.get('token');

        if (!token) {
            return NextResponse.json(
                { error: 'Missing unsubscribe token' },
                { status: 400 }
            );
        }

        // Find user by unsubscribe token
        const user = await prisma.user.findFirst({
            where: { unsubscribeToken: token },
            select: { id: true, email: true, name: true },
        });

        if (!user) {
            return NextResponse.json(
                { error: 'Invalid unsubscribe token' },
                { status: 404 }
            );
        }

        // Disable all email notifications
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

        // Return a simple HTML page
        return new NextResponse(
            `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Unsubscribed - VELONX</title>
          <meta name="viewport" content="width=device-width, initial-scale=1">
          <style>
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
              display: flex;
              align-items: center;
              justify-content: center;
              min-height: 100vh;
              margin: 0;
              background: linear-gradient(135deg, #219EBC 0%, #023047 100%);
            }
            .container {
              background: white;
              padding: 48px;
              border-radius: 16px;
              text-align: center;
              max-width: 500px;
              margin: 20px;
              box-shadow: 0 20px 60px rgba(0,0,0,0.3);
            }
            h1 {
              color: #023047;
              margin: 0 0 16px;
              font-size: 32px;
            }
            p {
              color: #374151;
              line-height: 1.6;
              margin: 0 0 24px;
            }
            a {
              display: inline-block;
              background: #219EBC;
              color: white;
              padding: 12px 32px;
              border-radius: 8px;
              text-decoration: none;
              font-weight: bold;
              transition: background 0.2s;
            }
            a:hover {
              background: #023047;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <h1>✓ Unsubscribed</h1>
            <p>You've been unsubscribed from all VELONX emails.</p>
            <p>You can update your preferences anytime from your account settings.</p>
            <a href="${process.env.NEXT_PUBLIC_SITE_URL || 'https://velonx.com'}/settings/notifications">
              Manage Preferences
            </a>
          </div>
        </body>
      </html>
      `,
            {
                status: 200,
                headers: { 'Content-Type': 'text/html' },
            }
        );
    } catch (error) {
        console.error('[Email Unsubscribe] error:', error);
        return NextResponse.json(
            { error: 'Failed to unsubscribe' },
            { status: 500 }
        );
    }
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

        const unsubscribeUrl = `${process.env.NEXT_PUBLIC_SITE_URL || 'https://velonx.com'}/api/email/unsubscribe?token=${token}`;

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
