// src/app/api/downloads/route.ts
import { authOptions } from '@/lib/authOptions';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const user = await prisma.user.findUnique({
            where: { id: session.user.id },
            select: {
                is_vip: true,
                downloads: {
                    select: {
                        trackId: true,
                    }
                }
            }
        });

        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        const downloadedTrackIds = user.downloads.map((download: any) => download.trackId);

        return NextResponse.json({
            downloads: downloadedTrackIds,
            isVip: user.is_vip,
            dailyDownloadCount: 0, // Não implementado no novo schema
            dailyLimit: user.is_vip ? 'Ilimitado' : 15
        });

    } catch (error) {
        console.error('❌ Erro na API /downloads GET:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { trackId, confirmReDownload } = await req.json();

        if (!trackId) {
            return NextResponse.json({ error: "ID da música é obrigatório" }, { status: 400 });
        }

        // Garantir que trackId seja um número
        const numericTrackId = Number(trackId);
        if (isNaN(numericTrackId)) {
            return NextResponse.json({ error: "ID da música inválido" }, { status: 400 });
        }

        try {
            // Verificar se o Prisma está conectado
            if (!prisma) {
                console.error('❌ API /downloads: Prisma client não disponível');
                return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 });
            }

            // Tentar conectar se necessário
            try {
                await prisma.$connect();
            } catch (connectError) {
                console.error('❌ API /downloads: Erro ao conectar com banco:', connectError);
                return NextResponse.json({ error: "Erro de conexão com banco de dados" }, { status: 500 });
            }

            let user = await prisma.user.findUnique({
                where: { id: String(session.user.id) },
                select: {
                    id: true,
                    is_vip: true
                }
            });

            if (!user) {
                return NextResponse.json({ error: "Utilizador não encontrado" }, { status: 404 });
            }

            // Permitir que todos os usuários logados baixem (como na página /new)
            const isUserVip = true; // Temporariamente permitir todos os usuários logados

            const now = new Date();
            const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

            // Para usuários VIP, não há limite de downloads
            const isVipUser = isUserVip;
            const dailyLimitValue = isVipUser ? 'Ilimitado' : 15;

            // Lógica de confirmação de re-download
            const recentDownload = await prisma.download.findFirst({
                where: {
                    userId: String(user.id),
                    trackId: Number(numericTrackId),
                    downloadedAt: { gte: twentyFourHoursAgo }
                },
            });

            if (recentDownload && !confirmReDownload) {
                return NextResponse.json({
                    needsConfirmation: true,
                    message: `Você já baixou esta música hoje. Deseja baixar novamente?`,
                    userId: String(user.id)
                }, { status: 202 });
            }

            // Processa o download (cria/atualiza o registro)
            if (recentDownload) {
                // Atualizar download existente
                await prisma.download.update({
                    where: { id: recentDownload.id },
                    data: { downloadedAt: now }
                });
            } else {
                // Verificar se já existe um download para evitar constraint única
                const existingDownload = await prisma.download.findFirst({
                    where: {
                        userId: String(user.id),
                        trackId: Number(numericTrackId)
                    }
                });

                if (!existingDownload) {
                    // Criar novo download apenas se não existir
                    await prisma.download.create({
                        data: {
                            userId: String(user.id),
                            trackId: Number(numericTrackId),
                            downloadedAt: now
                        }
                    });
                } else {
                    // Atualizar download existente
                    await prisma.download.update({
                        where: { id: existingDownload.id },
                        data: { downloadedAt: now }
                    });
                }
            }

            const track = await prisma.track.findUnique({
                where: { id: Number(numericTrackId) },
                select: {
                    id: true,
                    songName: true,
                    artist: true,
                    downloadUrl: true
                }
            });

            if (!track) {
                return NextResponse.json({ error: "Música não encontrada.", userId: String(user.id) }, { status: 404 });
            }

            // Buscar todos os downloads do usuários
            const userDownloads = await prisma.download.findMany({
                where: { userId: String(user.id) },
                select: { trackId: true }
            });

            return NextResponse.json({
                success: true,
                message: 'Download autorizado!',
                downloadUrl: track.downloadUrl,
                dailyDownloadCount: 0, // Não implementado no novo schema
                dailyLimit: 'Ilimitado', // Todos os usuários logados têm limite ilimitado
                remainingDownloads: 'Ilimitado',
                downloadedTrackIds: userDownloads.map((d: any) => Number(d.trackId)),
                downloadedTracksTime: {}, // Será calculado no frontend
                isVipUser: true, // Todos os usuários logados são tratados como VIP
                userId: String(user.id)
            }, { status: 200 });

        } catch (error) {
            console.error('❌ Erro na API /downloads POST:', error);
            return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
        }
    } catch (error) {
        console.error('❌ Erro geral na API /downloads POST:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
} 