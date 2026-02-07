/**
 * Unit tests for URL Helper Utilities
 * Feature: resources-page-ui-improvements
 */

import { describe, it, expect } from 'vitest';
import {
  serializeFiltersToURL,
  parseFiltersFromURL,
  areFiltersEqual,
} from '../resource-url-helpers';
import { FilterState, ResourceCategory, ResourceType } from '@/lib/types/resources.types';

describe('serializeFiltersToURL', () => {
  it('should serialize empty filters to empty params', () => {
    const filters: FilterState = {
      categories: [],
      types: [],
      page: 1,
      pageSize: 12,
    };

    const params = serializeFiltersToURL(filters);
    expect(params.toString()).toBe('');
  });

  it('should serialize search query', () => {
    const filters: FilterState = {
      search: 'javascript',
      categories: [],
      types: [],
      page: 1,
      pageSize: 12,
    };

    const params = serializeFiltersToURL(filters);
    expect(params.get('search')).toBe('javascript');
  });

  it('should trim search query whitespace', () => {
    const filters: FilterState = {
      search: '  javascript  ',
      categories: [],
      types: [],
      page: 1,
      pageSize: 12,
    };

    const params = serializeFiltersToURL(filters);
    expect(params.get('search')).toBe('javascript');
  });

  it('should serialize single category', () => {
    const filters: FilterState = {
      categories: [ResourceCategory.PROGRAMMING],
      types: [],
      page: 1,
      pageSize: 12,
    };

    const params = serializeFiltersToURL(filters);
    expect(params.get('category')).toBe('PROGRAMMING');
  });

  it('should serialize multiple categories as comma-separated', () => {
    const filters: FilterState = {
      categories: [ResourceCategory.PROGRAMMING, ResourceCategory.WEB],
      types: [],
      page: 1,
      pageSize: 12,
    };

    const params = serializeFiltersToURL(filters);
    expect(params.get('category')).toBe('PROGRAMMING,WEB');
  });

  it('should serialize multiple types as comma-separated', () => {
    const filters: FilterState = {
      categories: [],
      types: [ResourceType.VIDEO, ResourceType.ARTICLE],
      page: 1,
      pageSize: 12,
    };

    const params = serializeFiltersToURL(filters);
    expect(params.get('type')).toBe('VIDEO,ARTICLE');
  });

  it('should serialize page number when not 1', () => {
    const filters: FilterState = {
      categories: [],
      types: [],
      page: 3,
      pageSize: 12,
    };

    const params = serializeFiltersToURL(filters);
    expect(params.get('page')).toBe('3');
  });

  it('should not serialize page 1', () => {
    const filters: FilterState = {
      categories: [],
      types: [],
      page: 1,
      pageSize: 12,
    };

    const params = serializeFiltersToURL(filters);
    expect(params.has('page')).toBe(false);
  });

  it('should serialize pageSize when not default 12', () => {
    const filters: FilterState = {
      categories: [],
      types: [],
      page: 1,
      pageSize: 24,
    };

    const params = serializeFiltersToURL(filters);
    expect(params.get('pageSize')).toBe('24');
  });

  it('should serialize all filters together', () => {
    const filters: FilterState = {
      search: 'react',
      categories: [ResourceCategory.PROGRAMMING, ResourceCategory.WEB],
      types: [ResourceType.VIDEO],
      page: 2,
      pageSize: 24,
    };

    const params = serializeFiltersToURL(filters);
    expect(params.get('search')).toBe('react');
    expect(params.get('category')).toBe('PROGRAMMING,WEB');
    expect(params.get('type')).toBe('VIDEO');
    expect(params.get('page')).toBe('2');
    expect(params.get('pageSize')).toBe('24');
  });
});

