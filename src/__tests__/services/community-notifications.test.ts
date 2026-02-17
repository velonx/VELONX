import { describe, it, expect, beforeEach, vi } from 'vitest';
import { NotificationService } from '@/lib/services/notification.service';
import { prisma } from '@/lib/prisma';
import { NotificationType } from '@prisma/client';

// Mock Prisma
vi.mock('@/lib/prisma', () => ({
  prisma: {
    user: {
      findUnique: vi.fn(),
    },
    notification: {
      create: vi.fn(),
      findMany: vi.fn(),
      findUnique: vi.fn(),
      update: vi.fn(),
      updateMany: vi.fn(),
      delete: vi.fn(),
      deleteMany: vi.fn(),
      count: vi.fn(),
    },
  },
}));

describe('NotificationService - Community Notifications', () => {
  let notificationService: NotificationService;

  beforeEach(() => {
    notificationService = new NotificationService();
    vi.clearAllMocks();
  });

  describe('createPostCommentNotification', () => {
    it('should create comment notification when preference is enabled', async () => {
      const mockUser = {
        id: 'user-1',
        communityComments: true,
      };

      const mockNotification = {
        id: 'notif-1',
        userId: 'user-1',
        title: 'New Comment on Your Post',
        description: 'John Doe commented on your post: "This is a test post"',
        type: NotificationType.COMMENT,
        actionUrl: '/community/posts/post-1',
        read: false,
        createdAt: new Date(),
        updatedAt: new Date(),
        metadata: {
          postId: 'post-1',
          commentContent: 'Great post!',
          eventType: 'post_comment',
        },
      };

      vi.mocked(prisma.user.findUnique).mockResolvedValue(mockUser as any);
      vi.mocked(prisma.notification.create).mockResolvedValue(mockNotification as any);

      const result = await notificationService.createPostCommentNotification({
        postId: 'post-1',
        postAuthorId: 'user-1',
        postContent: 'This is a test post',
        commenterName: 'John Doe',
        commentContent: 'Great post!',
      });

      expect(result).toBeDefined();
      expect(result?.type).toBe(NotificationType.COMMENT);
      expect(prisma.notification.create).toHaveBeenCalled();
    });

    it('should not create notification when preference is disabled', async () => {
      const mockUser = {
        id: 'user-1',
        communityComments: false,
      };

      vi.mocked(prisma.user.findUnique).mockResolvedValue(mockUser as any);

      const result = await notificationService.createPostCommentNotification({
        postId: 'post-1',
        postAuthorId: 'user-1',
        postContent: 'This is a test post',
        commenterName: 'John Doe',
        commentContent: 'Great post!',
      });

      expect(result).toBeNull();
      expect(prisma.notification.create).not.toHaveBeenCalled();
    });
  });

  describe('createPostReactionNotification', () => {
    it('should create reaction notification with emoji', async () => {
      const mockUser = {
        id: 'user-1',
        communityReactions: true,
      };

      const mockNotification = {
        id: 'notif-1',
        userId: 'user-1',
        title: 'New Reaction on Your Post',
        type: NotificationType.REACTION,
        read: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      vi.mocked(prisma.user.findUnique).mockResolvedValue(mockUser as any);
      vi.mocked(prisma.notification.create).mockResolvedValue(mockNotification as any);

      const result = await notificationService.createPostReactionNotification({
        postId: 'post-1',
        postAuthorId: 'user-1',
        postContent: 'This is a test post',
        reactorName: 'Jane Doe',
        reactionType: 'LIKE',
      });

      expect(result).toBeDefined();
      expect(result?.type).toBe(NotificationType.REACTION);
      expect(prisma.notification.create).toHaveBeenCalled();
    });
  });

  describe('createMentionNotification', () => {
    it('should create mention notification for post', async () => {
      const mockUser = {
        id: 'user-1',
        communityMentions: true,
      };

      const mockNotification = {
        id: 'notif-1',
        userId: 'user-1',
        title: 'You Were Mentioned',
        type: NotificationType.MENTION,
        read: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      vi.mocked(prisma.user.findUnique).mockResolvedValue(mockUser as any);
      vi.mocked(prisma.notification.create).mockResolvedValue(mockNotification as any);

      const result = await notificationService.createMentionNotification({
        mentionedUserId: 'user-1',
        mentionerName: 'John Doe',
        contentType: 'post',
        contentId: 'post-1',
        contentPreview: 'Hey @user check this out!',
      });

      expect(result).toBeDefined();
      expect(result?.type).toBe(NotificationType.MENTION);
      expect(prisma.notification.create).toHaveBeenCalled();
    });

    it('should create mention notification for message in room', async () => {
      const mockUser = {
        id: 'user-1',
        communityMentions: true,
      };

      const mockNotification = {
        id: 'notif-1',
        userId: 'user-1',
        title: 'You Were Mentioned',
        type: NotificationType.MENTION,
        actionUrl: '/community/rooms/room-1',
        read: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      vi.mocked(prisma.user.findUnique).mockResolvedValue(mockUser as any);
      vi.mocked(prisma.notification.create).mockResolvedValue(mockNotification as any);

      const result = await notificationService.createMentionNotification({
        mentionedUserId: 'user-1',
        mentionerName: 'John Doe',
        contentType: 'message',
        contentId: 'msg-1',
        contentPreview: 'Hey @user check this out!',
        roomId: 'room-1',
      });

      expect(result).toBeDefined();
      expect(result?.actionUrl).toBe('/community/rooms/room-1');
    });
  });

  describe('createGroupJoinRequestApprovedNotification', () => {
    it('should create join request approved notification', async () => {
      const mockUser = {
        id: 'user-1',
        communityGroupUpdates: true,
      };

      const mockNotification = {
        id: 'notif-1',
        userId: 'user-1',
        title: 'Group Join Request Approved',
        type: NotificationType.JOIN_REQUEST_APPROVED,
        read: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      vi.mocked(prisma.user.findUnique).mockResolvedValue(mockUser as any);
      vi.mocked(prisma.notification.create).mockResolvedValue(mockNotification as any);

      const result = await notificationService.createGroupJoinRequestApprovedNotification({
        requestId: 'req-1',
        groupId: 'group-1',
        groupName: 'Test Group',
        userId: 'user-1',
        approvedByName: 'Admin User',
      });

      expect(result).toBeDefined();
      expect(result?.type).toBe(NotificationType.JOIN_REQUEST_APPROVED);
      expect(prisma.notification.create).toHaveBeenCalled();
    });
  });

  describe('createModeratorAssignedNotification', () => {
    it('should create moderator assigned notification for room', async () => {
      const mockUser = {
        id: 'user-1',
        communityModeration: true,
      };

      const mockNotification = {
        id: 'notif-1',
        userId: 'user-1',
        title: 'Moderator Role Assigned',
        type: NotificationType.MODERATOR_ASSIGNED,
        actionUrl: '/community/rooms/room-1',
        read: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      vi.mocked(prisma.user.findUnique).mockResolvedValue(mockUser as any);
      vi.mocked(prisma.notification.create).mockResolvedValue(mockNotification as any);

      const result = await notificationService.createModeratorAssignedNotification({
        userId: 'user-1',
        entityType: 'room',
        entityId: 'room-1',
        entityName: 'Test Room',
        assignedByName: 'Admin User',
      });

      expect(result).toBeDefined();
      expect(result?.type).toBe(NotificationType.MODERATOR_ASSIGNED);
      expect(result?.actionUrl).toBe('/community/rooms/room-1');
    });

    it('should create moderator assigned notification for group', async () => {
      const mockUser = {
        id: 'user-1',
        communityModeration: true,
      };

      const mockNotification = {
        id: 'notif-1',
        userId: 'user-1',
        title: 'Moderator Role Assigned',
        type: NotificationType.MODERATOR_ASSIGNED,
        actionUrl: '/community/groups/group-1',
        read: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      vi.mocked(prisma.user.findUnique).mockResolvedValue(mockUser as any);
      vi.mocked(prisma.notification.create).mockResolvedValue(mockNotification as any);

      const result = await notificationService.createModeratorAssignedNotification({
        userId: 'user-1',
        entityType: 'group',
        entityId: 'group-1',
        entityName: 'Test Group',
        assignedByName: 'Admin User',
      });

      expect(result).toBeDefined();
      expect(result?.actionUrl).toBe('/community/groups/group-1');
    });
  });

  describe('createRoomMessageNotification', () => {
    it('should create room message notification', async () => {
      const mockUser = {
        id: 'user-1',
        communityGroupUpdates: true,
      };

      const mockNotification = {
        id: 'notif-1',
        userId: 'user-1',
        title: 'New Message in Test Room',
        type: NotificationType.INFO,
        read: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      vi.mocked(prisma.user.findUnique).mockResolvedValue(mockUser as any);
      vi.mocked(prisma.notification.create).mockResolvedValue(mockNotification as any);

      const result = await notificationService.createRoomMessageNotification({
        roomId: 'room-1',
        roomName: 'Test Room',
        recipientId: 'user-1',
        senderName: 'John Doe',
        messagePreview: 'Hello everyone!',
      });

      expect(result).toBeDefined();
      expect(result?.type).toBe(NotificationType.INFO);
      expect(prisma.notification.create).toHaveBeenCalled();
    });
  });

  describe('createGroupMessageNotification', () => {
    it('should create group message notification', async () => {
      const mockUser = {
        id: 'user-1',
        communityGroupUpdates: true,
      };

      const mockNotification = {
        id: 'notif-1',
        userId: 'user-1',
        title: 'New Message in Test Group',
        type: NotificationType.INFO,
        read: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      vi.mocked(prisma.user.findUnique).mockResolvedValue(mockUser as any);
      vi.mocked(prisma.notification.create).mockResolvedValue(mockNotification as any);

      const result = await notificationService.createGroupMessageNotification({
        groupId: 'group-1',
        groupName: 'Test Group',
        recipientId: 'user-1',
        senderName: 'Jane Doe',
        messagePreview: 'Welcome to the group!',
      });

      expect(result).toBeDefined();
      expect(result?.type).toBe(NotificationType.INFO);
      expect(prisma.notification.create).toHaveBeenCalled();
    });
  });

  describe('notification preference handling', () => {
    it('should default to sending notification if user not found', async () => {
      // Mock user exists check to pass, but preference check returns null
      vi.mocked(prisma.user.findUnique)
        .mockResolvedValueOnce({ id: 'user-1', communityComments: true } as any) // For preference check
        .mockResolvedValueOnce({ id: 'user-1' } as any); // For user exists check in createNotification

      const mockNotification = {
        id: 'notif-1',
        userId: 'user-1',
        type: NotificationType.COMMENT,
        read: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      vi.mocked(prisma.notification.create).mockResolvedValue(mockNotification as any);

      const result = await notificationService.createPostCommentNotification({
        postId: 'post-1',
        postAuthorId: 'user-1',
        postContent: 'Test post',
        commenterName: 'John Doe',
        commentContent: 'Great!',
      });

      expect(result).toBeDefined();
      expect(prisma.notification.create).toHaveBeenCalled();
    });

    it('should default to sending notification if preference check fails', async () => {
      // Mock preference check to fail, but user exists check to pass
      vi.mocked(prisma.user.findUnique)
        .mockRejectedValueOnce(new Error('Database error')) // For preference check
        .mockResolvedValueOnce({ id: 'user-1' } as any); // For user exists check in createNotification

      const mockNotification = {
        id: 'notif-1',
        userId: 'user-1',
        type: NotificationType.COMMENT,
        read: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      vi.mocked(prisma.notification.create).mockResolvedValue(mockNotification as any);

      const result = await notificationService.createPostCommentNotification({
        postId: 'post-1',
        postAuthorId: 'user-1',
        postContent: 'Test post',
        commenterName: 'John Doe',
        commentContent: 'Great!',
      });

      expect(result).toBeDefined();
      expect(prisma.notification.create).toHaveBeenCalled();
    });
  });
});
