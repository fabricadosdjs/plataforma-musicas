// src/app/api/user-data/route.ts
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

        const user = await prisma.user.findUnique({
            where: { email: session.user.email },
            include: {
                likes: {
                    select: { trackId: true }
                },
                downloads: {
                    where: {
                        downloadedAt: {
                            gte: new Date(Date.now() - 24 * 60 * 60 * 1000) // Últimas 24h
                        }
                    },
                    select: { trackId: true }
                }
            }
        });

        if (!user) {
            return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 });
        }

        // Buscar limite diário de downloads
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const dailyDownloadCount = await prisma.download.count({
            where: {
                userId: user.id,
                downloadedAt: {
                    gte: today
                }
            }
        });

        // Buscar IDs das tracks baixadas nas últimas 24h
        const downloadedTrackIds = user.downloads.map(d => d.trackId);

        // Buscar IDs das tracks curtidas
        const likedTrackIds = user.likes.map(l => l.trackId);
        console.log('🔍 API /user-data: Likes encontrados:', user.likes);
        console.log('🔍 API /user-data: likedTrackIds:', likedTrackIds);

        // Calcular limite de downloads baseado no valor do usuário
        const getDailyDownloadLimit = (valor: number | null, isVip: boolean) => {
            if (!isVip) return 10; // Usuário não VIP

            const valorNumerico = typeof valor === 'string' ? parseFloat(valor) : Number(valor);

            if (valorNumerico >= 43) return 150; // VIP COMPLETO
            if (valorNumerico >= 36) return 100; // VIP PADRÃO
            if (valorNumerico >= 30) return 50;  // VIP BÁSICO

            return 10; // Fallback para usuários VIP sem valor definido
        };

        return NextResponse.json({
            dailyDownloadLimit: getDailyDownloadLimit(user.valor, user.is_vip || false),
            dailyDownloadCount,
            downloadedTrackIds,
            likedTrackIds,
            isVip: user.is_vip
        });

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