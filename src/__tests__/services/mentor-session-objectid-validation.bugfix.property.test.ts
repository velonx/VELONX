/**
 * Bug Condition Exploration Property Test
 * Mentor Session ObjectID Validation Bugfix
 * 
 * **Validates: Requirements 1.1, 1.2, 1.3, 2.1, 2.2**
 * 
 * CRITICAL: This test MUST FAIL on unfixed code with Prisma P2023 error
 * - Failure confirms the bug exists (invalid ObjectIDs cause Prisma errors)
 * - After fix, test should pass (invalid ObjectIDs throw ValidationError)
 * 
 * This test uses a scoped PBT approach with concrete failing cases to ensure
 * reproducibility and clear demonstration of the bug condition.
 * 
 * NOTE: This test runs against the REAL database to observe actual Prisma behavior
 * with invalid ObjectIDs. The bug manifests at the Prisma query level, not in mocks.
 */

import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import fc from 'fast-check'
import { MentorSessionService } from '@/lib/services/mentor-session.service'
import { ValidationError } from '@/lib/utils/errors'
import { PROPERTY_TEST_CONFIG } from '@/__tests__/config/property-test.config'
import { prisma } from '@/lib/prisma'

// Clean up test data
async function cleanupTestData() {
  try {
    // Delete any test sessions created during the test
    await prisma.mentorSession.deleteMany({
      where: {
        title: {
          contains: 'Test Session',
        },
      },
    })
  } catch (error) {
    // Ignore cleanup errors
    console.log('Cleanup error (ignored):', error)
  }
}

