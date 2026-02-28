/**
 * Bug Condition Exploration Test - Database Connection Error Fix
 * 
 * **Validates: Requirements 2.1, 2.2, 2.3**
 * 
 * CRITICAL: This test is EXPECTED TO FAIL on unfixed code.
 * Failure confirms the bug exists and surfaces counterexamples.
 * 
 * DO NOT attempt to fix the test or code when it fails.
 * The test encodes the expected behavior after the fix.
 * 
 * Bug Description:
 * Server fails to start with error "Failed to open database. 
 * Caused by: 0: Loading persistence directory failed 1: invalid digit found in string"
 * 
 * Root Cause Hypothesis:
 * 1. Eager connection on module load in src/lib/prisma.ts
 * 2. Missing replica set configuration for MongoDB transactions
 * 3. Prisma client generation issue
 * 4. Connection string parsing problem
 * 5. Environment variable loading timing issue
 */

import { describe, it, expect, beforeAll, afterAll, vi } from 'vitest'
import fc from 'fast-check'
import { PROPERTY_TEST_CONFIG } from '../config/property-test.config'
import { spawn, ChildProcess } from 'child_process'
import { promisify } from 'util'

const sleep = promisify(setTimeout)

/**
 * Property 1: Fault Condition - Server Startup Database Connection Failure
 * 
 * For any server startup event where npm run dev is executed with a valid
 * DATABASE_URL, the server SHALL successfully initialize without throwing
 * "invalid digit found in string" errors.
 * 
 * This property is scoped to the concrete failing case: server startup
 * with valid MongoDB connection string.
 */

describe('Bug Condition Exploration: Database Connection Error', () => {
  describe('Property 1: Fault Condition - Successful Database Initialization', () => {
    it('should start server successfully with valid DATABASE_URL without "invalid digit found in string" error', async () => {
      // CRITICAL: This test is EXPECTED TO FAIL on unfixed code
      // Failure proves the bug exists
      
      // Test implementation: Start server and verify successful initialization
      const serverProcess = await startDevServer()
      
      try {
        // Wait for server to initialize (max 30 seconds)
        const result = await waitForServerStartup(serverProcess, 30000)
        
        // ASSERTIONS - These encode the expected behavior after fix
        
        // 1. Server should start successfully
        expect(result.started).toBe(true)
        expect(result.error).toBeNull()
        
        // 2. No "invalid digit found in string" error should occur
        expect(result.output).not.toContain('invalid digit found in string')
        expect(result.output).not.toContain('Loading persistence directory failed')
        
        // 3. Database should be connected
        expect(result.output).toContain('[Prisma]') // Prisma logs indicate connection attempt
        
        // 4. Redis should be initialized (comes after database)
        expect(result.output).toContain('[Server] Redis initialized')
        
        // 5. WebSocket server should be started
        expect(result.output).toContain('[Server] WebSocket server ready')
        
        // 6. Server should be listening
        expect(result.output).toContain('[Server] Ready on')
        
        // If we reach here on unfixed code, the test will fail with counterexamples
        // documenting the exact error messages and stack traces
        
      } finally {
        // Clean up: kill the server process
        await killServerProcess(serverProcess)
      }
    }, 60000) // 60 second timeout for server startup
    
    it('should handle DATABASE_URL validation gracefully', async () => {
      // Test that missing or malformed DATABASE_URL provides clear error messages
      // rather than cryptic "invalid digit" errors
      
      const originalDatabaseUrl = process.env.DATABASE_URL
      
      try {
        // Test with missing DATABASE_URL
        delete process.env.DATABASE_URL
        
        const serverProcess = await startDevServer()
        const result = await waitForServerStartup(serverProcess, 10000)
        
        await killServerProcess(serverProcess)
        
        // Should fail with clear error message, not "invalid digit"
        expect(result.error).not.toBeNull()
        if (result.error) {
          expect(result.error).not.toContain('invalid digit found in string')
          // Should have a clear error about missing DATABASE_URL
          expect(
            result.error.toLowerCase().includes('database') ||
            result.error.toLowerCase().includes('url') ||
            result.error.toLowerCase().includes('connection')
          ).toBe(true)
        }
        
      } finally {
        // Restore original DATABASE_URL
        if (originalDatabaseUrl) {
          process.env.DATABASE_URL = originalDatabaseUrl
        }
      }
    }, 30000)
  })
  
  describe('Property-Based Test: Server Startup Across Valid Connection Strings', () => {
    it('should successfully start with any valid MongoDB connection string format', async () => {
      // Property-based test: Generate various valid MongoDB connection strings
      // and verify server starts successfully with each
      
      await fc.assert(
        fc.asyncProperty(
          arbValidMongoDBConnectionString(),
          async (connectionString) => {
            const originalDatabaseUrl = process.env.DATABASE_URL
            
            try {
              // Set the generated connection string
              process.env.DATABASE_URL = connectionString
              
              // Start server
              const serverProcess = await startDevServer()
              const result = await waitForServerStartup(serverProcess, 15000)
              
              await killServerProcess(serverProcess)
              
              // Property: Server should start without "invalid digit" error
              // Note: It may fail for other reasons (network, auth), but not parsing
              if (result.error) {
                expect(result.error).not.toContain('invalid digit found in string')
                expect(result.error).not.toContain('Loading persistence directory failed')
              }
              
            } finally {
              // Restore original DATABASE_URL
              if (originalDatabaseUrl) {
                process.env.DATABASE_URL = originalDatabaseUrl
              }
            }
          }
        ),
        {
          ...PROPERTY_TEST_CONFIG,
          numRuns: 10, // Reduced runs since starting server is expensive
        }
      )
    }, 180000) // 3 minute timeout for multiple server starts
  })
})

