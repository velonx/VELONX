/**
 * Resource Placeholder Utilities Tests
 * Feature: resources-page-ui-improvements
 * 
 * Tests for placeholder image generation
 */

import { describe, it, expect } from 'vitest';
import { 
  generatePlaceholderSVG, 
  getCategoryPlaceholder 
} from '../resource-placeholders';
import { ResourceCategory } from '@/lib/types/resources.types';

describe('resource-placeholders', () => {
  describe('generatePlaceholderSVG', () => {
    it('generates valid SVG data URI', () => {
      const result = generatePlaceholderSVG(ResourceCategory.PROGRAMMING);
      
      expect(result).toMatch(/^data:image\/svg\+xml,/);
      expect(result).toContain('svg');
      expect(result).toContain('width');
      expect(result).toContain('height');
    });
    
    it('generates different SVGs for different categories', () => {
      const programming = generatePlaceholderSVG(ResourceCategory.PROGRAMMING);
      const design = generatePlaceholderSVG(ResourceCategory.DESIGN);
      
      expect(programming).not.toBe(design);
    });
    
    it('includes category name in SVG', () => {
      const result = generatePlaceholderSVG(ResourceCategory.DATA_SCIENCE);
      const decoded = decodeURIComponent(result);
      
      expect(decoded).toContain('DATA SCIENCE');
    });
    
    it('generates placeholder for all categories', () => {
      const categories = Object.values(ResourceCategory);
      
      categories.forEach((category) => {
        const result = generatePlaceholderSVG(category as ResourceCategory);
        expect(result).toMatch(/^data:image\/svg\+xml,/);
      });
    });
  });
  
  describe('getCategoryPlaceholder', () => {
    it('returns data URI for category', () => {
      const result = getCategoryPlaceholder(ResourceCategory.WEB);
      
      expect(result).toMatch(/^data:image\/svg\+xml,/);
    });
    
    it('returns consistent result for same category', () => {
      const first = getCategoryPlaceholder(ResourceCategory.MOBILE);
      const second = getCategoryPlaceholder(ResourceCategory.MOBILE);
      
      expect(first).toBe(second);
    });
  });
});
