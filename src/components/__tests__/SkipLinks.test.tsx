/**
 * Tests for SkipLinks component
 * Requirement 9.1: Skip links for keyboard navigation
 */

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import SkipLinks from '../SkipLinks';

describe('SkipLinks', () => {
  it('should render default skip links', () => {
    render(<SkipLinks />);

    expect(screen.getByText('Skip to main content')).toBeInTheDocument();
    expect(screen.getByText('Skip to navigation')).toBeInTheDocument();
  });

  it('should render custom skip links', () => {
    const customLinks = [
      { href: '#custom-content', label: 'Skip to custom content' },
      { href: '#custom-nav', label: 'Skip to custom navigation' },
    ];

    render(<SkipLinks links={customLinks} />);

    expect(screen.getByText('Skip to custom content')).toBeInTheDocument();
    expect(screen.getByText('Skip to custom navigation')).toBeInTheDocument();
  });

  it('should have correct href attributes', () => {
    render(<SkipLinks />);

    const mainLink = screen.getByText('Skip to main content');
    const navLink = screen.getByText('Skip to navigation');

    expect(mainLink).toHaveAttribute('href', '#main-content');
    expect(navLink).toHaveAttribute('href', '#main-navigation');
  });

  it('should have skip-to-main class', () => {
    render(<SkipLinks />);

    const mainLink = screen.getByText('Skip to main content');

    expect(mainLink).toHaveClass('skip-to-main');
  });

  it('should render multiple custom links', () => {
    const customLinks = [
      { href: '#section1', label: 'Skip to section 1' },
      { href: '#section2', label: 'Skip to section 2' },
      { href: '#section3', label: 'Skip to section 3' },
    ];

    render(<SkipLinks links={customLinks} />);

    expect(screen.getByText('Skip to section 1')).toBeInTheDocument();
    expect(screen.getByText('Skip to section 2')).toBeInTheDocument();
    expect(screen.getByText('Skip to section 3')).toBeInTheDocument();
  });

  it('should be keyboard accessible', () => {
    render(<SkipLinks />);

    const mainLink = screen.getByText('Skip to main content');

    expect(mainLink.tagName).toBe('A');
    expect(mainLink).toHaveAttribute('href');
  });
});
