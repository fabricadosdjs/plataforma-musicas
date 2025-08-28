import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Record Label - Nexor Records | Gravadora de Música Eletrônica',
    description: 'Nexor Records é uma gravadora especializada em música eletrônica. Descubra nossos artistas, produções exclusivas e serviços de gravação profissional.',
    keywords: 'nexor records, gravadora, música eletrônica, deep house, techno, gravação profissional, distribuição musical, spotify, apple music',
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
        title: 'Record Label - Nexor Records | Gravadora de Música Eletrônica',
        description: 'Nexor Records é uma gravadora especializada em música eletrônica. Descubra nossos artistas, produções exclusivas e serviços de gravação profissional.',
        type: 'website',
        locale: 'pt_BR',
        siteName: 'Nexor Records',
        url: 'https://nexorrecords.com.br/record_label',
        images: [
            {
                url: 'https://i.ibb.co/6RzGTrYt/Gemini-Generated-Image-f672sif672sif672.png',
                width: 1200,
                height: 630,
                alt: 'Nexor Records - Gravadora de Música Eletrônica',
            },
        ],
    },
    twitter: {
        card: 'summary_large_image',
        title: 'Record Label - Nexor Records | Gravadora de Música Eletrônica',
        description: 'Nexor Records é uma gravadora especializada em música eletrônica. Descubra nossos artistas, produções exclusivas e serviços de gravação profissional.',
        images: ['https://i.ibb.co/6RzGTrYt/Gemini-Generated-Image-f672sif672sif672.png'],
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
        canonical: 'https://nexorrecords.com.br/record_label',
        languages: {
            'pt-BR': 'https://nexorrecords.com.br/record_label',
        },
    },
};

export default function RecordLabelLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <>{children}</>;
}

