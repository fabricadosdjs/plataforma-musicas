import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Todas as Pastas | Nexor Records Pools',
    description: 'Explore todas as pastas musicais disponíveis em nossa plataforma. Descubra novas coleções, artistas e músicas organizadas por temas específicos.',
    keywords: [
        'pastas musicais',
        'folders',
        'músicas organizadas',
        'coleções musicais',
        'temas musicais',
        'artistas',
        'download música',
        'Nexor Records Pools'
    ],
    openGraph: {
        title: 'Todas as Pastas | Nexor Records Pools',
        description: 'Explore todas as pastas musicais disponíveis em nossa plataforma. Descubra novas coleções, artistas e músicas organizadas por temas específicos.',
        type: 'website',
        url: 'https://plataformamusicas.com/folders',
        siteName: 'Nexor Records Pools',
        images: [
            {
                url: 'https://plataformamusicas.com/images/og-folders.jpg',
                width: 1200,
                height: 630,
                alt: 'Todas as Pastas - Nexor Records Pools'
            }
        ]
    },
    twitter: {
        card: 'summary_large_image',
        title: 'Todas as Pastas | Nexor Records Pools',
        description: 'Explore todas as pastas musicais disponíveis em nossa plataforma.',
        images: ['https://plataformamusicas.com/images/og-folders.jpg']
    },
    robots: {
        index: true,
        follow: true,
        googleBot: {
            index: true,
            follow: true,
            'max-video-preview': -1,
            'max-image-preview': 'large',
            'max-snippet': -1
        }
    },
    alternates: {
        canonical: 'https://plataformamusicas.com/folders'
    }
};

export default function FoldersLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return children;
}
