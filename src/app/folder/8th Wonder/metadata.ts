import { Metadata } from 'next';

export const metadata: Metadata = {
    title: '8th Wonder - 150 Músicas Eletrônicas | Nexor Records',
    description: 'O 8th Wonder é um pool de música eletrônica que reúne faixas exclusivas e atualizações constantes para DJs, focando em sons modernos e de alta qualidade para sets profissionais. Com uma curadoria atenta, o pool oferece desde lançamentos quentes até remixes raros, garantindo repertório atualizado para qualquer estilo dentro da música eletrônica.',
    keywords: '8th Wonder, pool musical, música eletrônica, DJ, Deep House, Techno, Trance, Progressive House, Melodic Techno, remixes, lançamentos, sets profissionais, curadoria musical, nexor records',
    authors: [{ name: 'Nexor Records' }],
    creator: 'Nexor Records',
    publisher: 'Nexor Records',
    formatDetection: {
        email: false,
        address: false,
        telephone: false,
    },
    metadataBase: new URL('https://nexorrecords.com.br'),
    openGraph: {
        title: '8th Wonder - 150 Músicas Eletrônicas | Nexor Records',
        description: 'O 8th Wonder é um pool de música eletrônica que reúne faixas exclusivas e atualizações constantes para DJs, focando em sons modernos e de alta qualidade para sets profissionais.',
        type: 'website',
        locale: 'pt_BR',
        siteName: 'Nexor Records',
        url: 'https://nexorrecords.com.br/folder/8th%20Wonder',
        images: [
            {
                url: 'https://i.ibb.co/qYHcpXrb/8th-Wonder-Promo.png',
                width: 1200,
                height: 630,
                alt: '8th Wonder - Pool de Música Eletrônica para DJs',
            },
        ],
    },
    twitter: {
        card: 'summary_large_image',
        title: '8th Wonder - 150 Músicas Eletrônicas | Nexor Records',
        description: 'O 8th Wonder é um pool de música eletrônica que reúne faixas exclusivas e atualizações constantes para DJs, focando em sons modernos e de alta qualidade para sets profissionais.',
        images: ['https://i.ibb.co/qYHcpXrb/8th-Wonder-Promo.png'],
        creator: '@nexorrecords',
        site: '@nexorrecords',
    },
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
    alternates: {
        canonical: 'https://nexorrecords.com.br/folder/8th%20Wonder',
        languages: {
            'pt-BR': 'https://nexorrecords.com.br/folder/8th%20Wonder',
        },
    },
    other: {
        'music:musician': '45 artistas',
        'music:album': '8th Wonder',
        'music:song_count': '150',
        'music:genre': 'Deep House, Techno, Trance, Progressive House, Melodic Techno',
        'music:release_date': '2024-12-19',
        'music:downloads': '25000',
        'music:likes': '8500',
    },
};




