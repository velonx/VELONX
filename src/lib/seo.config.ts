import { Metadata } from 'next';

// Base site configuration
export const siteConfig = {
    name: 'Velonx',
    title: 'Velonx - Empowering the Next Gen',
    description: 'Join a thriving Velonx community where students turn potential into impact. Build projects, learn from mentors, and launch your career.',
    url: process.env.NEXT_PUBLIC_SITE_URL || 'https://velonx.in',
    ogImage: '/og/default.png',
    keywords: [
        'velonx',
        'velonx community',
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

// Helper to clean environment variables (strip quotes, whitespace, and ignore placeholders)
const cleanEnvVar = (val: string | undefined): string | undefined => {
    if (!val) return undefined;
    const cleaned = val.trim().replace(/^['"]|['"]$/g, '');
    if (
        !cleaned ||
        cleaned === 'your-google-verification-code' ||
        cleaned === 'your-yandex-verification-code' ||
        cleaned === 'your-bing-verification-code' ||
        cleaned.includes('placeholder')
    ) {
        return undefined;
    }
    return cleaned;
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
    icons: {
        icon: [
            {
                url: '/favicon.png',
                sizes: '48x48',
                type: 'image/png',
            },
        ],
    },
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
        google: cleanEnvVar(process.env.GOOGLE_VERIFICATION_CODE) || cleanEnvVar(process.env.NEXT_PUBLIC_GOOGLE_VERIFICATION_CODE) || '34x0ScPsUcmgX6fnMwLlkgRAzmTJv8DIkjfVABS6n3o',
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
    const rawImage = ogImage || siteConfig.ogImage;
    const image = rawImage.startsWith('http') ? rawImage : `${siteConfig.url}${rawImage.startsWith('/') ? '' : '/'}${rawImage}`;

    return {
        title: { absolute: title },
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
        verification: {
            google: cleanEnvVar(process.env.GOOGLE_VERIFICATION_CODE) || cleanEnvVar(process.env.NEXT_PUBLIC_GOOGLE_VERIFICATION_CODE) || '34x0ScPsUcmgX6fnMwLlkgRAzmTJv8DIkjfVABS6n3o',
        },
    };
};
