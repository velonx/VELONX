/**
 * Skip Links Component
 * Requirement 9.1: Keyboard navigation with skip links
 * Provides keyboard users quick access to main content areas
 */

'use client';

import React from 'react';

interface SkipLinksProps {
  links?: Array<{
    href: string;
    label: string;
  }>;
}

export function SkipLinks({ links }: SkipLinksProps) {
  const defaultLinks = [
    { href: '#main-content', label: 'Skip to main content' },
    { href: '#main-navigation', label: 'Skip to navigation' },
  ];

  const skipLinks = links || defaultLinks;

  return (
    <div className="skip-links-container">
      {skipLinks.map((link) => (
        <a
          key={link.href}
          href={link.href}
          className="skip-to-main"
        >
          {link.label}
        </a>
      ))}
    </div>
  );
}

export default SkipLinks;
