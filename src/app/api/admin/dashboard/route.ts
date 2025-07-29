
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import { NextRequest, NextResponse } from 'next/server';
import os from 'os';

export async function GET(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) {
            return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
        }

        // Estatísticas de usuários
        const totalUsers = await prisma.user.count();
        const vipUsers = await prisma.user.count({ where: { is_vip: true } });
        const freeUsers = totalUsers - vipUsers;
        const activeUsers = await prisma.user.count({ where: { status: 'ativo' } });
        const newUsersToday = await prisma.user.count({ where: { createdAt: { gte: new Date(new Date().setHours(0, 0, 0, 0)) } } });
        const newUsersWeek = await prisma.user.count({ where: { createdAt: { gte: new Date(new Date().setDate(new Date().getDate() - 7)) } } });
        const expiringUsersWeek = await prisma.user.count({ where: { vencimento: { gte: new Date(), lte: new Date(new Date().setDate(new Date().getDate() + 7)) } } });

        // Estatísticas de downloads
        const totalDownloads = await prisma.download.count();
        const downloadsToday = await prisma.download.count({ where: { downloadedAt: { gte: new Date(new Date().setHours(0, 0, 0, 0)) } } });
        const downloadsWeek = await prisma.download.count({ where: { downloadedAt: { gte: new Date(new Date().setDate(new Date().getDate() - 7)) } } });
        const downloadsMonth = await prisma.download.count({ where: { downloadedAt: { gte: new Date(new Date().setDate(new Date().getDate() - 30)) } } });

        // Top downloaders
        const topDownloaderToday = await prisma.user.findFirst({
            orderBy: { downloads: { _count: 'desc' } },
            where: { downloads: { some: { downloadedAt: { gte: new Date(new Date().setHours(0, 0, 0, 0)) } } } },
            include: { downloads: true }
        });
        const topDownloaderWeek = await prisma.user.findFirst({
            orderBy: { downloads: { _count: 'desc' } },
            where: { downloads: { some: { downloadedAt: { gte: new Date(new Date().setDate(new Date().getDate() - 7)) } } } },
            include: { downloads: true }
        });
        const topDownloaderMonth = await prisma.user.findFirst({
            orderBy: { downloads: { _count: 'desc' } },
            where: { downloads: { some: { downloadedAt: { gte: new Date(new Date().setDate(new Date().getDate() - 30)) } } } },
            include: { downloads: true }
        });

        // Estatísticas de músicas
        const totalTracks = await prisma.track.count();
        const tracksAddedToday = await prisma.track.count({ where: { createdAt: { gte: new Date(new Date().setHours(0, 0, 0, 0)) } } });
        const tracksAddedWeek = await prisma.track.count({ where: { createdAt: { gte: new Date(new Date().setDate(new Date().getDate() - 7)) } } });
        const mostDownloadedTrack = await prisma.track.findFirst({ orderBy: { downloads: { _count: 'desc' } }, include: { downloads: true } });
        const mostLikedTrack = await prisma.track.findFirst({ orderBy: { likes: { _count: 'desc' } }, include: { likes: true } });
        const recentTracks = await prisma.track.findMany({ orderBy: { createdAt: 'desc' }, take: 10, include: { downloads: true, likes: true } });

        // Estatísticas de likes
        const totalLikes = await prisma.like.count();
        const likesToday = await prisma.like.count({ where: { createdAt: { gte: new Date(new Date().setHours(0, 0, 0, 0)) } } });
        const likesWeek = await prisma.like.count({ where: { createdAt: { gte: new Date(new Date().setDate(new Date().getDate() - 7)) } } });

        // Receita (exemplo simples)
        const totalRevenue = await prisma.user.aggregate({ _sum: { valor: true } });
        const averageUserValue = await prisma.user.aggregate({ _avg: { valor: true } });
        const vipPlansDistribution = await prisma.user.groupBy({ by: ['valor'], _count: { valor: true } });

        // Informações do servidor (mock, pode ser ajustado para dados reais)
        const serverInfo = {
            platform: process.platform,
            hostname: process.env.HOSTNAME || 'localhost',
            uptime: process.uptime(),
            memory: {
                total: os.totalmem(),
                free: os.freemem(),
                used: os.totalmem() - os.freemem()
            },
            cpus: os.cpus().length
        };

        return NextResponse.json({
            serverInfo,
            userStats: {
                total: totalUsers,
                vipUsers,
                freeUsers,
                activeUsers,
                newUsersToday,
                newUsersWeek,
                expiringUsersWeek
            },
            downloadStats: {
                totalDownloads,
                downloadsToday,
                downloadsWeek,
                downloadsMonth,
                topDownloaderToday,
                topDownloaderWeek,
                topDownloaderMonth
            },
            trackStats: {
                totalTracks,
                tracksAddedToday,
                tracksAddedWeek,
                mostDownloadedTrack,
                mostLikedTrack,
                recentTracks
            },
            likeStats: {
                totalLikes,
                likesToday,
                likesWeek
            },
            revenueStats: {
                totalRevenue: totalRevenue._sum.valor || 0,
                averageUserValue: averageUserValue._avg.valor || 0,
                vipPlansDistribution
            }
        });
    } catch (error) {
        console.error('[DASHBOARD_GET_ERROR]', error);
        return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
    }
}

