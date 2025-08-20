// src/app/api/tracks/stats/route.ts
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        console.log('📊 API Stats: Carregando estatísticas...');

        // Buscar estatísticas em paralelo para otimizar
        const [totalTracks, totalStyles, totalPools, totalArtists] = await Promise.all([
            prisma.track.count(),
            prisma.track.groupBy({
                by: ['style'],
                where: { style: { not: null } }
            }),
            prisma.track.groupBy({
                by: ['pool'],
                where: { pool: { not: null } }
            }),
            prisma.track.groupBy({
                by: ['artist'],
                where: { artist: { not: null } }
            })
        ]);

        // Calcular totais únicos
        const uniqueStyles = totalStyles.length;
        const uniquePools = totalPools.length;
        const uniqueArtists = totalArtists.length;

        console.log(`✅ Estatísticas carregadas: ${totalTracks} tracks, ${uniqueStyles} estilos, ${uniquePools} pools, ${uniqueArtists} artistas`);

        return NextResponse.json({
            success: true,
            stats: {
                totalTracks,
                totalStyles: uniqueStyles,
                totalPools: uniquePools,
                totalArtists: uniqueArtists,
                lastUpdated: new Date().toISOString()
            }
        });

    } catch (error) {
        console.error('❌ Erro ao carregar estatísticas:', error);
        return NextResponse.json(
            {
                success: false,
                error: 'Erro interno do servidor',
                stats: {
                    totalTracks: 0,
                    totalStyles: 0,
                    totalPools: 0,
                    totalArtists: 0,
                    lastUpdated: null
                }
            },
            { status: 500 }
        );
    }
}
