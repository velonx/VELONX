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

        // 1. Fetch all users who have notifications enabled
        const users = await prisma.user.findMany({
            where: {
                emailNotifications: true,
                projectNotifications: true,
                email: { not: '' },
            },
            select: {
                id: true,
                email: true,
                name: true,
                skills: true,
            },
        });

        // Filter users with at least one skill in TS
        const usersWithSkills = users.filter(u => u.skills && u.skills.length > 0);

        if (usersWithSkills.length === 0) {
            return NextResponse.json({
                success: true,
                message: 'No users with skills defined to notify.',
                stats: { emailsSent: 0, errors: 0, totalMatches: 0 },
            });
        }

        // 2. Fetch all active projects
        const activeProjects = await prisma.project.findMany({
            where: {
                status: { in: ['PLANNING', 'IN_PROGRESS'] },
            },
            select: {
                id: true,
                title: true,
                description: true,
                techStack: true,
                ownerId: true,
                members: {
                    select: {
                        userId: true,
                    },
                },
            },
        });

        // Filter projects with at least one tech stack item
        const eligibleProjects = activeProjects.filter(p => p.techStack && p.techStack.length > 0);

        if (eligibleProjects.length === 0) {
            return NextResponse.json({
                success: true,
                message: 'No active projects with tech stack defined.',
                stats: { emailsSent: 0, errors: 0, totalMatches: 0 },
            });
        }

        // 3. Fetch past recommendations to prevent double-notifying
        const pastNotifications = await prisma.notification.findMany({
            where: {
                title: 'Project Match Found',
            },
            select: {
                userId: true,
                metadata: true,
            },
        });

        // Build a map of userId -> Set of already recommended projectIds
        const alreadyRecommendedMap = new Map<string, Set<string>>();
        for (const notif of pastNotifications) {
            if (notif.metadata && typeof notif.metadata === 'object') {
                const meta = notif.metadata as any;
                if (Array.isArray(meta.projectIds)) {
                    if (!alreadyRecommendedMap.has(notif.userId)) {
                        alreadyRecommendedMap.set(notif.userId, new Set());
                    }
                    const userSet = alreadyRecommendedMap.get(notif.userId)!;
                    meta.projectIds.forEach((id: string) => userSet.add(id));
                }
            }
        }

        let emailsSent = 0;
        let errors = 0;
        let totalMatchesCount = 0;

        // Helper to match skills case-insensitively
        const matchSkills = (userSkills: string[], projectTech: string[]): string[] => {
            const normalizedUserSkills = new Set(userSkills.map(s => s.trim().toLowerCase()));
            return projectTech.filter(tech => normalizedUserSkills.has(tech.trim().toLowerCase()));
        };

        // 4. For each user, perform matchmaking
        for (const user of usersWithSkills) {
            const alreadyRecommended = alreadyRecommendedMap.get(user.id) || new Set<string>();

            const userMatches: Array<{
                id: string;
                title: string;
                description: string;
                techStack: string[];
                matchedSkills: string[];
            }> = [];

            for (const project of eligibleProjects) {
                // Do not recommend if user is the owner
                if (project.ownerId === user.id) continue;

                // Do not recommend if user is already a member
                const isMember = project.members.some(m => m.userId === user.id);
                if (isMember) continue;

                // Do not recommend if already recommended
                if (alreadyRecommended.has(project.id)) continue;

                // Check for overlapping skills
                const matchedSkills = matchSkills(user.skills, project.techStack);
                if (matchedSkills.length > 0) {
                    userMatches.push({
                        id: project.id,
                        title: project.title,
                        description: project.description,
                        techStack: project.techStack,
                        matchedSkills,
                    });
                }
            }

            // If we found any matches, send recommendation
            if (userMatches.length > 0) {
                // Limit to top 3 matches to keep the email premium and uncluttered
                const finalMatches = userMatches.slice(0, 3);
                totalMatchesCount += finalMatches.length;

                try {
                    // Send match email
                    const result = await EmailService.sendProjectMatchEmail(user, finalMatches);

                    if (result.success) {
                        emailsSent++;

                        // Save notification in database with projectIds in metadata
                        await prisma.notification.create({
                            data: {
                                userId: user.id,
                                title: 'Project Match Found',
                                description: `We found ${finalMatches.length} project(s) matching your skills: ${finalMatches.map(p => p.title).join(', ')}`,
                                type: 'INFO',
                                actionUrl: `/projects`,
                                metadata: {
                                    projectIds: finalMatches.map(p => p.id),
                                },
                            },
                        });
                    } else {
                        errors++;
                        const errorResult = result as { success: false; error?: string };
                        console.error(`[CRON_PROJECT_SKILLS_MATCH] Failed to send email to ${user.email}:`, errorResult.error);
                    }
                } catch (err) {
                    errors++;
                    console.error(`[CRON_PROJECT_SKILLS_MATCH] Error processing user ${user.email}:`, err);
                }
            }
        }

        return NextResponse.json({
            success: true,
            message: `Processed project skill matching reminders.`,
            stats: {
                totalRecipients: usersWithSkills.length,
                emailsSent,
                errors,
                totalMatches: totalMatchesCount,
            },
        });
    } catch (error) {
        console.error('[CRON_PROJECT_SKILLS_MATCH] Fatal error:', error);
        return new NextResponse('Internal Server Error', { status: 500 });
    }
}
