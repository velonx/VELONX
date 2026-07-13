import { Metadata } from "next";
import ResourcesClient from "./ResourcesClient";
import { generatePageMetadata } from "@/lib/seo.config";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

interface Props {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const params = await searchParams;
  const resourceId = typeof params.id === "string" ? params.id : undefined;

  if (resourceId && resourceId.match(/^[0-9a-fA-F]{24}$/)) {
    try {
      const resource = await prisma.resource.findUnique({
        where: { id: resourceId },
      });

      if (resource) {
        return generatePageMetadata(
          `${resource.title} - Quick Reference | Velonx`,
          resource.description,
          `/resources?id=${resourceId}`
        );
      }
    } catch (err) {
      console.error("[SEO Metadata] Failed to fetch resource details:", err);
    }
  }

  return generatePageMetadata(
    "Learning Resources & Student Guides | Velonx",
    "Access curated tutorials, courses, templates, and tools to accelerate your learning. Level up your coding, design, and product building skills with Velonx.",
    "/resources"
  );
}

export default function ResourcesPage() {
  return <ResourcesClient />;
}
