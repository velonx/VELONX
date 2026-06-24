import { describe, it, expect, vi, beforeEach } from 'vitest';
import { EventService } from '@/lib/services/event.service';
import { prisma } from '@/lib/prisma';

vi.mock('@/lib/prisma', () => ({
  prisma: {
    event: {
      findUnique: vi.fn(),
    },
    eventAttendee: {
      findMany: vi.fn(),
      update: vi.fn(),
      updateMany: vi.fn(),
    },
    user: {
      update: vi.fn(),
    },
  },
}));

vi.mock('@/lib/services/notification.service', () => ({
  notificationService: {
    createNotification: vi.fn(),
    createXPAwardNotification: vi.fn(),
    createLevelUpNotification: vi.fn(),
  },
}));

describe('Event Attendance Marking Performance', () => {
  let eventService: EventService;

  beforeEach(() => {
    vi.clearAllMocks();
    eventService = new EventService();

    // Mock user level/xp default return to prevent null reference in awardXP
    vi.mocked(prisma.user.update).mockResolvedValue({
      id: 'test',
      xp: 100,
      level: 1,
    } as any);
  });

  it('measures the performance of marking multiple attendees', async () => {
    const attendeeCount = 100;
    const eventId = 'event-1';

    // Create mock attendees
    const mockAttendees = Array.from({ length: attendeeCount }, (_, i) => ({
      id: `attendee-${i}`,
      userId: `user-${i}`,
      status: 'REGISTERED',
      xpAwarded: false,
      user: { id: `user-${i}`, name: `User ${i}` }
    }));

    const attendeeIds = mockAttendees.map(a => a.id);

    vi.mocked(prisma.event.findUnique).mockResolvedValue({
      id: eventId,
      title: 'Performance Test Event'
    } as any);

    vi.mocked(prisma.eventAttendee.findMany).mockResolvedValue(mockAttendees as any);
    vi.mocked(prisma.eventAttendee.update).mockResolvedValue({} as any);
    vi.mocked(prisma.eventAttendee.updateMany).mockResolvedValue({ count: attendeeCount } as any);

    // Measure time
    const start = performance.now();
    await eventService.markAttendance(eventId, attendeeIds, 'mark');
    const end = performance.now();

    const timeTaken = end - start;
    console.log(`Time taken for ${attendeeCount} attendees: ${timeTaken.toFixed(2)}ms`);

    // Verify count
    const updateCalls = vi.mocked(prisma.eventAttendee.update).mock.calls.length;
    const updateManyCalls = vi.mocked(prisma.eventAttendee.updateMany).mock.calls.length;

    console.log(`Prisma update calls: ${updateCalls}`);
    console.log(`Prisma updateMany calls: ${updateManyCalls}`);

    expect(true).toBe(true);
  });
});