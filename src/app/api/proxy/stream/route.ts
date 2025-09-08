import { NextRequest, NextResponse } from 'next/server';
import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3';

// Configuração do Contabo Storage
const s3Client = new S3Client({
    endpoint: 'https://usc1.contabostorage.com',
    region: 'usc1',
    credentials: {
        accessKeyId: '522ca28b56cc3159a62641d48b3e0234',
        secretAccessKey: '3fdd757a6ccfa18ed1bfebd486ed2c77',
    },
    forcePathStyle: true,
});

const BUCKET_NAME = 'plataforma-de-musicas';

// Cache de metadados para otimizar
const metadataCache = new Map<string, { size: number; contentType: string; timestamp: number }>();
const METADATA_CACHE_DURATION = 10 * 60 * 1000; // 10 minutos

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const url = searchParams.get('url');
        const range = request.headers.get('range');

        if (!url) {
            return NextResponse.json({ error: 'URL é obrigatória' }, { status: 400 });
        }

        console.log('🎵 Proxy Stream: Requisição recebida para:', url);
        if (range) {
            console.log('📊 Range request:', range);
        }

        // Extrair a chave do arquivo da URL
        let fileKey: string;
        try {
            if (url.includes('contabostorage.com')) {
                const urlParts = url.split('/plataforma-de-musicas/');
                if (urlParts.length > 1) {
                    fileKey = decodeURIComponent(urlParts[1]);
                } else {
                    throw new Error('URL inválida');
                }
            } else {
                fileKey = url;
            }
        } catch (error) {
            console.error('❌ Erro ao extrair chave do arquivo:', error);
            return NextResponse.json({ error: 'URL inválida' }, { status: 400 });
        }

        // Verificar cache de metadados
        const metadataKey = fileKey;
        let metadata = metadataCache.get(metadataKey);

        if (!metadata || (Date.now() - metadata.timestamp) > METADATA_CACHE_DURATION) {
            // Buscar metadados do arquivo
            console.log('📡 Buscando metadados do arquivo:', fileKey);

            const headCommand = new GetObjectCommand({
                Bucket: BUCKET_NAME,
                Key: fileKey,
            });

            try {
                const headResponse = await s3Client.send(headCommand);
                metadata = {
                    size: headResponse.ContentLength || 0,
                    contentType: headResponse.ContentType || 'audio/mpeg',
                    timestamp: Date.now()
                };
                metadataCache.set(metadataKey, metadata);
                console.log('💾 Metadados armazenados no cache:', fileKey);
            } catch (error) {
                console.error('❌ Erro ao buscar metadados:', error);
                throw error;
            }
        } else {
            console.log('📋 Cache hit para metadados:', fileKey);
        }

        const { size, contentType } = metadata;

        // Processar Range request
        let start = 0;
        let end = size - 1;
        let isRangeRequest = false;

        if (range) {
            isRangeRequest = true;
            const ranges = range.replace(/bytes=/, '').split('-');
            start = parseInt(ranges[0], 10);
            end = ranges[1] ? parseInt(ranges[1], 10) : size - 1;

            // Validar range
            if (start >= size || end >= size || start > end) {
                return new NextResponse(null, {
                    status: 416,
                    headers: {
                        'Content-Range': `bytes */${size}`,
                        'Access-Control-Allow-Origin': '*',
                    },
                });
            }
        }

        const contentLength = end - start + 1;

        console.log(`📊 Servindo ${isRangeRequest ? 'range' : 'completo'}: ${start}-${end}/${size} (${(contentLength / 1024).toFixed(1)}KB)`);

        // Buscar arquivo com range
        const getCommand = new GetObjectCommand({
            Bucket: BUCKET_NAME,
            Key: fileKey,
            Range: isRangeRequest ? `bytes=${start}-${end}` : undefined,
        });

        const response = await s3Client.send(getCommand);

        if (!response.Body) {
            throw new Error('Arquivo não encontrado');
        }

        // Converter stream para buffer
        const chunks: Uint8Array[] = [];
        const reader = response.Body.transformToWebStream().getReader();

        while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            chunks.push(value);
        }

        const buffer = Buffer.concat(chunks);

        console.log('✅ Stream servido com sucesso:', fileKey, `(${(buffer.length / 1024).toFixed(1)}KB)`);

        // Headers para streaming
        const headers: Record<string, string> = {
            'Content-Type': contentType,
            'Content-Length': buffer.length.toString(),
            'Accept-Ranges': 'bytes',
            'Cache-Control': 'public, max-age=3600',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, HEAD, OPTIONS',
            'Access-Control-Allow-Headers': 'Range, Content-Type',
            'X-Proxy-Source': 'contabo-stream',
        };

        if (isRangeRequest) {
            headers['Content-Range'] = `bytes ${start}-${end}/${size}`;
        }

        return new NextResponse(buffer, {
            status: isRangeRequest ? 206 : 200,
            headers,
        });

    } catch (error: any) {
        console.error('❌ Erro no proxy de stream:', error);

        let message = 'Erro interno do servidor';
        let status = 500;

        if (error.name === 'NoSuchKey') {
            message = 'Arquivo de áudio não encontrado';
            status = 404;
        } else if (error.name === 'AccessDenied') {
            message = 'Acesso negado ao arquivo de áudio';
            status = 403;
        } else if (error.name === 'InvalidAccessKeyId' || error.name === 'SignatureDoesNotMatch') {
            message = 'Credenciais de acesso inválidas';
            status = 401;
        } else if ((error as any).code === 'NetworkingError') {
            message = 'Erro de rede ao acessar o storage';
            status = 503;
        }

        return NextResponse.json({
            error: message,
            details: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
        }, { status });
    }
}

// Suporte a HEAD requests para metadados
export async function HEAD(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const url = searchParams.get('url');

        if (!url) {
            return new NextResponse(null, { status: 400 });
        }

        // Extrair chave do arquivo
        let fileKey: string;
        if (url.includes('contabostorage.com')) {
            const urlParts = url.split('/plataforma-de-musicas/');
            fileKey = urlParts.length > 1 ? decodeURIComponent(urlParts[1]) : url;
        } else {
            fileKey = url;
        }

        // Buscar metadados
        const command = new GetObjectCommand({
            Bucket: BUCKET_NAME,
            Key: fileKey,
        });

        const response = await s3Client.send(command);

        return new NextResponse(null, {
            status: 200,
            headers: {
                'Content-Type': response.ContentType || 'audio/mpeg',
                'Content-Length': (response.ContentLength || 0).toString(),
                'Accept-Ranges': 'bytes',
                'Cache-Control': 'public, max-age=3600',
                'Access-Control-Allow-Origin': '*',
            },
        });

    } catch (error) {
        return new NextResponse(null, { status: 404 });
    }
}

// Suporte a OPTIONS para CORS
export async function OPTIONS() {
    return new NextResponse(null, {
        status: 200,
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, HEAD, OPTIONS',
            'Access-Control-Allow-Headers': 'Range, Content-Type',
        },
    });
}

// Limpar cache de metadados periodicamente
setInterval(() => {
    const now = Date.now();
    for (const [key, value] of metadataCache.entries()) {
        if (now - value.timestamp > METADATA_CACHE_DURATION) {
            metadataCache.delete(key);
        }
    }
}, METADATA_CACHE_DURATION);
