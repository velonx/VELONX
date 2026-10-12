import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { handleError } from "@/lib/utils/errors";

export const dynamic = "force-dynamic";

/**
 * GET /api/banners/active
 * Public — returns live pop-up banners for the current visitor, highest priority first.
 * Path targeting and dismissal are handled client-side.
 */
export async function GET() {
  try {
    const session = await auth();
    const isLoggedIn = !!session?.user;
    const now = new Date();

    const banners = await prisma.banner.findMany({
      where: {
        isActive: true,
        audience: { in: ["ALL", isLoggedIn ? "LOGGED_IN" : "GUESTS"] },
      },
      orderBy: [{ priority: "desc" }, { updatedAt: "desc" }],
      select: {
        id: true,
        title: true,
        message: true,
        imageUrl: true,
        ctaText: true,
        ctaUrl: true,
        frequency: true,
        pathPrefixes: true,
        delaySeconds: true,
        closeOnBackdrop: true,
        startsAt: true,
        endsAt: true,
        updatedAt: true,
      },
      take: 20,
    });

    // Schedule filtering in JS: unset vs null optional fields behave differently in MongoDB queries
    const live = banners
      .filter((b) => (!b.startsAt || b.startsAt <= now) && (!b.endsAt || b.endsAt > now))
      .map(({ startsAt: _s, endsAt: _e, ...rest }) => rest);

    return NextResponse.json(
      { success: true, data: live },
      { status: 200, headers: { "Cache-Control": "private, no-store" } }
    );
  } catch (error) {
    return handleError(error);
  }
}
