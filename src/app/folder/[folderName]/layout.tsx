import { Metadata } from 'next';

export async function generateMetadata({ params }: { params: Promise<{ folderName: string }> }): Promise<Metadata> {
    const { folderName: folderNameParam } = await params;
    const folderName = decodeURIComponent(folderNameParam);

    // SEO especial para "The Mashup"
    if (folderName === 'The Mashup') {
        return {
            title: 'The Mashup - Record Pool | Nexor Records Pools',
            description: 'TheMashup é uma record pool — uma plataforma de distribuição voltada para DJs e profissionais da indústria musical. Seu foco principal é disponibilizar músicas para fins promocionais, incluindo mashups, edições, remixes, acapellas, transições, entre outros formatos criativos.',
            keywords: [
                'The Mashup',
                'Record Pool',
                'Mashups',
                'Remixes',
                'Edições',
                'Acapellas',
                'Transições',
                'DJs',
                'Música Eletrônica',
                'Nexor Records',
                'Plataforma Musical',
                'Distribuição Musical'
            ],
            authors: [{ name: 'Nexor Records Pools' }],
            creator: 'Nexor Records Pools',
            publisher: 'Nexor Records Pools',
            formatDetection: {
                email: false,
                address: false,
                telephone: false,
            },
            metadataBase: new URL('https://plataformamusicas.com'),
            alternates: {
                canonical: `/folder/${encodeURIComponent(folderName)}`,
            },
            openGraph: {
                title: 'The Mashup - Record Pool | Nexor Records Pools',
                description: 'TheMashup é uma record pool — uma plataforma de distribuição voltada para DJs e profissionais da indústria musical. Seu foco principal é disponibilizar músicas para fins promocionais, incluindo mashups, edições, remixes, acapellas, transições, entre outros formatos criativos.',
                url: `https://plataformamusicas.com/folder/${encodeURIComponent(folderName)}`,
                siteName: 'Nexor Records Pools',
                images: [
                    {
                        url: 'https://i.ibb.co/WvD6264d/Chat-GPT-Image-28-de-ago-de-2025-19-51-56.png',
                        width: 1200,
                        height: 630,
                        alt: 'The Mashup - Record Pool',
                    },
                ],
                locale: 'pt_BR',
                type: 'website',
            },
            twitter: {
                card: 'summary_large_image',
                title: 'The Mashup - Record Pool | Nexor Records Pools',
                description: 'TheMashup é uma record pool — uma plataforma de distribuição voltada para DJs e profissionais da indústria musical.',
                images: ['https://i.ibb.co/WvD6264d/Chat-GPT-Image-28-de-ago-de-2025-19-51-56.png'],
                creator: '@plataformamusicas',
                site: '@plataformamusicas',
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
            verification: {
                google: 'your-google-verification-code',
                yandex: 'your-yandex-verification-code',
                yahoo: 'your-yahoo-verification-code',
            },
        };
    }

    // SEO padrão para outros folders
    return {
        title: `${folderName} | Nexor Records Pools`,
        description: `${folderName} é um folder musical com músicas disponíveis para download na plataforma Nexor Records Pools.`,
        keywords: [
            folderName,
            'Música Eletrônica',
            'Nexor Records',
            'Plataforma Musical',
            'Download de Músicas'
        ],
        authors: [{ name: 'Nexor Records Pools' }],
        creator: 'Nexor Records Pools',
        publisher: 'Nexor Records Pools',
        formatDetection: {
            email: false,
            address: false,
            telephone: false,
        },
        metadataBase: new URL('https://plataformamusicas.com'),
        alternates: {
            canonical: `/folder/${encodeURIComponent(folderName)}`,
        },
        openGraph: {
            title: `${folderName} | Nexor Records Pools`,
            description: `${folderName} é um folder musical com músicas disponíveis para download na plataforma Nexor Records Pools.`,
            url: `https://plataformamusicas.com/folder/${encodeURIComponent(folderName)}`,
            siteName: 'Nexor Records Pools',
            locale: 'pt_BR',
            type: 'website',
        },
        twitter: {
            card: 'summary',
            title: `${folderName} | Nexor Records Pools`,
            description: `${folderName} é um folder musical com músicas disponíveis para download.`,
            creator: '@plataformamusicas',
            site: '@plataformamusicas',
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
    };
}

export default function FolderLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <>
            {children}
        </>
    );
}
