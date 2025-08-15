import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
// Corrigido: importação absoluta para evitar problemas de path
import { authOptions } from '@/lib/authOptions';
// If '../../lib/authOptions' does not exist, create it with the following content:
// export const authOptions = { /* your auth options here */ };
import prisma from '../../lib/prisma';
import archiver from 'archiver';
import { Readable } from 'stream';

export const config = {
    api: {
        bodyParser: false,
    },
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') {
        res.setHeader('Allow', ['POST']);
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const session = await getServerSession(req, res, authOptions);
    if (!session?.user) {
        return res.status(401).json({ error: 'Não autorizado' });
    }

    let body = '';
    await new Promise((resolve) => {
        req.on('data', (chunk) => { body += chunk; });
        req.on('end', resolve);
    });
    let trackIds: number[] = [];
    let filename = 'nexor-records.zip';
    try {
        const parsed = JSON.parse(body);
        trackIds = parsed.trackIds;
        if (parsed.filename) filename = parsed.filename;
    } catch {
        return res.status(400).json({ error: 'Corpo da requisição inválido' });
    }
    if (!trackIds || !Array.isArray(trackIds) || trackIds.length === 0) {
        return res.status(400).json({ error: 'IDs de músicas inválidos' });
    }

    const tracks = await prisma.track.findMany({
        where: { id: { in: trackIds } },
        select: {
            id: true,
            songName: true,
            artist: true,
            style: true,
            downloadUrl: true,
        },
    });
    if (tracks.length === 0) {
        return res.status(404).json({ error: 'Nenhuma música encontrada' });
    }

    res.setHeader('Content-Type', 'application/zip');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Cache-Control', 'no-cache');

    const archive = archiver('zip', { zlib: { level: 6 } });
    archive.pipe(res);

    (async () => {
        for (const track of tracks) {
            try {
                const audioResponse = await fetch(track.downloadUrl);
                const styleFolder = (track.style || 'Sem Estilo').replace(/[<>:"/\\|?*]/g, '_').toUpperCase();
                const fileName = `${track.artist} - ${track.songName}.mp3`;
                if (audioResponse.ok && audioResponse.body) {
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
        archive.finalize();
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

    // Aguarda o término do streaming antes de finalizar a função
    await new Promise((resolve, reject) => {
        archive.on('end', resolve);
        archive.on('close', resolve);
        archive.on('error', reject);
        res.on('close', resolve);
        res.on('finish', resolve);
    });
}
