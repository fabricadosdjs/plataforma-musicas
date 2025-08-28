import { Metadata } from 'next';

type Props = {
    params: { folderName: string };
};

// Função para buscar dados do folder via API
async function getFolderData(folderName: string) {
    try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/api/tracks/folder/${encodeURIComponent(folderName)}`, {
            next: { revalidate: 3600 } // Revalidar a cada hora
        });

        if (response.ok) {
            const data = await response.json();
            return data;
        }
    } catch (error) {
        console.error('Erro ao buscar dados do folder:', error);
    }

    return null;
}

// Dados específicos para folders conhecidos
const getSpecificFolderData = (folderName: string) => {
    const specificFolders: { [key: string]: any } = {
        '8th Wonder': {
            name: '8th Wonder',
            description: 'O 8th Wonder é um pool de música eletrônica que reúne faixas exclusivas e atualizações constantes para DJs, focando em sons modernos e de alta qualidade para sets profissionais. Com uma curadoria atenta, o pool oferece desde lançamentos quentes até remixes raros, garantindo repertório atualizado para qualquer estilo dentro da música eletrônica.',
            image: 'https://i.ibb.co/qYHcpXrb/8th-Wonder-Promo.png',
            keywords: '8th Wonder, pool musical, música eletrônica, DJ, deep house, techno, trance, remixes, lançamentos, sets profissionais, curadoria musical',
            styles: ['Deep House', 'Techno', 'Trance', 'Progressive House', 'Melodic Techno'],
            totalTracks: 150,
            totalDownloads: 25000,
            totalLikes: 8500,
            uniqueArtists: 45,
            latestRelease: '2024-12-19'
        }
    };

    return specificFolders[folderName] || null;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const folderName = decodeURIComponent(params.folderName);

    // Buscar dados específicos do folder primeiro
    const specificFolderData = getSpecificFolderData(folderName);

    // Buscar dados reais do folder via API
    const folderData = await getFolderData(folderName);

    // Metadata base
    let title = `${folderName} - Músicas | Nexor Records`;
    let description = `Descubra as melhores músicas do folder ${folderName}. Download gratuito de músicas eletrônicas, deep house, techno e mais.`;
    let keywords = `${folderName}, música eletrônica, deep house, techno, download, nexor records`;
    let imageUrl = 'https://i.ibb.co/6RzGTrYt/Gemini-Generated-Image-f672sif672sif672.png';

    // Se temos dados específicos, usar eles
    if (specificFolderData) {
        title = `${specificFolderData.name} - ${specificFolderData.totalTracks} Músicas Eletrônicas | Nexor Records`;
        description = specificFolderData.description;
        keywords = specificFolderData.keywords;
        imageUrl = specificFolderData.image;
    }
    // Se temos dados reais da API, personalizar a metadata
    else if (folderData && folderData.tracks && folderData.tracks.length > 0) {
        const tracks = folderData.tracks;
        const totalTracks = tracks.length;
        const uniqueArtists = new Set(tracks.map((t: any) => t.artist)).size;
        const uniqueStyles = new Set(tracks.map((t: any) => t.style).filter(Boolean)).size;
        const totalDownloads = tracks.reduce((sum: number, track: any) => sum + (track.downloadCount || 0), 0);

        // Título mais específico
        title = `${folderName} - ${totalTracks} Músicas Eletrônicas | Nexor Records`;

        // Descrição personalizada com dados reais
        description = `${folderName} contém ${totalTracks} música${totalTracks !== 1 ? 's' : ''} eletrônica${totalTracks !== 1 ? 's' : ''} de alta qualidade. `;

        if (uniqueArtists > 0) {
            description += `Produzidas por ${uniqueArtists} artista${uniqueArtists !== 1 ? 's' : ''} talentoso${uniqueArtists !== 1 ? 's' : ''}. `;
        }

        if (uniqueStyles > 0) {
            description += `Estilos variados incluindo deep house, techno e mais. `;
        }

        if (totalDownloads > 0) {
            description += `Já foram baixadas ${totalDownloads.toLocaleString()} vez${totalDownloads !== 1 ? 'es' : ''}. `;
        }

        description += `Download gratuito na Nexor Records.`;

        // Keywords mais específicas
        const styleKeywords = Array.from(new Set(tracks.map((t: any) => t.style).filter(Boolean))).join(', ');
        const artistKeywords = Array.from(new Set(tracks.map((t: any) => t.artist))).slice(0, 5).join(', ');

        keywords = `${folderName}, ${styleKeywords}, ${artistKeywords}, música eletrônica, deep house, techno, download, nexor records, ${folderName.toLowerCase()}`;
    }

    // URL canônica
    const canonicalUrl = `https://nexorrecords.com.br/folder/${encodeURIComponent(folderName)}`;

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
                    url: imageUrl,
                    width: 1200,
                    height: 630,
                    alt: `${folderName} - Músicas Eletrônicas na Nexor Records`,
                },
            ],
        },
        twitter: {
            card: 'summary_large_image',
            title,
            description,
            images: [imageUrl],
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
            'music:musician': specificFolderData?.uniqueArtists ? `${specificFolderData.uniqueArtists} artistas` : (folderData?.tracks?.[0]?.artist || 'Nexor Records'),
            'music:album': folderName,
            'music:song_count': specificFolderData?.totalTracks?.toString() || folderData?.tracks?.length?.toString() || '0',
            'music:genre': specificFolderData?.styles?.join(', ') || 'Música Eletrônica',
        },
    };
}
