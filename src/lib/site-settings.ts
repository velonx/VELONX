import { prisma } from "@/lib/prisma";

export const GALLERY_ENABLED_KEY = "gallery.enabled";

/** Whether the landing-page gallery is switched on (off until an admin enables it). */
export async function isGalleryEnabled(): Promise<boolean> {
  const setting = await prisma.siteSetting.findUnique({ where: { key: GALLERY_ENABLED_KEY } });
  return setting?.value === true;
}

export async function setGalleryEnabled(enabled: boolean): Promise<void> {
  await prisma.siteSetting.upsert({
    where: { key: GALLERY_ENABLED_KEY },
    create: { key: GALLERY_ENABLED_KEY, value: enabled },
    update: { value: enabled },
  });
}
