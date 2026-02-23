/**
 * Performance Monitoring Utilities for Projects Page
 * Feature: project-page-ui-improvements
 * 
 * Provides purely client-side utilities for tracking and monitoring
 * performance metrics specific to the projects page, including:
 * - Filter operation timing
 * - Sort operation timing
 * - Search operation timing
 * - Component render timing
 * - API request timing
 * 
 * NOTE: This file must NOT import any server-side services (Prisma, Redis, etc.)
 * as it is used by client components via usePerformanceMonitoring hook.
 */

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
 * Track filter operation performance (client-side only)
 */
export async function trackFilterPerformance(
  projectCount: number,
  duration: number,
  filterType: string
): Promise<void> {
  // Log warning if operation is slow
  if (duration > PERFORMANCE_THRESHOLDS.FILTER_OPERATION) {
    console.warn(
      `[Performance] Slow filter operation: ${filterType} took ${duration.toFixed(2)}ms for ${projectCount} projects`
    );
  } else if (process.env.NODE_ENV === 'development') {
    console.debug(
      `[Performance] Filter ${filterType}: ${duration.toFixed(2)}ms for ${projectCount} projects`
    );
  }
}

/**
 * Track sort operation performance (client-side only)
 */
export async function trackSortPerformance(
  projectCount: number,
  duration: number,
  sortType: string
): Promise<void> {
  // Log warning if operation is slow
  if (duration > PERFORMANCE_THRESHOLDS.SORT_OPERATION) {
    console.warn(
      `[Performance] Slow sort operation: ${sortType} took ${duration.toFixed(2)}ms for ${projectCount} projects`
    );
  } else if (process.env.NODE_ENV === 'development') {
    console.debug(
      `[Performance] Sort ${sortType}: ${duration.toFixed(2)}ms for ${projectCount} projects`
    );
  }
}

/**
 * Track search operation performance (client-side only)
 */
export async function trackSearchPerformance(
  projectCount: number,
  duration: number,
  searchTerm: string
): Promise<void> {
  // Log warning if operation is slow
  if (duration > PERFORMANCE_THRESHOLDS.SEARCH_OPERATION) {
    console.warn(
      `[Performance] Slow search operation: "${searchTerm}" took ${duration.toFixed(2)}ms for ${projectCount} projects`
    );
  } else if (process.env.NODE_ENV === 'development') {
    console.debug(
      `[Performance] Search "${searchTerm}": ${duration.toFixed(2)}ms for ${projectCount} projects`
    );
  }
}

/**
 * Track component render performance (client-side only)
 */
export async function trackComponentRender(
  componentName: string,
  duration: number
): Promise<void> {
  // Log warning if render is slow
  if (duration > PERFORMANCE_THRESHOLDS.COMPONENT_RENDER) {
    console.warn(
      `[Performance] Slow component render: ${componentName} took ${duration.toFixed(2)}ms`
    );
  } else if (process.env.NODE_ENV === 'development') {
    console.debug(
      `[Performance] Component ${componentName}: ${duration.toFixed(2)}ms`
    );
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
 * Create a performance observer for tracking Web Vitals (client-side only)
 */
export function observeWebVitals(): void {
  if (typeof window === 'undefined') return;

  // Observe Largest Contentful Paint (LCP)
  try {
    const lcpObserver = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      const lastEntry = entries[entries.length - 1];
      console.debug('[Performance] LCP:', lastEntry.startTime.toFixed(2), 'ms');
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
