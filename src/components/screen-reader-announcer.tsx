'use client';

import { useEffect, useState } from 'react';

interface AnnouncerProps {
  message: string;
  politeness?: 'polite' | 'assertive';
  clearAfter?: number;
}

/**
 * Screen Reader Announcer Component
 * Provides ARIA live region announcements for dynamic content updates
 */
export function ScreenReaderAnnouncer({ message, politeness = 'polite', clearAfter = 5000 }: AnnouncerProps) {
  const [announcement, setAnnouncement] = useState('');

  useEffect(() => {
    if (message) {
      setAnnouncement(message);
      
      if (clearAfter > 0) {
        const timer = setTimeout(() => {
          setAnnouncement('');
        }, clearAfter);
        
        return () => clearTimeout(timer);
      }
    }
  }, [message, clearAfter]);

  return (
    <div
      role="status"
      aria-live={politeness}
      aria-atomic="true"
      className="sr-only"
    >
      {announcement}
    </div>
  );
}

/**
 * Global Announcer Hook
 * Use this hook to announce messages to screen readers from anywhere in the app
 */
export function useScreenReaderAnnouncer() {
  const [message, setMessage] = useState('');
  const [politeness, setPoliteness] = useState<'polite' | 'assertive'>('polite');

  const announce = (text: string, level: 'polite' | 'assertive' = 'polite') => {
    setPoliteness(level);
    setMessage(text);
    
    // Clear after announcement
    setTimeout(() => setMessage(''), 100);
  };

  return { message, politeness, announce };
}
