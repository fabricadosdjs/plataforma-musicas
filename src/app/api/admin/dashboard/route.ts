// src/app/api/admin/dashboard/route.ts
import { authOptions } from '@/lib/authOptions';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth/next';
import { NextResponse } from 'next/server';
import os from 'os';

export const dynamic = 'force-dynamic';

interface DashboardStats {
    serverInfo: {
        platform: string;
        hostname: string;
        uptime: number;
        memory: {
            total: number;
            free: number;
            used: number;
        };
        cpus: number;
    };
    userStats: {
        total: number;
        vipUsers: number;
        freeUsers: number;
        activeUsers: number;
        newUsersToday: number;
        newUsersWeek: number;
        expiringUsersWeek: number;
    };
    downloadStats: {
        totalDownloads: number;
        downloadsToday: number;
        downloadsWeek: number;
        downloadsMonth: number;
        topDownloaderToday: any;
        topDownloaderWeek: any;
        topDownloaderMonth: any;
    };
    trackStats: {
        totalTracks: number;
        tracksAddedToday: number;
        tracksAddedWeek: number;
        mostDownloadedTrack: any;
        mostLikedTrack: any;
        recentTracks: any[];
    };
    likeStats: {
        totalLikes: number;
        likesToday: number;
        likesWeek: number;
        topLikedUser: any;
    };
    revenueStats: {
        totalRevenue: number;
        averageUserValue: number;
        vipPlansDistribution: any[];
    };
}

