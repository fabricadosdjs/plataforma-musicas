import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const audioUrl = searchParams.get('url');

        if (!audioUrl) {
            return NextResponse.json({ error: 'URL do áudio não fornecida' }, { status: 400 });
        }

        console.log('🎵 AudioStream: Streaming áudio via proxy:', audioUrl);

        // Verificar se a URL é da Contabo
        const isContaboUrl = audioUrl.includes('contabostorage.com');

        if (isContaboUrl) {
            console.log('🎵 AudioStream: URL da Contabo detectada, usando proxy especial');

            try {
                // Tentar acessar via proxy da Contabo
                const proxyResponse = await fetch(audioUrl, {
                    method: 'GET',
                    headers: {
                        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
                        'Accept': 'audio/*, */*',
                        'Accept-Encoding': 'identity',
                        'Range': 'bytes=0-'
                    }
                });

                if (proxyResponse.ok) {
                    // Stream o áudio diretamente
                    const audioBuffer = await proxyResponse.arrayBuffer();

                    return new NextResponse(audioBuffer, {
                        status: 200,
                        headers: {
                            'Content-Type': proxyResponse.headers.get('Content-Type') || 'audio/mpeg',
                            'Content-Length': proxyResponse.headers.get('Content-Length') || audioBuffer.byteLength.toString(),
                            'Accept-Ranges': 'bytes',
                            'Cache-Control': 'public, max-age=3600',
                            'Access-Control-Allow-Origin': '*',
                            'Access-Control-Allow-Methods': 'GET, HEAD, OPTIONS',
                            'Access-Control-Allow-Headers': 'Range, Accept-Ranges, Content-Range',
                            'Access-Control-Expose-Headers': 'Content-Length, Content-Range'
                        }
                    });
                } else {
                    console.error('🎵 AudioStream: Erro ao acessar Contabo:', proxyResponse.status);
                    return NextResponse.json({
                        error: 'Erro ao acessar Contabo Storage',
                        status: proxyResponse.status
                    }, { status: proxyResponse.status });
                }
            } catch (error) {
                console.error('🎵 AudioStream: Erro ao acessar Contabo:', error);
                return NextResponse.json({
                    error: 'Erro de conexão com Contabo',
                    details: error instanceof Error ? (error as Error).message : 'Unknown error'
                }, { status: 500 });
            }
        } else {
            // Para outras URLs, tentar proxy direto
            try {
                const response = await fetch(audioUrl, {
                    method: 'GET',
                    headers: {
                        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
                        'Accept': 'audio/*, */*'
                    }
                });

                if (response.ok) {
                    const audioBuffer = await response.arrayBuffer();

                    return new NextResponse(audioBuffer, {
                        status: 200,
                        headers: {
                            'Content-Type': response.headers.get('Content-Type') || 'audio/mpeg',
                            'Content-Length': response.headers.get('Content-Length') || audioBuffer.byteLength.toString(),
                            'Accept-Ranges': 'bytes',
                            'Cache-Control': 'public, max-age=3600',
                            'Access-Control-Allow-Origin': '*',
                            'Access-Control-Allow-Methods': 'GET, HEAD, OPTIONS',
                            'Access-Control-Allow-Headers': 'Range, Accept-Ranges, Content-Range',
                            'Access-Control-Expose-Headers': 'Content-Length, Content-Range'
                        }
                    });
                } else {
                    return NextResponse.json({
                        error: 'Erro ao acessar URL',
                        status: response.status
                    }, { status: response.status });
                }
            } catch (error) {
                console.error('🎵 AudioStream: Erro ao acessar URL:', error);
                return NextResponse.json({
                    error: 'Erro de conexão',
                    details: error instanceof Error ? (error as Error).message : 'Unknown error'
                }, { status: 500 });
            }
        }

    } catch (error) {
        console.error('🎵 AudioStream: Erro interno:', error);
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

        console.log('🎵 AudioStream: HEAD request para:', audioUrl);

        // Verificar se a URL é acessível
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
            console.error('🎵 AudioStream: Erro no HEAD:', error);
            return NextResponse.json({
                error: 'Erro de conexão',
                details: error instanceof Error ? (error as Error).message : 'Unknown error'
            }, { status: 500 });
        }

    } catch (error) {
        console.error('🎵 AudioStream: Erro interno no HEAD:', error);
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
