// src/app/api/tracks/stats/route.ts
import prisma from '@/lib/prisma';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        console.log('📊 API Stats chamada - carregando estatísticas da plataforma');

        // Verificar conexão com o banco
        try {
            await prisma.$connect();
            console.log('✅ Conexão com banco estabelecida');
        } catch (dbError) {
            console.error('❌ Erro na conexão com banco:', dbError);
            throw dbError;
        }

        // Contar total de músicas
        const totalTracks = await prisma.track.count();
        console.log(`📊 Total de tracks: ${totalTracks}`);

        if (totalTracks === 0) {
            console.log('⚠️ Nenhuma música encontrada no banco de dados');
            return NextResponse.json({
                totalTracks: 0,
                newTracks: 0,
                topGenres: {},
                topArtists: {},
                lastUpdated: new Date().toISOString()
            });
        }

        // Contar músicas dos últimos 30 dias
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const newTracks = await prisma.track.count({
            where: {
                OR: [
                    { releaseDate: { gte: thirtyDaysAgo } },
                    { createdAt: { gte: thirtyDaysAgo } }
                ]
            }
        });
        console.log(`📊 Músicas dos últimos 30 dias: ${newTracks}`);

        // Top gêneros
        const topGenres = await prisma.track.groupBy({
            by: ['style'],
            _count: {
                style: true
            },
            orderBy: {
                _count: {
                    style: 'desc'
                }
            },
            take: 10
        });

        const topGenresMap = topGenres.reduce((acc, item) => {
            if (item.style && item.style !== 'N/A') {
                acc[item.style] = item._count.style;
            }
            return acc;
        }, {} as Record<string, number>);

        // Top artistas
        const topArtists = await prisma.track.groupBy({
            by: ['artist'],
            _count: {
                artist: true
            },
            orderBy: {
                _count: {
                    artist: 'desc'
                }
            },
            take: 10
        });

        const topArtistsMap = topArtists.reduce((acc, item) => {
            if (item.artist && item.artist !== 'N/A') {
                acc[item.artist] = item._count.artist;
            }
            return acc;
        }, {} as Record<string, number>);

        const stats = {
            totalTracks,
            newTracks,
            topGenres: topGenresMap,
            topArtists: topArtistsMap,
            lastUpdated: new Date().toISOString()
        };

        console.log('✅ Estatísticas calculadas com sucesso');

        return NextResponse.json(stats);

    } catch (error) {
        console.error("[GET_STATS_ERROR]", error);

        return NextResponse.json({
            error: "Erro interno do servidor ao buscar estatísticas",
            totalTracks: 0,
            newTracks: 0,
            topGenres: {},
            topArtists: {}
        }, { status: 500 });
    }
}
