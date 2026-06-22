/**
 * GET /api/connections/requests — List pending connection requests
 */

import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/middleware/auth.middleware";
import { handleError } from "@/lib/utils/errors";
import { prisma } from "@/lib/prisma";

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
    const type = searchParams.get("type") || "received"; // "received" or "sent"

    const whereClause =
      type === "sent"
        ? { senderId: userId, status: "PENDING" as const }
        : { receiverId: userId, status: "PENDING" as const };

    const requests = await prisma.connection.findMany({
      where: whereClause,
      orderBy: { createdAt: "desc" },
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
    });

    const items = requests.map((conn) => ({
      connectionId: conn.id,
      message: conn.message,
      createdAt: conn.createdAt,
      user: type === "sent" ? conn.receiver : conn.sender,
    }));

    return NextResponse.json({
      success: true,
      data: {
        requests: items,
        type,
        count: items.length,
      },
    });
  } catch (error) {
    return handleError(error);
  }
}
