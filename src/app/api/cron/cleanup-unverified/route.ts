import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
    try {
        // Verify Cron Secret to prevent unauthorized access
        const authHeader = request.headers.get('authorization');

        // Fail closed: if CRON_SECRET is not set, or auth header does not match, return 401
        if (!process.env.CRON_SECRET || authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
            return new NextResponse('Unauthorized', { status: 401 });
        }

        const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

        // Find unverified users older than 24 hours
        const unverifiedUsers = await prisma.user.findMany({
            where: {
                emailVerified: null,
                createdAt: {
                    lt: twentyFourHoursAgo,
                },
                role: 'STUDENT', // Only delete students, do not delete unverified admin accounts
                accounts: {
                    none: {}, // Only delete credentials users, skip Google/GitHub users
                },
            },
            select: {
                id: true,
                email: true,
            },
        });

        if (unverifiedUsers.length === 0) {
            return NextResponse.json({
                success: true,
                message: 'No unverified users to clean up.',
                deletedCount: 0,
            });
        }

        const emails = unverifiedUsers.map((u) => u.email);
        const userIds = unverifiedUsers.map((u) => u.id);

        // Delete associated verification tokens and users in a transaction
        const [deletedTokens, deletedUsers] = await prisma.$transaction([
            prisma.verificationToken.deleteMany({
                where: {
                    identifier: { in: emails },
                },
            }),
            prisma.user.deleteMany({
                where: {
                    id: { in: userIds },
                },
            }),
        ]);

        return NextResponse.json({
            success: true,
            message: `Cleaned up ${deletedUsers.count} unverified users.`,
            deletedCount: deletedUsers.count,
        });
    } catch (error) {
        console.error('[CRON_CLEANUP_UNVERIFIED]', error);
        return new NextResponse('Internal Server Error', { status: 500 });
    }
}
