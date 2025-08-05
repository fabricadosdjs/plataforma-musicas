export interface SEOConfig {
    title: string;
    description: string;
    keywords: string;
    url: string;
    type?: 'website' | 'music.song' | 'music.album' | 'music.playlist';
    image?: string;
    musicData?: {
        artist?: string;
        album?: string;
        duration?: number;
        releaseDate?: string;
        genre?: string;
    };
}

export const SEO_CONFIG: Record<string, SEOConfig> = {
    // Página inicial
    '/': {
        title: 'Nexor Records Pools - Sua Plataforma de música Eletrônicas',
        description: 'A melhor plataforma de músicas eletrônicas para DJs, com downloads exclusivos, streaming e lançamentos atualizados diariamente.',
        keywords: 'música eletrônica, DJ, download, streaming, house, techno, trance, remix, versão, club mix, nexor records, pools',
        url: '/',
        type: 'website'
    },

    // Página de novas músicas
    '/new': {
        title: 'Novos Lançamentos - Músicas Eletrônicas',
        description: 'Descubra os mais recentes lançamentos de música eletrônica. House, Techno, Trance e muito mais para DJs.',
        keywords: 'novos lançamentos, música eletrônica, house, techno, trance, DJ, download, streaming',
        url: '/new',
        type: 'website'
    },

    // Página de tendências
    '/trending': {
        title: 'Músicas em Alta - Trending',
        description: 'As músicas mais populares e em alta na cena eletrônica. Descubra o que está bombando nos clubs.',
        keywords: 'trending, músicas populares, house, techno, DJ, download, streaming, clubs',
        url: '/trending',
        type: 'website'
    },

    // Top 100
    '/top-100': {
        title: 'Top 100 - Melhores Músicas Eletrônicas',
        description: 'As 100 melhores músicas eletrônicas selecionadas pelos DJs. House, Techno, Trance e muito mais.',
        keywords: 'top 100, melhores músicas, house, techno, trance, DJ, download, streaming',
        url: '/top-100',
        type: 'website'
    },

    // Comunidade
    '/community': {
        title: 'Comunidade - Nexor Records Pools',
        description: 'Conecte-se com outros DJs e produtores. Compartilhe músicas e descubra novos talentos.',
        keywords: 'comunidade, DJ, produtores, música eletrônica, networking, talentos',
        url: '/community',
        type: 'website'
    },

    // Perfil do usuário
    '/profile': {
        title: 'Meu Perfil - Nexor Records Pools',
        description: 'Gerencie seu perfil, downloads, favoritos e configurações da sua conta VIP.',
        keywords: 'perfil, conta, downloads, favoritos, VIP, configurações',
        url: '/profile',
        type: 'website'
    },

    // Planos VIP
    '/plans': {
        title: 'Planos VIP - Downloads Ilimitados',
        description: 'Escolha seu plano VIP e tenha acesso a downloads ilimitados, streaming premium e muito mais.',
        keywords: 'planos VIP, downloads ilimitados, streaming premium, assinatura',
        url: '/plans',
        type: 'website'
    },

    // Calculadora de planos
    '/planstoogle': {
        title: 'Calculadora de Planos - Upgrade/Downgrade',
        description: 'Calcule o valor do seu upgrade ou downgrade de plano com desconto pro-rata.',
        keywords: 'calculadora, upgrade, downgrade, pro-rata, planos VIP',
        url: '/planstoogle',
        type: 'website'
    },

    // Admin - Dashboard
    '/admin': {
        title: 'Admin Dashboard - Nexor Records Pools',
        description: 'Painel administrativo para gerenciar usuários, músicas e configurações do sistema.',
        keywords: 'admin, dashboard, gerenciamento, usuários, músicas',
        url: '/admin',
        type: 'website'
    },

    // Admin - Usuários
    '/admin/users': {
        title: 'Gerenciar Usuários - Admin',
        description: 'Gerencie usuários, permissões e estatísticas da plataforma.',
        keywords: 'admin, usuários, permissões, estatísticas, gerenciamento',
        url: '/admin/users',
        type: 'website'
    },

    // Admin - Contabo Storage
    '/admin/contabo': {
        title: 'Contabo Storage - Admin',
        description: 'Gerencie arquivos de música no cloud storage da Contabo.',
        keywords: 'admin, contabo, storage, arquivos, música, cloud',
        url: '/admin/contabo',
        type: 'website'
    },

    // Admin - Adicionar Música
    '/admin/add-music': {
        title: 'Adicionar Música - Admin',
        description: 'Adicione novas músicas ao catálogo da plataforma.',
        keywords: 'admin, adicionar música, catálogo, upload',
        url: '/admin/add-music',
        type: 'website'
    },

    // Featured
    '/featured': {
        title: 'Músicas em Destaque - Featured',
        description: 'Músicas selecionadas e em destaque na plataforma. Os melhores lançamentos.',
        keywords: 'featured, destaque, músicas selecionadas, lançamentos',
        url: '/featured',
        type: 'website'
    },

    // Deemix
    '/deemix': {
        title: 'Deemix - Download de Músicas',
        description: 'Acesse o Deemix para downloads de músicas com qualidade premium.',
        keywords: 'deemix, download, música, qualidade premium',
        url: '/deemix',
        type: 'website'
    },

    // Allavsoft
    '/allavsoft': {
        title: 'Allavsoft - Conversor de Vídeo',
        description: 'Ferramenta para converter vídeos do YouTube e outras plataformas.',
        keywords: 'allavsoft, conversor, vídeo, youtube, download',
        url: '/allavsoft',
        type: 'website'
    },

    // Debridlink
    '/debridlink': {
        title: 'Debridlink - Download Premium',
        description: 'Acesse downloads premium com Debridlink para links de alta velocidade.',
        keywords: 'debridlink, download premium, alta velocidade, links',
        url: '/debridlink',
        type: 'website'
    },

    // Soluções
    '/solutions': {
        title: 'Soluções - Problemas e Suporte',
        description: 'Encontre soluções para problemas comuns e suporte técnico.',
        keywords: 'soluções, problemas, suporte, técnico, ajuda',
        url: '/solutions',
        type: 'website'
    },

    // Relatórios
    '/relatorios': {
        title: 'Relatórios - Estatísticas da Plataforma',
        description: 'Visualize relatórios e estatísticas detalhadas da plataforma.',
        keywords: 'relatórios, estatísticas, dados, analytics',
        url: '/relatórios',
        type: 'website'
    },

    // Auth - Login
    '/auth/sign-in': {
        title: 'Entrar - Login Nexor Records Pools',
        description: 'Faça login na sua conta para acessar downloads e recursos VIP.',
        keywords: 'login, entrar, conta, acesso, VIP',
        url: '/auth/sign-in',
        type: 'website'
    },

    // Auth - Registro
    '/auth/sign-up': {
        title: 'Criar Conta - Registro Nexor Records Pools',
        description: 'Crie sua conta gratuita e comece a explorar músicas eletrônicas.',
        keywords: 'registro, criar conta, música eletrônica, DJ',
        url: '/auth/sign-up',
        type: 'website'
    },

    // Pedidos
    '/pedidos': {
        title: 'Pedidos - Serviços Personalizados',
        description: 'Solicite packs, playlists e serviços personalizados de música eletrônica. Atendimento premium para DJs.',
        keywords: 'pedidos, packs, playlists, serviços personalizados, música eletrônica, DJ',
        url: '/pedidos',
        type: 'website'
    }
};

