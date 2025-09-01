import { Metadata } from 'next';

export async function generateMetadata({ params }: { params: Promise<{ genreName: string }> }): Promise<Metadata> {
    const { genreName } = await params;
    const decodedGenreName = decodeURIComponent(genreName);

    // SEO otimizado baseado no gênero
    const genreSeoData = {
        'brazilian funk': {
            title: 'Brazilian Funk | Funk Carioca, Músicas e Downloads',
            description: 'Descubra o Brazilian Funk (Funk Carioca): origem nas favelas do Rio, batidas 808, tamborzão. Top músicas, downloads diretos e história completa do gênero musical brasileiro.',
            keywords: ['brazilian funk', 'funk carioca', 'funk brasileiro', 'tamborzão', 'batidas 808', 'música brasileira', 'funk proibidão', 'funk consciente', 'funk melody', 'funk rave', 'download música', 'gênero musical'],
            ogDescription: 'Explore o Brazilian Funk: desde sua origem nas favelas do Rio até a popularidade mundial. Top músicas, downloads e história completa do gênero.'
        },
        'Brazilian Funk': {
            title: 'Brazilian Funk | Funk Carioca, Músicas e Downloads',
            description: 'Descubra o Brazilian Funk (Funk Carioca): origem nas favelas do Rio, batidas 808, tamborzão. Top músicas, downloads diretos e história completa do gênero musical brasileiro.',
            keywords: ['brazilian funk', 'funk carioca', 'funk brasileiro', 'tamborzão', 'batidas 808', 'música brasileira', 'funk proibidão', 'funk consciente', 'funk melody', 'funk rave', 'download música', 'gênero musical'],
            ogDescription: 'Explore o Brazilian Funk: desde sua origem nas favelas do Rio até a popularidade mundial. Top músicas, downloads e história completa do gênero.'
        },
        'Brazilian%20Funk': {
            title: 'Brazilian Funk | Funk Carioca, Músicas e Downloads',
            description: 'Descubra o Brazilian Funk (Funk Carioca): origem nas favelas do Rio, batidas 808, tamborzão. Top músicas, downloads diretos e história completa do gênero musical brasileiro.',
            keywords: ['brazilian funk', 'funk carioca', 'funk brasileiro', 'tamborzão', 'batidas 808', 'música brasileira', 'funk proibidão', 'funk consciente', 'funk melody', 'funk rave', 'download música', 'gênero musical'],
            ogDescription: 'Explore o Brazilian Funk: desde sua origem nas favelas do Rio até a popularidade mundial. Top músicas, downloads e história completa do gênero.'
        },
        'progressive house': {
            title: 'Progressive House | Música Eletrônica Progressiva, EDM e House',
            description: 'Descubra o Progressive House: evolução do house tradicional, construções atmosféricas, camadas melódicas envolventes. Top músicas, downloads diretos e história do gênero.',
            keywords: ['progressive house', 'house progressivo', 'música eletrônica', 'edm', 'house', 'sasha', 'john digweed', 'eric prydz', 'deadmau5', 'download música', 'gênero musical'],
            ogDescription: 'Explore o Progressive House: construções atmosféricas e camadas melódicas envolventes. Top músicas e downloads diretos.'
        },
        'Progressive House': {
            title: 'Progressive House | Música Eletrônica Progressiva, EDM e House',
            description: 'Descubra o Progressive House: evolução do house tradicional, construções atmosféricas, camadas melódicas envolventes. Top músicas, downloads diretos e história do gênero.',
            keywords: ['progressive house', 'house progressivo', 'música eletrônica', 'edm', 'house', 'sasha', 'john digweed', 'eric prydz', 'deadmau5', 'download música', 'gênero musical'],
            ogDescription: 'Explore o Progressive House: construções atmosféricas e camadas melódicas envolventes. Top músicas e downloads diretos.'
        },
        'Progressive%20House': {
            title: 'Progressive House | Música Eletrônica Progressiva, EDM e House',
            description: 'Descubra o Progressive House: evolução do house tradicional, construções atmosféricas, camadas melódicas envolventes. Top músicas, downloads diretos e história do gênero.',
            keywords: ['progressive house', 'house progressivo', 'música eletrônica', 'edm', 'house', 'sasha', 'john digweed', 'eric prydz', 'deadmau5', 'download música', 'gênero musical'],
            ogDescription: 'Explore o Progressive House: construções atmosféricas e camadas melódicas envolventes. Top músicas e downloads diretos.'
        },
        'hip hop': {
            title: 'Hip Hop | Rap, Beat e Cultura Urbana',
            description: 'Descubra o Hip Hop: movimento cultural nascido no Bronx nos anos 1970, unindo música, dança, arte e estilo de vida. Rap, sampling, DJing e expressão social.',
            keywords: ['hip hop', 'rap', 'bronx', 'nova york', 'música urbana', 'cultura hip hop', 'sampling', 'djing', 'batidas', 'rimas', 'expressão social', 'resistência', 'download música', 'gênero musical'],
            ogDescription: 'Explore o Hip Hop: movimento cultural que uniu música, dança e arte. Rap, sampling e expressão social desde o Bronx dos anos 1970.'
        },
        'Hip Hop': {
            title: 'Hip Hop | Rap, Beat e Cultura Urbana',
            description: 'Descubra o Hip Hop: movimento cultural nascido no Bronx nos anos 1970, unindo música, dança, arte e estilo de vida. Rap, sampling, DJing e expressão social.',
            keywords: ['hip hop', 'rap', 'bronx', 'nova york', 'música urbana', 'cultura hip hop', 'sampling', 'djing', 'batidas', 'rimas', 'expressão social', 'resistência', 'download música', 'gênero musical'],
            ogDescription: 'Explore o Hip Hop: movimento cultural que uniu música, dança e arte. Rap, sampling e expressão social desde o Bronx dos anos 1970.'
        },
        'Hip%20Hop': {
            title: 'Hip Hop | Rap, Beat e Cultura Urbana',
            description: 'Descubra o Hip Hop: movimento cultural nascido no Bronx nos anos 1970, unindo música, dança, arte e estilo de vida. Rap, sampling, DJing e expressão social.',
            keywords: ['hip hop', 'rap', 'bronx', 'nova york', 'música urbana', 'cultura hip hop', 'sampling', 'djing', 'batidas', 'rimas', 'expressão social', 'resistência', 'download música', 'gênero musical'],
            ogDescription: 'Explore o Hip Hop: movimento cultural que uniu música, dança e arte. Rap, sampling e expressão social desde o Bronx dos anos 1970.'
        },


        'dance': {
            title: 'Dance | Música Dançante e Eletrônica, Pop Dance',
            description: 'Descubra o Dance: gênero musical voltado para as pistas que mistura pop com música eletrônica. Batidas 4/4, refrões marcantes e melodias fáceis de acompanhar para dançar.',
            keywords: ['dance', 'dance music', 'música dançante', 'pop dance', 'club music', 'música eletrônica', 'edm', 'batidas 4/4', 'refrões marcantes', 'pistas de dança', 'clubes', 'festivais', 'rádio', 'download música', 'gênero musical'],
            ogDescription: 'Explore o Dance: gênero dançante que mistura pop com eletrônica. Batidas 4/4 e refrões marcantes para pistas de dança e festivais.'
        },
        'Dance': {
            title: 'Dance | Música Dançante e Eletrônica, Pop Dance',
            description: 'Descubra o Dance: gênero musical voltado para as pistas que mistura pop com música eletrônica. Batidas 4/4, refrões marcantes e melodias fáceis de acompanhar para dançar.',
            keywords: ['dance', 'dance music', 'música dançante', 'pop dance', 'club music', 'música eletrônica', 'edm', 'batidas 4/4', 'refrões marcantes', 'pistas de dança', 'clubes', 'festivais', 'rádio', 'download música', 'gênero musical'],
            ogDescription: 'Explore o Dance: gênero dançante que mistura pop com eletrônica. Batidas 4/4 e refrões marcantes para pistas de dança e festivais.'
        },
        'techno': {
            title: 'Techno | Música Eletrônica de Detroit, Batidas 4/4',
            description: 'Descubra o Techno: gênero eletrônico nascido em Detroit nos anos 1980, com batidas 4/4, linhas repetitivas e atmosferas futuristas. Funk, electro e sintetizadores.',
            keywords: ['techno', 'detroit techno', 'música eletrônica', 'edm', 'detroit', 'batidas 4/4', 'linhas repetitivas', 'atmosferas futuristas', 'funk', 'electro', 'sintetizadores', 'repetição hipnótica', 'clubes underground', 'festivais', 'download música', 'gênero musical'],
            ogDescription: 'Explore o Techno: gênero eletrônico de Detroit com batidas 4/4 e atmosferas futuristas. Um dos estilos mais influentes das pistas de dança.'
        },
        'Techno': {
            title: 'Techno | Música Eletrônica de Detroit, Batidas 4/4',
            description: 'Descubra o Techno: gênero eletrônico nascido em Detroit nos anos 1980, com batidas 4/4, linhas repetitivas e atmosferas futuristas. Funk, electro e sintetizadores.',
            keywords: ['techno', 'detroit techno', 'música eletrônica', 'edm', 'detroit', 'batidas 4/4', 'linhas repetitivas', 'atmosferas futuristas', 'funk', 'electro', 'sintetizadores', 'repetição hipnótica', 'clubes underground', 'festivais', 'download música', 'gênero musical'],
            ogDescription: 'Explore o Techno: gênero eletrônico de Detroit com batidas 4/4 e atmosferas futuristas. Um dos estilos mais influentes das pistas de dança.'
        }
    };

    // Usar dados específicos do gênero ou dados padrão
    const seoData = genreSeoData[decodedGenreName.toLowerCase() as keyof typeof genreSeoData] || {
        title: `${decodedGenreName} | Top Músicas do Gênero`,
        description: `Descubra as melhores músicas do gênero ${decodedGenreName}. Top 10 das mais baixadas, lista completa, downloads diretos e estatísticas detalhadas.`,
        keywords: [`${decodedGenreName}`, 'música', 'download', 'gênero musical', 'top 10', 'playlist', 'estatísticas', 'downloads'],
        ogDescription: `Descubra as melhores músicas do gênero ${decodedGenreName}. Top 10 das mais baixadas, lista completa e downloads diretos.`
    };

    return {
        title: seoData.title,
        description: seoData.description,
        keywords: seoData.keywords,
        authors: [{ name: 'Nexor Records Pools' }],
        creator: 'Nexor Records Pools',
        publisher: 'Nexor Records Pools',
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
        openGraph: {
            title: seoData.title,
            description: seoData.ogDescription,
            type: 'website',
            locale: 'pt_BR',
            siteName: 'Plataforma de Músicas',
            images: [
                {
                    url: 'https://i.ibb.co/Kp303Mnc/20250826-2152-Capa-de-Funk-Brasil-simple-compose-01k3mg3snwevd9s1gs8er9v7et.png',
                    width: 1200,
                    height: 630,
                    alt: `${decodedGenreName} - Gênero Musical`,
                },
            ],
        },
        twitter: {
            card: 'summary_large_image',
            title: seoData.title,
            description: seoData.ogDescription,
            images: ['https://i.ibb.co/Kp303Mnc/20250826-2152-Capa-de-Funk-Brasil-simple-compose-01k3mg3snwevd9s1gs8er9v7et.png'],
            creator: '@plataformamusicas',
            site: '@plataformamusicas',
        },
        alternates: {
            canonical: `https://plataformamusicas.com/genre/${genreName}`,
        },
        category: 'music',
        classification: 'music genre',
        other: {
            'music:genre': decodedGenreName,
            'music:category': 'genre',
        },
    };
}







