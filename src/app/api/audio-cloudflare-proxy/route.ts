import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const audioUrl = searchParams.get('url');

        if (!audioUrl) {
            return NextResponse.json({ error: 'URL do áudio não fornecida' }, { status: 400 });
        }

        console.log('🌐 API Cloudflare-proxy: Recebendo requisição para:', audioUrl);

        // Se for URL da Contabo, tentar diferentes estratégias
        let targetUrl = audioUrl;
        let strategy = 'original';

        if (audioUrl.includes('contabostorage.com')) {
            // ESTRATÉGIA 1: Tentar HTTP primeiro (mais compatível com mobile)
            if (audioUrl.startsWith('https://')) {
                const httpUrl = audioUrl.replace('https://', 'http://');
                console.log('🌐 API Cloudflare-proxy: Tentando HTTP:', httpUrl);

                try {
                    const httpResponse = await fetch(httpUrl, { method: 'HEAD' });
                    if (httpResponse.ok) {
                        targetUrl = httpUrl;
                        strategy = 'http-fallback';
                        console.log('✅ API Cloudflare-proxy: HTTP funcionou');
                    } else {
                        console.log('⚠️ API Cloudflare-proxy: HTTP falhou, mantendo HTTPS');
                    }
                } catch (error) {
                    console.log('⚠️ API Cloudflare-proxy: Erro ao testar HTTP, mantendo HTTPS');
                }
            }
        }

        console.log(`🌐 API Cloudflare-proxy: Usando estratégia: ${strategy} - ${targetUrl}`);

        const audioResponse = await fetch(targetUrl);

        if (!audioResponse.ok) {
            throw new Error(`Erro ao buscar áudio: ${audioResponse.status}`);
        }

        const audioStream = audioResponse.body;
        if (!audioStream) {
            throw new Error('Stream de áudio não disponível');
        }

        console.log('✅ API Cloudflare-proxy: Proxy estabelecido com sucesso');

        // Retornar stream com headers otimizados para mobile
        return new NextResponse(audioStream, {
            headers: {
                'Content-Type': audioResponse.headers.get('content-type') || 'audio/mpeg',
                'Content-Length': audioResponse.headers.get('content-length') || '',
                'Accept-Ranges': 'bytes',
                'Cache-Control': 'public, max-age=3600',

                // CORS essencial
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, HEAD, OPTIONS',
                'Access-Control-Allow-Headers': 'Range, Content-Type, Authorization',
                'Access-Control-Expose-Headers': 'Content-Length, Content-Range',

                // Headers para mobile
                'X-Content-Type-Options': 'nosniff',
                'X-Frame-Options': 'SAMEORIGIN',

                // Header customizado para debug
                'X-Proxy-Strategy': strategy,
                'X-Original-URL': audioUrl,
            },
        });

    } catch (error) {
        console.error('❌ API Cloudflare-proxy: Erro:', error);
        return NextResponse.json({ error: 'Erro no proxy Cloudflare' }, { status: 500 });
    }
}

export async function OPTIONS() {
    return new NextResponse(null, {
        status: 200,
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type',
        },
    });
}


