import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
    return {
        rules: [
            {
                userAgent: '*',
                allow: '/',
                disallow: [
                    '/api/',
                    '/admin/',
                    '/auth/',
                    '/manage-profile/',
                    '/profile/',
                    '/*.json$',
                    '/test/',
                    '/temp/',
                    '/backup/',
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
                    '/test/',
                ],
            },
        ],
        sitemap: 'https://dj-pool.netlify.app/sitemap.xml',
        host: 'https://dj-pool.netlify.app',
    }
}
