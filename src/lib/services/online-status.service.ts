/**
 * Online Status Service
 * Tracks user online status in rooms and groups using Redis
 * Validates: Requirements 1.2, 2.2
 */

import { getRedisClient } from "@/lib/redis";

export class OnlineStatusService {
  /**
   * Get online users in a room
   */
  async getOnlineUsersInRoom(roomId: string): Promise<string[]> {
    try {
      const redis = getRedisClient();
      const onlineKey = `room:${roomId}:online`;
      const onlineUsers = await redis.smembers(onlineKey);
      return onlineUsers;
    } catch (error) {
      console.error("[OnlineStatusService] Failed to get online users in room:", error);
      return [];
    }
  }

  /**
   * Get online users in a group
   */
  async getOnlineUsersInGroup(groupId: string): Promise<string[]> {
    try {
      const redis = getRedisClient();
      const onlineKey = `group:${groupId}:online`;
      const onlineUsers = await redis.smembers(onlineKey);
      return onlineUsers;
    } catch (error) {
      console.error("[OnlineStatusService] Failed to get online users in group:", error);
      return [];
    }
  }

  /**
   * Get online count in a room
   */
  async getOnlineCountInRoom(roomId: string): Promise<number> {
    try {
      const redis = getRedisClient();
      const onlineKey = `room:${roomId}:online`;
      const count = await redis.scard(onlineKey);
      return count;
    } catch (error) {
      console.error("[OnlineStatusService] Failed to get online count in room:", error);
      return 0;
    }
  }

  /**
   * Get online count in a group
   */
  async getOnlineCountInGroup(groupId: string): Promise<number> {
    try {
      const redis = getRedisClient();
      const onlineKey = `group:${groupId}:online`;
      const count = await redis.scard(onlineKey);
      return count;
    } catch (error) {
      console.error("[OnlineStatusService] Failed to get online count in group:", error);
      return 0;
    }
  }

  /**
   * Check if a user is online globally
   */
  async isUserOnline(userId: string): Promise<boolean> {
    try {
      const redis = getRedisClient();
      const onlineKey = "users:online";
      const isOnline = await redis.sismember(onlineKey, userId);
      return isOnline === 1;
    } catch (error) {
      console.error("[OnlineStatusService] Failed to check if user is online:", error);
      return false;
    }
  }

  /**
   * Get all online users globally
   */
  async getAllOnlineUsers(): Promise<string[]> {
    try {
      const redis = getRedisClient();
      const onlineKey = "users:online";
      const onlineUsers = await redis.smembers(onlineKey);
      return onlineUsers;
    } catch (error) {
      console.error("[OnlineStatusService] Failed to get all online users:", error);
      return [];
    }
  }

  /**
   * Clean up stale connections for a room
   * Removes users who are no longer globally online from the room's online list
   */
  async cleanupStaleConnectionsInRoom(roomId: string): Promise<void> {
    try {
      const redis = getRedisClient();
      const roomOnlineKey = `room:${roomId}:online`;
      const globalOnlineKey = "users:online";

      // Get all users marked as online in the room
      const roomOnlineUsers = await redis.smembers(roomOnlineKey);

      // Check each user against global online status
      for (const userId of roomOnlineUsers) {
        const isGloballyOnline = await redis.sismember(globalOnlineKey, userId);
        if (isGloballyOnline === 0) {
          // User is not globally online, remove from room
          await redis.srem(roomOnlineKey, userId);
        }
      }
    } catch (error) {
      console.error("[OnlineStatusService] Failed to cleanup stale connections in room:", error);
    }
  }

  /**
   * Clean up stale connections for a group
   * Removes users who are no longer globally online from the group's online list
   */
  async cleanupStaleConnectionsInGroup(groupId: string): Promise<void> {
    try {
      const redis = getRedisClient();
      const groupOnlineKey = `group:${groupId}:online`;
      const globalOnlineKey = "users:online";

      // Get all users marked as online in the group
      const groupOnlineUsers = await redis.smembers(groupOnlineKey);

      // Check each user against global online status
      for (const userId of groupOnlineUsers) {
        const isGloballyOnline = await redis.sismember(globalOnlineKey, userId);
        if (isGloballyOnline === 0) {
          // User is not globally online, remove from group
          await redis.srem(groupOnlineKey, userId);
        }
      }
    } catch (error) {
      console.error("[OnlineStatusService] Failed to cleanup stale connections in group:", error);
    }
  }

  /**
   * Set TTL for room online status
   * This ensures stale data is automatically cleaned up
   */
  async setRoomOnlineTTL(roomId: string, ttlSeconds: number = 3600): Promise<void> {
    try {
      const redis = getRedisClient();
      const onlineKey = `room:${roomId}:online`;
      await redis.expire(onlineKey, ttlSeconds);
    } catch (error) {
      console.error("[OnlineStatusService] Failed to set room online TTL:", error);
    }
  }

  /**
   * Set TTL for group online status
   * This ensures stale data is automatically cleaned up
   */
  async setGroupOnlineTTL(groupId: string, ttlSeconds: number = 3600): Promise<void> {
    try {
      const redis = getRedisClient();
      const onlineKey = `group:${groupId}:online`;
      await redis.expire(onlineKey, ttlSeconds);
    } catch (error) {
      console.error("[OnlineStatusService] Failed to set group online TTL:", error);
    }
  }
}

export const onlineStatusService = new OnlineStatusService();
