// src/app/api/downloads/batch-control/route.ts
import { authOptions } from '@/lib/authOptions';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
        }

        const { trackIds } = await request.json();

        if (!trackIds || !Array.isArray(trackIds) || trackIds.length === 0) {
            return NextResponse.json({ error: 'trackIds é obrigatório e deve ser um array' }, { status: 400 });
        }

        // Limitar a 50 tracks por vez para evitar sobrecarga
        if (trackIds.length > 50) {
            return NextResponse.json({ error: 'Máximo 50 tracks por requisição' }, { status: 400 });
        }

        // Verificar se é um usuário admin especial (não precisa de controle de download)
        if (session.user.id === 'admin-nextor-001' || (session.user as any).benefits?.adminAccess) {
            const result: Record<number, any> = {};
            trackIds.forEach(trackId => {
                result[trackId] = {
                    canDownload: true,
                    hasDownloaded: false,
                    nextAllowedDownload: null,
                    isAdmin: true
                };
            });
            return NextResponse.json(result);
        }

        // Verificar se o userId é válido (UUID ou CUID)
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
        const cuidRegex = /^[a-z0-9]{25}$/i;

        if (!uuidRegex.test(session.user.id) && !cuidRegex.test(session.user.id)) {
            console.error('ID de usuário inválido detectado:', session.user.id);
            return NextResponse.json({ error: 'ID de usuário inválido' }, { status: 400 });
        }

        // Buscar todos os downloads do usuário para os tracks solicitados
        const downloads = await prisma.download.findMany({
            where: {
                userId: session.user.id,
                trackId: { in: trackIds.map(id => parseInt(id)) }
            },
            orderBy: {
                downloadedAt: 'desc'
            }
        });

        // Mapear downloads por trackId (pegar apenas o mais recente de cada track)
        const downloadMap = new Map();
        downloads.forEach(download => {
            if (!downloadMap.has(download.trackId)) {
                downloadMap.set(download.trackId, download);
            }
        });

        // Criar resultado para cada track
        const result: Record<number, any> = {};
        trackIds.forEach(trackId => {
            const download = downloadMap.get(parseInt(trackId));
            const canDownload = !download ||
                !download.nextAllowedDownload ||
                new Date() >= download.nextAllowedDownload;

            result[trackId] = {
                canDownload,
                hasDownloaded: !!download,
                nextAllowedDownload: download?.nextAllowedDownload
            };
        });

        return NextResponse.json(result);

    } catch (error) {
        console.error('Erro ao verificar controle de download em lote:', error);

        // Retornar resposta padrão em caso de erro para não quebrar a interface
        const trackIds = (await request.json().catch(() => ({ trackIds: [] }))).trackIds || [];
        const result: Record<number, any> = {};
        trackIds.forEach((trackId: number) => {
            result[trackId] = {
                canDownload: true,
                hasDownloaded: false,
                nextAllowedDownload: null,
                error: 'Erro interno - usando valores padrão'
            };
        });

        return NextResponse.json(result, { status: 200 });
    }
}
