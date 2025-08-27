import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Nexor Records | Gravadora de Música Eletrônica Profissional',
    description: 'Nexor Records é uma gravadora inovadora especializada em música eletrônica. Transformamos ideias em hits globais com tratamento profissional.',
    keywords: [
        'nexor records',
        'gravadora',
        'música eletrônica',
        'house',
        'techno',
        'progressive house',
        'tech house',
        'edm',
        'gravadora profissional',
        'produção musical',
        'distribuição',
        'música digital'
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
        title: 'Nexor Records | Gravadora de Música Eletrônica Profissional',
        description: 'Nexor Records é uma gravadora inovadora especializada em música eletrônica. Transformamos ideias em hits globais.',
        type: 'website',
        locale: 'pt_BR',
        siteName: 'Nexor Records Pools',
        images: [
            {
                url: '/images/cover-picture_l.webp',
                width: 1200,
                height: 630,
                alt: 'Nexor Records - Gravadora de Música Eletrônica',
            },
        ],
    },
    twitter: {
        card: 'summary_large_image',
        title: 'Nexor Records | Gravadora de Música Eletrônica Profissional',
        description: 'Nexor Records é uma gravadora inovadora especializada em música eletrônica. Transformamos ideias em hits globais.',
        images: ['/images/cover-picture_l.webp'],
        creator: '@nexorrecords',
        site: '@nexorrecords',
    },
    alternates: {
        canonical: '/label',
    },
    category: 'music',
    classification: 'record label',
};
