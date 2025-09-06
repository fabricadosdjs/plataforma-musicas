import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import prisma from '@/lib/prisma';

export async function GET(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        // Buscar estatísticas da comunidade
        const [
            totalTracks,
            totalArtists,
            totalDownloads,
            totalLikes,
            totalPlays,
            recentUploads
        ] = await Promise.all([
            // Total de músicas da comunidade
            prisma.track.count({
                where: {
                    isCommunity: true
                }
            }),

            // Total de artistas únicos da comunidade
            prisma.track.groupBy({
                by: ['artist'],
                where: {
                    isCommunity: true
                },
                _count: {
                    artist: true
                }
            }).then((result: any) => result.length),

            // Total de downloads de músicas da comunidade
            prisma.download.count({
                where: {
                    track: {
                        isCommunity: true
                    }
                }
            }),

            // Total de likes de músicas da comunidade
            prisma.like.count({
                where: {
                    track: {
                        isCommunity: true
                    }
                }
            }),

            // Total de plays (simulado - pode ser implementado quando houver tracking de plays)
            Promise.resolve(0),

            // Uploads recentes (últimos 7 dias)
            prisma.track.count({
                where: {
                    isCommunity: true,
                    createdAt: {
                        gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
                    }
                }
            })
        ]);

        return NextResponse.json({
            totalTracks,
            totalArtists,
            totalDownloads,
            totalLikes,
            totalPlays,
            recentUploads
        });

    } catch (error) {
        console.error('Erro ao buscar estatísticas da comunidade:', error);
        return NextResponse.json({
            error: 'Erro interno do servidor',
            totalTracks: 0,
            totalArtists: 0,
            totalDownloads: 0,
            totalLikes: 0,
            totalPlays: 0,
            recentUploads: 0
        }, { status: 500 });
    }
}
