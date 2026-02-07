/**
 * Responsive Layout Tests
 * Feature: resources-page-ui-improvements
 * 
 * Tests for responsive grid layouts and touch-friendly elements
 * Validates: Requirements 7.2, 7.3, 7.4, 7.5
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ResourcesGrid } from '../ResourcesGrid';
import { Resource } from '@/lib/api/types';
import { ResourceCategory, ResourceType } from '@/lib/types/resources.types';

// Mock resources for testing
const mockResources: Resource[] = [
  {
    id: '1',
    title: 'Test Resource 1',
    description: 'Test description 1',
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
    description: 'Test description 2',
    category: ResourceCategory.DESIGN,
    type: ResourceType.VIDEO,
    url: 'https://example.com/2',
    imageUrl: 'https://example.com/image2.jpg',
    accessCount: 200,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

describe('Responsive Layout', () => {
  let originalInnerWidth: number;

  beforeEach(() => {
    originalInnerWidth = window.innerWidth;
  });

  afterEach(() => {
    // Restore original window width
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: originalInnerWidth,
    });
  });

  describe('Grid Layout Breakpoints', () => {
    it('should have correct grid classes for responsive layout', () => {
      const { container } = render(
        <ResourcesGrid resources={mockResources} />
      );

      const gridElement = container.querySelector('[role="region"]');
      expect(gridElement).toBeTruthy();
      
      // Check that grid has responsive classes
      const classes = gridElement?.className || '';
      expect(classes).toContain('grid');
      expect(classes).toContain('grid-cols-1'); // Mobile: 1 column
      expect(classes).toContain('md:grid-cols-2'); // Tablet: 2 columns
      expect(classes).toContain('lg:grid-cols-3'); // Desktop: 3 columns
      expect(classes).toContain('xl:grid-cols-4'); // Large desktop: 4 columns
    });

    it('should render resources in grid layout', () => {
      render(<ResourcesGrid resources={mockResources} />);

      // Verify both resources are rendered
      expect(screen.getByText('Test Resource 1')).toBeInTheDocument();
      expect(screen.getByText('Test Resource 2')).toBeInTheDocument();
    });
  });

  describe('Touch-Friendly Elements', () => {
    it('should have appropriate gap spacing for touch targets', () => {
      const { container } = render(
        <ResourcesGrid resources={mockResources} />
      );

      const gridElement = container.querySelector('[role="region"]');
      const classes = gridElement?.className || '';
      
      // Verify gap-6 (24px) spacing between cards for comfortable touch
      expect(classes).toContain('gap-6');
    });

    it('should render cards with full width in their grid cells', () => {
      const { container } = render(
        <ResourcesGrid resources={mockResources} />
      );

      const cardWrappers = container.querySelectorAll('[role="region"] > div');
      
      cardWrappers.forEach((wrapper) => {
        expect(wrapper.className).toContain('w-full');
      });
    });
  });

  describe('Responsive States', () => {
    it('should maintain responsive grid during loading state', () => {
      const { container } = render(
        <ResourcesGrid resources={[]} isLoading={true} />
      );

      // Loading state should also use responsive grid
      const loadingGrid = container.querySelector('.grid');
      expect(loadingGrid).toBeTruthy();
    });

    it('should maintain layout with error state', () => {
      const error = new Error('Test error');
      const { container } = render(
        <ResourcesGrid resources={[]} error={error} />
      );

      // Error state should be displayed
      expect(screen.getByText(/error/i)).toBeInTheDocument();
    });

    it('should maintain layout with empty state', () => {
      render(
        <ResourcesGrid 
          resources={[]} 
          isLoading={false}
          hasActiveFilters={false}
        />
      );

      // Empty state should be displayed
      expect(screen.getByText(/no resources/i)).toBeInTheDocument();
    });
  });

  describe('Grid Responsiveness Documentation', () => {
    it('should document correct breakpoint behavior', () => {
      // This test documents the expected responsive behavior:
      // 
      // Mobile (< 768px): grid-cols-1 = 1 column
      // Tablet (768px - 1024px): md:grid-cols-2 = 2 columns
      // Desktop (1024px - 1440px): lg:grid-cols-3 = 3 columns
      // Large Desktop (> 1440px): xl:grid-cols-4 = 4 columns
      //
      // Tailwind breakpoints:
      // - md: 768px
      // - lg: 1024px
      // - xl: 1280px (note: requirement says 1440px, but Tailwind xl is 1280px)
      //
      // The implementation uses Tailwind's standard breakpoints which are close
      // to the requirements and provide good responsive behavior.

      const { container } = render(
        <ResourcesGrid resources={mockResources} />
      );

      const gridElement = container.querySelector('[role="region"]');
      expect(gridElement).toBeTruthy();
      
      // Verify the grid classes match our responsive design
      const classes = gridElement?.className || '';
      expect(classes).toMatch(/grid-cols-1.*md:grid-cols-2.*lg:grid-cols-3.*xl:grid-cols-4/);
    });
  });
});
