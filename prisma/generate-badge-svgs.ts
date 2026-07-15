import * as fs from 'fs';
import * as path from 'path';

// Rarity configurations
type Rarity = 'COMMON' | 'RARE' | 'EPIC' | 'LEGENDARY';
type Category = 'PROJECT' | 'EVENT' | 'MENTOR' | 'STREAK' | 'COMMUNITY' | 'BLOG' | 'CAREER' | 'REFERRAL' | 'MILESTONE';

interface BadgeDefinition {
    name: string;
    rarity: Rarity;
    category: Category;
    filename: string;
}

// Full registry of 43 badges (22 legacy + 21 newly seeded)
const BADGES: BadgeDefinition[] = [
    // Project Badges
    { name: 'First Steps', rarity: 'COMMON', category: 'PROJECT', filename: 'first-steps.svg' },
    { name: 'Project Master', rarity: 'RARE', category: 'PROJECT', filename: 'project-master.svg' },
    { name: '10x Builder', rarity: 'EPIC', category: 'PROJECT', filename: '10x-builder.svg' },
    { name: 'Elite Innovator', rarity: 'LEGENDARY', category: 'PROJECT', filename: 'elite-innovator.svg' },

    // Event Badges
    { name: 'Event Enthusiast', rarity: 'COMMON', category: 'EVENT', filename: 'event-enthusiast.svg' },
    { name: '3-Day Streak', rarity: 'RARE', category: 'EVENT', filename: '3-day-streak.svg' },
    { name: 'Marathon Runner', rarity: 'EPIC', category: 'EVENT', filename: 'marathon-runner.svg' },
    { name: 'Event Legend', rarity: 'LEGENDARY', category: 'EVENT', filename: 'event-legend.svg' },

    // Mentor Badges
    { name: 'Mentee', rarity: 'COMMON', category: 'MENTOR', filename: 'mentee.svg' },
    { name: 'Knowledge Seeker', rarity: 'RARE', category: 'MENTOR', filename: 'knowledge-seeker.svg' },
    { name: 'Wisdom Collector', rarity: 'EPIC', category: 'MENTOR', filename: 'wisdom-collector.svg' },

    // Streak Badges
    { name: 'Week Warrior', rarity: 'COMMON', category: 'STREAK', filename: 'week-warrior.svg' },
    { name: 'Month Master', rarity: 'RARE', category: 'STREAK', filename: 'month-master.svg' },
    { name: 'Century Champion', rarity: 'EPIC', category: 'STREAK', filename: 'century-champion.svg' },
    { name: 'Year Legend', rarity: 'LEGENDARY', category: 'STREAK', filename: 'year-legend.svg' },

    // Community Contributions
    { name: 'Helpful Hand', rarity: 'COMMON', category: 'COMMUNITY', filename: 'helpful-hand.svg' },
    { name: 'Team Player', rarity: 'RARE', category: 'COMMUNITY', filename: 'team-player.svg' },
    { name: 'Community Champion', rarity: 'EPIC', category: 'COMMUNITY', filename: 'community-champion.svg' },

    // Community Questions Ask
    { name: 'Curious Mind', rarity: 'COMMON', category: 'COMMUNITY', filename: 'curious-mind.svg' },
    { name: 'Forum Explorer', rarity: 'RARE', category: 'COMMUNITY', filename: 'forum-explorer.svg' },
    { name: 'Inquisitive Scholar', rarity: 'EPIC', category: 'COMMUNITY', filename: 'inquisitive-scholar.svg' },

    // Community Comments
    { name: 'First Word', rarity: 'COMMON', category: 'COMMUNITY', filename: 'first-word.svg' },
    { name: 'Active Debater', rarity: 'RARE', category: 'COMMUNITY', filename: 'active-debater.svg' },
    { name: 'Community Catalyst', rarity: 'EPIC', category: 'COMMUNITY', filename: 'community-catalyst.svg' },

    // Group Joining
    { name: 'Social Rookie', rarity: 'COMMON', category: 'COMMUNITY', filename: 'social-rookie.svg' },
    { name: 'Club Member', rarity: 'RARE', category: 'COMMUNITY', filename: 'club-member.svg' },
    { name: 'Networker', rarity: 'EPIC', category: 'COMMUNITY', filename: 'networker.svg' },

    // Blog Reading
    { name: 'Aesthetic Reader', rarity: 'COMMON', category: 'BLOG', filename: 'aesthetic-reader.svg' },
    { name: 'Avid Reader', rarity: 'RARE', category: 'BLOG', filename: 'avid-reader.svg' },
    { name: 'Knowledge Vault', rarity: 'EPIC', category: 'BLOG', filename: 'knowledge-vault.svg' },

    // Job Applications
    { name: 'Job Hunter', rarity: 'COMMON', category: 'CAREER', filename: 'job-hunter.svg' },
    { name: 'Career Driven', rarity: 'RARE', category: 'CAREER', filename: 'career-driven.svg' },
    { name: 'Relentless Applicant', rarity: 'EPIC', category: 'CAREER', filename: 'relentless-applicant.svg' },

    // Referral Sharing
    { name: 'Ambassador', rarity: 'COMMON', category: 'REFERRAL', filename: 'ambassador.svg' },
    { name: 'Viral Promoter', rarity: 'RARE', category: 'REFERRAL', filename: 'viral-promoter.svg' },
    { name: 'Network Magnate', rarity: 'LEGENDARY', category: 'REFERRAL', filename: 'network-magnate.svg' },

    // Mock Interviews
    { name: 'Interview Ready', rarity: 'COMMON', category: 'CAREER', filename: 'interview-ready.svg' },
    { name: 'DSA Gladiator', rarity: 'RARE', category: 'CAREER', filename: 'dsa-gladiator.svg' },
    { name: 'Boardroom Legend', rarity: 'EPIC', category: 'CAREER', filename: 'boardroom-legend.svg' },

    // Milestone Badges
    { name: 'Level 5', rarity: 'COMMON', category: 'MILESTONE', filename: 'level-5.svg' },
    { name: 'Level 10', rarity: 'RARE', category: 'MILESTONE', filename: 'level-10.svg' },
    { name: 'Level 25', rarity: 'EPIC', category: 'MILESTONE', filename: 'level-25.svg' },
    { name: 'Level 50', rarity: 'LEGENDARY', category: 'MILESTONE', filename: 'level-50.svg' },
];

