/**
 * CategoryFilter Component Tests
 * Feature: resources-page-ui-improvements
 * 
 * Tests for CategoryFilter component functionality
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CategoryFilter } from '../CategoryFilter';
import { ResourceCategory } from '@/lib/types/resources.types';

describe('CategoryFilter', () => {
  const mockOnToggle = vi.fn();
  
  it('renders all 8 categories in pills mode', () => {
    render(
      <CategoryFilter
        selectedCategories={[]}
        onToggle={mockOnToggle}
        displayMode="pills"
      />
    );
    
    // Check that all 8 categories are rendered
    expect(screen.getByRole('button', { name: /Filter by Programming/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Filter by Design/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Filter by Business/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Filter by Data Science/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Filter by DevOps/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Filter by Mobile/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Filter by Web/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Filter by Other/i })).toBeInTheDocument();
  });
  
  it('shows visual indicator for selected categories', () => {
    render(
      <CategoryFilter
        selectedCategories={[ResourceCategory.PROGRAMMING]}
        onToggle={mockOnToggle}
        displayMode="pills"
      />
    );
    
    const programmingButton = screen.getByRole('button', { name: /Filter by Programming/i });
    expect(programmingButton).toHaveAttribute('aria-pressed', 'true');
  });
  
  it('calls onToggle when category is clicked', async () => {
    const user = userEvent.setup();
    
    render(
      <CategoryFilter
        selectedCategories={[]}
        onToggle={mockOnToggle}
        displayMode="pills"
      />
    );
    
    const designButton = screen.getByRole('button', { name: /Filter by Design/i });
    await user.click(designButton);
    
    expect(mockOnToggle).toHaveBeenCalledWith(ResourceCategory.DESIGN);
  });
  
  it('renders as dropdown in dropdown mode', () => {
    render(
      <CategoryFilter
        selectedCategories={[]}
        onToggle={mockOnToggle}
        displayMode="dropdown"
      />
    );
    
    // Should show dropdown trigger button
    expect(screen.getByRole('button', { name: /Category filter/i })).toBeInTheDocument();
  });
  
  it('shows selected count in dropdown mode', () => {
    render(
      <CategoryFilter
        selectedCategories={[ResourceCategory.PROGRAMMING, ResourceCategory.WEB]}
        onToggle={mockOnToggle}
        displayMode="dropdown"
      />
    );
    
    expect(screen.getByText('2')).toBeInTheDocument();
  });
});
