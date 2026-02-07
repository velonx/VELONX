import { Metadata } from 'next';

// Base site configuration
export const siteConfig = {
    name: 'VELONX',
    title: 'VELONX - Empowering the Next Gen',
    description: 'Build Real Projects, Connect with Mentors, and Launch Your Tech Career. Join 1000+ students learning by doing on the VELONX platform.',
    url: process.env.NEXT_PUBLIC_SITE_URL || 'https://velonx.com',
    ogImage: '/og/default.png',
    keywords: [
        'student platform',
        'tech education',
        'project-based learning',
        'mentorship',
        'hackathons',
        'workshops',
        'tech community',
        'coding projects',
        'career development',
        'real-world projects',
    ],
    authors: [{ name: 'VELONX Team' }],
    creator: 'VELONX',
    publisher: 'VELONX',
    formatDetection: {
        email: false,
        address: false,
        telephone: false,
    },
};

// Default metadata for all pages
export const defaultMetadata: Metadata = {
    metadataBase: new URL(siteConfig.url),
    title: {
        default: siteConfig.title,
        template: `%s | ${siteConfig.name}`,
    },
    description: siteConfig.description,
    keywords: siteConfig.keywords,
    authors: siteConfig.authors,
    creator: siteConfig.creator,
    publisher: siteConfig.publisher,
    formatDetection: siteConfig.formatDetection,
    openGraph: {
        type: 'website',
        locale: 'en_US',
        url: siteConfig.url,
        title: siteConfig.title,
        description: siteConfig.description,
        siteName: siteConfig.name,
        images: [
            {
                url: siteConfig.ogImage,
                width: 1200,
                height: 630,
                alt: siteConfig.title,
            },
        ],
    },
    twitter: {
        card: 'summary_large_image',
        title: siteConfig.title,
        description: siteConfig.description,
        images: [siteConfig.ogImage],
        creator: '@velonx',
    },
    robots: {
        index: true,
        follow: true,
        googleBot: {
            index: true,
            follow: true,
            'max-video-preview': -1,
            'max-image-preview': 'large',
            'max-snippet': -1,
        },
    },
    verification: {
        google: 'your-google-verification-code', // Add your Google Search Console verification code
        // yandex: 'your-yandex-verification-code',
        // bing: 'your-bing-verification-code',
    },
};

// Page-specific metadata generators
export const generatePageMetadata = (
    title: string,
    description: string,
    path: string,
    ogImage?: string
): Metadata => {
    const url = `${siteConfig.url}${path}`;
    const image = ogImage || siteConfig.ogImage;

    return {
        title,
        description,
        openGraph: {
            title,
            description,
            url,
            images: [
                {
                    url: image,
                    width: 1200,
                    height: 630,
                    alt: title,
                },
            ],
        },
        twitter: {
            title,
            description,
            images: [image],
        },
        alternates: {
            canonical: url,
        },
    };
};
