import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

// Validation schema
const preferencesSchema = z.object({
    emailNotifications: z.boolean().optional(),
    eventReminders: z.boolean().optional(),
    mentorNotifications: z.boolean().optional(),
    projectNotifications: z.boolean().optional(),
    weeklyDigest: z.boolean().optional(),
});

/**
 * GET /api/email/preferences
 * Get current user's email preferences
 */
export async function GET() {
    try {
        const session = await auth();

        if (!session?.user?.email) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const user = await prisma.user.findUnique({
            where: { email: session.user.email },
            select: {
                emailNotifications: true,
                eventReminders: true,
                mentorNotifications: true,
                projectNotifications: true,
                weeklyDigest: true,
            },
        });

        if (!user) {
            return NextResponse.json(
                { error: 'User not found' },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            preferences: user,
        });
    } catch (error) {
        console.error('[Email Preferences] GET error:', error);
        return NextResponse.json(
            { error: 'Failed to fetch preferences' },
            { status: 500 }
        );
    }
}

/**
 * PATCH /api/email/preferences
 * Update user's email preferences
 */
export async function PATCH(request: NextRequest) {
    try {
        const session = await auth();

        if (!session?.user?.email) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const body = await request.json();
        const validatedData = preferencesSchema.parse(body);

        const updatedUser = await prisma.user.update({
            where: { email: session.user.email },
            data: validatedData,
            select: {
                emailNotifications: true,
                eventReminders: true,
                mentorNotifications: true,
                projectNotifications: true,
                weeklyDigest: true,
            },
        });

        return NextResponse.json({
            success: true,
            preferences: updatedUser,
        });
    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json(
                { error: 'Invalid preferences data', details: error.issues },
                { status: 400 }
            );
        }

        console.error('[Email Preferences] PATCH error:', error);
        return NextResponse.json(
            { error: 'Failed to update preferences' },
            { status: 500 }
        );
    }
}
