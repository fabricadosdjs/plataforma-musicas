import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
    try {
        // Buscar estatísticas da semana atual
        const now = new Date();
        const startOfWeek = new Date(now);
        startOfWeek.setDate(now.getDate() - now.getDay()); // Domingo
        startOfWeek.setHours(0, 0, 0, 0);

        // Total de downloads da semana
        const totalDownloads = await prisma.download.count({
            where: {
                createdAt: {
                    gte: startOfWeek
                }
            }
        });

        // Total de likes da semana
        const totalLikes = await prisma.like.count({
            where: {
                createdAt: {
                    gte: startOfWeek
                }
            }
        });

        // Usuários ativos hoje
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const activeUsersToday = await prisma.user.count({
            where: {
                OR: [
                    { likes: { some: { createdAt: { gte: today } } } },
                    { downloads: { some: { createdAt: { gte: today } } } },
                    { createdAt: { gte: today } }
                ]
            }
        });

        // Score trending baseado em downloads e likes
        const trendingScore = Math.round((totalDownloads * 0.7) + (totalLikes * 0.3));

        return NextResponse.json({
            totalDownloads,
            totalLikes,
            activeUsers: Math.max(activeUsersToday, 16), // Mínimo de 16 usuários
            trendingScore
        });

    } catch (error) {
        console.error('Erro ao buscar estatísticas do trending:', error);
        return NextResponse.json({
            totalDownloads: 0,
            totalLikes: 0,
            activeUsers: 16,
            trendingScore: 0
        }, { status: 500 });
    }
}
