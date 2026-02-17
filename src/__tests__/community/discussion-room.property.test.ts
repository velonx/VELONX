/**
 * Property-Based Tests for Discussion Room Operations
 * 
 * Tests correctness properties for discussion room service
 */

import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest'
import fc from 'fast-check'
import { discussionRoomService } from '@/lib/services/discussion-room.service'
import { prisma } from '@/lib/prisma'
import {
  arbUserId,
  arbUserName,
  arbEmail,
  DEFAULT_PROPERTY_TEST_CONFIG,
} from '../helpers/property-test-helpers'

// Generator for room data
const arbRoomData = () => fc.record({
  name: fc.string({ minLength: 1, maxLength: 100 }).filter(s => s.trim().length > 0),
  description: fc.string({ minLength: 1, maxLength: 500 }).filter(s => s.trim().length > 0),
  isPrivate: fc.boolean(),
  imageUrl: fc.option(fc.webUrl(), { nil: undefined }),
})

// Generator for user data
const arbUserData = () => fc.record({
  id: arbUserId(),
  name: arbUserName(),
  email: arbEmail(),
  role: fc.constantFrom('STUDENT' as const, 'ADMIN' as const),
})

describe('Discussion Room Property Tests', () => {
  beforeAll(async () => {
    await prisma.$connect()
  })

  afterAll(async () => {
    await prisma.$disconnect()
  })

  beforeEach(async () => {
    // Clean up test data before each test
    // Note: deleteMany operations may fail if MongoDB is not in replica set mode
    // In that case, tests will use unique IDs to avoid conflicts
    try {
      await prisma.roomModerator.deleteMany({})
      await prisma.roomMember.deleteMany({})
      await prisma.chatMessage.deleteMany({ where: { roomId: { not: null } } })
      await prisma.discussionRoom.deleteMany({})
      await prisma.user.deleteMany({})
    } catch (error) {
      // Skip cleanup if replica set not configured
      console.log('Skipping cleanup - MongoDB replica set not configured')
    }
  })

  describe('Property 1: Room Creation Completeness', () => {
    // Feature: community-discussion-rooms, Property 1: Room Creation Completeness
    it('should create room with all required fields and creator as moderator', async () => {
      await fc.assert(
        fc.asyncProperty(
          arbUserData(),
          arbRoomData(),
          async (userData, roomData) => {
            // Create user first
            const user = await prisma.user.create({
              data: {
                id: userData.id,
                name: userData.name,
                email: userData.email,
                role: userData.role,
              },
            })

            // Create room
            const room = await discussionRoomService.createRoom(roomData, user.id)

            // Verify room has all required fields
            expect(room.id).toBeDefined()
            expect(room.name).toBe(roomData.name.trim())
            expect(room.description).toBe(roomData.description.trim())
            expect(room.isPrivate).toBe(roomData.isPrivate)
            expect(room.creatorId).toBe(user.id)
            expect(room.createdAt).toBeInstanceOf(Date)
            expect(room.updatedAt).toBeInstanceOf(Date)

            // Verify creator is a moderator
            const isModerator = await discussionRoomService.isUserModerator(room.id, user.id)
            expect(isModerator).toBe(true)

            // Verify creator is a member
            const isMember = await discussionRoomService.isUserMember(room.id, user.id)
            expect(isMember).toBe(true)
          }
        ),
        DEFAULT_PROPERTY_TEST_CONFIG
      )
    })
  })

  describe('Property 2: Membership Addition and Removal', () => {
    // Feature: community-discussion-rooms, Property 2: Membership Addition and Removal
    it('should add user to member list on join and remove on leave', async () => {
      await fc.assert(
        fc.asyncProperty(
          arbUserData(),
          arbUserData(),
          arbRoomData(),
          async (creatorData, memberData, roomData) => {
            // Ensure users have different IDs
            fc.pre(creatorData.id !== memberData.id)
            fc.pre(creatorData.email !== memberData.email)

            // Create users
            const creator = await prisma.user.create({
              data: {
                id: creatorData.id,
                name: creatorData.name,
                email: creatorData.email,
                role: creatorData.role,
              },
            })

            const member = await prisma.user.create({
              data: {
                id: memberData.id,
                name: memberData.name,
                email: memberData.email,
                role: memberData.role,
              },
            })

            // Create room
            const room = await discussionRoomService.createRoom(roomData, creator.id)

            // Initially, member should not be in the room
            const isInitiallyMember = await discussionRoomService.isUserMember(room.id, member.id)
            expect(isInitiallyMember).toBe(false)

            // Join room
            await discussionRoomService.joinRoom(room.id, member.id)

            // After joining, member should be in the room
            const isAfterJoin = await discussionRoomService.isUserMember(room.id, member.id)
            expect(isAfterJoin).toBe(true)

            // Member should appear in member list
            const members = await discussionRoomService.getRoomMembers(room.id)
            const memberIds = members.map(m => m.id)
            expect(memberIds).toContain(member.id)

            // Leave room
            await discussionRoomService.leaveRoom(room.id, member.id)

            // After leaving, member should not be in the room
            const isAfterLeave = await discussionRoomService.isUserMember(room.id, member.id)
            expect(isAfterLeave).toBe(false)

            // Member should not appear in member list
            const membersAfterLeave = await discussionRoomService.getRoomMembers(room.id)
            const memberIdsAfterLeave = membersAfterLeave.map(m => m.id)
            expect(memberIdsAfterLeave).not.toContain(member.id)
          }
        ),
        DEFAULT_PROPERTY_TEST_CONFIG
      )
    })
  })

  describe('Property 6: Moderator Permission Assignment (partial)', () => {
    // Feature: community-discussion-rooms, Property 6: Moderator Permission Assignment (partial)
    it('should grant moderator status to creator and allow moderation actions', async () => {
      await fc.assert(
        fc.asyncProperty(
          arbUserData(),
          arbUserData(),
          arbUserData(),
          arbRoomData(),
          async (creatorData, moderatorData, memberData, roomData) => {
            // Ensure users have different IDs and emails
            fc.pre(creatorData.id !== moderatorData.id && creatorData.id !== memberData.id && moderatorData.id !== memberData.id)
            fc.pre(creatorData.email !== moderatorData.email && creatorData.email !== memberData.email && moderatorData.email !== memberData.email)

            // Create users
            const creator = await prisma.user.create({
              data: {
                id: creatorData.id,
                name: creatorData.name,
                email: creatorData.email,
                role: creatorData.role,
              },
            })

            const moderator = await prisma.user.create({
              data: {
                id: moderatorData.id,
                name: moderatorData.name,
                email: moderatorData.email,
                role: moderatorData.role,
              },
            })

            const member = await prisma.user.create({
              data: {
                id: memberData.id,
                name: memberData.name,
                email: memberData.email,
                role: memberData.role,
              },
            })

            // Create room
            const room = await discussionRoomService.createRoom(roomData, creator.id)

            // Creator should have moderator status
            const creatorIsModerator = await discussionRoomService.isUserModerator(room.id, creator.id)
            expect(creatorIsModerator).toBe(true)

            // Add moderator as member and moderator
            await discussionRoomService.joinRoom(room.id, moderator.id)
            await prisma.roomModerator.create({
              data: {
                roomId: room.id,
                userId: moderator.id,
              },
            })

            // Moderator should have moderator status
            const moderatorIsModerator = await discussionRoomService.isUserModerator(room.id, moderator.id)
            expect(moderatorIsModerator).toBe(true)

            // Add member to room
            await discussionRoomService.joinRoom(room.id, member.id)

            // Moderator should be able to kick member
            await discussionRoomService.kickMember(room.id, member.id, moderator.id)

            // Member should no longer be in room
            const memberIsStillMember = await discussionRoomService.isUserMember(room.id, member.id)
            expect(memberIsStillMember).toBe(false)
          }
        ),
        DEFAULT_PROPERTY_TEST_CONFIG
      )
    })
  })
})