export async function GET() {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // TODO: Adicionar verificação de admin quando implementado

        // Datas para filtros
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        const weekFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

        // Informações do servidor
        const serverInfo = {
            platform: os.platform(),
            hostname: os.hostname(),
            uptime: os.uptime(),
            memory: {
                total: os.totalmem(),
                free: os.freemem(),
                used: os.totalmem() - os.freemem(),
            },
            cpus: os.cpus().length,
        };

        // Estatísticas de usuários
        const [totalUsers, vipUsers, activeUsers, newUsersToday, newUsersWeek, expiringUsersWeek] = await Promise.all([
            prisma.user.count(),
            prisma.user.count({ where: { is_vip: true } }),
            prisma.user.count({ where: { status: 'ativo' } }),
            prisma.user.count({ where: { createdAt: { gte: today } } }),
            prisma.user.count({ where: { createdAt: { gte: weekAgo } } }),
            prisma.user.count({
                where: {
                    is_vip: true,
                    vencimento: {
                        gte: now,
                        lte: weekFromNow,
                    },
                },
            }),
        ]);

        const userStats = {
            total: totalUsers,
            vipUsers,
            freeUsers: totalUsers - vipUsers,
            activeUsers,
            newUsersToday,
            newUsersWeek,
            expiringUsersWeek,
        };

        // Estatísticas de downloads
        const [totalDownloads, downloadsToday, downloadsWeek, downloadsMonth] = await Promise.all([
            prisma.download.count(),
            prisma.download.count({ where: { createdAt: { gte: today } } }),
            prisma.download.count({ where: { createdAt: { gte: weekAgo } } }),
            prisma.download.count({ where: { createdAt: { gte: monthAgo } } }),
        ]);

        // Top downloaders
        const topDownloaderToday = await prisma.download.groupBy({
            by: ['userId'],
            where: { createdAt: { gte: today } },
            _count: { userId: true },
            orderBy: { _count: { userId: 'desc' } },
            take: 1,
        }).then(async (result) => {
            if (result[0]) {
                const user = await prisma.user.findUnique({
                    where: { id: result[0].userId },
                    select: { name: true, email: true, is_vip: true },
                });
                return { ...user, downloadCount: result[0]._count.userId };
            }
            return null;
        });

        const topDownloaderWeek = await prisma.download.groupBy({
            by: ['userId'],
            where: { createdAt: { gte: weekAgo } },
            _count: { userId: true },
            orderBy: { _count: { userId: 'desc' } },
            take: 1,
        }).then(async (result) => {
            if (result[0]) {
                const user = await prisma.user.findUnique({
                    where: { id: result[0].userId },
                    select: { name: true, email: true, is_vip: true },
                });
                return { ...user, downloadCount: result[0]._count.userId };
            }
            return null;
        });

        const topDownloaderMonth = await prisma.download.groupBy({
            by: ['userId'],
            where: { createdAt: { gte: monthAgo } },
            _count: { userId: true },
            orderBy: { _count: { userId: 'desc' } },
            take: 1,
        }).then(async (result) => {
            if (result[0]) {
                const user = await prisma.user.findUnique({
                    where: { id: result[0].userId },
                    select: { name: true, email: true, is_vip: true },
                });
                return { ...user, downloadCount: result[0]._count.userId };
            }
            return null;
        });

        const downloadStats = {
            totalDownloads,
            downloadsToday,
            downloadsWeek,
            downloadsMonth,
            topDownloaderToday,
            topDownloaderWeek,
            topDownloaderMonth,
        };

        // Estatísticas de tracks
        const [totalTracks, tracksAddedToday, tracksAddedWeek] = await Promise.all([
            prisma.track.count(),
            prisma.track.count({ where: { createdAt: { gte: today } } }),
            prisma.track.count({ where: { createdAt: { gte: weekAgo } } }),
        ]);

        const mostDownloadedTrack = await prisma.download.groupBy({
            by: ['trackId'],
            _count: { trackId: true },
            orderBy: { _count: { trackId: 'desc' } },
            take: 1,
        }).then(async (result) => {
            if (result[0]) {
                const track = await prisma.track.findUnique({
                    where: { id: result[0].trackId },
                    select: { songName: true, artist: true },
                });
                return { ...track, downloadCount: result[0]._count.trackId };
            }
            return null;
        });

        const mostLikedTrack = await prisma.like.groupBy({
            by: ['trackId'],
            _count: { trackId: true },
            orderBy: { _count: { trackId: 'desc' } },
            take: 1,
        }).then(async (result) => {
            if (result[0]) {
                const track = await prisma.track.findUnique({
                    where: { id: result[0].trackId },
                    select: { songName: true, artist: true },
                });
                return { ...track, likeCount: result[0]._count.trackId };
            }
            return null;
        });

        const recentTracks = await prisma.track.findMany({
            orderBy: { createdAt: 'desc' },
            take: 5,
            select: {
                id: true,
                songName: true,
                artist: true,
                createdAt: true,
                _count: {
                    select: {
                        downloads: true,
                        likes: true,
                    },
                },
            },
        });

        const trackStats = {
            totalTracks,
            tracksAddedToday,
            tracksAddedWeek,
            mostDownloadedTrack,
            mostLikedTrack,
            recentTracks,
        };

        // Estatísticas de likes
        const [totalLikes, likesToday, likesWeek] = await Promise.all([
            prisma.like.count(),
            prisma.like.count({ where: { createdAt: { gte: today } } }),
            prisma.like.count({ where: { createdAt: { gte: weekAgo } } }),
        ]);

        const topLikedUser = await prisma.like.groupBy({
            by: ['userId'],
            _count: { userId: true },
            orderBy: { _count: { userId: 'desc' } },
            take: 1,
        }).then(async (result) => {
            if (result[0]) {
                const user = await prisma.user.findUnique({
                    where: { id: result[0].userId },
                    select: { name: true, email: true, is_vip: true },
                });
                return { ...user, likeCount: result[0]._count.userId };
            }
            return null;
        });

        const likeStats = {
            totalLikes,
            likesToday,
            likesWeek,
            topLikedUser,
        };

        // Estatísticas de receita
        const vipUsers_full = await prisma.user.findMany({
            where: { is_vip: true, valor: { not: null } },
            select: { valor: true },
        });

        const totalRevenue = vipUsers_full.reduce((sum, user) => {
            const value = user.valor ? parseFloat(user.valor.toString()) : 0;
            return sum + value;
        }, 0);
        const averageUserValue = vipUsers_full.length > 0 ? totalRevenue / vipUsers_full.length : 0;

        const vipPlansDistribution = await prisma.user.groupBy({
            by: ['valor'],
            where: { is_vip: true, valor: { not: null } },
            _count: { valor: true },
            orderBy: { valor: 'asc' },
        });

        const revenueStats = {
            totalRevenue,
            averageUserValue,
            vipPlansDistribution,
        };

        const dashboardStats: DashboardStats = {
            serverInfo,
            userStats,
            downloadStats,
            trackStats,
            likeStats,
            revenueStats,
        };

        return NextResponse.json(dashboardStats);

    } catch (error) {
        console.error('[DASHBOARD_ERROR]', error);
        return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 });
    }
}
