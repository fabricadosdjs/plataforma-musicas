import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
    try {
        // Buscar estatísticas da semana atual
        const now = new Date();
        const startOfWeek = new Date(now);
        startOfWeek.setDate(now.getDate() - now.getDay()); // Domingo
        startOfWeek.setHours(0, 0, 0, 0);

        // Buscar artistas com mais downloads na semana
        const artistStats = await prisma.track.groupBy({
            by: ['artist'],
            where: {
                artist: {
                    not: null
                },
                downloads: {
                    some: {
                        createdAt: {
                            gte: startOfWeek
                        }
                    }
                }
            },
            _count: {
                id: true
            },
            _sum: {
                downloadCount: true
            }
        });

        // Buscar estatísticas detalhadas para cada artista
        const artistsWithStats = await Promise.all(
            artistStats.slice(0, 10).map(async (artist) => {
                const artistName = artist.artist;

                // Total de downloads
                const totalDownloads = await prisma.download.count({
                    where: {
                        track: {
                            artist: artistName
                        },
                        createdAt: {
                            gte: startOfWeek
                        }
                    }
                });

                // Total de likes
                const totalLikes = await prisma.like.count({
                    where: {
                        track: {
                            artist: artistName
                        },
                        createdAt: {
                            gte: startOfWeek
                        }
                    }
                });

                // Total de plays (simulado baseado em downloads)
                const totalPlays = Math.round(totalDownloads * 1.5);

                // Estilos únicos
                const uniqueGenres = await prisma.track.groupBy({
                    by: ['style'],
                    where: {
                        artist: artistName
                    }
                });

                // Gravadoras únicas
                const uniquePools = await prisma.track.groupBy({
                    by: ['pool'],
                    where: {
                        artist: artistName
                    }
                });

                // Último lançamento
                const latestRelease = await prisma.track.findFirst({
                    where: {
                        artist: artistName
                    },
                    orderBy: {
                        createdAt: 'desc'
                    },
                    select: {
                        createdAt: true
                    }
                });

                return {
                    artist: artistName,
                    totalDownloads,
                    totalLikes,
                    totalPlays,
                    uniqueGenres: uniqueGenres.length,
                    uniquePools: uniquePools.length,
                    latestRelease: latestRelease?.createdAt || null
                };
            })
        );

        // Ordenar por downloads e retornar top 6
        const topArtists = artistsWithStats
            .sort((a, b) => b.totalDownloads - a.totalDownloads)
            .slice(0, 6);

        return NextResponse.json(topArtists);

    } catch (error) {
        console.error('Erro ao buscar estatísticas dos artistas:', error);
        return NextResponse.json([], { status: 500 });
    }
}
