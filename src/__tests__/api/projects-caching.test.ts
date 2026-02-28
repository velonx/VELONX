/**
 * Tests for projects endpoint caching functionality
 * Validates caching behavior for completed projects queries
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { cacheService, CacheKeys, CacheTTL } from '@/lib/services/cache.service';

describe('Projects Endpoint Caching', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Cache Key Generation', () => {
    it('should generate unique cache keys for different query parameters', () => {
      const key1 = CacheKeys.project.completed({
        page: 1,
        pageSize: 10,
      });

      const key2 = CacheKeys.project.completed({
        page: 2,
        pageSize: 10,
      });

      const key3 = CacheKeys.project.completed({
        page: 1,
        pageSize: 10,
        techStack: 'React,Node.js',
      });

      expect(key1).not.toBe(key2);
      expect(key1).not.toBe(key3);
      expect(key2).not.toBe(key3);
    });

    it('should generate consistent cache keys for same parameters', () => {
      const key1 = CacheKeys.project.completed({
        page: 1,
        pageSize: 10,
        category: 'WEB_DEV',
      });

      const key2 = CacheKeys.project.completed({
        page: 1,
        pageSize: 10,
        category: 'WEB_DEV',
      });

      expect(key1).toBe(key2);
    });

    it('should include all filter parameters in cache key', () => {
      const key = CacheKeys.project.completed({
        page: 1,
        pageSize: 20,
        techStack: 'React,TypeScript',
        category: 'WEB_DEV',
        difficulty: 'INTERMEDIATE',
        memberId: 'user123',
      });

      expect(key).toContain('page:1');
      expect(key).toContain('size:20');
      expect(key).toContain('tech:React,TypeScript');
      expect(key).toContain('cat:WEB_DEV');
      expect(key).toContain('diff:INTERMEDIATE');
      expect(key).toContain('member:user123');
    });
  });

  describe('Cache Pattern Matching', () => {
    it('should match all completed project cache keys with pattern', () => {
      const pattern = CacheKeys.project.allCompleted();
      
      expect(pattern).toBe('project:completed:*');
    });

    it('should generate different patterns for completed vs all projects', () => {
      const completedPattern = CacheKeys.project.allCompleted();
      const allPattern = CacheKeys.project.all();

      expect(completedPattern).toBe('project:completed:*');
      expect(allPattern).toBe('project:*');
      expect(completedPattern).not.toBe(allPattern);
    });
  });

  describe('Cache TTL Configuration', () => {
    it('should have appropriate TTL for completed projects', () => {
      expect(CacheTTL.PROJECT_COMPLETED).toBe(300); // 5 minutes
    });

    it('should use same TTL as other project caches', () => {
      expect(CacheTTL.PROJECT_COMPLETED).toBe(CacheTTL.PROJECT_LIST);
    });
  });

  describe('Cache Service Integration', () => {
    it('should support getOrSet pattern for cache-aside', async () => {
      const key = 'test:cache:key:unique';
      const value = { data: 'test' };
      
      // Clear any existing cache for this key
      await cacheService.delete(key);
      
      // Mock fetcher function
      const fetcher = vi.fn().mockResolvedValue(value);

      // First call should fetch and cache
      const result1 = await cacheService.getOrSet(key, fetcher, 60);
      expect(result1).toEqual(value);
      
      // Fetcher should have been called once
      expect(fetcher).toHaveBeenCalledTimes(1);
      
      // Clean up
      await cacheService.delete(key);
    });

    it('should support cache invalidation by pattern', async () => {
      const pattern = CacheKeys.project.allCompleted();
      
      // Should not throw error
      await expect(cacheService.invalidate(pattern)).resolves.not.toThrow();
    });
  });

  describe('Cache Key Structure', () => {
    it('should use colon-separated format for cache keys', () => {
      const key = CacheKeys.project.completed({
        page: 1,
        pageSize: 10,
      });

      expect(key).toMatch(/^project:completed:/);
      // Key format: project:completed:page:1:size:10 (6 parts)
      expect(key.split(':')).toHaveLength(6);
    });

    it('should handle optional parameters gracefully', () => {
      const keyMinimal = CacheKeys.project.completed({});
      const keyWithPage = CacheKeys.project.completed({ page: 1 });

      expect(keyMinimal).toBe('project:completed');
      expect(keyWithPage).toContain('page:1');
    });
  });
});
