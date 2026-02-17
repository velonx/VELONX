/**
 * Integration Tests: Community Discussion Rooms API
 * 
 * Tests for discussion room API endpoints including:
 * - Room creation
 * - Room listing
 * - Room details
 * - Join/leave room
 * - Get members
 * - Get messages
 * - Kick member (moderator action)
 * - Authentication and authorization
 * - Error handling
 * 
 * Requirements: 1.1, 1.2, 1.3, 1.4, 1.6
 */

import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { POST as createRoomHandler, GET as listRoomsHandler } from '@/app/api/community/rooms/route';
import { GET as getRoomHandler } from '@/app/api/community/rooms/[id]/route';
import { POST as joinRoomHandler } from '@/app/api/community/rooms/[id]/join/route';
import { POST as leaveRoomHandler } from '@/app/api/community/rooms/[id]/leave/route';
import { GET as getMembersHandler } from '@/app/api/community/rooms/[id]/members/route';
import { GET as getMessagesHandler } from '@/app/api/community/rooms/[id]/messages/route';
import { POST as kickMemberHandler } from '@/app/api/community/rooms/[id]/kick/route';
import { createMockNextRequest } from '../utils/api-test-helpers';
import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';
import { vi } from 'vitest';
import type { Session } from 'next-auth';

// Mock auth module
vi.mock('@/auth', () => ({
  auth: vi.fn(),
}));

const mockAuth = vi.mocked(auth);

