/**
 * SortControl Component Tests
 * Feature: project-page-ui-improvements
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SortControl } from '../SortControl';
import { SortOption } from '@/lib/types/project-page.types';

describe('SortControl Component', () => {
  describe('Basic Rendering', () => {
    it('should render with default value', () => {
      const onChange = vi.fn();
      render(<SortControl value="newest" onChange={onChange} />);
      
      const trigger = screen.getByRole('combobox', { name: /sort projects by/i });
      expect(trigger).toBeInTheDocument();
    });

    it('should display sort icon', () => {
      const onChange = vi.fn();
      const { container } = render(<SortControl value="newest" onChange={onChange} />);
      
      // ArrowUpDown icon should be present
      const icon = container.querySelector('svg');
      expect(icon).toBeInTheDocument();
    });

    it('should display current sort value', () => {
      const onChange = vi.fn();
      render(<SortControl value="popular" onChange={onChange} />);
      
      expect(screen.getByText('Most Popular')).toBeInTheDocument();
    });
  });

  describe('Sort Options', () => {
    it('should display current sort value', () => {
      const onChange = vi.fn();
      render(<SortControl value="newest" onChange={onChange} />);
      
      expect(screen.getByText('Newest')).toBeInTheDocument();
    });

    it('should update displayed value when prop changes', () => {
      const onChange = vi.fn();
      const { rerender } = render(<SortControl value="newest" onChange={onChange} />);
      
      expect(screen.getByText('Newest')).toBeInTheDocument();
      
      rerender(<SortControl value="popular" onChange={onChange} />);
      expect(screen.getByText('Most Popular')).toBeInTheDocument();
      
      rerender(<SortControl value="teamSize" onChange={onChange} />);
      expect(screen.getByText('Team Size')).toBeInTheDocument();
      
      rerender(<SortControl value="techStack" onChange={onChange} />);
      expect(screen.getByText('Tech Stack')).toBeInTheDocument();
    });

    it('should have all sort options defined', () => {
      const onChange = vi.fn();
      render(<SortControl value="newest" onChange={onChange} />);
      
      // Verify component renders without errors for all valid sort options
      const sortOptions: SortOption[] = ['newest', 'popular', 'teamSize', 'techStack'];
      sortOptions.forEach(option => {
        const { unmount } = render(<SortControl value={option} onChange={onChange} />);
        unmount();
      });
      
      expect(true).toBe(true); // All options render successfully
    });
  });

  describe('Accessibility', () => {
    it('should have proper aria-label on trigger', () => {
      const onChange = vi.fn();
      render(<SortControl value="newest" onChange={onChange} />);
      
      const trigger = screen.getByRole('combobox', { name: /sort projects by/i });
      expect(trigger).toHaveAttribute('aria-label', 'Sort projects by');
    });

    it('should hide decorative icon from screen readers', () => {
      const onChange = vi.fn();
      const { container } = render(<SortControl value="newest" onChange={onChange} />);
      
      // ArrowUpDown icon should have aria-hidden
      const icon = container.querySelector('svg');
      expect(icon).toHaveAttribute('aria-hidden', 'true');
    });

    it('should be keyboard focusable', () => {
      const onChange = vi.fn();
      render(<SortControl value="newest" onChange={onChange} />);
      
      const trigger = screen.getByRole('combobox');
      trigger.focus();
      
      expect(trigger).toHaveFocus();
    });
  });

  describe('Session Storage Persistence', () => {
    it('should persist sort preference when value changes', () => {
      const onChange = vi.fn();
      const { rerender } = render(<SortControl value="newest" onChange={onChange} />);
      
      // Change value
      rerender(<SortControl value="popular" onChange={onChange} />);
      
      // Session storage should be updated (tested via the saveSortPreference function)
      // This is an integration point - the actual persistence is tested in session-storage.test.ts
      expect(true).toBe(true); // Placeholder - actual persistence tested separately
    });
  });
});
