/**
 * Custom hook for keyboard navigation and shortcuts
 * Requirement 9.1: Keyboard navigation support
 * Requirement 9.2: Visible focus indicators
 */

import { useEffect, useCallback, RefObject } from 'react';

interface KeyboardShortcut {
  key: string;
  ctrlKey?: boolean;
  shiftKey?: boolean;
  altKey?: boolean;
  metaKey?: boolean;
  handler: (event: KeyboardEvent) => void;
  description?: string;
}

interface UseKeyboardNavigationOptions {
  shortcuts?: KeyboardShortcut[];
  enableFocusTracking?: boolean;
  trapFocus?: boolean;
  containerRef?: RefObject<HTMLElement>;
}

export function useKeyboardNavigation(options: UseKeyboardNavigationOptions = {}) {
  const {
    shortcuts = [],
    enableFocusTracking = true,
    trapFocus = false,
    containerRef,
  } = options;

  // Track keyboard usage to show focus indicators
  useEffect(() => {
    if (!enableFocusTracking) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Tab key indicates keyboard navigation
      if (e.key === 'Tab') {
        document.body.classList.add('using-keyboard');
      }
    };

    const handleMouseDown = () => {
      document.body.classList.remove('using-keyboard');
    };

    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('mousedown', handleMouseDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('mousedown', handleMouseDown);
    };
  }, [enableFocusTracking]);

  // Handle keyboard shortcuts
  useEffect(() => {
    if (shortcuts.length === 0) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      // Don't trigger shortcuts when typing in input fields
      const target = event.target as HTMLElement;
      const isInputField =
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable;

      // Allow Escape key even in input fields
      if (event.key !== 'Escape' && isInputField) {
        return;
      }

      shortcuts.forEach((shortcut) => {
        const keyMatches = event.key === shortcut.key;
        const ctrlMatches = shortcut.ctrlKey === undefined || event.ctrlKey === shortcut.ctrlKey;
        const shiftMatches = shortcut.shiftKey === undefined || event.shiftKey === shortcut.shiftKey;
        const altMatches = shortcut.altKey === undefined || event.altKey === shortcut.altKey;
        const metaMatches = shortcut.metaKey === undefined || event.metaKey === shortcut.metaKey;

        if (keyMatches && ctrlMatches && shiftMatches && altMatches && metaMatches) {
          event.preventDefault();
          shortcut.handler(event);
        }
      });
    };

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [shortcuts]);

  // Focus trap for modals
  useEffect(() => {
    if (!trapFocus || !containerRef?.current) return;

    const container = containerRef.current;
    const focusableElements = container.querySelectorAll<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );

    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;

      if (e.shiftKey) {
        // Shift + Tab
        if (document.activeElement === firstElement) {
          e.preventDefault();
          lastElement?.focus();
        }
      } else {
        // Tab
        if (document.activeElement === lastElement) {
          e.preventDefault();
          firstElement?.focus();
        }
      }
    };

    container.addEventListener('keydown', handleKeyDown);

    // Focus first element when trap is enabled
    firstElement?.focus();

    return () => {
      container.removeEventListener('keydown', handleKeyDown);
    };
  }, [trapFocus, containerRef]);

  // Helper function to get all focusable elements
  const getFocusableElements = useCallback((container?: HTMLElement) => {
    const root = container || document.body;
    return Array.from(
      root.querySelectorAll<HTMLElement>(
        'button:not(:disabled), [href], input:not(:disabled), select:not(:disabled), textarea:not(:disabled), [tabindex]:not([tabindex="-1"])'
      )
    );
  }, []);

  // Helper function to focus next/previous element
  const focusNext = useCallback(() => {
    const focusableElements = getFocusableElements();
    const currentIndex = focusableElements.indexOf(document.activeElement as HTMLElement);
    const nextIndex = (currentIndex + 1) % focusableElements.length;
    focusableElements[nextIndex]?.focus();
  }, [getFocusableElements]);

  const focusPrevious = useCallback(() => {
    const focusableElements = getFocusableElements();
    const currentIndex = focusableElements.indexOf(document.activeElement as HTMLElement);
    const previousIndex = currentIndex === 0 ? focusableElements.length - 1 : currentIndex - 1;
    focusableElements[previousIndex]?.focus();
  }, [getFocusableElements]);

  return {
    getFocusableElements,
    focusNext,
    focusPrevious,
  };
}

/**
 * Hook for managing focus return after modal close
 */
export function useFocusReturn(isOpen: boolean) {
  useEffect(() => {
    if (!isOpen) return;

    // Store the element that had focus before modal opened
    const previouslyFocusedElement = document.activeElement as HTMLElement;

    return () => {
      // Return focus when modal closes
      if (previouslyFocusedElement && typeof previouslyFocusedElement.focus === 'function') {
        previouslyFocusedElement.focus();
      }
    };
  }, [isOpen]);
}

/**
 * Hook for skip links navigation
 */
export function useSkipLinks() {
  const skipToMain = useCallback(() => {
    const mainContent = document.getElementById('main-content');
    if (mainContent) {
      mainContent.focus();
      if (typeof mainContent.scrollIntoView === 'function') {
        mainContent.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  }, []);

  const skipToNav = useCallback(() => {
    const navigation = document.getElementById('main-navigation');
    if (navigation) {
      navigation.focus();
      if (typeof navigation.scrollIntoView === 'function') {
        navigation.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  }, []);

  return {
    skipToMain,
    skipToNav,
  };
}