// ============================================================================
// Test Helpers
// ============================================================================

interface ServerStartupResult {
  started: boolean
  error: string | null
  output: string
}

/**
 * Start the development server as a child process
 */
async function startDevServer(): Promise<ChildProcess> {
  const serverProcess = spawn('npm', ['run', 'dev'], {
    cwd: process.cwd(),
    env: { ...process.env },
    stdio: 'pipe',
  })
  
  return serverProcess
}

/**
 * Wait for server to start up and capture output
 */
async function waitForServerStartup(
  serverProcess: ChildProcess,
  timeoutMs: number
): Promise<ServerStartupResult> {
  return new Promise((resolve) => {
    let output = ''
    let error = ''
    let resolved = false
    
    const timeout = setTimeout(() => {
      if (!resolved) {
        resolved = true
        resolve({
          started: false,
          error: 'Server startup timeout',
          output: output + '\n' + error,
        })
      }
    }, timeoutMs)
    
    serverProcess.stdout?.on('data', (data) => {
      const text = data.toString()
      output += text
      
      // Check for successful startup
      if (text.includes('[Server] Ready on') && !resolved) {
        resolved = true
        clearTimeout(timeout)
        resolve({
          started: true,
          error: null,
          output,
        })
      }
    })
    
    serverProcess.stderr?.on('data', (data) => {
      const text = data.toString()
      error += text
      
      // Check for the bug condition error
      if (text.includes('invalid digit found in string') && !resolved) {
        resolved = true
        clearTimeout(timeout)
        resolve({
          started: false,
          error: text,
          output: output + '\n' + error,
        })
      }
      
      // Check for other fatal errors
      if (text.includes('Error:') && !resolved) {
        // Wait a bit to collect full error message
        setTimeout(() => {
          if (!resolved) {
            resolved = true
            clearTimeout(timeout)
            resolve({
              started: false,
              error: error,
              output: output + '\n' + error,
            })
          }
        }, 2000)
      }
    })
    
    serverProcess.on('error', (err) => {
      if (!resolved) {
        resolved = true
        clearTimeout(timeout)
        resolve({
          started: false,
          error: err.message,
          output: output + '\n' + error,
        })
      }
    })
    
    serverProcess.on('exit', (code) => {
      if (!resolved) {
        resolved = true
        clearTimeout(timeout)
        resolve({
          started: false,
          error: `Server exited with code ${code}`,
          output: output + '\n' + error,
        })
      }
    })
  })
}

/**
 * Kill the server process
 */
async function killServerProcess(serverProcess: ChildProcess): Promise<void> {
  return new Promise((resolve) => {
    if (!serverProcess.pid) {
      resolve()
      return
    }
    
    serverProcess.on('exit', () => {
      resolve()
    })
    
    // Try graceful shutdown first
    serverProcess.kill('SIGTERM')
    
    // Force kill after 5 seconds if still running
    setTimeout(() => {
      if (serverProcess.pid) {
        serverProcess.kill('SIGKILL')
      }
      resolve()
    }, 5000)
  })
}

/**
 * Generator for valid MongoDB connection strings
 * Generates various formats to test parsing robustness
 */
function arbValidMongoDBConnectionString(): fc.Arbitrary<string> {
  return fc.oneof(
    // MongoDB Atlas format (mongodb+srv)
    fc.record({
      username: fc.stringMatching(/^[a-zA-Z0-9_]+$/),
      password: fc.stringMatching(/^[a-zA-Z0-9]+$/),
      cluster: fc.stringMatching(/^[a-z0-9-]+$/),
      database: fc.stringMatching(/^[a-zA-Z0-9_]+$/),
    }).map(({ username, password, cluster, database }) =>
      `mongodb+srv://${username}:${password}@${cluster}.mongodb.net/${database}?retryWrites=true&w=majority`
    ),
    
    // Standard MongoDB format (mongodb)
    fc.record({
      host: fc.constant('localhost'),
      port: fc.integer({ min: 27017, max: 27019 }),
      database: fc.stringMatching(/^[a-zA-Z0-9_]+$/),
    }).map(({ host, port, database }) =>
      `mongodb://${host}:${port}/${database}`
    ),
    
    // MongoDB with authentication
    fc.record({
      username: fc.stringMatching(/^[a-zA-Z0-9_]+$/),
      password: fc.stringMatching(/^[a-zA-Z0-9]+$/),
      host: fc.constant('localhost'),
      port: fc.constant(27017),
      database: fc.stringMatching(/^[a-zA-Z0-9_]+$/),
    }).map(({ username, password, host, port, database }) =>
      `mongodb://${username}:${password}@${host}:${port}/${database}`
    ),
  )
}
