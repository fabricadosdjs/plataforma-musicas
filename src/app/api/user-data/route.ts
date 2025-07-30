// src/app/api/user-data/route.ts
import { authOptions } from '@/lib/authOptions';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id || !session.user.email) {
            return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
        }

        // Buscar dados completos do usuário, incluindo downloads detalhados
        const userWithDetails = await prisma.user.findUnique({
            where: { email: session.user.email },
            select: {
                id: true,
                name: true,
                email: true,
                whatsapp: true,
                createdAt: true,
                is_vip: true,
                status: true,
                valor: true,
                vencimento: true,
                dailyDownloadCount: true,
                weeklyPackRequests: true,
                weeklyPlaylistDownloads: true,
                deemix: true,
                downloads: {
                    select: {
                        trackId: true,
                        downloadedAt: true,
                    }
                },
                _count: {
                    select: {
                        downloads: true,
                        likes: true,
                        plays: true,
                    },
                },
            },
        });

        if (!userWithDetails) {
            return NextResponse.json({ error: 'Usuário não encontrado no banco de dados.' }, { status: 404 });
        }

        // Determinar plano VIP baseado no valor
        const getVipPlan = (valor: number | null) => {
            if (!valor || valor < 30) return null;
            if (valor >= 30 && valor <= 35) return 'BASICO';
            if (valor >= 36 && valor <= 42) return 'PADRAO';
            if (valor >= 43) return 'COMPLETO';
            return null;
        };

        const vipPlan = getVipPlan(userWithDetails.valor);

        // Definir benefícios do plano
        const VIP_BENEFITS = {
            BASICO: {
                name: 'VIP BÁSICO',
                driveAccess: { enabled: true, description: 'Ilimitado' },
                packRequests: { enabled: true, limit: 4, description: 'Até 4 estilos por semana' },
                playlistDownloads: { enabled: true, limit: 7, description: 'Até 7 por semana' },
                dailyDownloadLimit: 50,
                deezerPremium: { enabled: false, description: 'Não disponível' },
                deemixDiscount: { enabled: false, percentage: 0, description: 'Não disponível' }
            },
            PADRAO: {
                name: 'VIP PADRÃO',
                driveAccess: { enabled: true, description: 'Ilimitado' },
                packRequests: { enabled: true, limit: 6, description: 'Até 6 estilos por semana' },
                playlistDownloads: { enabled: true, limit: 9, description: 'Até 9 por semana' },
                dailyDownloadLimit: 100,
                deezerPremium: { enabled: false, description: 'Não disponível' },
                deemixDiscount: { enabled: true, percentage: 15, description: 'Incluso' }
            },
            COMPLETO: {
                name: 'VIP COMPLETO',
                driveAccess: { enabled: true, description: 'Ilimitado' },
                packRequests: { enabled: true, limit: 8, description: 'Até 8 estilos por semana' },
                playlistDownloads: { enabled: true, limit: -1, description: 'Ilimitado (máx. 4 por dia)' },
                dailyDownloadLimit: 200,
                deezerPremium: { enabled: true, description: 'Incluso' },
                deemixDiscount: { enabled: true, percentage: 15, description: 'Incluso' }
            }
        };

        const planBenefits = vipPlan ? VIP_BENEFITS[vipPlan] : null;

        // Calcular estatísticas de vencimento
        const getVencimentoInfo = (vencimento: Date | null, status: string | null) => {
            if (status?.toLowerCase() === 'cancelado') {
                return { status: 'cancelled', daysRemaining: 0, isExpired: true, isExpiringSoon: false };
            }
            if (!vencimento) {
                return { status: 'no_expiry', daysRemaining: null, isExpired: false, isExpiringSoon: false };
            }

            const hoje = new Date();
            const dataVencimento = new Date(vencimento);
            const diffTime = dataVencimento.getTime() - hoje.getTime();
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

            return {
                status: diffDays < 0 ? 'expired' : diffDays <= 7 ? 'expiring_soon' : 'active',
                daysRemaining: diffDays,
                isExpired: diffDays < 0,
                isExpiringSoon: diffDays <= 7 && diffDays >= 0
            };
        };

        const vencimentoInfo = getVencimentoInfo(userWithDetails.vencimento, userWithDetails.status);

        // Buscar downloads recentes (últimos 10)
        const recentDownloads = await prisma.download.findMany({
            where: { userId: userWithDetails.id },
            include: {
                track: {
                    select: {
                        songName: true,
                        artist: true,
                        imageUrl: true,
                        style: true
                    }
                }
            },
            orderBy: { downloadedAt: 'desc' },
            take: 10
        });

        // Buscar likes recentes (últimos 10)
        const recentLikes = await prisma.like.findMany({
            where: { userId: userWithDetails.id },
            include: {
                track: {
                    select: {
                        songName: true,
                        artist: true,
                        imageUrl: true,
                        style: true
                    }
                }
            },
            orderBy: { createdAt: 'desc' },
            take: 10
        });

        // Formata os dados para a resposta da API, incluindo downloads detalhados
        const responseData = {
            id: userWithDetails.id,
            name: userWithDetails.name,
            email: userWithDetails.email,
            whatsapp: userWithDetails.whatsapp,
            createdAt: userWithDetails.createdAt.toISOString(),
            is_vip: userWithDetails.is_vip,
            status: userWithDetails.status,
            valor: userWithDetails.valor,
            vencimento: userWithDetails.vencimento ? userWithDetails.vencimento.toISOString() : null,
            dailyDownloadCount: userWithDetails.dailyDownloadCount,
            dailyDownloadLimit: planBenefits?.dailyDownloadLimit || 50,
            weeklyPackRequests: userWithDetails.weeklyPackRequests,
            weeklyPlaylistDownloads: userWithDetails.weeklyPlaylistDownloads,
            deemix: userWithDetails.deemix,
            downloadsCount: userWithDetails._count.downloads,
            likesCount: userWithDetails._count.likes,
            playsCount: userWithDetails._count.plays,
            // Informações do plano VIP
            vipPlan: vipPlan,
            planBenefits: planBenefits,
            // Informações de vencimento
            vencimentoInfo: vencimentoInfo,
            // Atividade recente
            recentDownloads: recentDownloads.map(d => ({
                id: d.id,
                downloadedAt: d.downloadedAt.toISOString(),
                track: d.track
            })),
            recentLikes: recentLikes.map(l => ({
                id: l.id,
                createdAt: l.createdAt.toISOString(),
                track: l.track
            })),
            // Campos legados para compatibilidade
            downloadedTrackIds: userWithDetails.downloads.map(d => d.trackId),
            downloadedTracks: userWithDetails.downloads.map(d => ({ trackId: d.trackId, downloadedAt: d.downloadedAt })),
        };

        return NextResponse.json(responseData);

    } catch (error) {
        console.error('Erro ao buscar dados do usuário:', error);
        return NextResponse.json(
            { error: 'Erro interno do servidor' },
            { status: 500 }
        );
    }
}

// A função POST permanece a mesma, pois é para ações de admin
export async function POST(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
        }

        const isAdmin = session.user.id === 'admin-nextor-001' || (session.user as any).benefits?.adminAccess;

        if (!isAdmin) {
            return NextResponse.json({ error: 'Acesso negado' }, { status: 403 });
        }

        return NextResponse.json({
            message: 'Ação de admin executada com sucesso',
        });

    } catch (error) {
        console.error('Erro na rota POST de user-data:', error);
        return NextResponse.json(
            { error: 'Erro interno do servidor' },
            { status: 500 }
        );
    }
}