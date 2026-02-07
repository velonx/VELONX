import React from 'react';

// Organization schema for homepage
export function OrganizationSchema() {
    const schema = {
        '@context': 'https://schema.org',
        '@type': 'Organization',
        name: 'VELONX',
        description:
            'A platform empowering students to build real projects, connect with mentors, and launch their tech careers.',
        url: process.env.NEXT_PUBLIC_SITE_URL || 'https://velonx.com',
        logo: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://velonx.com'}/logo.png`,
        sameAs: [
            // Add your social media links here
            // 'https://twitter.com/velonx',
            // 'https://linkedin.com/company/velonx',
            // 'https://github.com/velonx',
        ],
        contactPoint: {
            '@type': 'ContactPoint',
            contactType: 'Customer Service',
            email: 'support@velonx.com',
        },
    };

    return (
        <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
    );
}

// Event schema for event pages
interface EventSchemaProps {
    event: {
        id: string;
        title: string;
        description: string;
        type: string;
        date: Date;
        location?: string;
        meetingLink?: string;
        imageUrl?: string;
        maxAttendees?: number;
    };
}

export function EventSchema({ event }: EventSchemaProps) {
    const schema = {
        '@context': 'https://schema.org',
        '@type': 'Event',
        name: event.title,
        description: event.description,
        startDate: event.date.toISOString(),
        eventStatus: 'https://schema.org/EventScheduled',
        eventAttendanceMode: event.meetingLink
            ? 'https://schema.org/OnlineEventAttendanceMode'
            : 'https://schema.org/OfflineEventAttendanceMode',
        location: event.meetingLink
            ? {
                '@type': 'VirtualLocation',
                url: event.meetingLink,
            }
            : event.location
                ? {
                    '@type': 'Place',
                    name: event.location,
                }
                : undefined,
        image: event.imageUrl || `${process.env.NEXT_PUBLIC_SITE_URL}/og/events.png`,
        organizer: {
            '@type': 'Organization',
            name: 'VELONX',
            url: process.env.NEXT_PUBLIC_SITE_URL || 'https://velonx.com',
        },
    };

    return (
        <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
    );
}

// Course schema for resources
interface CourseSchemaProps {
    resource: {
        id: string;
        title: string;
        description: string;
        category: string;
        type: string;
        url: string;
    };
}

export function CourseSchema({ resource }: CourseSchemaProps) {
    const schema = {
        '@context': 'https://schema.org',
        '@type': 'Course',
        name: resource.title,
        description: resource.description,
        provider: {
            '@type': 'Organization',
            name: 'VELONX',
            url: process.env.NEXT_PUBLIC_SITE_URL || 'https://velonx.com',
        },
        url: resource.url,
    };

    return (
        <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
    );
}

// Person schema for mentor profiles
interface PersonSchemaProps {
    mentor: {
        id: string;
        name: string;
        bio?: string;
        expertise: string[];
        company?: string;
        imageUrl?: string;
        linkedinUrl?: string;
        githubUrl?: string;
    };
}

export function PersonSchema({ mentor }: PersonSchemaProps) {
    const schema = {
        '@context': 'https://schema.org',
        '@type': 'Person',
        name: mentor.name,
        description: mentor.bio,
        jobTitle: 'Mentor',
        worksFor: mentor.company
            ? {
                '@type': 'Organization',
                name: mentor.company,
            }
            : undefined,
        image: mentor.imageUrl,
        sameAs: [mentor.linkedinUrl, mentor.githubUrl].filter(Boolean),
        knowsAbout: mentor.expertise,
    };

    return (
        <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
    );
}

// BreadcrumbList schema
interface BreadcrumbSchemaProps {
    items: Array<{
        name: string;
        url: string;
    }>;
}

export function BreadcrumbSchema({ items }: BreadcrumbSchemaProps) {
    const schema = {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: items.map((item, index) => ({
            '@type': 'ListItem',
            position: index + 1,
            name: item.name,
            item: item.url,
        })),
    };

    return (
        <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
    );
}

// Article schema for blog posts
interface ArticleSchemaProps {
    article: {
        title: string;
        description: string;
        author: string;
        publishDate: Date;
        modifiedDate?: Date;
        imageUrl?: string;
        url: string;
    };
}

export function ArticleSchema({ article }: ArticleSchemaProps) {
    const schema = {
        '@context': 'https://schema.org',
        '@type': 'Article',
        headline: article.title,
        description: article.description,
        image: article.imageUrl,
        datePublished: article.publishDate.toISOString(),
        dateModified: (article.modifiedDate || article.publishDate).toISOString(),
        author: {
            '@type': 'Person',
            name: article.author,
        },
        publisher: {
            '@type': 'Organization',
            name: 'VELONX',
            logo: {
                '@type': 'ImageObject',
                url: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://velonx.com'}/logo.png`,
            },
        },
        mainEntityOfPage: {
            '@type': 'WebPage',
            '@id': article.url,
        },
    };

    return (
        <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
    );
}
