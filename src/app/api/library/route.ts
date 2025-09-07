import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import prisma from '@/lib/prisma';

export async function GET(request: NextRequest) {
    try {
        console.log('🔍 API Library: Iniciando requisição...');

        const session = await getServerSession(authOptions);

        if (!session?.user?.email) {
            console.log('❌ API Library: Usuário não autenticado');
            return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
        }

        console.log('✅ API Library: Usuário autenticado:', session.user.email);

        // Buscar usuário
        const user = await prisma.user.findUnique({
            where: { email: session.user.email },
            select: { id: true }
        });

        if (!user) {
            console.log('❌ API Library: Usuário não encontrado');
            return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 });
        }

        console.log('✅ API Library: Usuário encontrado:', user.id);

        // Buscar playlists da biblioteca do usuário
        const userLibraryPlaylists = await prisma.userLibrary.findMany({
            where: { userId: user.id },
            include: {
                playlist: {
                    include: {
                        tracks: {
                            include: {
                                track: {
                                    select: {
                                        id: true,
                                        songName: true,
                                        artist: true,
                                        style: true,
                                        version: true,
                                        pool: true,
                                        imageUrl: true,
                                        previewUrl: true,
                                        downloadUrl: true,
                                        releaseDate: true,
                                        duration: true,
                                        createdAt: true,
                                        updatedAt: true
                                    }
                                }
                            },
                            orderBy: { order: 'asc' }
                        },
                        _count: {
                            select: { tracks: true }
                        }
                    }
                }
            },
            orderBy: { addedAt: 'desc' }
        });

        console.log(`✅ API Library: ${userLibraryPlaylists.length} playlists encontradas`);

        // Formatar dados
        const playlists = userLibraryPlaylists.map((userLibrary: any) => ({
            id: userLibrary.playlist.id,
            name: userLibrary.playlist.name,
            description: userLibrary.playlist.description,
            coverImage: userLibrary.playlist.coverImage,
            isPublic: userLibrary.playlist.isPublic,
            isFeatured: userLibrary.playlist.isFeatured,
            createdAt: userLibrary.playlist.createdAt,
            updatedAt: userLibrary.playlist.updatedAt,
            createdBy: userLibrary.playlist.createdBy,
            trackCount: userLibrary.playlist._count.tracks,
            addedToLibraryAt: userLibrary.addedAt,
            tracks: userLibrary.playlist.tracks.map((pt: any) => ({
                id: pt.id,
                playlistId: pt.playlistId,
                trackId: pt.trackId,
                order: pt.order,
                addedAt: pt.addedAt,
                track: pt.track
            }))
        }));

        console.log('📤 API Library: Enviando resposta...');
        return NextResponse.json({ playlists });

    } catch (error) {
        console.error('❌ API Library: Erro ao buscar biblioteca:', error);
        console.error('Stack trace:', error.stack);

        return NextResponse.json(
            {
                error: 'Erro interno do servidor',
                details: process.env.NODE_ENV === 'development' ? error.message : undefined
            },
            { status: 500 }
        );
    }
}

export async function POST(request: NextRequest) {
    try {
        console.log('🔍 API Library POST: Iniciando requisição...');

        const session = await getServerSession(authOptions);

        if (!session?.user?.email) {
            return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
        }

        const { playlistId } = await request.json();

        if (!playlistId) {
            return NextResponse.json({ error: 'ID da playlist é obrigatório' }, { status: 400 });
        }

        // Buscar usuário
        const user = await prisma.user.findUnique({
            where: { email: session.user.email },
            select: { id: true }
        });

        if (!user) {
            return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 });
        }

        // Verificar se a playlist existe
        const playlist = await prisma.playlist.findUnique({
            where: { id: parseInt(playlistId) }
        });

        if (!playlist) {
            return NextResponse.json({ error: 'Playlist não encontrada' }, { status: 404 });
        }

        // Verificar se já está na biblioteca
        const existingLibrary = await prisma.userLibrary.findUnique({
            where: {
                userId_playlistId: {
                    userId: user.id,
                    playlistId: parseInt(playlistId)
                }
            }
        });

        if (existingLibrary) {
            return NextResponse.json({ error: 'Playlist já está na biblioteca' }, { status: 400 });
        }

        // Adicionar à biblioteca
        await prisma.userLibrary.create({
            data: {
                userId: user.id,
                playlistId: parseInt(playlistId)
            }
        });

        console.log('✅ API Library POST: Playlist adicionada à biblioteca');
        return NextResponse.json({ success: true, message: 'Playlist adicionada à biblioteca' });

    } catch (error) {
        console.error('❌ API Library POST: Erro ao adicionar playlist:', error);
        return NextResponse.json(
            { error: 'Erro interno do servidor' },
            { status: 500 }
        );
    }
}

export async function DELETE(request: NextRequest) {
    try {
        console.log('🔍 API Library DELETE: Iniciando requisição...');

        const session = await getServerSession(authOptions);

        if (!session?.user?.email) {
            return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const playlistId = searchParams.get('playlistId');

        if (!playlistId) {
            return NextResponse.json({ error: 'ID da playlist é obrigatório' }, { status: 400 });
        }

        // Buscar usuário
        const user = await prisma.user.findUnique({
            where: { email: session.user.email },
            select: { id: true }
        });

        if (!user) {
            return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 });
        }

        // Remover da biblioteca
        const deletedLibrary = await prisma.userLibrary.deleteMany({
            where: {
                userId: user.id,
                playlistId: parseInt(playlistId)
            }
        });

        if (deletedLibrary.count === 0) {
            return NextResponse.json({ error: 'Playlist não encontrada na biblioteca' }, { status: 404 });
        }

        console.log('✅ API Library DELETE: Playlist removida da biblioteca');
        return NextResponse.json({ success: true, message: 'Playlist removida da biblioteca' });

    } catch (error) {
        console.error('❌ API Library DELETE: Erro ao remover playlist:', error);
        return NextResponse.json(
            { error: 'Erro interno do servidor' },
            { status: 500 }
        );
    }
}
