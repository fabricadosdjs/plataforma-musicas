import prisma from '@/lib/prisma';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(
    request: Request,
    { params }: { params: Promise<{ poolName: string }> }
) {
    try {
        const { poolName } = await params;
        const decodedPoolName = decodeURIComponent(poolName);

        console.log('📊 API Pool Stats chamada para:', decodedPoolName);

        // Verificar conexão com o banco
        try {
            await prisma.$connect();
            console.log('✅ Conexão com banco estabelecida');
        } catch (dbError) {
            console.error('❌ Erro na conexão com banco:', dbError);
            throw dbError;
        }

        // Buscar todas as tracks da pool
        const tracks = await prisma.track.findMany({
            where: {
                pool: {
                    equals: decodedPoolName,
                    mode: 'insensitive',
                },
            },
            include: {
                downloads: true,
                likes: true,
                plays: true,
            }
        });

        if (tracks.length === 0) {
            return NextResponse.json({
                totalTracks: 0,
                totalDownloads: 0,
                totalLikes: 0,
                totalPlays: 0,
                uniqueArtists: 0,
                uniqueGenres: 0,
                latestRelease: null,
            });
        }

        // Calcular estatísticas
        const totalTracks = tracks.length;
        const totalDownloads = tracks.reduce((sum, track) => sum + track.downloads.length, 0);
        const totalLikes = tracks.reduce((sum, track) => sum + track.likes.length, 0);
        const totalPlays = tracks.reduce((sum, track) => sum + track.plays.length, 0);

        const uniqueArtists = new Set(tracks.map(track => track.artist)).size;
        const uniqueGenres = new Set(tracks.map(track => track.style).filter(style => style && style !== 'N/A')).size;

        // Encontrar o lançamento mais recente
        const latestRelease = tracks.reduce((latest, track) => {
            const trackDate = new Date(track.releaseDate || track.createdAt);
            return !latest || trackDate > new Date(latest) ? track.releaseDate || track.createdAt : latest;
        }, null as Date | null);

        const stats = {
            totalTracks,
            totalDownloads,
            totalLikes,
            totalPlays,
            uniqueArtists,
            uniqueGenres,
            latestRelease,
        };

        console.log(`📊 Pool ${decodedPoolName} - Estatísticas:`, stats);

        return NextResponse.json(stats);

    } catch (error) {
        console.error('[GET_POOL_STATS_ERROR]', error);
        return NextResponse.json(
            {
                error: 'Erro interno do servidor',
                totalTracks: 0,
                totalDownloads: 0,
                totalLikes: 0,
                totalPlays: 0,
                uniqueArtists: 0,
                uniqueGenres: 0,
                latestRelease: null,
            },
            { status: 500 }
        );
    }
}
