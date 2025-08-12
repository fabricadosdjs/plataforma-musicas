import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import prisma from '@/lib/prisma';
import JSZip from 'jszip';

export async function POST(request: NextRequest) {
    try {
        console.log('🔍 API ZIP chamada');
        const session = await getServerSession(authOptions);

        if (!session) {
            console.log('❌ Usuário não autenticado');
            return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
        }

        console.log('✅ Usuário autenticado:', session.user.email);

        const body = await request.json();
        const { trackIds, filename } = body;

        console.log('📋 Dados recebidos:', { trackIds, filename });

        if (!trackIds || !Array.isArray(trackIds) || trackIds.length === 0) {
            console.log('❌ IDs de músicas inválidos');
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
                    const sanitize = (name: string) => (name || 'Desconhecido')
                        .replace(/[\\/:*?"<>|]/g, ' ')
                        .replace(/\s+/g, ' ')
                        .trim();
                    const totalTracks = tracks.length;
                    let processedTracks = 0;
                    const startTime = Date.now();

                    // Adicionar cada música ao ZIP, separando por ESTILO (gênero)
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

                            // Criar pasta por estilo (gênero)
                            const styleFolderName = sanitize(track.style || 'Sem Estilo').toUpperCase();
                            const folder = zip.folder(styleFolderName);

                            // Criar nome do arquivo
                            const sanitizedSongName = sanitize(track.songName);
                            const sanitizedArtist = sanitize(track.artist);
                            const fileName = `${sanitizedArtist} - ${sanitizedSongName}.mp3`;

                            // Adicionar ao ZIP dentro da pasta do estilo
                            folder?.file(fileName, audioBuffer);
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
                    console.log('📦 ZIP gerado com sucesso, tamanho:', zipBuffer.length, 'bytes');

                    // Verificar se o ZIP não está vazio
                    if (zipBuffer.length === 0) {
                        controller.enqueue(encoder.encode(`data: ${JSON.stringify({
                            type: 'error',
                            message: 'ZIP vazio - nenhum arquivo foi processado'
                        })}\n\n`));
                        return;
                    }

                    const zipData = zipBuffer.toString('base64');
                    const completeData = {
                        type: 'complete',
                        zipData: zipData,
                        filename: filename || 'nexor-records.zip'
                    };

                    controller.enqueue(encoder.encode(`data: ${JSON.stringify(completeData)}\n\n`));
                    console.log('✅ Dados do ZIP enviados para o cliente');

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