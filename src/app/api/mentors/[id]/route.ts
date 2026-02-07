import { NextRequest, NextResponse } from "next/server";
import { mentorService } from "@/lib/services/mentor.service";
import { requireAdmin } from "@/lib/middleware/auth.middleware";
import { handleError } from "@/lib/utils/errors";
import { updateMentorSchema } from "@/lib/validations/mentor";

/**
 * GET /api/mentors/[id]
 * Get mentor details by ID
 * Public endpoint
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const mentor = await mentorService.getMentorById(id);
    
    return NextResponse.json({
      success: true,
      data: mentor,
    });
  } catch (error) {
    return handleError(error);
  }
}

/**
 * PATCH /api/mentors/[id]
 * Update mentor details
 * Admin only
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    // Verify admin authentication
    const session = await requireAdmin();
    if (session instanceof NextResponse) return session;
    
    // Parse and validate request body
    const body = await request.json();
    const validatedData = updateMentorSchema.parse(body);
    
    const mentor = await mentorService.updateMentor(id, validatedData);
    
    return NextResponse.json({
      success: true,
      data: mentor,
    });
  } catch (error) {
    return handleError(error);
  }
}

/**
 * DELETE /api/mentors/[id]
 * Delete a mentor
 * Admin only
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    // Verify admin authentication
    const session = await requireAdmin();
    if (session instanceof NextResponse) return session;
    
    await mentorService.deleteMentor(id);
    
    return NextResponse.json(
      {
        success: true,
        message: "Mentor deleted successfully",
      },
      { status: 200 }
    );
  } catch (error) {
    return handleError(error);
  }
}
