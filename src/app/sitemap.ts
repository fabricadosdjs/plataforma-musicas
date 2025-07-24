import { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
    const baseUrl = 'https://dj-pool.netlify.app'
    const lastModified = new Date()

    // Páginas estáticas principais
    const staticPages = [
        {
            url: baseUrl,
            lastModified,
            changeFrequency: 'daily' as const,
            priority: 1,
        },
        {
            url: `${baseUrl}/new`,
            lastModified,
            changeFrequency: 'hourly' as const,
            priority: 0.9,
        },
        {
            url: `${baseUrl}/trending`,
            lastModified,
            changeFrequency: 'daily' as const,
            priority: 0.8,
        },
        {
            url: `${baseUrl}/charts`,
            lastModified,
            changeFrequency: 'daily' as const,
            priority: 0.8,
        },
        {
            url: `${baseUrl}/featured`,
            lastModified,
            changeFrequency: 'daily' as const,
            priority: 0.7,
        },
        {
            url: `${baseUrl}/pro`,
            lastModified,
            changeFrequency: 'weekly' as const,
            priority: 0.6,
        },
        {
            url: `${baseUrl}/auth/sign-in`,
            lastModified,
            changeFrequency: 'monthly' as const,
            priority: 0.3,
        },
        {
            url: `${baseUrl}/auth/sign-up`,
            lastModified,
            changeFrequency: 'monthly' as const,
            priority: 0.3,
        },
    ]

    return staticPages
}
