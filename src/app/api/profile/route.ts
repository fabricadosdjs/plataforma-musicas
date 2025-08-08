import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import prisma from '@/lib/prisma';
import { getPlanInfo, getVipPlan } from '@/lib/plans-config';

export async function GET(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.email) {
            return NextResponse.json({ error: 'Usuário não autenticado' }, { status: 401 });
        }

        // Buscar dados completos do usuário
        const user = await prisma.user.findUnique({
            where: { email: session.user.email },
            include: {
                likes: {
                    include: {
                        track: {
                            select: {
                                id: true,
                                songName: true,
                                artist: true,
                                imageUrl: true,
                                style: true
                            }
                        }
                    },
                    orderBy: { createdAt: 'desc' },
                    take: 10
                },
                downloads: {
                    include: {
                        track: {
                            select: {
                                id: true,
                                songName: true,
                                artist: true,
                                imageUrl: true,
                                style: true
                            }
                        }
                    },
                    orderBy: { downloadedAt: 'desc' },
                    take: 10
                },
                plays: {
                    include: {
                        track: {
                            select: {
                                id: true,
                                songName: true,
                                artist: true,
                                imageUrl: true,
                                style: true
                            }
                        }
                    },
                    orderBy: { createdAt: 'desc' },
                    take: 10
                }
            }
        });

        if (!user) {
            return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 });
        }

        // Calcular estatísticas
        const downloadsCount = await prisma.download.count({
            where: { userId: user.id }
        });

        const likesCount = await prisma.like.count({
            where: { userId: user.id }
        });

        const playsCount = await prisma.play.count({
            where: { userId: user.id }
        });

        // Calcular downloads de hoje
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const dailyDownloadCount = await prisma.download.count({
            where: {
                userId: user.id,
                downloadedAt: { gte: today }
            }
        });

        // ========== 🏆 DETECÇÃO DO PLANO DO USUÁRIO ==========
        const planInfo = getPlanInfo(user.valor);
        const vipPlan = getVipPlan(user.valor);

        // Calcular limite diário baseado no plano
        const dailyDownloadLimit = vipPlan ? 'Ilimitado' : 10;

        // Calcular informações de vencimento
        const calculateVencimentoInfo = (vencimento: Date | null) => {
            if (!vencimento) {
                return {
                    status: 'no_expiry' as const,
                    daysRemaining: null,
                    isExpired: false,
                    isExpiringSoon: false
                };
            }

            const vencimentoDate = new Date(vencimento);
            const now = new Date();
            const diffTime = vencimentoDate.getTime() - now.getTime();
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

            if (diffDays < 0) {
                return {
                    status: 'expired' as const,
                    daysRemaining: Math.abs(diffDays),
                    isExpired: true,
                    isExpiringSoon: false
                };
            } else if (diffDays <= 7) {
                return {
                    status: 'expiring_soon' as const,
                    daysRemaining: diffDays,
                    isExpired: false,
                    isExpiringSoon: true
                };
            } else {
                return {
                    status: 'active' as const,
                    daysRemaining: diffDays,
                    isExpired: false,
                    isExpiringSoon: false
                };
            }
        };

        const vencimentoInfo = calculateVencimentoInfo(user.vencimento);

        return NextResponse.json({
            id: user.id,
            email: user.email,
            name: user.name,
            whatsapp: user.whatsapp,
            createdAt: user.createdAt,
            is_vip: user.is_vip,
            status: user.status,
            valor: user.valor,
            vencimento: user.vencimento,
            dailyDownloadCount,
            dailyDownloadLimit: vipPlan ? 'Ilimitado' : 10,
            weeklyPackRequests: null,
            weeklyPlaylistDownloads: null,
            weeklyPackRequestsUsed: null,
            weeklyPlaylistDownloadsUsed: null,
            customBenefits: null,
            deemix: user.deemix,
            deezerPremium: user.deezerPremium,
            deezerEmail: user.deezerEmail,
            deezerPassword: user.deezerPassword,
            downloadsCount,
            likesCount,
            playsCount,
            vipPlan,
            planBenefits: planInfo.features || [],
            vencimentoInfo,

            // ========== 🎯 DADOS DO PLANO ==========
            plan: planInfo.id as 'BASICO' | 'PADRAO' | 'COMPLETO' | null,
            planIcon: planInfo.icon,
            planName: planInfo.name,

            recentDownloads: user.downloads.map(d => ({
                id: d.id,
                downloadedAt: d.downloadedAt,
                track: d.track
            })),
            recentLikes: user.likes.map(l => ({
                id: l.id,
                createdAt: l.createdAt,
                track: l.track
            })),
            recentPlays: user.plays.map(p => ({
                id: p.id,
                createdAt: p.createdAt,
                track: p.track
            }))
        });

    } catch (error) {
        console.error('Erro ao buscar dados do perfil:', error);
        return NextResponse.json(
            { error: 'Erro interno do servidor' },
            { status: 500 }
        );
    }
} 