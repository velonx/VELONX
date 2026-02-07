/**
 * Tests for Resource Visit Tracking Utility
 * Feature: resources-page-ui-improvements
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { trackResourceVisit, trackAndNavigate } from '../resource-visit-tracking';
import { resourcesApi } from '@/lib/api/client';

// Mock the API client
vi.mock('@/lib/api/client', () => ({
  resourcesApi: {
    trackVisit: vi.fn(),
  },
}));

describe('trackResourceVisit', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Clear console mocks
    vi.spyOn(console, 'error').mockImplementation(() => {});
    vi.spyOn(console, 'log').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should return visit data on successful API call', async () => {
    const mockResponse = {
      success: true,
      data: {
        alreadyVisited: false,
        xpAwarded: true,
        xpAmount: 10,
        newXP: 110,
        newLevel: 2,
        leveledUp: false,
        message: 'Earned 10 XP',
      },
    };

    vi.mocked(resourcesApi.trackVisit).mockResolvedValue(mockResponse);

    const result = await trackResourceVisit('resource-123');

    expect(resourcesApi.trackVisit).toHaveBeenCalledWith('resource-123');
    expect(result).toEqual(mockResponse.data);
  });

  it('should return null and log error on API failure', async () => {
    const mockError = new Error('Network error');
    vi.mocked(resourcesApi.trackVisit).mockRejectedValue(mockError);

    const result = await trackResourceVisit('resource-123');

    expect(result).toBeNull();
    expect(console.error).toHaveBeenCalledWith(
      '[Resource Visit Tracking] Failed to track visit:',
      mockError
    );
  });

  it('should return null when API returns success: false', async () => {
    const mockResponse = {
      success: false,
      error: {
        code: 'UNAUTHORIZED',
        message: 'Not authenticated',
      },
    };

    vi.mocked(resourcesApi.trackVisit).mockResolvedValue(mockResponse as any);

    const result = await trackResourceVisit('resource-123');

    expect(result).toBeNull();
    expect(console.error).toHaveBeenCalledWith(
      '[Resource Visit Tracking] API returned unsuccessful response:',
      mockResponse
    );
  });

  it('should handle already visited resources', async () => {
    const mockResponse = {
      success: true,
      data: {
        alreadyVisited: true,
        xpAwarded: false,
        message: 'Resource already visited',
      },
    };

    vi.mocked(resourcesApi.trackVisit).mockResolvedValue(mockResponse);

    const result = await trackResourceVisit('resource-123');

    expect(result).toEqual(mockResponse.data);
    expect(result?.alreadyVisited).toBe(true);
    expect(result?.xpAwarded).toBe(false);
  });
});

describe('trackAndNavigate', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(console, 'error').mockImplementation(() => {});
    vi.spyOn(console, 'log').mockImplementation(() => {});
    
    // Mock window.open and window.location
    global.window.open = vi.fn();
    Object.defineProperty(window, 'location', {
      value: { href: '' },
      writable: true,
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should navigate in new tab by default', async () => {
    const mockResponse = {
      success: true,
      data: {
        alreadyVisited: false,
        xpAwarded: true,
        xpAmount: 10,
        message: 'Earned 10 XP',
      },
    };

    vi.mocked(resourcesApi.trackVisit).mockResolvedValue(mockResponse);

    await trackAndNavigate('resource-123', 'https://example.com/resource');

    expect(window.open).toHaveBeenCalledWith(
      'https://example.com/resource',
      '_blank',
      'noopener,noreferrer'
    );
  });

  it('should navigate in same tab when openInNewTab is false', async () => {
    const mockResponse = {
      success: true,
      data: {
        alreadyVisited: false,
        xpAwarded: true,
        xpAmount: 10,
        message: 'Earned 10 XP',
      },
    };

    vi.mocked(resourcesApi.trackVisit).mockResolvedValue(mockResponse);

    await trackAndNavigate('resource-123', 'https://example.com/resource', false);

    expect(window.location.href).toBe('https://example.com/resource');
  });

  it('should navigate even when tracking fails', async () => {
    const mockError = new Error('Network error');
    vi.mocked(resourcesApi.trackVisit).mockRejectedValue(mockError);

    await trackAndNavigate('resource-123', 'https://example.com/resource');

    // Navigation should still happen
    expect(window.open).toHaveBeenCalledWith(
      'https://example.com/resource',
      '_blank',
      'noopener,noreferrer'
    );
  });

  it('should log XP earned when tracking succeeds', async () => {
    const mockResponse = {
      success: true,
      data: {
        alreadyVisited: false,
        xpAwarded: true,
        xpAmount: 10,
        message: 'Earned 10 XP',
      },
    };

    vi.mocked(resourcesApi.trackVisit).mockResolvedValue(mockResponse);

    await trackAndNavigate('resource-123', 'https://example.com/resource');

    // Wait for async tracking to complete
    await new Promise(resolve => setTimeout(resolve, 10));

    expect(console.log).toHaveBeenCalledWith(
      '[Resource Visit Tracking] Earned 10 XP'
    );
  });

  it('should not log when no XP is awarded', async () => {
    const mockResponse = {
      success: true,
      data: {
        alreadyVisited: true,
        xpAwarded: false,
        message: 'Already visited',
      },
    };

    vi.mocked(resourcesApi.trackVisit).mockResolvedValue(mockResponse);

    await trackAndNavigate('resource-123', 'https://example.com/resource');

    // Wait for async tracking to complete
    await new Promise(resolve => setTimeout(resolve, 10));

    expect(console.log).not.toHaveBeenCalledWith(
      expect.stringContaining('Earned')
    );
  });
});
