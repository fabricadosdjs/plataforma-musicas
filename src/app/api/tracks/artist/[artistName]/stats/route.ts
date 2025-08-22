import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
    request: NextRequest,
    { params }: { params: { artistName: string } }
) {
    try {
        const artistName = decodeURIComponent(params.artistName);

        if (!artistName) {
            return NextResponse.json(
                { error: 'Nome do artista é obrigatório' },
                { status: 400 }
            );
        }

        // Buscar estatísticas do artista
        const [
            totalDownloads,
            totalLikes,
            totalPlays,
            uniqueGenres,
            uniquePools,
            latestRelease
        ] = await Promise.all([
            // Total de downloads (se houver campo de download)
            prisma.track.count({
                where: {
                    artist: {
                        contains: artistName,
                        mode: 'insensitive'
                    }
                }
            }),
            // Total de likes (se houver campo de like)
            prisma.track.count({
                where: {
                    artist: {
                        contains: artistName,
                        mode: 'insensitive'
                    }
                }
            }),
            // Total de plays (se houver campo de play)
            prisma.track.count({
                where: {
                    artist: {
                        contains: artistName,
                        mode: 'insensitive'
                    }
                }
            }),
            // Estilos únicos
            prisma.track.findMany({
                where: {
                    artist: {
                        contains: artistName,
                        mode: 'insensitive'
                    },
                    style: {
                        not: null
                    }
                },
                select: {
                    style: true
                },
                distinct: ['style']
            }),
            // Pools únicos
            prisma.track.findMany({
                where: {
                    artist: {
                        contains: artistName,
                        mode: 'insensitive'
                    },
                    pool: {
                        not: null
                    }
                },
                select: {
                    pool: true
                },
                distinct: ['pool']
            }),
            // Data do lançamento mais recente
            prisma.track.findFirst({
                where: {
                    artist: {
                        contains: artistName,
                        mode: 'insensitive'
                    },
                    releaseDate: {
                        not: null
                    }
                },
                orderBy: {
                    releaseDate: 'desc'
                },
                select: {
                    releaseDate: true
                }
            })
        ]);

        return NextResponse.json({
            totalDownloads: totalDownloads || 0,
            totalLikes: totalLikes || 0,
            totalPlays: totalPlays || 0,
            uniqueGenres: uniqueGenres.length || 0,
            uniquePools: uniquePools.length || 0,
            latestRelease: latestRelease?.releaseDate || null
        });

    } catch (error) {
        console.error('Erro ao buscar estatísticas do artista:', error);
        return NextResponse.json(
            { error: 'Erro interno do servidor' },
            { status: 500 }
        );
    }
}
