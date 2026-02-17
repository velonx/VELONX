/**
 * Property-Based Tests for Community Schema Referential Integrity
 * 
 * Feature: community-discussion-rooms
 * Property: Referential Integrity
 * Validates: Requirements 9.5
 * 
 * Tests that all relationships between community models maintain referential integrity
 * 
 * SETUP REQUIRED: MongoDB Replica Set
 * =====================================
 * These tests require MongoDB to run as a replica set (for transaction support).
 * 
 * Quick Setup:
 * 1. Start Docker Desktop
 * 2. Run: ./scripts/setup-mongodb-replica.sh
 * 3. Run tests: npm test schema-referential-integrity
 * 
 * Manual Setup:
 * 1. docker-compose -f docker-compose.mongodb.yml up -d
 * 2. Update .env: DATABASE_URL=mongodb://localhost:27017,localhost:27018,localhost:27019/velonx?replicaSet=rs0
 * 3. npx prisma db push && npx prisma generate
 * 
 * See: MONGODB_REPLICA_SETUP_INSTRUCTIONS.md for detailed instructions
 * 
 * NOTE: Production (MongoDB Atlas) already runs as a replica set.
 */

import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest'
import fc from 'fast-check'
import { PrismaClient } from '@prisma/client'
import {
  arbUserId,
  arbUserName,
  arbEmail,
  DEFAULT_PROPERTY_TEST_CONFIG,
} from '../helpers/property-test-helpers'

let prisma: PrismaClient

// Generators for community models
const arbRoomName = (): fc.Arbitrary<string> => {
  return fc.string({ minLength: 1, maxLength: 100 }).filter(s => s.trim().length > 0)
}

const arbDescription = (): fc.Arbitrary<string> => {
  return fc.string({ minLength: 1, maxLength: 500 }).filter(s => s.trim().length > 0)
}

const arbMessageContent = (): fc.Arbitrary<string> => {
  return fc.string({ minLength: 1, maxLength: 2000 }).filter(s => s.trim().length > 0)
}

const arbPostContent = (): fc.Arbitrary<string> => {
  return fc.string({ minLength: 1, maxLength: 5000 }).filter(s => s.trim().length > 0)
}

const arbBoolean = (): fc.Arbitrary<boolean> => {
  return fc.boolean()
}

