/**
 * ResourceStructuredData Component
 * 
 * Renders JSON-LD structured data for SEO on the resources page.
 * Supports three schema types:
 * - CollectionPage: For the main resources listing
 * - LearningResource / DigitalDocument: For individual shared resources
 * - BreadcrumbList: Navigation breadcrumbs for Google SERPs
 */

import { siteConfig } from '@/lib/seo.config';

interface ResourceData {
  id: string;
  title: string;
  description: string;
  category: string;
  type: string;
  url?: string;
  imageUrl?: string | null;
  accessCount: number;
  pdfUrl?: string;
  pdfFileName?: string;
  createdAt: string;
  updatedAt: string;
}

interface ResourceStructuredDataProps {
  /** Individual resource for deep-link pages (?id=xxx) */
  resource?: ResourceData | null;
  /** Total number of resources in the collection */
  totalResources?: number;
}

/**
 * Maps resource categories to schema.org educationalLevel / about keywords
 */
function getCategoryAbout(category: string): string {
  const mapping: Record<string, string> = {
    PROGRAMMING: 'Computer Programming',
    WEB: 'Web Development',
    MOBILE: 'Mobile Application Development',
    DATA_SCIENCE: 'Data Science',
    DESIGN: 'User Interface Design',
    DEVOPS: 'DevOps Engineering',
    BUSINESS: 'Business Technology',
    OTHER: 'Technology',
  };
  return mapping[category] || 'Technology';
}

/**
 * Maps resource types to schema.org @type values
 */
function getSchemaType(type: string): string {
  const mapping: Record<string, string> = {
    ARTICLE: 'Article',
    VIDEO: 'VideoObject',
    COURSE: 'Course',
    BOOK: 'Book',
    TOOL: 'SoftwareApplication',
    DOCUMENTATION: 'TechArticle',
  };
  return mapping[type] || 'LearningResource';
}

export function ResourceStructuredData({ resource, totalResources }: ResourceStructuredDataProps) {
  const baseUrl = siteConfig.url;

  // Breadcrumb schema — always present
  const breadcrumbList = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    'itemListElement': [
      {
        '@type': 'ListItem',
        'position': 1,
        'name': 'Home',
        'item': baseUrl,
      },
      {
        '@type': 'ListItem',
        'position': 2,
        'name': 'Resources',
        'item': `${baseUrl}/resources`,
      },
      ...(resource
        ? [
            {
              '@type': 'ListItem',
              'position': 3,
              'name': resource.title,
              'item': `${baseUrl}/resources/${resource.id}`,
            },
          ]
        : []),
    ],
  };

  // Individual resource schema
  if (resource) {
    const schemaType = getSchemaType(resource.type);

    const resourceSchema: Record<string, any> = {
      '@context': 'https://schema.org',
      '@type': schemaType,
      'headline': resource.title,
      'name': resource.title,
      'description': resource.description,
      'url': `${baseUrl}/resources/${resource.id}`,
      'mainEntityOfPage': {
        '@type': 'WebPage',
        '@id': `${baseUrl}/resources/${resource.id}`,
      },
      'image': resource.imageUrl ? [resource.imageUrl] : [`${baseUrl}/og/default.png`],
      'datePublished': resource.createdAt,
      'dateModified': resource.updatedAt,
      'author': {
        '@type': 'Organization',
        'name': 'Velonx',
        'url': baseUrl,
      },
      'publisher': {
        '@type': 'Organization',
        'name': 'Velonx',
        'url': baseUrl,
        'logo': {
          '@type': 'ImageObject',
          'url': `${baseUrl}/favicon.png`,
        },
      },
      'provider': {
        '@type': 'Organization',
        'name': 'Velonx',
        'url': baseUrl,
      },
      'about': {
        '@type': 'Thing',
        'name': getCategoryAbout(resource.category),
      },
      'interactionStatistic': {
        '@type': 'InteractionCounter',
        'interactionType': 'https://schema.org/ViewAction',
        'userInteractionCount': resource.accessCount,
      },
      ...(resource.pdfUrl && {
        'encoding': {
          '@type': 'MediaObject',
          'contentUrl': resource.pdfUrl,
          'encodingFormat': 'application/pdf',
          ...(resource.pdfFileName && { 'name': resource.pdfFileName }),
        },
      }),
      ...(resource.type === 'TOOL' && {
        'operatingSystem': 'Web / Cross-Platform',
        'applicationCategory': 'DeveloperApplication',
      }),
      ...(resource.type === 'VIDEO' && {
        'uploadDate': resource.createdAt,
        'thumbnailUrl': resource.imageUrl ? [resource.imageUrl] : [`${baseUrl}/og/default.png`],
      }),
    };

    return (
      <>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbList) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(resourceSchema) }}
        />
      </>
    );
  }

  // Collection page schema — for the main listing
  const collectionSchema = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    'name': 'Learning Resources & Student Guides',
    'description':
      'Access curated tutorials, courses, templates, and tools to accelerate your learning. Level up your coding, design, and product building skills with Velonx.',
    'url': `${baseUrl}/resources`,
    'provider': {
      '@type': 'Organization',
      'name': 'Velonx',
      'url': baseUrl,
      'logo': `${baseUrl}/favicon.png`,
    },
    'about': {
      '@type': 'Thing',
      'name': 'Software Development Education',
    },
    ...(totalResources !== undefined && {
      'numberOfItems': totalResources,
    }),
    'isPartOf': {
      '@type': 'WebSite',
      'name': 'Velonx',
      'url': baseUrl,
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbList) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionSchema) }}
      />
    </>
  );
}
