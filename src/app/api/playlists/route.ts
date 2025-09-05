import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import { prisma } from '@/lib/prisma';
import { PlaylistFilters } from '@/types/playlist';

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '20');
        const search = searchParams.get('search') || '';
        const isPublic = searchParams.get('isPublic');
        const isFeatured = searchParams.get('isFeatured');

        const filters: any = {};

        // Aplicar filtros
        if (isPublic !== null) {
            filters.isPublic = isPublic === 'true';
        }

        if (isFeatured !== null) {
            filters.isFeatured = isFeatured === 'true';
        }

        if (search) {
            filters.OR = [
                { name: { contains: search, mode: 'insensitive' } },
                { description: { contains: search, mode: 'insensitive' } }
            ];
        }

        const offset = (page - 1) * limit;

        // Buscar playlists com contagem de tracks
        const [playlists, totalCount] = await Promise.all([
            prisma.playlist.findMany({
                where: filters,
                include: {
                    tracks: {
                        include: {
                            track: {
                                select: {
                                    id: true,
                                    songName: true,
                                    artist: true,
                                    style: true,
                                    imageUrl: true,
                                    previewUrl: true,
                                    downloadUrl: true
                                }
                            }
                        },
                        orderBy: { order: 'asc' }
                    },
                    _count: {
                        select: { tracks: true }
                    }
                },
                orderBy: [
                    { isFeatured: 'desc' },
                    { createdAt: 'desc' }
                ],
                skip: offset,
                take: limit
            }),
            prisma.playlist.count({ where: filters })
        ]);

        // Formatar dados
        const formattedPlaylists = playlists.map(playlist => ({
            ...playlist,
            trackCount: playlist._count.tracks,
            tracks: playlist.tracks.map(pt => ({
                ...pt,
                track: pt.track
            }))
        }));

        const totalPages = Math.ceil(totalCount / limit);

        return NextResponse.json({
            playlists: formattedPlaylists,
            pagination: {
                currentPage: page,
                totalPages,
                totalCount,
                hasNextPage: page < totalPages,
                hasPrevPage: page > 1
            }
        });

    } catch (error) {
        console.error('Error fetching playlists:', error);
        return NextResponse.json(
            { error: 'Erro ao buscar playlists' },
            { status: 500 }
        );
    }
}

export async function POST(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.email) {
            return NextResponse.json(
                { error: 'Não autorizado' },
                { status: 401 }
            );
        }

        // Verificar se o usuário existe
        const user = await prisma.user.findUnique({
            where: { email: session.user.email }
        });

        if (!user) {
            return NextResponse.json(
                { error: 'Usuário não encontrado.' },
                { status: 404 }
            );
        }

        const body = await request.json();
        const { name, description, coverImage, isPublic = true, isFeatured = false, trackIds = [] } = body;

        if (!name || name.trim() === '') {
            return NextResponse.json(
                { error: 'Nome da playlist é obrigatório' },
                { status: 400 }
            );
        }

        // Verificar se já existe playlist com o mesmo nome
        const existingPlaylist = await prisma.playlist.findFirst({
            where: { name: { equals: name, mode: 'insensitive' } }
        });

        if (existingPlaylist) {
            return NextResponse.json(
                { error: 'Já existe uma playlist com este nome' },
                { status: 400 }
            );
        }

        // Criar playlist
        const playlist = await prisma.playlist.create({
            data: {
                name: name.trim(),
                description: description?.trim(),
                coverImage,
                isPublic,
                isFeatured,
                createdBy: session.user.email
            }
        });

        // Adicionar tracks se fornecidas
        if (trackIds.length > 0) {
            const playlistTracks = trackIds.map((trackId: number, index: number) => ({
                playlistId: playlist.id,
                trackId,
                order: index
            }));

            await prisma.playlistTrack.createMany({
                data: playlistTracks
            });
        }

        // Buscar playlist criada com tracks
        const createdPlaylist = await prisma.playlist.findUnique({
            where: { id: playlist.id },
            include: {
                tracks: {
                    include: {
                        track: {
                            select: {
                                id: true,
                                songName: true,
                                artist: true,
                                style: true,
                                imageUrl: true,
                                previewUrl: true,
                                downloadUrl: true
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
                ...createdPlaylist,
                trackCount: createdPlaylist?._count.tracks
            }
        }, { status: 201 });

    } catch (error) {
        console.error('Error creating playlist:', error);
        return NextResponse.json(
            { error: 'Erro ao criar playlist' },
            { status: 500 }
        );
    }
}
