import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import { prisma } from '@/lib/prisma';
import ytdl from '@distube/ytdl-core';
import fs from 'fs';
import path from 'path';

// Função para gerar configurações baseadas na qualidade
const getYtdlConfigs = (quality: string) => [
    {
        name: 'Configuração padrão',
        options: {
            filter: 'audioonly',
            quality: quality === '320' ? 'highestaudio' : 'lowestaudio',
            requestOptions: {
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
                }
            }
        }
    },
    {
        name: 'Configuração alternativa 1',
        options: {
            filter: 'audioonly',
            quality: quality === '320' ? 'highestaudio' : 'lowestaudio',
            requestOptions: {
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
                }
            }
        }
    },
    {
        name: 'Configuração alternativa 2',
        options: {
            filter: 'audioonly',
            quality: quality === '320' ? 'highestaudio' : 'lowestaudio',
            requestOptions: {
                headers: {
                    'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36'
                }
            }
        }
    }
];

// POST - Fazer download
export async function POST(req: NextRequest) {
    try {
        // Verificar autenticação
        const session = await getServerSession(authOptions);
        if (!session?.user?.email) {
            return NextResponse.json({ error: 'Usuário não autenticado' }, { status: 401 });
        }

        // Verificar se é VIP
        const user = await prisma.user.findUnique({
            where: { email: session.user.email },
            select: { is_vip: true }
        });

        if (!user?.is_vip) {
            return NextResponse.json({
                error: 'Acesso negado. Apenas usuários VIP podem usar esta ferramenta.'
            }, { status: 403 });
        }

        const { url, title, quality = '128' } = await req.json();

        if (!url) {
            return NextResponse.json({ error: 'URL do YouTube é obrigatória' }, { status: 400 });
        }

        // Validar qualidade
        if (!['128', '320'].includes(quality)) {
            return NextResponse.json({ error: 'Qualidade inválida. Use 128 ou 320' }, { status: 400 });
        }

        // Validar URL do YouTube
        if (!ytdl.validateURL(url)) {
            return NextResponse.json({ error: 'URL do YouTube inválida' }, { status: 400 });
        }

        // Tentar obter informações do vídeo com diferentes configurações
        let videoInfo;
        let lastError;
        const ytdlConfigs = getYtdlConfigs(quality);

        for (const config of ytdlConfigs) {
            try {
                console.log(`🔍 Tentando com: ${config.name}`);
                videoInfo = await ytdl.getInfo(url, config.options);
                console.log(`✅ Sucesso com: ${config.name}`);
                break;
            } catch (error) {
                console.error(`❌ Falha com ${config.name}:`, error.message);
                lastError = error;
                continue;
            }
        }

        if (!videoInfo) {
            console.error('❌ Todas as tentativas falharam');
            return NextResponse.json({
                error: 'Não foi possível obter informações do vídeo. Tente novamente mais tarde.'
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

        // Tentar download com diferentes configurações
        let downloadSuccess = false;
        let downloadError;
        const downloadConfigs = getYtdlConfigs(quality);

        for (const config of downloadConfigs) {
            try {
                console.log(`📥 Tentando download com: ${config.name}`);

                const audioStream = ytdl(url, config.options);
                const writeStream = fs.createWriteStream(filePath);

                await new Promise((resolve, reject) => {
                    audioStream.pipe(writeStream);

                    writeStream.on('finish', () => {
                        console.log(`✅ Download concluído com: ${config.name}`);
                        downloadSuccess = true;
                        resolve(true);
                    });

                    writeStream.on('error', (error) => {
                        console.error(`❌ Erro no download com ${config.name}:`, error);
                        downloadError = error;
                        reject(error);
                    });
                });

                if (downloadSuccess) break;

            } catch (error) {
                console.error(`❌ Falha no download com ${config.name}:`, error.message);
                downloadError = error;
                continue;
            }
        }

        if (!downloadSuccess) {
            return NextResponse.json({
                error: 'Erro durante o download. Tente novamente.'
            }, { status: 500 });
        }

        // Verificar se o arquivo foi criado
        if (!fs.existsSync(filePath)) {
            return NextResponse.json({
                error: 'Arquivo não foi criado corretamente'
            }, { status: 500 });
        }

        const fileSize = fs.statSync(filePath).size;
        const downloadUrl = `/downloads/${fileName}`;

        // Salvar no banco de dados (se a tabela existir)
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 5); // 5 dias

        let downloadRecord = null;
        try {
            downloadRecord = await prisma.youTubeDownload.create({
                data: {
                    userId: session.user.id,
                    url,
                    title: videoTitle,
                    fileName,
                    fileSize,
                    downloadUrl,
                    expiresAt
                }
            });
        } catch (error) {
            console.log('Tabela YouTubeDownload não existe ainda. Download salvo sem histórico.');
        }

        return NextResponse.json({
            success: true,
            message: 'Download concluído com sucesso!',
            fileName: fileName,
            title: videoTitle,
            downloadUrl: downloadUrl,
            fileSize: fileSize,
            id: downloadRecord?.id || null,
            expiresAt: downloadRecord?.expiresAt || null
        });

    } catch (error) {
        console.error('Erro no download do YouTube:', error);
        return NextResponse.json({
            error: 'Erro interno do servidor'
        }, { status: 500 });
    }
}

// GET - Obter informações do vídeo
export async function GET(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.email) {
            return NextResponse.json({ error: 'Usuário não autenticado' }, { status: 401 });
        }

        // Verificar se é VIP
        const user = await prisma.user.findUnique({
            where: { email: session.user.email },
            select: { is_vip: true }
        });

        if (!user?.is_vip) {
            return NextResponse.json({
                error: 'Acesso negado. Apenas usuários VIP podem usar esta ferramenta.'
            }, { status: 403 });
        }

        const { searchParams } = new URL(req.url);
        const url = searchParams.get('url');

        if (!url) {
            return NextResponse.json({ error: 'URL do YouTube é obrigatória' }, { status: 400 });
        }

        if (!ytdl.validateURL(url)) {
            return NextResponse.json({ error: 'URL do YouTube inválida' }, { status: 400 });
        }

        // Tentar obter informações com diferentes configurações
        let videoInfo;
        let lastError;
        const ytdlConfigs = getYtdlConfigs('128'); // Usar qualidade padrão para obter info

        for (const config of ytdlConfigs) {
            try {
                console.log(`🔍 Tentando obter info com: ${config.name}`);
                videoInfo = await ytdl.getInfo(url, config.options);
                console.log(`✅ Info obtida com: ${config.name}`);
                break;
            } catch (error) {
                console.error(`❌ Falha ao obter info com ${config.name}:`, error.message);
                lastError = error;
                continue;
            }
        }

        if (!videoInfo) {
            console.error('❌ Todas as tentativas de obter info falharam');
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
