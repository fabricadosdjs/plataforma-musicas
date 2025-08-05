import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import prisma from '@/lib/prisma';

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

        // Calcular limite diário baseado no valor
        const getDailyDownloadLimit = (valor: number | null, isVip: boolean) => {
            if (!isVip) return 10;
            // Para usuários VIP, downloads são ilimitados
            return 'Ilimitado';
        };

        // Calcular informações de vencimento
        const calculateVencimentoInfo = (vencimento: string | null) => {
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

        // Determinar plano VIP baseado no valor
        const getVipPlan = (valor: number | null, isVip: boolean) => {
            if (!isVip) return null;
            const valorNumerico = typeof valor === 'string' ? parseFloat(valor) : Number(valor);
            if (valorNumerico >= 43) return 'COMPLETO';
            if (valorNumerico >= 36) return 'PADRAO';
            if (valorNumerico >= 30) return 'BASICO';
            return null;
        };

        // Benefícios do plano
        const getPlanBenefits = (valor: number | null, isVip: boolean) => {
            if (!isVip) return null;

            const valorNumerico = typeof valor === 'string' ? parseFloat(valor) : Number(valor);
            const dailyLimit = getDailyDownloadLimit(valor, isVip);

            return {
                name: getVipPlan(valor, isVip) || 'VIP',
                driveAccess: {
                    enabled: valorNumerico >= 30,
                    description: 'Acesso ao Google Drive'
                },
                packRequests: {
                    enabled: valorNumerico >= 36,
                    description: 'Solicitações de packs',
                    limit: valorNumerico >= 43 ? 10 : 5
                },
                playlistDownloads: {
                    enabled: valorNumerico >= 36,
                    description: 'Downloads de playlists',
                    limit: valorNumerico >= 43 ? 20 : 10
                },
                dailyDownloadLimit: dailyLimit,
                deezerPremium: {
                    enabled: valorNumerico >= 43,
                    description: 'Acesso Deezer Premium'
                },
                deemixDiscount: {
                    enabled: valorNumerico >= 43,
                    description: 'Desconto Deemix',
                    percentage: 50
                }
            };
        };

        const vencimentoInfo = calculateVencimentoInfo(user.vencimento);
        const vipPlan = getVipPlan(user.valor, user.is_vip || false);
        const planBenefits = getPlanBenefits(user.valor, user.is_vip || false);

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
            dailyDownloadLimit: getDailyDownloadLimit(user.valor, user.is_vip || false),
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
            planBenefits,
            vencimentoInfo,
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