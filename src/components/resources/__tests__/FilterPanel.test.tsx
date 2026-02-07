/**
 * FilterPanel Component Tests
 * Feature: resources-page-ui-improvements
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { FilterPanel } from '../FilterPanel';
import { ResourceCategory, ResourceType } from '@/lib/types/resources.types';

describe('FilterPanel', () => {
  const mockOnCategoryToggle = vi.fn();
  const mockOnTypeToggle = vi.fn();
  const mockOnClearAll = vi.fn();

  const defaultProps = {
    selectedCategories: [] as ResourceCategory[],
    selectedTypes: [] as ResourceType[],
    onCategoryToggle: mockOnCategoryToggle,
    onTypeToggle: mockOnTypeToggle,
    onClearAll: mockOnClearAll,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render filter button', () => {
    render(<FilterPanel {...defaultProps} />);
    expect(screen.getByRole('button', { name: /open filter panel/i })).toBeInTheDocument();
  });

  it('should show active filter count badge when filters are selected', () => {
    render(
      <FilterPanel
        {...defaultProps}
        selectedCategories={['PROGRAMMING', 'DESIGN']}
        selectedTypes={['VIDEO']}
      />
    );
    
    expect(screen.getByLabelText('3 active filters')).toBeInTheDocument();
  });

  it('should not show badge when no filters are active', () => {
    render(<FilterPanel {...defaultProps} />);
    expect(screen.queryByLabelText(/active filters/i)).not.toBeInTheDocument();
  });

  it('should display resource count when provided', () => {
    render(<FilterPanel {...defaultProps} resourceCount={42} />);
    
    // Open the popover
    fireEvent.click(screen.getByRole('button', { name: /open filter panel/i }));
    
    expect(screen.getByText('42 resources found')).toBeInTheDocument();
  });

  it('should display singular "resource" for count of 1', () => {
    render(<FilterPanel {...defaultProps} resourceCount={1} />);
    
    // Open the popover
    fireEvent.click(screen.getByRole('button', { name: /open filter panel/i }));
    
    expect(screen.getByText('1 resource found')).toBeInTheDocument();
  });

  it('should show Clear All button when filters are active', () => {
    render(
      <FilterPanel
        {...defaultProps}
        selectedCategories={['PROGRAMMING']}
      />
    );
    
    // Open the popover
    fireEvent.click(screen.getByRole('button', { name: /open filter panel/i }));
    
    expect(screen.getByRole('button', { name: /clear all filters/i })).toBeInTheDocument();
  });

  it('should not show Clear All button when no filters are active', () => {
    render(<FilterPanel {...defaultProps} />);
    
    // Open the popover
    fireEvent.click(screen.getByRole('button', { name: /open filter panel/i }));
    
    expect(screen.queryByRole('button', { name: /clear all filters/i })).not.toBeInTheDocument();
  });

  it('should call onClearAll when Clear All button is clicked', () => {
    render(
      <FilterPanel
        {...defaultProps}
        selectedCategories={['PROGRAMMING']}
      />
    );
    
    // Open the popover
    fireEvent.click(screen.getByRole('button', { name: /open filter panel/i }));
    
    // Click Clear All
    fireEvent.click(screen.getByRole('button', { name: /clear all filters/i }));
    
    expect(mockOnClearAll).toHaveBeenCalledTimes(1);
  });

  it('should display all category options', () => {
    render(<FilterPanel {...defaultProps} />);
    
    // Open the popover
    fireEvent.click(screen.getByRole('button', { name: /open filter panel/i }));
    
    // Check for all categories
    expect(screen.getByLabelText(/filter by programming category/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/filter by design category/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/filter by business category/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/filter by data science category/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/filter by devops category/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/filter by mobile category/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/filter by web category/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/filter by other category/i)).toBeInTheDocument();
  });

  it('should display all type options', () => {
    render(<FilterPanel {...defaultProps} />);
    
    // Open the popover
    fireEvent.click(screen.getByRole('button', { name: /open filter panel/i }));
    
    // Check for all types
    expect(screen.getByLabelText(/filter by article type/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/filter by video type/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/filter by course type/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/filter by book type/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/filter by tool type/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/filter by documentation type/i)).toBeInTheDocument();
  });

  it('should call onCategoryToggle when category checkbox is clicked', () => {
    render(<FilterPanel {...defaultProps} />);
    
    // Open the popover
    fireEvent.click(screen.getByRole('button', { name: /open filter panel/i }));
    
    // Click Programming category
    fireEvent.click(screen.getByLabelText(/filter by programming category/i));
    
    expect(mockOnCategoryToggle).toHaveBeenCalledWith('PROGRAMMING');
  });

  it('should call onTypeToggle when type checkbox is clicked', () => {
    render(<FilterPanel {...defaultProps} />);
    
    // Open the popover
    fireEvent.click(screen.getByRole('button', { name: /open filter panel/i }));
    
    // Click Video type
    fireEvent.click(screen.getByLabelText(/filter by video type/i));
    
    expect(mockOnTypeToggle).toHaveBeenCalledWith('VIDEO');
  });

  it('should show selected categories as checked', () => {
    render(
      <FilterPanel
        {...defaultProps}
        selectedCategories={['PROGRAMMING', 'DESIGN']}
      />
    );
    
    // Open the popover
    fireEvent.click(screen.getByRole('button', { name: /open filter panel/i }));
    
    const programmingCheckbox = screen.getByLabelText(/filter by programming category/i);
    const designCheckbox = screen.getByLabelText(/filter by design category/i);
    const businessCheckbox = screen.getByLabelText(/filter by business category/i);
    
    expect(programmingCheckbox).toBeChecked();
    expect(designCheckbox).toBeChecked();
    expect(businessCheckbox).not.toBeChecked();
  });

  it('should show selected types as checked', () => {
    render(
      <FilterPanel
        {...defaultProps}
        selectedTypes={['VIDEO', 'COURSE']}
      />
    );
    
    // Open the popover
    fireEvent.click(screen.getByRole('button', { name: /open filter panel/i }));
    
    const videoCheckbox = screen.getByLabelText(/filter by video type/i);
    const courseCheckbox = screen.getByLabelText(/filter by course type/i);
    const articleCheckbox = screen.getByLabelText(/filter by article type/i);
    
    expect(videoCheckbox).toBeChecked();
    expect(courseCheckbox).toBeChecked();
    expect(articleCheckbox).not.toBeChecked();
  });

  it('should have proper ARIA labels for accessibility', () => {
    render(<FilterPanel {...defaultProps} />);
    
    // Open the popover
    fireEvent.click(screen.getByRole('button', { name: /open filter panel/i }));
    
    expect(screen.getByRole('dialog', { name: /filter options/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/filter by category/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/filter by type/i)).toBeInTheDocument();
  });
});