// Função para obter configuração SEO por rota
export function getSEOConfig(pathname: string): SEOConfig {
    // Remove query parameters
    const cleanPath = pathname.split('?')[0];

    // Verifica se existe configuração específica
    if (SEO_CONFIG[cleanPath]) {
        return SEO_CONFIG[cleanPath];
    }

    // Configuração padrão
    return {
        title: 'Nexor Records Pools - Sua Plataforma de música Eletrônicas',
        description: 'A melhor plataforma de músicas eletrônicas para DJs, com downloads exclusivos, streaming e lançamentos atualizados diariamente.',
        keywords: 'música eletrônica, DJ, download, streaming, house, techno, trance, remix, versão, club mix, nexor records, pools',
        url: cleanPath,
        type: 'website'
    };
}

// Função para gerar SEO de música específica
export function getMusicSEO(track: any, url: string): SEOConfig {
    return {
        title: `${track.songName} - ${track.artist}`,
        description: `Ouça e baixe ${track.songName} por ${track.artist}. ${track.style} disponível para download.`,
        keywords: `${track.artist}, ${track.songName}, ${track.style}, música eletrônica, DJ, download`,
        url: url,
        type: 'music.song',
        image: track.imageUrl,
        musicData: {
            artist: track.artist,
            album: 'Nexor Records Pools',
            genre: track.style,
            releaseDate: track.releaseDate
        }
    };
} 