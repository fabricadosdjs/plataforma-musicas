"use client";


interface SEOHeadProps {
    title?: string;
    description?: string;
    keywords?: string;
    image?: string;
    url?: string;
    type?: 'website' | 'music.song' | 'music.album' | 'music.playlist';
    siteName?: string;
    twitterCard?: 'summary' | 'summary_large_image' | 'app' | 'player';
    musicData?: {
        artist?: string;
        album?: string;
        duration?: number;
        releaseDate?: string;
        genre?: string;
    };
}

export default function SEOHead({
    title = "Plataforma de Músicas - DJ Pool",
    description = "Descubra, ouça e baixe as melhores músicas para DJs. Acesso VIP com downloads ilimitados e catálogo premium.",
    keywords = "música, DJ, download, streaming, house, techno, eletrônica, remix, versão, club mix",
    image = "/og-image.jpg",
    url,
    type = "website",
    siteName = "DJ Pool Platform",
    twitterCard = "summary_large_image",
    musicData
}: SEOHeadProps) {
    const fullTitle = title.includes(siteName) ? title : `${title} - ${siteName}`;
    const fullUrl = url ? `https://dj-pool.netlify.app${url}` : 'https://dj-pool.netlify.app';
    const fullImage = image.startsWith('http') ? image : `https://dj-pool.netlify.app${image}`;

    // Schema.org JSON-LD
    const generateSchema = () => {
        const baseSchema = {
            "@context": "https://schema.org",
            "@type": "WebSite",
            "name": siteName,
            "description": description,
            "url": fullUrl,
            "potentialAction": {
                "@type": "SearchAction",
                "target": `${fullUrl}/new?search={search_term_string}`,
                "query-input": "required name=search_term_string"
            }
        };

        if (type === 'music.song' && musicData) {
            return {
                "@context": "https://schema.org",
                "@type": "MusicRecording",
                "name": title,
                "description": description,
                "image": fullImage,
                "url": fullUrl,
                "byArtist": musicData.artist ? {
                    "@type": "MusicGroup",
                    "name": musicData.artist
                } : undefined,
                "inAlbum": musicData.album ? {
                    "@type": "MusicAlbum",
                    "name": musicData.album
                } : undefined,
                "duration": musicData.duration ? `PT${Math.floor(musicData.duration / 60)}M${musicData.duration % 60}S` : undefined,
                "datePublished": musicData.releaseDate,
                "genre": musicData.genre
            };
        }

        return baseSchema;
    };

    return (
        <>
            {/* Título da página */}
            <title>{fullTitle}</title>

            {/* Meta tags básicas */}
            <meta name="description" content={description} />
            <meta name="keywords" content={keywords} />
            <meta name="author" content="DJ Pool Platform" />
            <meta name="robots" content="index, follow, max-image-preview:large" />
            <meta name="viewport" content="width=device-width, initial-scale=1.0" />

            {/* Open Graph (Facebook, WhatsApp, etc.) */}
            <meta property="og:type" content={type} />
            <meta property="og:title" content={fullTitle} />
            <meta property="og:description" content={description} />
            <meta property="og:image" content={fullImage} />
            <meta property="og:url" content={fullUrl} />
            <meta property="og:site_name" content={siteName} />
            <meta property="og:locale" content="pt_BR" />

            {/* Música específica */}
            {type === 'music.song' && musicData && (
                <>
                    <meta property="music:duration" content={musicData.duration?.toString()} />
                    <meta property="music:album" content={musicData.album} />
                    <meta property="music:musician" content={musicData.artist} />
                    <meta property="music:release_date" content={musicData.releaseDate} />
                </>
            )}

            {/* Twitter Cards */}
            <meta name="twitter:card" content={twitterCard} />
            <meta name="twitter:title" content={fullTitle} />
            <meta name="twitter:description" content={description} />
            <meta name="twitter:image" content={fullImage} />
            <meta name="twitter:site" content="@djpool" />
            <meta name="twitter:creator" content="@djpool" />

            {/* Favicon e ícones */}
            <link rel="icon" href="/favicon.ico" />
            <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
            <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
            <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
            <link rel="manifest" href="/site.webmanifest" />

            {/* Schema.org JSON-LD */}
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{
                    __html: JSON.stringify(generateSchema())
                }}
            />

            {/* Preload importantes */}
            <link rel="preload" href="/fonts/poppins.woff2" as="font" type="font/woff2" crossOrigin="" />
            <link rel="dns-prefetch" href="//fonts.googleapis.com" />
            <link rel="dns-prefetch" href="//fonts.gstatic.com" />

            {/* Canonical URL */}
            <link rel="canonical" href={fullUrl} />

            {/* Outras meta tags importantes */}
            <meta name="theme-color" content="#202124" />
            <meta name="msapplication-TileColor" content="#202124" />
            <meta name="application-name" content={siteName} />
            <meta name="apple-mobile-web-app-title" content={siteName} />
            <meta name="apple-mobile-web-app-capable" content="yes" />
            <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />

            {/* Cache Control */}
            <meta httpEquiv="Cache-Control" content="max-age=31536000" />
        </>
    );
}
