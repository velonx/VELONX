import { prisma } from "@/lib/prisma";
import { MockInterviewInput, UpdateMockInterviewInput, OpportunityInput, UpdateOpportunityInput } from "@/lib/validations/career";

// Mock Interview Services
export class MockInterviewService {
  static async create(userId: string, data: MockInterviewInput) {
    const preferredDateTime = new Date(`${data.preferredDate}T${data.preferredTime}`);
    
    return prisma.mockInterview.create({
      data: {
        userId,
        email: data.email,
        preferredDate: preferredDateTime,
        preferredTime: data.preferredTime,
        interviewType: data.interviewType,
        experienceLevel: data.experienceLevel,
      },
    });
  }

  static async getAll(filters?: { status?: string }) {
    return prisma.mockInterview.findMany({
      where: filters?.status ? { status: filters.status as any } : undefined,
      orderBy: { createdAt: "desc" },
    });
  }

  static async getById(id: string) {
    return prisma.mockInterview.findUnique({
      where: { id },
    });
  }

  static async update(id: string, data: UpdateMockInterviewInput, reviewedBy?: string) {
    const updateData: any = { ...data };
    
    if (data.scheduledDate) {
      updateData.scheduledDate = new Date(data.scheduledDate);
    }
    
    if (reviewedBy) {
      updateData.reviewedBy = reviewedBy;
      updateData.reviewedAt = new Date();
    }

    return prisma.mockInterview.update({
      where: { id },
      data: updateData,
    });
  }

  static async delete(id: string) {
    return prisma.mockInterview.delete({
      where: { id },
    });
  }

  static async getByUserId(userId: string) {
    return prisma.mockInterview.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });
  }
}

// Opportunity Services
export class OpportunityService {
  static async create(data: OpportunityInput, postedBy: string) {
    return prisma.opportunity.create({
      data: {
        ...data,
        postedBy,
        status: data.status || "ACTIVE",
      },
    });
  }

  static async getAll(filters?: { type?: string; status?: string }) {
    const where: any = {};
    
    if (filters?.type) {
      where.type = filters.type;
    }
    
    // Only add status filter if explicitly provided (not "all" or undefined)
    if (filters?.status && filters.status !== "all") {
      where.status = filters.status;
    }

    return prisma.opportunity.findMany({
      where,
      orderBy: { createdAt: "desc" },
    });
  }

  static async getById(id: string) {
    return prisma.opportunity.findUnique({
      where: { id },
    });
  }

  static async update(id: string, data: UpdateOpportunityInput) {
    return prisma.opportunity.update({
      where: { id },
      data,
    });
  }

  static async delete(id: string) {
    return prisma.opportunity.delete({
      where: { id },
    });
  }
}