describe('parseFiltersFromURL', () => {
  it('should parse empty params to default filters', () => {
    const params = new URLSearchParams();
    const filters = parseFiltersFromURL(params);

    expect(filters).toEqual({
      search: undefined,
      categories: [],
      types: [],
      page: 1,
      pageSize: 12,
    });
  });

  it('should parse search query', () => {
    const params = new URLSearchParams({ search: 'javascript' });
    const filters = parseFiltersFromURL(params);

    expect(filters.search).toBe('javascript');
  });

  it('should sanitize search query', () => {
    const params = new URLSearchParams({ search: '  javascript  ' });
    const filters = parseFiltersFromURL(params);

    expect(filters.search).toBe('javascript');
  });

  it('should parse single category', () => {
    const params = new URLSearchParams({ category: 'PROGRAMMING' });
    const filters = parseFiltersFromURL(params);

    expect(filters.categories).toEqual([ResourceCategory.PROGRAMMING]);
  });

  it('should parse multiple categories from comma-separated string', () => {
    const params = new URLSearchParams({ category: 'PROGRAMMING,WEB' });
    const filters = parseFiltersFromURL(params);

    expect(filters.categories).toEqual([ResourceCategory.PROGRAMMING, ResourceCategory.WEB]);
  });

  it('should ignore invalid categories', () => {
    const params = new URLSearchParams({ category: 'PROGRAMMING,INVALID,WEB' });
    const filters = parseFiltersFromURL(params);

    expect(filters.categories).toEqual([ResourceCategory.PROGRAMMING, ResourceCategory.WEB]);
  });

  it('should parse multiple types from comma-separated string', () => {
    const params = new URLSearchParams({ type: 'VIDEO,ARTICLE' });
    const filters = parseFiltersFromURL(params);

    expect(filters.types).toEqual([ResourceType.VIDEO, ResourceType.ARTICLE]);
  });

  it('should ignore invalid types', () => {
    const params = new URLSearchParams({ type: 'VIDEO,INVALID,ARTICLE' });
    const filters = parseFiltersFromURL(params);

    expect(filters.types).toEqual([ResourceType.VIDEO, ResourceType.ARTICLE]);
  });

  it('should parse valid page number', () => {
    const params = new URLSearchParams({ page: '5' });
    const filters = parseFiltersFromURL(params);

    expect(filters.page).toBe(5);
  });

  it('should default to page 1 for invalid page', () => {
    const params = new URLSearchParams({ page: 'invalid' });
    const filters = parseFiltersFromURL(params);

    expect(filters.page).toBe(1);
  });

  it('should default to page 1 for negative page', () => {
    const params = new URLSearchParams({ page: '-5' });
    const filters = parseFiltersFromURL(params);

    expect(filters.page).toBe(1);
  });

  it('should cap page at maximum 1000', () => {
    const params = new URLSearchParams({ page: '5000' });
    const filters = parseFiltersFromURL(params);

    expect(filters.page).toBe(1000);
  });

  it('should parse valid pageSize', () => {
    const params = new URLSearchParams({ pageSize: '24' });
    const filters = parseFiltersFromURL(params);

    expect(filters.pageSize).toBe(24);
  });

  it('should default to 12 for invalid pageSize', () => {
    const params = new URLSearchParams({ pageSize: 'invalid' });
    const filters = parseFiltersFromURL(params);

    expect(filters.pageSize).toBe(12);
  });

  it('should cap pageSize at maximum 100', () => {
    const params = new URLSearchParams({ pageSize: '500' });
    const filters = parseFiltersFromURL(params);

    expect(filters.pageSize).toBe(100);
  });

  it('should parse all parameters together', () => {
    const params = new URLSearchParams({
      search: 'react',
      category: 'PROGRAMMING,WEB',
      type: 'VIDEO',
      page: '2',
      pageSize: '24',
    });
    const filters = parseFiltersFromURL(params);

    expect(filters).toEqual({
      search: 'react',
      categories: [ResourceCategory.PROGRAMMING, ResourceCategory.WEB],
      types: [ResourceType.VIDEO],
      page: 2,
      pageSize: 24,
    });
  });

  it('should handle plain object query params', () => {
    const queryParams = {
      search: 'react',
      category: 'PROGRAMMING',
      type: 'VIDEO',
    };
    const filters = parseFiltersFromURL(queryParams);

    expect(filters.search).toBe('react');
    expect(filters.categories).toEqual([ResourceCategory.PROGRAMMING]);
    expect(filters.types).toEqual([ResourceType.VIDEO]);
  });
});

describe('areFiltersEqual', () => {
  it('should return true for identical filters', () => {
    const a: FilterState = {
      search: 'react',
      categories: [ResourceCategory.PROGRAMMING],
      types: [ResourceType.VIDEO],
      page: 2,
      pageSize: 12,
    };
    const b: FilterState = {
      search: 'react',
      categories: [ResourceCategory.PROGRAMMING],
      types: [ResourceType.VIDEO],
      page: 2,
      pageSize: 12,
    };

    expect(areFiltersEqual(a, b)).toBe(true);
  });

  it('should return false for different search', () => {
    const a: FilterState = {
      search: 'react',
      categories: [],
      types: [],
      page: 1,
      pageSize: 12,
    };
    const b: FilterState = {
      search: 'vue',
      categories: [],
      types: [],
      page: 1,
      pageSize: 12,
    };

    expect(areFiltersEqual(a, b)).toBe(false);
  });

  it('should return false for different categories', () => {
    const a: FilterState = {
      categories: [ResourceCategory.PROGRAMMING],
      types: [],
      page: 1,
      pageSize: 12,
    };
    const b: FilterState = {
      categories: [ResourceCategory.WEB],
      types: [],
      page: 1,
      pageSize: 12,
    };

    expect(areFiltersEqual(a, b)).toBe(false);
  });

  it('should return true for same categories in different order', () => {
    const a: FilterState = {
      categories: [ResourceCategory.PROGRAMMING, ResourceCategory.WEB],
      types: [],
      page: 1,
      pageSize: 12,
    };
    const b: FilterState = {
      categories: [ResourceCategory.WEB, ResourceCategory.PROGRAMMING],
      types: [],
      page: 1,
      pageSize: 12,
    };

    expect(areFiltersEqual(a, b)).toBe(true);
  });

  it('should return false for different page', () => {
    const a: FilterState = {
      categories: [],
      types: [],
      page: 1,
      pageSize: 12,
    };
    const b: FilterState = {
      categories: [],
      types: [],
      page: 2,
      pageSize: 12,
    };

    expect(areFiltersEqual(a, b)).toBe(false);
  });
});

describe('URL round-trip', () => {
  it('should maintain filter state through serialize and parse', () => {
    const original: FilterState = {
      search: 'react hooks',
      categories: [ResourceCategory.PROGRAMMING, ResourceCategory.WEB],
      types: [ResourceType.VIDEO, ResourceType.ARTICLE],
      page: 3,
      pageSize: 24,
    };

    const params = serializeFiltersToURL(original);
    const parsed = parseFiltersFromURL(params);

    expect(areFiltersEqual(original, parsed)).toBe(true);
  });

  it('should handle empty filters round-trip', () => {
    const original: FilterState = {
      categories: [],
      types: [],
      page: 1,
      pageSize: 12,
    };

    const params = serializeFiltersToURL(original);
    const parsed = parseFiltersFromURL(params);

    expect(areFiltersEqual(original, parsed)).toBe(true);
  });
});
