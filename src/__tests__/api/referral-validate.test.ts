/**
 * Unit tests for POST /api/referral/validate endpoint
 * 
 * Note: Full integration tests require MongoDB replica set.
 * These tests verify the endpoint structure and error handling.
 */

import { describe, it, expect } from 'vitest'
import { POST } from '@/app/api/referral/validate/route'
import { createMockNextRequest } from '../utils/api-test-helpers'

describe('POST /api/referral/validate', () => {
  it('should accept POST requests with valid structure', async () => {
    // This test verifies the endpoint accepts requests with proper structure
    const request = createMockNextRequest({
      method: 'POST',
      url: 'http://localhost:3000/api/referral/validate',
      body: { code: 'TEST1234' },
    })

    const response = await POST(request)
    
    // Should return 200 regardless of code validity
    expect(response.status).toBe(200)
    
    const data = await response.json()
    expect(data).toHaveProperty('success')
    expect(data).toHaveProperty('data')
    expect(data.data).toHaveProperty('valid')
  })


  it('should return 400 for missing code', async () => {
    const request = createMockNextRequest({
      method: 'POST',
      url: 'http://localhost:3000/api/referral/validate',
      body: {},
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.success).toBe(false)
    expect(data.error.code).toBe('INVALID_INPUT')
    expect(data.error.message).toContain('required')
  })

  it('should return 400 for non-string code', async () => {
    const request = createMockNextRequest({
      method: 'POST',
      url: 'http://localhost:3000/api/referral/validate',
      body: { code: 12345 },
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.success).toBe(false)
    expect(data.error.code).toBe('INVALID_INPUT')
    expect(data.error.message).toContain('string')
  })

  it('should return 400 for invalid JSON', async () => {
    const request = new Request('http://localhost:3000/api/referral/validate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: 'invalid json',
    }) as any

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.success).toBe(false)
    expect(data.error.code).toBe('INVALID_REQUEST')
  })
})

