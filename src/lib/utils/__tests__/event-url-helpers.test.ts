/**
 * Unit tests for event URL helper utilities
 * Feature: events-page-ui-improvements
 * Requirements: 1.8 (Filter state persists in URL)
 */

import { describe, it, expect } from 'vitest';
import {
  serializeFiltersToURL,
  parseFiltersFromURL,
  areFiltersEqual,
} from '../event-url-helpers';
import { EventFilterState } from '@/lib/types/events.types';

describe('event-url-helpers', () => {
  describe('serializeFiltersToURL', () => {
    it('should serialize empty filters to empty params', () => {
      const filters: EventFilterState = {
        search: undefined,
        types: [],
        dateRange: {},
        availability: 'all',
        myEvents: false,
        sortBy: 'date-asc',
        page: 1,
        pageSize: 12,
      };

      const params = serializeFiltersToURL(filters);
      expect(params.toString()).toBe('');
    });

    it('should serialize search query', () => {
      const filters: EventFilterState = {
        search: 'workshop',
        types: [],
        dateRange: {},
        availability: 'all',
        myEvents: false,
        page: 1,
        pageSize: 12,
      };

      const params = serializeFiltersToURL(filters);
      expect(params.get('search')).toBe('workshop');
    });

    it('should serialize event types', () => {
      const filters: EventFilterState = {
        search: undefined,
        types: ['WORKSHOP', 'HACKATHON'],
        dateRange: {},
        availability: 'all',
        myEvents: false,
        page: 1,
        pageSize: 12,
      };

      const params = serializeFiltersToURL(filters);
      expect(params.get('type')).toBe('WORKSHOP,HACKATHON');
    });

    it('should serialize date range', () => {
      const startDate = new Date('2024-01-01T00:00:00.000Z');
      const endDate = new Date('2024-12-31T23:59:59.999Z');
      
      const filters: EventFilterState = {
        search: undefined,
        types: [],
        dateRange: { start: startDate, end: endDate },
        availability: 'all',
        myEvents: false,
        page: 1,
        pageSize: 12,
      };

      const params = serializeFiltersToURL(filters);
      expect(params.get('startDate')).toBe(startDate.toISOString());
      expect(params.get('endDate')).toBe(endDate.toISOString());
    });

    it('should serialize availability filter', () => {
      const filters: EventFilterState = {
        search: undefined,
        types: [],
        dateRange: {},
        availability: 'available',
        myEvents: false,
        page: 1,
        pageSize: 12,
      };

      const params = serializeFiltersToURL(filters);
      expect(params.get('availability')).toBe('available');
    });

    it('should not serialize availability if "all"', () => {
      const filters: EventFilterState = {
        search: undefined,
        types: [],
        dateRange: {},
        availability: 'all',
        myEvents: false,
        page: 1,
        pageSize: 12,
      };

      const params = serializeFiltersToURL(filters);
      expect(params.has('availability')).toBe(false);
    });

    it('should serialize myEvents filter', () => {
      const filters: EventFilterState = {
        search: undefined,
        types: [],
        dateRange: {},
        availability: 'all',
        myEvents: true,
        page: 1,
        pageSize: 12,
      };

      const params = serializeFiltersToURL(filters);
      expect(params.get('myEvents')).toBe('true');
    });

    it('should serialize page number', () => {
      const filters: EventFilterState = {
        search: undefined,
        types: [],
        dateRange: {},
        availability: 'all',
        myEvents: false,
        page: 3,
        pageSize: 12,
      };

      const params = serializeFiltersToURL(filters);
      expect(params.get('page')).toBe('3');
    });

    it('should not serialize page 1', () => {
      const filters: EventFilterState = {
        search: undefined,
        types: [],
        dateRange: {},
        availability: 'all',
        myEvents: false,
        page: 1,
        pageSize: 12,
      };

      const params = serializeFiltersToURL(filters);
      expect(params.has('page')).toBe(false);
    });

    it('should serialize custom page size', () => {
      const filters: EventFilterState = {
        search: undefined,
        types: [],
        dateRange: {},
        availability: 'all',
        myEvents: false,
        page: 1,
        pageSize: 24,
      };

      const params = serializeFiltersToURL(filters);
      expect(params.get('pageSize')).toBe('24');
    });

    it('should serialize all filters together', () => {
      const filters: EventFilterState = {
        search: 'react',
        types: ['WORKSHOP', 'WEBINAR'],
        dateRange: {
          start: new Date('2024-01-01'),
          end: new Date('2024-12-31'),
        },
        availability: 'available',
        myEvents: true,
        page: 2,
        pageSize: 24,
      };

      const params = serializeFiltersToURL(filters);
      expect(params.get('search')).toBe('react');
      expect(params.get('type')).toBe('WORKSHOP,WEBINAR');
      expect(params.has('startDate')).toBe(true);
      expect(params.has('endDate')).toBe(true);
      expect(params.get('availability')).toBe('available');
      expect(params.get('myEvents')).toBe('true');
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
        types: [],
        dateRange: {},
        availability: 'all',
        myEvents: false,
        sortBy: 'date-asc',
        page: 1,
        pageSize: 12,
      });
    });

    it('should parse search query', () => {
      const params = new URLSearchParams({ search: 'workshop' });
      const filters = parseFiltersFromURL(params);

      expect(filters.search).toBe('workshop');
    });

    it('should sanitize search query', () => {
      const params = new URLSearchParams({ search: '  workshop  ' });
      const filters = parseFiltersFromURL(params);

      expect(filters.search).toBe('workshop');
    });

    it('should parse event types', () => {
      const params = new URLSearchParams({ type: 'WORKSHOP,HACKATHON' });
      const filters = parseFiltersFromURL(params);

      expect(filters.types).toEqual(['WORKSHOP', 'HACKATHON']);
    });

    it('should filter out invalid event types', () => {
      const params = new URLSearchParams({ type: 'WORKSHOP,INVALID,HACKATHON' });
      const filters = parseFiltersFromURL(params);

      expect(filters.types).toEqual(['WORKSHOP', 'HACKATHON']);
    });

    it('should parse date range', () => {
      const startDate = new Date('2024-01-01T00:00:00.000Z');
      const endDate = new Date('2024-12-31T23:59:59.999Z');
      
      const params = new URLSearchParams({
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
      });
      const filters = parseFiltersFromURL(params);

      expect(filters.dateRange.start?.getTime()).toBe(startDate.getTime());
      expect(filters.dateRange.end?.getTime()).toBe(endDate.getTime());
    });

    it('should handle invalid dates', () => {
      const params = new URLSearchParams({
        startDate: 'invalid-date',
        endDate: 'also-invalid',
      });
      const filters = parseFiltersFromURL(params);

      expect(filters.dateRange.start).toBeUndefined();
      expect(filters.dateRange.end).toBeUndefined();
    });

    it('should parse availability filter', () => {
      const params = new URLSearchParams({ availability: 'available' });
      const filters = parseFiltersFromURL(params);

      expect(filters.availability).toBe('available');
    });

    it('should default to "all" for invalid availability', () => {
      const params = new URLSearchParams({ availability: 'invalid' });
      const filters = parseFiltersFromURL(params);

      expect(filters.availability).toBe('all');
    });

    it('should parse myEvents filter', () => {
      const params = new URLSearchParams({ myEvents: 'true' });
      const filters = parseFiltersFromURL(params);

      expect(filters.myEvents).toBe(true);
    });

    it('should default myEvents to false', () => {
      const params = new URLSearchParams({ myEvents: 'false' });
      const filters = parseFiltersFromURL(params);

      expect(filters.myEvents).toBe(false);
    });

    it('should parse page number', () => {
      const params = new URLSearchParams({ page: '3' });
      const filters = parseFiltersFromURL(params);

      expect(filters.page).toBe(3);
    });

    it('should validate page number minimum', () => {
      const params = new URLSearchParams({ page: '0' });
      const filters = parseFiltersFromURL(params);

      expect(filters.page).toBe(1);
    });

    it('should validate page number maximum', () => {
      const params = new URLSearchParams({ page: '9999' });
      const filters = parseFiltersFromURL(params);

      expect(filters.page).toBe(1000);
    });

    it('should parse page size', () => {
      const params = new URLSearchParams({ pageSize: '24' });
      const filters = parseFiltersFromURL(params);

      expect(filters.pageSize).toBe(24);
    });

    it('should validate page size minimum', () => {
      const params = new URLSearchParams({ pageSize: '0' });
      const filters = parseFiltersFromURL(params);

      expect(filters.pageSize).toBe(12);
    });

    it('should validate page size maximum', () => {
      const params = new URLSearchParams({ pageSize: '999' });
      const filters = parseFiltersFromURL(params);

      expect(filters.pageSize).toBe(100);
    });
  });

  describe('areFiltersEqual', () => {
    it('should return true for identical filters', () => {
      const filters1: EventFilterState = {
        search: 'workshop',
        types: ['WORKSHOP'],
        dateRange: {},
        availability: 'all',
        myEvents: false,
        page: 1,
        pageSize: 12,
      };

      const filters2: EventFilterState = {
        search: 'workshop',
        types: ['WORKSHOP'],
        dateRange: {},
        availability: 'all',
        myEvents: false,
        page: 1,
        pageSize: 12,
      };

      expect(areFiltersEqual(filters1, filters2)).toBe(true);
    });

    it('should return false for different search', () => {
      const filters1: EventFilterState = {
        search: 'workshop',
        types: [],
        dateRange: {},
        availability: 'all',
        myEvents: false,
        page: 1,
        pageSize: 12,
      };

      const filters2: EventFilterState = {
        search: 'hackathon',
        types: [],
        dateRange: {},
        availability: 'all',
        myEvents: false,
        page: 1,
        pageSize: 12,
      };

      expect(areFiltersEqual(filters1, filters2)).toBe(false);
    });

    it('should return false for different types', () => {
      const filters1: EventFilterState = {
        search: undefined,
        types: ['WORKSHOP'],
        dateRange: {},
        availability: 'all',
        myEvents: false,
        page: 1,
        pageSize: 12,
      };

      const filters2: EventFilterState = {
        search: undefined,
        types: ['HACKATHON'],
        dateRange: {},
        availability: 'all',
        myEvents: false,
        page: 1,
        pageSize: 12,
      };

      expect(areFiltersEqual(filters1, filters2)).toBe(false);
    });

    it('should return true for same types in different order', () => {
      const filters1: EventFilterState = {
        search: undefined,
        types: ['WORKSHOP', 'HACKATHON'],
        dateRange: {},
        availability: 'all',
        myEvents: false,
        page: 1,
        pageSize: 12,
      };

      const filters2: EventFilterState = {
        search: undefined,
        types: ['HACKATHON', 'WORKSHOP'],
        dateRange: {},
        availability: 'all',
        myEvents: false,
        page: 1,
        pageSize: 12,
      };

      expect(areFiltersEqual(filters1, filters2)).toBe(true);
    });

    it('should return false for different date ranges', () => {
      const filters1: EventFilterState = {
        search: undefined,
        types: [],
        dateRange: { start: new Date('2024-01-01') },
        availability: 'all',
        myEvents: false,
        page: 1,
        pageSize: 12,
      };

      const filters2: EventFilterState = {
        search: undefined,
        types: [],
        dateRange: { start: new Date('2024-02-01') },
        availability: 'all',
        myEvents: false,
        page: 1,
        pageSize: 12,
      };

      expect(areFiltersEqual(filters1, filters2)).toBe(false);
    });

    it('should return false for different availability', () => {
      const filters1: EventFilterState = {
        search: undefined,
        types: [],
        dateRange: {},
        availability: 'all',
        myEvents: false,
        page: 1,
        pageSize: 12,
      };

      const filters2: EventFilterState = {
        search: undefined,
        types: [],
        dateRange: {},
        availability: 'available',
        myEvents: false,
        page: 1,
        pageSize: 12,
      };

      expect(areFiltersEqual(filters1, filters2)).toBe(false);
    });

    it('should return false for different myEvents', () => {
      const filters1: EventFilterState = {
        search: undefined,
        types: [],
        dateRange: {},
        availability: 'all',
        myEvents: false,
        page: 1,
        pageSize: 12,
      };

      const filters2: EventFilterState = {
        search: undefined,
        types: [],
        dateRange: {},
        availability: 'all',
        myEvents: true,
        page: 1,
        pageSize: 12,
      };

      expect(areFiltersEqual(filters1, filters2)).toBe(false);
    });
  });
});
