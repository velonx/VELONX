/**
 * Connection Service
 * Handles LinkedIn-style bidirectional connection logic:
 * Send → Accept/Reject → Connected
 */

import { prisma } from "@/lib/prisma";
import type { ConnectionStatus } from "@prisma/client";

/**
 * Send a connection request from one user to another
 */
export async function sendConnectionRequest(
  senderId: string,
  receiverId: string,
  message?: string | null
): Promise<{ success: boolean; error?: string; connection?: any }> {
  // Can't connect to yourself
  if (senderId === receiverId) {
    return { success: false, error: "Cannot connect with yourself" };
  }

  // Check if receiver exists
  const receiver = await prisma.user.findUnique({
    where: { id: receiverId },
    select: { id: true, name: true, email: true },
  });

  if (!receiver) {
    return { success: false, error: "User not found" };
  }

  // Check if blocked in either direction
  const block = await prisma.userBlock.findFirst({
    where: {
      OR: [
        { blockerId: senderId, blockedId: receiverId },
        { blockerId: receiverId, blockedId: senderId },
      ],
    },
  });

  if (block) {
    return { success: false, error: "Cannot connect with this user" };
  }

  // Check for existing connection in either direction
  const existing = await prisma.connection.findFirst({
    where: {
      OR: [
        { senderId, receiverId },
        { senderId: receiverId, receiverId: senderId },
      ],
    },
  });

  if (existing) {
    if (existing.status === "ACCEPTED") {
      return { success: false, error: "Already connected" };
    }
    if (existing.status === "PENDING") {
      // If the other person already sent a request, auto-accept
      if (existing.senderId === receiverId) {
        const updated = await prisma.connection.update({
          where: { id: existing.id },
          data: { status: "ACCEPTED" },
          include: {
            sender: { select: { id: true, name: true, image: true, headline: true } },
            receiver: { select: { id: true, name: true, image: true, headline: true } },
          },
        });
        return { success: true, connection: updated };
      }
      return { success: false, error: "Connection request already pending" };
    }
    if (existing.status === "REJECTED") {
      // Allow re-requesting after rejection by updating the existing record
      const updated = await prisma.connection.update({
        where: { id: existing.id },
        data: {
          senderId,
          receiverId,
          status: "PENDING",
          message: message || null,
        },
        include: {
          sender: { select: { id: true, name: true, image: true, headline: true } },
          receiver: { select: { id: true, name: true, image: true, headline: true } },
        },
      });
      return { success: true, connection: updated };
    }
  }

  // Create new connection request
  const connection = await prisma.connection.create({
    data: {
      senderId,
      receiverId,
      message: message || null,
    },
    include: {
      sender: { select: { id: true, name: true, image: true, headline: true } },
      receiver: { select: { id: true, name: true, image: true, headline: true } },
    },
  });

  // Create notification for receiver (fire-and-forget)
  prisma.notification
    .create({
      data: {
        userId: receiverId,
        title: "New Connection Request",
        description: `${connection.sender.name || "Someone"} wants to connect with you`,
        type: "CONNECTION_REQUEST",
        actionUrl: "/network?tab=requests",
      },
    })
    .catch((err) => console.error("Failed to create connection notification:", err));

  // Send email notification (fire-and-forget)
  if (receiver?.email) {
    import("@/lib/services/email.service").then(({ EmailService }) => {
      EmailService.sendConnectionRequestEmail(
        { email: receiver.email, name: receiver.name },
        { name: connection.sender.name }
      ).catch((err) => console.error("Failed to send connection email:", err));
    }).catch((err) => console.error("Failed to import EmailService:", err));
  }

  return { success: true, connection };
}

/**
 * Accept a connection request
 */
export async function acceptConnection(
  connectionId: string,
  userId: string
): Promise<{ success: boolean; error?: string; connection?: any }> {
  const connection = await prisma.connection.findUnique({
    where: { id: connectionId },
    include: {
      sender: { select: { id: true, name: true, image: true, headline: true } },
      receiver: { select: { id: true, name: true, image: true, headline: true } },
    },
  });

  if (!connection) {
    return { success: false, error: "Connection request not found" };
  }

  // Only the receiver can accept
  if (connection.receiverId !== userId) {
    return { success: false, error: "Not authorized to accept this request" };
  }

  if (connection.status !== "PENDING") {
    return { success: false, error: "Connection request is not pending" };
  }

  const updated = await prisma.connection.update({
    where: { id: connectionId },
    data: { status: "ACCEPTED" },
    include: {
      sender: { select: { id: true, name: true, image: true, headline: true } },
      receiver: { select: { id: true, name: true, image: true, headline: true } },
    },
  });

  // Notify the sender that their request was accepted (fire-and-forget)
  prisma.notification
    .create({
      data: {
        userId: connection.senderId,
        title: "Connection Accepted",
        description: `${connection.receiver.name || "Someone"} accepted your connection request`,
        type: "CONNECTION_ACCEPTED",
        actionUrl: `/network/${connection.receiverId}`,
      },
    })
    .catch((err) => console.error("Failed to create acceptance notification:", err));

  return { success: true, connection: updated };
}

