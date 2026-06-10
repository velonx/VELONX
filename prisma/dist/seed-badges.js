"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.seedBadges = seedBadges;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
/**
 * Preset badges for gamification system
 */
const PRESET_BADGES = [
    // Project Badges
    {
        name: 'First Steps',
        description: 'Submitted your first project',
        imageUrl: '/badges/first-steps.svg',
        category: 'PROJECT',
        xpReward: 50,
        rarity: 'COMMON',
        criteria: JSON.stringify({ minProjects: 1 }),
    },
    {
        name: 'Project Master',
        description: 'Submitted 5 projects',
        imageUrl: '/badges/project-master.svg',
        category: 'PROJECT',
        xpReward: 200,
        rarity: 'RARE',
        criteria: JSON.stringify({ minProjects: 5 }),
    },
    {
        name: '10x Builder',
        description: 'Submitted 10 projects',
        imageUrl: '/badges/10x-builder.svg',
        category: 'PROJECT',
        xpReward: 500,
        rarity: 'EPIC',
        criteria: JSON.stringify({ minProjects: 10 }),
    },
    {
        name: 'Elite Innovator',
        description: 'Submitted 25 projects',
        imageUrl: '/badges/elite-innovator.svg',
        category: 'PROJECT',
        xpReward: 1000,
        rarity: 'LEGENDARY',
        criteria: JSON.stringify({ minProjects: 25 }),
    },
    // Event Badges
    {
        name: 'Event Enthusiast',
        description: 'Attended your first event',
        imageUrl: '/badges/event-enthusiast.svg',
        category: 'EVENT',
        xpReward: 100,
        rarity: 'COMMON',
        criteria: JSON.stringify({ minEvents: 1 }),
    },
    {
        name: '3-Day Streak',
        description: 'Maintained a 3-day event streak',
        imageUrl: '/badges/3-day-streak.svg',
        category: 'EVENT',
        xpReward: 150,
        rarity: 'RARE',
        criteria: JSON.stringify({ minStreak: 3 }),
    },
    {
        name: 'Marathon Runner',
        description: 'Attended 10 events',
        imageUrl: '/badges/marathon-runner.svg',
        category: 'EVENT',
        xpReward: 300,
        rarity: 'EPIC',
        criteria: JSON.stringify({ minEvents: 10 }),
    },
    {
        name: 'Event Legend',
        description: 'Attended 25 events',
        imageUrl: '/badges/event-legend.svg',
        category: 'EVENT',
        xpReward: 750,
        rarity: 'LEGENDARY',
        criteria: JSON.stringify({ minEvents: 25 }),
    },
    // Mentor Badges
    {
        name: 'Mentee',
        description: 'Completed your first mentor session',
        imageUrl: '/badges/mentee.svg',
        category: 'MENTOR',
        xpReward: 75,
        rarity: 'COMMON',
        criteria: JSON.stringify({ minSessions: 1 }),
    },
    {
        name: 'Knowledge Seeker',
        description: 'Completed 5 mentor sessions',
        imageUrl: '/badges/knowledge-seeker.svg',
        category: 'MENTOR',
        xpReward: 200,
        rarity: 'RARE',
        criteria: JSON.stringify({ minSessions: 5 }),
    },
    {
        name: 'Wisdom Collector',
        description: 'Completed 15 mentor sessions',
        imageUrl: '/badges/wisdom-collector.svg',
        category: 'MENTOR',
        xpReward: 500,
        rarity: 'EPIC',
        criteria: JSON.stringify({ minSessions: 15 }),
    },
    // Streak Badges
    {
        name: 'Week Warrior',
        description: 'Maintained a 7-day login streak',
        imageUrl: '/badges/week-warrior.svg',
        category: 'STREAK',
        xpReward: 100,
        rarity: 'COMMON',
        criteria: JSON.stringify({ reqStreak: 7 }),
    },
    {
        name: 'Month Master',
        description: 'Maintained a 30-day login streak',
        imageUrl: '/badges/month-master.svg',
        category: 'STREAK',
        xpReward: 300,
        rarity: 'RARE',
        criteria: JSON.stringify({ reqStreak: 30 }),
    },
    {
        name: 'Century Champion',
        description: 'Maintained a 100-day login streak',
        imageUrl: '/badges/century-champion.svg',
        category: 'STREAK',
        xpReward: 750,
        rarity: 'EPIC',
        criteria: JSON.stringify({ reqStreak: 100 }),
    },
    {
        name: 'Year Legend',
        description: 'Maintained a 365-day login streak',
        imageUrl: '/badges/year-legend.svg',
        category: 'STREAK',
        xpReward: 2000,
        rarity: 'LEGENDARY',
        criteria: JSON.stringify({ reqStreak: 365 }),
    },
    // Community Badges
    {
        name: 'Helpful Hand',
        description: 'Made your first community contribution',
        imageUrl: '/badges/helpful-hand.svg',
        category: 'COMMUNITY',
        xpReward: 50,
        rarity: 'COMMON',
        criteria: JSON.stringify({ minContributions: 1 }),
    },
    {
        name: 'Team Player',
        description: 'Collaborated on 3 projects',
        imageUrl: '/badges/team-player.svg',
        category: 'COMMUNITY',
        xpReward: 150,
        rarity: 'RARE',
        criteria: JSON.stringify({ minCollaborations: 3 }),
    },
    {
        name: 'Community Champion',
        description: 'Made 10 community contributions',
        imageUrl: '/badges/community-champion.svg',
        category: 'COMMUNITY',
        xpReward: 250,
        rarity: 'EPIC',
        criteria: JSON.stringify({ minContributions: 10 }),
    },
    // Community Ask Questions (COMMUNITY)
    {
        name: 'Curious Mind',
        description: 'Asked your first community question',
        imageUrl: '/badges/curious-mind.svg',
        category: 'COMMUNITY',
        xpReward: 50,
        rarity: 'COMMON',
        criteria: JSON.stringify({ minQuestions: 1 }),
    },
    {
        name: 'Forum Explorer',
        description: 'Asked 5 community questions',
        imageUrl: '/badges/forum-explorer.svg',
        category: 'COMMUNITY',
        xpReward: 150,
        rarity: 'RARE',
        criteria: JSON.stringify({ minQuestions: 5 }),
    },
    {
        name: 'Inquisitive Scholar',
        description: 'Asked 15 community questions',
        imageUrl: '/badges/inquisitive-scholar.svg',
        category: 'COMMUNITY',
        xpReward: 400,
        rarity: 'EPIC',
        criteria: JSON.stringify({ minQuestions: 15 }),
    },
    // Community Comments (COMMUNITY)
    {
        name: 'First Word',
        description: 'Left your first comment on a post',
        imageUrl: '/badges/first-word.svg',
        category: 'COMMUNITY',
        xpReward: 30,
        rarity: 'COMMON',
        criteria: JSON.stringify({ minComments: 1 }),
    },
    {
        name: 'Active Debater',
        description: 'Left 10 comments on community posts',
        imageUrl: '/badges/active-debater.svg',
        category: 'COMMUNITY',
        xpReward: 120,
        rarity: 'RARE',
        criteria: JSON.stringify({ minComments: 10 }),
    },
    {
        name: 'Community Catalyst',
        description: 'Left 50 comments on community posts',
        imageUrl: '/badges/community-catalyst.svg',
        category: 'COMMUNITY',
        xpReward: 350,
        rarity: 'EPIC',
        criteria: JSON.stringify({ minComments: 50 }),
    },
    // Group Joining (COMMUNITY)
    {
        name: 'Social Rookie',
        description: 'Joined your first community group',
        imageUrl: '/badges/social-rookie.svg',
        category: 'COMMUNITY',
        xpReward: 40,
        rarity: 'COMMON',
        criteria: JSON.stringify({ minGroups: 1 }),
    },
    {
        name: 'Club Member',
        description: 'Joined 5 community groups',
        imageUrl: '/badges/club-member.svg',
        category: 'COMMUNITY',
        xpReward: 125,
        rarity: 'RARE',
        criteria: JSON.stringify({ minGroups: 5 }),
    },
    {
        name: 'Networker',
        description: 'Joined 10 community groups',
        imageUrl: '/badges/networker.svg',
        category: 'COMMUNITY',
        xpReward: 300,
        rarity: 'EPIC',
        criteria: JSON.stringify({ minGroups: 10 }),
    },
    // Blog Reading (BLOG)
    {
        name: 'Aesthetic Reader',
        description: 'Read your first blog post',
        imageUrl: '/badges/aesthetic-reader.svg',
        category: 'BLOG',
        xpReward: 30,
        rarity: 'COMMON',
        criteria: JSON.stringify({ minBlogReads: 1 }),
    },
    {
        name: 'Avid Reader',
        description: 'Read 5 blog posts',
        imageUrl: '/badges/avid-reader.svg',
        category: 'BLOG',
        xpReward: 100,
        rarity: 'RARE',
        criteria: JSON.stringify({ minBlogReads: 5 }),
    },
    {
        name: 'Knowledge Vault',
        description: 'Read 20 blog posts',
        imageUrl: '/badges/knowledge-vault.svg',
        category: 'BLOG',
        xpReward: 300,
        rarity: 'EPIC',
        criteria: JSON.stringify({ minBlogReads: 20 }),
    },
    // Job Applications (CAREER)
    {
        name: 'Job Hunter',
        description: 'Applied for your first opportunity',
        imageUrl: '/badges/job-hunter.svg',
        category: 'CAREER',
        xpReward: 50,
        rarity: 'COMMON',
        criteria: JSON.stringify({ minJobApplications: 1 }),
    },
    {
        name: 'Career Driven',
        description: 'Applied for 5 opportunities',
        imageUrl: '/badges/career-driven.svg',
        category: 'CAREER',
        xpReward: 200,
        rarity: 'RARE',
        criteria: JSON.stringify({ minJobApplications: 5 }),
    },
    {
        name: 'Relentless Applicant',
        description: 'Applied for 15 opportunities',
        imageUrl: '/badges/relentless-applicant.svg',
        category: 'CAREER',
        xpReward: 500,
        rarity: 'EPIC',
        criteria: JSON.stringify({ minJobApplications: 15 }),
    },
    // Referral Sharing (REFERRAL)
    {
        name: 'Ambassador',
        description: 'Referred your first friend to Velonx',
        imageUrl: '/badges/ambassador.svg',
        category: 'REFERRAL',
        xpReward: 100,
        rarity: 'COMMON',
        criteria: JSON.stringify({ minReferrals: 1 }),
    },
    {
        name: 'Viral Promoter',
        description: 'Referred 5 friends to Velonx',
        imageUrl: '/badges/viral-promoter.svg',
        category: 'REFERRAL',
        xpReward: 400,
        rarity: 'RARE',
        criteria: JSON.stringify({ minReferrals: 5 }),
    },
    {
        name: 'Network Magnate',
        description: 'Referred 15 friends to Velonx',
        imageUrl: '/badges/network-magnate.svg',
        category: 'REFERRAL',
        xpReward: 1000,
        rarity: 'LEGENDARY',
        criteria: JSON.stringify({ minReferrals: 15 }),
    },
    // Mock Interviews (CAREER)
    {
        name: 'Interview Ready',
        description: 'Completed your first mock interview',
        imageUrl: '/badges/interview-ready.svg',
        category: 'CAREER',
        xpReward: 100,
        rarity: 'COMMON',
        criteria: JSON.stringify({ minMockInterviews: 1 }),
    },
    {
        name: 'DSA Gladiator',
        description: 'Completed 3 mock interviews',
        imageUrl: '/badges/dsa-gladiator.svg',
        category: 'CAREER',
        xpReward: 300,
        rarity: 'RARE',
        criteria: JSON.stringify({ minMockInterviews: 3 }),
    },
    {
        name: 'Boardroom Legend',
        description: 'Completed 5 mock interviews',
        imageUrl: '/badges/boardroom-legend.svg',
        category: 'CAREER',
        xpReward: 750,
        rarity: 'EPIC',
        criteria: JSON.stringify({ minMockInterviews: 5 }),
    },
    // Milestone Badges
    {
        name: 'Level 5',
        description: 'Reached level 5',
        imageUrl: '/badges/level-5.svg',
        category: 'MILESTONE',
        xpReward: 100,
        rarity: 'COMMON',
        criteria: JSON.stringify({ minLevel: 5 }),
    },
    {
        name: 'Level 10',
        description: 'Reached level 10',
        imageUrl: '/badges/level-10.svg',
        category: 'MILESTONE',
        xpReward: 250,
        rarity: 'RARE',
        criteria: JSON.stringify({ minLevel: 10 }),
    },
    {
        name: 'Level 25',
        description: 'Reached level 25',
        imageUrl: '/badges/level-25.svg',
        category: 'MILESTONE',
        xpReward: 500,
        rarity: 'EPIC',
        criteria: JSON.stringify({ minLevel: 25 }),
    },
    {
        name: 'Level 50',
        description: 'Reached level 50',
        imageUrl: '/badges/level-50.svg',
        category: 'MILESTONE',
        xpReward: 1500,
        rarity: 'LEGENDARY',
        criteria: JSON.stringify({ minLevel: 50 }),
    },
];
/**
 * Seed the database with preset badges
 */
