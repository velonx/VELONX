/**
 * Tests for EventsToolbar Component
 * Feature: events-page-ui-improvements
 * Requirements: 1.1, 5.1-5.4
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import EventsToolbar from '../EventsToolbar';
import { EventSortOption } from '@/lib/types/events.types';

describe('EventsToolbar', () => {
  const defaultProps = {
    searchQuery: '',
    onSearchChange: vi.fn(),
    sortBy: 'date-asc' as EventSortOption,
    onSortChange: vi.fn(),
    resultsCount: 10,
  };

  it('renders search input', () => {
    render(<EventsToolbar {...defaultProps} />);
    
    const searchInput = screen.getByPlaceholderText('Search events...');
    expect(searchInput).toBeInTheDocument();
  });

  it('renders search icon', () => {
    render(<EventsToolbar {...defaultProps} />);
    
    const searchIcon = screen.getByLabelText('Search events').previousSibling;
    expect(searchIcon).toBeInTheDocument();
  });

  it('displays current search query', () => {
    render(<EventsToolbar {...defaultProps} searchQuery="workshop" />);
    
    const searchInput = screen.getByPlaceholderText('Search events...') as HTMLInputElement;
    expect(searchInput.value).toBe('workshop');
  });

  it('calls onSearchChange when typing', () => {
    const onSearchChange = vi.fn();
    render(<EventsToolbar {...defaultProps} onSearchChange={onSearchChange} />);
    
    const searchInput = screen.getByPlaceholderText('Search events...');
    fireEvent.change(searchInput, { target: { value: 'hackathon' } });
    
    expect(onSearchChange).toHaveBeenCalledWith('hackathon');
  });

  it('shows loading spinner when isSearching is true', () => {
    render(<EventsToolbar {...defaultProps} isSearching={true} />);
    
    const spinner = document.querySelector('.animate-spin');
    expect(spinner).toBeInTheDocument();
  });

  it('does not show loading spinner when isSearching is false', () => {
    render(<EventsToolbar {...defaultProps} isSearching={false} />);
    
    const spinner = document.querySelector('.animate-spin');
    expect(spinner).not.toBeInTheDocument();
  });

  it('renders sort dropdown', () => {
    render(<EventsToolbar {...defaultProps} />);
    
    const sortTrigger = screen.getByRole('combobox');
    expect(sortTrigger).toBeInTheDocument();
  });

  it('displays results count', () => {
    render(<EventsToolbar {...defaultProps} resultsCount={15} />);
    
    expect(screen.getByText('15')).toBeInTheDocument();
    expect(screen.getByText('events')).toBeInTheDocument();
  });

  it('displays singular "event" when count is 1', () => {
    render(<EventsToolbar {...defaultProps} resultsCount={1} />);
    
    expect(screen.getByText('1')).toBeInTheDocument();
    expect(screen.getByText('event')).toBeInTheDocument();
  });

  it('displays plural "events" when count is not 1', () => {
    render(<EventsToolbar {...defaultProps} resultsCount={0} />);
    
    expect(screen.getByText('0')).toBeInTheDocument();
    expect(screen.getByText('events')).toBeInTheDocument();
  });

  it('has accessible search input', () => {
    render(<EventsToolbar {...defaultProps} />);
    
    const searchInput = screen.getByLabelText('Search events');
    expect(searchInput).toBeInTheDocument();
  });

  it('applies responsive classes', () => {
    const { container } = render(<EventsToolbar {...defaultProps} />);
    
    // Check for responsive flex classes
    const toolbar = container.querySelector('.flex.flex-col.sm\\:flex-row');
    expect(toolbar).toBeInTheDocument();
  });

  it('renders with all sort options available', () => {
    render(<EventsToolbar {...defaultProps} />);
    
    const sortTrigger = screen.getByRole('combobox');
    expect(sortTrigger).toBeInTheDocument();
    
    // The select component should be present
    expect(sortTrigger).toHaveAttribute('data-slot', 'select-trigger');
  });
});
