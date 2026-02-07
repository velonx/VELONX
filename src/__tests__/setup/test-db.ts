/**
 * Test Database Configuration
 * 
 * Utilities for setting up and tearing down test database
 */

import { PrismaClient } from '@prisma/client'

let prisma: PrismaClient | null = null

/**
 * Get or create Prisma client for testing
 */
export function getTestPrisma(): PrismaClient {
  if (!prisma) {
    prisma = new PrismaClient({
      datasources: {
        db: {
          url: process.env.TEST_DATABASE_URL || process.env.DATABASE_URL,
        },
      },
    })
  }
  return prisma
}

/**
 * Setup test database - run before tests
 */
export async function setupTestDatabase(): Promise<void> {
  const testPrisma = getTestPrisma()
  
  try {
    // Connect to database
    await testPrisma.$connect()
    
    // Clean up existing test data
    await cleanupTestDatabase()
  } catch (error) {
    console.error('Failed to setup test database:', error)
    throw error
  }
}

/**
 * Cleanup test database - run after tests
 */
export async function cleanupTestDatabase(): Promise<void> {
  const testPrisma = getTestPrisma()
  
  try {
    // Delete test data in correct order to respect foreign key constraints
    // Skip models that require transactions if not in replica set mode
    try {
      await testPrisma.auditLog.deleteMany({})
    } catch (e) {
      // Skip if replica set not configured
    }
    
    await testPrisma.notification.deleteMany({})
    await testPrisma.mentorSession.deleteMany({})
    await testPrisma.projectMember.deleteMany({})
    await testPrisma.projectJoinRequest.deleteMany({})
    await testPrisma.project.deleteMany({})
    await testPrisma.eventAttendee.deleteMany({})
    await testPrisma.event.deleteMany({})
    await testPrisma.meetingAttendee.deleteMany({})
    await testPrisma.meeting.deleteMany({})
    await testPrisma.mockInterview.deleteMany({})
    await testPrisma.careerOpportunity.deleteMany({})
    await testPrisma.resource.deleteMany({})
    await testPrisma.blogPost.deleteMany({})
    await testPrisma.user.deleteMany({})
  } catch (error) {
    console.error('Failed to cleanup test database:', error)
    throw error
  }
}

/**
 * Disconnect from test database
 */
export async function disconnectTestDatabase(): Promise<void> {
  if (prisma) {
    await prisma.$disconnect()
    prisma = null
  }
}

/**
 * Create a transaction for isolated test execution
 */
export async function withTestTransaction<T>(
  callback: (tx: PrismaClient) => Promise<T>
): Promise<T> {
  const testPrisma = getTestPrisma()
  
  return testPrisma.$transaction(async (tx) => {
    return callback(tx as PrismaClient)
  })
}