// Inner category icon SVG definitions
const getCategoryIconPath = (cat: Category): string => {
    switch (cat) {
        case 'PROJECT': // Laptop/Code representation
            return `<path d="M4 15h16M7 18H3a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h18a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2h-4" />
                    <path d="M8 8l-2 2 2 2M16 8l2 2-2 2M13 7l-2 6" />`;
        case 'EVENT': // Calendar Representation
            return `<rect x="3" y="4" width="18" height="16" rx="2" />
                    <path d="M16 2v4M8 2v4M3 10h18" />`;
        case 'MENTOR': // Users Collaboration
            return `<path d="M16 21v-2a4 4 0 0 0-4-4H4a4 4 0 0 0-4 4v2" />
                    <circle cx="8" cy="7" r="4" />
                    <path d="M22 21v-2a4 4 0 0 0-3-3.87M15 3.13a4 4 0 0 1 0 7.75" />`;
        case 'STREAK': // Flame
            return `<path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 3.5z" />`;
        case 'COMMUNITY': // Speech bubble / chat
            return `<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                    <circle cx="7" cy="10" r="1.5" fill="#0f172a" stroke="none" />
                    <circle cx="12" cy="10" r="1.5" fill="#0f172a" stroke="none" />
                    <circle cx="17" cy="10" r="1.5" fill="#0f172a" stroke="none" />`;
        case 'BLOG': // Open Book
            return `<path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
                    <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />`;
        case 'CAREER': // Briefcase
            return `<rect x="2" y="7" width="20" height="12" rx="2" />
                    <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />`;
        case 'REFERRAL': // Share symbol
            return `<circle cx="18" cy="5" r="3" />
                    <circle cx="6" cy="12" r="3" />
                    <circle cx="18" cy="19" r="3" />
                    <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
                    <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />`;
        case 'MILESTONE':
        default: // Award badge/trophy
            return `<circle cx="12" cy="8" r="7" />
                    <path d="M8.21 13.89L7 23l5-3 5 3-1.21-9.12" />`;
    }
};

