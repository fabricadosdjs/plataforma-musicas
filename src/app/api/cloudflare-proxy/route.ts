import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const audioUrl = searchParams.get('url');

        if (!audioUrl) {
            return NextResponse.json({ error: 'URL do áudio não fornecida' }, { status: 400 });
        }

        console.log('🎵 CloudflareProxy: Procurando áudio via Cloudflare:', audioUrl);

        // Simular comportamento do Cloudflare Workers
        try {
            // Fazer request para a URL original
            const response = await fetch(audioUrl, {
                method: 'GET',
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
                    'Accept': 'audio/*, */*',
                    'Accept-Encoding': 'identity',
                    'Range': 'bytes=0-'
                }
            });

            if (response.ok) {
                // Para GET requests, fazer streaming real do áudio
                console.log('🎵 CloudflareProxy: Streaming áudio real via Cloudflare');

                // Stream o áudio diretamente
                const audioBuffer = await response.arrayBuffer();

                return new NextResponse(audioBuffer, {
                    status: 200,
                    headers: {
                        'Content-Type': response.headers.get('Content-Type') || 'audio/mpeg',
                        'Content-Length': response.headers.get('Content-Length') || audioBuffer.byteLength.toString(),
                        'Accept-Ranges': 'bytes',
                        'Cache-Control': 'public, max-age=3600',
                        // Headers do Cloudflare
                        'CF-Cache-Status': 'DYNAMIC',
                        'CF-RAY': 'cloudflare-proxy-' + Math.random().toString(36).substr(2, 9),
                        'Server': 'cloudflare',
                        // CORS headers
                        'Access-Control-Allow-Origin': '*',
                        'Access-Control-Allow-Methods': 'GET, HEAD, OPTIONS',
                        'Access-Control-Allow-Headers': 'Range, Accept-Ranges, Content-Range',
                        'Access-Control-Expose-Headers': 'Content-Length, Content-Range, CF-Cache-Status, CF-RAY'
                    }
                });
            } else {
                console.error('🎵 CloudflareProxy: Erro ao acessar URL:', response.status);
                return NextResponse.json({
                    error: 'Erro ao acessar URL via Cloudflare',
                    status: response.status,
                    cfRay: 'cloudflare-proxy-' + Math.random().toString(36).substr(2, 9)
                }, {
                    status: response.status,
                    headers: {
                        'CF-RAY': 'cloudflare-proxy-' + Math.random().toString(36).substr(2, 9),
                        'Server': 'cloudflare'
                    }
                });
            }
        } catch (error) {
            console.error('🎵 CloudflareProxy: Erro de conexão:', error);
            return NextResponse.json({
                error: 'Erro de conexão via Cloudflare',
                details: error instanceof Error ? (error as Error).message : 'Unknown error',
                cfRay: 'cloudflare-proxy-' + Math.random().toString(36).substr(2, 9)
            }, {
                status: 500,
                headers: {
                    'CF-RAY': 'cloudflare-proxy-' + Math.random().toString(36).substr(2, 9),
                    'Server': 'cloudflare'
                }
            });
        }

    } catch (error) {
        console.error('🎵 CloudflareProxy: Erro interno:', error);
        return NextResponse.json({
            error: 'Erro interno do Cloudflare Proxy',
            details: error instanceof Error ? (error as Error).message : 'Unknown error',
            cfRay: 'cloudflare-proxy-' + Math.random().toString(36).substr(2, 9)
        }, {
            status: 500,
            headers: {
                'CF-RAY': 'cloudflare-proxy-' + Math.random().toString(36).substr(2, 9),
                'Server': 'cloudflare'
            }
        });
    }
}

export async function HEAD(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const audioUrl = searchParams.get('url');

        if (!audioUrl) {
            return NextResponse.json({ error: 'URL do áudio não fornecida' }, { status: 400 });
        }

        console.log('🎵 CloudflareProxy: HEAD request para:', audioUrl);

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
                        // Headers do Cloudflare
                        'CF-Cache-Status': 'DYNAMIC',
                        'CF-RAY': 'cloudflare-proxy-' + Math.random().toString(36).substr(2, 9),
                        'Server': 'cloudflare',
                        // CORS headers
                        'Access-Control-Allow-Origin': '*',
                        'Access-Control-Allow-Methods': 'GET, HEAD, OPTIONS',
                        'Access-Control-Allow-Headers': 'Range, Accept-Ranges, Content-Range',
                        'Access-Control-Expose-Headers': 'Content-Length, Content-Range, CF-Cache-Status, CF-RAY'
                    }
                });
            } else {
                return NextResponse.json({
                    error: 'URL não acessível via Cloudflare',
                    status: response.status,
                    cfRay: 'cloudflare-proxy-' + Math.random().toString(36).substr(2, 9)
                }, {
                    status: response.status,
                    headers: {
                        'CF-RAY': 'cloudflare-proxy-' + Math.random().toString(36).substr(2, 9),
                        'Server': 'cloudflare'
                    }
                });
            }
        } catch (error) {
            console.error('🎵 CloudflareProxy: Erro no HEAD:', error);
            return NextResponse.json({
                error: 'Erro de conexão via Cloudflare',
                details: error instanceof Error ? (error as Error).message : 'Unknown error',
                cfRay: 'cloudflare-proxy-' + Math.random().toString(36).substr(2, 9)
            }, {
                status: 500,
                headers: {
                    'CF-RAY': 'cloudflare-proxy-' + Math.random().toString(36).substr(2, 9),
                    'Server': 'cloudflare'
                }
            });
        }

    } catch (error) {
        console.error('🎵 CloudflareProxy: Erro interno no HEAD:', error);
        return NextResponse.json({
            error: 'Erro interno do Cloudflare Proxy',
            details: error instanceof Error ? (error as Error).message : 'Unknown error',
            cfRay: 'cloudflare-proxy-' + Math.random().toString(36).substr(2, 9)
        }, {
            status: 500,
            headers: {
                'CF-RAY': 'cloudflare-proxy-' + Math.random().toString(36).substr(2, 9),
                'Server': 'cloudflare'
            }
        });
    }
}

export async function OPTIONS(request: NextRequest) {
    return new NextResponse(null, {
        status: 200,
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, HEAD, OPTIONS',
            'Access-Control-Allow-Headers': 'Range, Accept-Ranges, Content-Range, Content-Type',
            'Access-Control-Max-Age': '86400',
            'CF-RAY': 'cloudflare-proxy-' + Math.random().toString(36).substr(2, 9),
            'Server': 'cloudflare'
        }
    });
}
