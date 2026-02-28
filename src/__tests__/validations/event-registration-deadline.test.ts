import { describe, it, expect } from 'vitest';
import { updateEventSchema } from '@/lib/validations/event';

/**
 * Unit Tests: Event Registration Deadline Validation
 * 
 * Tests the validation logic for registrationDeadline and registrationManuallyClosedAt fields
 * in the event update schema.
 * 
 * Validates Requirements: 1.2, 1.4, 3.1
 */
describe('Event Registration Deadline Validation', () => {
  describe('updateEventSchema - registrationDeadline', () => {
    it('should accept valid registrationDeadline before event date', () => {
      const eventDate = new Date('2025-12-31T10:00:00Z');
      const deadline = new Date('2025-12-30T10:00:00Z');

      const result = updateEventSchema.safeParse({
        date: eventDate.toISOString(),
        registrationDeadline: deadline.toISOString(),
      });

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.registrationDeadline).toBe(deadline.toISOString());
      }
    });

    it('should reject registrationDeadline after event date', () => {
      const eventDate = new Date('2025-12-31T10:00:00Z');
      const deadline = new Date('2026-01-01T10:00:00Z'); // After event date

      const result = updateEventSchema.safeParse({
        date: eventDate.toISOString(),
        registrationDeadline: deadline.toISOString(),
      });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('Registration deadline must be before event start date');
      }
    });

    it('should reject registrationDeadline equal to event date', () => {
      const eventDate = new Date('2025-12-31T10:00:00Z');
      const deadline = new Date('2025-12-31T10:00:00Z'); // Same as event date

      const result = updateEventSchema.safeParse({
        date: eventDate.toISOString(),
        registrationDeadline: deadline.toISOString(),
      });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('Registration deadline must be before event start date');
      }
    });

    it('should accept null registrationDeadline', () => {
      const result = updateEventSchema.safeParse({
        registrationDeadline: null,
      });

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.registrationDeadline).toBeUndefined();
      }
    });

    it('should accept undefined registrationDeadline (field not provided)', () => {
      const result = updateEventSchema.safeParse({
        title: 'Updated Event',
      });

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.registrationDeadline).toBeUndefined();
      }
    });

    it('should reject invalid date format for registrationDeadline', () => {
      const result = updateEventSchema.safeParse({
        registrationDeadline: 'invalid-date',
      });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('Invalid registration deadline format');
      }
    });
  });

  describe('updateEventSchema - registrationManuallyClosedAt', () => {
    it('should accept valid registrationManuallyClosedAt timestamp', () => {
      const closedAt = new Date('2025-12-15T10:00:00Z');

      const result = updateEventSchema.safeParse({
        registrationManuallyClosedAt: closedAt.toISOString(),
      });

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.registrationManuallyClosedAt).toBe(closedAt.toISOString());
      }
    });

    it('should accept null registrationManuallyClosedAt (reopening registration)', () => {
      const result = updateEventSchema.safeParse({
        registrationManuallyClosedAt: null,
      });

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.registrationManuallyClosedAt).toBeUndefined();
      }
    });

    it('should accept undefined registrationManuallyClosedAt (field not provided)', () => {
      const result = updateEventSchema.safeParse({
        title: 'Updated Event',
      });

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.registrationManuallyClosedAt).toBeUndefined();
      }
    });

    it('should reject invalid date format for registrationManuallyClosedAt', () => {
      const result = updateEventSchema.safeParse({
        registrationManuallyClosedAt: 'invalid-date',
      });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('Invalid manual closure date format');
      }
    });
  });

  describe('updateEventSchema - combined fields', () => {
    it('should accept both registrationDeadline and registrationManuallyClosedAt', () => {
      const eventDate = new Date('2025-12-31T10:00:00Z');
      const deadline = new Date('2025-12-30T10:00:00Z');
      const closedAt = new Date('2025-12-15T10:00:00Z');

      const result = updateEventSchema.safeParse({
        date: eventDate.toISOString(),
        registrationDeadline: deadline.toISOString(),
        registrationManuallyClosedAt: closedAt.toISOString(),
      });

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.registrationDeadline).toBe(deadline.toISOString());
        expect(result.data.registrationManuallyClosedAt).toBe(closedAt.toISOString());
      }
    });

    it('should validate registrationDeadline even when registrationManuallyClosedAt is set', () => {
      const eventDate = new Date('2025-12-31T10:00:00Z');
      const invalidDeadline = new Date('2026-01-01T10:00:00Z'); // After event
      const closedAt = new Date('2025-12-15T10:00:00Z');

      const result = updateEventSchema.safeParse({
        date: eventDate.toISOString(),
        registrationDeadline: invalidDeadline.toISOString(),
        registrationManuallyClosedAt: closedAt.toISOString(),
      });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('Registration deadline must be before event start date');
      }
    });
  });
});
