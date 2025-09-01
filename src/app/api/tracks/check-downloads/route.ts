import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import prisma from '@/lib/prisma';

// Cache otimizado em memória com TTL reduzido
const downloadCache = new Map<string, { data: any; timestamp: number }>();
const CACHE_TTL = 1 * 60 * 1000; // 1 minuto (reduzido de 5 para 1)

export async function POST(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.email) {
            return NextResponse.json({ error: 'Usuário não autenticado' }, { status: 401 });
        }

        let trackIds;
        try {
            const body = await request.json();
            trackIds = body.trackIds;
        } catch {
            return NextResponse.json({ error: 'Corpo da requisição inválido ou ausente' }, { status: 400 });
        }
        if (!trackIds || !Array.isArray(trackIds)) {
            return NextResponse.json({ error: 'trackIds deve ser um array' }, { status: 400 });
        }

        // Verificar cache primeiro com TTL reduzido
        const cacheKey = `${session.user.email}_${trackIds.sort().join(',')}`;
        const cached = downloadCache.get(cacheKey);
        if (cached && (Date.now() - cached.timestamp) < CACHE_TTL) {
            return NextResponse.json(cached.data);
        }

        // Query otimizada - selecionar apenas campos necessários
        const user = await prisma.user.findUnique({
            where: { email: session.user.email },
            select: { id: true }
        });

        if (!user) {
            return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 });
        }

        // Query otimizada para downloads recentes
        const recentDownloads = await prisma.download.findMany({
            where: {
                userId: user.id,
                trackId: { in: trackIds.map(id => parseInt(id)) },
                downloadedAt: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }
            },
            select: {
                trackId: true,
                downloadedAt: true
            }
        });

        const downloadedTrackIds = recentDownloads.reduce((acc: Record<number, boolean>, download: { trackId: number; downloadedAt: Date }) => {
            acc[download.trackId] = true;
            return acc;
        }, {} as Record<number, boolean>);

        const responseData = {
            downloadedTrackIds,
            recentDownloads: recentDownloads.length
        };

        // Salvar no cache com TTL reduzido
        downloadCache.set(cacheKey, { data: responseData, timestamp: Date.now() });

        // Limpar cache antigo mais agressivamente (manter apenas os últimos 50 itens)
        if (downloadCache.size > 50) {
            const entries = Array.from(downloadCache.entries());
            entries.sort((a, b) => b[1].timestamp - a[1].timestamp);
            entries.slice(50).forEach(([key]) => downloadCache.delete(key));
        }

        return NextResponse.json(responseData);

    } catch (error) {
        console.error('Erro ao verificar downloads:', error);

        // Tratamento de erro otimizado
        if (error instanceof Error) {
            if (error.message.includes('timeout') || error.message.includes('aborted')) {
                return NextResponse.json({
                    error: 'Timeout na consulta. Tente novamente.',
                    code: 'TIMEOUT'
                }, { status: 408 });
            }
        }

        return NextResponse.json({
            error: 'Erro interno do servidor',
            code: 'INTERNAL_ERROR'
        }, { status: 500 });
    }
}
