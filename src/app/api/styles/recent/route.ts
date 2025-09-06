import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
    try {
        // Buscar os 9 estilos mais recentes baseado nas músicas adicionadas
        const recentStyles = await prisma.track.groupBy({
            by: ['style'],
            _count: {
                style: true
            },
            orderBy: {
                _max: {
                    createdAt: 'desc'
                }
            },
            take: 9
        });

        // Buscar informações adicionais para cada estilo
        const stylesWithInfo = await Promise.all(
            recentStyles.map(async (styleGroup: any) => {
                // Buscar a música mais recente deste estilo
                const latestTrack = await prisma.track.findFirst({
                    where: {
                        style: styleGroup.style
                    },
                    orderBy: {
                        createdAt: 'desc'
                    },
                    select: {
                        imageUrl: true,
                        songName: true,
                        artist: true
                    }
                });

                return {
                    name: styleGroup.style,
                    count: styleGroup._count.style,
                    latestTrack: latestTrack,
                    imageUrl: latestTrack?.imageUrl || null
                };
            })
        );

        return NextResponse.json({
            success: true,
            styles: stylesWithInfo
        });

    } catch (error) {
        console.error('Error fetching recent styles:', error);
        return NextResponse.json(
            {
                success: false,
                error: 'Internal server error',
                details: error instanceof Error ? error.message : 'Erro desconhecido'
            },
            { status: 500 }
        );
    }
}
