import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import { contaboStorage } from '@/lib/contabo-storage';
import prisma from '@/lib/prisma';

export async function POST(request: NextRequest) {
    try {
        // Verificar se o usuário está autenticado e é VIP
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return NextResponse.json(
                { success: false, error: 'Usuário não autenticado' },
                { status: 401 }
            );
        }

        // Verificar se o usuário é VIP
        const user = await prisma.user.findUnique({
            where: { id: session.user.id },
            select: { is_vip: true }
        });

        // Verificar se é VIP ou admin
        const isAdmin = session.user.email === 'edersonleonardo@nexorrecords.com.br';
        if (!user?.is_vip && !isAdmin) {
            return NextResponse.json(
                { success: false, error: 'Apenas usuários VIP podem fazer upload de músicas' },
                { status: 403 }
            );
        }

        // Aceita apenas JSON
        if (request.headers.get('content-type')?.includes('application/json')) {
            const body = await request.json();
            const { songName, artist, style, version = 'Original', pool = 'Nexor Records', releaseDate, coverUrl = '', fileKey, fileType, aiMeta } = body;

            // Validações
            if (!fileKey || !songName || !artist || !style || !releaseDate) {
                return NextResponse.json(
                    { success: false, error: 'Todos os campos são obrigatórios' },
                    { status: 400 }
                );
            }

            // Validar tipo de arquivo
            const audioTypes = ['audio/mpeg', 'audio/wav', 'audio/flac', 'audio/aac', 'audio/ogg', 'audio/mp4'];
            if (!audioTypes.includes(fileType)) {
                return NextResponse.json(
                    { success: false, error: 'Apenas arquivos de áudio são permitidos' },
                    { status: 400 }
                );
            }

            // Gerar URLs
            const downloadUrl = contaboStorage.getPublicUrl(fileKey);
            const previewUrl = downloadUrl;
            const imageUrl = coverUrl || 'https://via.placeholder.com/300x300/1f2937/ffffff?text=🎵';

            // Criar registro no banco de dados
            const track = await prisma.track.create({
                data: {
                    songName: songName.trim(),
                    artist: artist.trim(),
                    style: style.trim(),
                    version: version.trim(),
                    pool: pool.trim(),
                    imageUrl,
                    previewUrl,
                    downloadUrl,
                    releaseDate: new Date(new Date(releaseDate).toLocaleString("en-US", { timeZone: "America/Sao_Paulo" })),
                    isCommunity: true,
                    uploadedBy: session.user.id
                }
            });

            return NextResponse.json({ success: true, track });
        } else {
            return NextResponse.json(
                { success: false, error: 'Formato de envio não suportado. Use o formulário da plataforma.' },
                { status: 400 }
            );
        }
    } catch (error) {
        console.error('❌ Erro no upload de música:', error);
        console.error('📋 Detalhes do erro:', {
            name: error instanceof Error ? error.name : 'Unknown',
            message: error instanceof Error ? error.message : 'Unknown error',
            stack: error instanceof Error ? error.stack : 'No stack trace',
            cause: error instanceof Error ? error.cause : 'No cause'
        });

        return NextResponse.json(
            {
                success: false,
                error: 'Erro durante o upload da música',
                details: error instanceof Error ? error.message : 'Erro desconhecido'
            },
            { status: 500 }
        );
    }
}

export async function GET(request: NextRequest) {
    try {
        // Verificar se o usuário está autenticado
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return NextResponse.json(
                { success: false, error: 'Usuário não autenticado' },
                { status: 401 }
            );
        }

        // Buscar músicas enviadas pelo usuário
        const tracks = await prisma.track.findMany({
            where: {
                uploadedBy: session.user.id,
            },
            orderBy: {
                createdAt: 'desc'
            },
            select: {
                id: true,
                songName: true,
                artist: true,
                style: true,
                version: true,
                imageUrl: true,
                releaseDate: true,
                createdAt: true,
                _count: {
                    select: {
                        downloads: true,
                        likes: true,
                        plays: true,
                    }
                }
            }
        });

        return NextResponse.json({
            success: true,
            tracks
        });

    } catch (error) {
        console.error('❌ Erro ao buscar músicas do usuário:', error);
        return NextResponse.json(
            {
                success: false,
                error: 'Erro ao buscar músicas',
                details: error instanceof Error ? error.message : 'Erro desconhecido'
            },
            { status: 500 }
        );
    }
} 