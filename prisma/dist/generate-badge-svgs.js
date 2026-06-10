"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
// Full registry of 43 badges (22 legacy + 21 newly seeded)
const BADGES = [
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
    // Community Contributions (Helpful Hand, Team Player, Community Champion)
    { name: 'Helpful Hand', rarity: 'COMMON', category: 'COMMUNITY', filename: 'helpful-hand.svg' },
    { name: 'Team Player', rarity: 'RARE', category: 'COMMUNITY', filename: 'team-player.svg' },
    { name: 'Community Champion', rarity: 'EPIC', category: 'COMMUNITY', filename: 'community-champion.svg' },
    // Community Questions Ask (Curious Mind, Forum Explorer, Inquisitive Scholar)
    { name: 'Curious Mind', rarity: 'COMMON', category: 'COMMUNITY', filename: 'curious-mind.svg' },
    { name: 'Forum Explorer', rarity: 'RARE', category: 'COMMUNITY', filename: 'forum-explorer.svg' },
    { name: 'Inquisitive Scholar', rarity: 'EPIC', category: 'COMMUNITY', filename: 'inquisitive-scholar.svg' },
    // Community Comments (First Word, Active Debater, Community Catalyst)
    { name: 'First Word', rarity: 'COMMON', category: 'COMMUNITY', filename: 'first-word.svg' },
    { name: 'Active Debater', rarity: 'RARE', category: 'COMMUNITY', filename: 'active-debater.svg' },
    { name: 'Community Catalyst', rarity: 'EPIC', category: 'COMMUNITY', filename: 'community-catalyst.svg' },
    // Group Joining (Social Rookie, Club Member, Networker)
    { name: 'Social Rookie', rarity: 'COMMON', category: 'COMMUNITY', filename: 'social-rookie.svg' },
    { name: 'Club Member', rarity: 'RARE', category: 'COMMUNITY', filename: 'club-member.svg' },
    { name: 'Networker', rarity: 'EPIC', category: 'COMMUNITY', filename: 'networker.svg' },
    // Blog Reading (Aesthetic Reader, Avid Reader, Knowledge Vault)
    { name: 'Aesthetic Reader', rarity: 'COMMON', category: 'BLOG', filename: 'aesthetic-reader.svg' },
    { name: 'Avid Reader', rarity: 'RARE', category: 'BLOG', filename: 'avid-reader.svg' },
    { name: 'Knowledge Vault', rarity: 'EPIC', category: 'BLOG', filename: 'knowledge-vault.svg' },
    // Job Applications (Job Hunter, Career Driven, Relentless Applicant)
    { name: 'Job Hunter', rarity: 'COMMON', category: 'CAREER', filename: 'job-hunter.svg' },
    { name: 'Career Driven', rarity: 'RARE', category: 'CAREER', filename: 'career-driven.svg' },
    { name: 'Relentless Applicant', rarity: 'EPIC', category: 'CAREER', filename: 'relentless-applicant.svg' },
    // Referral Sharing (Ambassador, Viral Promoter, Network Magnate)
    { name: 'Ambassador', rarity: 'COMMON', category: 'REFERRAL', filename: 'ambassador.svg' },
    { name: 'Viral Promoter', rarity: 'RARE', category: 'REFERRAL', filename: 'viral-promoter.svg' },
    { name: 'Network Magnate', rarity: 'LEGENDARY', category: 'REFERRAL', filename: 'network-magnate.svg' },
    // Mock Interviews (Interview Ready, DSA Gladiator, Boardroom Legend)
    { name: 'Interview Ready', rarity: 'COMMON', category: 'CAREER', filename: 'interview-ready.svg' },
    { name: 'DSA Gladiator', rarity: 'RARE', category: 'CAREER', filename: 'dsa-gladiator.svg' },
    { name: 'Boardroom Legend', rarity: 'EPIC', category: 'CAREER', filename: 'boardroom-legend.svg' },
    // Milestone Badges (Level 5, 10, 25, 50)
    { name: 'Level 5', rarity: 'COMMON', category: 'MILESTONE', filename: 'level-5.svg' },
    { name: 'Level 10', rarity: 'RARE', category: 'MILESTONE', filename: 'level-10.svg' },
    { name: 'Level 25', rarity: 'EPIC', category: 'MILESTONE', filename: 'level-25.svg' },
    { name: 'Level 50', rarity: 'LEGENDARY', category: 'MILESTONE', filename: 'level-50.svg' },
];
// Inner category icon SVG definitions
const getCategoryIconPath = (cat) => {
    switch (cat) {
        case 'PROJECT': // Laptop/Code representation
            return `<path d="M12 18h.01M17 21H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2z" stroke="white" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
                    <path d="M9 8l-3 3 3 3M15 8l3 3-3 3M13 7l-2 8" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>`;
        case 'EVENT': // Calendar Representation
            return `<rect x="5" y="6" width="14" h="14" rx="2" ry="2" stroke="white" stroke-width="3.5" fill="none"/>
                    <line x1="16" y1="4" x2="16" y2="8" stroke="white" stroke-width="3" stroke-linecap="round"/>
                    <line x1="8" y1="4" x2="8" y2="8" stroke="white" stroke-width="3" stroke-linecap="round"/>
                    <line x1="5" y1="11" x2="19" y2="11" stroke="white" stroke-width="2.5"/>
                    <circle cx="9" cy="15" r="1.2" fill="white"/>
                    <circle cx="15" cy="15" r="1.2" fill="white"/>`;
        case 'MENTOR': // Users Collaboration
            return `<path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" stroke="white" stroke-width="3" fill="none"/>
                    <circle cx="9" cy="7" r="4" stroke="white" stroke-width="3" fill="none"/>
                    <path d="M23 21v-2a4 4 0 0 0-3-3.87" stroke="white" stroke-width="2.5" fill="none"/>
                    <path d="M16 3.13a4 4 0 0 1 0 7.75" stroke="white" stroke-width="2.5" fill="none"/>`;
        case 'STREAK': // Flame
            return `<path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 3.5z" stroke="white" stroke-width="3" stroke-linejoin="round" fill="none"/>`;
        case 'COMMUNITY': // Speech bubble / chat
            return `<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" stroke="white" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
                    <circle cx="7" cy="10" r="1" fill="white"/>
                    <circle cx="12" cy="10" r="1" fill="white"/>
                    <circle cx="17" cy="10" r="1" fill="white"/>`;
        case 'BLOG': // Open Book
            return `<path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" stroke="white" stroke-width="3" stroke-linejoin="round" fill="none"/>
                    <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" stroke="white" stroke-width="3" stroke-linejoin="round" fill="none"/>`;
        case 'CAREER': // Briefcase
            return `<rect x="2" y="7" width="20" h="12" rx="2" ry="2" stroke="white" stroke-width="3.5" fill="none"/>
                    <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" stroke="white" stroke-width="3" fill="none"/>`;
        case 'REFERRAL': // Share symbol
            return `<circle cx="18" cy="5" r="3" stroke="white" stroke-width="3" fill="none"/>
                    <circle cx="6" cy="12" r="3" stroke="white" stroke-width="3" fill="none"/>
                    <circle cx="18" cy="19" r="3" stroke="white" stroke-width="3" fill="none"/>
                    <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" stroke="white" stroke-width="2.5"/>
                    <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" stroke="white" stroke-width="2.5"/>`;
        case 'MILESTONE':
        default: // Award badge/trophy
            return `<path d="M12 15a7 7 0 1 0 0-14 7 7 0 0 0 0 14z" stroke="white" stroke-width="3" fill="none"/>
                    <path d="M8.21 13.89L7 23l5-3 5 3-1.21-9.12" stroke="white" stroke-width="2.5" stroke-linejoin="round" fill="none"/>`;
    }
};
// SVG visual properties and shapes by Rarity tier
const getRaritySVGConfig = (rarity, name) => {
    switch (rarity) {
        case 'LEGENDARY':
            return {
                startColor: '#ec4899', // Pink
                midColor: '#8b5cf6', // Violet
                endColor: '#4f46e5', // Indigo
                polygonPoints: '50,3 97,38 79,92 21,92 3,38',
                borderColor: '#f472b6',
                borderWidth: '3'
            };
        case 'EPIC':
            return {
                startColor: '#fbbf24', // Yellow
                midColor: '#f97316', // Orange
                endColor: '#dc2626', // Red
                polygonPoints: '50,3 92,20 92,80 50,97 8,80 8,20',
                borderColor: '#fde047',
                borderWidth: '3.5'
            };
        case 'RARE':
            return {
                startColor: '#2dd4bf', // Teal
                midColor: '#3b82f6', // Blue
                endColor: '#6366f1', // Indigo
                polygonPoints: '50,5 95,50 50,95 5,50',
                borderColor: '#99f6e4',
                borderWidth: '3'
            };
        case 'COMMON':
        default:
            return {
                startColor: '#3b82f6', // Blue
                midColor: '#475569', // Slate
                endColor: '#1e293b', // Dark Slate
                polygonPoints: '50,5 90,15 90,85 50,95 10,85 10,15',
                borderColor: '#93c5fd',
                borderWidth: '3.5'
            };
    }
};
// Generate SVG string
const generateSVG = (badge) => {
    const config = getRaritySVGConfig(badge.rarity, badge.name);
    const iconPath = getCategoryIconPath(badge.category);
    const gradId = `grad-${badge.name.replace(/\s+/g, '-')}`;
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="200" height="200">
  <defs>
    <linearGradient id="${gradId}" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${config.startColor}" />
      <stop offset="50%" stop-color="${config.midColor}" />
      <stop offset="100%" stop-color="${config.endColor}" />
    </linearGradient>
    <filter id="shadow" x="-10%" y="-10%" width="120%" height="120%">
      <feDropShadow dx="0" dy="4" stdDeviation="4" flood-color="black" flood-opacity="0.5"/>
    </filter>
  </defs>

  <!-- Outer Glow Glow Layer -->
  <polygon points="${config.polygonPoints}" fill="${config.startColor}" opacity="0.15" filter="url(#shadow)" />

  <!-- Outer Shield border -->
  <polygon points="${config.polygonPoints}" fill="none" stroke="${config.borderColor}" stroke-width="${config.borderWidth}" />

  <!-- Shield Body -->
  <polygon points="${config.polygonPoints}" fill="url(#${gradId})" transform="scale(0.9) translate(5.5, 5.5)" />

  <!-- Centered Icon (Standardized bounds) -->
  <g transform="translate(38, 32) scale(1)" stroke-linecap="round" stroke-linejoin="round">
    ${iconPath}
  </g>

  <!-- Badge Name Label -->
  <text x="50%" y="82%" text-anchor="middle" fill="white" font-family="system-ui, -apple-system, sans-serif" font-weight="900" font-size="6px" letter-spacing="0.5" opacity="0.95" text-transform="uppercase">
    ${badge.name}
  </text>
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