/**
 * Reject a connection request
 */
export async function rejectConnection(
  connectionId: string,
  userId: string
): Promise<{ success: boolean; error?: string }> {
  const connection = await prisma.connection.findUnique({
    where: { id: connectionId },
  });

  if (!connection) {
    return { success: false, error: "Connection request not found" };
  }

  // Only the receiver can reject
  if (connection.receiverId !== userId) {
    return { success: false, error: "Not authorized to reject this request" };
  }

  if (connection.status !== "PENDING") {
    return { success: false, error: "Connection request is not pending" };
  }

  await prisma.connection.update({
    where: { id: connectionId },
    data: { status: "REJECTED" },
  });

  return { success: true };
}

/**
 * Remove an existing connection (either party can remove)
 */
export async function removeConnection(
  connectionId: string,
  userId: string
): Promise<{ success: boolean; error?: string }> {
  const connection = await prisma.connection.findUnique({
    where: { id: connectionId },
  });

  if (!connection) {
    return { success: false, error: "Connection not found" };
  }

  // Either party can remove
  if (connection.senderId !== userId && connection.receiverId !== userId) {
    return { success: false, error: "Not authorized to remove this connection" };
  }

  await prisma.connection.delete({
    where: { id: connectionId },
  });

  return { success: true };
}

/**
 * Withdraw a pending connection request (sender cancels)
 */
export async function withdrawConnection(
  connectionId: string,
  userId: string
): Promise<{ success: boolean; error?: string }> {
  const connection = await prisma.connection.findUnique({
    where: { id: connectionId },
  });

  if (!connection) {
    return { success: false, error: "Connection request not found" };
  }

  // Only the sender can withdraw
  if (connection.senderId !== userId) {
    return { success: false, error: "Not authorized to withdraw this request" };
  }

  if (connection.status !== "PENDING") {
    return { success: false, error: "Can only withdraw pending requests" };
  }

  await prisma.connection.delete({
    where: { id: connectionId },
  });

  return { success: true };
}

/**
 * Get the connection status between two users
 */
export async function getConnectionStatus(
  userId1: string,
  userId2: string
): Promise<{ status: "none" | "pending_sent" | "pending_received" | "connected"; connectionId?: string }> {
  const connection = await prisma.connection.findFirst({
    where: {
      OR: [
        { senderId: userId1, receiverId: userId2 },
        { senderId: userId2, receiverId: userId1 },
      ],
    },
    select: { id: true, status: true, senderId: true },
  });

  if (!connection) {
    return { status: "none" };
  }

  if (connection.status === "ACCEPTED") {
    return { status: "connected", connectionId: connection.id };
  }

  if (connection.status === "PENDING") {
    if (connection.senderId === userId1) {
      return { status: "pending_sent", connectionId: connection.id };
    }
    return { status: "pending_received", connectionId: connection.id };
  }

  // REJECTED is treated as "none" for UX purposes (allows re-requesting)
  return { status: "none" };
}

/**
 * Get mutual connections between two users
 */
export async function getMutualConnections(
  userId1: string,
  userId2: string,
  limit = 5
): Promise<{ count: number; users: any[] }> {
  // Get all accepted connection user IDs for userId1
  const user1Connections = await prisma.connection.findMany({
    where: {
      status: "ACCEPTED",
      OR: [{ senderId: userId1 }, { receiverId: userId1 }],
    },
    select: { senderId: true, receiverId: true },
  });

  const user1ConnectedIds = user1Connections.map((c) =>
    c.senderId === userId1 ? c.receiverId : c.senderId
  );

  // Get all accepted connection user IDs for userId2
  const user2Connections = await prisma.connection.findMany({
    where: {
      status: "ACCEPTED",
      OR: [{ senderId: userId2 }, { receiverId: userId2 }],
    },
    select: { senderId: true, receiverId: true },
  });

  const user2ConnectedIds = user2Connections.map((c) =>
    c.senderId === userId2 ? c.receiverId : c.senderId
  );

  // Find intersection
  const mutualIds = user1ConnectedIds.filter((id) => user2ConnectedIds.includes(id));

  const users = await prisma.user.findMany({
    where: { id: { in: mutualIds.slice(0, limit) } },
    select: {
      id: true,
      name: true,
      image: true,
      headline: true,
    },
  });

  return { count: mutualIds.length, users };
}

/**
 * Get the total connection count for a user
 */
export async function getConnectionCount(userId: string): Promise<number> {
  return prisma.connection.count({
    where: {
      status: "ACCEPTED",
      OR: [{ senderId: userId }, { receiverId: userId }],
    },
  });
}

/**
 * Check if two users are connected
 */
export async function areConnected(userId1: string, userId2: string): Promise<boolean> {
  const connection = await prisma.connection.findFirst({
    where: {
      status: "ACCEPTED",
      OR: [
        { senderId: userId1, receiverId: userId2 },
        { senderId: userId2, receiverId: userId1 },
      ],
    },
    select: { id: true },
  });

  return !!connection;
}
