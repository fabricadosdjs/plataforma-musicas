import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Nexor Records Pools - Sua Plataforma de Músicas Eletrônicas',
    description: 'A melhor plataforma de músicas eletrônicas para DJs, com downloads exclusivos, streaming e lançamentos atualizados diariamente. House, Techno, Progressive House e muito mais.',
    keywords: [
        'música eletrônica',
        'DJ',
        'download',
        'streaming',
        'house',
        'techno',
        'trance',
        'remix',
        'versão',
        'club mix',
        'nexor records',
        'pools',
        'música para dj',
        'download música',
        'streaming dj',
        'big room',
        'beats',
        'mixing',
        'djing'
    ],
    authors: [{ name: 'Nexor Records' }],
    creator: 'Nexor Records',
    publisher: 'Nexor Records',
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
        title: 'Nexor Records Pools - Sua Plataforma de Músicas Eletrônicas',
        description: 'A melhor plataforma de músicas eletrônicas para DJs, com downloads exclusivos, streaming e lançamentos atualizados diariamente.',
        type: 'website',
        locale: 'pt_BR',
        siteName: 'Nexor Records Pools',
        images: [
            {
                url: '/images/cover-picture_l.webp',
                width: 1200,
                height: 630,
                alt: 'Nexor Records Pools - Plataforma de Músicas Eletrônicas',
            },
        ],
    },
    twitter: {
        card: 'summary_large_image',
        title: 'Nexor Records Pools - Sua Plataforma de Músicas Eletrônicas',
        description: 'A melhor plataforma de músicas eletrônicas para DJs, com downloads exclusivos, streaming e lançamentos atualizados diariamente.',
        images: ['/images/cover-picture_l.webp'],
        creator: '@nexorrecords',
        site: '@nexorrecords',
    },
    alternates: {
        canonical: '/',
    },
    category: 'music',
    classification: 'music platform',
};
