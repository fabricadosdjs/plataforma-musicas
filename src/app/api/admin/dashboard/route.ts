
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import { NextRequest, NextResponse } from 'next/server';
import os from 'os';

export async function GET(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        const isAdmin = session?.user?.email === 'edersonleonardo@nexorrecords.com.br';
        if (!isAdmin) {
            return NextResponse.json({ error: 'Acesso negado' }, { status: 403 });
        }

        // Data de hoje às 00:00
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // Data de 7 dias atrás
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);

        // Data de 30 dias atrás
        const monthAgo = new Date();
        monthAgo.setDate(monthAgo.getDate() - 30);

        // Estatísticas básicas de usuários
        const [totalUsers, vipUsers, activeUsers, newUsersToday, newUsersWeek] = await Promise.all([
            prisma.user.count(),
            prisma.user.count({ where: { is_vip: true } }),
            prisma.user.count({ where: { status: 'ativo' } }),
            prisma.user.count({ where: { createdAt: { gte: today } } }),
            prisma.user.count({ where: { createdAt: { gte: weekAgo } } })
        ]);

        // Usuários vencendo em 7 dias
        const expiringDate = new Date();
        expiringDate.setDate(expiringDate.getDate() + 7);
        const expiringUsersWeek = await prisma.user.count({
            where: {
                vencimento: {
                    gte: new Date(),
                    lte: expiringDate
                }
            }
        });

        // Estatísticas de downloads
        const [totalDownloads, downloadsToday, downloadsWeek, downloadsMonth] = await Promise.all([
            prisma.download.count(),
            prisma.download.count({ where: { downloadedAt: { gte: today } } }),
            prisma.download.count({ where: { downloadedAt: { gte: weekAgo } } }),
            prisma.download.count({ where: { downloadedAt: { gte: monthAgo } } })
        ]);

        // Estatísticas de tracks
        const [totalTracks, tracksAddedToday, tracksAddedWeek] = await Promise.all([
            prisma.track.count(),
            prisma.track.count({ where: { createdAt: { gte: today } } }),
            prisma.track.count({ where: { createdAt: { gte: weekAgo } } })
        ]);

        // Estatísticas de likes
        const [totalLikes, likesToday, likesWeek] = await Promise.all([
            prisma.like.count(),
            prisma.like.count({ where: { createdAt: { gte: today } } }),
            prisma.like.count({ where: { createdAt: { gte: weekAgo } } })
        ]);

        // Top downloaders
        const topDownloaderToday = await prisma.user.findFirst({
            where: {
                downloads: {
                    some: {
                        downloadedAt: { gte: today }
                    }
                }
            },
            select: {
                id: true,
                name: true,
                email: true,
                is_vip: true,
                _count: {
                    select: {
                        downloads: {
                            where: {
                                downloadedAt: { gte: today }
                            }
                        }
                    }
                }
            },
            orderBy: {
                downloads: {
                    _count: 'desc'
                }
            }
        });

        const topDownloaderWeek = await prisma.user.findFirst({
            where: {
                downloads: {
                    some: {
                        downloadedAt: { gte: weekAgo }
                    }
                }
            },
            select: {
                id: true,
                name: true,
                email: true,
                is_vip: true,
                _count: {
                    select: {
                        downloads: {
                            where: {
                                downloadedAt: { gte: weekAgo }
                            }
                        }
                    }
                }
            },
            orderBy: {
                downloads: {
                    _count: 'desc'
                }
            }
        });

        const topDownloaderMonth = await prisma.user.findFirst({
            where: {
                downloads: {
                    some: {
                        downloadedAt: { gte: monthAgo }
                    }
                }
            },
            select: {
                id: true,
                name: true,
                email: true,
                is_vip: true,
                _count: {
                    select: {
                        downloads: {
                            where: {
                                downloadedAt: { gte: monthAgo }
                            }
                        }
                    }
                }
            },
            orderBy: {
                downloads: {
                    _count: 'desc'
                }
            }
        });

        // Top tracks
        const mostDownloadedTrack = await prisma.track.findFirst({
            include: {
                _count: {
                    select: {
                        downloads: true
                    }
                }
            },
            orderBy: {
                downloads: {
                    _count: 'desc'
                }
            }
        });

        const mostLikedTrack = await prisma.track.findFirst({
            include: {
                _count: {
                    select: {
                        likes: true
                    }
                }
            },
            orderBy: {
                likes: {
                    _count: 'desc'
                }
            }
        });

        const recentTracks = await prisma.track.findMany({
            take: 5,
            orderBy: {
                createdAt: 'desc'
            },
            include: {
                _count: {
                    select: {
                        downloads: true,
                        likes: true
                    }
                }
            }
        });

        // Estatísticas de receita
        const [totalRevenue, averageUserValue, vipPlansDistribution] = await Promise.all([
            prisma.user.aggregate({
                _sum: {
                    valor: true
                }
            }),
            prisma.user.aggregate({
                _avg: {
                    valor: true
                },
                where: {
                    valor: { not: null }
                }
            }),
            prisma.user.groupBy({
                by: ['valor'],
                _count: { valor: true },
                where: {
                    valor: { not: null }
                },
                orderBy: {
                    valor: 'asc'
                }
            })
        ]);

        // Informações do servidor
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

        // Processar dados dos top downloaders
        const processTopDownloader = (user: any) => {
            if (!user) return null;
            return {
                name: user.name || 'Usuário',
                email: user.email,
                downloadCount: user._count.downloads,
                is_vip: user.is_vip
            };
        };

        return NextResponse.json({
            serverInfo,
            userStats: {
                total: totalUsers,
                vipUsers,
                freeUsers: totalUsers - vipUsers,
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
                topDownloaderToday: processTopDownloader(topDownloaderToday),
                topDownloaderWeek: processTopDownloader(topDownloaderWeek),
                topDownloaderMonth: processTopDownloader(topDownloaderMonth)
            },
            trackStats: {
                totalTracks,
                tracksAddedToday,
                tracksAddedWeek,
                mostDownloadedTrack: mostDownloadedTrack ? {
                    songName: mostDownloadedTrack.songName,
                    artist: mostDownloadedTrack.artist,
                    downloadCount: mostDownloadedTrack._count.downloads
                } : null,
                mostLikedTrack: mostLikedTrack ? {
                    songName: mostLikedTrack.songName,
                    artist: mostLikedTrack.artist,
                    likeCount: mostLikedTrack._count.likes
                } : null,
                recentTracks: recentTracks.map((track: any) => ({
                    id: track.id,
                    songName: track.songName,
                    artist: track.artist,
                    createdAt: track.createdAt,
                    _count: track._count
                }))
            },
            likeStats: {
                totalLikes,
                likesToday,
                likesWeek
            },
            revenueStats: {
                totalRevenue: totalRevenue._sum.valor || 0,
                averageUserValue: averageUserValue._avg.valor || 0,
                vipPlansDistribution: vipPlansDistribution.map((plan: any) => ({
                    valor: plan.valor,
                    _count: plan._count.valor
                }))
            }
        });
    } catch (error) {
        console.error('[DASHBOARD_GET_ERROR]', error);
        return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
    }
}

