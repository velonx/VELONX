/**
 * TypeFilter Component Tests
 * Feature: resources-page-ui-improvements
 * 
 * Tests for TypeFilter component functionality
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TypeFilter } from '../TypeFilter';
import { ResourceType } from '@/lib/types/resources.types';

describe('TypeFilter', () => {
  const mockOnToggle = vi.fn();
  
  it('renders all 6 types in pills mode', () => {
    render(
      <TypeFilter
        selectedTypes={[]}
        onToggle={mockOnToggle}
        displayMode="pills"
      />
    );
    
    // Check that all 6 types are rendered
    expect(screen.getByRole('button', { name: /Filter by Article/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Filter by Video/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Filter by Course/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Filter by Book/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Filter by Tool/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Filter by Documentation/i })).toBeInTheDocument();
  });
  
  it('supports multi-select functionality', () => {
    render(
      <TypeFilter
        selectedTypes={[ResourceType.VIDEO, ResourceType.ARTICLE]}
        onToggle={mockOnToggle}
        displayMode="pills"
      />
    );
    
    const videoButton = screen.getByRole('button', { name: /Filter by Video/i });
    const articleButton = screen.getByRole('button', { name: /Filter by Article/i });
    
    expect(videoButton).toHaveAttribute('aria-pressed', 'true');
    expect(articleButton).toHaveAttribute('aria-pressed', 'true');
  });
  
  it('calls onToggle when type is clicked', async () => {
    const user = userEvent.setup();
    
    render(
      <TypeFilter
        selectedTypes={[]}
        onToggle={mockOnToggle}
        displayMode="pills"
      />
    );
    
    const courseButton = screen.getByRole('button', { name: /Filter by Course/i });
    await user.click(courseButton);
    
    expect(mockOnToggle).toHaveBeenCalledWith(ResourceType.COURSE);
  });
  
  it('renders as dropdown in dropdown mode', () => {
    render(
      <TypeFilter
        selectedTypes={[]}
        onToggle={mockOnToggle}
        displayMode="dropdown"
      />
    );
    
    // Should show dropdown trigger button
    expect(screen.getByRole('button', { name: /Type filter/i })).toBeInTheDocument();
  });
  
  it('shows selected count in dropdown mode', () => {
    render(
      <TypeFilter
        selectedTypes={[ResourceType.VIDEO, ResourceType.COURSE, ResourceType.BOOK]}
        onToggle={mockOnToggle}
        displayMode="dropdown"
      />
    );
    
    expect(screen.getByText('3')).toBeInTheDocument();
  });
});
