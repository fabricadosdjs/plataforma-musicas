import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import ytdl from '@distube/ytdl-core';
import fs from 'fs';
import path from 'path';

export async function POST(req: NextRequest) {
    try {
        // Verificar autenticação
        const session = await getServerSession(authOptions);
        if (!session?.user?.email) {
            return NextResponse.json({ error: 'Usuário não autenticado' }, { status: 401 });
        }

        const { url, title } = await req.json();

        if (!url) {
            return NextResponse.json({ error: 'URL do YouTube é obrigatória' }, { status: 400 });
        }

        // Validar URL do YouTube
        if (!ytdl.validateURL(url)) {
            return NextResponse.json({ error: 'URL do YouTube inválida' }, { status: 400 });
        }

        // Obter informações do vídeo
        let videoInfo;
        try {
            videoInfo = await ytdl.getInfo(url);
        } catch (error) {
            console.error('Erro ao obter informações do vídeo:', error);
            return NextResponse.json({
                error: 'Não foi possível obter informações do vídeo. Tente novamente.'
            }, { status: 400 });
        }

        const videoTitle = title || videoInfo.videoDetails.title;

        // Sanitizar nome do arquivo
        const sanitizedTitle = videoTitle
            .replace(/[^\w\s-]/g, '')
            .replace(/\s+/g, '_')
            .substring(0, 50);

        // Criar pasta de downloads se não existir
        const downloadsDir = path.join(process.cwd(), 'downloads');
        if (!fs.existsSync(downloadsDir)) {
            fs.mkdirSync(downloadsDir, { recursive: true });
        }

        // Nome do arquivo
        const fileName = `${sanitizedTitle}.mp3`;
        const filePath = path.join(downloadsDir, fileName);

        // Stream de áudio
        const audioStream = ytdl(url, {
            filter: 'audioonly',
            quality: 'highestaudio'
        });

        // Converter para MP3 e salvar
        const writeStream = fs.createWriteStream(filePath);

        return new Promise((resolve, reject) => {
            audioStream.pipe(writeStream);

            writeStream.on('finish', () => {
                try {
                    const fileSize = fs.statSync(filePath).size;
                    resolve(NextResponse.json({
                        success: true,
                        message: 'Download concluído!',
                        fileName: fileName,
                        title: videoTitle,
                        downloadUrl: `/downloads/${fileName}`,
                        fileSize: fileSize
                    }));
                } catch (error) {
                    console.error('Erro ao obter tamanho do arquivo:', error);
                    resolve(NextResponse.json({
                        success: true,
                        message: 'Download concluído!',
                        fileName: fileName,
                        title: videoTitle,
                        downloadUrl: `/downloads/${fileName}`
                    }));
                }
            });

            writeStream.on('error', (error) => {
                console.error('Erro no download:', error);
                reject(NextResponse.json({
                    error: 'Erro durante o download'
                }, { status: 500 }));
            });
        });

    } catch (error) {
        console.error('Erro no download do YouTube:', error);
        return NextResponse.json({
            error: 'Erro interno do servidor'
        }, { status: 500 });
    }
}

// GET para obter informações do vídeo
export async function GET(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.email) {
            return NextResponse.json({ error: 'Usuário não autenticado' }, { status: 401 });
        }

        const { searchParams } = new URL(req.url);
        const url = searchParams.get('url');

        if (!url) {
            return NextResponse.json({ error: 'URL do YouTube é obrigatória' }, { status: 400 });
        }

        if (!ytdl.validateURL(url)) {
            return NextResponse.json({ error: 'URL do YouTube inválida' }, { status: 400 });
        }

        // Obter informações do vídeo
        let videoInfo;
        try {
            videoInfo = await ytdl.getInfo(url);
        } catch (error) {
            console.error('Erro ao obter informações do vídeo:', error);
            return NextResponse.json({
                error: 'Não foi possível obter informações do vídeo. Tente novamente.'
            }, { status: 400 });
        }

        return NextResponse.json({
            title: videoInfo.videoDetails.title,
            duration: videoInfo.videoDetails.lengthSeconds,
            thumbnail: videoInfo.videoDetails.thumbnails[0]?.url,
            author: videoInfo.videoDetails.author.name,
            viewCount: videoInfo.videoDetails.viewCount,
            isValid: true
        });

    } catch (error) {
        console.error('Erro ao obter informações do vídeo:', error);
        return NextResponse.json({
            error: 'Erro ao obter informações do vídeo'
        }, { status: 500 });
    }
}
