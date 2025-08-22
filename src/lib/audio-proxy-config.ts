/**
 * Configuração para diferentes estratégias de proxy de áudio
 */

export interface AudioProxyStrategy {
    name: string;
    description: string;
    url: string;
    priority: number;
    enabled: boolean;
}

export const AUDIO_PROXY_STRATEGIES: AudioProxyStrategy[] = [
    {
        name: 'cloudflare-proxy',
        description: 'Proxy Cloudflare local com fallback HTTP automático',
        url: '/api/audio-cloudflare-proxy',
        priority: 1,
        enabled: true
    },
    {
        name: 'http-proxy',
        description: 'Proxy HTTP direto para URLs HTTPS da Contabo',
        url: '/api/audio-http-proxy',
        priority: 2,
        enabled: true
    },
    {
        name: 'mobile-proxy',
        description: 'Proxy mobile com headers otimizados',
        url: '/api/audio-mobile-proxy',
        priority: 3,
        enabled: true
    }
];

export const getProxyUrl = (strategy: string, originalUrl: string): string => {
    const proxyStrategy = AUDIO_PROXY_STRATEGIES.find(s => s.name === strategy && s.enabled);

    if (!proxyStrategy) {
        console.warn(`🎵 AudioProxy: Estratégia ${strategy} não encontrada ou desabilitada`);
        return originalUrl;
    }

    return `${proxyStrategy.url}?url=${encodeURIComponent(originalUrl)}`;
};

export const getBestProxyStrategy = (originalUrl: string, isMobile: boolean): AudioProxyStrategy | null => {
    if (!isMobile) return null;

    // Filtrar estratégias habilitadas e ordenar por prioridade
    const availableStrategies = AUDIO_PROXY_STRATEGIES
        .filter(s => s.enabled)
        .sort((a, b) => a.priority - b.priority);

    if (availableStrategies.length === 0) return null;

    // Para URLs da Contabo, usar a primeira estratégia disponível
    if (originalUrl.includes('contabostorage.com')) {
        return availableStrategies[0];
    }

    return null;
};

export const isProxyEnabled = (): boolean => {
    return AUDIO_PROXY_STRATEGIES.some(s => s.enabled);
};

export const getProxyStats = () => {
    return {
        totalStrategies: AUDIO_PROXY_STRATEGIES.length,
        enabledStrategies: AUDIO_PROXY_STRATEGIES.filter(s => s.enabled).length,
        strategies: AUDIO_PROXY_STRATEGIES.map(s => ({
            name: s.name,
            enabled: s.enabled,
            priority: s.priority
        }))
    };
};


