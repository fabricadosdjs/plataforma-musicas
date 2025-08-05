import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import prisma from '@/lib/prisma';
import JSZip from 'jszip';

export async function POST(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        if (!session) {
            return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
        }

        const body = await request.json();
        const { trackIds, filename } = body;

        if (!trackIds || !Array.isArray(trackIds) || trackIds.length === 0) {
            return NextResponse.json({ error: 'IDs de músicas inválidos' }, { status: 400 });
        }

        // Buscar as músicas no banco de dados
        const tracks = await prisma.track.findMany({
            where: {
                id: { in: trackIds }
            }
        });

        if (tracks.length === 0) {
            return NextResponse.json({ error: 'Nenhuma música encontrada' }, { status: 404 });
        }

        // Criar stream de resposta
        const encoder = new TextEncoder();
        const stream = new ReadableStream({
            async start(controller) {
                try {
                    // Enviar início do progresso
                    controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'start', total: tracks.length })}\n\n`));

                    // Criar ZIP
                    const zip = new JSZip();
                    const totalTracks = tracks.length;
                    let processedTracks = 0;
                    const startTime = Date.now();

                    // Adicionar cada música ao ZIP
                    for (let i = 0; i < tracks.length; i++) {
                        const track = tracks[i];

                        try {
                            // Enviar progresso atual
                            const progress = Math.round((processedTracks / totalTracks) * 100);
                            const elapsedTime = Date.now() - startTime;
                            const estimatedTotalTime = elapsedTime * (totalTracks / Math.max(processedTracks, 1));
                            const remainingTime = Math.max(0, estimatedTotalTime - elapsedTime);

                            controller.enqueue(encoder.encode(`data: ${JSON.stringify({
                                type: 'progress',
                                current: processedTracks,
                                total: totalTracks,
                                progress,
                                trackName: track.songName,
                                elapsedTime,
                                remainingTime
                            })}\n\n`));

                            // Buscar o arquivo de áudio
                            const audioResponse = await fetch(track.downloadUrl);
                            if (!audioResponse.ok) {
                                console.error(`Erro ao buscar áudio para ${track.songName}`);
                                processedTracks++;
                                continue;
                            }

                            const audioBuffer = await audioResponse.arrayBuffer();

                            // Criar nome do arquivo
                            const sanitizedSongName = track.songName.replace(/[^a-zA-Z0-9\s-]/g, '').trim();
                            const sanitizedArtist = track.artist.replace(/[^a-zA-Z0-9\s-]/g, '').trim();
                            const fileName = `${sanitizedArtist} - ${sanitizedSongName}.mp3`;

                            // Adicionar ao ZIP
                            zip.file(fileName, audioBuffer);
                            processedTracks++;
                        } catch (error) {
                            console.error(`Erro ao processar ${track.songName}:`, error);
                            processedTracks++;
                        }
                    }

                    // Enviar progresso final
                    controller.enqueue(encoder.encode(`data: ${JSON.stringify({
                        type: 'progress',
                        current: totalTracks,
                        total: totalTracks,
                        progress: 100,
                        trackName: 'Finalizando...',
                        elapsedTime: Date.now() - startTime,
                        remainingTime: 0
                    })}\n\n`));

                    // Gerar ZIP
                    controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'generating' })}\n\n`));
                    const zipBuffer = await zip.generateAsync({ type: 'nodebuffer' });

                    // Registrar downloads no banco
                    const userId = session.user.id;
                    const downloadPromises = tracks.map(track =>
                        prisma.download.create({
                            data: {
                                trackId: track.id,
                                userId: userId,
                                downloadedAt: new Date()
                            }
                        }).catch(error => {
                            console.error(`Erro ao registrar download de ${track.songName}:`, error);
                        })
                    );

                    await Promise.all(downloadPromises);

                    // Enviar dados do ZIP
                    controller.enqueue(encoder.encode(`data: ${JSON.stringify({
                        type: 'complete',
                        zipData: zipBuffer.toString('base64'),
                        filename: filename || 'nexor-records.zip'
                    })}\n\n`));

                } catch (error) {
                    console.error('Erro ao criar ZIP:', error);
                    controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'error', message: 'Erro interno do servidor' })}\n\n`));
                } finally {
                    controller.close();
                }
            }
        });

        return new NextResponse(stream, {
            headers: {
                'Content-Type': 'text/event-stream',
                'Cache-Control': 'no-cache',
                'Connection': 'keep-alive',
            }
        });

    } catch (error) {
        console.error('Erro ao criar ZIP:', error);
        return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
    }
} 