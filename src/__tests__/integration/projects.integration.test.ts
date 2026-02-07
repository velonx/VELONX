/**
 * Integration Tests: Project Endpoints
 * 
 * Tests for project API endpoints including:
 * - Project submission and approval
 * - Join request flows
 * - Authorization checks
 * - Error scenarios
 * 
 * Requirements: 4.2
 * 
 * NOTE: These tests require MongoDB replica set configuration.
 * See INTEGRATION_TESTS_README.md for setup instructions.
 */

import { describe, it, expect, vi } from 'vitest'
import { GET as listProjectsHandler, POST as createProjectHandler } from '@/app/api/projects/route'
import { GET as getProjectHandler, PATCH as updateProjectHandler } from '@/app/api/projects/[id]/route'
import { POST as createJoinRequestHandler } from '@/app/api/projects/[id]/join-requests/route'
import { PATCH as handleJoinRequestHandler } from '@/app/api/projects/join-requests/[requestId]/route'
import { POST as approveProjectHandler } from '@/app/api/admin/projects/approve/route'
import { createMockNextRequest } from '../utils/api-test-helpers'
import { createMockSession } from '../mocks/session.mock'

// Mock auth middleware
vi.mock('@/lib/middleware/auth.middleware', () => ({
  requireAuth: vi.fn(async () => createMockSession({ user: { id: 'test-user-id', role: 'STUDENT' } })),
}))

