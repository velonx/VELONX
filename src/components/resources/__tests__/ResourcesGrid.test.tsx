/**
 * ResourcesGrid Component Tests
 * Feature: resources-page-ui-improvements
 * 
 * Tests for ResourcesGrid component and its state components.
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ResourcesGrid } from '../ResourcesGrid';
import { LoadingState } from '../LoadingState';
import { ErrorState } from '../ErrorState';
import { EmptyState } from '../EmptyState';
import { Resource } from '@/lib/api/types';
import { ResourceCategory, ResourceType } from '@/lib/types/resources.types';

// Mock the ResourceCard component
vi.mock('../ResourceCard', () => ({
  ResourceCard: ({ resource }: { resource: Resource }) => (
    <div data-testid={`resource-card-${resource.id}`}>{resource.title}</div>
  ),
}));

describe('LoadingState', () => {
  it('renders default number of skeleton cards', () => {
    const { container } = render(<LoadingState />);
    const skeletons = container.querySelectorAll('[aria-hidden="true"]');
    expect(skeletons.length).toBe(12);
  });

  it('renders custom number of skeleton cards', () => {
    const { container } = render(<LoadingState count={6} />);
    const skeletons = container.querySelectorAll('[aria-hidden="true"]');
    expect(skeletons.length).toBe(6);
  });

  it('has proper accessibility attributes', () => {
    render(<LoadingState />);
    const container = screen.getByRole('status');
    expect(container).toHaveAttribute('aria-busy', 'true');
    expect(container).toHaveAttribute('aria-live', 'polite');
  });
});

describe('ErrorState', () => {
  it('renders error message', () => {
    render(<ErrorState message="Test error message" />);
    expect(screen.getByText('Test error message')).toBeInTheDocument();
  });

  it('renders retry button when onRetry provided', () => {
    const onRetry = vi.fn();
    render(<ErrorState onRetry={onRetry} />);
    expect(screen.getByRole('button', { name: /retry loading resources/i })).toBeInTheDocument();
  });

  it('calls onRetry when retry button clicked', async () => {
    const onRetry = vi.fn();
    render(<ErrorState onRetry={onRetry} />);
    const retryButton = screen.getByRole('button', { name: /retry loading resources/i });
    await retryButton.click();
    expect(onRetry).toHaveBeenCalledTimes(1);
  });

  it('displays network error type correctly', () => {
    render(<ErrorState type="network" />);
    expect(screen.getByText('Network Error')).toBeInTheDocument();
  });

  it('displays server error type correctly', () => {
    render(<ErrorState type="server" />);
    expect(screen.getByText('Server Error')).toBeInTheDocument();
  });

  it('has proper accessibility attributes', () => {
    render(<ErrorState />);
    const alert = screen.getByRole('alert');
    expect(alert).toHaveAttribute('aria-live', 'polite');
  });
});

describe('EmptyState', () => {
  it('renders filtered empty state', () => {
    render(<EmptyState hasActiveFilters={true} />);
    expect(screen.getByText(/no resources match your filters/i)).toBeInTheDocument();
  });

  it('renders unfiltered empty state', () => {
    render(<EmptyState hasActiveFilters={false} />);
    expect(screen.getByText(/no resources available/i)).toBeInTheDocument();
  });

  it('shows clear filters button when filters active', () => {
    const onClearFilters = vi.fn();
    render(<EmptyState hasActiveFilters={true} onClearFilters={onClearFilters} />);
    expect(screen.getByRole('button', { name: /clear all filters/i })).toBeInTheDocument();
  });

  it('does not show clear filters button when no filters active', () => {
    render(<EmptyState hasActiveFilters={false} />);
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  it('calls onClearFilters when button clicked', async () => {
    const onClearFilters = vi.fn();
    render(<EmptyState hasActiveFilters={true} onClearFilters={onClearFilters} />);
    const clearButton = screen.getByRole('button', { name: /clear all filters/i });
    await clearButton.click();
    expect(onClearFilters).toHaveBeenCalledTimes(1);
  });
});

describe('ResourcesGrid', () => {
  const mockResources: Resource[] = [
    {
      id: '1',
      title: 'Test Resource 1',
      description: 'Description 1',
      category: ResourceCategory.PROGRAMMING,
      type: ResourceType.ARTICLE,
      url: 'https://example.com/1',
      imageUrl: 'https://example.com/image1.jpg',
      accessCount: 100,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: '2',
      title: 'Test Resource 2',
      description: 'Description 2',
      category: ResourceCategory.DESIGN,
      type: ResourceType.VIDEO,
      url: 'https://example.com/2',
      imageUrl: 'https://example.com/image2.jpg',
      accessCount: 200,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ];

  it('renders loading state when loading', () => {
    render(<ResourcesGrid resources={[]} isLoading={true} />);
    expect(screen.getByRole('status')).toBeInTheDocument();
    expect(screen.getByLabelText(/loading resources/i)).toBeInTheDocument();
  });

  it('renders error state when error exists', () => {
    const error = new Error('Test error');
    render(<ResourcesGrid resources={[]} error={error} />);
    expect(screen.getByRole('alert')).toBeInTheDocument();
    expect(screen.getByText('Test error')).toBeInTheDocument();
  });

  it('renders empty state when no resources', () => {
    render(<ResourcesGrid resources={[]} hasActiveFilters={false} />);
    expect(screen.getByText(/no resources available/i)).toBeInTheDocument();
  });

  it('renders resource cards when resources available', () => {
    render(<ResourcesGrid resources={mockResources} />);
    expect(screen.getByTestId('resource-card-1')).toBeInTheDocument();
    expect(screen.getByTestId('resource-card-2')).toBeInTheDocument();
  });

  it('shows refetching indicator when refetching', () => {
    render(<ResourcesGrid resources={mockResources} isRefetching={true} />);
    expect(screen.getByText(/updating resources/i)).toBeInTheDocument();
  });

  it('announces resource count to screen readers', () => {
    render(<ResourcesGrid resources={mockResources} />);
    expect(screen.getByText('2 resources displayed')).toBeInTheDocument();
  });

  it('announces single resource correctly', () => {
    render(<ResourcesGrid resources={[mockResources[0]]} />);
    expect(screen.getByText('1 resource displayed')).toBeInTheDocument();
  });

  it('has proper grid layout classes', () => {
    const { container } = render(<ResourcesGrid resources={mockResources} />);
    const grid = container.querySelector('.grid');
    expect(grid).toHaveClass('grid-cols-1', 'md:grid-cols-2', 'lg:grid-cols-3', 'xl:grid-cols-4');
  });
});
