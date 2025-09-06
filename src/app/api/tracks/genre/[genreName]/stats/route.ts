import prisma from '@/lib/prisma';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const revalidate = 600; // Cache por 10 minutos para estatísticas

export async function GET(
    request: Request,
    { params }: { params: Promise<{ genreName: string }> }
) {
    try {
        const { genreName } = await params;
        const decodedGenreName = decodeURIComponent(genreName);

        // Log apenas em desenvolvimento
        if (process.env.NODE_ENV === 'development') {
            console.log(`📊 Stats API: ${decodedGenreName}`);
        }

        // Verificar conexão com o banco
        try {
            await prisma.$connect();
        } catch (dbError) {
            console.error('❌ Erro na conexão com banco:', dbError);
            throw dbError;
        }

        // Buscar todas as tracks do gênero
        const tracks = await prisma.track.findMany({
            where: {
                style: {
                    equals: decodedGenreName,
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
                uniquePools: 0,
                latestRelease: null,
            });
        }

        // Calcular estatísticas
        const totalTracks = tracks.length;

        // Contar downloads únicos por música (cada música só pode ter 1 download por usuário)
        const totalDownloads = tracks.reduce((sum: any, track: any) => {
            // Usar Set para contar usuários únicos que baixaram cada música
            const uniqueUsers = new Set(track.downloads.map((download: any) => download.userId).filter(Boolean));
            return sum + uniqueUsers.size;
        }, 0);

        // Contar likes únicos por música (cada música só pode ter 1 like por usuário)
        const totalLikes = tracks.reduce((sum: any, track: any) => {
            // Usar Set para contar usuários únicos que deram like em cada música
            const uniqueUsers = new Set(track.likes.map((like: any) => like.userId).filter(Boolean));
            return sum + uniqueUsers.size;
        }, 0);

        // Contar plays únicos por música (cada música só pode ter 1 play por usuário)
        const totalPlays = tracks.reduce((sum: any, track: any) => {
            // Usar Set para contar usuários únicos que tocaram cada música
            const uniqueUsers = new Set(track.plays.map((play: any) => play.userId).filter(Boolean));
            return sum + uniqueUsers.size;
        }, 0);

        const uniqueArtists = new Set(tracks.map((track: any) => track.artist)).size;
        const uniquePools = new Set(tracks.map((track: any) => track.pool).filter((pool: any) => pool && pool !== 'N/A')).size;

        // Encontrar o lançamento mais recente
        const latestRelease = tracks.reduce((latest: any, track: any) => {
            const trackDate = new Date(track.releaseDate || track.createdAt);
            return !latest || trackDate > new Date(latest) ? track.releaseDate || track.createdAt : latest;
        }, null as Date | null);

        // Garantir que os números sejam sempre lógicos
        const validatedDownloads = Math.min(totalDownloads, totalTracks);
        const validatedLikes = Math.min(totalLikes, totalTracks);
        const validatedPlays = Math.min(totalPlays, totalTracks);

        const stats = {
            totalTracks,
            totalDownloads: validatedDownloads,
            totalLikes: validatedLikes,
            totalPlays: validatedPlays,
            uniqueArtists,
            uniquePools,
            latestRelease,
        };

        // Log apenas em desenvolvimento e apenas se houver correções
        if (process.env.NODE_ENV === 'development') {
            if (totalDownloads !== validatedDownloads || totalLikes !== validatedLikes || totalPlays !== validatedPlays) {
                console.log(`🔧 ${decodedGenreName}: Corrigido stats (${validatedDownloads}/${validatedLikes}/${validatedPlays})`);
            }
        }

        const response = NextResponse.json(stats);

        // Adicionar headers de cache para estatísticas
        response.headers.set('Cache-Control', 'public, s-maxage=600, stale-while-revalidate=1200');
        response.headers.set('CDN-Cache-Control', 'public, s-maxage=600');

        return response;

    } catch (error) {
        console.error('[GET_GENRE_STATS_ERROR]', error);
        return NextResponse.json(
            {
                error: 'Erro interno do servidor',
                totalTracks: 0,
                totalDownloads: 0,
                totalLikes: 0,
                totalPlays: 0,
                uniqueArtists: 0,
                uniquePools: 0,
                latestRelease: null,
            },
            { status: 500 }
        );
    }
}