// SVG visual properties and shapes by Rarity tier
const getRaritySVGConfig = (rarity: Rarity) => {
    switch (rarity) {
        case 'LEGENDARY':
            return {
                bgColor: '#fce7f3', // Very light pink
                fillColor: '#f43f5e', // Rose
                strokeColor: '#0f172a',
                shape: 'M 50 5 L 95 25 L 95 75 L 50 95 L 5 75 L 5 25 Z', // Hexagon
            };
        case 'EPIC':
            return {
                bgColor: '#ffedd5', // Light orange
                fillColor: '#f97316', // Orange
                strokeColor: '#0f172a',
                shape: 'M 50 5 L 90 15 L 90 85 L 50 95 L 10 85 L 10 15 Z', // Shield
            };
        case 'RARE':
            return {
                bgColor: '#f3e8ff', // Light purple
                fillColor: '#8b5cf6', // Purple
                strokeColor: '#0f172a',
                shape: 'M 50 5 L 95 50 L 50 95 L 5 50 Z', // Diamond
            };
        case 'COMMON':
        default:
            return {
                bgColor: '#dbeafe', // Light blue
                fillColor: '#3b82f6', // Blue
                strokeColor: '#0f172a',
                shape: 'M 50 5 L 90 20 L 90 80 L 50 95 L 10 80 L 10 20 Z', // Alternate Hexagon
            };
    }
};

// Generate SVG string
const generateSVG = (badge: BadgeDefinition): string => {
    const config = getRaritySVGConfig(badge.rarity);
    const iconPath = getCategoryIconPath(badge.category);
    
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="200" height="200">
  <!-- Outer Shape Base -->
  <path d="${config.shape}" fill="${config.bgColor}" stroke="${config.strokeColor}" stroke-width="3" stroke-linejoin="round" />
  
  <!-- Inner Shape Filled -->
  <g transform="scale(0.8) translate(12.5, 12.5)">
      <path d="${config.shape}" fill="${config.fillColor}" stroke="${config.strokeColor}" stroke-width="3.5" stroke-linejoin="round" />
  </g>

  <!-- Centered Icon (Standardized bounds) -->
  <g transform="translate(38, 30) scale(1.0)" fill="white" stroke="${config.strokeColor}" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
    ${iconPath}
  </g>

  <!-- Title Ribbon -->
  <g transform="translate(50, 92)">
    <rect x="-45" y="-8" width="90" height="16" rx="3" fill="white" stroke="${config.strokeColor}" stroke-width="2.5" />
    <text x="0" y="3" text-anchor="middle" fill="${config.strokeColor}" font-family="system-ui, -apple-system, sans-serif" font-weight="900" font-size="6.5px" letter-spacing="0.5" text-transform="uppercase">
      ${badge.name}
    </text>
  </g>
</svg>`;
};

// Main function to write SVGs to file
function generate() {
    console.log('[Generator] Starting static SVG asset generation...');
    const badgesDir = path.join(process.cwd(), 'public', 'badges');

    // Create public/badges if it does not exist
    if (!fs.existsSync(badgesDir)) {
        fs.mkdirSync(badgesDir, { recursive: true });
        console.log(`[Generator] Created directory: ${badgesDir}`);
    }

    let count = 0;
    for (const badge of BADGES) {
        const filePath = path.join(badgesDir, badge.filename);
        const svgContent = generateSVG(badge);
        fs.writeFileSync(filePath, svgContent, 'utf8');
        console.log(`[Generator] Generated static SVG: ${badge.filename}`);
        count++;
    }

    console.log(`[Generator] Static SVG asset generation complete! Generated ${count} files.`);
}

generate();
