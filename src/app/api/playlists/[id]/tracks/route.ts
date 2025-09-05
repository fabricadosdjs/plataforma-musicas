import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import { prisma } from '@/lib/prisma';
import { extractIdFromSlug } from '@/lib/playlist-utils';

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.email) {
            return NextResponse.json(
                { error: 'Não autorizado' },
                { status: 401 }
            );
        }

        const resolvedParams = await params;
        const playlistId = extractIdFromSlug(resolvedParams.id);

        if (!playlistId) {
            return NextResponse.json(
                { error: 'ID da playlist inválido' },
                { status: 400 }
            );
        }

        // Verificar se a playlist existe
        const playlist = await prisma.playlist.findUnique({
            where: { id: playlistId }
        });

        if (!playlist) {
            return NextResponse.json(
                { error: 'Playlist não encontrada' },
                { status: 404 }
            );
        }

        // Verificar se é o criador da playlist
        if (playlist.createdBy !== session.user.email) {
            return NextResponse.json(
                { error: 'Acesso negado. Você só pode gerenciar suas próprias playlists.' },
                { status: 403 }
            );
        }

        // Buscar tracks da playlist
        const playlistTracks = await prisma.playlistTrack.findMany({
            where: { playlistId },
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
                        createdAt: true,
                        updatedAt: true
                    }
                }
            },
            orderBy: { order: 'asc' }
        });

        return NextResponse.json({
            tracks: playlistTracks.map(pt => ({
                ...pt,
                track: pt.track
            }))
        });

    } catch (error) {
        console.error('Error fetching playlist tracks:', error);
        return NextResponse.json(
            { error: 'Erro ao buscar tracks da playlist' },
            { status: 500 }
        );
    }
}

export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.email) {
            return NextResponse.json(
                { error: 'Não autorizado' },
                { status: 401 }
            );
        }

        const resolvedParams = await params;
        const playlistId = extractIdFromSlug(resolvedParams.id);

        if (!playlistId) {
            return NextResponse.json(
                { error: 'ID da playlist inválido' },
                { status: 400 }
            );
        }

        // Verificar se a playlist existe
        const playlist = await prisma.playlist.findUnique({
            where: { id: playlistId }
        });

        if (!playlist) {
            return NextResponse.json(
                { error: 'Playlist não encontrada' },
                { status: 404 }
            );
        }

        // Verificar se é o criador da playlist
        if (playlist.createdBy !== session.user.email) {
            return NextResponse.json(
                { error: 'Acesso negado. Você só pode gerenciar suas próprias playlists.' },
                { status: 403 }
            );
        }

        const body = await request.json();
        const { trackId, order } = body;

        if (!trackId) {
            return NextResponse.json(
                { error: 'ID da track é obrigatório' },
                { status: 400 }
            );
        }

        // Verificar se a track existe
        const track = await prisma.track.findUnique({
            where: { id: trackId }
        });

        if (!track) {
            return NextResponse.json(
                { error: 'Track não encontrada' },
                { status: 404 }
            );
        }

        // Verificar se a track já está na playlist
        const existingPlaylistTrack = await prisma.playlistTrack.findUnique({
            where: {
                playlistId_trackId: {
                    playlistId,
                    trackId
                }
            }
        });

        if (existingPlaylistTrack) {
            return NextResponse.json(
                { error: 'Track já está na playlist' },
                { status: 400 }
            );
        }

        // Determinar a ordem (se não fornecida, adicionar no final)
        let trackOrder = order;
        if (trackOrder === undefined) {
            const lastTrack = await prisma.playlistTrack.findFirst({
                where: { playlistId },
                orderBy: { order: 'desc' }
            });
            trackOrder = lastTrack ? lastTrack.order + 1 : 0;
        }

        // Criar PlaylistTrack
        const playlistTrack = await prisma.playlistTrack.create({
            data: {
                playlistId,
                trackId,
                order: trackOrder
            },
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
                        createdAt: true,
                        updatedAt: true
                    }
                }
            }
        });

        return NextResponse.json({
            playlistTrack: {
                ...playlistTrack,
                track: playlistTrack.track
            }
        }, { status: 201 });

    } catch (error) {
        console.error('Error adding track to playlist:', error);
        return NextResponse.json(
            { error: 'Erro ao adicionar track à playlist' },
            { status: 500 }
        );
    }
}

export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.email) {
            return NextResponse.json(
                { error: 'Não autorizado' },
                { status: 401 }
            );
        }

        const resolvedParams = await params;
        const playlistId = extractIdFromSlug(resolvedParams.id);

        if (!playlistId) {
            return NextResponse.json(
                { error: 'ID da playlist inválido' },
                { status: 400 }
            );
        }

        const { searchParams } = new URL(request.url);
        const trackId = parseInt(searchParams.get('trackId') || '0');

        if (!trackId) {
            return NextResponse.json(
                { error: 'ID da track é obrigatório' },
                { status: 400 }
            );
        }

        // Verificar se a playlist existe
        const playlist = await prisma.playlist.findUnique({
            where: { id: playlistId }
        });

        if (!playlist) {
            return NextResponse.json(
                { error: 'Playlist não encontrada' },
                { status: 404 }
            );
        }

        // Verificar se é o criador da playlist
        if (playlist.createdBy !== session.user.email) {
            return NextResponse.json(
                { error: 'Acesso negado. Você só pode gerenciar suas próprias playlists.' },
                { status: 403 }
            );
        }

        // Verificar se a PlaylistTrack existe
        const playlistTrack = await prisma.playlistTrack.findUnique({
            where: {
                playlistId_trackId: {
                    playlistId,
                    trackId
                }
            }
        });

        if (!playlistTrack) {
            return NextResponse.json(
                { error: 'Track não encontrada na playlist' },
                { status: 404 }
            );
        }

        // Deletar PlaylistTrack
        await prisma.playlistTrack.delete({
            where: {
                playlistId_trackId: {
                    playlistId,
                    trackId
                }
            }
        });

        return NextResponse.json({ message: 'Track removida da playlist com sucesso' });

    } catch (error) {
        console.error('Error removing track from playlist:', error);
        return NextResponse.json(
            { error: 'Erro ao remover track da playlist' },
            { status: 500 }
        );
    }
}