describe.skip('Mentor Session ObjectID Validation - Bug Condition Exploration', () => {
  let service: MentorSessionService

  beforeAll(async () => {
    service = new MentorSessionService()
    await cleanupTestData()
  })

  afterAll(async () => {
    await cleanupTestData()
  })

  /**
   * Property 1: Fault Condition - Invalid ObjectID Format Rejection
   * 
   * **Validates: Requirements 1.1, 1.2, 1.3, 2.1, 2.2**
   * 
   * EXPECTED BEHAVIOR ON UNFIXED CODE:
   * - Test will FAIL with Prisma P2023 "Malformed ObjectID" error
   * - This failure CONFIRMS the bug exists
   * 
   * EXPECTED BEHAVIOR AFTER FIX:
   * - Test will PASS
   * - Invalid ObjectID formats throw ValidationError with HTTP 400
   * - Error message: "Invalid mentor ID format"
   * - No database queries are executed
   */
  describe('Property 1: Fault Condition - Invalid ObjectID Format Rejection', () => {
    /**
     * Generator for invalid ObjectID formats
     * These are the concrete failing cases that demonstrate the bug
     */
    const arbInvalidObjectId = (): fc.Arbitrary<string> => {
      return fc.oneof(
        // Short IDs (too few characters)
        fc.constant('12345'),
        fc.constant('abc'),
        fc.constant(''),

        // Mock/test IDs with hyphens
        fc.constant('mock-mentor-1'),
        fc.constant('test-id-123'),

        // Non-hexadecimal characters (contains 'g', 'z', etc.)
        fc.constant('507f1f77bcf86cd79943901g'),
        fc.constant('zzzzzzzzzzzzzzzzzzzzzzz1'),

        // Wrong length (not 24 characters)
        fc.constant('507f1f77bcf86cd7994390'), // 22 chars
        fc.constant('507f1f77bcf86cd799439011a'), // 25 chars

        // Special characters
        fc.constant('507f1f77-bcf8-6cd7-9943-9011'),
        fc.constant('507f1f77 bcf86cd799439011'),

        // Empty and whitespace
        fc.constant(''),
        fc.constant('   '),
        fc.constant('\n'),
      )
    }

    /**
     * Generator for valid session data with invalid mentorId
     */
    const arbInvalidSessionData = (): fc.Arbitrary<{
      mentorId: string
      studentId: string
      title: string
      description: string
      date: string
      duration: number
    }> => {
      return fc.record({
        mentorId: arbInvalidObjectId(),
        studentId: fc.constant('507f1f77bcf86cd799439011'), // Valid ObjectID
        title: fc.constant('Career Guidance Session'),
        description: fc.constant('Discuss career path and opportunities'),
        date: fc.constant(new Date('2024-12-01T10:00:00Z').toISOString()),
        duration: fc.constant(60),
      })
    }

    it('should reject invalid ObjectID formats with ValidationError (EXPECTED TO FAIL ON UNFIXED CODE)', async () => {
      await fc.assert(
        fc.asyncProperty(arbInvalidSessionData(), async (sessionData) => {
          // On UNFIXED code: This will throw Prisma P2023 error or NotFoundError
          // After FIX: This should throw ValidationError with clear message

          try {
            await service.createSession(sessionData)

            // If we reach here, the test failed - no error was thrown
            throw new Error(`Expected ValidationError for invalid mentorId: ${sessionData.mentorId}`)
          } catch (error: any) {
            // AFTER FIX: Should be ValidationError with specific message
            // ON UNFIXED CODE: Will be Prisma error or NotFoundError

            // Log the actual error for documentation
            console.log(`Counterexample found - mentorId: "${sessionData.mentorId}"`)
            console.log(`Error type: ${error.constructor.name}`)
            console.log(`Error message: ${error.message}`)
            console.log(`Error code: ${error.code || 'N/A'}`)

            // After fix, these assertions should pass
            expect(error).toBeInstanceOf(ValidationError)
            expect(error.message).toBe('Invalid mentor ID format')
          }
        }),
        {
          ...PROPERTY_TEST_CONFIG,
          numRuns: 10, // Scoped to concrete cases, fewer runs needed
        }
      )
    })

    /**
     * Concrete test cases for specific invalid formats
     * These provide clear counterexamples for documentation
     */
    it('should reject short invalid ID (12345)', async () => {
      const sessionData = {
        mentorId: '12345',
        studentId: '507f1f77bcf86cd799439011',
        title: 'Test Session',
        date: new Date('2024-12-01T10:00:00Z').toISOString(),
        duration: 60,
      }

      try {
        await service.createSession(sessionData)
        throw new Error('Expected ValidationError')
      } catch (error: any) {
        // Document the actual error on unfixed code
        console.log(`\n=== Counterexample: Short ID (12345) ===`)
        console.log(`Error type: ${error.constructor.name}`)
        console.log(`Error message: ${error.message}`)
        console.log(`Error code: ${error.code || 'N/A'}`)

        // AFTER FIX: Should be ValidationError
        expect(error).toBeInstanceOf(ValidationError)
        expect(error.message).toBe('Invalid mentor ID format')
      }
    })

    it('should reject mock ID (mock-mentor-1)', async () => {
      const sessionData = {
        mentorId: 'mock-mentor-1',
        studentId: '507f1f77bcf86cd799439011',
        title: 'Test Session',
        date: new Date('2024-12-01T10:00:00Z').toISOString(),
        duration: 60,
      }

      try {
        await service.createSession(sessionData)
        throw new Error('Expected ValidationError')
      } catch (error: any) {
        // Document the actual error on unfixed code
        console.log(`\n=== Counterexample: Mock ID (mock-mentor-1) ===`)
        console.log(`Error type: ${error.constructor.name}`)
        console.log(`Error message: ${error.message}`)
        console.log(`Error code: ${error.code || 'N/A'}`)

        // AFTER FIX: Should be ValidationError
        expect(error).toBeInstanceOf(ValidationError)
        expect(error.message).toBe('Invalid mentor ID format')
      }
    })

    it('should reject non-hex characters (507f1f77bcf86cd79943901g)', async () => {
      const sessionData = {
        mentorId: '507f1f77bcf86cd79943901g',
        studentId: '507f1f77bcf86cd799439011',
        title: 'Test Session',
        date: new Date('2024-12-01T10:00:00Z').toISOString(),
        duration: 60,
      }

      try {
        await service.createSession(sessionData)
        throw new Error('Expected ValidationError')
      } catch (error: any) {
        // Document the actual error on unfixed code
        console.log(`\n=== Counterexample: Non-hex character (507f1f77bcf86cd79943901g) ===`)
        console.log(`Error type: ${error.constructor.name}`)
        console.log(`Error message: ${error.message}`)
        console.log(`Error code: ${error.code || 'N/A'}`)

        // AFTER FIX: Should be ValidationError
        expect(error).toBeInstanceOf(ValidationError)
        expect(error.message).toBe('Invalid mentor ID format')
      }
    })

    it('should reject empty string', async () => {
      const sessionData = {
        mentorId: '',
        studentId: '507f1f77bcf86cd799439011',
        title: 'Test Session',
        date: new Date('2024-12-01T10:00:00Z').toISOString(),
        duration: 60,
      }

      try {
        await service.createSession(sessionData)
        throw new Error('Expected ValidationError')
      } catch (error: any) {
        // Document the actual error on unfixed code
        console.log(`\n=== Counterexample: Empty string ===`)
        console.log(`Error type: ${error.constructor.name}`)
        console.log(`Error message: ${error.message}`)
        console.log(`Error code: ${error.code || 'N/A'}`)

        // AFTER FIX: Should be ValidationError
        expect(error).toBeInstanceOf(ValidationError)
        expect(error.message).toBe('Invalid mentor ID format')
      }
    })

    it('should reject wrong length (22 characters)', async () => {
      const sessionData = {
        mentorId: '507f1f77bcf86cd7994390', // 22 chars
        studentId: '507f1f77bcf86cd799439011',
        title: 'Test Session',
        date: new Date('2024-12-01T10:00:00Z').toISOString(),
        duration: 60,
      }

      try {
        await service.createSession(sessionData)
        throw new Error('Expected ValidationError')
      } catch (error: any) {
        // Document the actual error on unfixed code
        console.log(`\n=== Counterexample: Wrong length (22 chars) ===`)
        console.log(`Error type: ${error.constructor.name}`)
        console.log(`Error message: ${error.message}`)
        console.log(`Error code: ${error.code || 'N/A'}`)

        // AFTER FIX: Should be ValidationError
        expect(error).toBeInstanceOf(ValidationError)
        expect(error.message).toBe('Invalid mentor ID format')
      }
    })
  })
})
