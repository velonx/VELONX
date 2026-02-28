/**
 * Event Analytics Service
 * Feature: event-registration-closed
 * Requirements: 7.4, 10.1, 10.2, 10.3, 10.5
 * 
 * Handles tracking and logging of event registration closure analytics
 */

import { prisma } from '@/lib/prisma';
import type { RegistrationClosureReason } from '@/lib/types/events.types';

export interface RegistrationClosureData {
  eventId: string;
  closureReason: RegistrationClosureReason;
  attendeeCount: number;
  eventCreatedAt: Date;
}

export interface FailedRegistrationAttemptData {
  eventId: string;
  userId: string;
  closureReason: RegistrationClosureReason;
  errorCode: string;
}

/**
 * Records when an event's registration closes
 * Tracks timestamp, reason, attendee count, and time-to-closure
 * 
 * Requirements: 10.1, 10.2, 10.5
 */
export async function trackRegistrationClosure(
  data: RegistrationClosureData
): Promise<void> {
  try {
    // Calculate time between event creation and closure
    const closureTimestamp = new Date();
    const timeToClosureMs = closureTimestamp.getTime() - data.eventCreatedAt.getTime();
    
    // Record the closure event
    await prisma.eventRegistrationClosure.create({
      data: {
        eventId: data.eventId,
        closureTimestamp,
        closureReason: data.closureReason,
        attendeeCountAtClosure: data.attendeeCount,
        timeToClosureMs,
      },
    });
    
    console.log(`[Analytics] Recorded registration closure for event ${data.eventId}: ${data.closureReason}`);
  } catch (error) {
    console.error('[Analytics] Failed to track registration closure:', error);
    // Don't throw - analytics failures shouldn't break the main flow
  }
}

/**
 * Logs a failed registration attempt after closure
 * Tracks event ID, user ID, timestamp, and closure reason
 * 
 * Requirements: 7.4, 10.3
 */
export async function logFailedRegistrationAttempt(
  data: FailedRegistrationAttemptData
): Promise<void> {
  try {
    await prisma.failedRegistrationAttempt.create({
      data: {
        eventId: data.eventId,
        userId: data.userId,
        attemptTimestamp: new Date(),
        closureReason: data.closureReason,
        errorCode: data.errorCode,
      },
    });
    
    console.log(`[Analytics] Logged failed registration attempt for event ${data.eventId} by user ${data.userId}`);
  } catch (error) {
    console.error('[Analytics] Failed to log registration attempt:', error);
    // Don't throw - analytics failures shouldn't break the main flow
  }
}

/**
 * Gets the count of failed registration attempts for an event
 * 
 * Requirements: 10.3
 */
export async function getFailedAttemptCount(eventId: string): Promise<number> {
  try {
    return await prisma.failedRegistrationAttempt.count({
      where: { eventId },
    });
  } catch (error) {
    console.error('[Analytics] Failed to get failed attempt count:', error);
    return 0;
  }
}

/**
 * Gets registration closure analytics for an event
 * Returns the most recent closure record if multiple exist
 * 
 * Requirements: 10.1, 10.2, 10.5
 */
export async function getRegistrationClosureAnalytics(eventId: string) {
  try {
    const closure = await prisma.eventRegistrationClosure.findFirst({
      where: { eventId },
      orderBy: { closureTimestamp: 'desc' },
    });
    
    if (!closure) {
      return null;
    }
    
    const failedAttempts = await getFailedAttemptCount(eventId);
    
    return {
      closureTimestamp: closure.closureTimestamp,
      closureReason: closure.closureReason,
      attendeeCountAtClosure: closure.attendeeCountAtClosure,
      timeToClosureMs: closure.timeToClosureMs,
      failedAttempts,
    };
  } catch (error) {
    console.error('[Analytics] Failed to get closure analytics:', error);
    return null;
  }
}

/**
 * Checks if a closure event has already been tracked for an event
 * Used to prevent duplicate tracking
 */
export async function hasClosureBeenTracked(
  eventId: string,
  reason: RegistrationClosureReason
): Promise<boolean> {
  try {
    const existingClosure = await prisma.eventRegistrationClosure.findFirst({
      where: {
        eventId,
        closureReason: reason,
      },
      orderBy: {
        closureTimestamp: 'desc',
      },
    });
    
    // If there's a recent closure (within last 5 minutes), consider it tracked
    if (existingClosure) {
      const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
      return existingClosure.closureTimestamp > fiveMinutesAgo;
    }
    
    return false;
  } catch (error) {
    console.error('[Analytics] Failed to check closure tracking:', error);
    return false;
  }
}

export const eventAnalyticsService = {
  trackRegistrationClosure,
  logFailedRegistrationAttempt,
  getFailedAttemptCount,
  getRegistrationClosureAnalytics,
  hasClosureBeenTracked,
};
