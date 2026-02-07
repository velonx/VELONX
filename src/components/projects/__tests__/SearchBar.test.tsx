/**
 * SearchBar Component Tests
 * Feature: project-page-ui-improvements
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { SearchBar } from '../SearchBar';

describe('SearchBar Component', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  describe('Basic Rendering', () => {
    it('should render with default placeholder', () => {
      const onChange = vi.fn();
      render(<SearchBar value="" onChange={onChange} />);
      
      const input = screen.getByRole('textbox', { name: /search projects/i });
      expect(input).toBeInTheDocument();
      expect(input).toHaveAttribute('placeholder', 'Search projects...');
    });

    it('should render with custom placeholder', () => {
      const onChange = vi.fn();
      render(
        <SearchBar 
          value="" 
          onChange={onChange} 
          placeholder="Find a project..." 
        />
      );
      
      const input = screen.getByRole('textbox');
      expect(input).toHaveAttribute('placeholder', 'Find a project...');
    });

    it('should display search icon', () => {
      const onChange = vi.fn();
      const { container } = render(<SearchBar value="" onChange={onChange} />);
      
      // Search icon should be present (lucide-react Search component)
      const searchIcon = container.querySelector('svg');
      expect(searchIcon).toBeInTheDocument();
    });

    it('should display current value', () => {
      const onChange = vi.fn();
      render(<SearchBar value="React" onChange={onChange} />);
      
      const input = screen.getByRole('textbox');
      expect(input).toHaveValue('React');
    });
  });

  describe('Input Handling', () => {
    it('should update local value immediately on input', () => {
      const onChange = vi.fn();
      
      render(<SearchBar value="" onChange={onChange} />);
      const input = screen.getByRole('textbox');
      
      fireEvent.change(input, { target: { value: 'React' } });
      
      expect(input).toHaveValue('React');
    });

    it('should call onChange after 300ms debounce', () => {
      const onChange = vi.fn();
      render(<SearchBar value="" onChange={onChange} />);
      
      const input = screen.getByRole('textbox');
      fireEvent.change(input, { target: { value: 'React' } });
      
      // Should not call immediately
      expect(onChange).not.toHaveBeenCalled();
      
      // Fast-forward 300ms
      act(() => {
        vi.advanceTimersByTime(300);
      });
      
      // Should call after debounce
      expect(onChange).toHaveBeenCalledWith('React');
    });

    it('should debounce multiple rapid inputs', () => {
      const onChange = vi.fn();
      render(<SearchBar value="" onChange={onChange} />);
      
      const input = screen.getByRole('textbox');
      
      // Type multiple characters rapidly
      fireEvent.change(input, { target: { value: 'R' } });
      act(() => {
        vi.advanceTimersByTime(100);
      });
      
      fireEvent.change(input, { target: { value: 'Re' } });
      act(() => {
        vi.advanceTimersByTime(100);
      });
      
      fireEvent.change(input, { target: { value: 'Rea' } });
      act(() => {
        vi.advanceTimersByTime(100);
      });
      
      fireEvent.change(input, { target: { value: 'Reac' } });
      act(() => {
        vi.advanceTimersByTime(100);
      });
      
      fireEvent.change(input, { target: { value: 'React' } });
      
      // Should not have called onChange yet
      expect(onChange).not.toHaveBeenCalled();
      
      // Fast-forward remaining time
      act(() => {
        vi.advanceTimersByTime(300);
      });
      
      // Should only call once with final value
      expect(onChange).toHaveBeenCalledTimes(1);
      expect(onChange).toHaveBeenCalledWith('React');
    });
  });

  describe('Clear Button', () => {
    it('should show clear button when input has value', () => {
      const onChange = vi.fn();
      render(<SearchBar value="React" onChange={onChange} />);
      
      const clearButton = screen.getByRole('button', { name: /clear search/i });
      expect(clearButton).toBeInTheDocument();
    });

    it('should not show clear button when input is empty', () => {
      const onChange = vi.fn();
      render(<SearchBar value="" onChange={onChange} />);
      
      const clearButton = screen.queryByRole('button', { name: /clear search/i });
      expect(clearButton).not.toBeInTheDocument();
    });

    it('should clear input when clear button is clicked', () => {
      const onChange = vi.fn();
      
      render(<SearchBar value="React" onChange={onChange} />);
      
      const clearButton = screen.getByRole('button', { name: /clear search/i });
      fireEvent.click(clearButton);
      
      const input = screen.getByRole('textbox');
      expect(input).toHaveValue('');
      expect(onChange).toHaveBeenCalledWith('');
    });

    it('should clear input when Escape key is pressed', async () => {
      const onChange = vi.fn();
      render(<SearchBar value="React" onChange={onChange} />);
      
      const input = screen.getByRole('textbox');
      fireEvent.keyDown(input, { key: 'Escape' });
      
      expect(input).toHaveValue('');
      expect(onChange).toHaveBeenCalledWith('');
    });

    it('should not clear when Escape is pressed on empty input', async () => {
      const onChange = vi.fn();
      render(<SearchBar value="" onChange={onChange} />);
      
      const input = screen.getByRole('textbox');
      fireEvent.keyDown(input, { key: 'Escape' });
      
      expect(onChange).not.toHaveBeenCalled();
    });
  });

  describe('Loading State', () => {
    it('should show loading spinner when isLoading is true', () => {
      const onChange = vi.fn();
      const { container } = render(
        <SearchBar value="React" onChange={onChange} isLoading={true} />
      );
      
      // Loading spinner should be present (Loader2 icon with animate-spin)
      const spinner = container.querySelector('.animate-spin');
      expect(spinner).toBeInTheDocument();
    });

    it('should not show loading spinner when isLoading is false', () => {
      const onChange = vi.fn();
      const { container } = render(
        <SearchBar value="React" onChange={onChange} isLoading={false} />
      );
      
      const spinner = container.querySelector('.animate-spin');
      expect(spinner).not.toBeInTheDocument();
    });

    it('should show both clear button and loading spinner when both are active', () => {
      const onChange = vi.fn();
      const { container } = render(
        <SearchBar value="React" onChange={onChange} isLoading={true} />
      );
      
      const clearButton = screen.getByRole('button', { name: /clear search/i });
      const spinner = container.querySelector('.animate-spin');
      
      expect(clearButton).toBeInTheDocument();
      expect(spinner).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have proper aria-label on input', () => {
      const onChange = vi.fn();
      render(<SearchBar value="" onChange={onChange} />);
      
      const input = screen.getByRole('textbox', { 
        name: /search projects by name or description/i 
      });
      expect(input).toBeInTheDocument();
    });

    it('should have aria-describedby pointing to results count', () => {
      const onChange = vi.fn();
      render(<SearchBar value="" onChange={onChange} />);
      
      const input = screen.getByRole('textbox');
      expect(input).toHaveAttribute('aria-describedby', 'search-results-count');
    });

    it('should announce results count to screen readers', () => {
      const onChange = vi.fn();
      render(
        <SearchBar value="React" onChange={onChange} resultsCount={5} />
      );
      
      const announcement = screen.getByRole('status');
      expect(announcement).toHaveTextContent('5 projects found');
    });

    it('should use singular form for single result', () => {
      const onChange = vi.fn();
      render(
        <SearchBar value="React" onChange={onChange} resultsCount={1} />
      );
      
      const announcement = screen.getByRole('status');
      expect(announcement).toHaveTextContent('1 project found');
    });

    it('should not announce when search is empty', () => {
      const onChange = vi.fn();
      render(
        <SearchBar value="" onChange={onChange} resultsCount={10} />
      );
      
      const announcement = screen.getByRole('status');
      expect(announcement).toHaveTextContent('');
    });

    it('should have aria-live="polite" on results announcement', () => {
      const onChange = vi.fn();
      render(<SearchBar value="" onChange={onChange} />);
      
      const announcement = screen.getByRole('status');
      expect(announcement).toHaveAttribute('aria-live', 'polite');
    });

    it('should have aria-atomic="true" on results announcement', () => {
      const onChange = vi.fn();
      render(<SearchBar value="" onChange={onChange} />);
      
      const announcement = screen.getByRole('status');
      expect(announcement).toHaveAttribute('aria-atomic', 'true');
    });

    it('should have aria-label on clear button', () => {
      const onChange = vi.fn();
      render(<SearchBar value="React" onChange={onChange} />);
      
      const clearButton = screen.getByRole('button', { name: /clear search/i });
      expect(clearButton).toHaveAttribute('aria-label', 'Clear search');
    });

    it('should hide decorative icons from screen readers', () => {
      const onChange = vi.fn();
      const { container } = render(
        <SearchBar value="React" onChange={onChange} isLoading={true} />
      );
      
      // All SVG icons should have aria-hidden="true"
      const icons = container.querySelectorAll('svg');
      icons.forEach(icon => {
        expect(icon).toHaveAttribute('aria-hidden', 'true');
      });
    });
  });

  describe('Keyboard Accessibility', () => {
    it('should be keyboard focusable', () => {
      const onChange = vi.fn();
      render(<SearchBar value="" onChange={onChange} />);
      
      const input = screen.getByRole('textbox');
      input.focus();
      
      expect(input).toHaveFocus();
    });

    it('should allow typing with keyboard', () => {
      const onChange = vi.fn();
      
      render(<SearchBar value="" onChange={onChange} />);
      const input = screen.getByRole('textbox');
      
      input.focus();
      fireEvent.change(input, { target: { value: 'React' } });
      
      expect(input).toHaveValue('React');
    });

    it('should allow clearing with keyboard (Escape)', () => {
      const onChange = vi.fn();
      render(<SearchBar value="React" onChange={onChange} />);
      
      const input = screen.getByRole('textbox');
      fireEvent.keyDown(input, { key: 'Escape' });
      
      expect(input).toHaveValue('');
    });
  });

  describe('External Value Updates', () => {
    it('should update local value when prop value changes', () => {
      const onChange = vi.fn();
      const { rerender } = render(<SearchBar value="" onChange={onChange} />);
      
      const input = screen.getByRole('textbox');
      expect(input).toHaveValue('');
      
      rerender(<SearchBar value="React" onChange={onChange} />);
      expect(input).toHaveValue('React');
    });

    it('should sync with external value changes', () => {
      const onChange = vi.fn();
      const { rerender } = render(<SearchBar value="React" onChange={onChange} />);
      
      const input = screen.getByRole('textbox');
      expect(input).toHaveValue('React');
      
      rerender(<SearchBar value="TypeScript" onChange={onChange} />);
      expect(input).toHaveValue('TypeScript');
    });
  });

  describe('Custom Styling', () => {
    it('should apply custom className', () => {
      const onChange = vi.fn();
      const { container } = render(
        <SearchBar value="" onChange={onChange} className="custom-class" />
      );
      
      const wrapper = container.firstChild;
      expect(wrapper).toHaveClass('custom-class');
    });
  });
});
