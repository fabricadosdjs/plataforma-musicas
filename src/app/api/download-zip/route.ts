import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import prisma from '@/lib/prisma';
import archiver from 'archiver';
import { Readable } from 'stream';

export const runtime = 'edge';
export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
        return new Response(JSON.stringify({ error: 'Não autorizado' }), { status: 401 });
    }

    const { trackIds, filename } = await request.json();
    if (!trackIds || !Array.isArray(trackIds) || trackIds.length === 0) {
        return new Response(JSON.stringify({ error: 'IDs de músicas inválidos' }), { status: 400 });
    }

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
        return new Response(JSON.stringify({ error: 'Nenhuma música encontrada' }), { status: 404 });
    }

    // Streaming ZIP direto para o cliente
    const archive = archiver('zip', { zlib: { level: 6 } });
    const { readable, writable } = new TransformStream();
    const writer = writable.getWriter();

    archive.on('data', (chunk) => {
        writer.write(chunk);
    });
    archive.on('end', () => {
        writer.close();
    });
    archive.on('error', (err) => {
        writer.abort(err);
    });

    // Função utilitária para fetch com timeout e retry
    async function fetchWithRetry(url: string, options: any = {}, retries = 2, timeoutMs = 20000): Promise<Response | null> {
        for (let attempt = 0; attempt <= retries; attempt++) {
            try {
                const controller = new AbortController();
                const timeout = setTimeout(() => controller.abort(), timeoutMs);
                const response = await fetch(url, { ...options, signal: controller.signal });
                clearTimeout(timeout);
                if (response.ok) return response;
            } catch (err) {
                if (attempt === retries) return null;
            }
        }
        return null;
    }


    let aborted = false;
    // Detecta desconexão do cliente
    if (request.signal) {
        request.signal.addEventListener('abort', () => {
            aborted = true;
            try { archive.abort(); } catch { }
            try { writer.abort('Client aborted'); } catch { }
        });
    }

    // Download paralelo com limite de concorrência
    async function processTracksParallel(tracks: string | any[], concurrency = 5) {
        let idx = 0;
        async function worker() {
            while (true) {
                if (aborted) return;
                const i = idx++;
                if (i >= tracks.length) return;
                const track = tracks[i];
                try {
                    const styleFolder = (track.style || 'Sem Estilo').replace(/[<>:"/\\|?*]/g, '_').toUpperCase();
                    const fileName = `${track.artist} - ${track.songName}.mp3`;
                    const audioResponse = await fetchWithRetry(track.downloadUrl);
                    if (audioResponse && audioResponse.ok && audioResponse.body) {
                        const nodeStream = Readable.fromWeb(audioResponse.body as any);
                        archive.append(nodeStream, { name: `${styleFolder}/${fileName}` });
                    } else {
                        const placeholder = `Música indisponível para download.\nID: ${track.id}\nNome: ${track.songName}\nArtista: ${track.artist}`;
                        archive.append(placeholder, { name: `${styleFolder}/${track.artist} - ${track.songName} (indisponível).txt` });
                    }
                } catch {
                    // erro ao baixar música
                }
            }
        }
        // Inicia workers concorrentes
        await Promise.all(Array(concurrency).fill(0).map(worker));
    }

    (async () => {
        await processTracksParallel(tracks, 5); // 5 downloads em paralelo
        if (!aborted) {
            await archive.finalize();
        }
    })();

    // Registrar downloads no banco (não aguarda)
    const userId = (session as any).user.id;
    tracks.forEach((track: any) => {
        prisma.download.create({
            data: {
                trackId: track.id,
                userId: userId,
                downloadedAt: new Date(),
            },
        }).catch(() => { });
    });

    return new Response(readable, {
        headers: {
            'Content-Type': 'application/zip',
            'Content-Disposition': `attachment; filename="${filename || 'nexor-records.zip'}"`,
            'Cache-Control': 'no-cache',
        }
    });
}
