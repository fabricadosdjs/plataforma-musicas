/** @type {import('next-sitemap').IConfig} */
module.exports = {
    siteUrl: process.env.SITE_URL || 'https://your-site.netlify.app',
    generateRobotsTxt: true,
    generateIndexSitemap: false,
    exclude: ['/admin/*', '/api/*', '/auth/*'],
    robotsTxtOptions: {
        policies: [
            {
                userAgent: '*',
                allow: '/',
                disallow: ['/admin/', '/api/', '/auth/']
            }
        ]
    }
}