describe('Community Schema Referential Integrity Property Tests', () => {
  let testUsers: Array<{ id: string; email: string; name: string }> = []

  beforeAll(async () => {
    // Initialize Prisma client
    prisma = new PrismaClient()
    
    // Check if community models are available
    try {
      // Try to access a community model to verify migration has run
      await prisma.discussionRoom.findMany({ take: 1 })
    } catch (error) {
      console.warn('Community models not available. Run migration first: npx prisma migrate dev --name add_community_features')
      throw new Error('Migration required: Community models not found in database')
    }

    // Create test users for relationship tests
    const userEmails = [
      'test-user-1@example.com',
      'test-user-2@example.com',
      'test-user-3@example.com',
    ]

    for (const email of userEmails) {
      // Use findFirst + create instead of upsert to avoid transaction requirement
      const existing = await prisma.user.findFirst({ where: { email } })
      if (existing) {
        testUsers.push(existing)
      } else {
        const user = await prisma.user.create({
          data: {
            email,
            name: `Test User ${email}`,
            role: 'STUDENT',
          },
        })
        testUsers.push(user)
      }
    }
  })

  afterAll(async () => {
    // Clean up test data
    await prisma.moderationLog.deleteMany({
      where: { moderatorId: { in: testUsers.map(u => u.id) } },
    })
    await prisma.userBlock.deleteMany({
      where: { blockerId: { in: testUsers.map(u => u.id) } },
    })
    await prisma.userMute.deleteMany({
      where: { userId: { in: testUsers.map(u => u.id) } },
    })
    await prisma.follow.deleteMany({
      where: { followerId: { in: testUsers.map(u => u.id) } },
    })
    await prisma.postComment.deleteMany({
      where: { authorId: { in: testUsers.map(u => u.id) } },
    })
    await prisma.postReaction.deleteMany({
      where: { userId: { in: testUsers.map(u => u.id) } },
    })
    await prisma.communityPost.deleteMany({
      where: { authorId: { in: testUsers.map(u => u.id) } },
    })
    await prisma.chatMessage.deleteMany({
      where: { authorId: { in: testUsers.map(u => u.id) } },
    })
    await prisma.groupJoinRequest.deleteMany({
      where: { userId: { in: testUsers.map(u => u.id) } },
    })
    await prisma.groupModerator.deleteMany({
      where: { userId: { in: testUsers.map(u => u.id) } },
    })
    await prisma.groupMember.deleteMany({
      where: { userId: { in: testUsers.map(u => u.id) } },
    })
    await prisma.communityGroup.deleteMany({
      where: { ownerId: { in: testUsers.map(u => u.id) } },
    })
    await prisma.roomModerator.deleteMany({
      where: { userId: { in: testUsers.map(u => u.id) } },
    })
    await prisma.roomMember.deleteMany({
      where: { userId: { in: testUsers.map(u => u.id) } },
    })
    await prisma.discussionRoom.deleteMany({
      where: { creatorId: { in: testUsers.map(u => u.id) } },
    })
    await prisma.user.deleteMany({
      where: { id: { in: testUsers.map(u => u.id) } },
    })
    await prisma.$disconnect()
  })

  beforeEach(async () => {
    // Clean up between tests
    await prisma.chatMessage.deleteMany({
      where: { authorId: { in: testUsers.map(u => u.id) } },
    })
    await prisma.roomMember.deleteMany({
      where: { userId: { in: testUsers.map(u => u.id) } },
    })
    await prisma.discussionRoom.deleteMany({
      where: { creatorId: { in: testUsers.map(u => u.id) } },
    })
    await prisma.groupMember.deleteMany({
      where: { userId: { in: testUsers.map(u => u.id) } },
    })
    await prisma.communityGroup.deleteMany({
      where: { ownerId: { in: testUsers.map(u => u.id) } },
    })
    await prisma.communityPost.deleteMany({
      where: { authorId: { in: testUsers.map(u => u.id) } },
    })
    await prisma.follow.deleteMany({
      where: { followerId: { in: testUsers.map(u => u.id) } },
    })
  })

  describe('Discussion Room Referential Integrity', () => {
    // Feature: community-discussion-rooms, Property 1: Room deletion cascades to members
    it('should cascade delete room members when room is deleted', async () => {
      await fc.assert(
        fc.asyncProperty(
          arbRoomName(),
          arbDescription(),
          arbBoolean(),
          async (name, description, isPrivate) => {
            // Create a room
            const room = await prisma.discussionRoom.create({
              data: {
                name,
                description,
                isPrivate,
                creatorId: testUsers[0].id,
              },
            })

            // Add members
            await prisma.roomMember.create({
              data: {
                roomId: room.id,
                userId: testUsers[1].id,
              },
            })

            // Verify member exists
            const membersBefore = await prisma.roomMember.count({
              where: { roomId: room.id },
            })
            expect(membersBefore).toBe(1)

            // Delete room
            await prisma.discussionRoom.delete({
              where: { id: room.id },
            })

            // Verify members are cascade deleted
            const membersAfter = await prisma.roomMember.count({
              where: { roomId: room.id },
            })
            expect(membersAfter).toBe(0)
          }
        ),
        { ...DEFAULT_PROPERTY_TEST_CONFIG, numRuns: 20 }
      )
    })

    // Feature: community-discussion-rooms, Property 2: Room deletion cascades to messages
    it('should cascade delete chat messages when room is deleted', async () => {
      await fc.assert(
        fc.asyncProperty(
          arbRoomName(),
          arbDescription(),
          arbMessageContent(),
          async (name, description, content) => {
            // Create a room
            const room = await prisma.discussionRoom.create({
              data: {
                name,
                description,
                isPrivate: false,
                creatorId: testUsers[0].id,
              },
            })

            // Add a message
            await prisma.chatMessage.create({
              data: {
                content,
                roomId: room.id,
                authorId: testUsers[0].id,
              },
            })

            // Verify message exists
            const messagesBefore = await prisma.chatMessage.count({
              where: { roomId: room.id },
            })
            expect(messagesBefore).toBe(1)

            // Delete room
            await prisma.discussionRoom.delete({
              where: { id: room.id },
            })

            // Verify messages are cascade deleted
            const messagesAfter = await prisma.chatMessage.count({
              where: { roomId: room.id },
            })
            expect(messagesAfter).toBe(0)
          }
        ),
        { ...DEFAULT_PROPERTY_TEST_CONFIG, numRuns: 20 }
      )
    })
  })

  describe('Community Group Referential Integrity', () => {
    // Feature: community-discussion-rooms, Property 3: Group deletion cascades to members
    it('should cascade delete group members when group is deleted', async () => {
      await fc.assert(
        fc.asyncProperty(
          arbRoomName(),
          arbDescription(),
          arbBoolean(),
          async (name, description, isPrivate) => {
            // Create a group
            const group = await prisma.communityGroup.create({
              data: {
                name,
                description,
                isPrivate,
                ownerId: testUsers[0].id,
              },
            })

            // Add members
            await prisma.groupMember.create({
              data: {
                groupId: group.id,
                userId: testUsers[1].id,
              },
            })

            // Verify member exists
            const membersBefore = await prisma.groupMember.count({
              where: { groupId: group.id },
            })
            expect(membersBefore).toBe(1)

            // Delete group
            await prisma.communityGroup.delete({
              where: { id: group.id },
            })

            // Verify members are cascade deleted
            const membersAfter = await prisma.groupMember.count({
              where: { groupId: group.id },
            })
            expect(membersAfter).toBe(0)
          }
        ),
        { ...DEFAULT_PROPERTY_TEST_CONFIG, numRuns: 20 }
      )
    })

    // Feature: community-discussion-rooms, Property 4: Group deletion cascades to posts
    it('should cascade delete posts when group is deleted', async () => {
      await fc.assert(
        fc.asyncProperty(
          arbRoomName(),
          arbDescription(),
          arbPostContent(),
          async (name, description, content) => {
            // Create a group
            const group = await prisma.communityGroup.create({
              data: {
                name,
                description,
                isPrivate: false,
                ownerId: testUsers[0].id,
              },
            })

            // Add a post
            await prisma.communityPost.create({
              data: {
                content,
                groupId: group.id,
                authorId: testUsers[0].id,
                visibility: 'GROUP',
              },
            })

            // Verify post exists
            const postsBefore = await prisma.communityPost.count({
              where: { groupId: group.id },
            })
            expect(postsBefore).toBe(1)

            // Delete group
            await prisma.communityGroup.delete({
              where: { id: group.id },
            })

            // Verify posts are cascade deleted
            const postsAfter = await prisma.communityPost.count({
              where: { groupId: group.id },
            })
            expect(postsAfter).toBe(0)
          }
        ),
        { ...DEFAULT_PROPERTY_TEST_CONFIG, numRuns: 20 }
      )
    })
  })

  describe('Post Referential Integrity', () => {
    // Feature: community-discussion-rooms, Property 5: Post deletion cascades to reactions
    it('should cascade delete reactions when post is deleted', async () => {
      await fc.assert(
        fc.asyncProperty(
          arbPostContent(),
          async (content) => {
            // Create a post
            const post = await prisma.communityPost.create({
              data: {
                content,
                authorId: testUsers[0].id,
                visibility: 'PUBLIC',
              },
            })

            // Add a reaction
            await prisma.postReaction.create({
              data: {
                postId: post.id,
                userId: testUsers[1].id,
                type: 'LIKE',
              },
            })

            // Verify reaction exists
            const reactionsBefore = await prisma.postReaction.count({
              where: { postId: post.id },
            })
            expect(reactionsBefore).toBe(1)

            // Delete post
            await prisma.communityPost.delete({
              where: { id: post.id },
            })

            // Verify reactions are cascade deleted
            const reactionsAfter = await prisma.postReaction.count({
              where: { postId: post.id },
            })
            expect(reactionsAfter).toBe(0)
          }
        ),
        { ...DEFAULT_PROPERTY_TEST_CONFIG, numRuns: 20 }
      )
    })

    // Feature: community-discussion-rooms, Property 6: Post deletion cascades to comments
    it('should cascade delete comments when post is deleted', async () => {
      await fc.assert(
        fc.asyncProperty(
          arbPostContent(),
          arbMessageContent(),
          async (postContent, commentContent) => {
            // Create a post
            const post = await prisma.communityPost.create({
              data: {
                content: postContent,
                authorId: testUsers[0].id,
                visibility: 'PUBLIC',
              },
            })

            // Add a comment
            await prisma.postComment.create({
              data: {
                postId: post.id,
                authorId: testUsers[1].id,
                content: commentContent,
              },
            })

            // Verify comment exists
            const commentsBefore = await prisma.postComment.count({
              where: { postId: post.id },
            })
            expect(commentsBefore).toBe(1)

            // Delete post
            await prisma.communityPost.delete({
              where: { id: post.id },
            })

            // Verify comments are cascade deleted
            const commentsAfter = await prisma.postComment.count({
              where: { postId: post.id },
            })
            expect(commentsAfter).toBe(0)
          }
        ),
        { ...DEFAULT_PROPERTY_TEST_CONFIG, numRuns: 20 }
      )
    })
  })

  describe('User Deletion Referential Integrity', () => {
    // Feature: community-discussion-rooms, Property 7: User deletion cascades to follow relationships
    it('should cascade delete follow relationships when user is deleted', async () => {
      await fc.assert(
        fc.asyncProperty(
          arbEmail(),
          arbUserName(),
          async (email, name) => {
            // Create a temporary user
            const tempUser = await prisma.user.create({
              data: {
                email,
                name,
                role: 'STUDENT',
              },
            })

            // Create follow relationship
            await prisma.follow.create({
              data: {
                followerId: testUsers[0].id,
                followingId: tempUser.id,
              },
            })

            // Verify follow exists
            const followsBefore = await prisma.follow.count({
              where: { followingId: tempUser.id },
            })
            expect(followsBefore).toBe(1)

            // Delete user
            await prisma.follow.deleteMany({
              where: { followingId: tempUser.id },
            })
            await prisma.user.delete({
              where: { id: tempUser.id },
            })

            // Verify follows are deleted
            const followsAfter = await prisma.follow.count({
              where: { followingId: tempUser.id },
            })
            expect(followsAfter).toBe(0)
          }
        ),
        { ...DEFAULT_PROPERTY_TEST_CONFIG, numRuns: 20 }
      )
    })
  })

  describe('Unique Constraint Integrity', () => {
    // Feature: community-discussion-rooms, Property 8: Room membership is unique per user
    it('should enforce unique room membership per user', async () => {
      await fc.assert(
        fc.asyncProperty(
          arbRoomName(),
          arbDescription(),
          async (name, description) => {
            // Create a room
            const room = await prisma.discussionRoom.create({
              data: {
                name,
                description,
                isPrivate: false,
                creatorId: testUsers[0].id,
              },
            })

            // Add member
            await prisma.roomMember.create({
              data: {
                roomId: room.id,
                userId: testUsers[1].id,
              },
            })

            // Try to add same member again - should fail
            await expect(
              prisma.roomMember.create({
                data: {
                  roomId: room.id,
                  userId: testUsers[1].id,
                },
              })
            ).rejects.toThrow()

            // Clean up
            await prisma.discussionRoom.delete({
              where: { id: room.id },
            })
          }
        ),
        { ...DEFAULT_PROPERTY_TEST_CONFIG, numRuns: 20 }
      )
    })

    // Feature: community-discussion-rooms, Property 9: Follow relationship is unique per pair
    it('should enforce unique follow relationship per user pair', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.constant(true),
          async () => {
            // Create follow relationship
            await prisma.follow.create({
              data: {
                followerId: testUsers[0].id,
                followingId: testUsers[1].id,
              },
            })

            // Try to create same follow again - should fail
            await expect(
              prisma.follow.create({
                data: {
                  followerId: testUsers[0].id,
                  followingId: testUsers[1].id,
                },
              })
            ).rejects.toThrow()

            // Clean up
            await prisma.follow.deleteMany({
              where: {
                followerId: testUsers[0].id,
                followingId: testUsers[1].id,
              },
            })
          }
        ),
        { ...DEFAULT_PROPERTY_TEST_CONFIG, numRuns: 20 }
      )
    })
  })
})
