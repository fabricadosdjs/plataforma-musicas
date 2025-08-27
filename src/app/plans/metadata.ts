import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Planos VIP | Acesso Premium à Plataforma de Músicas',
    description: 'Escolha o plano VIP ideal para você. Acesso ilimitado a downloads, streaming em alta qualidade, conteúdo exclusivo e muito mais na Nexor Records Pools.',
    keywords: [
        'planos vip',
        'assinatura',
        'premium',
        'download ilimitado',
        'streaming',
        'música eletrônica',
        'house',
        'techno',
        'progressive house',
        'tech house',
        'edm',
        'nexor records',
        'pools',
        'plano mensal',
        'plano anual',
        'vip basic',
        'vip standard',
        'vip full'
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
        title: 'Planos VIP | Acesso Premium à Plataforma de Músicas',
        description: 'Escolha o plano VIP ideal para você. Acesso ilimitado a downloads, streaming em alta qualidade, conteúdo exclusivo e muito mais.',
        type: 'website',
        locale: 'pt_BR',
        siteName: 'Nexor Records Pools',
        images: [
            {
                url: '/images/cover-picture_l.webp',
                width: 1200,
                height: 630,
                alt: 'Planos VIP - Acesso Premium à Plataforma de Músicas',
            },
        ],
    },
    twitter: {
        card: 'summary_large_image',
        title: 'Planos VIP | Acesso Premium à Plataforma de Músicas',
        description: 'Escolha o plano VIP ideal para você. Acesso ilimitado a downloads, streaming em alta qualidade, conteúdo exclusivo e muito mais.',
        images: ['/images/cover-picture_l.webp'],
        creator: '@nexorrecords',
        site: '@nexorrecords',
    },
    alternates: {
        canonical: '/plans',
    },
    category: 'subscription',
    classification: 'vip plans',
};
