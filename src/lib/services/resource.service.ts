import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { NotFoundError } from "@/lib/utils/errors";
import { cacheService, CacheKeys, CacheTTL } from "./cache.service";

/**
 * Resource Service
 * Handles all business logic for resource management
 */
export class ResourceService {
  /**
   * List resources with pagination and filtering
   */
  async listResources(params: {
    page?: number;
    pageSize?: number;
    category?: string;
    type?: string;
    search?: string;
  }) {
    const { page = 1, pageSize = 10, category, type, search } = params;
    
    // Generate cache key based on parameters
    const cacheKey = CacheKeys.resource.list(page, category, type, search);
    
    return await cacheService.getOrSet(
      cacheKey,
      async () => {
        // Build where clause for filtering
        const where: Prisma.ResourceWhereInput = {};
        
        if (category) {
          where.category = category as any;
        }
        
        if (type) {
          where.type = type as any;
        }
        
        if (search) {
          where.OR = [
            {
              title: {
                contains: search,
                mode: "insensitive",
              },
            },
            {
              description: {
                contains: search,
                mode: "insensitive",
              },
            },
          ];
        }
        
        // Execute query with pagination
        const [resources, totalCount] = await Promise.all([
          prisma.resource.findMany({
            where,
            skip: (page - 1) * pageSize,
            take: pageSize,
            orderBy: {
              createdAt: "desc",
            },
          }),
          prisma.resource.count({ where }),
        ]);
        
        return {
          resources,
          pagination: {
            page,
            pageSize,
            totalCount,
            totalPages: Math.ceil(totalCount / pageSize),
          },
        };
      },
      CacheTTL.RESOURCE_LIST
    );
  }
  
  /**
   * Get resource by ID with full details
   */
  async getResourceById(id: string) {
    // Try to get from cache first
    const cacheKey = CacheKeys.resource.details(id);
    
    return await cacheService.getOrSet(
      cacheKey,
      async () => {
        const resource = await prisma.resource.findUnique({
          where: { id },
        });
        
        if (!resource) {
          throw new NotFoundError("Resource");
        }
        
        return resource;
      },
      CacheTTL.RESOURCE_DETAILS
    );
  }
  
  /**
   * Create a new resource
   */
  async createResource(data: {
    title: string;
    description: string;
    category: string;
    type: string;
    url: string;
    imageUrl?: string;
    accessCount?: number;
  }) {
    const resource = await prisma.resource.create({
      data: {
        title: data.title,
        description: data.description,
        category: data.category as any,
        type: data.type as any,
        url: data.url,
        imageUrl: data.imageUrl,
        accessCount: data.accessCount ?? 0,
      },
    });
    
    // Invalidate resource list cache after creation
    await cacheService.invalidate(CacheKeys.resource.all());
    
    return resource;
  }
  
  /**
   * Update an existing resource
   */
  async updateResource(
    id: string,
    data: {
      title?: string;
      description?: string;
      category?: string;
      type?: string;
      url?: string;
      imageUrl?: string;
      accessCount?: number;
    }
  ) {
    // Check if resource exists
    const existingResource = await prisma.resource.findUnique({
      where: { id },
    });
    
    if (!existingResource) {
      throw new NotFoundError("Resource");
    }
    
    // Build update data
    const updateData: Prisma.ResourceUpdateInput = {};
    
    if (data.title !== undefined) updateData.title = data.title;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.category !== undefined) updateData.category = data.category as any;
    if (data.type !== undefined) updateData.type = data.type as any;
    if (data.url !== undefined) updateData.url = data.url;
    if (data.imageUrl !== undefined) updateData.imageUrl = data.imageUrl;
    if (data.accessCount !== undefined) updateData.accessCount = data.accessCount;
    
    const resource = await prisma.resource.update({
      where: { id },
      data: updateData,
    });
    
    // Invalidate resource cache after update
    await cacheService.invalidate(CacheKeys.resource.all());
    
    return resource;
  }
  
  /**
   * Delete a resource
   */
  async deleteResource(id: string) {
    // Check if resource exists
    const existingResource = await prisma.resource.findUnique({
      where: { id },
    });
    
    if (!existingResource) {
      throw new NotFoundError("Resource");
    }
    
    await prisma.resource.delete({
      where: { id },
    });
    
    // Invalidate resource cache after deletion
    await cacheService.invalidate(CacheKeys.resource.all());
    
    return { success: true };
  }
  
  /**
   * Track resource access by incrementing access count
   */
  async trackResourceAccess(id: string) {
    // Check if resource exists
    const existingResource = await prisma.resource.findUnique({
      where: { id },
    });
    
    if (!existingResource) {
      throw new NotFoundError("Resource");
    }
    
    // Increment access count
    const resource = await prisma.resource.update({
      where: { id },
      data: {
        accessCount: {
          increment: 1,
        },
      },
    });
    
    // Invalidate resource cache after access count update
    await cacheService.delete(CacheKeys.resource.details(id));
    
    return resource;
  }
}

// Export singleton instance
export const resourceService = new ResourceService();
