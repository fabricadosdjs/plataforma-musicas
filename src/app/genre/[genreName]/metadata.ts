import { Metadata } from 'next';

export async function generateMetadata({ params }: { params: { genreName: string } }): Promise<Metadata> {
    const decodedGenreName = decodeURIComponent(params.genreName);

    return {
        title: `${decodedGenreName} - Top Músicas do Gênero | Plataforma de Músicas`,
        description: `Descubra as melhores músicas do gênero ${decodedGenreName}. Top 10 das mais baixadas, lista completa e downloads diretos.`,
        keywords: [`${decodedGenreName}`, 'música', 'download', 'gênero musical', 'top 10', 'playlist'],
        openGraph: {
            title: `${decodedGenreName} - Top Músicas do Gênero`,
            description: `Descubra as melhores músicas do gênero ${decodedGenreName}. Top 10 das mais baixadas e lista completa.`,
            type: 'website',
        },
    };
}





