/**
 * Schema Referential Integrity Tests (Mocked)
 * Tests cascade delete behavior using in-memory collections simulating DB relationships.
 */
import { describe, it, expect, beforeEach, vi } from 'vitest';

// ─── In-memory collections ────────────────────────────────────────────────────
let rooms: any[] = [];
let roomMembers: any[] = [];
let messages: any[] = [];
let groups: any[] = [];
let groupMembers: any[] = [];
let posts: any[] = [];
let comments: any[] = [];
let reactions: any[] = [];
let users: any[] = [];
let follows: any[] = [];

function clearAll() {
  rooms = []; roomMembers = []; messages = []; groups = []; groupMembers = [];
  posts = []; comments = []; reactions = []; users = []; follows = [];
}

// Cascade helpers
function deleteRoom(id: string) {
  roomMembers = roomMembers.filter(m => m.roomId !== id);
  messages = messages.filter(m => m.roomId !== id);
  rooms = rooms.filter(r => r.id !== id);
}

function deleteGroup(id: string) {
  groupMembers = groupMembers.filter(m => m.groupId !== id);
  messages = messages.filter(m => m.groupId !== id);
  groups = groups.filter(g => g.id !== id);
}

function deletePost(id: string) {
  comments = comments.filter(c => c.postId !== id);
  reactions = reactions.filter(r => r.postId !== id);
  posts = posts.filter(p => p.id !== id);
}

function deleteUser(id: string) {
  roomMembers = roomMembers.filter(m => m.userId !== id);
  groupMembers = groupMembers.filter(m => m.userId !== id);
  messages = messages.filter(m => m.userId !== id);
  posts = posts.filter(p => p.authorId !== id);
  follows = follows.filter(f => f.followerId !== id && f.followingId !== id);
  users = users.filter(u => u.id !== id);
}

vi.mock('@/lib/prisma', () => ({
  prisma: {
    communityRoom: {
      create: vi.fn(({ data }) => { const r = { ...data, id: `room-${Date.now()}` }; rooms.push(r); return Promise.resolve(r); }),
      delete: vi.fn(({ where }) => { deleteRoom(where.id); return Promise.resolve({}); }),
      count: vi.fn(() => Promise.resolve(rooms.length)),
    },
    communityRoomMember: {
      create: vi.fn(({ data }) => { const m = { ...data, id: `rm-${Date.now()}` }; roomMembers.push(m); return Promise.resolve(m); }),
      count: vi.fn(({ where }) => Promise.resolve(roomMembers.filter(m => where?.roomId ? m.roomId === where.roomId : true).length)),
    },
    communityMessage: {
      create: vi.fn(({ data }) => { const m = { ...data, id: `msg-${Date.now()}` }; messages.push(m); return Promise.resolve(m); }),
      count: vi.fn(({ where }) => Promise.resolve(messages.filter(m => where?.roomId ? m.roomId === where.roomId : true).length)),
    },
    communityGroup: {
      create: vi.fn(({ data }) => { const g = { ...data, id: `grp-${Date.now()}` }; groups.push(g); return Promise.resolve(g); }),
      delete: vi.fn(({ where }) => { deleteGroup(where.id); return Promise.resolve({}); }),
    },
    communityPost: {
      create: vi.fn(({ data }) => { const p = { ...data, id: `post-${Date.now()}` }; posts.push(p); return Promise.resolve(p); }),
      delete: vi.fn(({ where }) => { deletePost(where.id); return Promise.resolve({}); }),
      count: vi.fn(() => Promise.resolve(posts.length)),
    },
    communityComment: {
      create: vi.fn(({ data }) => { const c = { ...data, id: `cmt-${Date.now()}` }; comments.push(c); return Promise.resolve(c); }),
      count: vi.fn(({ where }) => Promise.resolve(comments.filter(c => where?.postId ? c.postId === where.postId : true).length)),
    },
    user: {
      create: vi.fn(({ data }) => { const u = { ...data, id: `user-${Date.now()}` }; users.push(u); return Promise.resolve(u); }),
      delete: vi.fn(({ where }) => { deleteUser(where.id); return Promise.resolve({}); }),
    },
  },
}));

import { prisma } from '@/lib/prisma';

describe('Schema Referential Integrity (Mocked)', () => {
  beforeEach(clearAll);

  describe('Room cascade delete', () => {
    it('should delete room members when room is deleted', async () => {
      const room = await prisma.communityRoom.create({ data: { name: 'Test Room', creatorId: 'user1' } });
      await prisma.communityRoomMember.create({ data: { roomId: room.id, userId: 'user1' } });
      await prisma.communityRoomMember.create({ data: { roomId: room.id, userId: 'user2' } });

      expect(roomMembers.length).toBe(2);
      await prisma.communityRoom.delete({ where: { id: room.id } });
      expect(roomMembers.length).toBe(0);
    });

    it('should delete messages when room is deleted', async () => {
      const room = await prisma.communityRoom.create({ data: { name: 'Test Room', creatorId: 'user1' } });
      await prisma.communityMessage.create({ data: { roomId: room.id, userId: 'user1', content: 'Hello' } });

      expect(messages.length).toBe(1);
      await prisma.communityRoom.delete({ where: { id: room.id } });
      expect(messages.length).toBe(0);
    });
  });

  describe('Post cascade delete', () => {
    it('should delete comments when post is deleted', async () => {
      const post = await prisma.communityPost.create({ data: { authorId: 'user1', content: 'Post' } });
      await prisma.communityComment.create({ data: { postId: post.id, authorId: 'user2', content: 'Comment' } });

      expect(comments.length).toBe(1);
      await prisma.communityPost.delete({ where: { id: post.id } });
      expect(comments.length).toBe(0);
    });
  });

  describe('User cascade', () => {
    it('should remove user from room members when user is deleted', async () => {
      const user = await prisma.user.create({ data: { email: 'x@test.com', name: 'X', role: 'STUDENT' } });
      roomMembers.push({ roomId: 'room1', userId: user.id });

      await prisma.user.delete({ where: { id: user.id } });
      expect(roomMembers.filter(m => m.userId === user.id).length).toBe(0);
    });
  });
});
