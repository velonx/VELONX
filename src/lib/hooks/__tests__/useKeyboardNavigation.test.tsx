/**
 * Tests for useKeyboardNavigation hook
 * Requirement 9.1: Keyboard navigation support
 * Requirement 9.2: Visible focus indicators
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useKeyboardNavigation, useFocusReturn, useSkipLinks } from '../useKeyboardNavigation';

describe('useKeyboardNavigation', () => {
  beforeEach(() => {
    // Clear body classes
    document.body.className = '';
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('Focus tracking', () => {
    it('should add "using-keyboard" class on Tab key press', () => {
      renderHook(() => useKeyboardNavigation({ enableFocusTracking: true }));

      act(() => {
        const event = new KeyboardEvent('keydown', { key: 'Tab' });
        document.dispatchEvent(event);
      });

      expect(document.body.classList.contains('using-keyboard')).toBe(true);
    });

    it('should remove "using-keyboard" class on mouse down', () => {
      renderHook(() => useKeyboardNavigation({ enableFocusTracking: true }));

      act(() => {
        const tabEvent = new KeyboardEvent('keydown', { key: 'Tab' });
        document.dispatchEvent(tabEvent);
      });

      expect(document.body.classList.contains('using-keyboard')).toBe(true);

      act(() => {
        const mouseEvent = new MouseEvent('mousedown');
        document.dispatchEvent(mouseEvent);
      });

      expect(document.body.classList.contains('using-keyboard')).toBe(false);
    });

    it('should not track focus when enableFocusTracking is false', () => {
      renderHook(() => useKeyboardNavigation({ enableFocusTracking: false }));

      act(() => {
        const event = new KeyboardEvent('keydown', { key: 'Tab' });
        document.dispatchEvent(event);
      });

      expect(document.body.classList.contains('using-keyboard')).toBe(false);
    });
  });

  describe('Keyboard shortcuts', () => {
    it('should trigger shortcut handler when key is pressed', () => {
      const handler = vi.fn();
      
      renderHook(() =>
        useKeyboardNavigation({
          shortcuts: [
            {
              key: '/',
              handler,
            },
          ],
        })
      );

      act(() => {
        const event = new KeyboardEvent('keydown', { key: '/' });
        document.dispatchEvent(event);
      });

      expect(handler).toHaveBeenCalledTimes(1);
    });

    it('should trigger shortcut with modifier keys', () => {
      const handler = vi.fn();
      
      renderHook(() =>
        useKeyboardNavigation({
          shortcuts: [
            {
              key: 's',
              ctrlKey: true,
              handler,
            },
          ],
        })
      );

      act(() => {
        const event = new KeyboardEvent('keydown', { key: 's', ctrlKey: true });
        document.dispatchEvent(event);
      });

      expect(handler).toHaveBeenCalledTimes(1);
    });

    it('should not trigger shortcut when typing in input field', () => {
      const handler = vi.fn();
      
      renderHook(() =>
        useKeyboardNavigation({
          shortcuts: [
            {
              key: '/',
              handler,
            },
          ],
        })
      );

      const input = document.createElement('input');
      document.body.appendChild(input);
      input.focus();

      act(() => {
        const event = new KeyboardEvent('keydown', { key: '/', bubbles: true });
        Object.defineProperty(event, 'target', { value: input, enumerable: true });
        document.dispatchEvent(event);
      });

      expect(handler).not.toHaveBeenCalled();

      document.body.removeChild(input);
    });

    it('should allow Escape key even in input fields', () => {
      const handler = vi.fn();
      
      renderHook(() =>
        useKeyboardNavigation({
          shortcuts: [
            {
              key: 'Escape',
              handler,
            },
          ],
        })
      );

      const input = document.createElement('input');
      document.body.appendChild(input);
      input.focus();

      act(() => {
        const event = new KeyboardEvent('keydown', { key: 'Escape', bubbles: true });
        Object.defineProperty(event, 'target', { value: input, enumerable: true });
        document.dispatchEvent(event);
      });

      expect(handler).toHaveBeenCalledTimes(1);

      document.body.removeChild(input);
    });

    it('should handle multiple shortcuts', () => {
      const handler1 = vi.fn();
      const handler2 = vi.fn();
      
      renderHook(() =>
        useKeyboardNavigation({
          shortcuts: [
            { key: '/', handler: handler1 },
            { key: 'Escape', handler: handler2 },
          ],
        })
      );

      act(() => {
        const event1 = new KeyboardEvent('keydown', { key: '/' });
        document.dispatchEvent(event1);
      });

      expect(handler1).toHaveBeenCalledTimes(1);
      expect(handler2).not.toHaveBeenCalled();

      act(() => {
        const event2 = new KeyboardEvent('keydown', { key: 'Escape' });
        document.dispatchEvent(event2);
      });

      expect(handler1).toHaveBeenCalledTimes(1);
      expect(handler2).toHaveBeenCalledTimes(1);
    });
  });

  describe('Helper functions', () => {
    it('should return getFocusableElements function', () => {
      const { result } = renderHook(() => useKeyboardNavigation());

      expect(typeof result.current.getFocusableElements).toBe('function');
    });

    it('should return focusNext function', () => {
      const { result } = renderHook(() => useKeyboardNavigation());

      expect(typeof result.current.focusNext).toBe('function');
    });

    it('should return focusPrevious function', () => {
      const { result } = renderHook(() => useKeyboardNavigation());

      expect(typeof result.current.focusPrevious).toBe('function');
    });

    it('should get focusable elements from document', () => {
      const button1 = document.createElement('button');
      const button2 = document.createElement('button');
      document.body.appendChild(button1);
      document.body.appendChild(button2);

      const { result } = renderHook(() => useKeyboardNavigation());

      const focusableElements = result.current.getFocusableElements();

      expect(focusableElements.length).toBeGreaterThanOrEqual(2);
      expect(focusableElements).toContain(button1);
      expect(focusableElements).toContain(button2);

      document.body.removeChild(button1);
      document.body.removeChild(button2);
    });
  });
});

describe('useFocusReturn', () => {
  it('should store and return focus when modal closes', async () => {
    const button = document.createElement('button');
    document.body.appendChild(button);
    button.focus();

    const initialFocus = document.activeElement;

    const { rerender } = renderHook(({ isOpen }) => useFocusReturn(isOpen), {
      initialProps: { isOpen: false },
    });

    // Open modal
    rerender({ isOpen: true });

    // Change focus
    const input = document.createElement('input');
    document.body.appendChild(input);
    input.focus();

    expect(document.activeElement).toBe(input);

    // Close modal
    rerender({ isOpen: false });

    await waitFor(() => {
      expect(document.activeElement).toBe(initialFocus);
    });

    document.body.removeChild(button);
    document.body.removeChild(input);
  });
});

describe('useSkipLinks', () => {
  it('should return skipToMain function', () => {
    const { result } = renderHook(() => useSkipLinks());

    expect(typeof result.current.skipToMain).toBe('function');
  });

  it('should return skipToNav function', () => {
    const { result } = renderHook(() => useSkipLinks());

    expect(typeof result.current.skipToNav).toBe('function');
  });

  it('should focus and scroll to main content', () => {
    const mainContent = document.createElement('div');
    mainContent.id = 'main-content';
    mainContent.tabIndex = -1;
    mainContent.scrollIntoView = vi.fn();
    document.body.appendChild(mainContent);

    const focusSpy = vi.spyOn(mainContent, 'focus');
    const scrollSpy = vi.spyOn(mainContent, 'scrollIntoView');

    const { result } = renderHook(() => useSkipLinks());

    act(() => {
      result.current.skipToMain();
    });

    expect(focusSpy).toHaveBeenCalled();
    expect(scrollSpy).toHaveBeenCalledWith({ behavior: 'smooth', block: 'start' });

    document.body.removeChild(mainContent);
  });

  it('should focus and scroll to navigation', () => {
    const navigation = document.createElement('nav');
    navigation.id = 'main-navigation';
    navigation.tabIndex = -1;
    navigation.scrollIntoView = vi.fn();
    document.body.appendChild(navigation);

    const focusSpy = vi.spyOn(navigation, 'focus');
    const scrollSpy = vi.spyOn(navigation, 'scrollIntoView');

    const { result } = renderHook(() => useSkipLinks());

    act(() => {
      result.current.skipToNav();
    });

    expect(focusSpy).toHaveBeenCalled();
    expect(scrollSpy).toHaveBeenCalledWith({ behavior: 'smooth', block: 'start' });

    document.body.removeChild(navigation);
  });

  it('should handle missing main content gracefully', () => {
    const { result } = renderHook(() => useSkipLinks());

    expect(() => {
      act(() => {
        result.current.skipToMain();
      });
    }).not.toThrow();
  });

  it('should handle missing navigation gracefully', () => {
    const { result } = renderHook(() => useSkipLinks());

    expect(() => {
      act(() => {
        result.current.skipToNav();
      });
    }).not.toThrow();
  });
});
