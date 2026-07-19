import { Metadata } from 'next';
import { notFound, redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { generatePageMetadata } from '@/lib/seo.config';
import { ResourceStructuredData } from '@/components/resources/resource-structured-data';
import { ResourceDetailClient } from './ResourceDetailClient';
import { extractIdFromSlug, slugifyResource } from '@/lib/utils';
import type { Resource } from '@/lib/api/types';

export const dynamic = 'force-dynamic';

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id: rawSlugOrId } = await params;
  const id = extractIdFromSlug(rawSlugOrId);

  if (!id || !id.match(/^[0-9a-fA-F]{24}$/)) {
    return generatePageMetadata(
      'Resource Not Found | Velonx',
      'The requested learning resource could not be found.',
      '/resources'
    );
  }

  try {
    const resource = await prisma.resource.findUnique({
      where: { id },
    });

    if (!resource) {
      return generatePageMetadata(
        'Resource Not Found | Velonx',
        'The requested learning resource could not be found.',
        '/resources'
      );
    }

    const canonicalSlug = slugifyResource(resource.id, resource.title);

    const metadata = generatePageMetadata(
      `${resource.title} - Quick Reference | Velonx`,
      resource.description,
      `/resources/${canonicalSlug}`,
      resource.imageUrl ?? undefined
    );

    return {
      ...metadata,
      keywords: [
        resource.title.toLowerCase(),
        resource.category.toLowerCase().replace('_', ' '),
        resource.type.toLowerCase(),
        'developer cheat sheet',
        'quick reference guide',
        'programming PDF guide',
        'developer resources',
        'learning paths',
        'velonx platform',
      ],
    };
  } catch (err) {
    console.error('[SEO Metadata] Error fetching resource detail:', err);
    return generatePageMetadata(
      'Learning Resources & Student Guides | Velonx',
      'Access curated tutorials, courses, templates, and tools with Velonx.',
      '/resources'
    );
  }
}

export default async function ResourceDetailPage({ params }: Props) {
  const { id: rawSlugOrId } = await params;
  const id = extractIdFromSlug(rawSlugOrId);

  if (!id || !id.match(/^[0-9a-fA-F]{24}$/)) {
    notFound();
  }

  const resource = await prisma.resource.findUnique({
    where: { id },
  });

  if (!resource) {
    notFound();
  }

  const canonicalSlug = slugifyResource(resource.id, resource.title);

  // Auto-redirect if accessed via raw ObjectId to canonical title slug URL
  if (rawSlugOrId !== canonicalSlug) {
    redirect(`/resources/${canonicalSlug}`);
  }

  // Serialize resource model for client component safely
  const serializedResource: Resource = {
    id: resource.id,
    title: resource.title,
    description: resource.description,
    category: resource.category as any,
    type: resource.type as any,
    url: resource.url ?? undefined,
    imageUrl: resource.imageUrl,
    accessCount: resource.accessCount,
    pdfUrl: resource.pdfUrl ?? undefined,
    pdfPublicId: resource.pdfPublicId ?? undefined,
    pdfFileName: resource.pdfFileName ?? undefined,
    pdfFileSize: resource.pdfFileSize ?? undefined,
    pdfUploadedAt: resource.pdfUploadedAt?.toISOString(),
    createdAt: resource.createdAt.toISOString(),
    updatedAt: resource.updatedAt.toISOString(),
  };

  // Fetch related resources in same category
  let relatedResources: Resource[] = [];
  try {
    const related = await prisma.resource.findMany({
      where: {
        category: resource.category,
        id: { not: resource.id },
      },
      take: 3,
      orderBy: { accessCount: 'desc' },
    });

    relatedResources = related.map((r) => ({
      id: r.id,
      title: r.title,
      description: r.description,
      category: r.category as any,
      type: r.type as any,
      url: r.url ?? undefined,
      imageUrl: r.imageUrl,
      accessCount: r.accessCount,
      pdfUrl: r.pdfUrl ?? undefined,
      pdfPublicId: r.pdfPublicId ?? undefined,
      pdfFileName: r.pdfFileName ?? undefined,
      pdfFileSize: r.pdfFileSize ?? undefined,
      pdfUploadedAt: r.pdfUploadedAt?.toISOString(),
      createdAt: r.createdAt.toISOString(),
      updatedAt: r.updatedAt.toISOString(),
    }));
  } catch (err) {
    console.error('[Resource Detail Page] Failed to fetch related resources:', err);
  }

  // Format data for JSON-LD structured data component
  const structuredDataResource = {
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

  return (
    <>
      <ResourceStructuredData resource={structuredDataResource} />
      <ResourceDetailClient
        resource={serializedResource}
        relatedResources={relatedResources}
      />
    </>
  );
}
