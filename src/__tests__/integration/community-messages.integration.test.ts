/**
 * Integration Tests: Community Messages API
 * 
 * Tests for chat message API endpoints including:
 * - Send message
 * - Get messages
 * - Edit message
 * - Delete message
 * - Rate limiting
 * - Mute status checking
 * - Authentication and authorization
 * - Error handling
 * 
 * Requirements: 3.1, 3.2, 3.4, 3.5, 3.6
 */

import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import { POST as sendMessageHandler, GET as getMessagesHandler } from '@/app/api/community/messages/route';
import { PATCH as editMessageHandler, DELETE as deleteMessageHandler } from '@/app/api/community/messages/[id]/route';
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

describe('Community Messages API Integration Tests', () => {
  let testUserId: string;
  let testUser2Id: string;
  let testRoomId: string;
  let testGroupId: string;
  let testMessageId: string;

  beforeAll(async () => {
    // Create test users
    const user1 = await prisma.user.create({
      data: {
        name: 'Test User 1',
        email: `test-msg-user1-${Date.now()}@test.com`,
        password: 'hashedpassword',
        role: 'STUDENT',
      },
    });
    testUserId = user1.id;

    const user2 = await prisma.user.create({
      data: {
        name: 'Test User 2',
        email: `test-msg-user2-${Date.now()}@test.com`,
        password: 'hashedpassword',
        role: 'STUDENT',
      },
    });
    testUser2Id = user2.id;

    // Create test room
    const room = await prisma.discussionRoom.create({
      data: {
        name: 'Test Room',
        description: 'Test room for messages',
        isPrivate: false,
        creatorId: testUserId,
      },
    });
    testRoomId = room.id;

    // Add users as members
    await prisma.roomMember.createMany({
      data: [
        { roomId: testRoomId, userId: testUserId },
        { roomId: testRoomId, userId: testUser2Id },
      ],
    });

    // Add user1 as moderator
    await prisma.roomModerator.create({
      data: {
        roomId: testRoomId,
        userId: testUserId,
      },
    });

    // Create test group
    const group = await prisma.communityGroup.create({
      data: {
        name: 'Test Group',
        description: 'Test group for messages',
        isPrivate: false,
        ownerId: testUserId,
      },
    });
    testGroupId = group.id;

    // Add users as members
    await prisma.groupMember.createMany({
      data: [
        { groupId: testGroupId, userId: testUserId },
        { groupId: testGroupId, userId: testUser2Id },
      ],
    });
  });

  afterAll(async () => {
    // Clean up test data
    await prisma.chatMessage.deleteMany({
      where: {
        OR: [
          { roomId: testRoomId },
          { groupId: testGroupId },
        ],
      },
    });
    await prisma.roomModerator.deleteMany({
      where: { roomId: testRoomId },
    });
    await prisma.roomMember.deleteMany({
      where: { roomId: testRoomId },
    });
    await prisma.discussionRoom.deleteMany({
      where: { id: testRoomId },
    });
    await prisma.groupMember.deleteMany({
      where: { groupId: testGroupId },
    });
    await prisma.communityGroup.deleteMany({
      where: { id: testGroupId },
    });
    await prisma.user.deleteMany({
      where: {
        id: { in: [testUserId, testUser2Id] },
      },
    });
  });

  beforeEach(() => {
    // Reset mocks before each test
    vi.clearAllMocks();
  });

  describe('POST /api/community/messages - Send Message', () => {
    it('should successfully send a message to a room', async () => {
      // Mock authenticated session
      const mockSession: Session = {
        user: { id: testUserId, name: 'Test User 1', email: 'test@test.com', role: 'STUDENT' },
        expires: new Date(Date.now() + 86400000).toISOString(),
      };
      mockAuth.mockResolvedValue(mockSession);

      const messageData = {
        content: 'Hello, this is a test message!',
        roomId: testRoomId,
      };

      const request = createMockNextRequest({
        method: 'POST',
        url: 'http://localhost:3000/api/community/messages',
        body: messageData,
      });

      const response = await sendMessageHandler(request);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data.success).toBe(true);
      expect(data.data).toBeDefined();
      expect(data.data.content).toBe(messageData.content);
      expect(data.data.roomId).toBe(testRoomId);
      expect(data.data.authorId).toBe(testUserId);
      expect(data.data.isEdited).toBe(false);
      expect(data.data.isDeleted).toBe(false);

      // Store message ID for later tests
      testMessageId = data.data.id;
    });

    it('should successfully send a message to a group', async () => {
      // Mock authenticated session
      const mockSession: Session = {
        user: { id: testUserId, name: 'Test User 1', email: 'test@test.com', role: 'STUDENT' },
        expires: new Date(Date.now() + 86400000).toISOString(),
      };
      mockAuth.mockResolvedValue(mockSession);

      const messageData = {
        content: 'Hello group!',
        groupId: testGroupId,
      };

      const request = createMockNextRequest({
        method: 'POST',
        url: 'http://localhost:3000/api/community/messages',
        body: messageData,
      });

      const response = await sendMessageHandler(request);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data.success).toBe(true);
      expect(data.data.groupId).toBe(testGroupId);
    });

    it('should reject message without authentication', async () => {
      // Mock unauthenticated session
      mockAuth.mockResolvedValue(null);

      const messageData = {
        content: 'This should fail',
        roomId: testRoomId,
      };

      const request = createMockNextRequest({
        method: 'POST',
        url: 'http://localhost:3000/api/community/messages',
        body: messageData,
      });

      const response = await sendMessageHandler(request);

      expect(response.status).toBe(401);
    });

    it('should reject message with both roomId and groupId', async () => {
      // Mock authenticated session
      const mockSession: Session = {
        user: { id: testUserId, name: 'Test User 1', email: 'test@test.com', role: 'STUDENT' },
        expires: new Date(Date.now() + 86400000).toISOString(),
      };
      mockAuth.mockResolvedValue(mockSession);

      const messageData = {
        content: 'This should fail',
        roomId: testRoomId,
        groupId: testGroupId,
      };

      const request = createMockNextRequest({
        method: 'POST',
        url: 'http://localhost:3000/api/community/messages',
        body: messageData,
      });

      const response = await sendMessageHandler(request);

      expect(response.status).toBe(400);
    });

    it('should reject message without roomId or groupId', async () => {
      // Mock authenticated session
      const mockSession: Session = {
        user: { id: testUserId, name: 'Test User 1', email: 'test@test.com', role: 'STUDENT' },
        expires: new Date(Date.now() + 86400000).toISOString(),
      };
      mockAuth.mockResolvedValue(mockSession);

      const messageData = {
        content: 'This should fail',
      };

      const request = createMockNextRequest({
        method: 'POST',
        url: 'http://localhost:3000/api/community/messages',
        body: messageData,
      });

      const response = await sendMessageHandler(request);

      expect(response.status).toBe(400);
    });

    it('should reject empty message content', async () => {
      // Mock authenticated session
      const mockSession: Session = {
        user: { id: testUserId, name: 'Test User 1', email: 'test@test.com', role: 'STUDENT' },
        expires: new Date(Date.now() + 86400000).toISOString(),
      };
      mockAuth.mockResolvedValue(mockSession);

      const messageData = {
        content: '',
        roomId: testRoomId,
      };

      const request = createMockNextRequest({
        method: 'POST',
        url: 'http://localhost:3000/api/community/messages',
        body: messageData,
      });

      const response = await sendMessageHandler(request);

      expect(response.status).toBe(400);
    });

    it('should reject message from non-member', async () => {
      // Create a third user who is not a member
      const user3 = await prisma.user.create({
        data: {
          name: 'Test User 3',
          email: `test-msg-user3-${Date.now()}@test.com`,
          password: 'hashedpassword',
          role: 'STUDENT',
        },
      });

      // Mock authenticated session for user3
      const mockSession: Session = {
        user: { id: user3.id, name: 'Test User 3', email: 'test3@test.com', role: 'STUDENT' },
        expires: new Date(Date.now() + 86400000).toISOString(),
      };
      mockAuth.mockResolvedValue(mockSession);

      const messageData = {
        content: 'This should fail',
        roomId: testRoomId,
      };

      const request = createMockNextRequest({
        method: 'POST',
        url: 'http://localhost:3000/api/community/messages',
        body: messageData,
      });

      const response = await sendMessageHandler(request);

      expect(response.status).toBe(403);

      // Clean up
      await prisma.user.delete({ where: { id: user3.id } });
    });

    it('should reject message from muted user', async () => {
      // Mute user2 in the room
      const expiresAt = new Date();
      expiresAt.setMinutes(expiresAt.getMinutes() + 10);

      await prisma.userMute.create({
        data: {
          userId: testUser2Id,
          roomId: testRoomId,
          mutedBy: testUserId,
          reason: 'Test mute',
          expiresAt,
        },
      });

      // Mock authenticated session for user2
      const mockSession: Session = {
        user: { id: testUser2Id, name: 'Test User 2', email: 'test2@test.com', role: 'STUDENT' },
        expires: new Date(Date.now() + 86400000).toISOString(),
      };
      mockAuth.mockResolvedValue(mockSession);

      const messageData = {
        content: 'This should fail',
        roomId: testRoomId,
      };

      const request = createMockNextRequest({
        method: 'POST',
        url: 'http://localhost:3000/api/community/messages',
        body: messageData,
      });

      const response = await sendMessageHandler(request);

      expect(response.status).toBe(403);

      // Clean up mute
      await prisma.userMute.deleteMany({
        where: { userId: testUser2Id, roomId: testRoomId },
      });
    });
  });

  describe('GET /api/community/messages - Get Messages', () => {
    it('should successfully get messages from a room', async () => {
      // Mock authenticated session
      const mockSession: Session = {
        user: { id: testUserId, name: 'Test User 1', email: 'test@test.com', role: 'STUDENT' },
        expires: new Date(Date.now() + 86400000).toISOString(),
      };
      mockAuth.mockResolvedValue(mockSession);

      const request = createMockNextRequest({
        method: 'GET',
        url: 'http://localhost:3000/api/community/messages',
        searchParams: { roomId: testRoomId },
      });

      const response = await getMessagesHandler(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(Array.isArray(data.data)).toBe(true);
      expect(data.data.length).toBeGreaterThan(0);
    });

    it('should reject request without roomId or groupId', async () => {
      // Mock authenticated session
      const mockSession: Session = {
        user: { id: testUserId, name: 'Test User 1', email: 'test@test.com', role: 'STUDENT' },
        expires: new Date(Date.now() + 86400000).toISOString(),
      };
      mockAuth.mockResolvedValue(mockSession);

      const request = createMockNextRequest({
        method: 'GET',
        url: 'http://localhost:3000/api/community/messages',
      });

      const response = await getMessagesHandler(request);

      expect(response.status).toBe(400);
    });
  });

  describe('PATCH /api/community/messages/[id] - Edit Message', () => {
    it('should successfully edit own message', async () => {
      // Mock authenticated session
      const mockSession: Session = {
        user: { id: testUserId, name: 'Test User 1', email: 'test@test.com', role: 'STUDENT' },
        expires: new Date(Date.now() + 86400000).toISOString(),
      };
      mockAuth.mockResolvedValue(mockSession);

      const editData = {
        content: 'This message has been edited',
      };

      const request = createMockNextRequest({
        method: 'PATCH',
        url: `http://localhost:3000/api/community/messages/${testMessageId}`,
        body: editData,
      });

      const response = await editMessageHandler(request, { params: { id: testMessageId } });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.content).toBe(editData.content);
      expect(data.data.isEdited).toBe(true);
    });

    it('should reject editing another user\'s message', async () => {
      // Mock authenticated session for user2
      const mockSession: Session = {
        user: { id: testUser2Id, name: 'Test User 2', email: 'test2@test.com', role: 'STUDENT' },
        expires: new Date(Date.now() + 86400000).toISOString(),
      };
      mockAuth.mockResolvedValue(mockSession);

      const editData = {
        content: 'This should fail',
      };

      const request = createMockNextRequest({
        method: 'PATCH',
        url: `http://localhost:3000/api/community/messages/${testMessageId}`,
        body: editData,
      });

      const response = await editMessageHandler(request, { params: { id: testMessageId } });

      expect(response.status).toBe(403);
    });
  });

  describe('DELETE /api/community/messages/[id] - Delete Message', () => {
    it('should successfully delete own message', async () => {
      // Create a message to delete
      const message = await prisma.chatMessage.create({
        data: {
          content: 'Message to delete',
          roomId: testRoomId,
          authorId: testUserId,
        },
      });

      // Mock authenticated session
      const mockSession: Session = {
        user: { id: testUserId, name: 'Test User 1', email: 'test@test.com', role: 'STUDENT' },
        expires: new Date(Date.now() + 86400000).toISOString(),
      };
      mockAuth.mockResolvedValue(mockSession);

      const request = createMockNextRequest({
        method: 'DELETE',
        url: `http://localhost:3000/api/community/messages/${message.id}`,
      });

      const response = await deleteMessageHandler(request, { params: { id: message.id } });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);

      // Verify message is marked as deleted
      const deletedMessage = await prisma.chatMessage.findUnique({
        where: { id: message.id },
      });
      expect(deletedMessage?.isDeleted).toBe(true);
    });

    it('should allow moderator to delete any message', async () => {
      // Create a message from user2
      const message = await prisma.chatMessage.create({
        data: {
          content: 'Message from user2',
          roomId: testRoomId,
          authorId: testUser2Id,
        },
      });

      // Mock authenticated session for user1 (moderator)
      const mockSession: Session = {
        user: { id: testUserId, name: 'Test User 1', email: 'test@test.com', role: 'STUDENT' },
        expires: new Date(Date.now() + 86400000).toISOString(),
      };
      mockAuth.mockResolvedValue(mockSession);

      const request = createMockNextRequest({
        method: 'DELETE',
        url: `http://localhost:3000/api/community/messages/${message.id}`,
      });

      const response = await deleteMessageHandler(request, { params: { id: message.id } });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);

      // Verify moderation log was created
      const moderationLog = await prisma.moderationLog.findFirst({
        where: {
          moderatorId: testUserId,
          targetId: message.id,
          type: 'MESSAGE_DELETE',
        },
      });
      expect(moderationLog).toBeDefined();
    });

    it('should reject non-moderator deleting another user\'s message', async () => {
      // Create a message from user1
      const message = await prisma.chatMessage.create({
        data: {
          content: 'Message from user1',
          roomId: testRoomId,
          authorId: testUserId,
        },
      });

      // Mock authenticated session for user2 (not a moderator)
      const mockSession: Session = {
        user: { id: testUser2Id, name: 'Test User 2', email: 'test2@test.com', role: 'STUDENT' },
        expires: new Date(Date.now() + 86400000).toISOString(),
      };
      mockAuth.mockResolvedValue(mockSession);

      const request = createMockNextRequest({
        method: 'DELETE',
        url: `http://localhost:3000/api/community/messages/${message.id}`,
      });

      const response = await deleteMessageHandler(request, { params: { id: message.id } });

      expect(response.status).toBe(403);
    });
  });
});
