import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request: NextRequest) {
    try {
        console.log('🔍 API Top 100 chamada');

        // Buscar todas as tracks com contadores de interações
        const tracks = await prisma.track.findMany({
            select: {
                id: true,
                songName: true,
                artist: true,
                style: true,
                pool: true,
                imageUrl: true,
                downloadUrl: true,
                releaseDate: true,
                createdAt: true,
                previewUrl: true,
                isCommunity: true,
                uploadedBy: true,
                _count: {
                    select: {
                        likes: true,
                        downloads: true,
                        plays: true
                    }
                }
            },
            orderBy: [
                { likes: { _count: 'desc' } },
                { downloads: { _count: 'desc' } },
                { plays: { _count: 'desc' } },
                { createdAt: 'desc' }
            ],
            take: 100
        });

        // Transformar dados para incluir posição e estatísticas
        const top100Tracks = tracks.map((track, index) => ({
            ...track,
            position: index + 1,
            likes: track._count.likes,
            downloads: track._count.downloads,
            plays: track._count.plays,
            views: track._count.plays * 2, // Simular views baseado em plays
            trend: getTrend(index),
            change: getChange(index),
            changeAmount: getChangeAmount(index),
            isExclusive: track.pool === 'Nexor Records',
            isNew: isNewTrack(track.createdAt),
            isFeatured: index < 10
        }));

        console.log(`✅ Top 100 carregado com ${top100Tracks.length} tracks`);

        return NextResponse.json({
            tracks: top100Tracks,
            lastUpdate: new Date().toISOString(),
            total: top100Tracks.length
        });

    } catch (error) {
        console.error('Erro ao carregar Top 100:', error);
        return NextResponse.json({
            error: 'Erro interno do servidor'
        }, { status: 500 });
    }
}

// Funções auxiliares para simular dados de ranking
function getTrend(position: number): 'hot' | 'rising' | 'stable' | 'falling' {
    if (position <= 10) return 'hot';
    if (position <= 30) return 'rising';
    if (position <= 70) return 'stable';
    return 'falling';
}

function getChange(position: number): 'up' | 'down' | 'new' | 'stable' {
    const random = Math.random();
    if (position <= 5) return 'stable';
    if (random < 0.3) return 'up';
    if (random < 0.6) return 'down';
    return 'stable';
}

function getChangeAmount(position: number): number {
    if (position <= 10) return Math.floor(Math.random() * 5) + 1;
    return Math.floor(Math.random() * 3);
}

function isNewTrack(createdAt: Date): boolean {
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    return createdAt > oneWeekAgo;
} 