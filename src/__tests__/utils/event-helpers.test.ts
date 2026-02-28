/**
 * Unit tests for event helper utilities
 * Feature: event-registration-closed
 * Requirements: 1.3, 1.5, 2.1, 2.2, 3.2, 3.3, 6.2
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { computeRegistrationStatus, getRegistrationButtonText } from '@/lib/utils/event-helpers';
import type { Event } from '@/lib/api/types';

describe('Event Helpers - Registration Status', () => {
  let mockEvent: Event & { 
    registrationDeadline?: string | null;
    registrationManuallyClosedAt?: string | null;
  };

  beforeEach(() => {
    // Reset mock event before each test
    mockEvent = {
      id: 'test-event-1',
      title: 'Test Event',
      description: 'Test Description',
      type: 'WORKSHOP',
      date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days from now
      endDate: null,
      location: 'Test Location',
      meetingLink: null,
      imageUrl: null,
      maxSeats: 50,
      status: 'UPCOMING',
      creatorId: 'creator-1',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      registrationDeadline: null,
      registrationManuallyClosedAt: null,
    };
  });

  describe('computeRegistrationStatus', () => {
    describe('Open registration', () => {
      it('should return open status when no closure conditions are met', () => {
        const result = computeRegistrationStatus(mockEvent, 25);
        
        expect(result.isOpen).toBe(true);
        expect(result.reason).toBeUndefined();
        expect(result.message).toBe('25 spots available');
        expect(result.canReopen).toBe(false);
      });

      it('should calculate correct available spots', () => {
        const result = computeRegistrationStatus(mockEvent, 45);
        
        expect(result.isOpen).toBe(true);
        expect(result.message).toBe('5 spots available');
      });

      it('should show all spots available when no attendees', () => {
        const result = computeRegistrationStatus(mockEvent, 0);
        
        expect(result.isOpen).toBe(true);
        expect(result.message).toBe('50 spots available');
      });
    });

    describe('Capacity-based closure', () => {
      it('should return closed status when at capacity', () => {
        const result = computeRegistrationStatus(mockEvent, 50);
        
        expect(result.isOpen).toBe(false);
        expect(result.reason).toBe('capacity');
        expect(result.message).toBe('Event is full (50/50 registered)');
        expect(result.canReopen).toBe(true);
      });

      it('should return closed status when over capacity', () => {
        const result = computeRegistrationStatus(mockEvent, 55);
        
        expect(result.isOpen).toBe(false);
        expect(result.reason).toBe('capacity');
        expect(result.message).toBe('Event is full (55/50 registered)');
        expect(result.canReopen).toBe(true);
      });
    });

    describe('Deadline-based closure', () => {
      it('should return closed status when deadline has passed', () => {
        const pastDate = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(); // Yesterday
        mockEvent.registrationDeadline = pastDate;
        
        const result = computeRegistrationStatus(mockEvent, 25);
        
        expect(result.isOpen).toBe(false);
        expect(result.reason).toBe('deadline');
        expect(result.message).toContain('Registration deadline has passed');
        expect(result.canReopen).toBe(false);
      });

      it('should return open status when deadline is in the future', () => {
        const futureDate = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(); // Tomorrow
        mockEvent.registrationDeadline = futureDate;
        
        const result = computeRegistrationStatus(mockEvent, 25);
        
        expect(result.isOpen).toBe(true);
      });

      it('should include deadline date in message', () => {
        const pastDate = new Date('2024-01-15T12:00:00Z');
        mockEvent.registrationDeadline = pastDate.toISOString();
        
        const result = computeRegistrationStatus(mockEvent, 25);
        
        expect(result.message).toContain('closed on');
        expect(result.message).toContain(pastDate.toLocaleDateString());
      });
    });

    describe('Manual closure', () => {
      it('should return closed status when manually closed', () => {
        mockEvent.registrationManuallyClosedAt = new Date().toISOString();
        
        const result = computeRegistrationStatus(mockEvent, 25);
        
        expect(result.isOpen).toBe(false);
        expect(result.reason).toBe('manual');
        expect(result.message).toBe('Registration is currently closed');
        expect(result.canReopen).toBe(true);
      });
    });

    describe('Priority order', () => {
      it('should prioritize manual closure over deadline', () => {
        const pastDate = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
        mockEvent.registrationDeadline = pastDate;
        mockEvent.registrationManuallyClosedAt = new Date().toISOString();
        
        const result = computeRegistrationStatus(mockEvent, 25);
        
        expect(result.reason).toBe('manual');
      });

      it('should prioritize manual closure over capacity', () => {
        mockEvent.registrationManuallyClosedAt = new Date().toISOString();
        
        const result = computeRegistrationStatus(mockEvent, 50);
        
        expect(result.reason).toBe('manual');
      });

      it('should prioritize deadline over capacity', () => {
        const pastDate = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
        mockEvent.registrationDeadline = pastDate;
        
        const result = computeRegistrationStatus(mockEvent, 50);
        
        expect(result.reason).toBe('deadline');
      });

      it('should prioritize manual closure when all conditions are met', () => {
        const pastDate = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
        mockEvent.registrationDeadline = pastDate;
        mockEvent.registrationManuallyClosedAt = new Date().toISOString();
        
        const result = computeRegistrationStatus(mockEvent, 50);
        
        expect(result.reason).toBe('manual');
      });
    });
  });

  describe('getRegistrationButtonText', () => {
    it('should return "Registered" when user is registered', () => {
      const statusInfo = { isOpen: true, message: '25 spots available', canReopen: false };
      const result = getRegistrationButtonText(true, statusInfo);
      
      expect(result).toBe('Registered');
    });

    it('should return "Register Now" when registration is open', () => {
      const statusInfo = { isOpen: true, message: '25 spots available', canReopen: false };
      const result = getRegistrationButtonText(false, statusInfo);
      
      expect(result).toBe('Register Now');
    });

    it('should return "Event Full" when closed due to capacity', () => {
      const statusInfo = { 
        isOpen: false, 
        reason: 'capacity' as const, 
        message: 'Event is full', 
        canReopen: true 
      };
      const result = getRegistrationButtonText(false, statusInfo);
      
      expect(result).toBe('Event Full');
    });

    it('should return "Deadline Passed" when closed due to deadline', () => {
      const statusInfo = { 
        isOpen: false, 
        reason: 'deadline' as const, 
        message: 'Registration deadline has passed', 
        canReopen: false 
      };
      const result = getRegistrationButtonText(false, statusInfo);
      
      expect(result).toBe('Deadline Passed');
    });

    it('should return "Registration Closed" when manually closed', () => {
      const statusInfo = { 
        isOpen: false, 
        reason: 'manual' as const, 
        message: 'Registration is currently closed', 
        canReopen: true 
      };
      const result = getRegistrationButtonText(false, statusInfo);
      
      expect(result).toBe('Registration Closed');
    });

    it('should return "Unavailable" when closed with no reason', () => {
      const statusInfo = { 
        isOpen: false, 
        message: 'Not available', 
        canReopen: false 
      };
      const result = getRegistrationButtonText(false, statusInfo);
      
      expect(result).toBe('Unavailable');
    });

    it('should prioritize registered status over closure status', () => {
      const statusInfo = { 
        isOpen: false, 
        reason: 'capacity' as const, 
        message: 'Event is full', 
        canReopen: true 
      };
      const result = getRegistrationButtonText(true, statusInfo);
      
      expect(result).toBe('Registered');
    });
  });
});
