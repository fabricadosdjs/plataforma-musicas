import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
import { extractIdFromSlug } from '@/lib/playlist-utils';

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const resolvedParams = await params;
        const playlistId = extractIdFromSlug(resolvedParams.id);

        if (!playlistId) {
            return NextResponse.json(
                { error: 'ID da playlist inválido' },
                { status: 400 }
            );
        }

        const playlist = await prisma.playlist.findUnique({
            where: { id: playlistId },
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
        });

        if (!playlist) {
            return NextResponse.json(
                { error: 'Playlist não encontrada' },
                { status: 404 }
            );
        }

        // Verificar se é pública ou se o usuário tem acesso
        const session = await getServerSession(authOptions);
        if (!playlist.isPublic && (!session?.user?.email || session.user.email !== playlist.createdBy)) {
            return NextResponse.json(
                { error: 'Acesso negado' },
                { status: 403 }
            );
        }

        return NextResponse.json({
            playlist: {
                ...playlist,
                trackCount: playlist._count.tracks,
                tracks: playlist.tracks.map((pt: any) => ({
                    ...pt,
                    track: pt.track
                }))
            }
        });

    } catch (error) {
        console.error('Error fetching playlist:', error);
        return NextResponse.json(
            { error: 'Erro ao buscar playlist' },
            { status: 500 }
        );
    }
}

export async function PUT(
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
        const existingPlaylist = await prisma.playlist.findUnique({
            where: { id: playlistId }
        });

        if (!existingPlaylist) {
            return NextResponse.json(
                { error: 'Playlist não encontrada' },
                { status: 404 }
            );
        }

        // Verificar se é o criador da playlist
        if (existingPlaylist.createdBy !== session.user.email) {
            return NextResponse.json(
                { error: 'Acesso negado. Você só pode editar suas próprias playlists.' },
                { status: 403 }
            );
        }

        const body = await request.json();
        const { name, description, coverImage, isPublic, isFeatured, trackIds } = body;

        // Verificar se o nome já existe (se foi alterado)
        if (name && name !== existingPlaylist.name) {
            const nameExists = await prisma.playlist.findFirst({
                where: {
                    name: { equals: name, mode: 'insensitive' },
                    id: { not: playlistId }
                }
            });

            if (nameExists) {
                return NextResponse.json(
                    { error: 'Já existe uma playlist com este nome' },
                    { status: 400 }
                );
            }
        }

        // Atualizar playlist
        const updateData: any = {};
        if (name !== undefined) updateData.name = name.trim();
        if (description !== undefined) updateData.description = description?.trim();
        if (coverImage !== undefined) updateData.coverImage = coverImage;
        if (isPublic !== undefined) updateData.isPublic = isPublic;
        if (isFeatured !== undefined) updateData.isFeatured = isFeatured;

        const playlist = await prisma.playlist.update({
            where: { id: playlistId },
            data: updateData
        });

        // Atualizar tracks se fornecidas
        if (trackIds !== undefined) {
            // Remover tracks existentes
            await prisma.playlistTrack.deleteMany({
                where: { playlistId }
            });

            // Adicionar novas tracks
            if (trackIds.length > 0) {
                const playlistTracks = trackIds.map((trackId: number, index: number) => ({
                    playlistId,
                    trackId,
                    order: index
                }));

                await prisma.playlistTrack.createMany({
                    data: playlistTracks
                });
            }
        }

        // Buscar playlist atualizada
        const updatedPlaylist = await prisma.playlist.findUnique({
            where: { id: playlistId },
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
        });

        return NextResponse.json({
            playlist: {
                ...updatedPlaylist,
                trackCount: updatedPlaylist?._count.tracks
            }
        });

    } catch (error) {
        console.error('Error updating playlist:', error);
        return NextResponse.json(
            { error: 'Erro ao atualizar playlist' },
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

        // Verificar se a playlist existe
        const existingPlaylist = await prisma.playlist.findUnique({
            where: { id: playlistId }
        });

        if (!existingPlaylist) {
            return NextResponse.json(
                { error: 'Playlist não encontrada' },
                { status: 404 }
            );
        }

        // Verificar se é o criador da playlist
        if (existingPlaylist.createdBy !== session.user.email) {
            return NextResponse.json(
                { error: 'Acesso negado. Você só pode deletar suas próprias playlists.' },
                { status: 403 }
            );
        }

        // Deletar playlist (cascade deletará as playlistTracks)
        await prisma.playlist.delete({
            where: { id: playlistId }
        });

        return NextResponse.json({ message: 'Playlist deletada com sucesso' });

    } catch (error) {
        console.error('Error deleting playlist:', error);
        return NextResponse.json(
            { error: 'Erro ao deletar playlist' },
            { status: 500 }
        );
    }
}
