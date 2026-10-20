import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/middleware/auth.middleware";
import { handleError } from "@/lib/utils/errors";
import { gallerySettingsSchema } from "@/lib/validations/cms";
import { isGalleryEnabled, setGalleryEnabled } from "@/lib/site-settings";

/**
 * GET /api/admin/gallery/settings
 * Whether the landing-page gallery is shown — admin only
 */
export async function GET() {
  try {
    const sessionOrResponse = await requireAdmin();
    if (sessionOrResponse instanceof NextResponse) return sessionOrResponse;

    return NextResponse.json({ success: true, data: { enabled: await isGalleryEnabled() } }, { status: 200 });
  } catch (error) {
    return handleError(error);
  }
}

/**
 * PUT /api/admin/gallery/settings
 * Show or hide the landing-page gallery — admin only
 */
export async function PUT(request: NextRequest) {
  try {
    const sessionOrResponse = await requireAdmin();
    if (sessionOrResponse instanceof NextResponse) return sessionOrResponse;

    const { enabled } = gallerySettingsSchema.parse(await request.json());
    await setGalleryEnabled(enabled);

    return NextResponse.json(
      { success: true, data: { enabled }, message: enabled ? "Gallery shown on landing page" : "Gallery hidden" },
      { status: 200 }
    );
  } catch (error) {
    return handleError(error);
  }
}
