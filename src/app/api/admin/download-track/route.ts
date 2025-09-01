import prisma from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { promises as fsPromises } from 'fs';
import https from 'https';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
    try {
        // Verificar autenticação
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({ error: 'Acesso negado. Faça login para baixar músicas.' }, { status: 401 });
        }

        const { trackId } = await request.json();

        if (!trackId) {
            return NextResponse.json({ error: 'ID da música é obrigatório' }, { status: 400 });
        }

        // Buscar a música no banco
        const track = await prisma.track.findUnique({
            where: { id: parseInt(trackId) }
        });

        if (!track) {
            return NextResponse.json({ error: 'Música não encontrada' }, { status: 404 });
        }

        // Verificar se é uma URL do Contabo Storage
        if (!track.downloadUrl) {
            return NextResponse.json({ error: 'URL de download não encontrada' }, { status: 404 });
        }

        // Se for uma URL do Contabo Storage, baixar o arquivo e retornar para download forçado
        if (track.downloadUrl.startsWith('https://')) {
            try {
                console.log(`🔍 Tentando baixar: ${track.downloadUrl}`);

                // Extrair nome ORIGINAL do Contabo (mantém padrão "MÚSICA - ARTISTA")
                let originalFileName = path.basename(new URL(track.downloadUrl).pathname || '');
                try {
                    originalFileName = decodeURIComponent(originalFileName);
                } catch { }
                // Fallback seguro
                if (!originalFileName || originalFileName === '/') {
                    originalFileName = `${track.songName} - ${track.artist}.mp3`;
                }

                // Limpar caracteres especiais do nome do arquivo para compatibilidade
                const cleanFileName = originalFileName
                    .replace(/[<>:"/\\|?*]/g, '')
                    .replace(/\s+/g, ' ')
                    .trim();

                console.log(`📁 Nome contabo: ${originalFileName}`);
                console.log(`📁 Nome limpo: ${cleanFileName}`);

                // Baixar o arquivo do Contabo Storage usando https nativo
                const fileBuffer = await new Promise<Buffer>((resolve, reject) => {
                    if (!track.downloadUrl) {
                        reject(new Error('URL de download é nula'));
                        return;
                    }
                    https.get(track.downloadUrl, (response) => {
                        console.log(`📥 Resposta do Contabo: ${response.statusCode} ${response.statusMessage}`);

                        if (response.statusCode !== 200) {
                            reject(new Error(`HTTP ${response.statusCode}: ${response.statusMessage}`));
                            return;
                        }

                        const chunks: Buffer[] = [];
                        response.on('data', (chunk) => chunks.push(chunk));
                        response.on('end', () => {
                            const buffer = Buffer.concat(chunks);
                            console.log(`✅ Arquivo baixado com sucesso: ${buffer.length} bytes`);
                            resolve(buffer);
                        });
                        response.on('error', reject);
                    }).on('error', reject);
                });

                // Retornar o arquivo para download forçado
                const response = new Response(new Uint8Array(fileBuffer), {
                    headers: {
                        'Content-Type': 'audio/mpeg',
                        'Content-Disposition': `attachment; filename="${cleanFileName}"; filename*=UTF-8''${encodeURIComponent(cleanFileName)}`,
                        'Content-Length': fileBuffer.length.toString(),
                        'Cache-Control': 'no-cache',
                        'Pragma': 'no-cache',
                    },
                });

                return response;
            } catch (error: any) {
                console.error('[DOWNLOAD_FROM_CONTABO_ERROR]', error);
                const message = error?.message || 'Erro ao baixar arquivo do Contabo Storage';
                return NextResponse.json({ error: message }, { status: 502 });
            }
        }

        // Se for um caminho local (fallback)
        if (fs.existsSync(track.downloadUrl)) {
            const fileBuffer = fs.readFileSync(track.downloadUrl);
            let originalFileName = path.basename(track.downloadUrl);
            try { originalFileName = decodeURIComponent(originalFileName); } catch { }
            if (!originalFileName) originalFileName = `${track.songName} - ${track.artist}.mp3`;

            const cleanFileName = originalFileName
                .replace(/[<>:"/\\|?*]/g, '')
                .replace(/\s+/g, ' ')
                .trim();

            return new NextResponse(fileBuffer, {
                headers: {
                    'Content-Type': 'audio/mpeg',
                    'Content-Disposition': `attachment; filename="${cleanFileName}"; filename*=UTF-8''${encodeURIComponent(cleanFileName)}`,
                    'Content-Length': fileBuffer.length.toString(),
                    'Cache-Control': 'no-cache',
                    'Pragma': 'no-cache',
                },
            });
        }

        return NextResponse.json({ error: 'Arquivo não encontrado' }, { status: 404 });

    } catch (error) {
        console.error('[DOWNLOAD_TRACK_ERROR]', error);
        return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
    }
}
