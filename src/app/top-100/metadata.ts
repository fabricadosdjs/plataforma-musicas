import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Top 100 | Ranking das Músicas Mais Populares',
    description: 'Descubra o Top 100 das músicas mais populares, baixadas e curtidas da plataforma. Ranking atualizado diariamente com House, Techno e mais.',
    keywords: [
        'top 100',
        'ranking',
        'músicas populares',
        'música eletrônica',
        'house',
        'techno',
        'progressive house',
        'tech house',
        'edm',
        'download música',
        'nexor records',
        'pools',
        'ranking musical',
        'músicas em alta'
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
        title: 'Top 100 | Ranking das Músicas Mais Populares',
        description: 'Descubra o Top 100 das músicas mais populares, baixadas e curtidas da plataforma. Ranking atualizado diariamente.',
        type: 'website',
        locale: 'pt_BR',
        siteName: 'Nexor Records Pools',
        images: [
            {
                url: '/images/cover-picture_l.webp',
                width: 1200,
                height: 630,
                alt: 'Top 100 - Ranking das Músicas Mais Populares',
            },
        ],
    },
    twitter: {
        card: 'summary_large_image',
        title: 'Top 100 | Ranking das Músicas Mais Populares',
        description: 'Descubra o Top 100 das músicas mais populares, baixadas e curtidas da plataforma. Ranking atualizado diariamente.',
        images: ['/images/cover-picture_l.webp'],
        creator: '@nexorrecords',
        site: '@nexorrecords',
    },
    alternates: {
        canonical: '/top-100',
    },
    category: 'music',
    classification: 'music ranking',
};
