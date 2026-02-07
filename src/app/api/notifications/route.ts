import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/middleware/auth.middleware";
import { withErrorHandler } from "@/lib/utils/errors";
import { notificationService } from "@/lib/services/notification.service";
import { NotificationType } from "@prisma/client";

/**
 * @swagger
 * /api/notifications:
 *   get:
 *     summary: Get user notifications
 *     description: Retrieve notifications for the authenticated user with pagination and filtering options
 *     tags:
 *       - Notifications
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
 *       - in: query
 *         name: read
 *         schema:
 *           type: boolean
 *         description: Filter by read status
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [INFO, SUCCESS, WARNING, ERROR]
 *         description: Filter by notification type
 *     responses:
 *       200:
 *         description: Notifications retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     notifications:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Notification'
 *                     pagination:
 *                       type: object
 *                       properties:
 *                         page:
 *                           type: integer
 *                         pageSize:
 *                           type: integer
 *                         total:
 *                           type: integer
 *                         totalPages:
 *                           type: integer
 *       401:
 *         description: Unauthorized - Authentication required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       429:
 *         description: Too many requests - Rate limit exceeded
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
export const GET = withErrorHandler(async (request: NextRequest) => {
  // Require authentication
  const sessionOrResponse = await requireAuth();
  if (sessionOrResponse instanceof NextResponse) {
    return sessionOrResponse;
  }

  const session = sessionOrResponse;
  const userId = session.user.id!;

  // Parse query parameters
  const searchParams = request.nextUrl.searchParams;
  const page = parseInt(searchParams.get("page") || "1", 10);
  const pageSize = parseInt(searchParams.get("pageSize") || "20", 10);
  const readParam = searchParams.get("read");
  const typeParam = searchParams.get("type");

  // Build params object
  const params: any = {
    userId,
    page,
    pageSize,
  };

  // Add read filter if provided
  if (readParam !== null) {
    params.read = readParam === "true";
  }

  // Add type filter if provided
  if (typeParam && Object.values(NotificationType).includes(typeParam as NotificationType)) {
    params.type = typeParam as NotificationType;
  }

  // Get notifications from service
  const result = await notificationService.listNotifications(params);

  return NextResponse.json(
    {
      success: true,
      data: result,
    },
    { status: 200 }
  );
});

/**
 * @swagger
 * /api/notifications:
 *   post:
 *     summary: Create a notification
 *     description: Create a new notification for a user (admin or system use)
 *     tags:
 *       - Notifications
 *     security:
 *       - sessionAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - userId
 *               - title
 *               - description
 *               - type
 *             properties:
 *               userId:
 *                 type: string
 *                 description: Target user ID
 *                 example: "507f1f77bcf86cd799439011"
 *               title:
 *                 type: string
 *                 description: Notification title
 *                 example: "New mentor session booked"
 *               description:
 *                 type: string
 *                 description: Notification description
 *                 example: "Your session with John Doe is scheduled for tomorrow"
 *               type:
 *                 type: string
 *                 enum: [INFO, SUCCESS, WARNING, ERROR]
 *                 description: Notification type
 *                 example: "INFO"
 *               actionUrl:
 *                 type: string
 *                 description: Optional action URL
 *                 example: "/mentor-sessions/123"
 *               metadata:
 *                 type: object
 *                 description: Additional metadata
 *     responses:
 *       201:
 *         description: Notification created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Notification'
 *                 message:
 *                   type: string
 *                   example: "Notification created successfully"
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
export const POST = withErrorHandler(async (request: NextRequest) => {
  // Require authentication
  const sessionOrResponse = await requireAuth();
  if (sessionOrResponse instanceof NextResponse) {
    return sessionOrResponse;
  }

  // Parse and validate request body
  const body = await request.json();
  const { userId, title, description, type, actionUrl, metadata } = body;

  // Validate required fields
  if (!userId || !title || !description || !type) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "VALIDATION_ERROR",
          message: "Missing required fields: userId, title, description, type",
        },
      },
      { status: 400 }
    );
  }

  // Create notification via service
  const notification = await notificationService.createNotification({
    userId,
    title,
    description,
    type,
    actionUrl,
    metadata,
  });

  return NextResponse.json(
    {
      success: true,
      data: notification,
      message: "Notification created successfully",
    },
    { status: 201 }
  );
});
