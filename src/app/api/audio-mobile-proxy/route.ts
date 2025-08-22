import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

/**
 * Proxy otimizado para mobile - SEM CONVERSÃO
 * Apenas muda Content-Type para enganar navegadores mobile
 * Zero armazenamento extra, zero processamento de CPU
 */
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const audioUrl = searchParams.get('url');

        if (!audioUrl) {
            return NextResponse.json({ error: 'URL do áudio não fornecida' }, { status: 400 });
        }

        console.log('📱 API mobile-proxy: Streaming áudio como vídeo para mobile:', audioUrl);

        // Fazer proxy direto do arquivo original
        const audioResponse = await fetch(audioUrl);

        if (!audioResponse.ok) {
            throw new Error(`Erro ao buscar áudio: ${audioResponse.status}`);
        }

        // Obter o stream original
        const audioStream = audioResponse.body;

        if (!audioStream) {
            throw new Error('Stream de áudio não disponível');
        }

        console.log('✅ API mobile-proxy: Proxy direto estabelecido');

        // SOLUÇÃO SIMPLES: Stream direto com headers otimizados para mobile
        return new NextResponse(audioStream, {
            headers: {
                // Manter como áudio, mas com headers otimizados
                'Content-Type': audioResponse.headers.get('content-type') || 'audio/mpeg',

                // Headers essenciais para streaming
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
        console.error('❌ API mobile-proxy: Erro:', error);
        return NextResponse.json({ error: 'Erro no proxy mobile' }, { status: 500 });
    }
}

/**
 * Handler para requisições OPTIONS (CORS)
 */
export async function OPTIONS() {
    return new NextResponse(null, {
        status: 200,
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, OPTIONS',
            'Access-Control-Allow-Headers': 'Range, Content-Type',
        },
    });
}
