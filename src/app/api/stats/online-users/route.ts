import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request: NextRequest) {
    try {
        // Buscar usuários que fizeram alguma atividade nas últimas 5 minutos
        const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);

        const onlineUsers = await prisma.user.count({
            where: {
                OR: [
                    { likes: { some: { createdAt: { gte: fiveMinutesAgo } } } },
                    { downloads: { some: { downloadedAt: { gte: fiveMinutesAgo } } } },
                    { plays: { some: { createdAt: { gte: fiveMinutesAgo } } } }
                ]
            }
        });

        // Buscar estatísticas reais de atividade
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const todayStats = await prisma.$transaction([
            prisma.like.count({ where: { createdAt: { gte: today } } }),
            prisma.download.count({ where: { downloadedAt: { gte: today } } }),
            prisma.play.count({ where: { createdAt: { gte: today } } })
        ]);

        const [todayLikes, todayDownloads, todayPlays] = todayStats;

        // Calcular taxa de crescimento (comparar com ontem)
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);

        const yesterdayStats = await prisma.$transaction([
            prisma.like.count({ where: { createdAt: { gte: yesterday, lt: today } } }),
            prisma.download.count({ where: { downloadedAt: { gte: yesterday, lt: today } } }),
            prisma.play.count({ where: { createdAt: { gte: yesterday, lt: today } } })
        ]);

        const [yesterdayLikes, yesterdayDownloads, yesterdayPlays] = yesterdayStats;

        // Calcular percentual de crescimento
        const likesGrowth = yesterdayLikes > 0 ? Math.round(((todayLikes - yesterdayLikes) / yesterdayLikes) * 100) : 0;
        const downloadsGrowth = yesterdayDownloads > 0 ? Math.round(((todayDownloads - yesterdayDownloads) / yesterdayDownloads) * 100) : 0;
        const playsGrowth = yesterdayPlays > 0 ? Math.round(((todayPlays - yesterdayPlays) / yesterdayPlays) * 100) : 0;

        return NextResponse.json({
            onlineUsers: Math.max(onlineUsers, 1), // Mínimo 1 usuário (você)
            todayLikes,
            todayDownloads,
            todayPlays,
            likesGrowth,
            downloadsGrowth,
            playsGrowth,
            lastUpdate: new Date().toISOString()
        });

    } catch (error) {
        console.error('Erro ao buscar estatísticas:', error);
        return NextResponse.json(
            {
                onlineUsers: 1,
                todayLikes: 0,
                todayDownloads: 0,
                todayPlays: 0,
                likesGrowth: 0,
                downloadsGrowth: 0,
                playsGrowth: 0,
                lastUpdate: new Date().toISOString()
            },
            { status: 500 }
        );
    }
} 