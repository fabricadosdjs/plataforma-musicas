import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import { prisma } from '@/lib/prisma';

export const runtime = 'nodejs';

interface SyncRequest {
    events: Array<{
        trackId: number;
        timestamp: number;
        type: 'download' | 'play' | 'like' | 'unlike';
        metadata?: {
            duration?: number;
            source?: string;
            userAgent?: string;
            sessionId?: string;
        };
    }>;
    sessionId: string;
    timestamp: number;
}

export async function POST(request: NextRequest) {
    try {
        // Verificar autenticação
        const session = await getServerSession(authOptions);
        if (!session?.user?.email) {
            return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
        }

        const body: SyncRequest = await request.json();
        const { events, sessionId } = body;

        if (!Array.isArray(events) || events.length === 0) {
            return NextResponse.json({ error: 'Dados inválidos' }, { status: 400 });
        }

        console.log(`🔄 Sincronizando ${events.length} eventos para usuário ${session.user.email}`);

        // Processar eventos em lotes para eficiência
        const batchSize = 50;
        let processedCount = 0;
        let errorCount = 0;

        for (let i = 0; i < events.length; i += batchSize) {
            const batch = events.slice(i, i + batchSize);

            try {
                await processEventBatch(batch, session.user.email, sessionId);
                processedCount += batch.length;
            } catch (error) {
                console.error(`❌ Erro ao processar lote ${Math.floor(i / batchSize) + 1}:`, error);
                errorCount += batch.length;
            }
        }

        // Retornar resultado da sincronização
        const result = {
            success: true,
            processed: processedCount,
            errors: errorCount,
            total: events.length,
            timestamp: Date.now()
        };

        console.log(`✅ Sincronização concluída: ${processedCount} processados, ${errorCount} erros`);

        return NextResponse.json(result);

    } catch (error) {
        console.error('❌ Erro na sincronização:', error);
        return NextResponse.json(
            { error: 'Erro interno do servidor' },
            { status: 500 }
        );
    }
}

/**
 * Processa um lote de eventos
 */
async function processEventBatch(
    events: SyncRequest['events'],
    userEmail: string,
    sessionId: string
): Promise<void> {
    // Buscar usuário
    const user = await prisma.user.findUnique({
        where: { email: userEmail },
        select: { id: true, email: true }
    });

    if (!user) {
        throw new Error(`Usuário não encontrado: ${userEmail}`);
    }

    // Agrupar eventos por tipo para processamento eficiente
    const downloads = events.filter(e => e.type === 'download');
    const plays = events.filter(e => e.type === 'play');
    const likes = events.filter(e => e.type === 'like');
    const unlikes = events.filter(e => e.type === 'unlike');

    // Processar downloads
    if (downloads.length > 0) {
        await processDownloads(downloads, user.id, sessionId);
    }

    // Processar plays
    if (plays.length > 0) {
        await processPlays(plays, user.id, sessionId);
    }

    // Processar likes/unlikes
    if (likes.length > 0 || unlikes.length > 0) {
        await processLikes(likes, unlikes, user.id, sessionId);
    }
}

/**
 * Processa eventos de download
 */
async function processDownloads(
    downloads: SyncRequest['events'],
    userId: string,
    sessionId: string
): Promise<void> {
    const downloadData = downloads.map(event => ({
        userId,
        trackId: event.trackId,
        sessionId: event.metadata?.sessionId || sessionId,
        source: event.metadata?.source || 'unknown',
        userAgent: event.metadata?.userAgent || 'unknown',
        timestamp: new Date(event.timestamp),
        createdAt: new Date()
    }));

    // Usar upsert para evitar duplicatas
    for (const download of downloadData) {
        await prisma.download.upsert({
            where: {
                userId_trackId: {
                    userId: download.userId,
                    trackId: download.trackId
                }
            },
            update: {
                sessionId: download.sessionId,
                source: download.source,
                userAgent: download.userAgent,
                timestamp: download.timestamp,
                updatedAt: new Date()
            },
            create: download
        });
    }

    console.log(`📥 ${downloads.length} downloads processados`);
}

/**
 * Processa eventos de play
 */
async function processPlays(
    plays: SyncRequest['events'],
    userId: string,
    sessionId: string
): Promise<void> {
    const playData = plays.map(event => ({
        userId,
        trackId: event.trackId,
        sessionId: event.metadata?.sessionId || sessionId,
        duration: event.metadata?.duration || 0,
        source: event.metadata?.source || 'unknown',
        userAgent: event.metadata?.userAgent || 'unknown',
        timestamp: new Date(event.timestamp),
        createdAt: new Date()
    }));

    // Inserir plays (pode ter múltiplos plays da mesma música)
    await prisma.play.createMany({
        data: playData,
        skipDuplicates: false // Permitir múltiplos plays
    });

    console.log(`🎵 ${plays.length} plays processados`);
}

/**
 * Processa eventos de like/unlike
 */
async function processLikes(
    likes: SyncRequest['events'],
    unlikes: SyncRequest['events'],
    userId: string,
    sessionId: string
): Promise<void> {
    // Processar likes
    if (likes.length > 0) {
        const likeData = likes.map(event => ({
            userId,
            trackId: event.trackId,
            sessionId: event.metadata?.sessionId || sessionId,
            source: event.metadata?.source || 'unknown',
            userAgent: event.metadata?.userAgent || 'unknown',
            timestamp: new Date(event.timestamp),
            createdAt: new Date()
        }));

        // Usar upsert para evitar duplicatas
        for (const like of likeData) {
            await prisma.like.upsert({
                where: {
                    trackId_userId: {
                        trackId: like.trackId,
                        userId: like.userId
                    }
                },
                update: {
                    sessionId: like.sessionId,
                    source: like.source,
                    userAgent: like.userAgent,
                    timestamp: like.timestamp,
                    updatedAt: new Date()
                },
                create: like
            });
        }

        console.log(`❤️ ${likes.length} likes processados`);
    }

    // Processar unlikes
    if (unlikes.length > 0) {
        const unlikeTrackIds = unlikes.map(event => event.trackId);

        // Remover likes
        await prisma.like.deleteMany({
            where: {
                userId,
                trackId: { in: unlikeTrackIds }
            }
        });

        console.log(`💔 ${unlikes.length} unlikes processados`);
    }
}

/**
 * Endpoint GET para verificar status da sincronização
 */
export async function GET(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.email) {
            return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
        }

        // Buscar estatísticas do usuário
        const user = await prisma.user.findUnique({
            where: { email: session.user.email },
            select: { id: true }
        });

        if (!user) {
            return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 });
        }

        // Contar eventos do usuário
        const [downloads, plays, likes] = await Promise.all([
            prisma.download.count({ where: { userId: user.id } }),
            prisma.play.count({ where: { userId: user.id } }),
            prisma.like.count({ where: { userId: user.id } })
        ]);

        return NextResponse.json({
            success: true,
            stats: {
                downloads,
                plays,
                likes,
                total: downloads + plays + likes
            },
            timestamp: Date.now()
        });

    } catch (error) {
        console.error('❌ Erro ao buscar estatísticas:', error);
        return NextResponse.json(
            { error: 'Erro interno do servidor' },
            { status: 500 }
        );
    }
}



