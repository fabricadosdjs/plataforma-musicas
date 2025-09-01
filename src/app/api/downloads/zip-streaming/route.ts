import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
    try {
        // Verificar autenticação
        const session = await getServerSession(authOptions);
        if (!session?.user) {
            return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
        }

        const { trackIds, filename, sessionId, batchIndex, totalBatches } = await request.json();

        if (!trackIds || !Array.isArray(trackIds) || trackIds.length === 0) {
            return NextResponse.json({ error: 'IDs de músicas inválidos' }, { status: 400 });
        }

        console.log(`🚀 Iniciando streaming de músicas - Lote ${batchIndex}/${totalBatches} - ${trackIds.length} músicas`);

        // Configurar streaming response
        const encoder = new TextEncoder();
        const stream = new ReadableStream({
            async start(controller) {
                try {
                    // Buscar informações das músicas
                    const tracks = await prisma.track.findMany({
                        where: { id: { in: trackIds } },
                        select: {
                            id: true,
                            songName: true,
                            artist: true,
                            style: true,
                            downloadUrl: true,
                            imageUrl: true
                        }
                    });

                    if (tracks.length === 0) {
                        controller.enqueue(encoder.encode(JSON.stringify({
                            type: 'error',
                            message: 'Nenhuma música encontrada'
                        }) + '\n'));
                        controller.close();
                        return;
                    }

                    console.log(`📦 Enviando ${tracks.length} músicas para processamento no navegador`);

                    let processedTracks = 0;
                    const startTime = Date.now();

                    // Enviar cada música individualmente para o navegador processar
                    for (const track of tracks) {
                        try {
                            console.log(`📥 Enviando: ${track.songName} - ${track.artist}`);

                            if (track.downloadUrl && track.downloadUrl.trim() !== '') {
                                try {
                                    // Fazer download da música no servidor
                                    console.log(`🌐 Fazendo download de: ${track.downloadUrl}`);

                                    const musicResponse = await fetch(track.downloadUrl);
                                    if (musicResponse.ok) {
                                        const musicBuffer = await musicResponse.arrayBuffer();
                                        const musicBase64 = Buffer.from(musicBuffer).toString('base64');

                                        // Enviar música para o navegador processar
                                        controller.enqueue(encoder.encode(JSON.stringify({
                                            type: 'track_data',
                                            batchIndex,
                                            trackId: track.id,
                                            songName: track.songName,
                                            artist: track.artist,
                                            style: track.style,
                                            fileName: `${track.artist} - ${track.songName}.mp3`,
                                            data: musicBase64,
                                            size: musicBuffer.byteLength,
                                            isAudio: true
                                        }) + '\n'));

                                        console.log(`✅ Música enviada: ${track.songName} (${(musicBuffer.byteLength / 1024 / 1024).toFixed(2)} MB)`);
                                    } else {
                                        throw new Error(`HTTP ${musicResponse.status}: ${musicResponse.statusText}`);
                                    }
                                } catch (downloadError) {
                                    console.warn(`⚠️ Erro no download, enviando metadados: ${downloadError}`);

                                    // Enviar apenas metadados se download falhar
                                    controller.enqueue(encoder.encode(JSON.stringify({
                                        type: 'track_metadata',
                                        batchIndex,
                                        trackId: track.id,
                                        songName: track.songName,
                                        artist: track.artist,
                                        style: track.style,
                                        fileName: `${track.artist} - ${track.songName}.json`,
                                        metadata: {
                                            songName: track.songName,
                                            artist: track.artist,
                                            style: track.style,
                                            id: track.id,
                                            note: 'Música não disponível para download',
                                            error: downloadError instanceof Error ? downloadError.message : String(downloadError)
                                        },
                                        isAudio: false
                                    }) + '\n'));
                                }
                            } else {
                                // Se não tiver URL, enviar apenas metadados
                                controller.enqueue(encoder.encode(JSON.stringify({
                                    type: 'track_metadata',
                                    batchIndex,
                                    trackId: track.id,
                                    songName: track.songName,
                                    artist: track.artist,
                                    style: track.style,
                                    fileName: `${track.artist} - ${track.songName}.json`,
                                    metadata: {
                                        songName: track.songName,
                                        artist: track.artist,
                                        style: track.style,
                                        id: track.id,
                                        note: 'Arquivo de metadados - música não disponível para download'
                                    },
                                    isAudio: false
                                }) + '\n'));

                                console.log(`📋 Metadados enviados: ${track.songName}`);
                            }

                            processedTracks++;
                            const progress = Math.round((processedTracks / tracks.length) * 100);
                            const elapsedTime = Math.round((Date.now() - startTime) / 1000);
                            const remainingTime = Math.round((elapsedTime / processedTracks) * (tracks.length - processedTracks));

                            // Enviar progresso via streaming
                            controller.enqueue(encoder.encode(JSON.stringify({
                                type: 'progress',
                                current: processedTracks,
                                total: tracks.length,
                                progress,
                                trackName: track.songName,
                                elapsedTime,
                                remainingTime
                            }) + '\n'));

                        } catch (trackError) {
                            console.error(`❌ Erro ao processar música ${track.songName}:`, trackError);
                            // Continuar com próxima música
                        }
                    }

                    // Enviar sinal de que todas as músicas foram enviadas
                    controller.enqueue(encoder.encode(JSON.stringify({
                        type: 'tracks_complete',
                        batchIndex,
                        totalBatches,
                        totalTracks: tracks.length,
                        message: `Todas as ${tracks.length} músicas foram enviadas para processamento no navegador`
                    }) + '\n'));

                    controller.close();
                } catch (error) {
                    console.error('❌ Erro no streaming de músicas:', error);
                    controller.enqueue(encoder.encode(JSON.stringify({
                        type: 'error',
                        message: 'Erro interno no servidor'
                    }) + '\n'));
                    controller.close();
                }
            }
        });

        // Retornar resposta de streaming
        return new Response(stream, {
            headers: {
                'Content-Type': 'text/plain; charset=utf-8',
                'Cache-Control': 'no-cache',
                'Connection': 'keep-alive',
                'Transfer-Encoding': 'chunked'
            }
        });

    } catch (error) {
        console.error('❌ Erro na API de streaming de músicas:', error);
        return NextResponse.json({ error: 'Erro interno no servidor' }, { status: 500 });
    }
}
