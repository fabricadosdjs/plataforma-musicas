import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import prisma from '@/lib/prisma';
import archiver from 'archiver';
import { Readable } from 'stream';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {

    // ...existing code...
    // ...existing code...
    // Diagnóstico: logar tracks recebidas
    const { trackIds, filename } = await request.json();
    console.log('[API /download-zip] trackIds recebidos:', trackIds);
    const session = await getServerSession(authOptions);
    if (!session?.user) {
        return new Response(JSON.stringify({ error: 'Não autorizado' }), { status: 401 });
    }

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
    console.log(`[API /download-zip] tracks encontrados no banco: ${tracks.length}`);
    if (tracks.length > 0) {
        console.log('[API /download-zip] Exemplos de tracks:', tracks.slice(0, 3));
    }

    // Tracks não encontradas (após buscar tracks)
    const notFoundIds: any[] = trackIds.filter((id: any) => !tracks.some((t: any) => t.id === id));
    let notFoundText = '';
    if (notFoundIds.length > 0) {
        notFoundText = 'Músicas não encontradas no banco de dados:\n';
        notFoundIds.forEach((id: any) => {
            notFoundText += `ID: ${id} - Motivo: Não encontrada no banco\n`;
        });
    }
    if (!tracks || tracks.length === 0) {
        console.log('[API /download-zip] Nenhuma música encontrada para baixar. Retornando 404.');
        return new Response(JSON.stringify({ error: 'Nenhuma música encontrada para baixar' }), { status: 404 });
    }
    if (tracks.length < trackIds.length) {
        console.log(`[API /download-zip] Atenção: ${trackIds.length - tracks.length} músicas não encontradas, mas gerando ZIP com as restantes.`);
    }

    // Streaming ZIP direto para o cliente
    const archive = archiver('zip', { zlib: { level: 6 } });
    const { readable, writable } = new TransformStream();
    const writer = writable.getWriter();

    let zipHasContent = false;

    archive.on('data', (chunk) => {
        zipHasContent = true;
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
                    // Pasta principal: nome do artista (ou "Sem Artista" se não houver)
                    const mainFolder = (track.artist || 'Sem Artista').replace(/[<>:"/\\|?*]/g, '_').toUpperCase();
                    // Subpasta: estilo
                    const styleFolder = (track.style || 'Sem Estilo').replace(/[<>:"/\\|?*]/g, '_').toUpperCase();
                    const fileName = `${track.artist} - ${track.songName}.mp3`;
                    const audioResponse = await fetchWithRetry(track.downloadUrl);
                    if (audioResponse && audioResponse.ok && audioResponse.body) {
                        const nodeStream = Readable.fromWeb(audioResponse.body as any);
                        archive.append(nodeStream, { name: `${mainFolder}/${styleFolder}/${fileName}` });
                    } else {
                        const placeholder = `Música indisponível para download.\nID: ${track.id}\nNome: ${track.songName}\nArtista: ${track.artist}`;
                        archive.append(placeholder, { name: `${mainFolder}/${styleFolder}/${track.artist} - ${track.songName} (indisponível).txt` });
                    }
                } catch {
                    // erro ao baixar música
                }
            }
        }
        // Inicia workers concorrentes
        await Promise.all(Array(concurrency).fill(0).map(worker));

        // Sempre adiciona o .txt ao ZIP se houver tracks não encontradas
        if (notFoundText) {
            archive.append(notFoundText, { name: 'MUSICAS_NAO_ENCONTRADAS.txt' });
        }
        // Se não houver nenhuma música baixada com sucesso, adiciona um placeholder para evitar ZIP vazio
        if (!zipHasContent) {
            archive.append('Nenhuma música pôde ser baixada. Veja o arquivo de erros.', { name: 'README.txt' });
        }
    }

    (async () => {
        await processTracksParallel(tracks, 5); // 5 downloads em paralelo
        if (!aborted) {
            await archive.finalize();
        }
    })();

    // Registrar downloads no banco (não aguarda) - só se houver tracks
    const userId = (session as any).user.id;
    if (tracks.length > 0) {
        tracks.forEach((track: any) => {
            prisma.download.upsert({
                where: {
                    userId_trackId: {
                        userId: userId,
                        trackId: track.id
                    }
                },
                update: {
                    downloadedAt: new Date(),
                },
                create: {
                    trackId: track.id,
                    userId: userId,
                    downloadedAt: new Date(),
                },
            }).catch(() => { });
        });
    }

    // Só retorna o ZIP se houver conteúdo
    if (!zipHasContent) {
        return new Response(JSON.stringify({ error: 'Nenhuma música válida para baixar' }), { status: 404 });
    }
    return new Response(readable, {
        headers: {
            'Content-Type': 'application/zip',
            'Content-Disposition': `attachment; filename="${filename || 'nexor-records.zip'}"`,
            'Cache-Control': 'no-cache',
        }
    });
}