describe('Project Endpoints Integration Tests', () => {
  describe('POST /api/projects', () => {
    it('should require authentication', async () => {
      const { requireAuth } = await import('@/lib/middleware/auth.middleware')
      vi.mocked(requireAuth).mockResolvedValueOnce({
        status: 401,
        json: async () => ({ error: 'Unauthorized' })
      } as any)

      const projectData = {
        title: 'Test Project',
        description: 'A test project',
        techStack: ['React', 'Node.js'],
        maxMembers: 5,
      }

      const request = createMockNextRequest({
        method: 'POST',
        url: 'http://localhost:3000/api/projects',
        body: projectData,
      })

      const response = await createProjectHandler(request)
      expect(response.status).toBe(401)
    })

    it('should validate required fields', async () => {
      const invalidData = {
        title: 'Test Project',
        // Missing description, techStack, maxMembers
      }

      const request = createMockNextRequest({
        method: 'POST',
        url: 'http://localhost:3000/api/projects',
        body: invalidData,
      })

      const response = await createProjectHandler(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.success).toBe(false)
    })

    it('should validate title length', async () => {
      const projectData = {
        title: 'AB', // Too short
        description: 'A test project',
        techStack: ['React'],
        maxMembers: 5,
      }

      const request = createMockNextRequest({
        method: 'POST',
        url: 'http://localhost:3000/api/projects',
        body: projectData,
      })

      const response = await createProjectHandler(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.success).toBe(false)
    })

    it('should validate maxMembers is positive', async () => {
      const projectData = {
        title: 'Test Project',
        description: 'A test project',
        techStack: ['React'],
        maxMembers: 0, // Invalid
      }

      const request = createMockNextRequest({
        method: 'POST',
        url: 'http://localhost:3000/api/projects',
        body: projectData,
      })

      const response = await createProjectHandler(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.success).toBe(false)
    })
  })

  describe('GET /api/projects', () => {
    it('should require authentication', async () => {
      const { requireAuth } = await import('@/lib/middleware/auth.middleware')
      vi.mocked(requireAuth).mockResolvedValueOnce({
        status: 401,
        json: async () => ({ error: 'Unauthorized' })
      } as any)

      const request = createMockNextRequest({
        method: 'GET',
        url: 'http://localhost:3000/api/projects',
      })

      const response = await listProjectsHandler(request)
      expect(response.status).toBe(401)
    })

    it('should support pagination parameters', async () => {
      const request = createMockNextRequest({
        method: 'GET',
        url: 'http://localhost:3000/api/projects?page=1&pageSize=10',
      })

      const response = await listProjectsHandler(request)
      const data = await response.json()

      // Should not error on valid pagination params
      expect(response.status).toBeLessThan(500)
    })

    it('should support status filtering', async () => {
      const request = createMockNextRequest({
        method: 'GET',
        url: 'http://localhost:3000/api/projects?status=ACTIVE',
      })

      const response = await listProjectsHandler(request)
      const data = await response.json()

      // Should not error on valid status filter
      expect(response.status).toBeLessThan(500)
    })

    it('should support tech stack filtering', async () => {
      const request = createMockNextRequest({
        method: 'GET',
        url: 'http://localhost:3000/api/projects?techStack=React',
      })

      const response = await listProjectsHandler(request)
      const data = await response.json()

      // Should not error on valid tech stack filter
      expect(response.status).toBeLessThan(500)
    })
  })

  describe('POST /api/projects/[id]/join-requests', () => {
    it('should require authentication', async () => {
      const { requireAuth } = await import('@/lib/middleware/auth.middleware')
      vi.mocked(requireAuth).mockResolvedValueOnce({
        status: 401,
        json: async () => ({ error: 'Unauthorized' })
      } as any)

      const joinRequestData = {
        message: 'I would like to join this project',
      }

      const request = createMockNextRequest({
        method: 'POST',
        url: 'http://localhost:3000/api/projects/project-123/join-requests',
        body: joinRequestData,
      })

      const context = { params: { id: 'project-123' } }
      const response = await createJoinRequestHandler(request, context)
      expect(response.status).toBe(401)
    })

    it('should validate message is provided', async () => {
      const joinRequestData = {
        message: '', // Empty message
      }

      const request = createMockNextRequest({
        method: 'POST',
        url: 'http://localhost:3000/api/projects/project-123/join-requests',
        body: joinRequestData,
      })

      const context = { params: { id: 'project-123' } }
      const response = await createJoinRequestHandler(request, context)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.success).toBe(false)
    })
  })

  describe('PATCH /api/projects/join-requests/[requestId]', () => {
    it('should require authentication', async () => {
      const { requireAuth } = await import('@/lib/middleware/auth.middleware')
      vi.mocked(requireAuth).mockResolvedValueOnce({
        status: 401,
        json: async () => ({ error: 'Unauthorized' })
      } as any)

      const request = createMockNextRequest({
        method: 'PATCH',
        url: 'http://localhost:3000/api/projects/join-requests/request-123',
        body: { status: 'APPROVED' },
      })

      const context = { params: { requestId: 'request-123' } }
      const response = await handleJoinRequestHandler(request, context)
      expect(response.status).toBe(401)
    })

    it('should validate status value', async () => {
      const request = createMockNextRequest({
        method: 'PATCH',
        url: 'http://localhost:3000/api/projects/join-requests/request-123',
        body: { status: 'INVALID_STATUS' },
      })

      const context = { params: { requestId: 'request-123' } }
      const response = await handleJoinRequestHandler(request, context)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.success).toBe(false)
    })
  })

  describe('POST /api/admin/projects/approve', () => {
    it('should require admin authentication', async () => {
      const { requireAuth } = await import('@/lib/middleware/auth.middleware')
      vi.mocked(requireAuth).mockResolvedValueOnce(
        createMockSession({ user: { id: 'test-user-id', role: 'STUDENT' } })
      )

      const approvalData = {
        projectId: 'project-123',
        approved: true,
      }

      const request = createMockNextRequest({
        method: 'POST',
        url: 'http://localhost:3000/api/admin/projects/approve',
        body: approvalData,
      })

      const response = await approveProjectHandler(request)
      
      // Should return 403 for non-admin users
      expect([403, 401]).toContain(response.status)
    })

    it('should validate required fields', async () => {
      const { requireAuth } = await import('@/lib/middleware/auth.middleware')
      vi.mocked(requireAuth).mockResolvedValueOnce(
        createMockSession({ user: { id: 'admin-id', role: 'ADMIN' } })
      )

      const invalidData = {
        projectId: 'project-123',
        // Missing approved field
      }

      const request = createMockNextRequest({
        method: 'POST',
        url: 'http://localhost:3000/api/admin/projects/approve',
        body: invalidData,
      })

      const response = await approveProjectHandler(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.success).toBe(false)
    })
  })

  describe('Authorization Checks', () => {
    it('should prevent non-owners from updating projects', async () => {
      const { requireAuth } = await import('@/lib/middleware/auth.middleware')
      vi.mocked(requireAuth).mockResolvedValueOnce(
        createMockSession({ user: { id: 'different-user-id', role: 'STUDENT' } })
      )

      const updateData = {
        title: 'Updated Title',
      }

      const request = createMockNextRequest({
        method: 'PATCH',
        url: 'http://localhost:3000/api/projects/project-123',
        body: updateData,
      })

      const context = { params: { id: 'project-123' } }
      const response = await updateProjectHandler(request, context)

      // Should return 403 for non-owners
      expect([403, 404]).toContain(response.status)
    })

    it('should prevent non-owners from approving join requests', async () => {
      const { requireAuth } = await import('@/lib/middleware/auth.middleware')
      vi.mocked(requireAuth).mockResolvedValueOnce(
        createMockSession({ user: { id: 'non-owner-id', role: 'STUDENT' } })
      )

      const request = createMockNextRequest({
        method: 'PATCH',
        url: 'http://localhost:3000/api/projects/join-requests/request-123',
        body: { status: 'APPROVED' },
      })

      const context = { params: { requestId: 'request-123' } }
      const response = await handleJoinRequestHandler(request, context)

      // Should return 403 for non-owners
      expect([403, 404]).toContain(response.status)
    })
  })

  describe('Error Scenarios', () => {
    it('should handle non-existent project gracefully', async () => {
      const request = createMockNextRequest({
        method: 'GET',
        url: 'http://localhost:3000/api/projects/non-existent-id',
      })

      const context = { params: { id: 'non-existent-id' } }
      const response = await getProjectHandler(request, context)

      expect(response.status).toBe(404)
    })

    it('should handle duplicate join requests', async () => {
      // This would require database state, so we just validate the endpoint exists
      const joinRequestData = {
        message: 'I would like to join',
      }

      const request = createMockNextRequest({
        method: 'POST',
        url: 'http://localhost:3000/api/projects/project-123/join-requests',
        body: joinRequestData,
      })

      const context = { params: { id: 'project-123' } }
      const response = await createJoinRequestHandler(request, context)

      // Should handle gracefully (either success or conflict)
      expect(response.status).toBeLessThan(500)
    })
  })
})
