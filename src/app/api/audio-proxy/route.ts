import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const audioUrl = searchParams.get('url');

        if (!audioUrl) {
            return NextResponse.json({ error: 'URL do áudio não fornecida' }, { status: 400 });
        }

        console.log('🎵 AudioProxy: Procurando áudio via Cloudflare:', audioUrl);

        // Tentar diferentes estratégias de proxy
        const proxyStrategies = [
            // Estratégia 1: Cloudflare Workers (se disponível)
            `https://your-worker.your-subdomain.workers.dev/proxy?url=${encodeURIComponent(audioUrl)}`,

            // Estratégia 2: Proxy público via Cloudflare
            `https://cors-anywhere.herokuapp.com/${audioUrl}`,

            // Estratégia 3: Proxy via Cloudflare CDN
            `https://your-domain.com/api/cloudflare-proxy?url=${encodeURIComponent(audioUrl)}`,

            // Estratégia 4: Proxy direto via nossa API
            audioUrl
        ];

        // Testar cada estratégia
        for (let i = 0; i < proxyStrategies.length; i++) {
            const proxyUrl = proxyStrategies[i];
            console.log(`🎵 AudioProxy: Tentando estratégia ${i + 1}:`, proxyUrl);

            try {
                // Se for nossa própria API, não fazer loop infinito
                if (i === proxyStrategies.length - 1) {
                    // Última tentativa: proxy direto
                    const response = await fetch(audioUrl, {
                        method: 'HEAD',
                        headers: {
                            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
                        }
                    });

                    if (response.ok) {
                        console.log('🎵 AudioProxy: URL direta funcionou');
                        return NextResponse.json({
                            success: true,
                            url: audioUrl,
                            method: 'direct',
                            headers: Object.fromEntries(response.headers.entries())
                        });
                    }
                } else {
                    // Testar proxy externo
                    const testResponse = await fetch(proxyUrl, {
                        method: 'HEAD',
                        headers: {
                            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
                        }
                    });

                    if (testResponse.ok) {
                        console.log(`🎵 AudioProxy: Proxy ${i + 1} funcionou`);
                        return NextResponse.json({
                            success: true,
                            url: proxyUrl,
                            method: `proxy-${i + 1}`,
                            originalUrl: audioUrl
                        });
                    }
                }
            } catch (error) {
                console.log(`🎵 AudioProxy: Estratégia ${i + 1} falhou:`, error);
                continue;
            }
        }

        // Se nenhuma estratégia funcionou, retornar erro
        console.error('🎵 AudioProxy: Todas as estratégias falharam');
        return NextResponse.json({
            error: 'Não foi possível acessar o áudio via proxy',
            strategies: proxyStrategies.length
        }, { status: 500 });

    } catch (error) {
        console.error('🎵 AudioProxy: Erro interno:', error);
        return NextResponse.json({
            error: 'Erro interno do servidor',
            details: error instanceof Error ? (error as Error).message : 'Unknown error'
        }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { audioUrl, strategy = 'auto' } = body;

        if (!audioUrl) {
            return NextResponse.json({ error: 'URL do áudio não fornecida' }, { status: 400 });
        }

        console.log('🎵 AudioProxy: POST request para:', audioUrl, 'estratégia:', strategy);

        // Estratégias específicas baseadas no parâmetro
        let proxyUrl = audioUrl;

        switch (strategy) {
            case 'cloudflare':
                // Usar Cloudflare Workers como proxy
                proxyUrl = `https://your-worker.your-subdomain.workers.dev/proxy?url=${encodeURIComponent(audioUrl)}`;
                break;

            case 'cors-anywhere':
                // Usar CORS Anywhere
                proxyUrl = `https://cors-anywhere.herokuapp.com/${audioUrl}`;
                break;

            case 'direct':
                // Tentar acesso direto
                proxyUrl = audioUrl;
                break;

            case 'auto':
            default:
                // Estratégia automática - tentar todas
                return GET(request);
        }

        // Testar a estratégia escolhida
        try {
            const response = await fetch(proxyUrl, {
                method: 'HEAD',
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
                }
            });

            if (response.ok) {
                return NextResponse.json({
                    success: true,
                    url: proxyUrl,
                    method: strategy,
                    originalUrl: audioUrl,
                    headers: Object.fromEntries(response.headers.entries())
                });
            } else {
                return NextResponse.json({
                    error: 'Proxy falhou',
                    status: response.status,
                    method: strategy
                }, { status: response.status });
            }
        } catch (error) {
            return NextResponse.json({
                error: 'Erro ao acessar proxy',
                method: strategy,
                details: error instanceof Error ? (error as Error).message : 'Unknown error'
            }, { status: 500 });
        }

    } catch (error) {
        console.error('🎵 AudioProxy: Erro no POST:', error);
        return NextResponse.json({
            error: 'Erro interno do servidor',
            details: error instanceof Error ? (error as Error).message : 'Unknown error'
        }, { status: 500 });
    }
}
