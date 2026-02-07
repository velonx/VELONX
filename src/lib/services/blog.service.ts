import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { NotFoundError } from "@/lib/utils/errors";

/**
 * Blog Service
 * Handles all business logic for blog post management
 */
export class BlogService {
  /**
   * List blog posts with pagination and filtering
   */
  async listBlogPosts(params: {
    page?: number;
    pageSize?: number;
    authorId?: string;
    status?: string;
    tag?: string;
    search?: string;
    includesDrafts?: boolean;
  }) {
    const {
      page = 1,
      pageSize = 10,
      authorId,
      status,
      tag,
      search,
      includesDrafts = false,
    } = params;

    // Build where clause for filtering
    const where: Prisma.BlogPostWhereInput = {};

    // Filter by author
    if (authorId) {
      where.authorId = authorId;
    }

    // Filter by status - exclude drafts for non-admin users unless explicitly included
    if (status) {
      where.status = status as any;
    } else if (!includesDrafts) {
      where.status = "PUBLISHED";
    }

    // Filter by tag
    if (tag) {
      where.tags = {
        has: tag,
      };
    }

    // Search in title, content, or excerpt
    if (search) {
      where.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { content: { contains: search, mode: "insensitive" } },
        { excerpt: { contains: search, mode: "insensitive" } },
      ];
    }

    // Execute query with pagination
    const [blogPosts, totalCount] = await Promise.all([
      prisma.blogPost.findMany({
        where,
        include: {
          author: {
            select: {
              id: true,
              name: true,
              image: true,
              email: true,
            },
          },
        },
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy: {
          createdAt: "desc",
        },
      }),
      prisma.blogPost.count({ where }),
    ]);

    return {
      blogPosts,
      pagination: {
        page,
        pageSize,
        totalCount,
        totalPages: Math.ceil(totalCount / pageSize),
      },
    };
  }

  /**
   * Get blog post by ID with full details
   */
  async getBlogPostById(id: string, includesDrafts: boolean = false) {
    const blogPost = await prisma.blogPost.findUnique({
      where: { id },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            image: true,
            email: true,
            bio: true,
          },
        },
      },
    });

    if (!blogPost) {
      throw new NotFoundError("Blog post");
    }

    // If it's a draft and drafts are not allowed, throw not found
    if (blogPost.status === "DRAFT" && !includesDrafts) {
      throw new NotFoundError("Blog post");
    }

    return blogPost;
  }

  /**
   * Create a new blog post
   */
  async createBlogPost(data: {
    title: string;
    content: string;
    excerpt?: string;
    imageUrl?: string;
    tags?: string[];
    status?: string;
    authorId: string;
    publishedAt?: string;
  }) {
    const blogPost = await prisma.blogPost.create({
      data: {
        title: data.title,
        content: data.content,
        excerpt: data.excerpt,
        imageUrl: data.imageUrl,
        tags: data.tags || [],
        status: (data.status as any) || "DRAFT",
        authorId: data.authorId,
        publishedAt: data.publishedAt ? new Date(data.publishedAt) : null,
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            image: true,
            email: true,
          },
        },
      },
    });

    return blogPost;
  }

  /**
   * Update an existing blog post
   */
  async updateBlogPost(
    id: string,
    data: {
      title?: string;
      content?: string;
      excerpt?: string;
      imageUrl?: string;
      tags?: string[];
      status?: string;
      publishedAt?: string;
    }
  ) {
    // Check if blog post exists
    const existingBlogPost = await prisma.blogPost.findUnique({
      where: { id },
    });

    if (!existingBlogPost) {
      throw new NotFoundError("Blog post");
    }

    // Build update data
    const updateData: Prisma.BlogPostUpdateInput = {};

    if (data.title !== undefined) updateData.title = data.title;
    if (data.content !== undefined) updateData.content = data.content;
    if (data.excerpt !== undefined) updateData.excerpt = data.excerpt;
    if (data.imageUrl !== undefined) updateData.imageUrl = data.imageUrl;
    if (data.tags !== undefined) updateData.tags = data.tags;
    if (data.status !== undefined) updateData.status = data.status as any;
    if (data.publishedAt !== undefined)
      updateData.publishedAt = data.publishedAt ? new Date(data.publishedAt) : null;

    const blogPost = await prisma.blogPost.update({
      where: { id },
      data: updateData,
      include: {
        author: {
          select: {
            id: true,
            name: true,
            image: true,
            email: true,
          },
        },
      },
    });

    return blogPost;
  }

  /**
   * Delete a blog post
   */
  async deleteBlogPost(id: string) {
    // Check if blog post exists
    const existingBlogPost = await prisma.blogPost.findUnique({
      where: { id },
    });

    if (!existingBlogPost) {
      throw new NotFoundError("Blog post");
    }

    await prisma.blogPost.delete({
      where: { id },
    });

    return { success: true };
  }
}

// Export singleton instance
export const blogService = new BlogService();
