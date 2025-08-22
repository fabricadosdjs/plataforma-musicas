/**
 * Utilitários para conversão de áudio para MP4
 * Resolve problemas de autoplay em dispositivos móveis
 * Inspirado na solução do Digital DJ Pool
 */

/**
 * Otimiza URL de áudio para mobile SEM conversão
 * @param audioUrl - URL original do arquivo de áudio
 * @returns URL otimizada ou com headers especiais
 */
export function optimizeAudioForMobile(audioUrl: string): string {
    if (!audioUrl) return '';

    // SOLUÇÃO 1: Usar proxy que apenas muda Content-Type para video/mp4
    // Isso "engana" o navegador mobile sem converter o arquivo
    if (isMobileDevice()) {
        return `/api/audio-mobile-proxy?url=${encodeURIComponent(audioUrl)}`;
    }

    // Em desktop, usar URL original
    return audioUrl;
}

/**
 * Verifica se o dispositivo é mobile
 * @returns true se for dispositivo móvel
 */
export function isMobileDevice(): boolean {
    if (typeof window === 'undefined' || typeof navigator === 'undefined') return false;

    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
}

/**
 * Obtém URL otimizada para reprodução baseada no dispositivo
 * @param audioUrl - URL original do áudio
 * @param forceMobileProxy - Forçar proxy mobile
 * @returns URL otimizada para o dispositivo
 */
export function getOptimizedAudioUrl(audioUrl: string, forceMobileProxy: boolean = false): string {
    if (!audioUrl) return '';

    const isMobile = isMobileDevice();

    // Em mobile, usar proxy que muda Content-Type
    if (isMobile || forceMobileProxy) {
        return optimizeAudioForMobile(audioUrl);
    }

    // Em desktop, usar URL original
    return audioUrl;
}

/**
 * Cria um elemento de áudio otimizado para mobile
 * @param url - URL do arquivo
 * @param options - Opções de configuração
 * @returns Elemento HTML otimizado
 */
export function createOptimizedAudioElement(
    url: string,
    options: {
        autoplay?: boolean;
        controls?: boolean;
        preload?: 'none' | 'metadata' | 'auto';
        volume?: number;
    } = {}
): HTMLAudioElement {
    const optimizedUrl = getOptimizedAudioUrl(url);

    // Sempre usar elemento audio, mas com URL otimizada
    const audio = document.createElement('audio');
    audio.src = optimizedUrl;
    audio.autoplay = options.autoplay || false;
    audio.controls = options.controls || false;
    audio.preload = options.preload || 'metadata';
    audio.volume = options.volume || MOBILE_AUDIO_CONFIG.DEFAULT_VOLUME;

    // Configurações específicas para mobile
    if (isMobileDevice()) {
        audio.muted = false; // Não mutar em mobile - permite áudio
        audio.setAttribute('playsinline', 'true');
        audio.setAttribute('webkit-playsinline', 'true');
    }

    return audio;
}

/**
 * Configurações para reprodução otimizada em mobile
 */
export const MOBILE_AUDIO_CONFIG = {
    // Forçar MP4 em mobile
    FORCE_MP4_MOBILE: true,

    // Volume padrão em mobile (0.0 a 1.0)
    DEFAULT_VOLUME: 0.8,

    // Preload em mobile
    PRELOAD: 'metadata' as const,

    // Autoplay em mobile (geralmente false)
    AUTOPLAY: false,

    // Controles visíveis em mobile
    SHOW_CONTROLS: true,
} as const;
