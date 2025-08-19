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

        let user = await prisma.user.findUnique({
            where: { id: session.user.id },
            select: {
                id: true,
                is_vip: true
            }
        });

        if (!user) {
            console.log('❌ API /downloads: Usuário não encontrado');
            return NextResponse.json({ error: "Utilizador não encontrado" }, { status: 404 });
        }

        // Verificar se é VIP ou admin
        const isAdmin = session.user.email === 'edersonleonardo@nexorrecords.com.br';
        if (!user.is_vip && !isAdmin) {
            console.log('❌ API /downloads: Usuário não VIP');
            return NextResponse.json({ error: 'Apenas usuários VIP podem baixar músicas' }, { status: 403 });
        }

        const now = new Date();
        const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

        // Para usuários VIP, não há limite de downloads
        const isVipUser = user.is_vip || isAdmin;
        const dailyLimit = isVipUser ? Infinity : 15;

        // Lógica de confirmação de re-download
        const recentDownload = await prisma.download.findFirst({
            where: {
                userId: user.id,
                trackId: trackId,
                downloadedAt: { gte: twentyFourHoursAgo }
            },
        });

        if (recentDownload && !confirmReDownload) {
            console.log('⚠️ API /downloads: Re-download solicitado');
            return NextResponse.json({
                needsConfirmation: true,
                message: `Você já baixou esta música hoje. Deseja baixar novamente?`
            }, { status: 202 });
        }

        // Processa o download (cria/atualiza o registro)
        await prisma.download.upsert({
            where: {
                id: recentDownload?.id || 'temp-id' // Usar ID temporário se não existir
            },
            update: { downloadedAt: now },
            create: {
                userId: user.id,
                trackId: trackId,
                downloadedAt: now
            }
        });

        const track = await prisma.track.findUnique({
            where: { id: trackId },
            select: {
                id: true,
                songName: true,
                artist: true,
                downloadUrl: true
            }
        });

        if (!track) {
            console.log('❌ API /downloads: Track não encontrada');
            return NextResponse.json({ error: "Música não encontrada." }, { status: 404 });
        }

        // Buscar todos os downloads do usuário
        const userDownloads = await prisma.download.findMany({
            where: { userId: user.id },
            select: { trackId: true }
        });

        console.log('✅ API /downloads: Download processado com sucesso');
        return NextResponse.json({
            success: true,
            message: 'Download autorizado!',
            downloadUrl: track.downloadUrl,
            dailyDownloadCount: 0, // Não implementado no novo schema
            dailyLimit: isVipUser ? 'Ilimitado' : dailyLimit,
            remainingDownloads: isVipUser ? 'Ilimitado' : 'N/A',
            downloadedTrackIds: userDownloads.map(d => d.trackId),
            downloadedTracksTime: {}, // Será calculado no frontend
            isVipUser: isVipUser
        }, { status: 200 });

    } catch (error) {
        console.error('❌ Erro na API /downloads POST:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
} 