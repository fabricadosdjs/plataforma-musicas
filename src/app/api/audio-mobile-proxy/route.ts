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

        // Fazer proxy direto do arquivo original com timeout
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 segundos

        try {
            // Criar headers dinamicamente
            const headers: Record<string, string> = {
                'User-Agent': 'Mozilla/5.0 (compatible; NexorRecords/1.0)',
                'Accept': 'audio/*, */*',
                'Accept-Encoding': 'identity'
            };

            const rangeHeader = request.headers.get('range');
            if (rangeHeader) {
                headers['Range'] = rangeHeader;
            }

            const audioResponse = await fetch(audioUrl, {
                signal: controller.signal,
                headers
            });

            clearTimeout(timeoutId);

            console.log(`📱 API mobile-proxy: Resposta do servidor remoto: ${audioResponse.status} ${audioResponse.statusText}`);

            if (!audioResponse.ok) {
                if (audioResponse.status === 401) {
                    console.error('❌ API mobile-proxy: Erro 401 - Não autorizado. Verificar permissões da URL.');
                    return NextResponse.json({
                        error: 'URL não autorizada. Verifique se o arquivo ainda está disponível.',
                        status: 401,
                        details: 'O arquivo pode ter sido removido ou as permissões alteradas.'
                    }, { status: 401 });
                } else if (audioResponse.status === 403) {
                    console.error('❌ API mobile-proxy: Erro 403 - Acesso negado. Verificar permissões da URL.');
                    return NextResponse.json({
                        error: 'Acesso negado ao arquivo. Verifique as permissões.',
                        status: 403,
                        details: 'O arquivo pode estar protegido ou as credenciais expiraram.'
                    }, { status: 403 });
                } else if (audioResponse.status === 404) {
                    console.error('❌ API mobile-proxy: Erro 404 - Arquivo não encontrado.');
                    return NextResponse.json({
                        error: 'Arquivo não encontrado. Verifique se a URL ainda é válida.',
                        status: 404,
                        details: 'O arquivo pode ter sido movido ou deletado.'
                    }, { status: 404 });
                } else {
                    throw new Error(`Erro ao buscar áudio: ${audioResponse.status} ${audioResponse.statusText}`);
                }
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

        } catch (fetchError) {
            clearTimeout(timeoutId);
            console.error('❌ API mobile-proxy: Erro no fetch:', fetchError);
            throw fetchError;
        }

    } catch (error) {
        console.error('❌ API mobile-proxy: Erro geral:', error);

        // Retornar erro mais específico
        if (error instanceof Error) {
            if (error.name === 'AbortError') {
                return NextResponse.json({ error: 'Timeout ao buscar áudio' }, { status: 408 });
            } else if ((error as Error).message.includes('fetch')) {
                return NextResponse.json({ error: 'Erro ao buscar áudio remoto' }, { status: 502 });
            } else if ((error as Error).message.includes('401')) {
                return NextResponse.json({ error: 'URL não autorizada' }, { status: 401 });
            } else if ((error as Error).message.includes('403')) {
                return NextResponse.json({ error: 'Acesso negado' }, { status: 403 });
            } else if ((error as Error).message.includes('404')) {
                return NextResponse.json({ error: 'Arquivo não encontrado' }, { status: 404 });
            }
        }

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
