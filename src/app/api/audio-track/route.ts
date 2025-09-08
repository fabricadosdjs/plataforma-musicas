import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import { ContaboStorage } from '@/lib/contabo-storage';
import { prisma } from '@/lib/prisma';

const storage = new ContaboStorage({
    endpoint: process.env.CONTABO_ENDPOINT!,
    region: process.env.CONTABO_REGION!,
    accessKeyId: process.env.CONTABO_ACCESS_KEY!,
    secretAccessKey: process.env.CONTABO_SECRET_KEY!,
    bucketName: process.env.CONTABO_BUCKET_NAME!,
});

export async function POST(request: NextRequest) {
    try {
        console.log('🎵 API audio-track: Iniciando requisição');

        // Verificar autenticação
        const session = await getServerSession(authOptions);
        if (!session?.user) {
            console.log('❌ API audio-track: Usuário não autenticado');
            return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
        }

        const { trackId } = await request.json();

        if (!trackId) {
            console.log('❌ API audio-track: trackId não fornecido');
            return NextResponse.json({ error: 'trackId é obrigatório' }, { status: 400 });
        }

        console.log('🎵 API audio-track: Buscando track com ID:', trackId);

        // Buscar o track no banco de dados
        const track = await prisma.track.findUnique({
            where: { id: parseInt(trackId) },
            select: {
                id: true,
                songName: true,
                artist: true,
                downloadUrl: true,
                previewUrl: true
            }
        });

        if (!track) {
            console.log('❌ API audio-track: Track não encontrado para ID:', trackId);
            return NextResponse.json({ error: 'Track não encontrado' }, { status: 404 });
        }

        // Determinar qual URL usar (prioridade: downloadUrl > previewUrl)
        let audioUrl = track.downloadUrl || track.previewUrl;

        console.log('🎵 API audio-track: URLs disponíveis para track:', {
            trackId: track.id,
            songName: track.songName,
            hasDownloadUrl: !!track.downloadUrl,
            hasPreviewUrl: !!track.previewUrl,
            downloadUrl: track.downloadUrl ? track.downloadUrl.substring(0, 100) + '...' : 'N/A',
            previewUrl: track.previewUrl ? track.previewUrl.substring(0, 100) + '...' : 'N/A'
        });

        if (!audioUrl) {
            console.log('❌ API audio-track: Nenhuma URL de áudio encontrada para track:', trackId);
            return NextResponse.json({
                error: 'URL de áudio não disponível',
                details: 'Track não possui downloadUrl ou previewUrl válidas',
                trackId: track.id,
                songName: track.songName
            }, { status: 404 });
        }

        console.log('🎵 API audio-track: URL de áudio selecionada:', {
            url: audioUrl.substring(0, 100) + '...',
            isContabo: audioUrl.includes('contabostorage.com'),
            trackId: track.id
        });

        // Se for URL da Contabo, extrair a chave e gerar URL assinada
        if (audioUrl.includes('contabostorage.com')) {
            try {
                // Extrair a chave da URL do Contabo Storage
                const urlParts = audioUrl.split('/');
                const bucketIndex = urlParts.findIndex((part: any) => part.includes('plataforma-de-musicas'));

                if (bucketIndex !== -1) {
                    const pathParts = urlParts.slice(bucketIndex + 1);
                    let fileKey = pathParts.join('/');
                    // Remover parâmetros de query se existirem
                    if (fileKey.includes('?')) {
                        fileKey = fileKey.split('?')[0];
                    }
                    console.log('🎵 API audio-track: Chave extraída:', fileKey);

                    // Gerar URL assinada para reprodução (1 hora de validade)
                    const signedUrl = await storage.getSecureUrl(fileKey, 3600);

                    if (signedUrl) {
                        console.log('✅ API audio-track: URL assinada gerada com sucesso');
                        return NextResponse.json({
                            audioUrl: signedUrl,
                            trackId: track.id,
                            songName: track.songName,
                            artist: track.artist
                        });
                    } else {
                        console.error('❌ API audio-track: Falha ao gerar URL assinada');
                        return NextResponse.json({ error: 'Falha ao gerar URL de áudio' }, { status: 500 });
                    }
                } else {
                    console.error('❌ API audio-track: Padrão da Contabo não encontrado na URL');
                    return NextResponse.json({ error: 'URL da Contabo inválida' }, { status: 400 });
                }
            } catch (error) {
                console.error('❌ API audio-track: Erro ao processar URL da Contabo:', error);
                return NextResponse.json({ error: 'Erro ao processar URL de áudio' }, { status: 500 });
            }
        } else {
            // Para outras URLs, retornar como está (não são da Contabo)
            console.log('✅ API audio-track: URL não é da Contabo, retornando como está');
            return NextResponse.json({
                audioUrl: audioUrl,
                trackId: track.id,
                songName: track.songName,
                artist: track.artist
            });
        }

    } catch (error) {
        console.error('❌ API audio-track: Erro geral:', {
            error: error instanceof Error ? (error as Error).message : String(error),
            errorName: error instanceof Error ? error.name : 'Unknown',
            stack: error instanceof Error ? (error as Error).stack : 'No stack trace',
            trackId: 'Unknown'
        });

        return NextResponse.json({
            error: 'Erro interno do servidor',
            details: error instanceof Error ? (error as Error).message : 'Erro desconhecido',
            timestamp: new Date().toISOString()
        }, { status: 500 });
    }
}

/**
 * Handler para requisições HEAD (para testes de conectividade)
 */
export async function HEAD() {
    return new NextResponse(null, {
        status: 200,
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'POST, HEAD, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        },
    });
}

/**
 * Handler para requisições OPTIONS (CORS)
 */
export async function OPTIONS() {
    return new NextResponse(null, {
        status: 200,
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'POST, HEAD, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        },
    });
}
