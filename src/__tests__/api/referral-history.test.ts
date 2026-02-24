/**
 * Unit tests for GET /api/referral/history endpoint
 * 
 * Note: Full integration tests require MongoDB replica set.
 * These tests verify the endpoint structure and error handling.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { GET } from '@/app/api/referral/history/route'
import { NextRequest } from 'next/server'

// Mock the auth middleware
vi.mock('@/lib/middleware/auth.middleware', () => ({
  requireAuth: vi.fn().mockResolvedValue({
    user: { id: 'test-user-id', email: 'test@example.com' }
  })
}))

// Mock the referral service
vi.mock('@/lib/services/referral.service', () => ({
  getReferralHistory: vi.fn().mockResolvedValue({
    referrals: [
      {
        id: 'ref1',
        refereeName: 'John Doe',
        refereeImage: 'https://example.com/avatar.jpg',
        signupDate: '2024-01-01T00:00:00.000Z',
        profileCompleted: true,
        firstActivityCompleted: true,
        firstActivityType: 'event_registration',
        totalXPEarned: 150
      }
    ],
    pagination: {
      page: 1,
      limit: 20,
      total: 1,
      totalPages: 1
    }
  })
}))

describe('GET /api/referral/history', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should return referral history with default pagination', async () => {
    const request = new NextRequest('http://localhost:3000/api/referral/history')

    const response = await GET(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.success).toBe(true)
    expect(data.data).toHaveProperty('referrals')
    expect(data.data).toHaveProperty('pagination')
    expect(Array.isArray(data.data.referrals)).toBe(true)
  })

  it('should accept page and limit query parameters', async () => {
    const request = new NextRequest('http://localhost:3000/api/referral/history?page=2&limit=10')

    const response = await GET(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.success).toBe(true)
  })

  it('should accept milestoneType filter', async () => {
    const request = new NextRequest('http://localhost:3000/api/referral/history?milestoneType=profile')

    const response = await GET(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.success).toBe(true)
  })

  it('should return 400 for invalid page parameter', async () => {
    const request = new NextRequest('http://localhost:3000/api/referral/history?page=0')

    const response = await GET(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.success).toBe(false)
    expect(data.error.code).toBe('INVALID_PARAMETER')
  })

  it('should return 400 for invalid limit parameter', async () => {
    const request = new NextRequest('http://localhost:3000/api/referral/history?limit=200')

    const response = await GET(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.success).toBe(false)
    expect(data.error.code).toBe('INVALID_PARAMETER')
  })

  it('should return 400 for invalid milestoneType', async () => {
    const request = new NextRequest('http://localhost:3000/api/referral/history?milestoneType=invalid')

    const response = await GET(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.success).toBe(false)
    expect(data.error.code).toBe('INVALID_PARAMETER')
    expect(data.error.message).toContain('Milestone type must be one of')
  })

  it('should handle non-numeric page parameter', async () => {
    const request = new NextRequest('http://localhost:3000/api/referral/history?page=abc')

    const response = await GET(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.success).toBe(false)
  })

  it('should handle non-numeric limit parameter', async () => {
    const request = new NextRequest('http://localhost:3000/api/referral/history?limit=xyz')

    const response = await GET(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.success).toBe(false)
  })
})
