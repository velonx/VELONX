import { describe, it, expect } from 'vitest';
import { extractIdFromSlug, slugifyResource } from '../../utils';

describe('Resource Slug Utilities', () => {
  const sampleId = '65a1234567890abcdef12345';

  describe('slugifyResource', () => {
    it('should create a clean hyphenated slug with id at the end', () => {
      const slug = slugifyResource(sampleId, 'React & Next.js 15 Guide!');
      expect(slug).toBe('react-nextjs-15-guide-65a1234567890abcdef12345');
    });

    it('should truncate long titles and append id', () => {
      const longTitle = 'A'.repeat(100);
      const slug = slugifyResource(sampleId, longTitle);
      expect(slug.length).toBeLessThanOrEqual(60 + 1 + sampleId.length);
      expect(slug.endsWith(`-${sampleId}`)).toBe(true);
    });

    it('should fallback to id if title has no alphanumeric characters', () => {
      const slug = slugifyResource(sampleId, '!!! ***');
      expect(slug).toBe(sampleId);
    });
  });

  describe('extractIdFromSlug', () => {
    it('should return raw ObjectId unchanged', () => {
      expect(extractIdFromSlug(sampleId)).toBe(sampleId);
    });

    it('should extract ObjectId from full slug', () => {
      const slug = 'react-nextjs-15-guide-65a1234567890abcdef12345';
      expect(extractIdFromSlug(slug)).toBe(sampleId);
    });

    it('should handle uppercase hex ObjectId', () => {
      const upperId = '65A1234567890ABCDEF12345';
      const slug = `react-guide-${upperId}`;
      expect(extractIdFromSlug(slug)).toBe(upperId);
    });

    it('should return input trimmed if no 24-character hex ID is found', () => {
      expect(extractIdFromSlug('invalid-slug')).toBe('invalid-slug');
    });
  });
});
