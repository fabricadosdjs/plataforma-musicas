import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import prisma from '@/lib/prisma';
import archiver, { ArchiverError } from 'archiver';
import { createWriteStream } from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';
import crypto from 'crypto';
import { Readable } from 'stream';

export const runtime = 'edge';
export const dynamic = 'force-dynamic';

// Registro global de arquivos temporários e limpeza periódica
type ZipTempEntry = { path: string; createdAt: number; filename: string };
// @ts-ignore
globalThis.__ZIP_TEMP_REGISTRY__ = (globalThis.__ZIP_TEMP_REGISTRY__ as Map<string, ZipTempEntry>) || new Map<string, ZipTempEntry>();
// @ts-ignore
if (!globalThis.__ZIP_CLEANUP_TIMER__) {
    // @ts-ignore
    globalThis.__ZIP_CLEANUP_TIMER__ = setInterval(() => {
        try {
            // @ts-ignore
            const registry: Map<string, ZipTempEntry> = globalThis.__ZIP_TEMP_REGISTRY__;
            const now = Date.now();
            const TTL_MS = 30 * 60 * 1000; // 30 minutos
            for (const [token, entry] of registry.entries()) {
                if (now - entry.createdAt > TTL_MS) {
                    try {
                        // fs.unlinkSync pode falhar; ignorar erros
                        require('fs').unlinkSync(entry.path);
                    } catch { }
                    registry.delete(token);
                }
            }
        } catch (e) {
            console.warn('⚠️ Erro durante limpeza de tokens ZIP:', e);
        }
    }, 5 * 60 * 1000); // a cada 5 minutos
}

function withCorsHeaders(headers: Record<string, string> = {}) {
    return {
        ...headers,
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    };
}

export async function OPTIONS() {
    return new NextResponse(null, { status: 204, headers: withCorsHeaders() });
}

