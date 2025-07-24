import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Novas Músicas - Últimos Lançamentos para DJs',
    description: 'Descubra os lançamentos mais recentes da nossa plataforma. Novas músicas house, techno, eletrônica e remixes adicionados diariamente.',
    keywords: 'novas músicas, lançamentos, new releases, música nova, dj music, electronic music, house music, techno',
    openGraph: {
        title: 'Novas Músicas - Últimos Lançamentos para DJs',
        description: 'Descubra os lançamentos mais recentes da nossa plataforma. Novas músicas adicionadas diariamente.',
        images: ['/images/og/new-music.jpg'],
    },
    alternates: {
        canonical: '/new',
    }
};
