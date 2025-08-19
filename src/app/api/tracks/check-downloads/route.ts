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

        const { trackIds } = await request.json();

        if (!trackIds || !Array.isArray(trackIds)) {
            return NextResponse.json({ error: 'trackIds deve ser um array' }, { status: 400 });
        }

        // Verificar se o usuário existe
        const user = await prisma.user.findUnique({
            where: { email: session.user.email }
        });

        if (!user) {
            return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 });
        }

        // Buscar downloads nas últimas 24 horas para os trackIds fornecidos
        const recentDownloads = await prisma.download.findMany({
            where: {
                userId: user.id,
                trackId: {
                    in: trackIds.map(id => parseInt(id))
                },
                downloadedAt: {
                    gte: new Date(Date.now() - 24 * 60 * 60 * 1000) // Últimas 24 horas
                }
            },
            select: {
                trackId: true,
                downloadedAt: true
            }
        });

        // Criar um map de trackId -> true para downloads recentes
        const downloadedTrackIds = recentDownloads.reduce((acc, download) => {
            acc[download.trackId] = true;
            return acc;
        }, {} as Record<number, boolean>);

        return NextResponse.json({
            downloadedTrackIds,
            recentDownloads: recentDownloads.length
        });

    } catch (error) {
        console.error('Erro ao verificar downloads:', error);
        return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
    }
}
