import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
    try {
        console.log('📤 API Upload Community: Iniciando...');

        // Verificar se o usuário está autenticado
        const session = await getServerSession(authOptions);
        if (!session?.user?.email) {
            return NextResponse.json(
                { success: false, error: 'Usuário não autenticado' },
                { status: 401 }
            );
        }

        console.log('👤 Usuário autenticado:', session.user.email);

        // Aceita apenas JSON
        if (!request.headers.get('content-type')?.includes('application/json')) {
            return NextResponse.json(
                { success: false, error: 'Content-Type deve ser application/json' },
                { status: 400 }
            );
        }

        const body = await request.json();
        const {
            songName,
            artist,
            style,
            pool,
            folder,
            coverImageUrl,
            audioFileUrl,
            releaseDate
        } = body;

        // Validações obrigatórias
        if (!songName || !artist || !style || !pool || !folder) {
            return NextResponse.json(
                {
                    success: false,
                    error: 'Todos os campos são obrigatórios: songName, artist, style, pool, folder'
                },
                { status: 400 }
            );
        }

        console.log('📤 Upload de música da comunidade:', {
            songName,
            artist,
            style,
            pool,
            folder,
            userEmail: session.user.email
        });

        // Criar registro no banco de dados
        const track = await prisma.track.create({
            data: {
                songName: songName.trim(),
                artist: artist.trim(),
                style: style.trim(),
                pool: pool.trim(),
                folder: folder.trim(),
                imageUrl: coverImageUrl || 'https://via.placeholder.com/300x300/1f2937/ffffff?text=🎵',
                previewUrl: audioFileUrl || '#',
                downloadUrl: audioFileUrl || '#',
                releaseDate: releaseDate ? new Date(releaseDate) : new Date(),
                isCommunity: true,
                uploadedBy: session.user.email,
                version: 'Original',
                createdAt: new Date(),
                updatedAt: new Date()
            }
        });

        console.log(`✅ Música "${songName}" criada com sucesso no banco de dados. ID: ${track.id}`);

        // Retornar sucesso com dados da track criada
        return NextResponse.json({
            success: true,
            message: 'Música enviada com sucesso para a comunidade!',
            track: {
                id: track.id,
                songName: track.songName,
                artist: track.artist,
                style: track.style,
                pool: track.pool,
                folder: track.folder,
                imageUrl: track.imageUrl,
                isCommunity: track.isCommunity,
                uploadedBy: track.uploadedBy,
                createdAt: track.createdAt
            }
        });

    } catch (error) {
        console.error('❌ Erro ao fazer upload da música:', error);
        return NextResponse.json(
            {
                success: false,
                error: 'Erro interno do servidor',
                details: error instanceof Error ? (error as Error).message : 'Erro desconhecido'
            },
            { status: 500 }
        );
    }
}

export async function GET(request: NextRequest) {
    try {
        // Verificar se o usuário está autenticado
        const session = await getServerSession(authOptions);
        if (!session?.user?.email) {
            return NextResponse.json(
                { success: false, error: 'Usuário não autenticado' },
                { status: 401 }
            );
        }

        // Buscar músicas enviadas pelo usuário
        const tracks = await prisma.track.findMany({
            where: {
                uploadedBy: session.user.email,
                isCommunity: true
            },
            orderBy: {
                createdAt: 'desc'
            },
            select: {
                id: true,
                songName: true,
                artist: true,
                style: true,
                pool: true,
                folder: true,
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
            tracks,
            total: tracks.length
        });

    } catch (error) {
        console.error('❌ Erro ao buscar músicas do usuário:', error);
        return NextResponse.json(
            {
                success: false,
                error: 'Erro ao buscar músicas',
                details: error instanceof Error ? (error as Error).message : 'Erro desconhecido'
            },
            { status: 500 }
        );
    }
}