export async function GET(request: NextRequest) {
    try {
        console.log('🔍 API ZIP (archiver) chamada');
        const session = await getServerSession(authOptions);

        if (!session) {
            console.log('❌ Usuário não autenticado');
            return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
        }

        console.log('✅ Usuário autenticado:', session.user.email);

        const { searchParams } = new URL(request.url);
        const dataParam = searchParams.get('data');

        if (!dataParam) {
            return NextResponse.json({ error: 'Dados não fornecidos' }, { status: 400 });
        }

        const { trackIds, filename } = JSON.parse(decodeURIComponent(dataParam)) as { trackIds: number[]; filename?: string };

        console.log('📋 Dados recebidos:', { trackIds, filename });

        if (!trackIds || !Array.isArray(trackIds) || trackIds.length === 0) {
            console.log('❌ IDs de músicas inválidos');
            return NextResponse.json({ error: 'IDs de músicas inválidos' }, { status: 400 });
        }

        // Buscar as músicas no banco de dados
        const tracks = await prisma.track.findMany({
            where: { id: { in: trackIds } },
            select: {
                id: true,
                songName: true,
                artist: true,
                style: true,
                downloadUrl: true,
            }
        });

        if (tracks.length === 0) {
            return NextResponse.json({ error: 'Nenhuma música encontrada' }, { status: 404 });
        }

        // Criar stream de resposta (SSE)
        const encoder = new TextEncoder();
        const stream = new ReadableStream({
            async start(controller) {
                try {
                    // Início do progresso
                    controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'start', total: tracks.length })}\n\n`));

                    const sanitize = (name: string) => (name || 'Desconhecido')
                        .replace(/[\\/:*?"<>|]/g, ' ')
                        .replace(/\s+/g, ' ')
                        .trim();

                    const totalTracks = tracks.length;
                    let processedTracks = 0;
                    const startTime = Date.now();

                    // Preparar archiver (streaming para arquivo temporário)
                    // Nível 6 acelera a geração com boa compressão
                    const archive = archiver('zip', { zlib: { level: 6 } });
                    const tempFilePath = join(tmpdir(), `nexor-records-${Date.now()}-${Math.random().toString(36).slice(2)}.zip`);
                    const fileStream = createWriteStream(tempFilePath);
                    fileStream.on('error', (err) => {
                        console.error('❌ Erro no arquivo temporário do ZIP:', err);
                    });
                    archive.on('warning', (err: ArchiverError) => {
                        console.warn('⚠️ Aviso do archiver:', err);
                    });
                    archive.on('error', (err: ArchiverError) => {
                        console.error('❌ Erro no archiver:', err);
                    });
                    archive.pipe(fileStream);

                    for (let i = 0; i < tracks.length; i++) {
                        const currentTrack = tracks[i];
                        try {
                            // Buscar o arquivo de áudio
                            const audioResponse = await fetch(currentTrack.downloadUrl);
                            if (!audioResponse.ok) {
                                console.error(`Erro ao buscar áudio para ${currentTrack.songName}`);
                                const placeholder = `Música indisponível para download.\nID: ${currentTrack.id}\nNome: ${currentTrack.songName}\nArtista: ${currentTrack.artist}`;
                                const styleFolderName = sanitize(currentTrack.style || 'Sem Estilo').toUpperCase();
                                const sanitizedSongName = sanitize(currentTrack.songName);
                                const sanitizedArtist = sanitize(currentTrack.artist);
                                const fileName = `${sanitizedArtist} - ${sanitizedSongName} (indisponível).txt`;
                                archive.append(placeholder, { name: `${styleFolderName}/${fileName}` });
                            } else {
                                const styleFolderName = sanitize(currentTrack.style || 'Sem Estilo').toUpperCase();
                                const sanitizedSongName = sanitize(currentTrack.songName);
                                const sanitizedArtist = sanitize(currentTrack.artist);
                                const fileName = `${sanitizedArtist} - ${sanitizedSongName}.mp3`;

                                if (audioResponse.body) {
                                    // Stream direto sem carregar em memória
                                    const nodeStream = Readable.fromWeb(audioResponse.body as any);
                                    archive.append(nodeStream, { name: `${styleFolderName}/${fileName}` });
                                } else {
                                    // Fallback: buffer (casos raros)
                                    const audioBuffer = Buffer.from(await audioResponse.arrayBuffer());
                                    archive.append(audioBuffer, { name: `${styleFolderName}/${fileName}` });
                                }
                            }

                            processedTracks = i + 1;
                            const progress = Math.round((processedTracks / totalTracks) * 100);
                            const elapsedTime = Date.now() - startTime;
                            const estimatedTotalTime = elapsedTime * (totalTracks / Math.max(processedTracks, 1));
                            const remainingTime = Math.max(0, Math.round(estimatedTotalTime - elapsedTime));

                            controller.enqueue(encoder.encode(`data: ${JSON.stringify({
                                type: 'progress',
                                current: processedTracks,
                                total: totalTracks,
                                progress,
                                trackName: currentTrack.songName,
                                elapsedTime,
                                remainingTime
                            })}\n\n`));
                        } catch (error) {
                            console.error(`Erro ao processar ${currentTrack.songName}:`, error);
                            processedTracks = i + 1;
                            const progress = Math.round((processedTracks / totalTracks) * 100);
                            const elapsedTime = Date.now() - startTime;
                            const estimatedTotalTime = elapsedTime * (totalTracks / Math.max(processedTracks, 1));
                            const remainingTime = Math.max(0, Math.round(estimatedTotalTime - elapsedTime));
                            controller.enqueue(encoder.encode(`data: ${JSON.stringify({
                                type: 'progress',
                                current: processedTracks,
                                total: totalTracks,
                                progress,
                                trackName: currentTrack.songName,
                                elapsedTime,
                                remainingTime
                            })}\n\n`));
                        }

                        // Liberar a event loop entre arquivos para evitar travamento em lotes grandes
                        await new Promise(resolve => setTimeout(resolve, 0));
                    }

                    // Registrar downloads no banco
                    const userId = (session as any).user.id;
                    const downloadPromises = tracks.map((track: any) =>
                        prisma.download.create({
                            data: {
                                trackId: track.id,
                                userId: userId,
                                downloadedAt: new Date()
                            }
                        }).catch((error: any) => {
                            console.error(`Erro ao registrar download de ${track.songName}:`, error);
                        })
                    );
                    await Promise.all(downloadPromises);

                    controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'generating' })}\n\n`));
                    await archive.finalize();

                    await new Promise<void>((resolve, reject) => {
                        fileStream.on('finish', () => resolve());
                        fileStream.on('close', () => resolve());
                        fileStream.on('error', reject);
                    });

                    // Gerar token de download stateless (assinado)
                    const dlFilename = filename || 'nexor-records.zip';
                    const payloadObj = { path: tempFilePath, filename: dlFilename, ts: Date.now() };
                    const payload = Buffer.from(JSON.stringify(payloadObj)).toString('base64url');
                    const secret = process.env.ZIP_TOKEN_SECRET || 'dev-zip-token-secret';
                    const signature = crypto.createHmac('sha256', secret).update(payload).digest('base64url');
                    const token = `${payload}.${signature}`;

                    const completeData = {
                        type: 'complete',
                        downloadUrl: `/api/downloads/zip-temp?token=${token}`,
                        filename: dlFilename
                    };

                    controller.enqueue(encoder.encode(`data: ${JSON.stringify(completeData)}\n\n`));
                    console.log('✅ ZIP pronto para download via URL temporária');
                } catch (error) {
                    console.error('Erro ao criar ZIP:', error);
                    controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'error', message: 'Erro interno do servidor' })}\n\n`));
                } finally {
                    controller.close();
                }
            }
        });

        return new NextResponse(stream, {
            headers: withCorsHeaders({
                'Content-Type': 'text/event-stream',
                'Cache-Control': 'no-cache',
                'Connection': 'keep-alive',
            })
        });

    } catch (error) {
        console.error('Erro ao criar ZIP:', error);
        return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
    }
} 