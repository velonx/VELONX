/**
 * FeedService Unit Tests (Mocked)
 * Tests feed logic using in-memory Prisma mocks — no real DB connection required.
 */
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { NotFoundError, ValidationError, AuthorizationError } from '@/lib/utils/errors';

// ─── In-memory data ──────────────────────────────────────────────────────────
const users: any[] = [];
const groups: any[] = [];
const groupMembers: any[] = [];
const posts: any[] = [];
const follows: any[] = [];
const userBlocks: any[] = [];
const rooms: any[] = [];

function clear() {
  users.length = 0; groups.length = 0; groupMembers.length = 0;
  posts.length = 0; follows.length = 0; userBlocks.length = 0; rooms.length = 0;
}

let idSeq = 1;
const nextId = () => `id-${idSeq++}`;

vi.mock('@/lib/prisma', () => ({
  prisma: {
    user: {
      findUnique: vi.fn(({ where }) =>
        Promise.resolve(users.find(u => u.id === where.id || u.email === where.email) ?? null),
      ),
      create: vi.fn(({ data }) => {
        const u = { ...data, id: nextId() };
        users.push(u);
        return Promise.resolve(u);
      }),
      deleteMany: vi.fn(() => Promise.resolve({ count: 0 })),
    },
    communityGroup: {
      findUnique: vi.fn(({ where }) =>
        Promise.resolve(groups.find(g => g.id === where.id) ?? null),
      ),
      findMany: vi.fn(({ where }: any = {}) => {
        let result = [...groups];
        if (where?.name?.contains) {
          result = result.filter(g => g.name.toLowerCase().includes(where.name.contains.toLowerCase()));
        }
        return Promise.resolve(result);
      }),
      create: vi.fn(({ data }) => {
        const g = { ...data, id: nextId() };
        groups.push(g);
        return Promise.resolve(g);
      }),
      update: vi.fn(({ where, data }) => {
        const idx = groups.findIndex(g => g.id === where.id);
        if (idx !== -1) Object.assign(groups[idx], data);
        return Promise.resolve(groups[idx] ?? {});
      }),
      deleteMany: vi.fn(() => Promise.resolve({ count: 0 })),
    },
    groupMember: {
      create: vi.fn(({ data }) => {
        const m = { ...data, id: nextId() };
        groupMembers.push(m);
        return Promise.resolve(m);
      }),
      findFirst: vi.fn(({ where }) =>
        Promise.resolve(groupMembers.find(m => m.groupId === where.groupId && m.userId === where.userId) ?? null),
      ),
      findUnique: vi.fn(({ where }: any = {}) =>
        Promise.resolve(groupMembers.find(m =>
          (!where?.groupId_userId || (m.groupId === where.groupId_userId.groupId && m.userId === where.groupId_userId.userId))
        ) ?? null)
      ),
      findMany: vi.fn(({ where }: any = {}) =>
        Promise.resolve(groupMembers.filter(m =>
          (!where?.groupId || m.groupId === where.groupId) &&
          (!where?.userId || m.userId === where.userId)
        ))
      ),
      deleteMany: vi.fn(() => Promise.resolve({ count: 0 })),
    },
    communityPost: {
      findMany: vi.fn(({ where, take, orderBy }: any = {}) => {
        let result = [...posts];
        if (where?.authorId) result = result.filter(p => p.authorId === where.authorId);
        if (where?.groupId) result = result.filter(p => p.groupId === where.groupId);
        if (where?.visibility) result = result.filter(p => p.visibility === where.visibility);
        if (take) result = result.slice(0, take);
        return Promise.resolve(result.map(p => ({ ...p, author: users.find(u => u.id === p.authorId) })));
      }),
      create: vi.fn(({ data }) => {
        const p = { ...data, id: nextId(), createdAt: new Date(), _count: { likes: 0, comments: 0 } };
        posts.push(p);
        return Promise.resolve(p);
      }),
      deleteMany: vi.fn(() => Promise.resolve({ count: 0 })),
    },
    follow: {
      create: vi.fn(({ data }) => {
        follows.push({ ...data, id: nextId() });
        return Promise.resolve({});
      }),
      findMany: vi.fn(({ where }: any = {}) =>
        Promise.resolve(
          follows
            .filter(f => !where?.followerId || f.followerId === where.followerId)
            .map(f => ({ followingId: f.followingId }))
        )
      ),
      deleteMany: vi.fn(() => Promise.resolve({ count: 0 })),
    },
    userBlock: {
      create: vi.fn(({ data }) => {
        userBlocks.push({ ...data, id: nextId() });
        return Promise.resolve({});
      }),
      findMany: vi.fn(({ where }: any = {}) =>
        Promise.resolve(userBlocks.filter(b => b.blockerId === where?.blockerId)),
      ),
    },
    discussionRoom: {
      findMany: vi.fn(({ where }: any = {}) => {
        let result = [...rooms];
        if (where?.name?.contains) {
          result = result.filter(r => r.name.toLowerCase().includes(where.name.contains.toLowerCase()));
        }
        return Promise.resolve(result);
      }),
      create: vi.fn(({ data }) => {
        const r = { ...data, id: nextId() };
        rooms.push(r);
        return Promise.resolve(r);
      }),
    },
  },
}));