describe('Community Discussion Rooms API Integration Tests', () => {
  let testUserId: string;
  let testUser2Id: string;
  let testRoomId: string;

  beforeAll(async () => {
    // Create test users
    const user1 = await prisma.user.create({
      data: {
        name: 'Test User 1',
        email: `test-room-user1-${Date.now()}@test.com`,
        password: 'hashedpassword',
        role: 'STUDENT',
      },
    });
    testUserId = user1.id;

    const user2 = await prisma.user.create({
      data: {
        name: 'Test User 2',
        email: `test-room-user2-${Date.now()}@test.com`,
        password: 'hashedpassword',
        role: 'STUDENT',
      },
    });
    testUser2Id = user2.id;
  });

  afterAll(async () => {
    // Clean up test data
    if (testRoomId) {
      await prisma.discussionRoom.deleteMany({
        where: { id: testRoomId },
      });
    }
    await prisma.user.deleteMany({
      where: {
        id: { in: [testUserId, testUser2Id] },
      },
    });
  });

  describe('POST /api/community/rooms - Create Room', () => {
    it('should successfully create a discussion room', async () => {
      // Mock authenticated session
      const mockSession: Session = {
        user: { id: testUserId, name: 'Test User 1', email: 'test@test.com', role: 'STUDENT' },
        expires: new Date(Date.now() + 86400000).toISOString(),
      };
      mockAuth.mockResolvedValue(mockSession);

      const roomData = {
        name: 'Test Discussion Room',
        description: 'A test room for integration testing',
        isPrivate: false,
      };

      const request = createMockNextRequest({
        method: 'POST',
        url: 'http://localhost:3000/api/community/rooms',
        body: roomData,
      });

      const response = await createRoomHandler(request);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data.success).toBe(true);
      expect(data.data).toMatchObject({
        name: roomData.name,
        description: roomData.description,
        isPrivate: roomData.isPrivate,
        creatorId: testUserId,
      });
      expect(data.data.id).toBeDefined();

      // Store room ID for other tests
      testRoomId = data.data.id;
    }, 30000);

    it('should reject room creation without authentication', async () => {
      // Mock unauthenticated session
      mockAuth.mockResolvedValue(null as any);

      const roomData = {
        name: 'Test Room',
        description: 'Test description',
        isPrivate: false,
      };

      const request = createMockNextRequest({
        method: 'POST',
        url: 'http://localhost:3000/api/community/rooms',
        body: roomData,
      });

      const response = await createRoomHandler(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.success).toBe(false);
      expect(data.error.code).toBe('UNAUTHORIZED');
    });

    it('should reject room creation with invalid data', async () => {
      // Mock authenticated session
      const mockSession: Session = {
        user: { id: testUserId, name: 'Test User 1', email: 'test@test.com', role: 'STUDENT' },
        expires: new Date(Date.now() + 86400000).toISOString(),
      };
      mockAuth.mockResolvedValue(mockSession);

      const roomData = {
        name: '', // Invalid: empty name
        description: 'Test description',
        isPrivate: false,
      };

      const request = createMockNextRequest({
        method: 'POST',
        url: 'http://localhost:3000/api/community/rooms',
        body: roomData,
      });

      const response = await createRoomHandler(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
    });
  });

  describe('GET /api/community/rooms - List Rooms', () => {
    it('should successfully list discussion rooms', async () => {
      // Mock authenticated session
      const mockSession: Session = {
        user: { id: testUserId, name: 'Test User 1', email: 'test@test.com', role: 'STUDENT' },
        expires: new Date(Date.now() + 86400000).toISOString(),
      };
      mockAuth.mockResolvedValue(mockSession);

      const request = createMockNextRequest({
        method: 'GET',
        url: 'http://localhost:3000/api/community/rooms',
      });

      const response = await listRoomsHandler(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(Array.isArray(data.data)).toBe(true);
      expect(data.pagination).toBeDefined();
      expect(data.pagination.page).toBe(1);
    }, 30000);

    it('should support pagination', async () => {
      // Mock authenticated session
      const mockSession: Session = {
        user: { id: testUserId, name: 'Test User 1', email: 'test@test.com', role: 'STUDENT' },
        expires: new Date(Date.now() + 86400000).toISOString(),
      };
      mockAuth.mockResolvedValue(mockSession);

      const request = createMockNextRequest({
        method: 'GET',
        url: 'http://localhost:3000/api/community/rooms',
        searchParams: { page: '2', pageSize: '10' },
      });

      const response = await listRoomsHandler(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.pagination.page).toBe(2);
      expect(data.pagination.pageSize).toBe(10);
    }, 30000);
  });

  describe('GET /api/community/rooms/[id] - Get Room Details', () => {
    it('should successfully get room details', async () => {
      // Mock authenticated session
      const mockSession: Session = {
        user: { id: testUserId, name: 'Test User 1', email: 'test@test.com', role: 'STUDENT' },
        expires: new Date(Date.now() + 86400000).toISOString(),
      };
      mockAuth.mockResolvedValue(mockSession);

      const request = createMockNextRequest({
        method: 'GET',
        url: `http://localhost:3000/api/community/rooms/${testRoomId}`,
      });

      const response = await getRoomHandler(request, { params: { id: testRoomId } });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.id).toBe(testRoomId);
      expect(data.data.memberCount).toBeDefined();
    }, 30000);

    it('should return 404 for non-existent room', async () => {
      // Mock authenticated session
      const mockSession: Session = {
        user: { id: testUserId, name: 'Test User 1', email: 'test@test.com', role: 'STUDENT' },
        expires: new Date(Date.now() + 86400000).toISOString(),
      };
      mockAuth.mockResolvedValue(mockSession);

      const fakeRoomId = '507f1f77bcf86cd799439011';
      const request = createMockNextRequest({
        method: 'GET',
        url: `http://localhost:3000/api/community/rooms/${fakeRoomId}`,
      });

      const response = await getRoomHandler(request, { params: { id: fakeRoomId } });
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.success).toBe(false);
    }, 30000);
  });

  describe('POST /api/community/rooms/[id]/join - Join Room', () => {
    it('should successfully join a room', async () => {
      // Mock authenticated session for user 2
      const mockSession: Session = {
        user: { id: testUser2Id, name: 'Test User 2', email: 'test2@test.com', role: 'STUDENT' },
        expires: new Date(Date.now() + 86400000).toISOString(),
      };
      mockAuth.mockResolvedValue(mockSession);

      const request = createMockNextRequest({
        method: 'POST',
        url: `http://localhost:3000/api/community/rooms/${testRoomId}/join`,
      });

      const response = await joinRoomHandler(request, { params: { id: testRoomId } });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.message).toContain('joined');
    }, 30000);

    it('should reject joining the same room twice', async () => {
      // Mock authenticated session for user 2
      const mockSession: Session = {
        user: { id: testUser2Id, name: 'Test User 2', email: 'test2@test.com', role: 'STUDENT' },
        expires: new Date(Date.now() + 86400000).toISOString(),
      };
      mockAuth.mockResolvedValue(mockSession);

      const request = createMockNextRequest({
        method: 'POST',
        url: `http://localhost:3000/api/community/rooms/${testRoomId}/join`,
      });

      const response = await joinRoomHandler(request, { params: { id: testRoomId } });
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
    }, 30000);
  });

  describe('GET /api/community/rooms/[id]/members - Get Members', () => {
    it('should successfully get room members', async () => {
      // Mock authenticated session
      const mockSession: Session = {
        user: { id: testUserId, name: 'Test User 1', email: 'test@test.com', role: 'STUDENT' },
        expires: new Date(Date.now() + 86400000).toISOString(),
      };
      mockAuth.mockResolvedValue(mockSession);

      const request = createMockNextRequest({
        method: 'GET',
        url: `http://localhost:3000/api/community/rooms/${testRoomId}/members`,
      });

      const response = await getMembersHandler(request, { params: { id: testRoomId } });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(Array.isArray(data.data)).toBe(true);
      expect(data.data.length).toBeGreaterThan(0);
    }, 30000);
  });

  describe('GET /api/community/rooms/[id]/messages - Get Messages', () => {
    it('should successfully get room messages for members', async () => {
      // Mock authenticated session for user 1 (creator/member)
      const mockSession: Session = {
        user: { id: testUserId, name: 'Test User 1', email: 'test@test.com', role: 'STUDENT' },
        expires: new Date(Date.now() + 86400000).toISOString(),
      };
      mockAuth.mockResolvedValue(mockSession);

      const request = createMockNextRequest({
        method: 'GET',
        url: `http://localhost:3000/api/community/rooms/${testRoomId}/messages`,
      });

      const response = await getMessagesHandler(request, { params: { id: testRoomId } });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(Array.isArray(data.data)).toBe(true);
    }, 30000);

    it('should reject non-members from viewing messages', async () => {
      // Create a new user who is not a member
      const nonMember = await prisma.user.create({
        data: {
          name: 'Non Member',
          email: `non-member-${Date.now()}@test.com`,
          password: 'hashedpassword',
          role: 'STUDENT',
        },
      });

      // Mock authenticated session for non-member
      const mockSession: Session = {
        user: { id: nonMember.id, name: 'Non Member', email: 'nonmember@test.com', role: 'STUDENT' },
        expires: new Date(Date.now() + 86400000).toISOString(),
      };
      mockAuth.mockResolvedValue(mockSession);

      const request = createMockNextRequest({
        method: 'GET',
        url: `http://localhost:3000/api/community/rooms/${testRoomId}/messages`,
      });

      const response = await getMessagesHandler(request, { params: { id: testRoomId } });
      const data = await response.json();

      expect(response.status).toBe(403);
      expect(data.success).toBe(false);

      // Clean up
      await prisma.user.delete({ where: { id: nonMember.id } });
    }, 30000);
  });

  describe('POST /api/community/rooms/[id]/kick - Kick Member', () => {
    it('should allow moderator to kick a member', async () => {
      // Mock authenticated session for user 1 (creator/moderator)
      const mockSession: Session = {
        user: { id: testUserId, name: 'Test User 1', email: 'test@test.com', role: 'STUDENT' },
        expires: new Date(Date.now() + 86400000).toISOString(),
      };
      mockAuth.mockResolvedValue(mockSession);

      const request = createMockNextRequest({
        method: 'POST',
        url: `http://localhost:3000/api/community/rooms/${testRoomId}/kick`,
        body: { userId: testUser2Id },
      });

      const response = await kickMemberHandler(request, { params: { id: testRoomId } });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.message).toContain('kicked');
    }, 30000);

    it('should reject kick from non-moderator', async () => {
      // Re-add user 2 to the room first
      await prisma.roomMember.create({
        data: {
          roomId: testRoomId,
          userId: testUser2Id,
        },
      });

      // Mock authenticated session for user 2 (not a moderator)
      const mockSession: Session = {
        user: { id: testUser2Id, name: 'Test User 2', email: 'test2@test.com', role: 'STUDENT' },
        expires: new Date(Date.now() + 86400000).toISOString(),
      };
      mockAuth.mockResolvedValue(mockSession);

      const request = createMockNextRequest({
        method: 'POST',
        url: `http://localhost:3000/api/community/rooms/${testRoomId}/kick`,
        body: { userId: testUserId },
      });

      const response = await kickMemberHandler(request, { params: { id: testRoomId } });
      const data = await response.json();

      expect(response.status).toBe(403);
      expect(data.success).toBe(false);
    }, 30000);
  });

  describe('POST /api/community/rooms/[id]/leave - Leave Room', () => {
    it('should successfully leave a room', async () => {
      // Mock authenticated session for user 2
      const mockSession: Session = {
        user: { id: testUser2Id, name: 'Test User 2', email: 'test2@test.com', role: 'STUDENT' },
        expires: new Date(Date.now() + 86400000).toISOString(),
      };
      mockAuth.mockResolvedValue(mockSession);

      const request = createMockNextRequest({
        method: 'POST',
        url: `http://localhost:3000/api/community/rooms/${testRoomId}/leave`,
      });

      const response = await leaveRoomHandler(request, { params: { id: testRoomId } });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.message).toContain('left');
    }, 30000);

    it('should reject leaving a room user is not a member of', async () => {
      // Mock authenticated session for user 2 (who just left)
      const mockSession: Session = {
        user: { id: testUser2Id, name: 'Test User 2', email: 'test2@test.com', role: 'STUDENT' },
        expires: new Date(Date.now() + 86400000).toISOString(),
      };
      mockAuth.mockResolvedValue(mockSession);

      const request = createMockNextRequest({
        method: 'POST',
        url: `http://localhost:3000/api/community/rooms/${testRoomId}/leave`,
      });

      const response = await leaveRoomHandler(request, { params: { id: testRoomId } });
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
    }, 30000);
  });
});
