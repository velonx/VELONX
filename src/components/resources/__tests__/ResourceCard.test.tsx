/**
 * ResourceCard Component Tests
 * Feature: resources-page-ui-improvements
 * 
 * Tests for the ResourceCard component covering:
 * - Rendering with all fields present
 * - Rendering with missing imageUrl (fallback)
 * - Description truncation
 * - Click handling and visit tracking
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ResourceCard } from '../ResourceCard';
import { Resource } from '@/lib/api/types';
import { ResourceCategory, ResourceType } from '@/lib/types/resources.types';
import * as visitTracking from '@/lib/utils/resource-visit-tracking';

// Mock the visit tracking utility
vi.mock('@/lib/utils/resource-visit-tracking', () => ({
  trackResourceVisit: vi.fn(),
}));

describe('ResourceCard', () => {
  const mockResource: Resource = {
    id: 'resource-1',
    title: 'Test Resource',
    description: 'This is a test resource description',
    category: 'PROGRAMMING',
    type: 'ARTICLE',
    url: 'https://example.com/resource',
    imageUrl: 'https://example.com/image.jpg',
    accessCount: 1234,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  };
  
  beforeEach(() => {
    vi.clearAllMocks();
    // Mock window.open
    global.open = vi.fn();
    // Mock trackResourceVisit to resolve successfully by default
    vi.mocked(visitTracking.trackResourceVisit).mockResolvedValue({
      alreadyVisited: false,
      xpAwarded: true,
      xpAmount: 10,
      message: 'Earned 10 XP',
    });
  });
  
  it('renders resource with all fields', () => {
    render(<ResourceCard resource={mockResource} />);
    
    expect(screen.getByText('Test Resource')).toBeInTheDocument();
    expect(screen.getByText('This is a test resource description')).toBeInTheDocument();
    expect(screen.getByText('ARTICLE')).toBeInTheDocument();
    expect(screen.getByText('Programming')).toBeInTheDocument();
    expect(screen.getByText('1.2K')).toBeInTheDocument();
  });
  
  it('renders with missing imageUrl and uses placeholder', () => {
    const resourceWithoutImage = { ...mockResource, imageUrl: null };
    render(<ResourceCard resource={resourceWithoutImage} />);
    
    const img = screen.getByAltText('Test Resource');
    expect(img).toBeInTheDocument();
    // Placeholder should be a data URI
    expect(img.getAttribute('src')).toContain('data:image/svg+xml');
  });
  
  it('truncates long descriptions', () => {
    const longDescription = 'A'.repeat(200);
    const resourceWithLongDesc = { ...mockResource, description: longDescription };
    
    render(<ResourceCard resource={resourceWithLongDesc} />);
    
    const description = screen.getByText(/A+\.\.\./);
    expect(description.textContent?.length).toBeLessThanOrEqual(153); // 150 + '...'
  });
  
  it('calls trackResourceVisit and opens URL when clicked', async () => {
    render(<ResourceCard resource={mockResource} />);
    
    const card = screen.getByRole('button', { name: /View resource: Test Resource/i });
    fireEvent.click(card);
    
    await waitFor(() => {
      expect(visitTracking.trackResourceVisit).toHaveBeenCalledWith('resource-1');
      expect(global.open).toHaveBeenCalledWith(
        'https://example.com/resource',
        '_blank',
        'noopener,noreferrer'
      );
    });
  });
  
  it('opens URL even if visit tracking fails', async () => {
    vi.mocked(visitTracking.trackResourceVisit).mockRejectedValue(new Error('Tracking failed'));
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    
    render(<ResourceCard resource={mockResource} />);
    
    const card = screen.getByRole('button', { name: /View resource: Test Resource/i });
    fireEvent.click(card);
    
    await waitFor(() => {
      expect(visitTracking.trackResourceVisit).toHaveBeenCalledWith('resource-1');
      expect(global.open).toHaveBeenCalledWith(
        'https://example.com/resource',
        '_blank',
        'noopener,noreferrer'
      );
      expect(consoleSpy).toHaveBeenCalled();
    });
    
    consoleSpy.mockRestore();
  });
  
  it('formats access count correctly', () => {
    const testCases = [
      { count: 42, expected: '42' },
      { count: 1500, expected: '1.5K' },
      { count: 1234567, expected: '1.2M' },
    ];
    
    testCases.forEach(({ count, expected }) => {
      const resource = { ...mockResource, accessCount: count };
      const { rerender } = render(<ResourceCard resource={resource} />);
      
      expect(screen.getByText(expected)).toBeInTheDocument();
      
      // Clean up for next iteration
      rerender(<div />);
    });
  });
  
  it('displays correct type badge and icon', () => {
    const types: ResourceType[] = [
      ResourceType.ARTICLE,
      ResourceType.VIDEO,
      ResourceType.COURSE,
      ResourceType.BOOK,
      ResourceType.TOOL,
      ResourceType.DOCUMENTATION,
    ];
    
    types.forEach((type) => {
      const resource = { ...mockResource, type };
      const { rerender } = render(<ResourceCard resource={resource} />);
      
      expect(screen.getByText(type)).toBeInTheDocument();
      
      // Clean up for next iteration
      rerender(<div />);
    });
  });
  
  it('is keyboard accessible', async () => {
    render(<ResourceCard resource={mockResource} />);
    
    const card = screen.getByRole('button', { name: /View resource: Test Resource/i });
    
    // Test Enter key
    fireEvent.keyDown(card, { key: 'Enter' });
    
    await waitFor(() => {
      expect(visitTracking.trackResourceVisit).toHaveBeenCalledWith('resource-1');
    });
    
    vi.clearAllMocks();
    
    // Test Space key
    fireEvent.keyDown(card, { key: ' ' });
    
    await waitFor(() => {
      expect(visitTracking.trackResourceVisit).toHaveBeenCalledWith('resource-1');
    });
  });
  
  it('has proper ARIA labels', () => {
    render(<ResourceCard resource={mockResource} />);
    
    expect(screen.getByRole('button', { name: /View resource: Test Resource/i })).toBeInTheDocument();
    expect(screen.getByLabelText('1234 views')).toBeInTheDocument();
  });
});