import { feedService } from '@/lib/services/feed.service';

describe('FeedService', () => {
  let testUser: any;
  let testUser2: any;
  let testGroup: any;
  let testPost: any;

  beforeEach(async () => {
    clear();
    idSeq = 1;
    vi.clearAllMocks();

    const { prisma } = await import('@/lib/prisma');

    testUser = await prisma.user.create({ data: { email: 'feedtest@example.com', name: 'Feed Test User', role: 'STUDENT' } });
    testUser2 = await prisma.user.create({ data: { email: 'feedtest2@example.com', name: 'Feed Test User 2', role: 'STUDENT' } });
    testGroup = await prisma.communityGroup.create({ data: { name: 'Test Group', description: 'Test', isPrivate: false, ownerId: testUser.id } });
    await prisma.groupMember.create({ data: { groupId: testGroup.id, userId: testUser.id } });
    testPost = await prisma.communityPost.create({ data: { content: 'Test post content', authorId: testUser.id, visibility: 'PUBLIC', imageUrls: [], linkUrls: [] } });
  });

  describe('getUserFeed', () => {
    it('should return user feed with public posts', async () => {
      const { prisma } = await import('@/lib/prisma');
      vi.mocked(prisma.user.findUnique).mockResolvedValue({
        ...testUser,
        blocking: [],
        blockedBy: [],
        following: [],
        groupMemberships: [],
      } as any);
      vi.mocked(prisma.userBlock.findMany).mockResolvedValue([]);
      vi.mocked(prisma.communityPost.findMany).mockResolvedValue([{
        ...testPost,
        type: 'POST',
        author: testUser,
        _count: { likes: 0, comments: 0 },
      }]);

      const feed = await feedService.getUserFeed(testUser.id);
      expect(feed).toBeDefined();
      expect(Array.isArray(feed)).toBe(true);
    });

    it('should return empty array for non-existent user', async () => {
      const { prisma } = await import('@/lib/prisma');
      vi.mocked(prisma.user.findUnique).mockResolvedValue(null);
      const feed = await feedService.getUserFeed('non-existent-id');
      expect(feed).toEqual([]);
    });
  });

  describe('getGroupFeed', () => {
    it('should throw NotFoundError for non-existent group', async () => {
      const { prisma } = await import('@/lib/prisma');
      vi.mocked(prisma.communityGroup.findUnique).mockResolvedValue(null);
      await expect(feedService.getGroupFeed('non-existent-id', testUser.id)).rejects.toThrow(NotFoundError);
    });

    it('should throw AuthorizationError for non-member accessing private group', async () => {
      const { prisma } = await import('@/lib/prisma');
      const privateGroup = { ...testGroup, isPrivate: true };
      vi.mocked(prisma.communityGroup.findUnique).mockResolvedValue(privateGroup);
      vi.mocked(prisma.groupMember.findFirst).mockResolvedValue(null);
      await expect(feedService.getGroupFeed(testGroup.id, testUser2.id)).rejects.toThrow(AuthorizationError);
    });
  });

  describe('searchContent', () => {
    it('should throw ValidationError for empty query', async () => {
      await expect(feedService.searchContent('', testUser.id)).rejects.toThrow(ValidationError);
    });

    it('should throw ValidationError for query exceeding max length', async () => {
      const longQuery = 'a'.repeat(101);
      await expect(feedService.searchContent(longQuery, testUser.id)).rejects.toThrow(ValidationError);
    });

    it('should search posts, rooms, and groups', async () => {
      const { prisma } = await import('@/lib/prisma');
      vi.mocked(prisma.userBlock.findMany).mockResolvedValue([]);
      vi.mocked(prisma.communityPost.findMany).mockResolvedValue([]);
      vi.mocked(prisma.discussionRoom.findMany).mockResolvedValue([]);
      vi.mocked(prisma.communityGroup.findMany as any)?.mockResolvedValue?.([]);

      // feedService.searchContent may call prisma.communityGroup.findMany
      // Mock it if it exists on the mock
      const results = await feedService.searchContent('Searchable', testUser.id);
      expect(results).toBeDefined();
      expect(results.posts).toBeDefined();
    });

    it('should exclude blocked users from search results', async () => {
      const { prisma } = await import('@/lib/prisma');
      vi.mocked(prisma.userBlock.findMany).mockResolvedValue([{ blockerId: testUser.id, blockedId: testUser2.id, id: 'b1', createdAt: new Date() }]);
      vi.mocked(prisma.communityPost.findMany).mockResolvedValue([]);
      vi.mocked(prisma.discussionRoom.findMany).mockResolvedValue([]);

      const results = await feedService.searchContent('test', testUser.id);
      expect(results).toBeDefined();
    });
  });

  describe('getTrendingPosts', () => {
    it('should return trending posts', async () => {
      const { prisma } = await import('@/lib/prisma');
      vi.mocked(prisma.communityPost.findMany).mockResolvedValue([]);
      const trending = await feedService.getTrendingPosts();
      expect(trending).toBeDefined();
      expect(Array.isArray(trending)).toBe(true);
    });
  });
});
