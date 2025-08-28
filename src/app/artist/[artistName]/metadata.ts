import { Metadata } from 'next';

type Props = {
    params: { artistName: string };
};

// Função para buscar dados do artista via API
async function getArtistData(artistName: string) {
    try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/api/tracks/artist/${encodeURIComponent(artistName)}`, {
            next: { revalidate: 3600 } // Revalidar a cada hora
        });

        if (response.ok) {
            const data = await response.json();
            return data;
        }
    } catch (error) {
        console.error('Erro ao buscar dados do artista:', error);
    }

    return null;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const artistName = decodeURIComponent(params.artistName);

    // Buscar dados reais do artista
    const artistData = await getArtistData(artistName);

    // Metadata base
    let title = `${artistName} - Músicas | Nexor Records`;
    let description = `Descubra as melhores músicas de ${artistName}. Download gratuito de músicas eletrônicas, deep house, techno e mais.`;
    let keywords = `${artistName}, música eletrônica, deep house, techno, download, nexor records`;

    // Se temos dados reais, personalizar a metadata
    if (artistData && artistData.tracks && artistData.tracks.length > 0) {
        const tracks = artistData.tracks;
        const totalTracks = tracks.length;
        const uniqueStyles = new Set(tracks.map((t: any) => t.style).filter(Boolean)).size;
        const totalDownloads = tracks.reduce((sum: number, track: any) => sum + (track.downloadCount || 0), 0);
        const totalLikes = tracks.reduce((sum: number, track: any) => sum + (track.likeCount || 0), 0);

        // Título mais específico
        title = `${artistName} - ${totalTracks} Músicas Eletrônicas | Nexor Records`;

        // Descrição personalizada com dados reais
        description = `${artistName} é um produtor musical com ${totalTracks} música${totalTracks !== 1 ? 's' : ''} eletrônica${totalTracks !== 1 ? 's' : ''} de alta qualidade. `;

        if (uniqueStyles > 0) {
            description += `Especializado em ${uniqueStyles} estilo${uniqueStyles !== 1 ? 's' : ''} musical${uniqueStyles !== 1 ? 'is' : ''} incluindo deep house, techno e mais. `;
        }

        if (totalDownloads > 0) {
            description += `Suas músicas já foram baixadas ${totalDownloads.toLocaleString()} vez${totalDownloads !== 1 ? 'es' : ''}. `;
        }

        if (totalLikes > 0) {
            description += `Recebeu ${totalLikes.toLocaleString()} curtida${totalLikes !== 1 ? 's' : ''} dos usuários. `;
        }

        description += `Download gratuito na Nexor Records.`;

        // Keywords mais específicas
        const styleKeywords = Array.from(new Set(tracks.map((t: any) => t.style).filter(Boolean))).join(', ');

        keywords = `${artistName}, ${styleKeywords}, música eletrônica, deep house, techno, download, nexor records, produtor musical, ${artistName.toLowerCase()}`;
    }

    // URL canônica
    const canonicalUrl = `https://nexorrecords.com.br/artist/${encodeURIComponent(artistName)}`;

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
            type: 'profile',
            locale: 'pt_BR',
            siteName: 'Nexor Records',
            url: canonicalUrl,
            images: [
                {
                    url: 'https://i.ibb.co/6RzGTrYt/Gemini-Generated-Image-f672sif672sif672.png',
                    width: 1200,
                    height: 630,
                    alt: `${artistName} - Músicas Eletrônicas na Nexor Records`,
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
            'music:musician': artistName,
            'music:song_count': artistData?.tracks?.length?.toString() || '0',
        },
    };
}



