import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/middleware/auth.middleware";
import { withErrorHandler } from "@/lib/utils/errors";
import { discussionRoomService } from "@/lib/services/discussion-room.service";
import { z } from "zod";

/**
 * Validation schema for creating a discussion room
 */
const createRoomSchema = z.object({
  name: z.string().min(1, "Room name is required").max(100, "Room name must be 100 characters or less"),
  description: z.string().min(1, "Room description is required").max(500, "Room description must be 500 characters or less"),
  isPrivate: z.boolean(),
  imageUrl: z.string().url("Invalid image URL").optional(),
});

/**
 * @swagger
 * /api/community/rooms:
 *   post:
 *     summary: Create a discussion room
 *     description: Create a new discussion room with the authenticated user as creator and moderator
 *     tags:
 *       - Community - Rooms
 *     security:
 *       - sessionAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - description
 *               - isPrivate
 *             properties:
 *               name:
 *                 type: string
 *                 description: Room name
 *                 example: "Web Development Discussion"
 *               description:
 *                 type: string
 *                 description: Room description
 *                 example: "A place to discuss web development topics"
 *               isPrivate:
 *                 type: boolean
 *                 description: Whether the room is private
 *                 example: false
 *               imageUrl:
 *                 type: string
 *                 description: Optional room image URL
 *                 example: "https://example.com/image.jpg"
 *     responses:
 *       201:
 *         description: Room created successfully
 *       400:
 *         description: Bad request - Invalid input
 *       401:
 *         description: Unauthorized - Authentication required
 */
export const POST = withErrorHandler(async (request: NextRequest) => {
  // Require authentication
  const sessionOrResponse = await requireAuth();
  if (sessionOrResponse instanceof NextResponse) {
    return sessionOrResponse;
  }

  const session = sessionOrResponse;
  const userId = session.user.id!;

  // Parse and validate request body
  const body = await request.json();
  const validatedData = createRoomSchema.parse(body);

  // Create room via service
  const room = await discussionRoomService.createRoom(validatedData, userId);

  return NextResponse.json(
    {
      success: true,
      data: room,
      message: "Discussion room created successfully",
    },
    { status: 201 }
  );
});

/**
 * @swagger
 * /api/community/rooms:
 *   get:
 *     summary: List discussion rooms
 *     description: Retrieve all discussion rooms with pagination
 *     tags:
 *       - Community - Rooms
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
 *           default: 20
 *         description: Number of items per page
 *     responses:
 *       200:
 *         description: Rooms retrieved successfully
 *       401:
 *         description: Unauthorized - Authentication required
 */
export const GET = withErrorHandler(async (request: NextRequest) => {
  // Require authentication
  const sessionOrResponse = await requireAuth();
  if (sessionOrResponse instanceof NextResponse) {
    return sessionOrResponse;
  }

  // Parse query parameters
  const searchParams = request.nextUrl.searchParams;
  const page = parseInt(searchParams.get("page") || "1", 10);
  const pageSize = parseInt(searchParams.get("pageSize") || "20", 10);

  // Calculate skip for pagination
  const skip = (page - 1) * pageSize;

  // Get rooms from database with pagination
  const { prisma } = await import("@/lib/prisma");
  
  const [rooms, total] = await Promise.all([
    prisma.discussionRoom.findMany({
      skip,
      take: pageSize,
      include: {
        creator: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
        _count: {
          select: {
            members: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.discussionRoom.count(),
  ]);

  // Format response with member counts
  const formattedRooms = rooms.map((room) => ({
    ...room,
    memberCount: room._count.members,
    _count: undefined,
  }));

  return NextResponse.json(
    {
      success: true,
      data: formattedRooms,
      pagination: {
        page,
        pageSize,
        total,
        totalPages: Math.ceil(total / pageSize),
      },
    },
    { status: 200 }
  );
});
