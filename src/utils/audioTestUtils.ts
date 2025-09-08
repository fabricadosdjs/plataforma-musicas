/**
 * Utilitários para testar URLs de áudio
 */

export async function testAudioUrl(url: string): Promise<{
    url: string;
    isAccessible: boolean;
    error?: string;
    contentType?: string;
    contentLength?: string;
    responseTime?: number;
    statusCode?: number;
}> {
    try {
        console.log('🧪 AudioTest: Testando URL:', url);

        const startTime = Date.now();

        // Teste mais robusto para mobile
        const response = await fetch(url, {
            method: 'HEAD',
            mode: 'cors',
            cache: 'no-cache',
            headers: {
                'User-Agent': 'Mozilla/5.0 (Linux; Android 10; Mobile) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.120 Mobile Safari/537.36'
            }
        });

        const responseTime = Date.now() - startTime;

        const result = {
            url,
            isAccessible: response.ok,
            contentType: response.headers.get('content-type') || undefined,
            contentLength: response.headers.get('content-length') || undefined,
            responseTime,
            statusCode: response.status,
            error: response.ok ? undefined : `HTTP ${response.status}: ${response.statusText}`
        };

        console.log('🧪 AudioTest: Resultado:', result);
        return result;

    } catch (error) {
        const result = {
            url,
            isAccessible: false,
            error: error instanceof Error ? (error as Error).message : 'Erro desconhecido',
            responseTime: undefined,
            statusCode: undefined
        };

        console.error('🧪 AudioTest: Erro ao testar URL:', result);
        return result;
    }
}

export async function testMultipleAudioUrls(urls: string[]): Promise<Array<{
    url: string;
    isAccessible: boolean;
    error?: string;
    contentType?: string;
    contentLength?: string;
    responseTime?: number;
    statusCode?: number;
}>> {
    console.log('🧪 AudioTest: Testando múltiplas URLs:', urls);

    const results = await Promise.all(
        urls.filter(url => url && url.trim() !== '').map(url => testAudioUrl(url))
    );

    console.log('🧪 AudioTest: Resultados finais:', results);
    return results;
}

export function logAudioElementState(audio: HTMLAudioElement, context: string = '') {
    console.log(`🎵 AudioState ${context}:`, {
        src: audio.src,
        currentSrc: audio.currentSrc,
        readyState: audio.readyState,
        networkState: audio.networkState,
        paused: audio.paused,
        ended: audio.ended,
        duration: audio.duration,
        currentTime: audio.currentTime,
        volume: audio.volume,
        muted: audio.muted,
        error: audio.error ? {
            code: audio.(error as Error).code,
            message: audio.(error as Error).message
        } : null,
        sources: Array.from(audio.querySelectorAll('source')).map(s => ({
            src: s.src,
            type: s.type,
            dataSource: s.getAttribute('data-source')
        }))
    });
}

// Nova função para testar URLs específicas da Contabo
export async function testContaboUrl(url: string): Promise<{
    originalUrl: string;
    httpUrl: string;
    httpsResult: any;
    httpResult: any;
    recommendation: string;
}> {
    console.log('🧪 AudioTest: Testando URL da Contabo:', url);

    if (!url.includes('contabostorage.com')) {
        return {
            originalUrl: url,
            httpUrl: url,
            httpsResult: null,
            httpResult: null,
            recommendation: 'Não é URL da Contabo'
        };
    }

    // Testar HTTPS original
    const httpsResult = await testAudioUrl(url);

    // Testar HTTP
    const httpUrl = url.replace('https://', 'http://');
    const httpResult = await testAudioUrl(httpUrl);

    let recommendation = '';
    if (httpsResult.isAccessible && !httpResult.isAccessible) {
        recommendation = 'Usar HTTPS (mais seguro)';
    } else if (!httpsResult.isAccessible && httpResult.isAccessible) {
        recommendation = 'Usar HTTP (funciona em mobile)';
    } else if (httpsResult.isAccessible && httpResult.isAccessible) {
        recommendation = 'Ambos funcionam, preferir HTTPS';
    } else {
        recommendation = 'Nenhum funciona, verificar URL';
    }

    const result = {
        originalUrl: url,
        httpUrl,
        httpsResult,
        httpResult,
        recommendation
    };

    console.log('🧪 AudioTest: Resultado Contabo:', result);
    return result;
}
