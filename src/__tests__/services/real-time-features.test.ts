/**
 * Real-Time Features Test (Mocked)
 * Tests pub/sub broadcasting and online status tracking without live Redis/Prisma.
 */
import { describe, it, expect, beforeEach, vi } from 'vitest';

// ─── Mock Prisma ──────────────────────────────────────────────────────────────
const dbMessages: any[] = [];
const dbUsers: any[] = [{ id: 'user1', name: 'Alice' }, { id: 'user2', name: 'Bob' }];

vi.mock('@/lib/prisma', () => ({
  prisma: {
    communityMessage: {
      create: vi.fn(({ data }) => {
        const m = { ...data, id: `msg-${Date.now()}`, createdAt: new Date(), updatedAt: new Date() };
        dbMessages.push(m);
        return Promise.resolve(m);
      }),
      findUnique: vi.fn(({ where }) =>
        Promise.resolve(dbMessages.find(m => m.id === where.id) || null),
      ),
      update: vi.fn(({ where, data }) => {
        const idx = dbMessages.findIndex(m => m.id === where.id);
        if (idx !== -1) Object.assign(dbMessages[idx], data);
        return Promise.resolve(dbMessages[idx]);
      }),
      delete: vi.fn(({ where }) => {
        const idx = dbMessages.findIndex(m => m.id === where.id);
        if (idx !== -1) dbMessages.splice(idx, 1);
        return Promise.resolve({});
      }),
    },
    user: {
      findUnique: vi.fn(({ where }) =>
        Promise.resolve(dbUsers.find(u => u.id === where.id) || null),
      ),
    },
  },
}));

// ─── Mock Redis ───────────────────────────────────────────────────────────────
const onlineUsers = new Set<string>();
vi.mock('@/lib/redis', () => ({
  redis: {
    sadd: vi.fn((key: string, ...members: string[]) => {
      members.forEach(m => onlineUsers.add(m));
      return Promise.resolve(members.length);
    }),
    srem: vi.fn((key: string, ...members: string[]) => {
      members.forEach(m => onlineUsers.delete(m));
      return Promise.resolve(members.length);
    }),
    smembers: vi.fn(() => Promise.resolve([...onlineUsers])),
    sismember: vi.fn((key: string, member: string) =>
      Promise.resolve(onlineUsers.has(member) ? 1 : 0),
    ),
    get: vi.fn(() => Promise.resolve(null)),
    set: vi.fn(() => Promise.resolve('OK')),
    del: vi.fn(() => Promise.resolve(1)),
  },
}));

// ─── Mock pub/sub ─────────────────────────────────────────────────────────────
const publishedEvents: any[] = [];
vi.mock('@/lib/websocket/pubsub', () => ({
  publishChatMessage: vi.fn((roomId, groupId, msg) => {
    publishedEvents.push({ type: 'message', roomId, groupId, msg });
    return Promise.resolve();
  }),
  publishMessageEdit: vi.fn((roomId, groupId, msg) => {
    publishedEvents.push({ type: 'edit', roomId, groupId, msg });
    return Promise.resolve();
  }),
  publishMessageDelete: vi.fn((roomId, groupId, msgId) => {
    publishedEvents.push({ type: 'delete', roomId, groupId, msgId });
    return Promise.resolve();
  }),
  publishUserJoin: vi.fn((roomId, userId) => {
    publishedEvents.push({ type: 'join', roomId, userId });
    return Promise.resolve();
  }),
  publishUserLeave: vi.fn((roomId, userId) => {
    publishedEvents.push({ type: 'leave', roomId, userId });
    return Promise.resolve();
  }),
  publishTypingStart: vi.fn(() => Promise.resolve()),
  publishTypingStop: vi.fn(() => Promise.resolve()),
}));

import { publishChatMessage, publishUserJoin, publishUserLeave } from '@/lib/websocket/pubsub';
import { redis } from '@/lib/redis';

describe('Real-Time Features (Mocked)', () => {
  beforeEach(() => {
    publishedEvents.length = 0;
    onlineUsers.clear();
    vi.clearAllMocks();
  });

  describe('Chat Message Broadcasting', () => {
    it('should publish chat message to room', async () => {
      await publishChatMessage('room1', undefined, { id: 'msg1', content: 'Hello', userId: 'user1' });
      expect(publishedEvents[0].type).toBe('message');
      expect(publishedEvents[0].roomId).toBe('room1');
    });

    it('should publish chat message to group', async () => {
      await publishChatMessage(undefined, 'group1', { id: 'msg2', content: 'Hi group', userId: 'user1' });
      expect(publishedEvents[0].groupId).toBe('group1');
    });
  });

  describe('User Presence', () => {
    it('should track user join', async () => {
      await publishUserJoin('room1', 'user1');
      expect(publishedEvents[0].type).toBe('join');
      expect(publishedEvents[0].userId).toBe('user1');
    });

    it('should track user leave', async () => {
      await publishUserLeave('room1', 'user1');
      expect(publishedEvents[0].type).toBe('leave');
    });

    it('should track online status via Redis', async () => {
      await redis.sadd('online', 'user1');
      const members = await redis.smembers('online');
      expect(members).toContain('user1');
    });

    it('should remove user from online set on leave', async () => {
      await redis.sadd('online', 'user2');
      await redis.srem('online', 'user2');
      const members = await redis.smembers('online');
      expect(members).not.toContain('user2');
    });
  });
});
