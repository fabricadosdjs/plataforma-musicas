import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
    try {
        // Buscar apenas tracks que têm interações reais
        const tracks = await prisma.track.findMany({
            include: {
                _count: {
                    select: {
                        likes: true,
                        downloads: true,
                        plays: true
                    }
                }
            },
            where: {
                OR: [
                    { likes: { some: {} } },
                    { downloads: { some: {} } },
                    { plays: { some: {} } }
                ]
            },
            orderBy: [
                {
                    downloads: {
                        _count: 'desc'
                    }
                },
                {
                    likes: {
                        _count: 'desc'
                    }
                },
                {
                    plays: {
                        _count: 'desc'
                    }
                }
            ],
            take: 100
        });

        // Se não há tracks com interações, retornar array vazio
        if (tracks.length === 0) {
            return NextResponse.json({
                tracks: [],
                lastUpdate: new Date().toISOString(),
                message: 'Nenhuma música com interações encontrada'
            });
        }

        // Calcular posições baseadas apenas em dados reais
        const tracksWithStats = tracks.map((track, index) => {
            const position = index + 1;

            // Calcular tendência baseada na atividade real
            const totalActivity = track._count.likes + track._count.downloads + track._count.plays;
            const isNew = track.releaseDate > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

            // Determinar tendência baseada na atividade
            let trend = 'stable';
            if (totalActivity > 50) trend = 'hot';
            else if (totalActivity > 20) trend = 'rising';
            else if (totalActivity < 5) trend = 'falling';

            // Determinar mudança baseada na posição (simulado para demonstração)
            // Em produção, você teria uma tabela de histórico de posições
            const change = Math.random() > 0.5 ? 'stable' : (Math.random() > 0.5 ? 'up' : 'down');
            const changeAmount = change !== 'stable' ? Math.floor(Math.random() * 5) + 1 : 0;

            return {
                id: track.id,
                position,
                change,
                changeAmount,
                trend,
                songName: track.songName,
                artist: track.artist,
                style: track.style,
                genre: track.style,
                imageUrl: track.imageUrl,
                previewUrl: track.previewUrl,
                downloadUrl: track.downloadUrl,
                releaseDate: track.releaseDate.toISOString().split('T')[0],
                createdAt: track.createdAt.toISOString(),
                updatedAt: track.updatedAt.toISOString(),
                views: track._count.plays,
                plays: track._count.plays,
                likes: track._count.likes,
                downloads: track._count.downloads,
                pool: track.pool || 'Nexor Records',
                isCommunity: track.isCommunity,
                isExclusive: false, // Removido simulação
                isNew: isNew,
                isFeatured: position <= 10
            };
        });

        return NextResponse.json({
            tracks: tracksWithStats,
            lastUpdate: new Date().toISOString()
        });

    } catch (error) {
        console.error('Erro ao buscar Top 100:', error);
        return NextResponse.json(
            { error: 'Erro interno do servidor' },
            { status: 500 }
        );
    }
} 