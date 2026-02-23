/**
 * Performance Monitoring Hook
 * Feature: project-page-ui-improvements
 * 
 * Custom hook for tracking component performance and Web Vitals
 * Client-side only - does not use server-side performance monitor service
 */

import { useEffect, useRef } from 'react';
import { observeWebVitals } from '@/lib/utils/project-page/performance';

/**
 * Hook to monitor component render performance
 * Tracks render time and reports to performance monitoring service
 */
export function usePerformanceMonitoring(componentName: string) {
  const renderCountRef = useRef(0);
  const mountTimeRef = useRef<number>(0);

  useEffect(() => {
    // Track mount time on first render
    if (renderCountRef.current === 0) {
      mountTimeRef.current = performance.now();
    }

    renderCountRef.current += 1;
    const startTime = performance.now();

    return () => {
      const duration = performance.now() - startTime;

      // Log performance metrics (client-side only)
      if (process.env.NODE_ENV === 'development') {
        console.debug(
          `[Performance] ${componentName} render #${renderCountRef.current}: ${duration.toFixed(2)}ms`
        );
        
        // Warn on slow renders
        if (duration > 100) {
          console.warn(
            `[Performance] Slow render: ${componentName} took ${duration.toFixed(2)}ms`
          );
        }
      }
    };
  }, [componentName]);

  // Track time to first render
  useEffect(() => {
    if (renderCountRef.current === 1 && mountTimeRef.current > 0) {
      const timeToFirstRender = performance.now() - mountTimeRef.current;

      // Log mount performance (client-side only)
      if (process.env.NODE_ENV === 'development') {
        console.debug(
          `[Performance] ${componentName} mounted in ${timeToFirstRender.toFixed(2)}ms`
        );
        
        if (timeToFirstRender > 200) {
          console.warn(
            `[Performance] Slow mount: ${componentName} took ${timeToFirstRender.toFixed(2)}ms`
          );
        }
      }
    }
  }, [componentName]);
}

/**
 * Hook to observe Web Vitals (LCP, FID, CLS)
 * Should be called once at the app/page level
 */
export function useWebVitals() {
  useEffect(() => {
    // Only run in browser
    if (typeof window === 'undefined') return;

    // Initialize Web Vitals observers
    observeWebVitals();

    // Cleanup is handled by the observers themselves
  }, []);
}

/**
 * Hook to track operation performance
 * Returns a function to measure and track async operations
 * Client-side logging only
 */
export function useOperationTracking() {
  const trackOperation = async <T,>(
    operationName: string,
    operation: () => Promise<T>,
    threshold: number = 100
  ): Promise<T> => {
    const startTime = performance.now();

    try {
      const result = await operation();
      const duration = performance.now() - startTime;

      // Log operation performance (client-side only)
      if (process.env.NODE_ENV === 'development' && duration > threshold) {
        console.debug(
          `[Performance] Operation ${operationName}: ${duration.toFixed(2)}ms (threshold: ${threshold}ms)`
        );
      }

      return result;
    } catch (error) {
      const duration = performance.now() - startTime;

      // Log failed operation
      if (process.env.NODE_ENV === 'development') {
        console.debug(
          `[Performance] Failed operation ${operationName}: ${duration.toFixed(2)}ms`
        );
      }

      throw error;
    }
  };

  return { trackOperation };
}

/**
 * Hook to track user interactions
 * Returns a function to measure and track user interaction timing
 * Client-side logging only
 */
export function useInteractionTracking() {
  const trackInteraction = (
    interactionName: string,
    callback: () => void
  ): void => {
    const startTime = performance.now();

    try {
      callback();
      const duration = performance.now() - startTime;

      // Log interaction timing (client-side only)
      if (process.env.NODE_ENV === 'development' && duration > 50) {
        console.debug(
          `[Performance] Interaction ${interactionName}: ${duration.toFixed(2)}ms`
        );
      }
    } catch (error) {
      const duration = performance.now() - startTime;

      // Log failed interaction
      if (process.env.NODE_ENV === 'development') {
        console.debug(
          `[Performance] Failed interaction ${interactionName}: ${duration.toFixed(2)}ms`
        );
      }

      throw error;
    }
  };

  return { trackInteraction };
}
