/**
 * Performance Monitoring Hook
 * Feature: project-page-ui-improvements
 * 
 * Custom hook for tracking component performance and Web Vitals
 */

import { useEffect, useRef } from 'react';
import { performanceMonitor } from '@/lib/services/performance-monitor.service';
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

      // Track component render time
      performanceMonitor
        .trackRequest({
          endpoint: `/projects/component/${componentName}`,
          method: 'RENDER',
          statusCode: 200,
          duration,
          timestamp: Date.now(),
        })
        .catch((err) => {
          // Silently fail - don't disrupt user experience
          console.debug('[Performance] Failed to track metric:', err);
        });

      // Log slow renders in development
      if (process.env.NODE_ENV === 'development' && duration > 100) {
        console.warn(
          `[Performance] Slow render: ${componentName} took ${duration.toFixed(2)}ms (render #${renderCountRef.current})`
        );
      }
    };
  }, [componentName]);

  // Track time to first render
  useEffect(() => {
    if (renderCountRef.current === 1 && mountTimeRef.current > 0) {
      const timeToFirstRender = performance.now() - mountTimeRef.current;

      performanceMonitor
        .trackRequest({
          endpoint: `/projects/component/${componentName}/mount`,
          method: 'MOUNT',
          statusCode: 200,
          duration: timeToFirstRender,
          timestamp: Date.now(),
        })
        .catch(() => {});

      if (process.env.NODE_ENV === 'development' && timeToFirstRender > 200) {
        console.warn(
          `[Performance] Slow mount: ${componentName} took ${timeToFirstRender.toFixed(2)}ms to mount`
        );
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

      // Track successful operation
      await performanceMonitor
        .trackRequest({
          endpoint: `/projects/operation/${operationName}`,
          method: 'OPERATION',
          statusCode: 200,
          duration,
          timestamp: Date.now(),
        })
        .catch(() => {});

      // Log slow operations
      if (duration > threshold) {
        console.debug(
          `[Performance] Slow operation: ${operationName} took ${duration.toFixed(2)}ms (threshold: ${threshold}ms)`
        );
      }

      return result;
    } catch (error) {
      const duration = performance.now() - startTime;

      // Track failed operation
      await performanceMonitor
        .trackRequest({
          endpoint: `/projects/operation/${operationName}`,
          method: 'OPERATION',
          statusCode: 500,
          duration,
          timestamp: Date.now(),
        })
        .catch(() => {});

      throw error;
    }
  };

  return { trackOperation };
}

/**
 * Hook to track user interactions
 * Returns a function to measure and track user interaction timing
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

      // Track interaction timing
      performanceMonitor
        .trackRequest({
          endpoint: `/projects/interaction/${interactionName}`,
          method: 'INTERACTION',
          statusCode: 200,
          duration,
          timestamp: Date.now(),
        })
        .catch(() => {});

      // Log slow interactions
      if (duration > 50) {
        console.debug(
          `[Performance] Slow interaction: ${interactionName} took ${duration.toFixed(2)}ms`
        );
      }
    } catch (error) {
      const duration = performance.now() - startTime;

      // Track failed interaction
      performanceMonitor
        .trackRequest({
          endpoint: `/projects/interaction/${interactionName}`,
          method: 'INTERACTION',
          statusCode: 500,
          duration,
          timestamp: Date.now(),
        })
        .catch(() => {});

      throw error;
    }
  };

  return { trackInteraction };
}
