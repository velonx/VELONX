/**
 * Resource Visit Tracking Utility
 * Feature: resources-page-ui-improvements
 * 
 * Handles tracking resource visits with XP rewards.
 * Makes asynchronous, non-blocking API calls that don't prevent navigation.
 * 
 * Requirements:
 * - 9.1: Call POST /api/resources/:id/visit endpoint
 * - 9.3: Non-blocking navigation on tracking failure
 * - 9.5: Asynchronous tracking without blocking navigation
 */

import { resourcesApi } from '@/lib/api/client';

/**
 * Track a resource visit
 * 
 * This function calls the visit tracking API endpoint asynchronously.
 * Errors are logged but do not throw, ensuring navigation is never blocked.
 * 
 * @param resourceId - The ID of the resource being visited
 * @returns Promise that resolves with visit tracking result or null on error
 */
export async function trackResourceVisit(resourceId: string): Promise<{
  alreadyVisited: boolean;
  xpAwarded: boolean;
  xpAmount?: number;
  newXP?: number;
  newLevel?: number;
  leveledUp?: boolean;
  message: string;
} | null> {
  try {
    const response = await resourcesApi.trackVisit(resourceId);
    
    if (response.success && response.data) {
      return response.data;
    }
    
    // API returned success: false
    console.error('[Resource Visit Tracking] API returned unsuccessful response:', response);
    return null;
  } catch (error) {
    // Log error without throwing - navigation should proceed
    console.error('[Resource Visit Tracking] Failed to track visit:', error);
    return null;
  }
}

/**
 * Sanitizes a URL to prevent XSS and open redirects via dangerous protocols
 *
 * @param url - The URL to sanitize
 * @returns The sanitized URL or '/' if invalid/dangerous
 */
function sanitizeUrl(url: string): string {
  if (!url) return '/';

  try {
    // We use a dummy base for parsing relative URLs
    const parsed = new URL(url, 'http://dummy.com');

    // Check for allowed protocols
    const isAllowed = ['http:', 'https:', 'mailto:', 'tel:'].includes(parsed.protocol.toLowerCase());

    if (!isAllowed) {
      console.warn(`[Security] Blocked unsafe URL protocol: ${parsed.protocol}`);
      return '/';
    }

    return url;
  } catch (e) {
    console.error('[Security] Failed to parse URL:', e);
    return '/';
  }
}

/**
 * Track visit and navigate to resource URL
 * 
 * This function tracks the visit asynchronously and then navigates to the resource URL.
 * Navigation proceeds regardless of whether tracking succeeds or fails.
 * 
 * @param resourceId - The ID of the resource being visited
 * @param resourceUrl - The URL to navigate to
 * @param openInNewTab - Whether to open in a new tab (default: true)
 */
export async function trackAndNavigate(
  resourceId: string,
  resourceUrl: string,
  openInNewTab: boolean = true
): Promise<void> {
  // Start tracking asynchronously (don't await)
  const trackingPromise = trackResourceVisit(resourceId);
  
  // Sanitize URL before navigation
  const safeUrl = sanitizeUrl(resourceUrl);

  // Navigate immediately without waiting for tracking to complete
  if (openInNewTab) {
    window.open(safeUrl, '_blank', 'noopener,noreferrer');
  } else {
    window.location.href = safeUrl;
  }
  
}
