/**
 * ActiveFiltersDisplay Component Tests
 * Feature: resources-page-ui-improvements
 * 
 * Tests for ActiveFiltersDisplay component functionality
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ActiveFiltersDisplay } from '../ActiveFiltersDisplay';
import { ResourceCategory, ResourceType } from '@/lib/types/resources.types';

describe('ActiveFiltersDisplay', () => {
  const mockOnClearAll = vi.fn();
  const mockOnRemoveFilter = vi.fn();
  
  it('does not render when no filters are active', () => {
    const { container } = render(
      <ActiveFiltersDisplay
        activeFilters={{
          categories: [],
          types: [],
        }}
        onClearAll={mockOnClearAll}
        onRemoveFilter={mockOnRemoveFilter}
      />
    );
    
    expect(container.firstChild).toBeNull();
  });
  
  it('displays correct count of active filters', () => {
    render(
      <ActiveFiltersDisplay
        activeFilters={{
          search: 'test',
          categories: [ResourceCategory.PROGRAMMING, ResourceCategory.WEB],
          types: [ResourceType.VIDEO],
        }}
        onClearAll={mockOnClearAll}
        onRemoveFilter={mockOnRemoveFilter}
      />
    );
    
    expect(screen.getByText('4')).toBeInTheDocument();
    expect(screen.getAllByText(/filters active/i).length).toBeGreaterThan(0);
  });
  
  it('displays search filter chip', () => {
    render(
      <ActiveFiltersDisplay
        activeFilters={{
          search: 'react',
          categories: [],
          types: [],
        }}
        onClearAll={mockOnClearAll}
        onRemoveFilter={mockOnRemoveFilter}
      />
    );
    
    expect(screen.getByText(/Search: "react"/i)).toBeInTheDocument();
  });
  
  it('displays category filter chips', () => {
    render(
      <ActiveFiltersDisplay
        activeFilters={{
          categories: [ResourceCategory.PROGRAMMING, ResourceCategory.DESIGN],
          types: [],
        }}
        onClearAll={mockOnClearAll}
        onRemoveFilter={mockOnRemoveFilter}
      />
    );
    
    expect(screen.getByText('Programming')).toBeInTheDocument();
    expect(screen.getByText('Design')).toBeInTheDocument();
  });
  
  it('displays type filter chips', () => {
    render(
      <ActiveFiltersDisplay
        activeFilters={{
          categories: [],
          types: [ResourceType.VIDEO, ResourceType.ARTICLE],
        }}
        onClearAll={mockOnClearAll}
        onRemoveFilter={mockOnRemoveFilter}
      />
    );
    
    expect(screen.getByText('Video')).toBeInTheDocument();
    expect(screen.getByText('Article')).toBeInTheDocument();
  });
  
  it('calls onRemoveFilter when chip remove button is clicked', async () => {
    const user = userEvent.setup();
    
    render(
      <ActiveFiltersDisplay
        activeFilters={{
          categories: [ResourceCategory.PROGRAMMING],
          types: [],
        }}
        onClearAll={mockOnClearAll}
        onRemoveFilter={mockOnRemoveFilter}
      />
    );
    
    const removeButton = screen.getByRole('button', { name: /Remove Programming filter/i });
    await user.click(removeButton);
    
    expect(mockOnRemoveFilter).toHaveBeenCalledWith('category', ResourceCategory.PROGRAMMING);
  });
  
  it('calls onClearAll when Clear All button is clicked', async () => {
    const user = userEvent.setup();
    
    render(
      <ActiveFiltersDisplay
        activeFilters={{
          search: 'test',
          categories: [ResourceCategory.PROGRAMMING],
          types: [ResourceType.VIDEO],
        }}
        onClearAll={mockOnClearAll}
        onRemoveFilter={mockOnRemoveFilter}
      />
    );
    
    const clearAllButton = screen.getByRole('button', { name: /Clear all/i });
    await user.click(clearAllButton);
    
    expect(mockOnClearAll).toHaveBeenCalled();
  });
  
  it('shows "Clear All Filters" button when filters are active', () => {
    render(
      <ActiveFiltersDisplay
        activeFilters={{
          categories: [ResourceCategory.PROGRAMMING],
          types: [],
        }}
        onClearAll={mockOnClearAll}
        onRemoveFilter={mockOnRemoveFilter}
      />
    );
    
    expect(screen.getByRole('button', { name: /Clear all/i })).toBeInTheDocument();
  });
});
