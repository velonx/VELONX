import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { feedService, FeedQuery } from "@/lib/services/feed.service";
import { prisma } from "@/lib/prisma";
import { NotFoundError, ValidationError, AuthorizationError } from "@/lib/utils/errors";

describe("FeedService", () => {
  let testUser: any;
  let testUser2: any;
  let testGroup: any;
  let testPost: any;

  beforeEach(async () => {
    // Create test users
    testUser = await prisma.user.create({
      data: {
        email: "feedtest@example.com",
        name: "Feed Test User",
        role: "STUDENT",
      },
    });

    testUser2 = await prisma.user.create({
      data: {
        email: "feedtest2@example.com",
        name: "Feed Test User 2",
        role: "STUDENT",
      },
    });

    // Create test group
    testGroup = await prisma.communityGroup.create({
      data: {
        name: "Test Group",
        description: "Test group for feed",
        isPrivate: false,
        ownerId: testUser.id,
      },
    });

    // Add user as member
    await prisma.groupMember.create({
      data: {
        groupId: testGroup.id,
        userId: testUser.id,
      },
    });

    // Create test post
    testPost = await prisma.communityPost.create({
      data: {
        content: "Test post content",
        authorId: testUser.id,
        visibility: "PUBLIC",
        imageUrls: [],
        linkUrls: [],
      },
    });
  });

  afterEach(async () => {
    // Clean up test data
    await prisma.communityPost.deleteMany({
      where: { authorId: { in: [testUser.id, testUser2.id] } },
    });
    await prisma.groupMember.deleteMany({
      where: { groupId: testGroup.id },
    });
    await prisma.communityGroup.deleteMany({
      where: { id: testGroup.id },
    });
    await prisma.follow.deleteMany({
      where: { OR: [{ followerId: testUser.id }, { followingId: testUser.id }] },
    });
    await prisma.user.deleteMany({
      where: { id: { in: [testUser.id, testUser2.id] } },
    });
  });

  describe("getUserFeed", () => {
    it("should return user feed with public posts", async () => {
      const feed = await feedService.getUserFeed(testUser.id);

      expect(feed).toBeDefined();
      expect(Array.isArray(feed)).toBe(true);
      expect(feed.length).toBeGreaterThan(0);
      expect(feed[0].type).toBe("POST");
      expect(feed[0].post.id).toBe(testPost.id);
    });

    it("should throw NotFoundError for non-existent user", async () => {
      await expect(
        feedService.getUserFeed("non-existent-id")
      ).rejects.toThrow(NotFoundError);
    });

    it("should respect limit parameter", async () => {
      // Create multiple posts
      await prisma.communityPost.create({
        data: {
          content: "Test post 2",
          authorId: testUser.id,
          visibility: "PUBLIC",
          imageUrls: [],
          linkUrls: [],
        },
      });

      const feed = await feedService.getUserFeed(testUser.id, { limit: 1 });

      expect(feed.length).toBeLessThanOrEqual(1);
    });

    it("should filter by FOLLOWING", async () => {
      // Create follow relationship
      await prisma.follow.create({
        data: {
          followerId: testUser.id,
          followingId: testUser2.id,
        },
      });

      // Create post by followed user
      await prisma.communityPost.create({
        data: {
          content: "Post by followed user",
          authorId: testUser2.id,
          visibility: "PUBLIC",
          imageUrls: [],
          linkUrls: [],
        },
      });

      const feed = await feedService.getUserFeed(testUser.id, { filter: "FOLLOWING" });

      expect(feed).toBeDefined();
      expect(Array.isArray(feed)).toBe(true);
    });

    it("should filter by GROUPS", async () => {
      // Create group post
      await prisma.communityPost.create({
        data: {
          content: "Group post",
          authorId: testUser.id,
          groupId: testGroup.id,
          visibility: "GROUP",
          imageUrls: [],
          linkUrls: [],
        },
      });

      const feed = await feedService.getUserFeed(testUser.id, { filter: "GROUPS" });

      expect(feed).toBeDefined();
      expect(Array.isArray(feed)).toBe(true);
    });

    it("should exclude blocked users from feed", async () => {
      // Create block relationship
      await prisma.userBlock.create({
        data: {
          blockerId: testUser.id,
          blockedId: testUser2.id,
        },
      });

      // Create post by blocked user
      await prisma.communityPost.create({
        data: {
          content: "Post by blocked user",
          authorId: testUser2.id,
          visibility: "PUBLIC",
          imageUrls: [],
          linkUrls: [],
        },
      });

      const feed = await feedService.getUserFeed(testUser.id);

      // Feed should not contain posts from blocked user
      const blockedUserPosts = feed.filter((item) => item.post.authorId === testUser2.id);
      expect(blockedUserPosts.length).toBe(0);
    });
  });

  describe("getGroupFeed", () => {
    it("should return group feed for member", async () => {
      // Create group post
      const groupPost = await prisma.communityPost.create({
        data: {
          content: "Group post",
          authorId: testUser.id,
          groupId: testGroup.id,
          visibility: "GROUP",
          imageUrls: [],
          linkUrls: [],
        },
      });

      const feed = await feedService.getGroupFeed(testGroup.id, testUser.id);

      expect(feed).toBeDefined();
      expect(Array.isArray(feed)).toBe(true);
      expect(feed.length).toBeGreaterThan(0);
      expect(feed[0].post.id).toBe(groupPost.id);
    });

    it("should throw NotFoundError for non-existent group", async () => {
      await expect(
        feedService.getGroupFeed("non-existent-id", testUser.id)
      ).rejects.toThrow(NotFoundError);
    });

    it("should throw AuthorizationError for non-member accessing private group", async () => {
      // Make group private
      await prisma.communityGroup.update({
        where: { id: testGroup.id },
        data: { isPrivate: true },
      });

      await expect(
        feedService.getGroupFeed(testGroup.id, testUser2.id)
      ).rejects.toThrow(AuthorizationError);
    });
  });

  describe("getTrendingPosts", () => {
    it("should return trending posts", async () => {
      const trending = await feedService.getTrendingPosts();

      expect(trending).toBeDefined();
      expect(Array.isArray(trending)).toBe(true);
    });

    it("should respect limit parameter", async () => {
      const trending = await feedService.getTrendingPosts(5);

      expect(trending.length).toBeLessThanOrEqual(5);
    });

    it("should only return public posts", async () => {
      // Create private post
      await prisma.communityPost.create({
        data: {
          content: "Private post",
          authorId: testUser.id,
          visibility: "FOLLOWERS",
          imageUrls: [],
          linkUrls: [],
        },
      });

      const trending = await feedService.getTrendingPosts();

      // All trending posts should be public
      const privatePosts = trending.filter((item) => item.post.visibility !== "PUBLIC");
      expect(privatePosts.length).toBe(0);
    });
  });

  describe("searchContent", () => {
    it("should search posts, rooms, and groups", async () => {
      // Create searchable content
      await prisma.discussionRoom.create({
        data: {
          name: "Searchable Room",
          description: "Room for search testing",
          isPrivate: false,
          creatorId: testUser.id,
        },
      });

      const results = await feedService.searchContent("Searchable", testUser.id);

      expect(results).toBeDefined();
      expect(results.posts).toBeDefined();
      expect(results.rooms).toBeDefined();
      expect(results.groups).toBeDefined();
      expect(Array.isArray(results.posts)).toBe(true);
      expect(Array.isArray(results.rooms)).toBe(true);
      expect(Array.isArray(results.groups)).toBe(true);
    });

    it("should throw ValidationError for empty query", async () => {
      await expect(
        feedService.searchContent("", testUser.id)
      ).rejects.toThrow(ValidationError);
    });

    it("should throw ValidationError for query exceeding max length", async () => {
      const longQuery = "a".repeat(101);
      await expect(
        feedService.searchContent(longQuery, testUser.id)
      ).rejects.toThrow(ValidationError);
    });

    it("should exclude blocked users from search results", async () => {
      // Create block relationship
      await prisma.userBlock.create({
        data: {
          blockerId: testUser.id,
          blockedId: testUser2.id,
        },
      });

      // Create post by blocked user
      await prisma.communityPost.create({
        data: {
          content: "Searchable post by blocked user",
          authorId: testUser2.id,
          visibility: "PUBLIC",
          imageUrls: [],
          linkUrls: [],
        },
      });

      const results = await feedService.searchContent("Searchable", testUser.id);

      // Results should not contain posts from blocked user
      const blockedUserPosts = results.posts.filter((post) => post.authorId === testUser2.id);
      expect(blockedUserPosts.length).toBe(0);
    });
  });
});
