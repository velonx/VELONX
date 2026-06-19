import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/middleware/auth.middleware";
import { handleError } from "@/lib/utils/errors";
import { z } from "zod";
import { InstantEmailService } from "@/lib/services/instant-email.service";

const createItemSchema = z.object({
  name: z.string().min(2).max(100),
  description: z.string().min(5).max(500),
  imageUrl: z.string().url().optional().nullable(),
  category: z.enum(["NOTEBOOK", "DIARY", "BOTTLE", "BAG", "PLANT", "LAMP", "STATIONERY", "APPAREL", "OTHER"]),
  xpCost: z.number().int().min(1),
  stock: z.number().int().min(-1).default(-1),
  isActive: z.boolean().default(true),
});

/**
 * GET /api/admin/swag/items
 * List all swag items (including inactive) — admin only
 */
export async function GET(request: NextRequest) {
  try {
    const sessionOrResponse = await requireAdmin();
    if (sessionOrResponse instanceof NextResponse) return sessionOrResponse;

    const items = await prisma.swagItem.findMany({
      include: { _count: { select: { orders: true } } },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ success: true, data: items }, { status: 200 });
  } catch (error) {
    return handleError(error);
  }
}

/**
 * POST /api/admin/swag/items
 * Create a new swag item — admin only
 */
export async function POST(request: NextRequest) {
  try {
    const sessionOrResponse = await requireAdmin();
    if (sessionOrResponse instanceof NextResponse) return sessionOrResponse;

    const body = await request.json();
    const data = createItemSchema.parse(body);

    const item = await prisma.swagItem.create({ data });

    // Dispatch swag drop announcement email notifications (fire-and-forget)
    InstantEmailService.dispatch({
      category: "SWAG_ANNOUNCED",
      payload: {
        swagId: item.id,
        name: item.name,
        description: item.description,
        imageUrl: item.imageUrl || undefined,
      },
    }).catch((err) => {
      console.error("[SwagAnnouncedDispatch] Failed to dispatch instant email:", err);
    });

    return NextResponse.json(
      { success: true, data: item, message: "Swag item created successfully" },
      { status: 201 }
    );
  } catch (error) {
    return handleError(error);
  }
}
