/**
 * GET /api/connections — List current user's accepted connections
 * POST /api/connections — Send a connection request
 */

import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/middleware/auth.middleware";
import { handleError } from "@/lib/utils/errors";
import { prisma } from "@/lib/prisma";
import { connectionRequestSchema } from "@/lib/validations/profile";
import { sendConnectionRequest } from "@/lib/services/connection.service";

/**
 * GET /api/connections
 * List accepted connections with pagination and search
 */
export async function GET(request: NextRequest) {
  try {
    const sessionOrResponse = await requireAuth();
    if (sessionOrResponse instanceof NextResponse) return sessionOrResponse;

    const userId = sessionOrResponse.user.id;
    if (!userId) {
      return NextResponse.json(
        { success: false, error: { code: "INVALID_SESSION", message: "User ID not found" } },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get("limit") || "20", 10)));
    const search = searchParams.get("q")?.trim() || "";
    const skip = (page - 1) * limit;

    // Build the where clause for accepted connections
    const whereClause: any = {
      status: "ACCEPTED",
      OR: [{ senderId: userId }, { receiverId: userId }],
    };

    const [connections, total] = await Promise.all([
      prisma.connection.findMany({
        where: whereClause,
        skip,
        take: limit,
        orderBy: { updatedAt: "desc" },
        include: {
          sender: {
            select: {
              id: true, name: true, slug: true, image: true, headline: true,
              college: true, skills: true, location: true,
            },
          },
          receiver: {
            select: {
              id: true, name: true, slug: true, image: true, headline: true,
              college: true, skills: true, location: true,
            },
          },
        },
      }),
      prisma.connection.count({ where: whereClause }),
    ]);

    // Map to return the "other" user in each connection
    let items = connections.map((conn) => {
      const otherUser = conn.senderId === userId ? conn.receiver : conn.sender;
      return {
        connectionId: conn.id,
        connectedAt: conn.updatedAt,
        user: otherUser,
      };
    });

    // Client-side search filter (for name/headline matching)
    if (search) {
      const searchLower = search.toLowerCase();
      items = items.filter(
        (item) =>
          item.user.name?.toLowerCase().includes(searchLower) ||
          item.user.headline?.toLowerCase().includes(searchLower)
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        connections: items,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      },
    });
  } catch (error) {
    return handleError(error);
  }
}

/**
 * POST /api/connections
 * Send a connection request
 */
export async function POST(request: NextRequest) {
  try {
    const sessionOrResponse = await requireAuth();
    if (sessionOrResponse instanceof NextResponse) return sessionOrResponse;

    const userId = sessionOrResponse.user.id;
    if (!userId) {
      return NextResponse.json(
        { success: false, error: { code: "INVALID_SESSION", message: "User ID not found" } },
        { status: 401 }
      );
    }

    const body = await request.json();
    const validated = connectionRequestSchema.parse(body);

    const result = await sendConnectionRequest(userId, validated.receiverId, validated.message);

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: { code: "CONNECTION_ERROR", message: result.error } },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: true, data: result.connection, message: "Connection request sent" },
      { status: 201 }
    );
  } catch (error) {
    return handleError(error);
  }
}
