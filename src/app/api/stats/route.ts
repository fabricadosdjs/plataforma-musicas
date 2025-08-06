import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request: NextRequest) {
    try {
        // Data de hoje às 00:00
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // Buscar estatísticas em paralelo
        const [
            downloadsToday,
            totalLikes,
            vipUsersCount,
            totalTracks
        ] = await Promise.all([
            // Downloads de hoje
            prisma.download.count({
                where: {
                    downloadedAt: {
                        gte: today
                    }
                }
            }),
            // Total de likes
            prisma.like.count(),
            // Usuários VIP
            prisma.user.count({
                where: {
                    is_vip: true
                }
            }),
            // Total de músicas
            prisma.track.count()
        ]);

        return NextResponse.json({
            downloadsToday,
            totalLikes,
            vipUsersCount,
            totalTracks
        });

    } catch (error) {
        console.error('Erro ao buscar estatísticas:', error);
        return NextResponse.json(
            { error: 'Erro interno do servidor' },
            { status: 500 }
        );
    }
} 