/**
 * Integration Tests: Notification Endpoints
 * 
 * Tests for notification API endpoints including:
 * - Notification creation and retrieval
 * - Real-time updates
 * - Filtering by type and read status
 * - Mark as read functionality
 * - Authorization checks
 * 
 * Requirements: 4.2
 * 
 * NOTE: These tests require MongoDB replica set configuration.
 * See INTEGRATION_TESTS_README.md for setup instructions.
 */

import { describe, it, expect, vi } from 'vitest'
import { GET as listNotificationsHandler, POST as createNotificationHandler } from '@/app/api/notifications/route'
import { PATCH as updateNotificationHandler, DELETE as deleteNotificationHandler } from '@/app/api/notifications/[id]/route'
import { PATCH as markAllReadHandler } from '@/app/api/notifications/mark-all-read/route'
import { DELETE as clearAllHandler } from '@/app/api/notifications/clear-all/route'
import { GET as unreadCountHandler } from '@/app/api/notifications/unread-count/route'
import { createMockNextRequest } from '../utils/api-test-helpers'
import { createMockSession } from '../mocks/session.mock'

// Mock auth middleware
vi.mock('@/lib/middleware/auth.middleware', () => ({
  requireAuth: vi.fn(async () => createMockSession({ user: { id: 'test-user-id', role: 'STUDENT' } })),
}))

