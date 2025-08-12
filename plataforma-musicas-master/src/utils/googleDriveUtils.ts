// src/utils/mediaUtils.ts

/**
 * Detecta se uma URL é do MediaFire
 */
export function isMediaFireUrl(url: string): boolean {
    return url.includes('mediafire.com') || url.includes('download.mediafire.com');
}

/**
 * Detecta se uma URL é do Google Drive
 */
export function isGoogleDriveUrl(url: string): boolean {
    return url.includes('drive.google.com') || url.includes('docs.google.com');
}

/**
 * Converte uma URL do MediaFire para um formato de download direto
 */
export function convertMediaFireUrl(url: string): string {
    // MediaFire já funciona bem com URLs diretas
    if (url.includes('download.mediafire.com')) {
        return url;
    }

    // Se for uma URL de visualização, tentar extrair link direto
    if (url.includes('mediafire.com/file/')) {
        // Para MediaFire, geralmente a URL já é direta ou pode ser usada como está
        return url;
    }

    return url;
}

/**
 * Processa URL para otimizar playback baseado no serviço
 */
export function optimizeUrlForPlayback(url: string): string {
    if (isMediaFireUrl(url)) {
        return convertMediaFireUrl(url);
    }

    if (isGoogleDriveUrl(url)) {
        // Manter lógica do Google Drive para compatibilidade
        const convertedUrl = convertGoogleDriveUrl(url);
        const urlObj = new URL(convertedUrl);
        const fileId = urlObj.searchParams.get('id');

        if (fileId) {
            return `https://docs.google.com/uc?export=open&id=${fileId}`;
        }
        return convertedUrl;
    }

    return url;
}

/**
 * Gera URLs alternativas baseado no serviço
 */
export function getAlternativeUrls(url: string): string[] {
    if (isMediaFireUrl(url)) {
        return [
            convertMediaFireUrl(url),
            url // URL original como fallback
        ];
    }

    if (isGoogleDriveUrl(url)) {
        return getAlternativeGoogleDriveUrls(url);
    }

    return [url];
}

/**
 * Converte uma URL do Google Drive para um formato de download direto
 */
export function convertGoogleDriveUrl(url: string): string {
    // Se já estiver no formato correto, retorna como está
    if (url.includes('uc?export=download&id=') || url.includes('uc?id=')) {
        return url;
    }

    // Extrair o ID do arquivo de diferentes formatos de URL do Google Drive
    let fileId = null;

    // Formato: https://drive.google.com/file/d/FILE_ID/view
    if (url.includes('/file/d/')) {
        const match = url.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
        fileId = match ? match[1] : null;
    }

    // Formato: https://drive.google.com/open?id=FILE_ID
    else if (url.includes('open?id=')) {
        const match = url.match(/open\?id=([a-zA-Z0-9_-]+)/);
        fileId = match ? match[1] : null;
    }

    // Formato: https://docs.google.com/uc?id=FILE_ID
    else if (url.includes('docs.google.com/uc?id=')) {
        const match = url.match(/uc\?id=([a-zA-Z0-9_-]+)/);
        fileId = match ? match[1] : null;
    }

    // Formato: https://drive.google.com/uc?export=download&id=FILE_ID
    else if (url.includes('uc?export=download&id=')) {
        const match = url.match(/id=([a-zA-Z0-9_-]+)/);
        fileId = match ? match[1] : null;
    }

    // Se conseguiu extrair o ID, retorna a URL de download direto
    if (fileId) {
        return `https://drive.google.com/uc?export=download&id=${fileId}`;
    }

    // Se não conseguiu extrair o ID, retorna a URL original
    return url;
}

/**
 * Adiciona parâmetros para forçar o download/streaming de arquivos do Google Drive
 */
export function forceGoogleDrivePlayback(url: string): string {
    if (!isGoogleDriveUrl(url)) {
        return url;
    }

    const convertedUrl = convertGoogleDriveUrl(url);

    // Extrair o file ID da URL
    const urlObj = new URL(convertedUrl);
    const fileId = urlObj.searchParams.get('id');

    if (fileId) {
        // Tentar diferentes formatos que podem funcionar melhor para streaming
        return `https://docs.google.com/uc?export=open&id=${fileId}`;
    }

    return convertedUrl;
}

/**
 * Gera URLs alternativas para tentar quando a principal falha
 */
export function getAlternativeGoogleDriveUrls(url: string): string[] {
    if (!isGoogleDriveUrl(url)) {
        return [url];
    }

    const convertedUrl = convertGoogleDriveUrl(url);
    const urlObj = new URL(convertedUrl);
    const fileId = urlObj.searchParams.get('id');

    if (!fileId) {
        return [url];
    }

    return [
        // Primeiro tentar nosso proxy
        `/api/proxy-gdrive?id=${fileId}`,
        // URLs diretas como fallback
        `https://docs.google.com/uc?export=open&id=${fileId}`,
        `https://drive.google.com/uc?export=download&id=${fileId}`,
        `https://drive.google.com/uc?id=${fileId}`,
        `https://drive.google.com/uc?export=download&id=${fileId}&confirm=t`,
        // URL original
        url
    ];
}

/**
 * Cria uma URL proxy para contornar possíveis problemas de CORS
 */
export function createProxyUrl(originalUrl: string): string {
    if (isGoogleDriveUrl(originalUrl)) {
        const convertedUrl = convertGoogleDriveUrl(originalUrl);
        const urlObj = new URL(convertedUrl);
        const fileId = urlObj.searchParams.get('id');

        if (fileId) {
            // Usar nosso proxy local
            return `/api/proxy-gdrive?id=${fileId}`;
        }
    }
    return originalUrl;
}
