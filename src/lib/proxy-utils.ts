/**
 * Utilitários para Proxy Reverso do Contabo Storage
 * Resolve problemas de CORS e 403 Forbidden
 */

/**
 * Converte URL direta do Contabo Storage para usar nosso proxy
 * @param originalUrl - URL original do Contabo Storage
 * @param useStreaming - Se deve usar a API de streaming (recomendado para áudio)
 * @returns URL do proxy
 */
export function getProxyUrl(originalUrl: string, useStreaming: boolean = true): string {
    if (!originalUrl) return '';

    // Se já é uma URL de proxy, retorna como está
    if (originalUrl.includes('/api/proxy/')) {
        return originalUrl;
    }

    // Escolher endpoint baseado no tipo
    const endpoint = useStreaming ? '/api/proxy/stream' : '/api/proxy/audio';

    // Codificar a URL original como parâmetro
    const encodedUrl = encodeURIComponent(originalUrl);

    return `${endpoint}?url=${encodedUrl}`;
}

/**
 * Converte URL de download para URL de streaming
 * @param downloadUrl - URL de download do track
 * @returns URL de streaming via proxy
 */
export function getStreamingUrl(downloadUrl: string): string {
    return getProxyUrl(downloadUrl, true);
}

/**
 * Converte URL para download via proxy (sem streaming)
 * @param downloadUrl - URL de download do track
 * @returns URL de download via proxy
 */
export function getDownloadUrl(downloadUrl: string): string {
    return getProxyUrl(downloadUrl, false);
}

/**
 * Verifica se uma URL é do Contabo Storage
 * @param url - URL para verificar
 * @returns true se for URL do Contabo
 */
export function isContaboUrl(url: string): boolean {
    return url.includes('contabostorage.com') || url.includes('plataforma-de-musicas');
}

/**
 * Verifica se uma URL já está usando o proxy
 * @param url - URL para verificar
 * @returns true se já for URL de proxy
 */
export function isProxyUrl(url: string): boolean {
    return url.includes('/api/proxy/');
}

/**
 * Extrai a chave do arquivo de uma URL do Contabo
 * @param url - URL do Contabo Storage
 * @returns Chave do arquivo ou null se inválida
 */
export function extractFileKey(url: string): string | null {
    try {
        if (url.includes('/plataforma-de-musicas/')) {
            const parts = url.split('/plataforma-de-musicas/');
            return parts.length > 1 ? decodeURIComponent(parts[1]) : null;
        }
        return null;
    } catch (error) {
        console.error('Erro ao extrair chave do arquivo:', error);
        return null;
    }
}

/**
 * Converte lista de tracks para usar URLs de proxy
 * @param tracks - Array de tracks com downloadUrl
 * @returns Array de tracks com URLs de proxy
 */
export function convertTracksToProxy<T extends { downloadUrl?: string }>(tracks: T[]): T[] {
    return tracks.map(track => ({
        ...track,
        downloadUrl: track.downloadUrl ? getStreamingUrl(track.downloadUrl) : track.downloadUrl
    }));
}

/**
 * Hook personalizado para gerenciar URLs de proxy
 */
export class ProxyManager {
    private static cache = new Map<string, string>();

    /**
     * Obtém URL de proxy com cache
     * @param originalUrl - URL original
     * @param useStreaming - Usar streaming
     * @returns URL de proxy
     */
    static getProxyUrl(originalUrl: string, useStreaming: boolean = true): string {
        const cacheKey = `${originalUrl}-${useStreaming}`;

        if (this.cache.has(cacheKey)) {
            return this.cache.get(cacheKey)!;
        }

        const proxyUrl = getProxyUrl(originalUrl, useStreaming);
        this.cache.set(cacheKey, proxyUrl);

        return proxyUrl;
    }

    /**
     * Limpa cache de URLs
     */
    static clearCache(): void {
        this.cache.clear();
    }

    /**
     * Obtém estatísticas do cache
     */
    static getCacheStats(): { size: number; keys: string[] } {
        return {
            size: this.cache.size,
            keys: Array.from(this.cache.keys())
        };
    }
}

/**
 * Configurações do proxy
 */
export const PROXY_CONFIG = {
    STREAMING_ENDPOINT: '/api/proxy/stream',
    AUDIO_ENDPOINT: '/api/proxy/audio',
    CACHE_DURATION: 5 * 60 * 1000, // 5 minutos
    MAX_CACHE_SIZE: 100, // Máximo de URLs em cache
    CONTABO_BASE_URL: 'https://usc1.contabostorage.com/plataforma-de-musicas',
} as const;
