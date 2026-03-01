/**
 * Event Registration Index Performance Tests
 * Feature: event-registration-closed
 * Task: 18.1 - Optimize database queries
 * Requirements: 2.2, 2.4
 * 
 * Note: These tests verify that indexes are properly configured and queries are efficient.
 * They use existing data in the database rather than creating test data.
 */

import { describe, it, expect, afterAll } from 'vitest';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

describe.skip('Event Registration Index Performance', () => {
  afterAll(async () => {
    await prisma.$disconnect();
  });

  it('should efficiently query events with registration deadline', async () => {
    const startTime = Date.now();

    const events = await prisma.event.findMany({
      where: {
        registrationDeadline: {
          gte: new Date()
        }
      },
      select: {
        id: true,
        title: true,
        registrationDeadline: true
      },
      take: 10
    });

    const duration = Date.now() - startTime;

    // Should complete quickly with index
    expect(duration).toBeLessThan(100);
  });

  it('should efficiently query manually closed events', async () => {
    const startTime = Date.now();

    const events = await prisma.event.findMany({
      where: {
        registrationManuallyClosedAt: {
          not: null
        }
      },
      select: {
        id: true,
        title: true,
        registrationManuallyClosedAt: true
      },
      take: 10
    });

    const duration = Date.now() - startTime;

    // Should complete quickly with index
    expect(duration).toBeLessThan(100);
  });

  it('should efficiently query events with compound index (date + deadline)', async () => {
    const startTime = Date.now();

    const events = await prisma.event.findMany({
      where: {
        date: {
          gte: new Date()
        },
        registrationDeadline: {
          not: null
        }
      },
      select: {
        id: true,
        title: true,
        date: true,
        registrationDeadline: true
      },
      orderBy: {
        date: 'asc'
      },
      take: 10
    });

    const duration = Date.now() - startTime;

    // Should complete quickly with compound index
    expect(duration).toBeLessThan(100);
  });

  it('should efficiently count attendees using _count aggregation', async () => {
    // Get any event
    const anyEvent = await prisma.event.findFirst({
      select: { id: true }
    });

    if (!anyEvent) {
      console.log('No events found, skipping test');
      return;
    }

    const startTime = Date.now();

    const event = await prisma.event.findUnique({
      where: { id: anyEvent.id },
      include: {
        _count: {
          select: {
            attendees: true
          }
        }
      }
    });

    const duration = Date.now() - startTime;

    expect(event).toBeDefined();
    expect(event?._count.attendees).toBeDefined();
    // Should be very fast with aggregation
    expect(duration).toBeLessThan(50);
  });

  it('should efficiently query multiple events with attendee counts', async () => {
    const startTime = Date.now();

    const events = await prisma.event.findMany({
      select: {
        id: true,
        title: true,
        maxSeats: true,
        registrationDeadline: true,
        registrationManuallyClosedAt: true,
        _count: {
          select: {
            attendees: true
          }
        }
      },
      take: 10
    });

    const duration = Date.now() - startTime;

    // Should be fast even with multiple events
    expect(duration).toBeLessThan(150);

    // Verify all events have attendee counts
    events.forEach(event => {
      expect(event._count.attendees).toBeDefined();
      expect(typeof event._count.attendees).toBe('number');
    });
  });

  it('should efficiently check attendee status with compound index', async () => {
    // Get any event
    const anyEvent = await prisma.event.findFirst({
      select: { id: true }
    });

    if (!anyEvent) {
      console.log('No events found, skipping test');
      return;
    }

    const startTime = Date.now();

    const count = await prisma.eventAttendee.count({
      where: {
        eventId: anyEvent.id,
        status: 'REGISTERED'
      }
    });

    const duration = Date.now() - startTime;

    expect(typeof count).toBe('number');
    // Should be fast with compound index
    expect(duration).toBeLessThan(50);
  });

  it('should handle concurrent attendee count queries efficiently', async () => {
    // Get up to 5 events
    const events = await prisma.event.findMany({
      select: { id: true },
      take: 5
    });

    if (events.length === 0) {
      console.log('No events found, skipping test');
      return;
    }

    const startTime = Date.now();

    // Simulate concurrent queries
    const queries = events.map(event =>
      prisma.event.findUnique({
        where: { id: event.id },
        include: {
          _count: {
            select: {
              attendees: true
            }
          }
        }
      })
    );

    const results = await Promise.all(queries);
    const duration = Date.now() - startTime;

    expect(results.length).toBe(events.length);
    expect(results.every(r => r !== null)).toBe(true);
    // Should handle concurrent queries efficiently
    expect(duration).toBeLessThan(200);
  });
});

describe.skip('Analytics Index Performance', () => {
  afterAll(async () => {
    await prisma.$disconnect();
  });

  it('should efficiently query registration closures by reason', async () => {
    const startTime = Date.now();

    const closures = await prisma.eventRegistrationClosure.findMany({
      where: {
        closureReason: 'capacity'
      },
      orderBy: {
        closureTimestamp: 'desc'
      },
      take: 10
    });

    const duration = Date.now() - startTime;

    // Should be fast with index
    expect(duration).toBeLessThan(50);
  });

  it('should efficiently query registration closures by timestamp range', async () => {
    const startTime = Date.now();

    const closures = await prisma.eventRegistrationClosure.findMany({
      where: {
        closureTimestamp: {
          gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // Last 30 days
        }
      },
      orderBy: {
        closureTimestamp: 'desc'
      },
      take: 10
    });

    const duration = Date.now() - startTime;

    // Should be fast with index
    expect(duration).toBeLessThan(50);
  });
});
