import { prisma } from '@/lib/prisma';
import { BadgeCategory, BadgeRarity } from '@prisma/client';

/**
 * Preset badges for gamification system
 */
const PRESET_BADGES = [
    // Project Badges
    {
        name: 'First Steps',
        description: 'Submitted your first project',
        imageUrl: '/badges/first-steps.svg',
        category: 'PROJECT' as BadgeCategory,
        xpReward: 50,
        rarity: 'COMMON' as BadgeRarity,
        criteria: JSON.stringify({ minProjects: 1 }),
    },
    {
        name: 'Project Master',
        description: 'Submitted 5 projects',
        imageUrl: '/badges/project-master.svg',
        category: 'PROJECT' as BadgeCategory,
        xpReward: 200,
        rarity: 'RARE' as BadgeRarity,
        criteria: JSON.stringify({ minProjects: 5 }),
    },
    {
        name: '10x Builder',
        description: 'Submitted 10 projects',
        imageUrl: '/badges/10x-builder.svg',
        category: 'PROJECT' as BadgeCategory,
        xpReward: 500,
        rarity: 'EPIC' as BadgeRarity,
        criteria: JSON.stringify({ minProjects: 10 }),
    },
    {
        name: 'Elite Innovator',
        description: 'Submitted 25 projects',
        imageUrl: '/badges/elite-innovator.svg',
        category: 'PROJECT' as BadgeCategory,
        xpReward: 1000,
        rarity: 'LEGENDARY' as BadgeRarity,
        criteria: JSON.stringify({ minProjects: 25 }),
    },

    // Event Badges
    {
        name: 'Event Enthusiast',
        description: 'Attended your first event',
        imageUrl: '/badges/event-enthusiast.svg',
        category: 'EVENT' as BadgeCategory,
        xpReward: 100,
        rarity: 'COMMON' as BadgeRarity,
        criteria: JSON.stringify({ minEvents: 1 }),
    },
    {
        name: '3-Day Streak',
        description: 'Maintained a 3-day event streak',
        imageUrl: '/badges/3-day-streak.svg',
        category: 'EVENT' as BadgeCategory,
        xpReward: 150,
        rarity: 'RARE' as BadgeRarity,
        criteria: JSON.stringify({ minStreak: 3 }),
    },
    {
        name: 'Marathon Runner',
        description: 'Attended 10 events',
        imageUrl: '/badges/marathon-runner.svg',
        category: 'EVENT' as BadgeCategory,
        xpReward: 300,
        rarity: 'EPIC' as BadgeRarity,
        criteria: JSON.stringify({ minEvents: 10 }),
    },
    {
        name: 'Event Legend',
        description: 'Attended 25 events',
        imageUrl: '/badges/event-legend.svg',
        category: 'EVENT' as BadgeCategory,
        xpReward: 750,
        rarity: 'LEGENDARY' as BadgeRarity,
        criteria: JSON.stringify({ minEvents: 25 }),
    },

    // Mentor Badges
    {
        name: 'Mentee',
        description: 'Completed your first mentor session',
        imageUrl: '/badges/mentee.svg',
        category: 'MENTOR' as BadgeCategory,
        xpReward: 75,
        rarity: 'COMMON' as BadgeRarity,
        criteria: JSON.stringify({ minSessions: 1 }),
    },
    {
        name: 'Knowledge Seeker',
        description: 'Completed 5 mentor sessions',
        imageUrl: '/badges/knowledge-seeker.svg',
        category: 'MENTOR' as BadgeCategory,
        xpReward: 200,
        rarity: 'RARE' as BadgeRarity,
        criteria: JSON.stringify({ minSessions: 5 }),
    },
    {
        name: 'Wisdom Collector',
        description: 'Completed 15 mentor sessions',
        imageUrl: '/badges/wisdom-collector.svg',
        category: 'MENTOR' as BadgeCategory,
        xpReward: 500,
        rarity: 'EPIC' as BadgeRarity,
        criteria: JSON.stringify({ minSessions: 15 }),
    },

    // Streak Badges
    {
        name: 'Week Warrior',
        description: 'Maintained a 7-day login streak',
        imageUrl: '/badges/week-warrior.svg',
        category: 'STREAK' as BadgeCategory,
        xpReward: 100,
        rarity: 'COMMON' as BadgeRarity,
        criteria: JSON.stringify({ reqStreak: 7 }),
    },
    {
        name: 'Month Master',
        description: 'Maintained a 30-day login streak',
        imageUrl: '/badges/month-master.svg',
        category: 'STREAK' as BadgeCategory,
        xpReward: 300,
        rarity: 'RARE' as BadgeRarity,
        criteria: JSON.stringify({ reqStreak: 30 }),
    },
    {
        name: 'Century Champion',
        description: 'Maintained a 100-day login streak',
        imageUrl: '/badges/century-champion.svg',
        category: 'STREAK' as BadgeCategory,
        xpReward: 750,
        rarity: 'EPIC' as BadgeRarity,
        criteria: JSON.stringify({ reqStreak: 100 }),
    },
    {
        name: 'Year Legend',
        description: 'Maintained a 365-day login streak',
        imageUrl: '/badges/year-legend.svg',
        category: 'STREAK' as BadgeCategory,
        xpReward: 2000,
        rarity: 'LEGENDARY' as BadgeRarity,
        criteria: JSON.stringify({ reqStreak: 365 }),
    },

    // Community Badges
    {
        name: 'Helpful Hand',
        description: 'Made your first community contribution',
        imageUrl: '/badges/helpful-hand.svg',
        category: 'COMMUNITY' as BadgeCategory,
        xpReward: 50,
        rarity: 'COMMON' as BadgeRarity,
        criteria: JSON.stringify({ minContributions: 1 }),
    },
    {
        name: 'Team Player',
        description: 'Collaborated on 3 projects',
        imageUrl: '/badges/team-player.svg',
        category: 'COMMUNITY' as BadgeCategory,
        xpReward: 150,
        rarity: 'RARE' as BadgeRarity,
        criteria: JSON.stringify({ minCollaborations: 3 }),
    },
    {
        name: 'Community Champion',
        description: 'Made 10 community contributions',
        imageUrl: '/badges/community-champion.svg',
        category: 'COMMUNITY' as BadgeCategory,
        xpReward: 250,
        rarity: 'EPIC' as BadgeRarity,
        criteria: JSON.stringify({ minContributions: 10 }),
    },

    // Milestone Badges
    {
        name: 'Level 5',
        description: 'Reached level 5',
        imageUrl: '/badges/level-5.svg',
        category: 'MILESTONE' as BadgeCategory,
        xpReward: 100,
        rarity: 'COMMON' as BadgeRarity,
        criteria: JSON.stringify({ minLevel: 5 }),
    },
    {
        name: 'Level 10',
        description: 'Reached level 10',
        imageUrl: '/badges/level-10.svg',
        category: 'MILESTONE' as BadgeCategory,
        xpReward: 250,
        rarity: 'RARE' as BadgeRarity,
        criteria: JSON.stringify({ minLevel: 10 }),
    },
    {
        name: 'Level 25',
        description: 'Reached level 25',
        imageUrl: '/badges/level-25.svg',
        category: 'MILESTONE' as BadgeCategory,
        xpReward: 500,
        rarity: 'EPIC' as BadgeRarity,
        criteria: JSON.stringify({ minLevel: 25 }),
    },
    {
        name: 'Level 50',
        description: 'Reached level 50',
        imageUrl: '/badges/level-50.svg',
        category: 'MILESTONE' as BadgeCategory,
        xpReward: 1500,
        rarity: 'LEGENDARY' as BadgeRarity,
        criteria: JSON.stringify({ minLevel: 50 }),
    },
];

/**
 * Seed the database with preset badges
 */
export async function seedBadges() {
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
    } catch (error) {
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

export default main;
