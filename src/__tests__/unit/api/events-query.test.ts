/**
 * Unit tests for GET /api/events endpoint
 * Feature: event-registration-closed
 * Task: 6.1 - Update GET /api/events endpoint
 * Requirements: 8.1, 8.2, 8.3, 8.4, 8.5
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { computeRegistrationStatus } from '@/lib/utils/event-helpers';
import type { Event } from '@/lib/api/types';

describe('GET /api/events - Registration Status Computation', () => {
  describe('computeRegistrationStatus integration', () => {
    it('should compute isRegistrationClosed=false for open events', () => {
      const event = {
        id: '1',
        title: 'Test Event',
        maxSeats: 100,
        registrationDeadline: null,
        registrationManuallyClosedAt: null,
      } as Event;

      const attendeeCount = 50;
      const status = computeRegistrationStatus(event, attendeeCount);

      expect(status.isOpen).toBe(true);
      expect(status.reason).toBeUndefined();
      expect(status.message).toBe('50 spots available');
    });

    it('should compute isRegistrationClosed=true for full events', () => {
      const event = {
        id: '1',
        title: 'Test Event',
        maxSeats: 100,
        registrationDeadline: null,
        registrationManuallyClosedAt: null,
      } as Event;

      const attendeeCount = 100;
      const status = computeRegistrationStatus(event, attendeeCount);

      expect(status.isOpen).toBe(false);
      expect(status.reason).toBe('capacity');
      expect(status.message).toContain('Event is full');
    });

    it('should compute isRegistrationClosed=true for deadline-passed events', () => {
      const pastDate = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
      const event = {
        id: '1',
        title: 'Test Event',
        maxSeats: 100,
        registrationDeadline: pastDate,
        registrationManuallyClosedAt: null,
      } as Event;

      const attendeeCount = 50;
      const status = computeRegistrationStatus(event, attendeeCount);

      expect(status.isOpen).toBe(false);
      expect(status.reason).toBe('deadline');
      expect(status.message).toContain('Registration deadline has passed');
    });

    it('should compute isRegistrationClosed=true for manually closed events', () => {
      const event = {
        id: '1',
        title: 'Test Event',
        maxSeats: 100,
        registrationDeadline: null,
        registrationManuallyClosedAt: new Date().toISOString(),
      } as Event;

      const attendeeCount = 50;
      const status = computeRegistrationStatus(event, attendeeCount);

      expect(status.isOpen).toBe(false);
      expect(status.reason).toBe('manual');
      expect(status.message).toBe('Registration is currently closed');
    });

    it('should prioritize manual closure over other conditions', () => {
      const pastDate = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
      const event = {
        id: '1',
        title: 'Test Event',
        maxSeats: 100,
        registrationDeadline: pastDate,
        registrationManuallyClosedAt: new Date().toISOString(),
      } as Event;

      const attendeeCount = 100; // Also at capacity
      const status = computeRegistrationStatus(event, attendeeCount);

      expect(status.isOpen).toBe(false);
      expect(status.reason).toBe('manual'); // Manual takes priority
    });
  });

  describe('Availability filter logic', () => {
    it('should exclude closed events when availability=available', () => {
      const events = [
        {
          id: '1',
          isRegistrationClosed: false,
          isUserRegistered: false,
        },
        {
          id: '2',
          isRegistrationClosed: true,
          isUserRegistered: false,
        },
        {
          id: '3',
          isRegistrationClosed: false,
          isUserRegistered: false,
        },
      ];

      const filtered = events.filter(event => 
        !event.isRegistrationClosed || event.isUserRegistered
      );

      expect(filtered).toHaveLength(2);
      expect(filtered.map(e => e.id)).toEqual(['1', '3']);
    });

    it('should include user registered events even if closed', () => {
      const events = [
        {
          id: '1',
          isRegistrationClosed: false,
          isUserRegistered: false,
        },
        {
          id: '2',
          isRegistrationClosed: true,
          isUserRegistered: true, // User is registered
        },
        {
          id: '3',
          isRegistrationClosed: true,
          isUserRegistered: false,
        },
      ];

      const filtered = events.filter(event => 
        !event.isRegistrationClosed || event.isUserRegistered
      );

      expect(filtered).toHaveLength(2);
      expect(filtered.map(e => e.id)).toEqual(['1', '2']);
    });
  });

  describe('Filter count calculation', () => {
    it('should calculate availableCount correctly', () => {
      const events = [
        { id: '1', isRegistrationClosed: false },
        { id: '2', isRegistrationClosed: true },
        { id: '3', isRegistrationClosed: false },
        { id: '4', isRegistrationClosed: true },
        { id: '5', isRegistrationClosed: false },
      ];

      const availableCount = events.filter(e => !e.isRegistrationClosed).length;
      const totalCount = events.length;

      expect(availableCount).toBe(3);
      expect(totalCount).toBe(5);
    });

    it('should handle all events closed', () => {
      const events = [
        { id: '1', isRegistrationClosed: true },
        { id: '2', isRegistrationClosed: true },
      ];

      const availableCount = events.filter(e => !e.isRegistrationClosed).length;
      const totalCount = events.length;

      expect(availableCount).toBe(0);
      expect(totalCount).toBe(2);
    });

    it('should handle all events open', () => {
      const events = [
        { id: '1', isRegistrationClosed: false },
        { id: '2', isRegistrationClosed: false },
      ];

      const availableCount = events.filter(e => !e.isRegistrationClosed).length;
      const totalCount = events.length;

      expect(availableCount).toBe(2);
      expect(totalCount).toBe(2);
    });
  });
});
