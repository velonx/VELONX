import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { NotFoundError } from "@/lib/utils/errors";

/**
 * Mentor Service
 * Handles all business logic for mentor management
 */
export class MentorService {
  /**
   * List mentors with pagination and filtering
   */
  async listMentors(params: {
    page?: number;
    pageSize?: number;
    expertise?: string;
    company?: string;
    available?: boolean;
  }) {
    const { page = 1, pageSize = 10, expertise, company, available } = params;
    
    // Build where clause for filtering
    const where: Prisma.MentorWhereInput = {};
    
    if (expertise) {
      where.expertise = {
        has: expertise,
      };
    }
    
    if (company) {
      where.company = {
        contains: company,
        mode: "insensitive",
      };
    }
    
    if (available !== undefined) {
      where.available = available;
    }
    
    // Execute query with pagination
    const [mentors, totalCount] = await Promise.all([
      prisma.mentor.findMany({
        where,
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy: {
          rating: "desc",
        },
      }),
      prisma.mentor.count({ where }),
    ]);
    
    return {
      mentors,
      pagination: {
        page,
        pageSize,
        totalCount,
        totalPages: Math.ceil(totalCount / pageSize),
      },
    };
  }
  
  /**
   * Get mentor by ID with full details
   */
  async getMentorById(id: string) {
    const mentor = await prisma.mentor.findUnique({
      where: { id },
    });
    
    if (!mentor) {
      throw new NotFoundError("Mentor");
    }
    
    return mentor;
  }
  
  /**
   * Create a new mentor
   */
  async createMentor(data: {
    name: string;
    email: string;
    expertise: string[];
    company: string;
    bio: string;
    imageUrl?: string;
    rating?: number;
    totalSessions?: number;
    available?: boolean;
    linkedinUrl?: string | null;
    githubUrl?: string | null;
    twitterUrl?: string | null;
  }) {
    const mentor = await prisma.mentor.create({
      data: {
        name: data.name,
        email: data.email,
        expertise: data.expertise,
        company: data.company,
        bio: data.bio,
        imageUrl: data.imageUrl,
        rating: data.rating ?? 0,
        totalSessions: data.totalSessions ?? 0,
        available: data.available ?? true,
        linkedinUrl: data.linkedinUrl,
        githubUrl: data.githubUrl,
        twitterUrl: data.twitterUrl,
      },
    });
    
    return mentor;
  }
  
  /**
   * Update an existing mentor
   */
  async updateMentor(
    id: string,
    data: {
      name?: string;
      email?: string;
      expertise?: string[];
      company?: string;
      bio?: string;
      imageUrl?: string;
      rating?: number;
      totalSessions?: number;
      available?: boolean;
      linkedinUrl?: string | null;
      githubUrl?: string | null;
      twitterUrl?: string | null;
    }
  ) {
    // Check if mentor exists
    const existingMentor = await prisma.mentor.findUnique({
      where: { id },
    });
    
    if (!existingMentor) {
      throw new NotFoundError("Mentor");
    }
    
    // Build update data
    const updateData: Prisma.MentorUpdateInput = {};
    
    if (data.name !== undefined) updateData.name = data.name;
    if (data.email !== undefined) updateData.email = data.email;
    if (data.expertise !== undefined) updateData.expertise = data.expertise;
    if (data.company !== undefined) updateData.company = data.company;
    if (data.bio !== undefined) updateData.bio = data.bio;
    if (data.imageUrl !== undefined) updateData.imageUrl = data.imageUrl;
    if (data.rating !== undefined) updateData.rating = data.rating;
    if (data.totalSessions !== undefined) updateData.totalSessions = data.totalSessions;
    if (data.available !== undefined) updateData.available = data.available;
    if (data.linkedinUrl !== undefined) updateData.linkedinUrl = data.linkedinUrl;
    if (data.githubUrl !== undefined) updateData.githubUrl = data.githubUrl;
    if (data.twitterUrl !== undefined) updateData.twitterUrl = data.twitterUrl;
    
    const mentor = await prisma.mentor.update({
      where: { id },
      data: updateData,
    });
    
    return mentor;
  }
  
  /**
   * Delete a mentor
   */
  async deleteMentor(id: string) {
    // Check if mentor exists
    const existingMentor = await prisma.mentor.findUnique({
      where: { id },
    });
    
    if (!existingMentor) {
      throw new NotFoundError("Mentor");
    }
    
    await prisma.mentor.delete({
      where: { id },
    });
    
    return { success: true };
  }
}

// Export singleton instance
export const mentorService = new MentorService();
