import { NextRequest, NextResponse } from "next/server";
import { mentorSessionService } from "@/lib/services/mentor-session.service";
import { requireAuth } from "@/lib/middleware/auth.middleware";
import { handleError } from "@/lib/utils/errors";
import { createSessionSchema, sessionQuerySchema } from "@/lib/validations/mentor-session";

/**
 * @swagger
 * /api/mentor-sessions:
 *   get:
 *     summary: List mentor sessions
 *     description: Retrieve mentor sessions for the authenticated user with pagination and filtering
 *     tags:
 *       - Mentor Sessions
 *     security:
 *       - sessionAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number for pagination
 *       - in: query
 *         name: pageSize
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of items per page
 *       - in: query
 *         name: mentorId
 *         schema:
 *           type: string
 *         description: Filter by mentor ID
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [SCHEDULED, COMPLETED, CANCELLED]
 *         description: Filter by session status
 *       - in: query
 *         name: viewAs
 *         schema:
 *           type: string
 *           enum: [student, mentor]
 *           default: student
 *         description: View sessions as student or mentor
 *     responses:
 *       200:
 *         description: Sessions retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/MentorSession'
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     page:
 *                       type: integer
 *                     pageSize:
 *                       type: integer
 *                     total:
 *                       type: integer
 *                     totalPages:
 *                       type: integer
 *       401:
 *         description: Unauthorized - Authentication required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const sessionOrResponse = await requireAuth();
    if (sessionOrResponse instanceof NextResponse) {
      return sessionOrResponse;
    }
    
    const session = sessionOrResponse;
    const { searchParams } = new URL(request.url);
    
    // Parse and validate query parameters
    const queryParams = sessionQuerySchema.parse({
      page: searchParams.get("page"),
      pageSize: searchParams.get("pageSize"),
      mentorId: searchParams.get("mentorId"),
      status: searchParams.get("status"),
    });
    
    // Determine if user is viewing as student or checking mentor sessions
    const viewAs = searchParams.get("viewAs") || "student";
    
    const result = await mentorSessionService.listSessions({
      ...queryParams,
      userId: session.user.id,
      userRole: viewAs as 'student' | 'mentor',
    });
    
    return NextResponse.json(
      {
        success: true,
        data: result.sessions,
        pagination: result.pagination,
      },
      { status: 200 }
    );
  } catch (error) {
    return handleError(error);
  }
}

/**
 * @swagger
 * /api/mentor-sessions:
 *   post:
 *     summary: Book a mentor session
 *     description: Create a new mentor session booking for the authenticated student
 *     tags:
 *       - Mentor Sessions
 *     security:
 *       - sessionAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - mentorId
 *               - scheduledAt
 *               - duration
 *               - topic
 *             properties:
 *               mentorId:
 *                 type: string
 *                 description: Mentor user ID
 *                 example: "507f1f77bcf86cd799439011"
 *               scheduledAt:
 *                 type: string
 *                 format: date-time
 *                 description: Scheduled session time
 *                 example: "2024-12-25T10:00:00Z"
 *               duration:
 *                 type: integer
 *                 description: Session duration in minutes
 *                 example: 60
 *               topic:
 *                 type: string
 *                 description: Session topic or focus area
 *                 example: "React hooks and state management"
 *               notes:
 *                 type: string
 *                 description: Additional notes or questions
 *                 example: "I need help understanding useEffect dependencies"
 *     responses:
 *       201:
 *         description: Session booked successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/MentorSession'
 *                 message:
 *                   type: string
 *                   example: "Session booked successfully"
 *       400:
 *         description: Bad request - Invalid input
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Unauthorized - Authentication required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const sessionOrResponse = await requireAuth();
    if (sessionOrResponse instanceof NextResponse) {
      return sessionOrResponse;
    }
    
    const session = sessionOrResponse;
    
    // Ensure user ID exists
    if (!session.user.id) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "INVALID_SESSION",
            message: "User ID not found in session",
          },
        },
        { status: 401 }
      );
    }
    
    // Parse and validate request body
    const body = await request.json();
    const validatedData = createSessionSchema.parse(body);
    
    // Create session
    const mentorSession = await mentorSessionService.createSession({
      ...validatedData,
      studentId: session.user.id,
    });
    
    return NextResponse.json(
      {
        success: true,
        data: mentorSession,
        message: "Session booked successfully",
      },
      { status: 201 }
    );
  } catch (error) {
    return handleError(error);
  }
}
