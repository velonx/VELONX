/**
 * EmptyState Component Tests
 * Feature: project-page-ui-improvements
 * 
 * Example tests for empty state variants.
 * 
 * Requirements:
 * - 6.3: Test no-running-projects variant
 * - 6.4: Test no-completed-projects variant
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { EmptyState } from '../EmptyState';

describe('EmptyState Component', () => {
  describe('Basic Rendering', () => {
    it('should render no-results variant', () => {
      render(<EmptyState type="no-results" />);
      
      expect(screen.getByText('No projects match your filters')).toBeInTheDocument();
      expect(screen.getByText(/Try adjusting your search terms/)).toBeInTheDocument();
    });

    it('should render no-projects variant', () => {
      render(<EmptyState type="no-projects" />);
      
      expect(screen.getByText('No running projects yet')).toBeInTheDocument();
      expect(screen.getByText(/Be the first to start a project/)).toBeInTheDocument();
    });

    it('should render no-completed variant', () => {
      render(<EmptyState type="no-completed" />);
      
      expect(screen.getByText('No completed projects yet')).toBeInTheDocument();
      expect(screen.getByText(/Keep working on your projects/)).toBeInTheDocument();
    });

    it('should have role="status" for accessibility', () => {
      const { container } = render(<EmptyState type="no-results" />);
      
      const status = container.querySelector('[role="status"]');
      expect(status).toBeInTheDocument();
    });

    it('should have aria-live="polite" for screen readers', () => {
      const { container } = render(<EmptyState type="no-results" />);
      
      const status = container.querySelector('[aria-live="polite"]');
      expect(status).toBeInTheDocument();
    });
  });

  describe('Icon Display', () => {
    it('should render Search icon for no-results variant', () => {
      const { container } = render(<EmptyState type="no-results" />);
      
      // Icon should be present and hidden from screen readers
      const iconContainer = container.querySelector('[aria-hidden="true"]');
      expect(iconContainer).toBeInTheDocument();
    });

    it('should render Code icon for no-projects variant', () => {
      const { container } = render(<EmptyState type="no-projects" />);
      
      const iconContainer = container.querySelector('[aria-hidden="true"]');
      expect(iconContainer).toBeInTheDocument();
    });

    it('should render CheckCircle icon for no-completed variant', () => {
      const { container } = render(<EmptyState type="no-completed" />);
      
      const iconContainer = container.querySelector('[aria-hidden="true"]');
      expect(iconContainer).toBeInTheDocument();
    });
  });

  describe('Call-to-Action Button', () => {
    it('should render CTA button when onAction is provided', () => {
      const handleAction = vi.fn();
      render(<EmptyState type="no-results" onAction={handleAction} />);
      
      const button = screen.getByRole('button', { name: 'Clear Filters' });
      expect(button).toBeInTheDocument();
    });

    it('should not render CTA button when onAction is not provided', () => {
      render(<EmptyState type="no-results" />);
      
      const button = screen.queryByRole('button');
      expect(button).not.toBeInTheDocument();
    });

    it('should call onAction when CTA button is clicked', async () => {
      const user = userEvent.setup();
      const handleAction = vi.fn();
      render(<EmptyState type="no-results" onAction={handleAction} />);
      
      const button = screen.getByRole('button', { name: 'Clear Filters' });
      await user.click(button);
      
      expect(handleAction).toHaveBeenCalledTimes(1);
    });

    it('should use default action label for no-results variant', () => {
      const handleAction = vi.fn();
      render(<EmptyState type="no-results" onAction={handleAction} />);
      
      expect(screen.getByRole('button', { name: 'Clear Filters' })).toBeInTheDocument();
    });

    it('should use default action label for no-projects variant', () => {
      const handleAction = vi.fn();
      render(<EmptyState type="no-projects" onAction={handleAction} />);
      
      expect(screen.getByRole('button', { name: 'Submit Project' })).toBeInTheDocument();
    });

    it('should not render CTA button for no-completed variant by default', () => {
      const handleAction = vi.fn();
      render(<EmptyState type="no-completed" onAction={handleAction} />);
      
      // no-completed variant has no default action label
      const button = screen.queryByRole('button');
      expect(button).not.toBeInTheDocument();
    });

    it('should use custom action label when provided', () => {
      const handleAction = vi.fn();
      render(
        <EmptyState
          type="no-results"
          onAction={handleAction}
          actionLabel="Reset All Filters"
        />
      );
      
      expect(screen.getByRole('button', { name: 'Reset All Filters' })).toBeInTheDocument();
    });

    it('should have proper aria-label on CTA button', () => {
      const handleAction = vi.fn();
      render(<EmptyState type="no-results" onAction={handleAction} />);
      
      const button = screen.getByRole('button', { name: 'Clear Filters' });
      expect(button).toHaveAttribute('aria-label', 'Clear Filters');
    });
  });

  describe('Requirement 6.3: No Running Projects Variant', () => {
    it('should display encouraging message to submit first project', () => {
      render(<EmptyState type="no-projects" />);
      
      expect(screen.getByText('No running projects yet')).toBeInTheDocument();
      expect(screen.getByText(/Be the first to start a project/)).toBeInTheDocument();
    });

    it('should display "Submit Project" CTA when action is provided', () => {
      const handleAction = vi.fn();
      render(<EmptyState type="no-projects" onAction={handleAction} />);
      
      const button = screen.getByRole('button', { name: 'Submit Project' });
      expect(button).toBeInTheDocument();
    });

    it('should call action handler when Submit Project is clicked', async () => {
      const user = userEvent.setup();
      const handleAction = vi.fn();
      render(<EmptyState type="no-projects" onAction={handleAction} />);
      
      const button = screen.getByRole('button', { name: 'Submit Project' });
      await user.click(button);
      
      expect(handleAction).toHaveBeenCalledTimes(1);
    });

    it('should have proper heading hierarchy', () => {
      render(<EmptyState type="no-projects" />);
      
      const heading = screen.getByRole('heading', { level: 2 });
      expect(heading).toHaveTextContent('No running projects yet');
    });

    it('should display Code icon for no-projects variant', () => {
      const { container } = render(<EmptyState type="no-projects" />);
      
      // Icon container should be present
      const iconContainer = container.querySelector('[aria-hidden="true"]');
      expect(iconContainer).toBeInTheDocument();
    });
  });

  describe('Requirement 6.4: No Completed Projects Variant', () => {
    it('should display encouraging message about future completions', () => {
      render(<EmptyState type="no-completed" />);
      
      expect(screen.getByText('No completed projects yet')).toBeInTheDocument();
      expect(screen.getByText(/Keep working on your projects/)).toBeInTheDocument();
    });

    it('should not display CTA button by default', () => {
      render(<EmptyState type="no-completed" />);
      
      const button = screen.queryByRole('button');
      expect(button).not.toBeInTheDocument();
    });

    it('should display custom CTA if provided', () => {
      const handleAction = vi.fn();
      render(
        <EmptyState
          type="no-completed"
          onAction={handleAction}
          actionLabel="View Running Projects"
        />
      );
      
      const button = screen.getByRole('button', { name: 'View Running Projects' });
      expect(button).toBeInTheDocument();
    });

    it('should have proper heading hierarchy', () => {
      render(<EmptyState type="no-completed" />);
      
      const heading = screen.getByRole('heading', { level: 2 });
      expect(heading).toHaveTextContent('No completed projects yet');
    });

    it('should display CheckCircle icon for no-completed variant', () => {
      const { container } = render(<EmptyState type="no-completed" />);
      
      // Icon container should be present
      const iconContainer = container.querySelector('[aria-hidden="true"]');
      expect(iconContainer).toBeInTheDocument();
    });

    it('should maintain positive and encouraging tone', () => {
      render(<EmptyState type="no-completed" />);
      
      // Check for encouraging language
      const description = screen.getByText(/Keep working on your projects/);
      expect(description).toBeInTheDocument();
      expect(description.textContent).toContain('will appear here');
    });
  });

  describe('Custom Styling', () => {
    it('should apply custom className to container', () => {
      const { container } = render(
        <EmptyState type="no-results" className="custom-class" />
      );
      
      const status = container.querySelector('[role="status"]');
      expect(status).toHaveClass('custom-class');
    });

    it('should maintain default styling with custom className', () => {
      const { container } = render(
        <EmptyState type="no-results" className="custom-class" />
      );
      
      const status = container.querySelector('[role="status"]');
      expect(status).toHaveClass('custom-class');
      expect(status).toHaveClass('flex');
      expect(status).toHaveClass('flex-col');
    });
  });

  describe('Accessibility', () => {
    it('should have proper heading structure', () => {
      render(<EmptyState type="no-results" />);
      
      const heading = screen.getByRole('heading', { level: 2 });
      expect(heading).toBeInTheDocument();
    });

    it('should hide decorative icon from screen readers', () => {
      const { container } = render(<EmptyState type="no-results" />);
      
      const iconContainer = container.querySelector('[aria-hidden="true"]');
      expect(iconContainer).toBeInTheDocument();
    });

    it('should have keyboard accessible CTA button', async () => {
      const user = userEvent.setup();
      const handleAction = vi.fn();
      render(<EmptyState type="no-results" onAction={handleAction} />);
      
      const button = screen.getByRole('button', { name: 'Clear Filters' });
      
      // Focus the button
      button.focus();
      expect(button).toHaveFocus();
      
      // Activate with Enter key
      await user.keyboard('{Enter}');
      expect(handleAction).toHaveBeenCalledTimes(1);
    });

    it('should announce status changes to screen readers', () => {
      const { container } = render(<EmptyState type="no-results" />);
      
      const status = container.querySelector('[aria-live="polite"]');
      expect(status).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('should handle missing onAction gracefully', () => {
      expect(() => {
        render(<EmptyState type="no-results" />);
      }).not.toThrow();
    });

    it('should handle empty actionLabel', () => {
      const handleAction = vi.fn();
      render(
        <EmptyState
          type="no-results"
          onAction={handleAction}
          actionLabel=""
        />
      );
      
      // Should not render button with empty label
      const button = screen.queryByRole('button');
      expect(button).not.toBeInTheDocument();
    });

    it('should handle very long custom action labels', () => {
      const handleAction = vi.fn();
      const longLabel = 'This is a very long action label that might cause layout issues';
      render(
        <EmptyState
          type="no-results"
          onAction={handleAction}
          actionLabel={longLabel}
        />
      );
      
      const button = screen.getByRole('button', { name: longLabel });
      expect(button).toBeInTheDocument();
    });

    it('should maintain layout with minimum height', () => {
      const { container } = render(<EmptyState type="no-results" />);
      
      const status = container.querySelector('[role="status"]');
      expect(status).toHaveClass('min-h-[400px]');
    });
  });
});
