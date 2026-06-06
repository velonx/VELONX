import { prisma } from "@/lib/prisma";
import { MockInterviewInput, UpdateMockInterviewInput, OpportunityInput, UpdateOpportunityInput } from "@/lib/validations/career";
import { generateUniqueOpportunitySlug } from "@/lib/utils/slug";

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
    const slug = await generateUniqueOpportunitySlug(data.title);
    return prisma.opportunity.create({
      data: {
        ...data,
        slug,
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

  static async getById(idOrSlug: string) {
    const isObjectId = /^[0-9a-fA-F]{24}$/.test(idOrSlug);
    // Fetch by id if it's a valid ObjectId, otherwise query by unique slug
    let opportunity = await prisma.opportunity.findUnique({
      where: isObjectId ? { id: idOrSlug } : { slug: idOrSlug },
    });

    if (opportunity && !opportunity.slug) {
      try {
        const newSlug = await generateUniqueOpportunitySlug(opportunity.title);
        opportunity = await prisma.opportunity.update({
          where: { id: opportunity.id },
          data: { slug: newSlug },
        });
      } catch (e) {
        console.error("Failed to backfill slug for opportunity:", opportunity.id, e);
      }
    }

    return opportunity;
  }

  static async update(id: string, data: UpdateOpportunityInput) {
    const updateData: any = { ...data };
    
    // Check if title is being updated, if so update the slug
    if (data.title !== undefined) {
      // Find existing to check if title changed
      const existing = await prisma.opportunity.findUnique({
        where: { id },
        select: { title: true, slug: true },
      });
      if (existing) {
        if (data.title !== existing.title) {
          updateData.slug = await generateUniqueOpportunitySlug(data.title, id);
        } else if (!existing.slug) {
          updateData.slug = await generateUniqueOpportunitySlug(data.title, id);
        }
      }
    } else {
      // If title is not being updated, check if it's missing slug and backfill it
      const existing = await prisma.opportunity.findUnique({
        where: { id },
        select: { title: true, slug: true },
      });
      if (existing && !existing.slug) {
        updateData.slug = await generateUniqueOpportunitySlug(existing.title, id);
      }
    }

    return prisma.opportunity.update({
      where: { id },
      data: updateData,
    });
  }

  static async delete(id: string) {
    return prisma.opportunity.delete({
      where: { id },
    });
  }
}
