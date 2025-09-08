import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const audioUrl = searchParams.get('url');

        if (!audioUrl) {
            return NextResponse.json({ error: 'URL do áudio não fornecida' }, { status: 400 });
        }

        console.log('🎵 AudioDirect: Streaming direto de:', audioUrl);

        try {
            // Fazer streaming direto do áudio
            const response = await fetch(audioUrl, {
                method: 'GET',
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
                    'Accept': 'audio/*, */*',
                    'Accept-Encoding': 'identity'
                }
            });

            if (response.ok) {
                console.log('🎵 AudioDirect: Áudio obtido com sucesso, fazendo streaming');

                // Obter o buffer do áudio
                const audioBuffer = await response.arrayBuffer();

                // Retornar o áudio com headers corretos
                return new NextResponse(audioBuffer, {
                    status: 200,
                    headers: {
                        'Content-Type': response.headers.get('Content-Type') || 'audio/mpeg',
                        'Content-Length': audioBuffer.byteLength.toString(),
                        'Accept-Ranges': 'bytes',
                        'Cache-Control': 'public, max-age=3600',
                        // CORS headers essenciais
                        'Access-Control-Allow-Origin': '*',
                        'Access-Control-Allow-Methods': 'GET, HEAD, OPTIONS',
                        'Access-Control-Allow-Headers': 'Range, Accept-Ranges, Content-Range',
                        'Access-Control-Expose-Headers': 'Content-Length, Content-Range'
                    }
                });
            } else {
                console.error('🎵 AudioDirect: Erro ao acessar URL:', response.status);
                return NextResponse.json({
                    error: 'Erro ao acessar URL de áudio',
                    status: response.status
                }, { status: response.status });
            }
        } catch (error) {
            console.error('🎵 AudioDirect: Erro de conexão:', error);
            return NextResponse.json({
                error: 'Erro de conexão com URL de áudio',
                details: error instanceof Error ? (error as Error).message : 'Unknown error'
            }, { status: 500 });
        }

    } catch (error) {
        console.error('🎵 AudioDirect: Erro interno:', error);
        return NextResponse.json({
            error: 'Erro interno do servidor',
            details: error instanceof Error ? (error as Error).message : 'Unknown error'
        }, { status: 500 });
    }
}

export async function HEAD(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const audioUrl = searchParams.get('url');

        if (!audioUrl) {
            return NextResponse.json({ error: 'URL do áudio não fornecida' }, { status: 400 });
        }

        console.log('🎵 AudioDirect: HEAD request para:', audioUrl);

        try {
            const response = await fetch(audioUrl, {
                method: 'HEAD',
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
                }
            });

            if (response.ok) {
                return new NextResponse(null, {
                    status: 200,
                    headers: {
                        'Content-Type': response.headers.get('Content-Type') || 'audio/mpeg',
                        'Content-Length': response.headers.get('Content-Length') || '0',
                        'Accept-Ranges': 'bytes',
                        'Access-Control-Allow-Origin': '*',
                        'Access-Control-Allow-Methods': 'GET, HEAD, OPTIONS',
                        'Access-Control-Allow-Headers': 'Range, Accept-Ranges, Content-Range',
                        'Access-Control-Expose-Headers': 'Content-Length, Content-Range'
                    }
                });
            } else {
                return NextResponse.json({
                    error: 'URL não acessível',
                    status: response.status
                }, { status: response.status });
            }
        } catch (error) {
            console.error('🎵 AudioDirect: Erro no HEAD:', error);
            return NextResponse.json({
                error: 'Erro de conexão',
                details: error instanceof Error ? (error as Error).message : 'Unknown error'
            }, { status: 500 });
        }

    } catch (error) {
        console.error('🎵 AudioDirect: Erro interno no HEAD:', error);
        return NextResponse.json({
            error: 'Erro interno do servidor',
            details: error instanceof Error ? (error as Error).message : 'Unknown error'
        }, { status: 500 });
    }
}

export async function OPTIONS(request: NextRequest) {
    return new NextResponse(null, {
        status: 200,
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, HEAD, OPTIONS',
            'Access-Control-Allow-Headers': 'Range, Accept-Ranges, Content-Range, Content-Type',
            'Access-Control-Max-Age': '86400'
        }
    });
}
