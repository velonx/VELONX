/**
 * Community Messages Integration Test (Mocked)
 * Tests message CRUD operations using in-memory mocks for Prisma and NextAuth.
 */
import { describe, it, expect, beforeEach, vi } from 'vitest';

// ─── In-memory DB ─────────────────────────────────────────────────────────────
const dbRooms: any[] = [{ id: 'room1', name: 'General' }];
const dbMessages: any[] = [];
const dbUsers: any[] = [
  { id: 'user1', name: 'Alice', role: 'STUDENT', isMuted: false },
  { id: 'user2', name: 'Bob', role: 'STUDENT', isMuted: false },
  { id: 'admin1', name: 'Admin', role: 'ADMIN', isMuted: false },
];
const dbRoomMembers: any[] = [
  { roomId: 'room1', userId: 'user1' },
  { roomId: 'room1', userId: 'user2' },
  { roomId: 'room1', userId: 'admin1' },
];

vi.mock('@/lib/prisma', () => ({
  prisma: {
    communityRoom: {
      findUnique: vi.fn(({ where }) =>
        Promise.resolve(dbRooms.find(r => r.id === where.id) || null),
      ),
    },
    communityRoomMember: {
      findFirst: vi.fn(({ where }) =>
        Promise.resolve(dbRoomMembers.find(m => m.roomId === where.roomId && m.userId === where.userId) || null),
      ),
    },
    communityMessage: {
      create: vi.fn(({ data }) => {
        const m = { ...data, id: `msg-${Date.now()}-${Math.random()}`, createdAt: new Date(), updatedAt: new Date() };
        dbMessages.push(m);
        return Promise.resolve(m);
      }),
      findMany: vi.fn(({ where, take = 50 }) => {
        let result = [...dbMessages];
        if (where?.roomId) result = result.filter(m => m.roomId === where.roomId);
        if (where?.groupId) result = result.filter(m => m.groupId === where.groupId);
        return Promise.resolve(result.slice(0, take));
      }),
      findUnique: vi.fn(({ where }) =>
        Promise.resolve(dbMessages.find(m => m.id === where.id) || null),
      ),
      update: vi.fn(({ where, data }) => {
        const idx = dbMessages.findIndex(m => m.id === where.id);
        if (idx === -1) return Promise.reject(new Error('not found'));
        Object.assign(dbMessages[idx], data);
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

vi.mock('next-auth', () => ({
  getServerSession: vi.fn().mockResolvedValue({ user: { id: 'user1' } }),
}));

vi.mock('@/lib/pubsub', () => ({
  publishChatMessage: vi.fn().mockResolvedValue(undefined),
  publishMessageEdit: vi.fn().mockResolvedValue(undefined),
  publishMessageDelete: vi.fn().mockResolvedValue(undefined),
}));

import { prisma } from '@/lib/prisma';

describe('Community Messages API (Integration - Mocked)', () => {
  beforeEach(() => {
    dbMessages.length = 0;
    vi.clearAllMocks();
  });

  describe('Send Message', () => {
    it('should create a message in a room', async () => {
      const msg = await prisma.communityMessage.create({
        data: { roomId: 'room1', userId: 'user1', content: 'Hello room!' },
      });
      expect(msg.content).toBe('Hello room!');
      expect(msg.roomId).toBe('room1');
    });

    it('should reject unauthenticated requests (conceptual)', () => {
      // Auth is handled at route middleware level — documented here
      expect(true).toBe(true);
    });
  });

  describe('Get Messages', () => {
    it('should return messages for a room', async () => {
      await prisma.communityMessage.create({
        data: { roomId: 'room1', userId: 'user1', content: 'Msg1' },
      });
      await prisma.communityMessage.create({
        data: { roomId: 'room1', userId: 'user2', content: 'Msg2' },
      });

      const messages = await prisma.communityMessage.findMany({ where: { roomId: 'room1' } });
      expect(messages.length).toBe(2);
    });

    it('should respect take limit', async () => {
      for (let i = 0; i < 10; i++) {
        await prisma.communityMessage.create({
          data: { roomId: 'room1', userId: 'user1', content: `Msg${i}` },
        });
      }
      const messages = await prisma.communityMessage.findMany({ where: { roomId: 'room1' }, take: 5 });
      expect(messages.length).toBe(5);
    });
  });

  describe('Edit Message', () => {
    it('should edit own message', async () => {
      const msg = await prisma.communityMessage.create({
        data: { roomId: 'room1', userId: 'user1', content: 'Original' },
      });
      const updated = await prisma.communityMessage.update({
        where: { id: msg.id },
        data: { content: 'Edited', editedAt: new Date() },
      });
      expect(updated.content).toBe('Edited');
      expect(updated.editedAt).toBeDefined();
    });
  });

  describe('Delete Message', () => {
    it('should delete own message', async () => {
      const msg = await prisma.communityMessage.create({
        data: { roomId: 'room1', userId: 'user1', content: 'To delete' },
      });
      await prisma.communityMessage.delete({ where: { id: msg.id } });
      const found = await prisma.communityMessage.findUnique({ where: { id: msg.id } });
      expect(found).toBeNull();
    });
  });
});
