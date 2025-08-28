import { Metadata } from 'next';

type Props = {
    params: Promise<{ query: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { query: queryParam } = await params;
    const query = decodeURIComponent(queryParam);

    // Metadata baseada na query de busca
    const title = `Buscar: ${query} - Músicas Eletrônicas | Nexor Records`;
    const description = `Resultados da busca por "${query}" na Nexor Records. Descubra músicas eletrônicas, deep house, techno e mais. Download gratuito.`;
    const keywords = `${query}, busca, música eletrônica, deep house, techno, download, nexor records, ${query.toLowerCase()}`;

    // URL canônica
    const canonicalUrl = `https://nexorrecords.com.br/search/${encodeURIComponent(query)}`;

    return {
        title,
        description,
        keywords,
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
            title,
            description,
            type: 'website',
            locale: 'pt_BR',
            siteName: 'Nexor Records',
            url: canonicalUrl,
            images: [
                {
                    url: 'https://i.ibb.co/6RzGTrYt/Gemini-Generated-Image-f672sif672sif672.png',
                    width: 1200,
                    height: 630,
                    alt: `Busca: ${query} - Músicas Eletrônicas na Nexor Records`,
                },
            ],
        },
        twitter: {
            card: 'summary_large_image',
            title,
            description,
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
            canonical: canonicalUrl,
            languages: {
                'pt-BR': canonicalUrl,
            },
        },
        other: {
            'search:query': query,
        },
    };
}



