/**
 * Responsive Design Utilities
 * Provides helper functions and constants for responsive design
 */

export const BREAKPOINTS = {
  xs: 320,
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536,
  '3xl': 2560,
} as const;

export const TOUCH_TARGET_MIN_SIZE = 44; // pixels - WCAG 2.1 Level AAA

/**
 * Check if an element meets minimum touch target size
 */
export function isTouchTargetValid(width: number, height: number): boolean {
  return width >= TOUCH_TARGET_MIN_SIZE && height >= TOUCH_TARGET_MIN_SIZE;
}

/**
 * Get responsive padding classes based on viewport
 */
export function getResponsivePadding(size: 'sm' | 'md' | 'lg' = 'md'): string {
  const paddingMap = {
    sm: 'px-4 sm:px-6 md:px-8',
    md: 'px-4 sm:px-6 md:px-8 lg:px-12',
    lg: 'px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16',
  };
  return paddingMap[size];
}

/**
 * Get responsive container classes
 */
export function getResponsiveContainer(): string {
  return 'container mx-auto px-4 sm:px-6 md:px-8 lg:px-12';
}

/**
 * Get responsive grid classes
 */
export function getResponsiveGrid(cols: { xs?: number; sm?: number; md?: number; lg?: number; xl?: number }): string {
  const classes: string[] = ['grid'];
  
  if (cols.xs) classes.push(`grid-cols-${cols.xs}`);
  if (cols.sm) classes.push(`sm:grid-cols-${cols.sm}`);
  if (cols.md) classes.push(`md:grid-cols-${cols.md}`);
  if (cols.lg) classes.push(`lg:grid-cols-${cols.lg}`);
  if (cols.xl) classes.push(`xl:grid-cols-${cols.xl}`);
  
  return classes.join(' ');
}

/**
 * Get responsive text size classes
 */
export function getResponsiveText(size: 'xs' | 'sm' | 'base' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | '5xl' | '6xl'): string {
  const sizeMap = {
    xs: 'text-xs sm:text-sm',
    sm: 'text-sm sm:text-base',
    base: 'text-base sm:text-lg',
    lg: 'text-lg sm:text-xl',
    xl: 'text-xl sm:text-2xl',
    '2xl': 'text-2xl sm:text-3xl md:text-4xl',
    '3xl': 'text-3xl sm:text-4xl md:text-5xl',
    '4xl': 'text-4xl sm:text-5xl md:text-6xl',
    '5xl': 'text-5xl sm:text-6xl md:text-7xl',
    '6xl': 'text-6xl sm:text-7xl md:text-8xl',
  };
  return sizeMap[size];
}

/**
 * Get responsive spacing classes
 */
export function getResponsiveSpacing(size: 'sm' | 'md' | 'lg' = 'md'): string {
  const spacingMap = {
    sm: 'space-y-4 sm:space-y-6',
    md: 'space-y-6 sm:space-y-8 md:space-y-10',
    lg: 'space-y-8 sm:space-y-10 md:space-y-12 lg:space-y-16',
  };
  return spacingMap[size];
}
