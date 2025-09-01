import { authOptions } from '@/lib/authOptions';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth/next';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.email) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }

        const userEmail = session.user.email;

        // Buscar usuário pelo email
        const user = await prisma.user.findUnique({
            where: { email: userEmail },
            select: { id: true }
        });

        if (!user) {
            return NextResponse.json(
                { error: "Usuário não encontrado" },
                { status: 404 }
            );
        }

        const userId = user.id;
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
        const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
        const yearAgo = new Date(today.getTime() - 365 * 24 * 60 * 60 * 1000);

        // Estatísticas de Downloads
        let downloadsToday = 0;
        try {
            downloadsToday = await prisma.download.count({
                where: {
                    userId: userId,
                    downloadedAt: {
                        gte: today
                    }
                }
            });
        } catch (error) {
            console.error('Erro ao contar downloads hoje:', error);
        }

        let downloadsThisWeek = 0;
        try {
            downloadsThisWeek = await prisma.download.count({
                where: {
                    userId: userId,
                    downloadedAt: {
                        gte: weekAgo
                    }
                }
            });
        } catch (error) {
            console.error('Erro ao contar downloads da semana:', error);
        }

        let downloadsThisMonth = 0;
        try {
            downloadsThisMonth = await prisma.download.count({
                where: {
                    userId: userId,
                    downloadedAt: {
                        gte: monthAgo
                    }
                }
            });
        } catch (error) {
            console.error('Erro ao contar downloads do mês:', error);
        }

        let downloadsThisYear = 0;
        try {
            downloadsThisYear = await prisma.download.count({
                where: {
                    userId: userId,
                    downloadedAt: {
                        gte: yearAgo
                    }
                }
            });
        } catch (error) {
            console.error('Erro ao contar downloads do ano:', error);
        }

        let totalDownloads = 0;
        try {
            totalDownloads = await prisma.download.count({
                where: { userId: userId }
            });
        } catch (error) {
            console.error('Erro ao contar total de downloads:', error);
        }

        // Estatísticas de Likes
        let likesToday = 0;
        try {
            likesToday = await prisma.like.count({
                where: {
                    userId: userId,
                    createdAt: {
                        gte: today
                    }
                }
            });
        } catch (error) {
            console.error('Erro ao contar likes hoje:', error);
        }

        let likesThisWeek = 0;
        try {
            likesThisWeek = await prisma.like.count({
                where: {
                    userId: userId,
                    createdAt: {
                        gte: weekAgo
                    }
                }
            });
        } catch (error) {
            console.error('Erro ao contar likes da semana:', error);
        }

        let likesThisMonth = 0;
        try {
            likesThisMonth = await prisma.like.count({
                where: {
                    userId: userId,
                    createdAt: {
                        gte: monthAgo
                    }
                }
            });
        } catch (error) {
            console.error('Erro ao contar likes do mês:', error);
        }

        let likesThisYear = 0;
        try {
            likesThisYear = await prisma.like.count({
                where: {
                    userId: userId,
                    createdAt: {
                        gte: yearAgo
                    }
                }
            });
        } catch (error) {
            console.error('Erro ao contar likes do ano:', error);
        }

        let totalLikes = 0;
        try {
            totalLikes = await prisma.like.count({
                where: { userId: userId }
            });
        } catch (error) {
            console.error('Erro ao contar total de likes:', error);
        }

        // Estatísticas de Plays
        let playsToday = 0;
        try {
            playsToday = await prisma.play.count({
                where: {
                    userId: userId,
                    createdAt: {
                        gte: today
                    }
                }
            });
        } catch (error) {
            console.error('Erro ao contar plays hoje:', error);
        }

        let playsThisWeek = 0;
        try {
            playsThisWeek = await prisma.play.count({
                where: {
                    userId: userId,
                    createdAt: {
                        gte: weekAgo
                    }
                }
            });
        } catch (error) {
            console.error('Erro ao contar plays da semana:', error);
        }

        let totalPlays = 0;
        try {
            totalPlays = await prisma.play.count({
                where: { userId: userId }
            });
        } catch (error) {
            console.error('Erro ao contar total de plays:', error);
        }

        // Estatísticas de GB baixados (estimativa)
        // Assumindo que cada música tem em média 10MB
        const estimatedGBDownloaded = Math.round((totalDownloads * 10) / 1024 * 100) / 100;

        // Dados para gráficos (últimos 7 dias)
        const dailyStats = [];
        for (let i = 6; i >= 0; i--) {
            const date = new Date(today.getTime() - i * 24 * 60 * 60 * 1000);
            const dayStart = new Date(date.getFullYear(), date.getMonth(), date.getDate());
            const dayEnd = new Date(dayStart.getTime() + 24 * 60 * 60 * 1000);

            let dayDownloads = 0;
            try {
                dayDownloads = await prisma.download.count({
                    where: {
                        userId: userId,
                        downloadedAt: {
                            gte: dayStart,
                            lt: dayEnd
                        }
                    }
                });
            } catch (error) {
                console.error('Erro ao contar downloads do dia:', error);
            }

            let dayLikes = 0;
            try {
                dayLikes = await prisma.like.count({
                    where: {
                        userId: userId,
                        createdAt: {
                            gte: dayStart,
                            lt: dayEnd
                        }
                    }
                });
            } catch (error) {
                console.error('Erro ao contar likes do dia:', error);
            }

            dailyStats.push({
                date: date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
                downloads: dayDownloads,
                likes: dayLikes
            });
        }

        return NextResponse.json({
            downloads: {
                today: downloadsToday,
                thisWeek: downloadsThisWeek,
                thisMonth: downloadsThisMonth,
                thisYear: downloadsThisYear,
                total: totalDownloads
            },
            likes: {
                today: likesToday,
                thisWeek: likesThisWeek,
                thisMonth: likesThisMonth,
                thisYear: likesThisYear,
                total: totalLikes
            },
            plays: {
                today: playsToday,
                thisWeek: playsThisWeek,
                total: totalPlays
            },
            storage: {
                estimatedGB: estimatedGBDownloaded
            },
            dailyStats: dailyStats
        });

    } catch (error) {
        console.error("[PROFILE_ACTIVITY_GET_ERROR]", error);
        return NextResponse.json(
            { error: "Erro Interno do Servidor" },
            { status: 500 }
        );
    }
}
