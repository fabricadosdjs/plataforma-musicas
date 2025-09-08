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

// Cache em memória para otimizar requisições
const cache = new Map<string, { data: Buffer; contentType: string; timestamp: number }>();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutos

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const url = searchParams.get('url');

        if (!url) {
            return NextResponse.json({ error: 'URL é obrigatória' }, { status: 400 });
        }

        console.log('🎵 Proxy Audio: Requisição recebida para:', url);

        // Extrair a chave do arquivo da URL
        let fileKey: string;
        try {
            if (url.includes('contabostorage.com')) {
                // URL completa do Contabo
                const urlParts = url.split('/plataforma-de-musicas/');
                if (urlParts.length > 1) {
                    fileKey = decodeURIComponent(urlParts[1]);
                } else {
                    throw new Error('URL inválida');
                }
            } else {
                // Chave direta
                fileKey = url;
            }
        } catch (error) {
            console.error('❌ Erro ao extrair chave do arquivo:', error);
            return NextResponse.json({ error: 'URL inválida' }, { status: 400 });
        }

        // Verificar cache
        const cacheKey = fileKey;
        const cached = cache.get(cacheKey);
        if (cached && (Date.now() - cached.timestamp) < CACHE_DURATION) {
            console.log('📋 Cache hit para:', fileKey);
            return new NextResponse(new Uint8Array(cached.data), {
                status: 200,
                headers: {
                    'Content-Type': cached.contentType,
                    'Cache-Control': 'public, max-age=300',
                    'Access-Control-Allow-Origin': '*',
                    'Access-Control-Allow-Methods': 'GET, HEAD, OPTIONS',
                    'Access-Control-Allow-Headers': 'Range, Content-Type',
                    'Accept-Ranges': 'bytes',
                },
            });
        }

        // Buscar arquivo do Contabo Storage
        console.log('📡 Buscando arquivo do Contabo:', fileKey);

        const command = new GetObjectCommand({
            Bucket: BUCKET_NAME,
            Key: fileKey,
        });

        const response = await s3Client.send(command);

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
        const contentType = response.ContentType || 'audio/mpeg';

        // Armazenar no cache (apenas arquivos pequenos < 10MB)
        if (buffer.length < 10 * 1024 * 1024) {
            cache.set(cacheKey, {
                data: buffer,
                contentType,
                timestamp: Date.now()
            });
            console.log('💾 Arquivo armazenado no cache:', fileKey);
        }

        console.log('✅ Arquivo servido com sucesso:', fileKey, `(${(buffer.length / 1024 / 1024).toFixed(2)}MB)`);

        return new NextResponse(new Uint8Array(buffer), {
            status: 200,
            headers: {
                'Content-Type': contentType,
                'Content-Length': buffer.length.toString(),
                'Cache-Control': 'public, max-age=300',
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, HEAD, OPTIONS',
                'Access-Control-Allow-Headers': 'Range, Content-Type',
                'Accept-Ranges': 'bytes',
                'X-Proxy-Cache': cached ? 'HIT' : 'MISS',
            },
        });

    } catch (error: any) {
        console.error('❌ Erro no proxy de áudio:', error);

        // Tratamento inteligente de erros
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

// Limpar cache periodicamente (executado a cada requisição)
setInterval(() => {
    const now = Date.now();
    for (const [key, value] of cache.entries()) {
        if (now - value.timestamp > CACHE_DURATION) {
            cache.delete(key);
        }
    }
}, CACHE_DURATION);
