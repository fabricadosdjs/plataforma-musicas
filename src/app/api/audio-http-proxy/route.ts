import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const audioUrl = searchParams.get('url');

        if (!audioUrl) {
            return NextResponse.json({ error: 'URL do áudio não fornecida' }, { status: 400 });
        }

        console.log('🎵 API HTTP-proxy: Recebendo requisição para:', audioUrl);

        // Converter HTTPS para HTTP se for URL da Contabo
        let targetUrl = audioUrl;
        if (audioUrl.includes('contabostorage.com') && audioUrl.startsWith('https://')) {
            targetUrl = audioUrl.replace('https://', 'http://');
            console.log('🎵 API HTTP-proxy: Convertendo para HTTP:', targetUrl);
        }

        const audioResponse = await fetch(targetUrl);

        if (!audioResponse.ok) {
            throw new Error(`Erro ao buscar áudio: ${audioResponse.status}`);
        }

        const audioStream = audioResponse.body;
        if (!audioStream) {
            throw new Error('Stream de áudio não disponível');
        }

        console.log('✅ API HTTP-proxy: Proxy HTTP estabelecido');

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
            },
        });

    } catch (error) {
        console.error('❌ API HTTP-proxy: Erro:', error);
        return NextResponse.json({ error: 'Erro no proxy HTTP' }, { status: 500 });
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


