// src/app/api/downloads/route.ts
import { authOptions } from '@/lib/authOptions';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
    try {
        console.log('🔍 API /downloads: Iniciando requisição GET');

        const session = await getServerSession(authOptions);
        console.log('🔍 API /downloads: Session:', session?.user);

        if (!session?.user?.id) {
            console.log('❌ API /downloads: Usuário não autenticado');
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
            console.log('❌ API /downloads: Usuário não encontrado');
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        const downloadedTrackIds = user.downloads.map(download => download.trackId);

        console.log('✅ API /downloads: Retornando dados do usuário');
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
        console.log('🔍 API /downloads: Iniciando requisição POST');

        const session = await getServerSession(authOptions);
        console.log('🔍 API /downloads: Session:', session?.user);

        if (!session?.user?.id) {
            console.log('❌ API /downloads: Usuário não autenticado');
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { trackId, confirmReDownload } = await req.json();
        console.log('🔍 API /downloads: Dados recebidos:', { trackId, confirmReDownload });

        if (!trackId) {
            console.log('❌ API /downloads: trackId não fornecido');
            return NextResponse.json({ error: "ID da música é obrigatório" }, { status: 400 });
        }

        // Garantir que trackId seja um número
        const numericTrackId = Number(trackId);
        if (isNaN(numericTrackId)) {
            console.log('❌ API /downloads: trackId inválido:', trackId);
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

            console.log('🔍 API /downloads: Dados do usuário do banco:', user);
            console.log('🔍 API /downloads: session.user.is_vip:', session.user.is_vip);
            console.log('🔍 API /downloads: user.is_vip do banco:', user?.is_vip);

            if (!user) {
                console.log('❌ API /downloads: Usuário não encontrado');
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
                console.log('⚠️ API /downloads: Re-download solicitado');
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
                // Criar novo download
                await prisma.download.create({
                    data: {
                        userId: String(user.id),
                        trackId: Number(numericTrackId),
                        downloadedAt: now
                    }
                });
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
                console.log('❌ API /downloads: Track não encontrada');
                return NextResponse.json({ error: "Música não encontrada.", userId: String(user.id) }, { status: 404 });
            }

            console.log('🔍 API /downloads: Track encontrada:', {
                id: track.id,
                songName: track.songName,
                artist: track.artist,
                downloadUrl: track.downloadUrl
            });

            // Buscar todos os downloads do usuários
            const userDownloads = await prisma.download.findMany({
                where: { userId: String(user.id) },
                select: { trackId: true }
            });

            console.log('✅ API /downloads: Download processado com sucesso');
            console.log('🔗 URL de download retornada:', track.downloadUrl);
            return NextResponse.json({
                success: true,
                message: 'Download autorizado!',
                downloadUrl: track.downloadUrl,
                dailyDownloadCount: 0, // Não implementado no novo schema
                dailyLimit: 'Ilimitado', // Todos os usuários logados têm limite ilimitado
                remainingDownloads: 'Ilimitado',
                downloadedTrackIds: userDownloads.map(d => Number(d.trackId)),
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