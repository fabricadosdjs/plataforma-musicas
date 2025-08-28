import prisma from '@/lib/prisma';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(
    request: Request,
    { params }: { params: Promise<{ genreName: string }> }
) {
    try {
        const { genreName } = await params;
        const decodedGenreName = decodeURIComponent(genreName);

        console.log('📊 API Genre Stats chamada para:', decodedGenreName);

        // Verificar conexão com o banco
        try {
            await prisma.$connect();
            console.log('✅ Conexão com banco estabelecida');
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
        const totalDownloads = tracks.reduce((sum, track) => {
            // Usar Set para contar usuários únicos que baixaram cada música
            const uniqueUsers = new Set(track.downloads.map(download => download.userId).filter(Boolean));
            return sum + uniqueUsers.size;
        }, 0);

        // Contar likes únicos por música (cada música só pode ter 1 like por usuário)
        const totalLikes = tracks.reduce((sum, track) => {
            // Usar Set para contar usuários únicos que deram like em cada música
            const uniqueUsers = new Set(track.likes.map(like => like.userId).filter(Boolean));
            return sum + uniqueUsers.size;
        }, 0);

        // Contar plays únicos por música (cada música só pode ter 1 play por usuário)
        const totalPlays = tracks.reduce((sum, track) => {
            // Usar Set para contar usuários únicos que tocaram cada música
            const uniqueUsers = new Set(track.plays.map(play => play.userId).filter(Boolean));
            return sum + uniqueUsers.size;
        }, 0);

        const uniqueArtists = new Set(tracks.map(track => track.artist)).size;
        const uniquePools = new Set(tracks.map(track => track.pool).filter(pool => pool && pool !== 'N/A')).size;

        // Encontrar o lançamento mais recente
        const latestRelease = tracks.reduce((latest, track) => {
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

        // Logs detalhados para debugging
        console.log(`📊 Gênero ${decodedGenreName} - Estatísticas detalhadas:`);
        console.log(`   - Total de músicas: ${totalTracks}`);
        console.log(`   - Downloads únicos: ${totalDownloads} → Validado: ${validatedDownloads} (usuários únicos que baixaram)`);
        console.log(`   - Likes únicos: ${totalLikes} → Validado: ${validatedLikes} (usuários únicos que deram like)`);
        console.log(`   - Plays únicos: ${totalPlays} → Validado: ${validatedPlays} (usuários únicos que tocaram)`);
        console.log(`   - Artistas únicos: ${uniqueArtists}`);
        console.log(`   - Pools únicos: ${uniquePools}`);

        // Verificar se houve correções
        if (totalDownloads !== validatedDownloads) {
            console.log(`🔧 CORRIGIDO: Downloads de ${totalDownloads} para ${validatedDownloads} (limitado ao total de músicas)`);
        }
        if (totalLikes !== validatedLikes) {
            console.log(`🔧 CORRIGIDO: Likes de ${totalLikes} para ${validatedLikes} (limitado ao total de músicas)`);
        }
        if (totalPlays !== validatedPlays) {
            console.log(`🔧 CORRIGIDO: Plays de ${totalPlays} para ${validatedPlays} (limitado ao total de músicas)`);
        }

        return NextResponse.json(stats);

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
