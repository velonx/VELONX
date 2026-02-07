/** @type {import('next-sitemap').IConfig} */
module.exports = {
    siteUrl: process.env.NEXT_PUBLIC_SITE_URL || 'https://velonx.com',
    generateRobotsTxt: true,
    generateIndexSitemap: false,
    exclude: [
        '/dashboard/*',
        '/admin/*',
        '/api/*',
        '/auth/*',
        '/settings/*',
    ],
    robotsTxtOptions: {
        policies: [
            {
                userAgent: '*',
                allow: '/',
            },
            {
                userAgent: '*',
                disallow: ['/dashboard', '/admin', '/api', '/auth', '/settings'],
            },
        ],
        additionalSitemaps: [
            `${process.env.NEXT_PUBLIC_SITE_URL || 'https://velonx.com'}/sitemap.xml`,
        ],
    },
    transform: async (config, path) => {
        // Custom priority and changefreq based on page type
        let priority = 0.7;
        let changefreq = 'weekly';

        if (path === '/') {
            priority = 1.0;
            changefreq = 'daily';
        } else if (path.startsWith('/events')) {
            priority = 0.9;
            changefreq = 'daily';
        } else if (path.startsWith('/projects')) {
            priority = 0.8;
            changefreq = 'weekly';
        } else if (path.startsWith('/blog')) {
            priority = 0.8;
            changefreq = 'weekly';
        } else if (path.startsWith('/mentors')) {
            priority = 0.7;
            changefreq = 'weekly';
        } else if (path.startsWith('/resources')) {
            priority = 0.7;
            changefreq = 'weekly';
        }

        return {
            loc: path,
            changefreq,
            priority,
            lastmod: config.autoLastmod ? new Date().toISOString() : undefined,
        };
    },
};
