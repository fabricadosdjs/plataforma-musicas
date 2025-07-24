/** @type {import('next-sitemap').IConfig} */
module.exports = {
    siteUrl: process.env.SITE_URL || 'https://dj-pool.netlify.app',
    generateRobotsTxt: true,
    exclude: [
        '/api/*',
        '/admin/*',
        '/auth/*',
        '/manage-profile/*',
        '/profile/*',
        '/test/*',
        '/temp/*',
        '/backup/*',
        '/*_backup*',
        '/*_test*',
        '/*_new*',
        '/*_original*'
    ],
    robotsTxtOptions: {
        policies: [
            {
                userAgent: '*',
                allow: '/',
                disallow: [
                    '/api/',
                    '/admin/',
                    '/auth/',
                    '/manage-profile/',
                    '/profile/',
                    '/test/',
                    '/temp/',
                    '/backup/',
                    '/*_backup*',
                    '/*_test*'
                ],
            },
            {
                userAgent: 'Googlebot',
                allow: '/',
                disallow: [
                    '/api/',
                    '/admin/',
                    '/auth/',
                    '/manage-profile/',
                    '/profile/',
                    '/test/'
                ],
            },
        ],
        additionalSitemaps: [
            'https://dj-pool.netlify.app/sitemap.xml',
        ],
    },
    changefreq: 'daily',
    priority: 0.7,
    sitemapSize: 5000,
    generateIndexSitemap: false,
    transform: async (config, path) => {
        // Personalizar prioridades e frequências por página
        const customConfig = { ...config }

        if (path === '/') {
            customConfig.priority = 1.0
            customConfig.changefreq = 'daily'
        } else if (path === '/new') {
            customConfig.priority = 0.9
            customConfig.changefreq = 'hourly'
        } else if (path.includes('/trending') || path.includes('/charts')) {
            customConfig.priority = 0.8
            customConfig.changefreq = 'daily'
        } else if (path.includes('/featured')) {
            customConfig.priority = 0.7
            customConfig.changefreq = 'daily'
        } else if (path.includes('/pro')) {
            customConfig.priority = 0.6
            customConfig.changefreq = 'weekly'
        }

        return {
            loc: path,
            changefreq: customConfig.changefreq,
            priority: customConfig.priority,
            lastmod: config.autoLastmod ? new Date().toISOString() : undefined,
        }
    },
}
