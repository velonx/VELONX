import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/middleware/auth.middleware";
import { handleError } from "@/lib/utils/errors";
import { userService } from "@/lib/services/user.service";

/**
 * @swagger
 * /api/users:
 *   get:
 *     summary: List all users (Admin only)
 *     description: Retrieve all users with pagination and filtering - requires admin authentication
 *     tags:
 *       - Users
 *       - Admin
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
 *         name: role
 *         schema:
 *           type: string
 *           enum: [STUDENT, MENTOR, ADMIN]
 *         description: Filter by user role
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search by name or email
 *     responses:
 *       200:
 *         description: Users retrieved successfully
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
 *                     $ref: '#/components/schemas/User'
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
 *       403:
 *         description: Forbidden - Admin access required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
export async function GET(request: NextRequest) {
  try {
    // Require admin authentication
    const sessionOrResponse = await requireAdmin();
    if (sessionOrResponse instanceof NextResponse) {
      return sessionOrResponse;
    }

    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const pageSize = parseInt(searchParams.get("pageSize") || "10");
    const role = searchParams.get("role") || undefined;
    const search = searchParams.get("search") || undefined;

    // Get users from service
    const result = await userService.listUsers({
      page,
      pageSize,
      role,
      search,
    });

    return NextResponse.json(
      {
        success: true,
        data: result.users,
        pagination: result.pagination,
      },
      { status: 200 }
    );
  } catch (error) {
    return handleError(error);
  }
}
