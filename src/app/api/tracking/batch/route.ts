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
        const updatePromises = Object.values(eventGroups).map(async (group: any) => {
            const { songId, event, count } = group;

            try {
                if (event === 'download') {
                    // Para downloads, criar registros individuais
                    for (let i = 0; i < count; i++) {
                        await prisma.download.create({
                            data: {
                                trackId: songId,
                                userId: '1', // Usuário padrão para tracking
                                downloadedAt: new Date()
                            }
                        });
                    }
                } else if (event === 'play') {
                    // Para plays, criar registros individuais
                    for (let i = 0; i < count; i++) {
                        await prisma.play.create({
                            data: {
                                trackId: songId,
                                userId: '1', // Usuário padrão para tracking
                                createdAt: new Date()
                            }
                        });
                    }
                } else if (event === 'like') {
                    // Para likes, criar registros individuais
                    for (let i = 0; i < count; i++) {
                        await prisma.like.create({
                            data: {
                                trackId: songId,
                                userId: '1', // Usuário padrão para tracking
                                createdAt: new Date()
                            }
                        });
                    }
                }
                // Adicionar outros tipos de eventos conforme necessário
            } catch (error) {
                console.error(`❌ Erro ao atualizar música ${songId} para evento ${event}:`, error);
                throw error;
            }
        });

        // Executar todas as atualizações
        await Promise.all(updatePromises);

        console.log(`✅ Lote processado com sucesso: ${events.length} eventos`);

        return NextResponse.json({
            success: true,
            processedEvents: events.length,
            batchSize,
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        console.error('❌ Erro ao processar lote:', error);

        // Log do erro
        console.error('❌ Erro ao processar lote:', error);

        return NextResponse.json(
            { error: 'Erro interno do servidor' },
            { status: 500 }
        );
    }
}
