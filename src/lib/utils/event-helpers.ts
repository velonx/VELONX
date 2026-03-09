/**
 * Event Helper Utilities
 * Feature: event-registration-closed
 * Requirements: 1.3, 1.5, 2.1, 2.2, 3.2, 3.3, 6.2
 */

import type { Event } from '@/lib/api/types';
import type { RegistrationStatusInfo, RegistrationClosureReason } from '@/lib/types/events.types';

/**
 * Computes the registration status for an event based on multiple conditions
 * 
 * Priority order (highest to lowest):
 * 1. Manual closure - registrationManuallyClosedAt is set
 * 2. Deadline closure - current time > registrationDeadline
 * 3. Capacity closure - attendeeCount >= maxSeats
 * 4. Open - none of the above conditions met
 * 
 * @param event - The event object with registration fields
 * @param attendeeCount - Current number of registered attendees
 * @returns RegistrationStatusInfo with isOpen, reason, message, and canReopen
 * 
 * **Validates: Requirements 1.3, 1.5, 2.1, 2.2, 3.2, 3.3**
 */
export function computeRegistrationStatus(
  event: Event & {
    registrationDeadline?: string | null;
    registrationManuallyClosedAt?: string | null;
  },
  attendeeCount: number
): RegistrationStatusInfo {
  // Priority 0: Event has already happened — block registration entirely
  if (new Date() > new Date(event.date)) {
    return {
      isOpen: false,
      reason: 'deadline',
      message: 'This event has already taken place',
      canReopen: false
    };
  }

  // Priority 1: Check manual closure (highest priority)
  if (event.registrationManuallyClosedAt) {
    return {
      isOpen: false,
      reason: 'manual',
      message: 'Registration is currently closed',
      canReopen: true
    };
  }

  // Priority 2: Check deadline
  if (event.registrationDeadline && new Date() > new Date(event.registrationDeadline)) {
    const deadlineDate = new Date(event.registrationDeadline).toLocaleDateString();
    return {
      isOpen: false,
      reason: 'deadline',
      message: `Registration deadline has passed (closed on ${deadlineDate})`,
      canReopen: false
    };
  }

  // Priority 3: Check capacity
  if (attendeeCount >= event.maxSeats) {
    return {
      isOpen: false,
      reason: 'capacity',
      message: `Event is full (${attendeeCount}/${event.maxSeats} registered)`,
      canReopen: true // Can reopen if someone unregisters
    };
  }

  // Registration is open
  return {
    isOpen: true,
    message: `${event.maxSeats - attendeeCount} spots available`,
    canReopen: false
  };
}

/**
 * Returns appropriate button text based on registration status and user state
 * 
 * @param isRegistered - Whether the current user is registered for the event
 * @param statusInfo - The registration status information from computeRegistrationStatus
 * @returns Button text string
 * 
 * **Validates: Requirements 6.2**
 */
export function getRegistrationButtonText(
  isRegistered: boolean,
  statusInfo: RegistrationStatusInfo
): string {
  if (isRegistered) return 'Registered';

  if (!statusInfo.isOpen) {
    switch (statusInfo.reason) {
      case 'capacity': return 'Event Full';
      case 'deadline': return 'Deadline Passed';
      case 'manual': return 'Registration Closed';
      default: return 'Unavailable';
    }
  }

  return 'Register Now';
}
