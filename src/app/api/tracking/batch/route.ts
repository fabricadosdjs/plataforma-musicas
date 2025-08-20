import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
    try {
        const { events, batchSize, timestamp } = await request.json();

        if (!events || !Array.isArray(events) || events.length === 0) {
            return NextResponse.json(
                { error: 'Formato inválido ou eventos vazios' },
                { status: 400 }
            );
        }

        console.log(`📦 Processando lote de ${events.length} eventos...`);

        // Agrupar eventos por tipo e música para otimizar as queries
        const eventGroups = events.reduce((acc, event) => {
            const key = `${event.songId}-${event.event}`;
            if (!acc[key]) {
                acc[key] = {
                    songId: event.songId,
                    event: event.event,
                    count: 0,
                    metadata: event.metadata
                };
            }
            acc[key].count++;
            return acc;
        }, {} as Record<string, any>);

        // Processar cada grupo de eventos
        const updatePromises = Object.values(eventGroups).map(async (group) => {
            const { songId, event, count } = group;

            try {
                if (event === 'download') {
                    await prisma.track.update({
                        where: { id: songId },
                        data: {
                            downloads: {
                                increment: count
                            }
                        }
                    });
                } else if (event === 'play') {
                    await prisma.track.update({
                        where: { id: songId },
                        data: {
                            plays: {
                                increment: count
                            }
                        }
                    });
                } else if (event === 'like') {
                    await prisma.track.update({
                        where: { id: songId },
                        data: {
                            likes: {
                                increment: count
                            }
                        }
                    });
                }
                // Adicionar outros tipos de eventos conforme necessário
            } catch (error) {
                console.error(`❌ Erro ao atualizar música ${songId} para evento ${event}:`, error);
                throw error;
            }
        });

        // Executar todas as atualizações
        await Promise.all(updatePromises);

        // Registrar o lote processado (opcional)
        await prisma.trackingBatch.create({
            data: {
                batchSize,
                eventsCount: events.length,
                processedAt: new Date(),
                status: 'SUCCESS'
            }
        });

        console.log(`✅ Lote processado com sucesso: ${events.length} eventos`);

        return NextResponse.json({
            success: true,
            processedEvents: events.length,
            batchSize,
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        console.error('❌ Erro ao processar lote:', error);

        // Registrar erro do lote
        try {
            await prisma.trackingBatch.create({
                data: {
                    batchSize: 0,
                    eventsCount: 0,
                    processedAt: new Date(),
                    status: 'ERROR',
                    errorMessage: error instanceof Error ? error.message : 'Erro desconhecido'
                }
            });
        } catch (dbError) {
            console.error('❌ Erro ao registrar falha do lote:', dbError);
        }

        return NextResponse.json(
            { error: 'Erro interno do servidor' },
            { status: 500 }
        );
    }
}
