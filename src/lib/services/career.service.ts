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

    const updated = await prisma.mockInterview.update({
      where: { id },
      data: updateData,
    });

    if (data.status === 'COMPLETED') {
      try {
        const { BadgeService } = await import('./badge.service');
        await BadgeService.evaluateAndAwardBadges(updated.userId, 'CAREER');
      } catch (badgeErr) {
        console.error('Failed to evaluate mock interview badges:', badgeErr);
      }
    }

    return updated;
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
    const slug = await generateUniqueOpportunitySlug(data.title, data.company);
    const { deadline: deadlineStr, ...rest } = data;
    return prisma.opportunity.create({
      data: {
        ...rest,
        slug,
        postedBy,
        status: data.status || "ACTIVE",
        deadline: deadlineStr ? new Date(deadlineStr) : null,
      },
    });
  }

  /**
   * Auto-close any ACTIVE opportunities whose deadline has passed.
   * This ensures the DB stays consistent — crawlers and visitors never see
   * an ACTIVE listing with a past deadline.
   */
  static async autoCloseExpiredOpportunities() {
    try {
      const result = await prisma.opportunity.updateMany({
        where: {
          status: "ACTIVE",
          deadline: {
            lt: new Date(),
            not: null,
          },
        },
        data: {
          status: "CLOSED",
        },
      });
      if (result && result.count > 0) {
        console.log(`[Career] Auto-closed ${result.count} expired opportunities`);
      }
    } catch (err) {
      // Non-critical — log but don't block the request
      console.error("[Career] Failed to auto-close expired opportunities:", err);
    }
  }

  static async getAll(filters?: { type?: string; status?: string | any }) {
    // Auto-close expired listings before fetching
    await OpportunityService.autoCloseExpiredOpportunities();

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
        const newSlug = await generateUniqueOpportunitySlug(opportunity.title, opportunity.company, opportunity.id);
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
    const { deadline: deadlineStr, ...rest } = data;
    const updateData: any = { ...rest };

    // Parse deadline string to Date if provided
    if (deadlineStr !== undefined) {
      updateData.deadline = deadlineStr ? new Date(deadlineStr) : null;
    }
    
    // Find existing to check if title or company changed, or if slug is missing
    const existing = await prisma.opportunity.findUnique({
      where: { id },
      select: { title: true, company: true, slug: true },
    });

    if (existing) {
      const newTitle = data.title !== undefined ? data.title : existing.title;
      const newCompany = data.company !== undefined ? data.company : existing.company;
      const titleChanged = data.title !== undefined && data.title !== existing.title;
      const companyChanged = data.company !== undefined && data.company !== existing.company;

      if (titleChanged || companyChanged || !existing.slug) {
        updateData.slug = await generateUniqueOpportunitySlug(newTitle, newCompany, id);
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
