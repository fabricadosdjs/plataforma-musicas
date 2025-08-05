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
                dailyDownloadCount: true,
                lastDownloadReset: true,
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
            dailyDownloadCount: user.dailyDownloadCount || 0,
            dailyLimit: (session.user as any).benefits?.downloadsPerDay || 15
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

        let user = await prisma.user.findUnique({ where: { id: session.user.id } });
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

        // Lógica para resetar o contador diário (mantida para estatísticas)
        if (!user.lastDownloadReset || user.lastDownloadReset < twentyFourHoursAgo) {
            user = await prisma.user.update({
                where: { id: user.id },
                data: { dailyDownloadCount: 0, lastDownloadReset: now },
            });
        }

        // Para usuários VIP, não há limite de downloads
        const isVipUser = user.is_vip || isAdmin;
        const dailyLimit = isVipUser ? Infinity : ((session.user as any).benefits?.downloadsPerDay || 15);

        // Lógica de confirmação de re-download
        const recentDownload = await prisma.download.findFirst({
            where: { userId: user.id, trackId: trackId, downloadedAt: { gte: twentyFourHoursAgo } },
        });

        if (recentDownload && !confirmReDownload) {
            console.log('⚠️ API /downloads: Re-download solicitado');
            return NextResponse.json({ needsConfirmation: true, message: `Você já baixou esta música hoje. Deseja baixar novamente?` }, { status: 202 });
        }

        // Verifica se o download deve contar para o limite diário (apenas para não-VIP)
        const existingDownload = await prisma.download.findUnique({ where: { userId_trackId: { userId: user.id, trackId } } });
        const shouldIncrementCount = !recentDownload && !isVipUser; // Só incrementa se não for VIP e não for re-download recente

        // Verifica o limite APENAS para usuários não-VIP
        if (!isVipUser && shouldIncrementCount && (user.dailyDownloadCount || 0) >= dailyLimit) {
            console.log('❌ API /downloads: Limite diário atingido');
            return NextResponse.json({ error: `Você atingiu seu limite de ${dailyLimit} downloads diários.` }, { status: 429 });
        }

        // Processa o download (cria/atualiza o registro)
        await prisma.download.upsert({
            where: { userId_trackId: { userId: user.id, trackId: trackId } },
            update: { downloadedAt: now },
            create: { userId: user.id, trackId: trackId, downloadedAt: now }
        });

        let updatedUser = user;
        if (shouldIncrementCount) {
            updatedUser = await prisma.user.update({
                where: { id: user.id },
                data: { dailyDownloadCount: { increment: 1 } },
            });
        }

        const track = await prisma.track.findUnique({ where: { id: trackId } });
        if (!track) {
            console.log('❌ API /downloads: Track não encontrada');
            return NextResponse.json({ error: "Música não encontrada." }, { status: 404 });
        }

        console.log('✅ API /downloads: Download processado com sucesso');
        return NextResponse.json({
            success: true,
            message: 'Download autorizado!',
            downloadUrl: track.downloadUrl,
            dailyDownloadCount: updatedUser.dailyDownloadCount,
            dailyLimit: isVipUser ? 'Ilimitado' : dailyLimit,
            remainingDownloads: isVipUser ? 'Ilimitado' : (dailyLimit - (updatedUser.dailyDownloadCount || 0)),
            downloadedTrackIds: (await prisma.download.findMany({ where: { userId: user.id } })).map(d => d.trackId),
            downloadedTracksTime: {}, // Será calculado no frontend
            isVipUser: isVipUser
        }, { status: 200 });

    } catch (error) {
        console.error('❌ Erro na API /downloads POST:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
} 