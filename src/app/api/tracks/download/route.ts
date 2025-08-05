import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import prisma from '@/lib/prisma';

export async function POST(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.email) {
            return NextResponse.json({ error: 'Usuário não autenticado' }, { status: 401 });
        }

        const { trackId } = await request.json();

        if (!trackId) {
            return NextResponse.json({ error: 'trackId é obrigatório' }, { status: 400 });
        }

        // Verificar se o usuário existe
        const user = await prisma.user.findUnique({
            where: { email: session.user.email }
        });

        if (!user) {
            return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 });
        }

        // Verificar se é VIP ou admin
        const isAdmin = session.user.email === 'edersonleonardo@nexorrecords.com.br';
        const isVipUser = user.is_vip || isAdmin;

        // Verificar se a track existe
        const track = await prisma.track.findUnique({
            where: { id: parseInt(trackId) }
        });

        if (!track) {
            return NextResponse.json({ error: 'Música não encontrada' }, { status: 404 });
        }

        // Verificar se já baixou nas últimas 24 horas
        const existingDownload = await prisma.download.findFirst({
            where: {
                userId: user.id,
                trackId: parseInt(trackId),
                downloadedAt: {
                    gte: new Date(Date.now() - 24 * 60 * 60 * 1000) // Últimas 24 horas
                }
            }
        });

        if (existingDownload) {
            return NextResponse.json({ error: 'Você já baixou esta música nas últimas 24 horas' }, { status: 400 });
        }

        // Verificar limite diário de downloads APENAS para usuários não-VIP
        let downloadsToday = 0;
        let dailyLimit = Infinity;

        if (!isVipUser) {
            const today = new Date();
            today.setHours(0, 0, 0, 0);

            downloadsToday = await prisma.download.count({
                where: {
                    userId: user.id,
                    downloadedAt: {
                        gte: today
                    }
                }
            });

            dailyLimit = user.dailyDownloadCount || 50;

            if (downloadsToday >= dailyLimit) {
                return NextResponse.json({
                    error: `Limite diário de downloads atingido (${dailyLimit})`
                }, { status: 400 });
            }
        }

        // Criar download
        await prisma.download.create({
            data: {
                userId: user.id,
                trackId: parseInt(trackId),
                downloadedAt: new Date()
            }
        });

        // Atualizar contador de downloads do usuário apenas para não-VIP
        if (!isVipUser) {
            await prisma.user.update({
                where: { id: user.id },
                data: {
                    dailyDownloadCount: downloadsToday + 1
                }
            });
        }

        return NextResponse.json({
            success: true,
            message: 'Download registrado com sucesso',
            downloadsLeft: isVipUser ? 'Ilimitado' : (dailyLimit - (downloadsToday + 1)),
            isVipUser: isVipUser
        });

    } catch (error) {
        console.error('Erro na API de download:', error);
        return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
    }
}

export async function GET(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.email) {
            return NextResponse.json({ error: 'Usuário não autenticado' }, { status: 401 });
        }

        const url = new URL(request.url);
        const trackId = url.searchParams.get('trackId');

        if (!trackId) {
            return NextResponse.json({ error: 'trackId é obrigatório' }, { status: 400 });
        }

        // Verificar se o usuário existe
        const user = await prisma.user.findUnique({
            where: { email: session.user.email }
        });

        if (!user) {
            return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 });
        }

        // Verificar se o usuário baixou a música nas últimas 24 horas
        const download = await prisma.download.findFirst({
            where: {
                userId: user.id,
                trackId: parseInt(trackId),
                downloadedAt: {
                    gte: new Date(Date.now() - 24 * 60 * 60 * 1000) // Últimas 24 horas
                }
            }
        });

        return NextResponse.json({
            downloaded: !!download,
            trackId: trackId
        });

    } catch (error) {
        console.error('Erro ao verificar download:', error);
        return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
    }
} 