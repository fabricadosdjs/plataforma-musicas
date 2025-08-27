import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Trending | Músicas Mais Populares e Baixadas',
    description: 'Descubra as músicas mais populares e baixadas da plataforma. Top hits de House, Techno, Progressive House e outros gêneros eletrônicos em alta.',
    keywords: [
        'trending',
        'músicas populares',
        'top hits',
        'música eletrônica',
        'house',
        'techno',
        'progressive house',
        'tech house',
        'edm',
        'download música',
        'músicas em alta',
        'nexor records',
        'pools',
        'músicas mais baixadas'
    ],
    authors: [{ name: 'Nexor Records Pools' }],
    creator: 'Nexor Records Pools',
    publisher: 'Nexor Records Pools',
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
    openGraph: {
        title: 'Trending | Músicas Mais Populares e Baixadas',
        description: 'Descubra as músicas mais populares e baixadas da plataforma. Top hits de House, Techno, Progressive House e outros gêneros eletrônicos em alta.',
        type: 'website',
        locale: 'pt_BR',
        siteName: 'Nexor Records Pools',
        images: [
            {
                url: '/images/cover-picture_l.webp',
                width: 1200,
                height: 630,
                alt: 'Trending - Músicas Mais Populares e Baixadas',
            },
        ],
    },
    twitter: {
        card: 'summary_large_image',
        title: 'Trending | Músicas Mais Populares e Baixadas',
        description: 'Descubra as músicas mais populares e baixadas da plataforma. Top hits de House, Techno, Progressive House e outros gêneros eletrônicos em alta.',
        images: ['/images/cover-picture_l.webp'],
        creator: '@nexorrecords',
        site: '@nexorrecords',
    },
    alternates: {
        canonical: '/trending',
    },
    category: 'music',
    classification: 'trending music',
};
