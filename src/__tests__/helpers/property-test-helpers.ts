/**
 * Property-Based Testing Helpers
 * 
 * Utilities and generators for property-based testing with fast-check
 */

import fc from 'fast-check'

/**
 * Default configuration for property tests
 * Minimum 100 iterations as per design document
 */
export const DEFAULT_PROPERTY_TEST_CONFIG = {
  numRuns: 100,
  verbose: true,
}

/**
 * Generator for valid user IDs (MongoDB ObjectId format)
 */
export const arbUserId = (): fc.Arbitrary<string> => {
  return fc.string({ minLength: 24, maxLength: 24 }).map(s => 
    Array.from({ length: 24 }, () => 
      Math.floor(Math.random() * 16).toString(16)
    ).join('')
  )
}

/**
 * Generator for valid email addresses
 */
export const arbEmail = (): fc.Arbitrary<string> => {
  return fc.emailAddress()
}

/**
 * Generator for valid user names
 */
export const arbUserName = (): fc.Arbitrary<string> => {
  return fc.string({ minLength: 1, maxLength: 100 }).filter(s => s.trim().length > 0)
}

/**
 * Generator for valid bio text
 */
export const arbBio = (): fc.Arbitrary<string> => {
  return fc.string({ maxLength: 500 })
}

/**
 * Generator for valid IP addresses (IPv4)
 */
export const arbIPv4 = (): fc.Arbitrary<string> => {
  return fc.ipV4()
}

/**
 * Generator for valid timestamps
 */
export const arbTimestamp = (): fc.Arbitrary<number> => {
  return fc.integer({ min: 0, max: Date.now() + 365 * 24 * 60 * 60 * 1000 })
}

/**
 * Generator for valid dates
 */
export const arbDate = (): fc.Arbitrary<Date> => {
  return fc.date({ min: new Date('2020-01-01'), max: new Date('2030-12-31') })
}

/**
 * Generator for valid API endpoints
 */
export const arbAPIEndpoint = (): fc.Arbitrary<string> => {
  return fc.oneof(
    fc.constant('/api/users'),
    fc.constant('/api/projects'),
    fc.constant('/api/mentors'),
    fc.constant('/api/resources'),
    fc.constant('/api/events'),
    fc.constant('/api/notifications'),
    fc.constant('/api/leaderboard'),
  )
}

/**
 * Generator for valid HTTP methods
 */
export const arbHTTPMethod = (): fc.Arbitrary<string> => {
  return fc.oneof(
    fc.constant('GET'),
    fc.constant('POST'),
    fc.constant('PUT'),
    fc.constant('DELETE'),
    fc.constant('PATCH'),
  )
}

/**
 * Generator for valid user roles
 */
export const arbUserRole = (): fc.Arbitrary<'STUDENT' | 'MENTOR' | 'ADMIN'> => {
  return fc.oneof(
    fc.constant('STUDENT' as const),
    fc.constant('MENTOR' as const),
    fc.constant('ADMIN' as const),
  )
}

/**
 * Generator for valid cache keys
 */
export const arbCacheKey = (): fc.Arbitrary<string> => {
  return fc.string({ minLength: 1, maxLength: 100 }).map(s => `cache:${s}`)
}

/**
 * Generator for valid TTL values (in seconds)
 */
export const arbTTL = (): fc.Arbitrary<number> => {
  return fc.integer({ min: 1, max: 3600 })
}

/**
 * Generator for valid request objects
 */
export const arbRequest = (): fc.Arbitrary<{
  ip: string
  endpoint: string
  method: string
  timestamp: number
}> => {
  return fc.record({
    ip: arbIPv4(),
    endpoint: arbAPIEndpoint(),
    method: arbHTTPMethod(),
    timestamp: arbTimestamp(),
  })
}

/**
 * Generator for valid user objects
 */
export const arbUser = (): fc.Arbitrary<{
  id: string
  name: string
  email: string
  role: 'STUDENT' | 'MENTOR' | 'ADMIN'
}> => {
  return fc.record({
    id: arbUserId(),
    name: arbUserName(),
    email: arbEmail(),
    role: arbUserRole(),
  })
}

/**
 * Generator for sequences of requests (for rate limiting tests)
 */
export const arbRequestSequence = (
  minLength: number = 1,
  maxLength: number = 200
): fc.Arbitrary<Array<{ ip: string; endpoint: string; timestamp: number }>> => {
  return fc.array(
    fc.record({
      ip: arbIPv4(),
      endpoint: arbAPIEndpoint(),
      timestamp: arbTimestamp(),
    }),
    { minLength, maxLength }
  )
}

/**
 * Generator for cache entries
 */
export const arbCacheEntry = <T>(valueArb: fc.Arbitrary<T>): fc.Arbitrary<{
  key: string
  value: T
  ttl: number
}> => {
  return fc.record({
    key: arbCacheKey(),
    value: valueArb,
    ttl: arbTTL(),
  })
}

/**
 * Generator for error codes
 */
export const arbErrorCode = (): fc.Arbitrary<string> => {
  return fc.oneof(
    fc.constant('DATABASE_ERROR'),
    fc.constant('VALIDATION_ERROR'),
    fc.constant('AUTHENTICATION_ERROR'),
    fc.constant('AUTHORIZATION_ERROR'),
    fc.constant('RATE_LIMIT_ERROR'),
    fc.constant('NETWORK_ERROR'),
  )
}

/**
 * Generator for valid XP amounts
 */
export const arbXP = (): fc.Arbitrary<number> => {
  return fc.integer({ min: 0, max: 20000 })
}

/**
 * Generator for valid level numbers
 */
export const arbLevel = (): fc.Arbitrary<number> => {
  return fc.integer({ min: 1, max: 10 })
}

/**
 * Helper to run property tests with default configuration
 */
export async function runPropertyTest<T>(
  property: fc.IProperty<T>,
  config: Partial<fc.Parameters<T>> = {}
): Promise<void> {
  await fc.assert(property, {
    ...DEFAULT_PROPERTY_TEST_CONFIG,
    ...config,
  })
}
