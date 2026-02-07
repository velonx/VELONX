/**
 * Unit Tests for Career Service
 * Tests opportunity CRUD operations, mock interview scheduling, and filtering
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { MockInterviewService, OpportunityService } from '@/lib/services/career.service'
import { prisma } from '@/lib/prisma'

// Mock Prisma
vi.mock('@/lib/prisma', () => ({
  prisma: {
    mockInterview: {
      create: vi.fn(),
      findMany: vi.fn(),
      findUnique: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
    opportunity: {
      create: vi.fn(),
      findMany: vi.fn(),
      findUnique: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
  },
}))

describe('MockInterviewService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('create', () => {
    const validInterviewData = {
      email: 'student@example.com',
      preferredDate: '2024-12-01',
      preferredTime: '10:00',
      interviewType: 'TECHNICAL',
      experienceLevel: 'INTERMEDIATE',
    }

    it('should create mock interview successfully', async () => {
      const mockInterview = {
        id: 'i1',
        userId: 'user1',
        email: validInterviewData.email,
        preferredDate: new Date('2024-12-01T10:00:00'),
        preferredTime: validInterviewData.preferredTime,
        interviewType: validInterviewData.interviewType,
        experienceLevel: validInterviewData.experienceLevel,
        status: 'PENDING',
        createdAt: new Date(),
      }

      vi.mocked(prisma.mockInterview.create).mockResolvedValue(mockInterview as any)

      const result = await MockInterviewService.create('user1', validInterviewData)

      expect(result).toEqual(mockInterview)
      expect(prisma.mockInterview.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          userId: 'user1',
          email: validInterviewData.email,
          interviewType: validInterviewData.interviewType,
          experienceLevel: validInterviewData.experienceLevel,
        }),
      })
    })

    it('should combine date and time into preferredDate', async () => {
      const mockInterview = {
        id: 'i1',
        userId: 'user1',
        preferredDate: new Date('2024-12-01T10:00:00'),
      }

      vi.mocked(prisma.mockInterview.create).mockResolvedValue(mockInterview as any)

      await MockInterviewService.create('user1', validInterviewData)

      expect(prisma.mockInterview.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            preferredDate: expect.any(Date),
          }),
        })
      )
    })
  })

  describe('getAll', () => {
    it('should get all mock interviews', async () => {
      const mockInterviews = [
        {
          id: 'i1',
          userId: 'user1',
          status: 'PENDING',
          createdAt: new Date(),
        },
        {
          id: 'i2',
          userId: 'user2',
          status: 'SCHEDULED',
          createdAt: new Date(),
        },
      ]

      vi.mocked(prisma.mockInterview.findMany).mockResolvedValue(mockInterviews as any)

      const result = await MockInterviewService.getAll()

      expect(result).toEqual(mockInterviews)
      expect(prisma.mockInterview.findMany).toHaveBeenCalledWith({
        where: undefined,
        orderBy: { createdAt: 'desc' },
      })
    })

    it('should filter mock interviews by status', async () => {
      const mockInterviews = [
        {
          id: 'i1',
          userId: 'user1',
          status: 'PENDING',
          createdAt: new Date(),
        },
      ]

      vi.mocked(prisma.mockInterview.findMany).mockResolvedValue(mockInterviews as any)

      const result = await MockInterviewService.getAll({ status: 'PENDING' })

      expect(result).toEqual(mockInterviews)
      expect(prisma.mockInterview.findMany).toHaveBeenCalledWith({
        where: { status: 'PENDING' },
        orderBy: { createdAt: 'desc' },
      })
    })

    it('should order interviews by creation date descending', async () => {
      vi.mocked(prisma.mockInterview.findMany).mockResolvedValue([])

      await MockInterviewService.getAll()

      expect(prisma.mockInterview.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          orderBy: { createdAt: 'desc' },
        })
      )
    })
  })

  describe('getById', () => {
    it('should get mock interview by id', async () => {
      const mockInterview = {
        id: 'i1',
        userId: 'user1',
        status: 'PENDING',
      }

      vi.mocked(prisma.mockInterview.findUnique).mockResolvedValue(mockInterview as any)

      const result = await MockInterviewService.getById('i1')

      expect(result).toEqual(mockInterview)
      expect(prisma.mockInterview.findUnique).toHaveBeenCalledWith({
        where: { id: 'i1' },
      })
    })

    it('should return null when interview not found', async () => {
      vi.mocked(prisma.mockInterview.findUnique).mockResolvedValue(null)

      const result = await MockInterviewService.getById('invalid')

      expect(result).toBeNull()
    })
  })

  describe('update', () => {
    it('should update mock interview', async () => {
      const updateData = {
        status: 'SCHEDULED',
        scheduledDate: '2024-12-01T10:00:00Z',
        meetingLink: 'https://meet.example.com',
      }

      const updatedInterview = {
        id: 'i1',
        ...updateData,
        scheduledDate: new Date(updateData.scheduledDate),
      }

      vi.mocked(prisma.mockInterview.update).mockResolvedValue(updatedInterview as any)

      const result = await MockInterviewService.update('i1', updateData)

      expect(result).toEqual(updatedInterview)
      expect(prisma.mockInterview.update).toHaveBeenCalledWith({
        where: { id: 'i1' },
        data: expect.objectContaining({
          status: 'SCHEDULED',
          scheduledDate: expect.any(Date),
          meetingLink: 'https://meet.example.com',
        }),
      })
    })

    it('should add reviewer information when reviewedBy is provided', async () => {
      const updateData = { status: 'SCHEDULED' }
      const updatedInterview = {
        id: 'i1',
        status: 'SCHEDULED',
        reviewedBy: 'admin1',
        reviewedAt: new Date(),
      }

      vi.mocked(prisma.mockInterview.update).mockResolvedValue(updatedInterview as any)

      await MockInterviewService.update('i1', updateData, 'admin1')

      expect(prisma.mockInterview.update).toHaveBeenCalledWith({
        where: { id: 'i1' },
        data: expect.objectContaining({
          reviewedBy: 'admin1',
          reviewedAt: expect.any(Date),
        }),
      })
    })

    it('should convert scheduledDate string to Date object', async () => {
      const updateData = {
        scheduledDate: '2024-12-01T10:00:00Z',
      }

      vi.mocked(prisma.mockInterview.update).mockResolvedValue({} as any)

      await MockInterviewService.update('i1', updateData)

      expect(prisma.mockInterview.update).toHaveBeenCalledWith({
        where: { id: 'i1' },
        data: expect.objectContaining({
          scheduledDate: expect.any(Date),
        }),
      })
    })
  })

  describe('delete', () => {
    it('should delete mock interview', async () => {
      const deletedInterview = {
        id: 'i1',
        userId: 'user1',
      }

      vi.mocked(prisma.mockInterview.delete).mockResolvedValue(deletedInterview as any)

      const result = await MockInterviewService.delete('i1')

      expect(result).toEqual(deletedInterview)
      expect(prisma.mockInterview.delete).toHaveBeenCalledWith({
        where: { id: 'i1' },
      })
    })
  })

  describe('getByUserId', () => {
    it('should get mock interviews by user id', async () => {
      const mockInterviews = [
        {
          id: 'i1',
          userId: 'user1',
          status: 'PENDING',
          createdAt: new Date(),
        },
        {
          id: 'i2',
          userId: 'user1',
          status: 'SCHEDULED',
          createdAt: new Date(),
        },
      ]

      vi.mocked(prisma.mockInterview.findMany).mockResolvedValue(mockInterviews as any)

      const result = await MockInterviewService.getByUserId('user1')

      expect(result).toEqual(mockInterviews)
      expect(prisma.mockInterview.findMany).toHaveBeenCalledWith({
        where: { userId: 'user1' },
        orderBy: { createdAt: 'desc' },
      })
    })
  })
})

describe('OpportunityService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('create', () => {
    const validOpportunityData = {
      title: 'Software Engineer Internship',
      description: 'Join our team as an intern',
      type: 'INTERNSHIP',
      company: 'Tech Corp',
      location: 'San Francisco, CA',
      applicationUrl: 'https://example.com/apply',
      status: 'ACTIVE',
    }

    it('should create opportunity successfully', async () => {
      const mockOpportunity = {
        id: 'o1',
        ...validOpportunityData,
        postedBy: 'admin1',
        createdAt: new Date(),
      }

      vi.mocked(prisma.opportunity.create).mockResolvedValue(mockOpportunity as any)

      const result = await OpportunityService.create(validOpportunityData, 'admin1')

      expect(result).toEqual(mockOpportunity)
      expect(prisma.opportunity.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          ...validOpportunityData,
          postedBy: 'admin1',
        }),
      })
    })

    it('should default status to ACTIVE if not provided', async () => {
      const dataWithoutStatus = {
        title: 'Software Engineer',
        description: 'Join our team',
        type: 'FULL_TIME',
        company: 'Tech Corp',
      }

      const mockOpportunity = {
        id: 'o1',
        ...dataWithoutStatus,
        status: 'ACTIVE',
        postedBy: 'admin1',
      }

      vi.mocked(prisma.opportunity.create).mockResolvedValue(mockOpportunity as any)

      await OpportunityService.create(dataWithoutStatus as any, 'admin1')

      expect(prisma.opportunity.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          status: 'ACTIVE',
        }),
      })
    })
  })

  describe('getAll', () => {
    it('should get all opportunities with default ACTIVE filter', async () => {
      const mockOpportunities = [
        {
          id: 'o1',
          title: 'Opportunity 1',
          status: 'ACTIVE',
          createdAt: new Date(),
        },
      ]

      vi.mocked(prisma.opportunity.findMany).mockResolvedValue(mockOpportunities as any)

      const result = await OpportunityService.getAll()

      expect(result).toEqual(mockOpportunities)
      expect(prisma.opportunity.findMany).toHaveBeenCalledWith({
        where: { status: 'ACTIVE' },
        orderBy: { createdAt: 'desc' },
      })
    })

    it('should filter opportunities by type', async () => {
      const mockOpportunities = [
        {
          id: 'o1',
          title: 'Internship',
          type: 'INTERNSHIP',
          status: 'ACTIVE',
        },
      ]

      vi.mocked(prisma.opportunity.findMany).mockResolvedValue(mockOpportunities as any)

      await OpportunityService.getAll({ type: 'INTERNSHIP' })

      expect(prisma.opportunity.findMany).toHaveBeenCalledWith({
        where: {
          type: 'INTERNSHIP',
          status: 'ACTIVE',
        },
        orderBy: { createdAt: 'desc' },
      })
    })

    it('should filter opportunities by status', async () => {
      const mockOpportunities = [
        {
          id: 'o1',
          title: 'Closed Opportunity',
          status: 'CLOSED',
        },
      ]

      vi.mocked(prisma.opportunity.findMany).mockResolvedValue(mockOpportunities as any)

      await OpportunityService.getAll({ status: 'CLOSED' })

      expect(prisma.opportunity.findMany).toHaveBeenCalledWith({
        where: { status: 'CLOSED' },
        orderBy: { createdAt: 'desc' },
      })
    })

    it('should filter by both type and status', async () => {
      vi.mocked(prisma.opportunity.findMany).mockResolvedValue([])

      await OpportunityService.getAll({ type: 'INTERNSHIP', status: 'ACTIVE' })

      expect(prisma.opportunity.findMany).toHaveBeenCalledWith({
        where: {
          type: 'INTERNSHIP',
          status: 'ACTIVE',
        },
        orderBy: { createdAt: 'desc' },
      })
    })

    it('should order opportunities by creation date descending', async () => {
      vi.mocked(prisma.opportunity.findMany).mockResolvedValue([])

      await OpportunityService.getAll()

      expect(prisma.opportunity.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          orderBy: { createdAt: 'desc' },
        })
      )
    })
  })

  describe('getById', () => {
    it('should get opportunity by id', async () => {
      const mockOpportunity = {
        id: 'o1',
        title: 'Software Engineer',
        status: 'ACTIVE',
      }

      vi.mocked(prisma.opportunity.findUnique).mockResolvedValue(mockOpportunity as any)

      const result = await OpportunityService.getById('o1')

      expect(result).toEqual(mockOpportunity)
      expect(prisma.opportunity.findUnique).toHaveBeenCalledWith({
        where: { id: 'o1' },
      })
    })

    it('should return null when opportunity not found', async () => {
      vi.mocked(prisma.opportunity.findUnique).mockResolvedValue(null)

      const result = await OpportunityService.getById('invalid')

      expect(result).toBeNull()
    })
  })

  describe('update', () => {
    it('should update opportunity', async () => {
      const updateData = {
        title: 'Updated Title',
        status: 'CLOSED',
        location: 'Remote',
      }

      const updatedOpportunity = {
        id: 'o1',
        ...updateData,
      }

      vi.mocked(prisma.opportunity.update).mockResolvedValue(updatedOpportunity as any)

      const result = await OpportunityService.update('o1', updateData)

      expect(result).toEqual(updatedOpportunity)
      expect(prisma.opportunity.update).toHaveBeenCalledWith({
        where: { id: 'o1' },
        data: updateData,
      })
    })

    it('should allow partial updates', async () => {
      const updateData = { status: 'CLOSED' }

      vi.mocked(prisma.opportunity.update).mockResolvedValue({
        id: 'o1',
        status: 'CLOSED',
      } as any)

      await OpportunityService.update('o1', updateData)

      expect(prisma.opportunity.update).toHaveBeenCalledWith({
        where: { id: 'o1' },
        data: updateData,
      })
    })
  })

  describe('delete', () => {
    it('should delete opportunity', async () => {
      const deletedOpportunity = {
        id: 'o1',
        title: 'Software Engineer',
      }

      vi.mocked(prisma.opportunity.delete).mockResolvedValue(deletedOpportunity as any)

      const result = await OpportunityService.delete('o1')

      expect(result).toEqual(deletedOpportunity)
      expect(prisma.opportunity.delete).toHaveBeenCalledWith({
        where: { id: 'o1' },
      })
    })
  })

  describe('Edge Cases', () => {
    it('should handle empty results for getAll', async () => {
      vi.mocked(prisma.opportunity.findMany).mockResolvedValue([])

      const result = await OpportunityService.getAll()

      expect(result).toEqual([])
    })

    it('should handle empty results for getByUserId', async () => {
      vi.mocked(prisma.mockInterview.findMany).mockResolvedValue([])

      const result = await MockInterviewService.getByUserId('user1')

      expect(result).toEqual([])
    })

    it('should handle multiple filters simultaneously', async () => {
      vi.mocked(prisma.opportunity.findMany).mockResolvedValue([])

      await OpportunityService.getAll({
        type: 'FULL_TIME',
        status: 'ACTIVE',
      })

      expect(prisma.opportunity.findMany).toHaveBeenCalledWith({
        where: {
          type: 'FULL_TIME',
          status: 'ACTIVE',
        },
        orderBy: { createdAt: 'desc' },
      })
    })
  })
})
