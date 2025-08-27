import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Comunidade | DJs e Produtores de Música Eletrônica',
    description: 'Conecte-se com outros DJs e produtores de música eletrônica. Compartilhe experiências, descubra novos talentos e participe da comunidade Nexor Records Pools.',
    keywords: [
        'comunidade',
        'DJs',
        'produtores',
        'música eletrônica',
        'edm',
        'house',
        'techno',
        'progressive house',
        'tech house',
        'nexor records',
        'pools',
        'comunidade musical',
        'networking',
        'colaboração'
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
        title: 'Comunidade | DJs e Produtores de Música Eletrônica',
        description: 'Conecte-se com outros DJs e produtores de música eletrônica. Compartilhe experiências, descubra novos talentos e participe da comunidade.',
        type: 'website',
        locale: 'pt_BR',
        siteName: 'Nexor Records Pools',
        images: [
            {
                url: '/images/cover-picture_l.webp',
                width: 1200,
                height: 630,
                alt: 'Comunidade - DJs e Produtores de Música Eletrônica',
            },
        ],
    },
    twitter: {
        card: 'summary_large_image',
        title: 'Comunidade | DJs e Produtores de Música Eletrônica',
        description: 'Conecte-se com outros DJs e produtores de música eletrônica. Compartilhe experiências, descubra novos talentos e participe da comunidade.',
        images: ['/images/cover-picture_l.webp'],
        creator: '@nexorrecords',
        site: '@nexorrecords',
    },
    alternates: {
        canonical: '/community',
    },
    category: 'community',
    classification: 'music community',
};
