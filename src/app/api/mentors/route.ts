import { NextRequest, NextResponse } from "next/server";
import { mentorService } from "@/lib/services/mentor.service";
import { requireAuth, requireAdmin } from "@/lib/middleware/auth.middleware";
import { handleError } from "@/lib/utils/errors";
import { createMentorSchema, mentorQuerySchema } from "@/lib/validations/mentor";

/**
 * GET /api/mentors
 * List mentors with pagination and filtering
 * Public endpoint
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Parse and validate query parameters
    const queryParams = mentorQuerySchema.parse({
      page: searchParams.get("page"),
      pageSize: searchParams.get("pageSize"),
      expertise: searchParams.get("expertise"),
      company: searchParams.get("company"),
      available: searchParams.get("available"),
    });
    
    const result = await mentorService.listMentors({
      page: queryParams.page,
      pageSize: queryParams.pageSize,
      expertise: queryParams.expertise,
      company: queryParams.company,
      available: queryParams.available,
    });
    
    return NextResponse.json({
      success: true,
      data: result.mentors,
      pagination: result.pagination,
    });
  } catch (error) {
    return handleError(error);
  }
}

/**
 * POST /api/mentors
 * Create a new mentor
 * Admin only
 */
export async function POST(request: NextRequest) {
  try {
    // Verify admin authentication
    const session = await requireAdmin();
    if (session instanceof NextResponse) return session;
    
    // Parse and validate request body
    const body = await request.json();
    const validatedData = createMentorSchema.parse(body);
    
    const mentor = await mentorService.createMentor(validatedData);
    
    return NextResponse.json(
      {
        success: true,
        data: mentor,
      },
      { status: 201 }
    );
  } catch (error) {
    return handleError(error);
  }
}
