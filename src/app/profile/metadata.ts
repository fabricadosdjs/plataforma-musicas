import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Meu Perfil | Gerenciar Conta e Configurações',
    description: 'Gerencie seu perfil, configurações de conta, histórico de downloads e atividades na plataforma Nexor Records Pools.',
    keywords: [
        'perfil',
        'conta',
        'configurações',
        'histórico',
        'downloads',
        'atividades',
        'música eletrônica',
        'nexor records',
        'pools',
        'gerenciar conta',
        'configurações usuário'
    ],
    authors: [{ name: 'Nexor Records Pools' }],
    creator: 'Nexor Records Pools',
    publisher: 'Nexor Records Pools',
    robots: {
        index: false,
        follow: false,
        googleBot: {
            index: false,
            follow: false,
        },
    },
    openGraph: {
        title: 'Meu Perfil | Gerenciar Conta e Configurações',
        description: 'Gerencie seu perfil, configurações de conta, histórico de downloads e atividades na plataforma.',
        type: 'website',
        locale: 'pt_BR',
        siteName: 'Nexor Records Pools',
        images: [
            {
                url: '/images/cover-picture_l.webp',
                width: 1200,
                height: 630,
                alt: 'Meu Perfil - Gerenciar Conta e Configurações',
            },
        ],
    },
    twitter: {
        card: 'summary_large_image',
        title: 'Meu Perfil | Gerenciar Conta e Configurações',
        description: 'Gerencie seu perfil, configurações de conta, histórico de downloads e atividades na plataforma.',
        images: ['/images/cover-picture_l.webp'],
        creator: '@nexorrecords',
        site: '@nexorrecords',
    },
    alternates: {
        canonical: '/profile',
    },
    category: 'user',
    classification: 'user profile',
};