async function seedBadges() {
    console.log('[Seed] Starting badge seeding...');
    try {
        let created = 0;
        let skipped = 0;
        for (const badgeData of PRESET_BADGES) {
            // Check if badge already exists
            const existing = await prisma.badge.findUnique({
                where: { name: badgeData.name },
            });
            if (existing) {
                console.log(`[Seed] Badge "${badgeData.name}" already exists, skipping...`);
                skipped++;
                continue;
            }
            await prisma.badge.create({
                data: badgeData,
            });
            console.log(`[Seed] Created badge: ${badgeData.name}`);
            created++;
        }
        console.log(`[Seed] Badge seeding complete!`);
        console.log(`[Seed] Created: ${created}, Skipped: ${skipped}`);
        return { created, skipped, total: PRESET_BADGES.length };
    }
    catch (error) {
        console.error('[Seed] Error seeding badges:', error);
        throw error;
    }
}
/**
 * Main seed function
 */
async function main() {
    await seedBadges();
    await prisma.$disconnect();
}
// Run if executed directly
if (require.main === module) {
    main()
        .then(() => {
        console.log('[Seed] All done!');
        process.exit(0);
    })
        .catch((error) => {
        console.error('[Seed] Fatal error:', error);
        process.exit(1);
    });
}
exports.default = main;
