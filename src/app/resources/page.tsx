import { Metadata } from "next";
import ResourcesClient from "./ResourcesClient";
import { generatePageMetadata } from "@/lib/seo.config";
import { prisma } from "@/lib/prisma";
import { ResourceStructuredData } from "@/components/resources/resource-structured-data";

export const dynamic = "force-dynamic";

// Page-specific SEO keywords for Quick References / Resources
const RESOURCE_KEYWORDS = [
  "developer cheat sheets",
  "quick reference guides",
  "programming PDF guides",
  "coding tutorials",
  "developer resources",
  "learning paths",
  "student guides",
  "tech learning materials",
  "software development courses",
  "web development resources",
  "data science guides",
  "DevOps cheat sheets",
];

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
        const metadata = generatePageMetadata(
          `${resource.title} - Quick Reference | Velonx`,
          resource.description,
          `/resources?id=${resourceId}`
        );
        return {
          ...metadata,
          keywords: [
            resource.title.toLowerCase(),
            resource.category.toLowerCase().replace("_", " "),
            resource.type.toLowerCase(),
            ...RESOURCE_KEYWORDS,
          ],
        };
      }
    } catch (err) {
      console.error("[SEO Metadata] Failed to fetch resource details:", err);
    }
  }

  const metadata = generatePageMetadata(
    "Learning Resources & Student Guides | Velonx",
    "Access curated tutorials, courses, templates, and tools to accelerate your learning. Level up your coding, design, and product building skills with Velonx.",
    "/resources"
  );
  return {
    ...metadata,
    keywords: RESOURCE_KEYWORDS,
  };
}

export default async function ResourcesPage({ searchParams }: Props) {
  const params = await searchParams;
  const resourceId = typeof params.id === "string" ? params.id : undefined;

  // Fetch resource data for structured data if deep-linked
  let resourceData = null;
  let totalResources: number | undefined;

  if (resourceId && resourceId.match(/^[0-9a-fA-F]{24}$/)) {
    try {
      const resource = await prisma.resource.findUnique({
        where: { id: resourceId },
      });
      if (resource) {
        resourceData = {
          id: resource.id,
          title: resource.title,
          description: resource.description,
          category: resource.category,
          type: resource.type,
          url: resource.url ?? undefined,
          imageUrl: resource.imageUrl,
          accessCount: resource.accessCount,
          pdfUrl: resource.pdfUrl ?? undefined,
          pdfFileName: resource.pdfFileName ?? undefined,
          createdAt: resource.createdAt.toISOString(),
          updatedAt: resource.updatedAt.toISOString(),
        };
      }
    } catch (err) {
      console.error("[SEO Structured Data] Failed to fetch resource:", err);
    }
  } else {
    // Fetch total count for CollectionPage schema
    try {
      totalResources = await prisma.resource.count();
    } catch (err) {
      console.error("[SEO Structured Data] Failed to count resources:", err);
    }
  }

  return (
    <>
      <ResourceStructuredData
        resource={resourceData}
        totalResources={totalResources}
      />
      <ResourcesClient />
    </>
  );
}
