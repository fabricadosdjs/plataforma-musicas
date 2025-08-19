import { Metadata } from 'next';

export async function generateMetadata({ params }: { params: { poolName: string } }): Promise<Metadata> {
    const decodedPoolName = decodeURIComponent(params.poolName);
    
    return {
        title: `${decodedPoolName} - Plataforma de Músicas`,
        description: `Explore todas as músicas da pool ${decodedPoolName}. Descubra novos sons e artistas desta gravadora de música eletrônica.`,
        keywords: [`${decodedPoolName}`, 'música eletrônica', 'gravadora', 'EDM', 'House', 'Trance', 'Dubstep'],
        openGraph: {
            title: `${decodedPoolName} - Pool de Músicas`,
            description: `Descubra todas as músicas da pool ${decodedPoolName}`,
            type: 'website',
        },
    };
}





