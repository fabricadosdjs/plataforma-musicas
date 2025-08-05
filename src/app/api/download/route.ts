import { authOptions } from '@/lib/authOptions';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user) {
            return NextResponse.json(
                { error: 'Não autorizado' },
                { status: 401 }
            );
        }

        const { trackId } = await request.json();

        if (!trackId) {
            return NextResponse.json(
                { error: 'ID da música é obrigatório' },
                { status: 400 }
            );
        }

        // Buscar dados atualizados do usuário
        const user = await prisma.user.findUnique({
            where: { id: (session.user as any).id }
        }) as any;

        if (!user) {
            return NextResponse.json(
                { error: 'Usuário não encontrado' },
                { status: 404 }
            );
        }

        // Verificar se é VIP ou admin
        const isAdmin = session.user.email === 'edersonleonardo@nexorrecords.com.br';
        const isVipUser = user.is_vip || isAdmin;

        // Verificar se precisa resetar contador diário (mantido para estatísticas)
        const now = new Date();
        const lastReset = user.lastDownloadReset ? new Date(user.lastDownloadReset) : null;

        if (!lastReset ||
            (now.getTime() - lastReset.getTime()) > (24 * 60 * 60 * 1000)) {
            await prisma.user.update({
                where: { id: user.id },
                data: {
                    dailyDownloadCount: 0,
                    lastDownloadReset: now
                } as any
            });
            user.dailyDownloadCount = 0;
        }

        // Obter limites do usuário (apenas para não-VIP)
        const benefits = (session.user as any).benefits;
        const dailyLimit = isVipUser ? Infinity : (benefits?.downloadsPerDay || 5);

        // Verificar limite APENAS para usuários não-VIP
        if (!isVipUser && user.dailyDownloadCount >= dailyLimit) {
            return NextResponse.json(
                {
                    error: 'Limite diário de downloads atingido',
                    limit: dailyLimit,
                    used: user.dailyDownloadCount
                },
                { status: 429 }
            );
        }

        // Verificar se a música existe
        const track = await prisma.track.findUnique({
            where: { id: parseInt(trackId) }
        });

        if (!track) {
            return NextResponse.json(
                { error: 'Música não encontrada' },
                { status: 404 }
            );
        }

        // Verificar se já baixou essa música
        const existingDownload = await prisma.download.findFirst({
            where: {
                userId: user.id,
                trackId: parseInt(trackId)
            }
        });

        if (!existingDownload) {
            // Criar novo registro de download
            await prisma.download.create({
                data: {
                    userId: user.id,
                    trackId: parseInt(trackId),
                    createdAt: now,
                    downloadedAt: now
                }
            });

            // Incrementar contador apenas para usuários não-VIP
            if (!isVipUser) {
                await prisma.user.update({
                    where: { id: user.id },
                    data: {
                        dailyDownloadCount: user.dailyDownloadCount + 1
                    } as any
                });
            }
        }

        return NextResponse.json({
            success: true,
            message: 'Download autorizado',
            downloadUrl: track.downloadUrl,
            remainingDownloads: isVipUser ? 'Ilimitado' : (dailyLimit - (user.dailyDownloadCount + 1)),
            track: {
                id: track.id,
                songName: track.songName,
                artist: track.artist,
                style: track.style
            },
            isVipUser: isVipUser
        });

    } catch (error) {
        console.error('Erro no download:', error);
        return NextResponse.json(
            { error: 'Erro interno do servidor' },
            { status: 500 }
        );
    }
}
