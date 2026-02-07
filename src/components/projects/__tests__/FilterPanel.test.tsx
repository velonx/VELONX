/**
 * FilterPanel Component Tests
 * Feature: project-page-ui-improvements
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { vi } from 'vitest';
import { FilterPanel } from '../FilterPanel';
import { createEmptyFilters } from '@/lib/utils/project-filters';

describe('FilterPanel', () => {
  const mockOnChange = vi.fn();
  const mockTechStacks = ['React', 'TypeScript', 'Node.js', 'Python'];

  beforeEach(() => {
    mockOnChange.mockClear();
  });

  it('renders filter button with correct label', () => {
    render(
      <FilterPanel
        filters={createEmptyFilters()}
        onChange={mockOnChange}
        availableTechStacks={mockTechStacks}
        projectCount={10}
      />
    );

    expect(screen.getByRole('button', { name: /open filter panel/i })).toBeInTheDocument();
  });

  it('displays active filter count badge when filters are active', () => {
    const filters = {
      ...createEmptyFilters(),
      techStack: ['React', 'TypeScript'],
      difficulty: 'INTERMEDIATE' as const,
    };

    render(
      <FilterPanel
        filters={filters}
        onChange={mockOnChange}
        availableTechStacks={mockTechStacks}
        projectCount={5}
      />
    );

    expect(screen.getByLabelText(/2 active filters/i)).toBeInTheDocument();
  });

  it('does not display badge when no filters are active', () => {
    render(
      <FilterPanel
        filters={createEmptyFilters()}
        onChange={mockOnChange}
        availableTechStacks={mockTechStacks}
        projectCount={10}
      />
    );

    expect(screen.queryByLabelText(/active filters/i)).not.toBeInTheDocument();
  });

  it('displays project count', () => {
    render(
      <FilterPanel
        filters={createEmptyFilters()}
        onChange={mockOnChange}
        availableTechStacks={mockTechStacks}
        projectCount={42}
      />
    );

    // Open the popover
    fireEvent.click(screen.getByRole('button', { name: /open filter panel/i }));

    expect(screen.getByText(/42 projects found/i)).toBeInTheDocument();
  });

  it('has proper accessibility attributes', () => {
    render(
      <FilterPanel
        filters={createEmptyFilters()}
        onChange={mockOnChange}
        availableTechStacks={mockTechStacks}
        projectCount={10}
      />
    );

    const button = screen.getByRole('button', { name: /open filter panel/i });
    expect(button).toHaveAttribute('aria-label', 'Open filter panel');
  });
});
