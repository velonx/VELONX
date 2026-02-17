/**
 * Real-Time Features Integration Tests
 * Tests for Task 18: Real-Time Features
 * Validates: Requirements 3.1, 3.2, 3.7, 1.2, 2.2
 */

import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { chatService } from "@/lib/services/chat.service";
import { discussionRoomService } from "@/lib/services/discussion-room.service";
import { communityGroupService } from "@/lib/services/community-group.service";
import { onlineStatusService } from "@/lib/services/online-status.service";
import { prisma } from "@/lib/prisma";
import { getRedisClient } from "@/lib/redis";

// Mock the WebSocket pub/sub module
vi.mock("@/lib/websocket/pubsub", () => ({
  publishChatMessage: vi.fn().mockResolvedValue(undefined),
  publishTypingIndicator: vi.fn().mockResolvedValue(undefined),
  publishMessageEdit: vi.fn().mockResolvedValue(undefined),
  publishMessageDelete: vi.fn().mockResolvedValue(undefined),
  publishUserJoined: vi.fn().mockResolvedValue(undefined),
  publishUserLeft: vi.fn().mockResolvedValue(undefined),
}));

describe("Real-Time Features", () => {
  let testUser1: any;
  let testUser2: any;
  let testRoom: any;
  let testGroup: any;

  beforeEach(async () => {
    // Create test users
    testUser1 = await prisma.user.create({
      data: {
        email: "realtime1@test.com",
        name: "RealTime User 1",
        password: "hashedpassword",
        role: "STUDENT",
      },
    });

    testUser2 = await prisma.user.create({
      data: {
        email: "realtime2@test.com",
        name: "RealTime User 2",
        password: "hashedpassword",
        role: "STUDENT",
      },
    });

    // Create test room
    testRoom = await discussionRoomService.createRoom(
      {
        name: "Real-Time Test Room",
        description: "Testing real-time features",
        isPrivate: false,
      },
      testUser1.id
    );

    // Create test group
    testGroup = await communityGroupService.createGroup(
      {
        name: "Real-Time Test Group",
        description: "Testing real-time features",
        isPrivate: false,
      },
      testUser1.id
    );
  });

  afterEach(async () => {
    // Clean up test data
    await prisma.chatMessage.deleteMany({
      where: {
        OR: [
          { roomId: testRoom.id },
          { groupId: testGroup.id },
        ],
      },
    });

    await prisma.roomMember.deleteMany({
      where: { roomId: testRoom.id },
    });

    await prisma.roomModerator.deleteMany({
      where: { roomId: testRoom.id },
    });

    await prisma.discussionRoom.delete({
      where: { id: testRoom.id },
    });

    await prisma.groupMember.deleteMany({
      where: { groupId: testGroup.id },
    });

    await prisma.groupModerator.deleteMany({
      where: { groupId: testGroup.id },
    });

    await prisma.communityGroup.delete({
      where: { id: testGroup.id },
    });

    await prisma.user.deleteMany({
      where: {
        id: {
          in: [testUser1.id, testUser2.id],
        },
      },
    });

    // Clear Redis data
    const redis = getRedisClient();
    await redis.del(`room:${testRoom.id}:online`);
    await redis.del(`group:${testGroup.id}:online`);
    await redis.del(`room:${testRoom.id}:typing`);
    await redis.del(`group:${testGroup.id}:typing`);
  });

  describe("Task 18.1: Real-Time Message Broadcasting", () => {
    it("should broadcast chat message when sent to room", async () => {
      const { publishChatMessage } = await import("@/lib/websocket/pubsub");

      const message = await chatService.sendMessage(
        {
          content: "Hello from real-time test!",
          roomId: testRoom.id,
        },
        testUser1.id
      );

      expect(message).toBeDefined();
      expect(message.content).toBe("Hello from real-time test!");
      expect(publishChatMessage).toHaveBeenCalledWith(
        testRoom.id,
        undefined,
        expect.objectContaining({
          type: "CHAT_MESSAGE",
          payload: expect.objectContaining({
            id: message.id,
            content: "Hello from real-time test!",
            roomId: testRoom.id,
          }),
        })
      );
    });

    it("should broadcast chat message when sent to group", async () => {
      const { publishChatMessage } = await import("@/lib/websocket/pubsub");

      const message = await chatService.sendMessage(
        {
          content: "Hello group!",
          groupId: testGroup.id,
        },
        testUser1.id
      );

      expect(message).toBeDefined();
      expect(message.content).toBe("Hello group!");
      expect(publishChatMessage).toHaveBeenCalledWith(
        undefined,
        testGroup.id,
        expect.objectContaining({
          type: "CHAT_MESSAGE",
          payload: expect.objectContaining({
            id: message.id,
            content: "Hello group!",
            groupId: testGroup.id,
          }),
        })
      );
    });

    it("should broadcast message edit", async () => {
      const { publishMessageEdit } = await import("@/lib/websocket/pubsub");

      // Send initial message
      const message = await chatService.sendMessage(
        {
          content: "Original message",
          roomId: testRoom.id,
        },
        testUser1.id
      );

      // Edit the message
      const editedMessage = await chatService.editMessage(
        message.id,
        "Edited message",
        testUser1.id
      );

      expect(editedMessage.content).toBe("Edited message");
      expect(editedMessage.isEdited).toBe(true);
      expect(publishMessageEdit).toHaveBeenCalledWith(
        testRoom.id,
        undefined,
        message.id,
        "Edited message"
      );
    });

    it("should broadcast message deletion", async () => {
      const { publishMessageDelete } = await import("@/lib/websocket/pubsub");

      // Send initial message
      const message = await chatService.sendMessage(
        {
          content: "Message to delete",
          roomId: testRoom.id,
        },
        testUser1.id
      );

      // Delete the message
      await chatService.deleteMessage(message.id, testUser1.id);

      expect(publishMessageDelete).toHaveBeenCalledWith(
        testRoom.id,
        undefined,
        message.id
      );
    });

    it("should broadcast typing indicator", async () => {
      const { publishTypingIndicator } = await import("@/lib/websocket/pubsub");

      await chatService.broadcastTyping({
        userId: testUser1.id,
        userName: testUser1.name!,
        roomId: testRoom.id,
        isTyping: true,
      });

      expect(publishTypingIndicator).toHaveBeenCalledWith(
        testRoom.id,
        undefined,
        testUser1.id,
        testUser1.name,
        true
      );
    });
  });

  describe("Task 18.2: Online Status Tracking", () => {
    it("should broadcast user joined event when joining room", async () => {
      const { publishUserJoined } = await import("@/lib/websocket/pubsub");

      await discussionRoomService.joinRoom(testRoom.id, testUser2.id);

      expect(publishUserJoined).toHaveBeenCalledWith(
        testRoom.id,
        undefined,
        testUser2.id,
        testUser2.name,
        testUser2.image
      );
    });

    it("should broadcast user left event when leaving room", async () => {
      const { publishUserLeft } = await import("@/lib/websocket/pubsub");

      // First join the room
      await discussionRoomService.joinRoom(testRoom.id, testUser2.id);

      // Then leave
      await discussionRoomService.leaveRoom(testRoom.id, testUser2.id);

      expect(publishUserLeft).toHaveBeenCalledWith(
        testRoom.id,
        undefined,
        testUser2.id
      );
    });

    it("should broadcast user joined event when joining group", async () => {
      const { publishUserJoined } = await import("@/lib/websocket/pubsub");

      await communityGroupService.joinGroup(testGroup.id, testUser2.id);

      expect(publishUserJoined).toHaveBeenCalledWith(
        undefined,
        testGroup.id,
        testUser2.id,
        testUser2.name,
        testUser2.image
      );
    });

    it("should broadcast user left event when leaving group", async () => {
      const { publishUserLeft } = await import("@/lib/websocket/pubsub");

      // First join the group
      await communityGroupService.joinGroup(testGroup.id, testUser2.id);

      // Then leave
      await communityGroupService.leaveGroup(testGroup.id, testUser2.id);

      expect(publishUserLeft).toHaveBeenCalledWith(
        undefined,
        testGroup.id,
        testUser2.id
      );
    });

    it("should track online users in room using Redis", async () => {
      const redis = getRedisClient();
      const onlineKey = `room:${testRoom.id}:online`;

      // Simulate user coming online
      await redis.sadd(onlineKey, testUser1.id);
      await redis.sadd(onlineKey, testUser2.id);

      const onlineUsers = await onlineStatusService.getOnlineUsersInRoom(testRoom.id);
      expect(onlineUsers).toContain(testUser1.id);
      expect(onlineUsers).toContain(testUser2.id);

      const onlineCount = await onlineStatusService.getOnlineCountInRoom(testRoom.id);
      expect(onlineCount).toBe(2);
    });

    it("should track online users in group using Redis", async () => {
      const redis = getRedisClient();
      const onlineKey = `group:${testGroup.id}:online`;

      // Simulate user coming online
      await redis.sadd(onlineKey, testUser1.id);

      const onlineUsers = await onlineStatusService.getOnlineUsersInGroup(testGroup.id);
      expect(onlineUsers).toContain(testUser1.id);

      const onlineCount = await onlineStatusService.getOnlineCountInGroup(testGroup.id);
      expect(onlineCount).toBe(1);
    });

    it("should check if user is online globally", async () => {
      const redis = getRedisClient();
      const globalOnlineKey = "users:online";

      // Simulate user coming online
      await redis.sadd(globalOnlineKey, testUser1.id);

      const isOnline = await onlineStatusService.isUserOnline(testUser1.id);
      expect(isOnline).toBe(true);

      const isOffline = await onlineStatusService.isUserOnline(testUser2.id);
      expect(isOffline).toBe(false);
    });

    it("should clean up stale connections in room", async () => {
      const redis = getRedisClient();
      const roomOnlineKey = `room:${testRoom.id}:online`;
      const globalOnlineKey = "users:online";

      // Add users to room online list
      await redis.sadd(roomOnlineKey, testUser1.id);
      await redis.sadd(roomOnlineKey, testUser2.id);

      // Only mark user1 as globally online
      await redis.sadd(globalOnlineKey, testUser1.id);

      // Clean up stale connections
      await onlineStatusService.cleanupStaleConnectionsInRoom(testRoom.id);

      // User2 should be removed from room online list
      const onlineUsers = await onlineStatusService.getOnlineUsersInRoom(testRoom.id);
      expect(onlineUsers).toContain(testUser1.id);
      expect(onlineUsers).not.toContain(testUser2.id);
    });

    it("should set TTL for room online status", async () => {
      const redis = getRedisClient();
      const onlineKey = `room:${testRoom.id}:online`;

      // Add user to online list
      await redis.sadd(onlineKey, testUser1.id);

      // Set TTL
      await onlineStatusService.setRoomOnlineTTL(testRoom.id, 60);

      // Check TTL was set
      const ttl = await redis.ttl(onlineKey);
      expect(ttl).toBeGreaterThan(0);
      expect(ttl).toBeLessThanOrEqual(60);
    });
  });
});
