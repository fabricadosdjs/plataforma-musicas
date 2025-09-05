import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const playlistId = parseInt(id);

        if (isNaN(playlistId)) {
            return NextResponse.json(
                { success: false, error: 'ID da playlist inválido' },
                { status: 400 }
            );
        }

        // Verificar se a playlist existe
        const playlist = await prisma.playlist.findUnique({
            where: { id: playlistId },
            include: {
                _count: {
                    select: {
                        tracks: true
                    }
                }
            }
        });

        if (!playlist) {
            return NextResponse.json(
                { success: false, error: 'Playlist não encontrada' },
                { status: 404 }
            );
        }

        // Buscar estatísticas das músicas
        const tracks = await prisma.playlistTrack.findMany({
            where: { playlistId: playlistId },
            include: {
                track: {
                    select: {
                        style: true,
                        pool: true,
                        createdAt: true,
                        downloads: {
                            select: {
                                id: true
                            }
                        }
                    }
                }
            },
            orderBy: { order: 'asc' }
        });

        // Calcular estatísticas
        const totalTracks = tracks.length;
        const styles = tracks.map(t => t.track?.style).filter(Boolean);
        const pools = tracks.map(t => t.track?.pool).filter(Boolean);

        // Estatísticas por estilo
        const styleStats = styles.reduce((acc: Record<string, number>, style) => {
            acc[style] = (acc[style] || 0) + 1;
            return acc;
        }, {});

        // Estatísticas por pool
        const poolStats = pools.reduce((acc: Record<string, number>, pool) => {
            acc[pool] = (acc[pool] || 0) + 1;
            return acc;
        }, {});

        // Total de downloads
        const totalDownloads = tracks.reduce((sum, t) => sum + (t.track?.downloads?.length || 0), 0);

        // Música mais baixada
        const mostDownloaded = tracks.reduce((max, t) => {
            const downloads = t.track?.downloads?.length || 0;
            return downloads > (max.downloads || 0) ? { track: t.track, downloads } : max;
        }, { track: null, downloads: 0 });

        // Estilo mais popular
        const mostPopularStyle = Object.entries(styleStats).reduce((max, [style, count]) =>
            count > max.count ? { style, count } : max,
            { style: '', count: 0 }
        );

        // Pool mais popular
        const mostPopularPool = Object.entries(poolStats).reduce((max, [pool, count]) =>
            count > max.count ? { pool, count } : max,
            { pool: '', count: 0 }
        );

        // Data de criação da playlist
        const createdAt = playlist.createdAt;
        const updatedAt = playlist.updatedAt;

        // Última música adicionada
        const lastAddedTrack = tracks.length > 0 ? tracks[tracks.length - 1] : null;

        const stats = {
            playlist: {
                id: playlist.id,
                name: playlist.name,
                description: playlist.description,
                createdAt,
                updatedAt
            },
            tracks: {
                total: totalTracks,
                lastAdded: lastAddedTrack?.track ? {
                    name: lastAddedTrack.track.songName,
                    artist: lastAddedTrack.track.artist,
                    addedAt: lastAddedTrack.createdAt
                } : null
            },
            styles: {
                total: Object.keys(styleStats).length,
                distribution: styleStats,
                mostPopular: mostPopularStyle.style || 'N/A'
            },
            pools: {
                total: Object.keys(poolStats).length,
                distribution: poolStats,
                mostPopular: mostPopularPool.pool || 'N/A'
            },
            downloads: {
                total: totalDownloads,
                average: totalTracks > 0 ? Math.round(totalDownloads / totalTracks) : 0,
                mostDownloaded: mostDownloaded.track ? {
                    name: mostDownloaded.track.songName,
                    artist: mostDownloaded.track.artist,
                    downloads: mostDownloaded.downloads
                } : null
            }
        };

        return NextResponse.json({
            success: true,
            stats
        });

    } catch (error) {
        console.error('Error fetching playlist stats:', error);
        return NextResponse.json(
            {
                success: false,
                error: 'Erro interno do servidor'
            },
            { status: 500 }
        );
    } finally {
        await prisma.$disconnect();
    }
}



