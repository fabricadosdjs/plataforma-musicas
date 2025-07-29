import { authOptions } from '@/lib/authOptions';
import prisma from '@/lib/prisma';
import { GetObjectCommand, S3Client } from '@aws-sdk/client-s3';
import JSZip from 'jszip';
import { getServerSession } from 'next-auth/next';
import { NextRequest, NextResponse } from 'next/server';

// Configuração S3 (ajuste para Contabo)
const s3 = new S3Client({
    region: process.env.S3_REGION,
    endpoint: process.env.S3_ENDPOINT,
    credentials: {
        accessKeyId: process.env.S3_ACCESS_KEY!,
        secretAccessKey: process.env.S3_SECRET_KEY!,
    },
    forcePathStyle: true,
});
const BUCKET = process.env.S3_BUCKET;

export async function POST(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !session.user) {
            return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
        }
        const { trackIds, userId } = await req.json();
        if (!Array.isArray(trackIds) || trackIds.length === 0) {
            return NextResponse.json({ error: 'Nenhuma música selecionada' }, { status: 400 });
        }
        // Buscar infos das músicas
        const tracks = await prisma.track.findMany({
            where: { id: { in: trackIds } },
        });
        if (!tracks.length) {
            return NextResponse.json({ error: 'Músicas não encontradas' }, { status: 404 });
        }
        // Gerar ZIP
        const zip = new JSZip();
        // Função para extrair o key do S3 a partir da downloadUrl
        function extractS3KeyFromUrl(url: string): string | null {
            if (!url) return null;
            // Exemplo: https://usc1.contabostorage.com/bucket-name/key.mp3
            try {
                const u = new URL(url);
                // Remove o /bucket-name/ do pathname
                const parts = u.pathname.split('/');
                // parts[0] = '', parts[1] = bucket, parts[2...] = key
                if (parts.length < 3) return null;
                return parts.slice(2).join('/');
            } catch {
                return null;
            }
        }

        for (const track of tracks) {
            const key = extractS3KeyFromUrl(track.downloadUrl);
            if (!key) continue;
            try {
                const s3Obj = await s3.send(new GetObjectCommand({
                    Bucket: BUCKET,
                    Key: key,
                }));
                if (s3Obj.Body && typeof s3Obj.Body.transformToByteArray === 'function') {
                    const arrayBuffer = await s3Obj.Body.transformToByteArray();
                    zip.file(`${track.artist} - ${track.songName}.mp3`, arrayBuffer);
                }
            } catch (err) {
                // Ignorar erro individual
            }
        }
        const zipBuffer = await zip.generateAsync({ type: 'nodebuffer' });
        // Salvar ZIP temporário (pode ser em memória ou S3, aqui em memória)
        // Alternativamente, pode-se servir o buffer diretamente
        // Marcar todas como baixadas
        await prisma.download.createMany({
            data: trackIds.map(id => ({
                userId: session.user.id,
                trackId: id,
                downloadedAt: new Date(),
            })),
            skipDuplicates: true,
        });
        // Retornar ZIP como download
        return new Response(zipBuffer, {
            status: 200,
            headers: {
                'Content-Type': 'application/zip',
                'Content-Disposition': 'attachment; filename=musicas.zip',
            },
        });
    } catch (err) {
        return NextResponse.json({ error: 'Erro ao gerar ZIP' }, { status: 500 });
    }
}
