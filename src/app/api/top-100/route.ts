import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const genre = searchParams.get('genre');
        const search = searchParams.get('search');
        const sortBy = searchParams.get('sortBy') || 'score';
        const order = searchParams.get('order') || 'desc';

        console.log('📊 Top-100 API called with params:', { genre, search, sortBy, order });

        // Base query para músicas
        let whereClause: any = {};

        // Filtro por gênero
        if (genre && genre !== 'all') {
            whereClause.style = genre;
        }

        // Filtro por busca
        if (search) {
            whereClause.OR = [
                { songName: { contains: search, mode: 'insensitive' } },
                { artist: { contains: search, mode: 'insensitive' } }
            ];
        }

        // Buscar músicas com agregações
        const tracks = await prisma.track.findMany({
            where: whereClause,
            include: {
                _count: {
                    select: {
                        downloads: true,
                        likes: true,
                        plays: true
                    }
                }
            },
            orderBy: sortBy === 'score' ? undefined : [
                { [sortBy]: order as 'asc' | 'desc' }
            ]
        });

        console.log(`📊 Found ${tracks.length} tracks before scoring`);

        // Calcular score inteligente para cada música
        const tracksWithScore = tracks.map((track: any) => {
            const downloadCount = track._count.downloads || 0;
            const likeCount = track._count.likes || 0;
            const playCount = track._count.plays || 0;

            // Algoritmo de pontuação inteligente
            // Downloads: 50% do peso
            // Likes: 30% do peso  
            // Plays: 20% do peso
            const downloadScore = downloadCount * 50;
            const likeScore = likeCount * 30;
            const playScore = playCount * 20;

            // Score total
            let totalScore = downloadScore + likeScore + playScore;

            // Boost para músicas recentes (últimos 30 dias)
            const now = new Date();
            const trackDate = new Date(track.createdAt);
            const daysDiff = (now.getTime() - trackDate.getTime()) / (1000 * 3600 * 24);

            if (daysDiff <= 30) {
                totalScore *= 1.2; // 20% boost para músicas novas
            }

            // Boost para músicas com alta taxa de conversão (likes/downloads)
            if (downloadCount > 0) {
                const conversionRate = likeCount / downloadCount;
                if (conversionRate > 0.5) {
                    totalScore *= 1.1; // 10% boost para alta conversão
                }
            }

            return {
                ...track,
                stats: {
                    downloads: downloadCount,
                    likes: likeCount,
                    plays: playCount,
                    score: Math.round(totalScore)
                }
            };
        });

        // Ordenar por score se necessário
        let sortedTracks = tracksWithScore;
        if (sortBy === 'score') {
            sortedTracks = tracksWithScore.sort((a: any, b: any) => {
                return order === 'desc'
                    ? b.stats.score - a.stats.score
                    : a.stats.score - b.stats.score;
            });
        }

        // Adicionar posições
        const topTracks = sortedTracks.slice(0, 100).map((track: any, index: number) => ({
            ...track,
            position: index + 1
        }));

        console.log(`📊 Top track scores: ${topTracks.slice(0, 5).map((m: any) => `${m.songName}: ${m.stats.score}`).join(', ')}`);

        // Estatísticas gerais
        const totalTracks = tracks.length;
        const totalDownloads = tracks.reduce((sum: number, track: any) => sum + (track._count.downloads || 0), 0);
        const totalLikes = tracks.reduce((sum: number, track: any) => sum + (track._count.likes || 0), 0);
        const totalPlays = tracks.reduce((sum: number, track: any) => sum + (track._count.plays || 0), 0);

        const statistics = {
            totalTracks,
            totalDownloads,
            totalLikes,
            totalPlays,
            averageScore: totalTracks > 0
                ? Math.round(topTracks.reduce((sum: number, track: any) => sum + track.stats.score, 0) / topTracks.length)
                : 0
        };

        console.log('📊 Statistics:', statistics);

        return NextResponse.json({
            musics: topTracks, // Mantendo 'musics' para compatibilidade com o frontend
            statistics,
            metadata: {
                genre: genre || 'all',
                search: search || '',
                sortBy,
                order,
                total: topTracks.length,
                algorithm: 'weighted_intelligent_ranking'
            }
        });

    } catch (error) {
        console.error('❌ Erro na API top-100:', error);
        return NextResponse.json(
            {
                error: 'Erro interno do servidor',
                musics: [],
                statistics: {
                    totalTracks: 0,
                    totalDownloads: 0,
                    totalLikes: 0,
                    totalPlays: 0,
                    averageScore: 0
                }
            },
            { status: 500 }
        );
    }
}
