import { NextRequest, NextResponse } from "next/server";
import { resourceService } from "@/lib/services/resource.service";
import { requireAdmin } from "@/lib/middleware/auth.middleware";
import { handleError } from "@/lib/utils/errors";
import { createResourceSchema, resourceQuerySchema } from "@/lib/validations/resource";

/**
 * GET /api/resources
 * List resources with pagination and filtering
 * Public endpoint
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Parse and validate query parameters
    const queryParams = resourceQuerySchema.parse({
      page: searchParams.get("page"),
      pageSize: searchParams.get("pageSize"),
      category: searchParams.get("category"),
      type: searchParams.get("type"),
      search: searchParams.get("search"),
    });
    
    const result = await resourceService.listResources({
      page: queryParams.page,
      pageSize: queryParams.pageSize,
      category: queryParams.category,
      type: queryParams.type,
      search: queryParams.search,
    });
    
    return NextResponse.json({
      success: true,
      data: result.resources,
      pagination: result.pagination,
    });
  } catch (error) {
    return handleError(error);
  }
}

/**
 * POST /api/resources
 * Create a new resource
 * Admin only
 */
export async function POST(request: NextRequest) {
  try {
    // Verify admin authentication
    const session = await requireAdmin();
    if (session instanceof NextResponse) return session;
    
    // Parse and validate request body
    const body = await request.json();
    const validatedData = createResourceSchema.parse(body);
    
    const resource = await resourceService.createResource(validatedData);
    
    return NextResponse.json(
      {
        success: true,
        data: resource,
      },
      { status: 201 }
    );
  } catch (error) {
    return handleError(error);
  }
}
