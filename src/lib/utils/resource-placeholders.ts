/**
 * Resource Placeholder Image Utilities
 * Feature: resources-page-ui-improvements
 * 
 * Generates category-appropriate placeholder images for resources
 * when imageUrl is not available.
 * 
 * Requirements:
 * - 4.3: Category-appropriate placeholder images
 */

import { ResourceCategory } from '@/lib/types/resources.types';

/**
 * Category color schemes for placeholders
 */
const CATEGORY_COLORS: Record<ResourceCategory, { bg: string; fg: string; accent: string }> = {
  [ResourceCategory.PROGRAMMING]: {
    bg: '#3B82F6',
    fg: '#DBEAFE',
    accent: '#1E40AF',
  },
  [ResourceCategory.DESIGN]: {
    bg: '#EC4899',
    fg: '#FCE7F3',
    accent: '#BE185D',
  },
  [ResourceCategory.BUSINESS]: {
    bg: '#10B981',
    fg: '#D1FAE5',
    accent: '#047857',
  },
  [ResourceCategory.DATA_SCIENCE]: {
    bg: '#8B5CF6',
    fg: '#EDE9FE',
    accent: '#6D28D9',
  },
  [ResourceCategory.DEVOPS]: {
    bg: '#F59E0B',
    fg: '#FEF3C7',
    accent: '#D97706',
  },
  [ResourceCategory.MOBILE]: {
    bg: '#06B6D4',
    fg: '#CFFAFE',
    accent: '#0891B2',
  },
  [ResourceCategory.WEB]: {
    bg: '#EF4444',
    fg: '#FEE2E2',
    accent: '#DC2626',
  },
  [ResourceCategory.OTHER]: {
    bg: '#6B7280',
    fg: '#F3F4F6',
    accent: '#4B5563',
  },
};

/**
 * Category icon SVG paths
 */
const CATEGORY_ICONS: Record<ResourceCategory, string> = {
  [ResourceCategory.PROGRAMMING]: 
    'M8 3a1 1 0 0 1 1 1v4a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h4zm8 8a1 1 0 0 1 1 1v4a1 1 0 0 1-1 1h-4a1 1 0 0 1-1-1v-4a1 1 0 0 1 1-1h4z',
  [ResourceCategory.DESIGN]:
    'M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5',
  [ResourceCategory.BUSINESS]:
    'M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z',
  [ResourceCategory.DATA_SCIENCE]:
    'M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z',
  [ResourceCategory.DEVOPS]:
    'M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6',
  [ResourceCategory.MOBILE]:
    'M17 2H7a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2z',
  [ResourceCategory.WEB]:
    'M21 12a9 9 0 0 1-9 9m9-9a9 9 0 0 0-9-9m9 9H3m9 9a9 9 0 0 1-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 0 1 9-9',
  [ResourceCategory.OTHER]:
    'M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5',
};

/**
 * Generate SVG placeholder image as data URI
 */
export function generatePlaceholderSVG(category: ResourceCategory): string {
  const colors = CATEGORY_COLORS[category] || CATEGORY_COLORS[ResourceCategory.OTHER];
  const iconPath = CATEGORY_ICONS[category] || CATEGORY_ICONS[ResourceCategory.OTHER];
  const categoryName = category.replace(/_/g, ' ');
  
  const svg = `
    <svg width="400" height="225" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="grad-${category}" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:${colors.bg};stop-opacity:1" />
          <stop offset="100%" style="stop-color:${colors.accent};stop-opacity:1" />
        </linearGradient>
      </defs>
      
      <!-- Background -->
      <rect width="400" height="225" fill="url(#grad-${category})"/>
      
      <!-- Pattern overlay -->
      <g opacity="0.1">
        <circle cx="50" cy="50" r="30" fill="${colors.fg}"/>
        <circle cx="350" cy="175" r="40" fill="${colors.fg}"/>
        <circle cx="200" cy="200" r="25" fill="${colors.fg}"/>
      </g>
      
      <!-- Icon -->
      <g transform="translate(150, 62.5)">
        <svg width="100" height="100" viewBox="0 0 24 24" fill="none" stroke="${colors.fg}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="${iconPath}"/>
        </svg>
      </g>
      
      <!-- Category label -->
      <text x="200" y="200" font-family="Arial, sans-serif" font-size="16" font-weight="600" fill="${colors.fg}" text-anchor="middle">
        ${categoryName}
      </text>
    </svg>
  `.trim();
  
  // Encode SVG as data URI
  const encoded = encodeURIComponent(svg)
    .replace(/'/g, '%27')
    .replace(/"/g, '%22');
  
  return `data:image/svg+xml,${encoded}`;
}

/**
 * Get placeholder image for a category
 * Returns data URI for inline SVG
 */
export function getCategoryPlaceholder(category: ResourceCategory): string {
  return generatePlaceholderSVG(category);
}

/**
 * Preload placeholder images for better performance
 * Can be called on page load to cache placeholders
 */
export function preloadPlaceholders(): void {
  if (typeof window === 'undefined') return;
  
  Object.values(ResourceCategory).forEach((category) => {
    const img = new Image();
    img.src = getCategoryPlaceholder(category as ResourceCategory);
  });
}
