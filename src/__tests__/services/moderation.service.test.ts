import { describe, it, expect, beforeEach, vi } from "vitest";
import { ModerationService } from "@/lib/services/moderation.service";
import { prisma } from "@/lib/prisma";
import { ValidationError, NotFoundError, AuthorizationError } from "@/lib/utils/errors";

// Mock Prisma
vi.mock("@/lib/prisma", () => ({
  prisma: {
    user: {
      findUnique: vi.fn(),
    },
    communityPost: {
      findUnique: vi.fn(),
    },
    chatMessage: {
      findUnique: vi.fn(),
    },
    discussionRoom: {
      findUnique: vi.fn(),
    },
    communityGroup: {
      findUnique: vi.fn(),
    },
    roomModerator: {
      findUnique: vi.fn(),
    },
    groupModerator: {
      findUnique: vi.fn(),
    },
    roomMember: {
      findUnique: vi.fn(),
    },
    groupMember: {
      findUnique: vi.fn(),
    },
    userMute: {
      findFirst: vi.fn(),
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
    moderationLog: {
      create: vi.fn(),
    },
  },
}));

describe("ModerationService", () => {
  let moderationService: ModerationService;

  beforeEach(() => {
    moderationService = new ModerationService();
    vi.clearAllMocks();
  });

  describe("flagContent", () => {
    it("should flag a post with valid moderator permissions", async () => {
      const mockModerator = { id: "mod-1" };
      const mockPost = {
        id: "post-1",
        groupId: "group-1",
        authorId: "user-1",
      };

      vi.mocked(prisma.user.findUnique).mockResolvedValue(mockModerator as any);
      vi.mocked(prisma.communityPost.findUnique).mockResolvedValue(mockPost as any);
      vi.mocked(prisma.groupModerator.findUnique).mockResolvedValue({
        id: "gm-1",
        groupId: "group-1",
        userId: "mod-1",
      } as any);
      vi.mocked(prisma.moderationLog.create).mockResolvedValue({} as any);

      await moderationService.flagContent("post-1", "POST", "mod-1", "Inappropriate content");

      expect(prisma.moderationLog.create).toHaveBeenCalledWith({
        data: {
          moderatorId: "mod-1",
          targetId: "post-1",
          type: "CONTENT_FLAG",
          reason: "Inappropriate content",
          metadata: {
            contentType: "POST",
            roomId: undefined,
            groupId: "group-1",
            authorId: "user-1",
          },
        },
      });
    });

    it("should flag a message with valid moderator permissions", async () => {
      const mockModerator = { id: "mod-1" };
      const mockMessage = {
        id: "msg-1",
        roomId: "room-1",
        groupId: null,
        authorId: "user-1",
      };

      vi.mocked(prisma.user.findUnique).mockResolvedValue(mockModerator as any);
      vi.mocked(prisma.chatMessage.findUnique).mockResolvedValue(mockMessage as any);
      vi.mocked(prisma.roomModerator.findUnique).mockResolvedValue({
        id: "rm-1",
        roomId: "room-1",
        userId: "mod-1",
      } as any);
      vi.mocked(prisma.moderationLog.create).mockResolvedValue({} as any);

      await moderationService.flagContent("msg-1", "MESSAGE", "mod-1");

      expect(prisma.moderationLog.create).toHaveBeenCalledWith({
        data: {
          moderatorId: "mod-1",
          targetId: "msg-1",
          type: "CONTENT_FLAG",
          reason: undefined,
          metadata: {
            contentType: "MESSAGE",
            roomId: "room-1",
            groupId: undefined,
            authorId: "user-1",
          },
        },
      });
    });

    it("should throw ValidationError when moderator does not exist", async () => {
      vi.mocked(prisma.user.findUnique).mockResolvedValue(null);

      await expect(
        moderationService.flagContent("post-1", "POST", "invalid-mod")
      ).rejects.toThrow(ValidationError);
      await expect(
        moderationService.flagContent("post-1", "POST", "invalid-mod")
      ).rejects.toThrow("Invalid moderatorId: User does not exist");
    });

    it("should throw NotFoundError when post does not exist", async () => {
      vi.mocked(prisma.user.findUnique).mockResolvedValue({ id: "mod-1" } as any);
      vi.mocked(prisma.communityPost.findUnique).mockResolvedValue(null);

      await expect(
        moderationService.flagContent("invalid-post", "POST", "mod-1")
      ).rejects.toThrow(NotFoundError);
      await expect(
        moderationService.flagContent("invalid-post", "POST", "mod-1")
      ).rejects.toThrow("Post not found");
    });

    it("should throw NotFoundError when message does not exist", async () => {
      vi.mocked(prisma.user.findUnique).mockResolvedValue({ id: "mod-1" } as any);
      vi.mocked(prisma.chatMessage.findUnique).mockResolvedValue(null);

      await expect(
        moderationService.flagContent("invalid-msg", "MESSAGE", "mod-1")
      ).rejects.toThrow(NotFoundError);
      await expect(
        moderationService.flagContent("invalid-msg", "MESSAGE", "mod-1")
      ).rejects.toThrow("Chat message not found");
    });

    it("should throw AuthorizationError when moderator lacks permissions for group", async () => {
      const mockModerator = { id: "mod-1" };
      const mockPost = {
        id: "post-1",
        groupId: "group-1",
        authorId: "user-1",
      };

      vi.mocked(prisma.user.findUnique).mockResolvedValue(mockModerator as any);
      vi.mocked(prisma.communityPost.findUnique).mockResolvedValue(mockPost as any);
      vi.mocked(prisma.groupModerator.findUnique).mockResolvedValue(null);

      await expect(
        moderationService.flagContent("post-1", "POST", "mod-1")
      ).rejects.toThrow(AuthorizationError);
      await expect(
        moderationService.flagContent("post-1", "POST", "mod-1")
      ).rejects.toThrow("You do not have moderator permissions for this group");
    });

    it("should throw AuthorizationError when moderator lacks permissions for room", async () => {
      const mockModerator = { id: "mod-1" };
      const mockMessage = {
        id: "msg-1",
        roomId: "room-1",
        groupId: null,
        authorId: "user-1",
      };

      vi.mocked(prisma.user.findUnique).mockResolvedValue(mockModerator as any);
      vi.mocked(prisma.chatMessage.findUnique).mockResolvedValue(mockMessage as any);
      vi.mocked(prisma.roomModerator.findUnique).mockResolvedValue(null);

      await expect(
        moderationService.flagContent("msg-1", "MESSAGE", "mod-1")
      ).rejects.toThrow(AuthorizationError);
      await expect(
        moderationService.flagContent("msg-1", "MESSAGE", "mod-1")
      ).rejects.toThrow("You do not have moderator permissions for this room");
    });
  });

  describe("muteUser", () => {
    it("should mute a user in a room with valid permissions", async () => {
      const mockUser = { id: "user-1" };
      const mockModerator = { id: "mod-1" };
      const mockRoom = { id: "room-1" };

      vi.mocked(prisma.user.findUnique)
        .mockResolvedValueOnce(mockUser as any)
        .mockResolvedValueOnce(mockModerator as any);
      vi.mocked(prisma.discussionRoom.findUnique).mockResolvedValue(mockRoom as any);
      vi.mocked(prisma.roomModerator.findUnique).mockResolvedValue({
        id: "rm-1",
        roomId: "room-1",
        userId: "mod-1",
      } as any);
      vi.mocked(prisma.roomMember.findUnique).mockResolvedValue({
        id: "member-1",
        roomId: "room-1",
        userId: "user-1",
      } as any);
      vi.mocked(prisma.userMute.findFirst).mockResolvedValue(null);
      vi.mocked(prisma.userMute.create).mockResolvedValue({} as any);
      vi.mocked(prisma.moderationLog.create).mockResolvedValue({} as any);

      await moderationService.muteUser("user-1", "room-1", undefined, "mod-1", 60, "Spam");

      expect(prisma.userMute.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          userId: "user-1",
          roomId: "room-1",
          groupId: undefined,
          mutedBy: "mod-1",
          reason: "Spam",
        }),
      });
      expect(prisma.moderationLog.create).toHaveBeenCalled();
    });

    it("should mute a user in a group with valid permissions", async () => {
      const mockUser = { id: "user-1" };
      const mockModerator = { id: "mod-1" };
      const mockGroup = { id: "group-1" };

      vi.mocked(prisma.user.findUnique)
        .mockResolvedValueOnce(mockUser as any)
        .mockResolvedValueOnce(mockModerator as any);
      vi.mocked(prisma.communityGroup.findUnique).mockResolvedValue(mockGroup as any);
      vi.mocked(prisma.groupModerator.findUnique).mockResolvedValue({
        id: "gm-1",
        groupId: "group-1",
        userId: "mod-1",
      } as any);
      vi.mocked(prisma.groupMember.findUnique).mockResolvedValue({
        id: "member-1",
        groupId: "group-1",
        userId: "user-1",
      } as any);
      vi.mocked(prisma.userMute.findFirst).mockResolvedValue(null);
      vi.mocked(prisma.userMute.create).mockResolvedValue({} as any);
      vi.mocked(prisma.moderationLog.create).mockResolvedValue({} as any);

      await moderationService.muteUser("user-1", undefined, "group-1", "mod-1", 30);

      expect(prisma.userMute.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          userId: "user-1",
          roomId: undefined,
          groupId: "group-1",
          mutedBy: "mod-1",
        }),
      });
    });

    it("should update existing mute if user is already muted", async () => {
      const mockUser = { id: "user-1" };
      const mockModerator = { id: "mod-1" };
      const mockRoom = { id: "room-1" };
      const existingMute = {
        id: "mute-1",
        userId: "user-1",
        roomId: "room-1",
        expiresAt: new Date(Date.now() + 60000),
      };

      vi.mocked(prisma.user.findUnique)
        .mockResolvedValueOnce(mockUser as any)
        .mockResolvedValueOnce(mockModerator as any);
      vi.mocked(prisma.discussionRoom.findUnique).mockResolvedValue(mockRoom as any);
      vi.mocked(prisma.roomModerator.findUnique).mockResolvedValue({
        id: "rm-1",
        roomId: "room-1",
        userId: "mod-1",
      } as any);
      vi.mocked(prisma.roomMember.findUnique).mockResolvedValue({
        id: "member-1",
        roomId: "room-1",
        userId: "user-1",
      } as any);
      vi.mocked(prisma.userMute.findFirst).mockResolvedValue(existingMute as any);
      vi.mocked(prisma.userMute.update).mockResolvedValue({} as any);
      vi.mocked(prisma.moderationLog.create).mockResolvedValue({} as any);

      await moderationService.muteUser("user-1", "room-1", undefined, "mod-1", 120);

      expect(prisma.userMute.update).toHaveBeenCalledWith({
        where: { id: "mute-1" },
        data: expect.objectContaining({
          mutedBy: "mod-1",
        }),
      });
    });

    it("should throw ValidationError when neither roomId nor groupId is specified", async () => {
      await expect(
        moderationService.muteUser("user-1", undefined, undefined, "mod-1", 60)
      ).rejects.toThrow(ValidationError);
      await expect(
        moderationService.muteUser("user-1", undefined, undefined, "mod-1", 60)
      ).rejects.toThrow("Either roomId or groupId must be specified");
    });

    it("should throw ValidationError when both roomId and groupId are specified", async () => {
      await expect(
        moderationService.muteUser("user-1", "room-1", "group-1", "mod-1", 60)
      ).rejects.toThrow(ValidationError);
      await expect(
        moderationService.muteUser("user-1", "room-1", "group-1", "mod-1", 60)
      ).rejects.toThrow("Cannot specify both roomId and groupId");
    });

    it("should throw ValidationError when duration is not positive", async () => {
      await expect(
        moderationService.muteUser("user-1", "room-1", undefined, "mod-1", 0)
      ).rejects.toThrow(ValidationError);
      await expect(
        moderationService.muteUser("user-1", "room-1", undefined, "mod-1", -10)
      ).rejects.toThrow("Duration must be a positive number");
    });

    it("should throw NotFoundError when user does not exist", async () => {
      vi.mocked(prisma.user.findUnique)
        .mockResolvedValueOnce(null) // First call for user - returns null
        .mockResolvedValueOnce({ id: "mod-1" } as any); // Second call for moderator

      await expect(
        moderationService.muteUser("invalid-user", "room-1", undefined, "mod-1", 60)
      ).rejects.toThrow(NotFoundError);
    });

    it("should throw ValidationError when trying to mute yourself", async () => {
      vi.mocked(prisma.user.findUnique)
        .mockResolvedValueOnce({ id: "mod-1" } as any)
        .mockResolvedValueOnce({ id: "mod-1" } as any);

      await expect(
        moderationService.muteUser("mod-1", "room-1", undefined, "mod-1", 60)
      ).rejects.toThrow(ValidationError);
      await expect(
        moderationService.muteUser("mod-1", "room-1", undefined, "mod-1", 60)
      ).rejects.toThrow("Cannot mute yourself");
    });

    it("should throw NotFoundError when room does not exist", async () => {
      vi.mocked(prisma.user.findUnique)
        .mockResolvedValueOnce({ id: "user-1" } as any)
        .mockResolvedValueOnce({ id: "mod-1" } as any);
      vi.mocked(prisma.discussionRoom.findUnique).mockResolvedValue(null);

      await expect(
        moderationService.muteUser("user-1", "invalid-room", undefined, "mod-1", 60)
      ).rejects.toThrow(NotFoundError);
      await expect(
        moderationService.muteUser("user-1", "invalid-room", undefined, "mod-1", 60)
      ).rejects.toThrow("Discussion room not found");
    });

    it("should throw AuthorizationError when moderator lacks permissions", async () => {
      vi.mocked(prisma.user.findUnique)
        .mockResolvedValueOnce({ id: "user-1" } as any)
        .mockResolvedValueOnce({ id: "mod-1" } as any);
      vi.mocked(prisma.discussionRoom.findUnique).mockResolvedValue({ id: "room-1" } as any);
      vi.mocked(prisma.roomModerator.findUnique).mockResolvedValue(null);

      await expect(
        moderationService.muteUser("user-1", "room-1", undefined, "mod-1", 60)
      ).rejects.toThrow(AuthorizationError);
      await expect(
        moderationService.muteUser("user-1", "room-1", undefined, "mod-1", 60)
      ).rejects.toThrow("You do not have moderator permissions for this room");
    });

    it("should throw ValidationError when user is not a member of the room", async () => {
      vi.mocked(prisma.user.findUnique)
        .mockResolvedValueOnce({ id: "user-1" } as any)
        .mockResolvedValueOnce({ id: "mod-1" } as any);
      vi.mocked(prisma.discussionRoom.findUnique).mockResolvedValue({ id: "room-1" } as any);
      vi.mocked(prisma.roomModerator.findUnique).mockResolvedValue({
        id: "rm-1",
        roomId: "room-1",
        userId: "mod-1",
      } as any);
      vi.mocked(prisma.roomMember.findUnique).mockResolvedValue(null);

      await expect(
        moderationService.muteUser("user-1", "room-1", undefined, "mod-1", 60)
      ).rejects.toThrow(ValidationError);
      await expect(
        moderationService.muteUser("user-1", "room-1", undefined, "mod-1", 60)
      ).rejects.toThrow("User is not a member of this room");
    });
  });

  describe("unmuteUser", () => {
    it("should unmute a user with valid permissions", async () => {
      const mockMute = {
        id: "mute-1",
        userId: "user-1",
        roomId: "room-1",
        groupId: null,
      };

      vi.mocked(prisma.userMute.findUnique).mockResolvedValue(mockMute as any);
      vi.mocked(prisma.roomModerator.findUnique).mockResolvedValue({
        id: "rm-1",
        roomId: "room-1",
        userId: "mod-1",
      } as any);
      vi.mocked(prisma.userMute.delete).mockResolvedValue({} as any);
      vi.mocked(prisma.moderationLog.create).mockResolvedValue({} as any);

      await moderationService.unmuteUser("mute-1", "mod-1");

      expect(prisma.userMute.delete).toHaveBeenCalledWith({
        where: { id: "mute-1" },
      });
      expect(prisma.moderationLog.create).toHaveBeenCalled();
    });

    it("should throw NotFoundError when mute record does not exist", async () => {
      vi.mocked(prisma.userMute.findUnique).mockResolvedValue(null);

      await expect(moderationService.unmuteUser("invalid-mute", "mod-1")).rejects.toThrow(
        NotFoundError
      );
      await expect(moderationService.unmuteUser("invalid-mute", "mod-1")).rejects.toThrow(
        "Mute record not found"
      );
    });

    it("should throw AuthorizationError when moderator lacks permissions for room", async () => {
      const mockMute = {
        id: "mute-1",
        userId: "user-1",
        roomId: "room-1",
        groupId: null,
      };

      vi.mocked(prisma.userMute.findUnique).mockResolvedValue(mockMute as any);
      vi.mocked(prisma.roomModerator.findUnique).mockResolvedValue(null);

      await expect(moderationService.unmuteUser("mute-1", "mod-1")).rejects.toThrow(
        AuthorizationError
      );
      await expect(moderationService.unmuteUser("mute-1", "mod-1")).rejects.toThrow(
        "You do not have moderator permissions for this room"
      );
    });

    it("should throw AuthorizationError when moderator lacks permissions for group", async () => {
      const mockMute = {
        id: "mute-1",
        userId: "user-1",
        roomId: null,
        groupId: "group-1",
      };

      vi.mocked(prisma.userMute.findUnique).mockResolvedValue(mockMute as any);
      vi.mocked(prisma.groupModerator.findUnique).mockResolvedValue(null);

      await expect(moderationService.unmuteUser("mute-1", "mod-1")).rejects.toThrow(
        AuthorizationError
      );
      await expect(moderationService.unmuteUser("mute-1", "mod-1")).rejects.toThrow(
        "You do not have moderator permissions for this group"
      );
    });
  });

  describe("isUserMuted", () => {
    it("should return true when user is muted in a room", async () => {
      const mockMute = {
        id: "mute-1",
        userId: "user-1",
        roomId: "room-1",
        expiresAt: new Date(Date.now() + 60000),
      };

      vi.mocked(prisma.userMute.findFirst).mockResolvedValue(mockMute as any);

      const result = await moderationService.isUserMuted("user-1", "room-1");

      expect(result).toBe(true);
    });

    it("should return true when user is muted in a group", async () => {
      const mockMute = {
        id: "mute-1",
        userId: "user-1",
        groupId: "group-1",
        expiresAt: new Date(Date.now() + 60000),
      };

      vi.mocked(prisma.userMute.findFirst).mockResolvedValue(mockMute as any);

      const result = await moderationService.isUserMuted("user-1", undefined, "group-1");

      expect(result).toBe(true);
    });

    it("should return false when user is not muted", async () => {
      vi.mocked(prisma.userMute.findFirst).mockResolvedValue(null);

      const result = await moderationService.isUserMuted("user-1", "room-1");

      expect(result).toBe(false);
    });

    it("should return false when mute has expired", async () => {
      vi.mocked(prisma.userMute.findFirst).mockResolvedValue(null);

      const result = await moderationService.isUserMuted("user-1", "room-1");

      expect(result).toBe(false);
    });
  });

  describe("logModerationAction", () => {
    it("should create a moderation log entry", async () => {
      vi.mocked(prisma.moderationLog.create).mockResolvedValue({} as any);

      await moderationService.logModerationAction(
        "USER_MUTE",
        "mod-1",
        "user-1",
        "Spam",
        { duration: 60 }
      );

      expect(prisma.moderationLog.create).toHaveBeenCalledWith({
        data: {
          moderatorId: "mod-1",
          targetId: "user-1",
          type: "USER_MUTE",
          reason: "Spam",
          metadata: { duration: 60 },
        },
      });
    });

    it("should create a log entry without reason or metadata", async () => {
      vi.mocked(prisma.moderationLog.create).mockResolvedValue({} as any);

      await moderationService.logModerationAction("CONTENT_FLAG", "mod-1", "post-1");

      expect(prisma.moderationLog.create).toHaveBeenCalledWith({
        data: {
          moderatorId: "mod-1",
          targetId: "post-1",
          type: "CONTENT_FLAG",
          reason: undefined,
          metadata: undefined,
        },
      });
    });
  });
});
