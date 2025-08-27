import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Lançamentos | Músicas Exclusivas e Novidades',
    description: 'Descubra os lançamentos mais recentes e exclusivos de música eletrônica. House, Techno, Progressive House e muito mais com downloads diretos.',
    keywords: [
        'lançamentos',
        'músicas exclusivas',
        'música eletrônica',
        'house',
        'techno',
        'progressive house',
        'tech house',
        'edm',
        'download música',
        'nexor records',
        'pools',
        'música nova',
        'exclusivos'
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
        title: 'Lançamentos | Músicas Exclusivas e Novidades',
        description: 'Descubra os lançamentos mais recentes e exclusivos de música eletrônica. House, Techno, Progressive House e muito mais.',
        type: 'website',
        locale: 'pt_BR',
        siteName: 'Nexor Records Pools',
        images: [
            {
                url: '/images/cover-picture_l.webp',
                width: 1200,
                height: 630,
                alt: 'Lançamentos - Músicas Exclusivas e Novidades',
            },
        ],
    },
    twitter: {
        card: 'summary_large_image',
        title: 'Lançamentos | Músicas Exclusivas e Novidades',
        description: 'Descubra os lançamentos mais recentes e exclusivos de música eletrônica. House, Techno, Progressive House e muito mais.',
        images: ['/images/cover-picture_l.webp'],
        creator: '@nexorrecords',
        site: '@nexorrecords',
    },
    alternates: {
        canonical: '/releases',
    },
    category: 'music',
    classification: 'music releases',
};
