"use client";

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { getSEOConfig, getMusicSEO } from '@/lib/seo-config';
import SEOHead from '@/components/seo/SEOHead';

interface UseSEOProps {
    customTitle?: string;
    customDescription?: string;
    customKeywords?: string;
    customImage?: string;
    musicData?: {
        artist?: string;
        album?: string;
        duration?: number;
        releaseDate?: string;
        genre?: string;
    };
    track?: any;
}

export function useSEO({
    customTitle,
    customDescription,
    customKeywords,
    customImage,
    musicData,
    track
}: UseSEOProps = {}) {
    const pathname = usePathname();

    // Se temos dados de música específica, usar getMusicSEO
    if (track) {
        const musicSEO = getMusicSEO(track, pathname);
        return {
            seoData: {
                title: customTitle || musicSEO.title,
                description: customDescription || musicSEO.description,
                keywords: customKeywords || musicSEO.keywords,
                image: customImage || musicSEO.image,
                url: musicSEO.url,
                type: musicSEO.type,
                musicData: musicData || musicSEO.musicData
            }
        };
    }

    // Caso contrário, usar configuração padrão da página
    const seoConfig = getSEOConfig(pathname);

    return {
        seoData: {
            title: customTitle || seoConfig.title,
            description: customDescription || seoConfig.description,
            keywords: customKeywords || seoConfig.keywords,
            image: customImage || seoConfig.image,
            url: seoConfig.url,
            type: seoConfig.type,
            musicData: musicData || seoConfig.musicData
        }
    };
}

// Hook para SEO estático (sem reatividade)
export function useStaticSEO(pathname: string) {
    const seoConfig = getSEOConfig(pathname);

    return {
        seoData: {
            title: seoConfig.title,
            description: seoConfig.description,
            keywords: seoConfig.keywords,
            image: seoConfig.image,
            url: seoConfig.url,
            type: seoConfig.type,
            musicData: seoConfig.musicData
        }
    };
} 