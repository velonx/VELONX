/**
 * Property-Based Testing Configuration
 * 
 * Configuration for property-based tests as per design document requirements
 */

import type { Parameters } from 'fast-check'

/**
 * Default configuration for all property tests
 * - Minimum 100 iterations as specified in design document
 * - Verbose output for better debugging
 * - Seed for reproducibility
 */
export const PROPERTY_TEST_CONFIG: Parameters<unknown> = {
  numRuns: 100,
  verbose: true,
  // Uncomment to set a specific seed for reproducibility
  // seed: 42,
}

/**
 * Configuration for intensive property tests
 * Use for critical correctness properties
 */
export const INTENSIVE_PROPERTY_TEST_CONFIG: Parameters<unknown> = {
  numRuns: 1000,
  verbose: true,
}

/**
 * Configuration for quick property tests
 * Use during development for faster feedback
 */
export const QUICK_PROPERTY_TEST_CONFIG: Parameters<unknown> = {
  numRuns: 20,
  verbose: false,
}

/**
 * Get property test configuration based on environment
 */
export function getPropertyTestConfig(): Parameters<unknown> {
  const env = process.env.NODE_ENV
  const testMode = process.env.TEST_MODE
  
  if (testMode === 'quick') {
    return QUICK_PROPERTY_TEST_CONFIG
  }
  
  if (testMode === 'intensive' || env === 'ci') {
    return INTENSIVE_PROPERTY_TEST_CONFIG
  }
  
  return PROPERTY_TEST_CONFIG
}

/**
 * Property test metadata for tracking
 */
export interface PropertyTestMetadata {
  feature: string
  propertyNumber: number
  propertyName: string
  requirements: string[]
}

/**
 * Create property test tag comment
 * Format: // Feature: {feature}, Property {number}: {name}
 */
export function createPropertyTestTag(metadata: PropertyTestMetadata): string {
  return `// Feature: ${metadata.feature}, Property ${metadata.propertyNumber}: ${metadata.propertyName}`
}

/**
 * Property test result tracking
 */
export interface PropertyTestResult {
  passed: boolean
  numRuns: number
  counterexample?: unknown
  error?: Error
}
