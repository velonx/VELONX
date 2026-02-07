/**
 * Performance Monitoring Utilities for Projects Page
 * Feature: project-page-ui-improvements
 * 
 * Provides utilities for tracking and monitoring performance metrics
 * specific to the projects page, including:
 * - Filter operation timing
 * - Sort operation timing
 * - Search operation timing
 * - Component render timing
 * - API request timing
 */

import { performanceMonitor } from '@/lib/services/performance-monitor.service';

/**
 * Performance thresholds (in milliseconds)
 */
export const PERFORMANCE_THRESHOLDS = {
  FILTER_OPERATION: 100,
  SORT_OPERATION: 100,
  SEARCH_OPERATION: 50,
  COMPONENT_RENDER: 200,
  API_REQUEST: 2000,
} as const;

/**
 * Track filter operation performance
 */
export async function trackFilterPerformance(
  projectCount: number,
  duration: number,
  filterType: string
): Promise<void> {
  try {
    await performanceMonitor.trackRequest({
      endpoint: `/projects/filter/${filterType}`,
      method: 'FILTER',
      statusCode: 200,
      duration,
      timestamp: Date.now(),
    });

    // Log warning if operation is slow
    if (duration > PERFORMANCE_THRESHOLDS.FILTER_OPERATION) {
      console.warn(
        `[Performance] Slow filter operation: ${filterType} took ${duration.toFixed(2)}ms for ${projectCount} projects`
      );
    }
  } catch (error) {
    // Silently fail - don't disrupt user experience
    console.debug('[Performance] Failed to track filter metric:', error);
  }
}

/**
 * Track sort operation performance
 */
export async function trackSortPerformance(
  projectCount: number,
  duration: number,
  sortType: string
): Promise<void> {
  try {
    await performanceMonitor.trackRequest({
      endpoint: `/projects/sort/${sortType}`,
      method: 'SORT',
      statusCode: 200,
      duration,
      timestamp: Date.now(),
    });

    // Log warning if operation is slow
    if (duration > PERFORMANCE_THRESHOLDS.SORT_OPERATION) {
      console.warn(
        `[Performance] Slow sort operation: ${sortType} took ${duration.toFixed(2)}ms for ${projectCount} projects`
      );
    }
  } catch (error) {
    // Silently fail - don't disrupt user experience
    console.debug('[Performance] Failed to track sort metric:', error);
  }
}

/**
 * Track search operation performance
 */
export async function trackSearchPerformance(
  projectCount: number,
  duration: number,
  searchTerm: string
): Promise<void> {
  try {
    await performanceMonitor.trackRequest({
      endpoint: '/projects/search',
      method: 'SEARCH',
      statusCode: 200,
      duration,
      timestamp: Date.now(),
    });

    // Log warning if operation is slow
    if (duration > PERFORMANCE_THRESHOLDS.SEARCH_OPERATION) {
      console.warn(
        `[Performance] Slow search operation: "${searchTerm}" took ${duration.toFixed(2)}ms for ${projectCount} projects`
      );
    }
  } catch (error) {
    // Silently fail - don't disrupt user experience
    console.debug('[Performance] Failed to track search metric:', error);
  }
}

/**
 * Track component render performance
 */
export async function trackComponentRender(
  componentName: string,
  duration: number
): Promise<void> {
  try {
    await performanceMonitor.trackRequest({
      endpoint: `/projects/component/${componentName}`,
      method: 'RENDER',
      statusCode: 200,
      duration,
      timestamp: Date.now(),
    });

    // Log warning if render is slow
    if (duration > PERFORMANCE_THRESHOLDS.COMPONENT_RENDER) {
      console.warn(
        `[Performance] Slow component render: ${componentName} took ${duration.toFixed(2)}ms`
      );
    }
  } catch (error) {
    // Silently fail - don't disrupt user experience
    console.debug('[Performance] Failed to track component metric:', error);
  }
}

/**
 * Measure and track the performance of a synchronous operation
 */
export function measureSync<T>(
  operation: () => T,
  operationName: string,
  threshold: number = 100
): T {
  const startTime = performance.now();
  const result = operation();
  const duration = performance.now() - startTime;

  if (duration > threshold) {
    console.debug(
      `[Performance] ${operationName} took ${duration.toFixed(2)}ms (threshold: ${threshold}ms)`
    );
  }

  return result;
}

/**
 * Measure and track the performance of an asynchronous operation
 */
export async function measureAsync<T>(
  operation: () => Promise<T>,
  operationName: string,
  threshold: number = 100
): Promise<T> {
  const startTime = performance.now();
  const result = await operation();
  const duration = performance.now() - startTime;

  if (duration > threshold) {
    console.debug(
      `[Performance] ${operationName} took ${duration.toFixed(2)}ms (threshold: ${threshold}ms)`
    );
  }

  return result;
}

/**
 * Create a performance observer for tracking Web Vitals
 */
export function observeWebVitals(): void {
  if (typeof window === 'undefined') return;

  // Observe Largest Contentful Paint (LCP)
  try {
    const lcpObserver = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      const lastEntry = entries[entries.length - 1];
      
      console.debug('[Performance] LCP:', lastEntry.startTime.toFixed(2), 'ms');
      
      performanceMonitor.trackRequest({
        endpoint: '/projects/web-vitals/lcp',
        method: 'METRIC',
        statusCode: 200,
        duration: lastEntry.startTime,
        timestamp: Date.now(),
      }).catch(() => {});
    });
    
    lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });
  } catch (error) {
    // PerformanceObserver not supported
    console.debug('[Performance] LCP observer not supported');
  }

  // Observe First Input Delay (FID)
  try {
    const fidObserver = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      entries.forEach((entry: any) => {
        const fid = entry.processingStart - entry.startTime;
        console.debug('[Performance] FID:', fid.toFixed(2), 'ms');
        
        performanceMonitor.trackRequest({
          endpoint: '/projects/web-vitals/fid',
          method: 'METRIC',
          statusCode: 200,
          duration: fid,
          timestamp: Date.now(),
        }).catch(() => {});
      });
    });
    
    fidObserver.observe({ entryTypes: ['first-input'] });
  } catch (error) {
    // PerformanceObserver not supported
    console.debug('[Performance] FID observer not supported');
  }

  // Observe Cumulative Layout Shift (CLS)
  try {
    let clsValue = 0;
    const clsObserver = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      entries.forEach((entry: any) => {
        if (!entry.hadRecentInput) {
          clsValue += entry.value;
        }
      });
      
      console.debug('[Performance] CLS:', clsValue.toFixed(4));
      
      performanceMonitor.trackRequest({
        endpoint: '/projects/web-vitals/cls',
        method: 'METRIC',
        statusCode: 200,
        duration: clsValue * 1000, // Convert to ms for consistency
        timestamp: Date.now(),
      }).catch(() => {});
    });
    
    clsObserver.observe({ entryTypes: ['layout-shift'] });
  } catch (error) {
    // PerformanceObserver not supported
    console.debug('[Performance] CLS observer not supported');
  }
}

/**
 * Get performance summary for the current page
 */
export function getPerformanceSummary(): {
  navigation: number;
  domContentLoaded: number;
  loadComplete: number;
} | null {
  if (typeof window === 'undefined' || !window.performance) {
    return null;
  }

  const perfData = window.performance.timing;
  const navigationStart = perfData.navigationStart;

  return {
    navigation: perfData.responseEnd - navigationStart,
    domContentLoaded: perfData.domContentLoadedEventEnd - navigationStart,
    loadComplete: perfData.loadEventEnd - navigationStart,
  };
}
