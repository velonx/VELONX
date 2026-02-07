/**
 * CategoryBadge Component
 * Feature: project-page-ui-improvements
 * 
 * A visual badge component that displays project categories with distinct color coding.
 * Supports click handling for filtering projects by category.
 * 
 * Requirements:
 * - 9.1: Display category tag indicating project domain
 * - 9.2: Use distinct colors for different categories
 * - 9.3: Click handler for filtering by category
 */

import React from 'react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { ProjectCategory, CATEGORY_COLORS } from '@/lib/types/project-page.types';

export interface CategoryBadgeProps {
  /**
   * The project category to display
   */
  category: ProjectCategory;
  
  /**
   * Optional click handler for filtering by category
   * When provided, the badge becomes interactive
   */
  onClick?: (category: ProjectCategory) => void;
  
  /**
   * Additional CSS classes
   */
  className?: string;
  
  /**
   * Size variant
   */
  size?: 'sm' | 'md' | 'lg';
}

/**
 * CategoryBadge displays a color-coded badge for project categories
 * 
 * @example
 * ```tsx
 * // Non-interactive badge
 * <CategoryBadge category="WEB_DEV" />
 * 
 * // Interactive badge with click handler
 * <CategoryBadge 
 *   category="AI_ML" 
 *   onClick={(cat) => handleFilterByCategory(cat)}
 * />
 * ```
 */
export const CategoryBadge: React.FC<CategoryBadgeProps> = ({
  category,
  onClick,
  className,
  size = 'md',
}) => {
  const config = CATEGORY_COLORS[category];
  
  // Size classes
  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-sm px-2.5 py-1',
    lg: 'text-base px-3 py-1.5',
  };
  
  // Interactive styles when onClick is provided
  const interactiveClasses = onClick
    ? 'cursor-pointer hover:opacity-80 hover:scale-105 active:scale-95 transition-all duration-200'
    : '';
  
  const handleClick = (e: React.MouseEvent) => {
    if (onClick) {
      e.stopPropagation(); // Prevent event bubbling to parent elements
      onClick(category);
    }
  };
  
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (onClick && (e.key === 'Enter' || e.key === ' ')) {
      e.preventDefault();
      e.stopPropagation();
      onClick(category);
    }
  };
  
  return (
    <Badge
      className={cn(
        'font-medium border-2',
        config.bgColor,
        config.borderColor,
        sizeClasses[size],
        interactiveClasses,
        className
      )}
      style={{
        color: config.color,
      }}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      aria-label={onClick ? `Filter by ${config.label}` : config.label}
    >
      {config.label}
    </Badge>
  );
};

CategoryBadge.displayName = 'CategoryBadge';