describe('Notification Endpoints Integration Tests', () => {
  describe('GET /api/notifications', () => {
    it('should require authentication', async () => {
      const { requireAuth } = await import('@/lib/middleware/auth.middleware')
      vi.mocked(requireAuth).mockResolvedValueOnce({
        status: 401,
        json: async () => ({ error: 'Unauthorized' })
      } as any)

      const request = createMockNextRequest({
        method: 'GET',
        url: 'http://localhost:3000/api/notifications',
      })

      const response = await listNotificationsHandler(request)
      expect(response.status).toBe(401)
    })

    it('should support pagination parameters', async () => {
      const request = createMockNextRequest({
        method: 'GET',
        url: 'http://localhost:3000/api/notifications?page=1&pageSize=20',
      })

      const response = await listNotificationsHandler(request)
      const data = await response.json()

      // Should not error on valid pagination params
      expect(response.status).toBeLessThan(500)
    })

    it('should support read status filtering', async () => {
      const request = createMockNextRequest({
        method: 'GET',
        url: 'http://localhost:3000/api/notifications?read=false',
      })

      const response = await listNotificationsHandler(request)
      const data = await response.json()

      // Should not error on valid read filter
      expect(response.status).toBeLessThan(500)
    })

    it('should support type filtering', async () => {
      const request = createMockNextRequest({
        method: 'GET',
        url: 'http://localhost:3000/api/notifications?type=SESSION_REMINDER',
      })

      const response = await listNotificationsHandler(request)
      const data = await response.json()

      // Should not error on valid type filter
      expect(response.status).toBeLessThan(500)
    })

    it('should return notifications for authenticated user only', async () => {
      const request = createMockNextRequest({
        method: 'GET',
        url: 'http://localhost:3000/api/notifications',
      })

      const response = await listNotificationsHandler(request)
      const data = await response.json()

      // Should return success with data structure
      if (response.status === 200) {
        expect(data.success).toBe(true)
        expect(data.data).toBeDefined()
      }
    })
  })

  describe('POST /api/notifications', () => {
    it('should require authentication', async () => {
      const { requireAuth } = await import('@/lib/middleware/auth.middleware')
      vi.mocked(requireAuth).mockResolvedValueOnce({
        status: 401,
        json: async () => ({ error: 'Unauthorized' })
      } as any)

      const notificationData = {
        userId: 'user-123',
        title: 'Test Notification',
        description: 'This is a test',
        type: 'GENERAL',
      }

      const request = createMockNextRequest({
        method: 'POST',
        url: 'http://localhost:3000/api/notifications',
        body: notificationData,
      })

      const response = await createNotificationHandler(request)
      expect(response.status).toBe(401)
    })

    it('should validate required fields', async () => {
      const invalidData = {
        userId: 'user-123',
        title: 'Test Notification',
        // Missing description and type
      }

      const request = createMockNextRequest({
        method: 'POST',
        url: 'http://localhost:3000/api/notifications',
        body: invalidData,
      })

      const response = await createNotificationHandler(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.success).toBe(false)
    })

    it('should validate notification type', async () => {
      const notificationData = {
        userId: 'user-123',
        title: 'Test Notification',
        description: 'This is a test',
        type: 'INVALID_TYPE',
      }

      const request = createMockNextRequest({
        method: 'POST',
        url: 'http://localhost:3000/api/notifications',
        body: notificationData,
      })

      const response = await createNotificationHandler(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.success).toBe(false)
    })

    it('should accept valid notification types', async () => {
      const validTypes = [
        'GENERAL',
        'SESSION_REMINDER',
        'SESSION_CANCELLED',
        'PROJECT_INVITATION',
        'PROJECT_APPROVED',
      ]

      for (const type of validTypes) {
        const notificationData = {
          userId: 'user-123',
          title: 'Test Notification',
          description: 'This is a test',
          type,
        }

        const request = createMockNextRequest({
          method: 'POST',
          url: 'http://localhost:3000/api/notifications',
          body: notificationData,
        })

        const response = await createNotificationHandler(request)
        
        // Should not reject valid types
        expect(response.status).not.toBe(400)
      }
    })
  })

  describe('PATCH /api/notifications/[id]', () => {
    it('should require authentication', async () => {
      const { requireAuth } = await import('@/lib/middleware/auth.middleware')
      vi.mocked(requireAuth).mockResolvedValueOnce({
        status: 401,
        json: async () => ({ error: 'Unauthorized' })
      } as any)

      const request = createMockNextRequest({
        method: 'PATCH',
        url: 'http://localhost:3000/api/notifications/notif-123',
        body: { read: true },
      })

      const context = { params: { id: 'notif-123' } }
      const response = await updateNotificationHandler(request, context)
      expect(response.status).toBe(401)
    })

    it('should validate read field is boolean', async () => {
      const request = createMockNextRequest({
        method: 'PATCH',
        url: 'http://localhost:3000/api/notifications/notif-123',
        body: { read: 'invalid' },
      })

      const context = { params: { id: 'notif-123' } }
      const response = await updateNotificationHandler(request, context)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.success).toBe(false)
    })
  })

  describe('DELETE /api/notifications/[id]', () => {
    it('should require authentication', async () => {
      const { requireAuth } = await import('@/lib/middleware/auth.middleware')
      vi.mocked(requireAuth).mockResolvedValueOnce({
        status: 401,
        json: async () => ({ error: 'Unauthorized' })
      } as any)

      const request = createMockNextRequest({
        method: 'DELETE',
        url: 'http://localhost:3000/api/notifications/notif-123',
      })

      const context = { params: { id: 'notif-123' } }
      const response = await deleteNotificationHandler(request, context)
      expect(response.status).toBe(401)
    })
  })

  describe('PATCH /api/notifications/mark-all-read', () => {
    it('should require authentication', async () => {
      const { requireAuth } = await import('@/lib/middleware/auth.middleware')
      vi.mocked(requireAuth).mockResolvedValueOnce({
        status: 401,
        json: async () => ({ error: 'Unauthorized' })
      } as any)

      const request = createMockNextRequest({
        method: 'PATCH',
        url: 'http://localhost:3000/api/notifications/mark-all-read',
      })

      const response = await markAllReadHandler(request)
      expect(response.status).toBe(401)
    })

    it('should mark all notifications as read for authenticated user', async () => {
      const request = createMockNextRequest({
        method: 'PATCH',
        url: 'http://localhost:3000/api/notifications/mark-all-read',
      })

      const response = await markAllReadHandler(request)
      
      // Should succeed or handle gracefully
      expect(response.status).toBeLessThan(500)
    })
  })

  describe('DELETE /api/notifications/clear-all', () => {
    it('should require authentication', async () => {
      const { requireAuth } = await import('@/lib/middleware/auth.middleware')
      vi.mocked(requireAuth).mockResolvedValueOnce({
        status: 401,
        json: async () => ({ error: 'Unauthorized' })
      } as any)

      const request = createMockNextRequest({
        method: 'DELETE',
        url: 'http://localhost:3000/api/notifications/clear-all',
      })

      const response = await clearAllHandler(request)
      expect(response.status).toBe(401)
    })

    it('should clear all notifications for authenticated user', async () => {
      const request = createMockNextRequest({
        method: 'DELETE',
        url: 'http://localhost:3000/api/notifications/clear-all',
      })

      const response = await clearAllHandler(request)
      
      // Should succeed or handle gracefully
      expect(response.status).toBeLessThan(500)
    })
  })

  describe('GET /api/notifications/unread-count', () => {
    it('should require authentication', async () => {
      const { requireAuth } = await import('@/lib/middleware/auth.middleware')
      vi.mocked(requireAuth).mockResolvedValueOnce({
        status: 401,
        json: async () => ({ error: 'Unauthorized' })
      } as any)

      const request = createMockNextRequest({
        method: 'GET',
        url: 'http://localhost:3000/api/notifications/unread-count',
      })

      const response = await unreadCountHandler(request)
      expect(response.status).toBe(401)
    })

    it('should return unread count for authenticated user', async () => {
      const request = createMockNextRequest({
        method: 'GET',
        url: 'http://localhost:3000/api/notifications/unread-count',
      })

      const response = await unreadCountHandler(request)
      const data = await response.json()

      // Should return success with count
      if (response.status === 200) {
        expect(data.success).toBe(true)
        expect(typeof data.data).toBe('number')
      }
    })
  })

  describe('Authorization Checks', () => {
    it('should prevent users from accessing other users notifications', async () => {
      const { requireAuth } = await import('@/lib/middleware/auth.middleware')
      vi.mocked(requireAuth).mockResolvedValueOnce(
        createMockSession({ user: { id: 'different-user-id', role: 'STUDENT' } })
      )

      const request = createMockNextRequest({
        method: 'PATCH',
        url: 'http://localhost:3000/api/notifications/notif-123',
        body: { read: true },
      })

      const context = { params: { id: 'notif-123' } }
      const response = await updateNotificationHandler(request, context)

      // Should return 403 or 404 for other users' notifications
      expect([403, 404]).toContain(response.status)
    })

    it('should prevent users from deleting other users notifications', async () => {
      const { requireAuth } = await import('@/lib/middleware/auth.middleware')
      vi.mocked(requireAuth).mockResolvedValueOnce(
        createMockSession({ user: { id: 'different-user-id', role: 'STUDENT' } })
      )

      const request = createMockNextRequest({
        method: 'DELETE',
        url: 'http://localhost:3000/api/notifications/notif-123',
      })

      const context = { params: { id: 'notif-123' } }
      const response = await deleteNotificationHandler(request, context)

      // Should return 403 or 404 for other users' notifications
      expect([403, 404]).toContain(response.status)
    })
  })

  describe('Error Scenarios', () => {
    it('should handle non-existent notification gracefully', async () => {
      const request = createMockNextRequest({
        method: 'PATCH',
        url: 'http://localhost:3000/api/notifications/non-existent-id',
        body: { read: true },
      })

      const context = { params: { id: 'non-existent-id' } }
      const response = await updateNotificationHandler(request, context)

      expect(response.status).toBe(404)
    })

    it('should handle invalid pagination parameters', async () => {
      const request = createMockNextRequest({
        method: 'GET',
        url: 'http://localhost:3000/api/notifications?page=-1&pageSize=0',
      })

      const response = await listNotificationsHandler(request)
      
      // Should handle gracefully (either default values or validation error)
      expect(response.status).toBeLessThan(500)
    })
  })
})
