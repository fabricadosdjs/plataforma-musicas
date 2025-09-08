import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import { prisma } from '@/lib/prisma';
import ytdl from '@distube/ytdl-core';
import https from 'https';
import http from 'http';
import fs from 'fs';
import path from 'path';
import { spawn, exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

// Função para verificar se yt-dlp ou youtube-dl estão disponíveis
async function checkYtDlpAvailability(): Promise<{ tool: string; available: boolean }> {
    try {
        await execAsync('yt-dlp --version');
        return { tool: 'yt-dlp', available: true };
    } catch (error) {
        try {
            await execAsync('youtube-dl --version');
            return { tool: 'youtube-dl', available: true };
        } catch (error2) {
            return { tool: 'none', available: false };
        }
    }
}

// Função para obter informações do vídeo usando yt-dlp/youtube-dl
async function getVideoInfoWithYtDlp(url: string, tool: string): Promise<any> {
    try {
        const { stdout } = await execAsync(`${tool} --dump-json "${url}"`);
        const videoInfo = JSON.parse(stdout);
        return {
            title: videoInfo.title,
            duration: videoInfo.duration,
            thumbnail: videoInfo.thumbnail,
            author: videoInfo.uploader || videoInfo.channel,
            viewCount: videoInfo.view_count
        };
    } catch (error) {
        console.error(`❌ Erro ao obter info com ${tool}:`, error);
        return null;
    }
}

// Função para download direto usando yt-dlp/youtube-dl
async function downloadWithYtDlp(url: string, outputPath: string, quality: string, tool: string): Promise<boolean> {
    return new Promise((resolve) => {
        try {
            const bitrateArg = quality === '128' ? '--audio-quality 5' : '--audio-quality 0'; // 0=best, 5=medium
            const command = `${tool} --extract-audio --audio-format mp3 ${bitrateArg} --output "${outputPath}" "${url}"`;

            console.log(`🎵 Executando ${tool}:`, command);

            exec(command, (error, stdout, stderr) => {
                if (error) {
                    console.error(`❌ Erro no ${tool}:`, (error as Error).message);
                    console.error(`❌ stderr:`, stderr);
                    resolve(false);
                } else {
                    console.log(`✅ Download concluído com ${tool}`);
                    console.log(`📁 stdout:`, stdout);
                    resolve(true);
                }
            });
        } catch (error) {
            console.error(`❌ Erro ao executar ${tool}:`, error);
            resolve(false);
        }
    });
}

// Função para encontrar o FFmpeg
function getFFmpegPath(): string | null {
    try {
        // Tentar ffmpeg-static primeiro
        const ffmpegStatic = require('ffmpeg-static');
        if (ffmpegStatic && fs.existsSync(ffmpegStatic)) {
            console.log('🎬 Usando FFmpeg-static:', ffmpegStatic);
            return ffmpegStatic;
        }
    } catch (error) {
        console.log('⚠️ FFmpeg-static não disponível:', error);
    }

    // Fallback para FFmpeg global
    console.log('🎬 Tentando FFmpeg global...');
    return 'ffmpeg'; // Assume que está no PATH
}

// Suporte a proxy HTTP/S via variável de ambiente YTDL_PROXY_URL
const proxyUrl = process.env.YTDL_PROXY_URL;
let proxyDispatcher: any = undefined;
if (proxyUrl) {
    if (proxyUrl.startsWith('https://')) {
        const { HttpsProxyAgent } = require('undici');
        proxyDispatcher = new HttpsProxyAgent(proxyUrl);
    } else if (proxyUrl.startsWith('http://')) {
        const { ProxyAgent } = require('undici');
        proxyDispatcher = new ProxyAgent(proxyUrl);
    }
    console.log('🔌 Usando proxy (dispatcher) para ytdl-core:', proxyUrl);
}

// Configurações para diferentes cenários
const ytdlConfigs = [
    {
        name: 'Configuração padrão',
        options: {
            filter: 'audioonly',
            quality: 'highestaudio',
            ...(proxyDispatcher ? { requestOptions: { dispatcher: proxyDispatcher } } : {})
        }
    },
    {
        name: 'Configuração alternativa 1',
        options: {
            filter: 'audioonly',
            quality: 'highestaudio',
            requestOptions: {
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
                },
                ...(proxyDispatcher ? { dispatcher: proxyDispatcher } : {})
            }
        }
    },
    {
        name: 'Configuração alternativa 2',
        options: {
            filter: 'audioonly',
            quality: 'highestaudio',
            requestOptions: {
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
                },
                ...(proxyDispatcher ? { dispatcher: proxyDispatcher } : {})
            }
        }
    }
];

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
            select: { id: true, is_vip: true }
        });

        if (!user?.is_vip) {
            return NextResponse.json({
                error: 'Acesso negado. Apenas usuários VIP podem usar esta ferramenta.'
            }, { status: 403 });
        }

        const { url, title, quality = '320' } = await req.json();


        if (!url) {
            console.error('[YTB-ROBUST][POST] Falha: URL do YouTube não fornecida', { url });
            return NextResponse.json({ error: 'URL do YouTube é obrigatória' }, { status: 400 });
        }

        // Validar qualidade

        if (!['128', '320'].includes(quality)) {
            console.error('[YTB-ROBUST][POST] Falha: Qualidade inválida', { quality });
            return NextResponse.json({ error: 'Qualidade inválida. Use 128 ou 320' }, { status: 400 });
        }

        // Validar URL do YouTube

        if (!ytdl.validateURL(url)) {
            console.error('[YTB-ROBUST][POST] Falha: URL do YouTube inválida', { url });
            return NextResponse.json({ error: 'URL do YouTube inválida' }, { status: 400 });
        }

        // Tentar obter informações do vídeo com diferentes configurações
        let videoInfo;
        let lastError;

        for (const config of ytdlConfigs) {
            try {
                console.log(`🔍 Tentando com: ${config.name}`);
                videoInfo = await ytdl.getInfo(url, config.options);
                console.log(`✅ Sucesso com: ${config.name}`);
                break;
            } catch (error: any) {
                console.error(`❌ Falha com ${config.name}:`, error?.message || error);
                lastError = error;
                continue;
            }
        }

        if (!videoInfo) {
            console.error('❌ Todas as tentativas com ytdl-core falharam');

            // Fallback: Tentar com yt-dlp ou youtube-dl
            console.log('🔄 Tentando fallback com yt-dlp/youtube-dl...');
            const ytDlpCheck = await checkYtDlpAvailability();

            if (ytDlpCheck.available) {
                console.log(`✅ ${ytDlpCheck.tool} disponível, tentando obter informações...`);
                const ytDlpInfo = await getVideoInfoWithYtDlp(url, ytDlpCheck.tool);

                if (ytDlpInfo) {
                    console.log(`✅ Informações obtidas com ${ytDlpCheck.tool}`);

                    // Verificar duração (limite de 10 minutos = 600 segundos)
                    if (ytDlpInfo.duration && ytDlpInfo.duration > 600) {
                        return NextResponse.json({
                            error: 'Este vídeo tem mais de 10 minutos. Esta ferramenta é destinada apenas para músicas normais. Para arquivos longos (sets, compilações), recomendamos o uso do Allavsoft.'
                        }, { status: 400 });
                    }

                    const videoTitle = title || ytDlpInfo.title;

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

                    // Arquivo final
                    const finalFileName = `${sanitizedTitle}_${quality}kbps.mp3`;
                    const finalFilePath = path.join(downloadsDir, finalFileName);

                    // Tentar download direto com yt-dlp/youtube-dl
                    console.log(`🎵 Tentando download com ${ytDlpCheck.tool}...`);
                    const ytDlpSuccess = await downloadWithYtDlp(url, finalFilePath, quality, ytDlpCheck.tool);

                    if (ytDlpSuccess && fs.existsSync(finalFilePath)) {
                        const fileSize = fs.statSync(finalFilePath).size;
                        const downloadUrl = `/downloads/${finalFileName}`;

                        // Salvar no banco de dados
                        const expiresAt = new Date();
                        expiresAt.setDate(expiresAt.getDate() + 5); // 5 dias

                        return NextResponse.json({
                            success: true,
                            message: `Download concluído com sucesso usando ${ytDlpCheck.tool}! Arquivo convertido para ${quality} KBPS.`,
                            fileName: finalFileName,
                            title: videoTitle,
                            downloadUrl: downloadUrl,
                            fileSize: fileSize,
                            quality: `${quality} KBPS`,
                            id: null,
                            expiresAt: expiresAt,
                            method: ytDlpCheck.tool
                        });
                    }
                }
            }

            return NextResponse.json({
                error: 'Não foi possível obter informações do vídeo. O YouTube pode estar bloqueando downloads. Tente usar o Allavsoft para este vídeo.'
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

        // Arquivos temporários e finais
        const tempFileName = `temp_${Date.now()}.webm`;
        const finalFileName = `${sanitizedTitle}_${quality}kbps.mp3`;
        const tempFilePath = path.join(downloadsDir, tempFileName);
        const finalFilePath = path.join(downloadsDir, finalFileName);

        // Primeiro, tentar download direto com qualidade específica (mais rápido e confiável)
        console.log(`🎵 Tentando download direto com qualidade ${quality} KBPS...`);
        let downloadSuccess = await downloadDirectWithQuality(url, finalFilePath, quality);

        // Se download direto falhar, tentar método com conversão FFmpeg
        if (!downloadSuccess) {
            console.log('🔄 Download direto falhou, tentando com conversão FFmpeg...');

            downloadSuccess = false;
            let downloadError;

            for (const config of ytdlConfigs) {
                try {
                    console.log(`📥 Tentando download com: ${config.name}`);

                    const audioStream = ytdl(url, {
                        filter: 'audioonly',
                        quality: 'highestaudio'
                    });
                    const writeStream = fs.createWriteStream(tempFilePath);

                    await new Promise((resolve, reject) => {
                        audioStream.pipe(writeStream);

                        writeStream.on('finish', () => {
                            console.log(`✅ Download do áudio original concluído com: ${config.name}`);
                            downloadSuccess = true;
                            resolve(true);
                        });

                        writeStream.on('error', (error) => {
                            console.error(`❌ Erro no download com ${config.name}:`, error);
                            downloadError = error;
                            reject(error);
                        });

                        audioStream.on('error', (error) => {
                            console.error(`❌ Erro no stream com ${config.name}:`, error);
                            downloadError = error;
                            reject(error);
                        });
                    });

                    if (downloadSuccess) break;

                } catch (error: any) {
                    console.error(`❌ Falha no download com ${config.name}:`, error?.message || error);
                    downloadError = error;
                    continue;
                }
            }

            if (!downloadSuccess) {
                // Limpar arquivo temporário se existir
                if (fs.existsSync(tempFilePath)) {
                    fs.unlinkSync(tempFilePath);
                }
                return NextResponse.json({
                    error: 'Erro durante o download. Tente novamente.'
                }, { status: 500 });
            }

            // Verificar se o arquivo temporário foi criado
            if (!fs.existsSync(tempFilePath)) {
                return NextResponse.json({
                    error: 'Arquivo temporário não foi criado corretamente'
                }, { status: 500 });
            }

            // Converter para MP3 com a qualidade especificada usando FFmpeg
            console.log(`🔄 Convertendo para MP3 ${quality} KBPS...`);

            let conversionSuccess = await convertToMp3(tempFilePath, finalFilePath, quality);

            // Se FFmpeg falhar, tentar download direto com qualidade específica
            if (!conversionSuccess) {
                console.log('🔄 FFmpeg falhou, tentando download direto com qualidade específica...');

                // Limpar arquivo temporário
                if (fs.existsSync(tempFilePath)) {
                    fs.unlinkSync(tempFilePath);
                }

                conversionSuccess = await downloadDirectWithQuality(url, finalFilePath, quality);
            } else {
                // Limpar arquivo temporário apenas se a conversão foi bem-sucedida
                if (fs.existsSync(tempFilePath)) {
                    fs.unlinkSync(tempFilePath);
                }
            }

            if (!conversionSuccess) {
                return NextResponse.json({
                    error: 'Erro durante a conversão para MP3. Tente novamente ou entre em contato com o suporte.'
                }, { status: 500 });
            }
        }        // Verificar se o arquivo final foi criado
        if (!fs.existsSync(finalFilePath)) {
            return NextResponse.json({
                error: 'Arquivo MP3 não foi criado corretamente'
            }, { status: 500 });
        }

        const fileSize = fs.statSync(finalFilePath).size;
        const downloadUrl = `/downloads/${finalFileName}`;

        // Salvar no banco de dados
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 5); // 5 dias

        // TODO: Criar tabela youTubeDownload no schema se necessário
        // let downloadRecord = null;
        // try {
        //     downloadRecord = await prisma.youTubeDownload.create({
        //         data: {
        //             userId: user.id,
        //             url,
        //             title: videoTitle,
        //             fileName: finalFileName,
        //             fileSize,
        //             downloadUrl,
        //             expiresAt
        //         }
        //     });
        // } catch (error) {
        //     console.log('Erro ao salvar no banco de dados:', error);
        // }

        return NextResponse.json({
            success: true,
            message: `Download concluído com sucesso! Arquivo convertido para ${quality} KBPS.`,
            fileName: finalFileName,
            title: videoTitle,
            downloadUrl: downloadUrl,
            fileSize: fileSize,
            quality: `${quality} KBPS`,
            id: null, // downloadRecord?.id || null,
            expiresAt: expiresAt // downloadRecord?.expiresAt || null
        });

    } catch (error) {
        console.error('Erro no download do YouTube:', error);
        return NextResponse.json({
            error: 'Erro interno do servidor'
        }, { status: 500 });
    }
}

// Função para converter áudio para MP3 com qualidade específica
async function convertToMp3(inputPath: string, outputPath: string, quality: string): Promise<boolean> {
    return new Promise((resolve) => {
        const ffmpegPath = getFFmpegPath();

        if (!ffmpegPath) {
            console.error('❌ FFmpeg não encontrado');
            resolve(false);
            return;
        }

        const bitrateValue = quality === '128' ? '128k' : '320k';

        console.log(`🎬 Convertendo com FFmpeg: ${ffmpegPath}`);
        console.log(`📊 Qualidade: ${bitrateValue}`);

        const ffmpeg = spawn(ffmpegPath, [
            '-i', inputPath,
            '-vn', // Remove vídeo
            '-codec:a', 'libmp3lame', // Codec MP3
            '-b:a', bitrateValue, // Taxa de bits específica
            '-maxrate', bitrateValue, // Taxa máxima
            '-minrate', bitrateValue, // Taxa mínima (força CBR)
            '-ar', '44100', // Sample rate
            '-ac', '2', // Stereo
            '-f', 'mp3', // Formato MP3
            '-write_xing', '0', // Desabilitar cabeçalho Xing para VBR
            '-map_metadata', '-1', // Remove metadados
            '-y', // Sobrescrever arquivo existente
            outputPath
        ], {
            stdio: ['pipe', 'pipe', 'pipe']
        });

        let stderr = '';
        let stdout = '';

        ffmpeg.stdout.on('data', (data) => {
            stdout += data.toString();
        });

        ffmpeg.stderr.on('data', (data) => {
            stderr += data.toString();
        });

        ffmpeg.on('close', (code) => {
            if (code === 0) {
                console.log(`✅ Conversão para MP3 ${quality} KBPS concluída com sucesso`);

                // Verificar o bitrate real do arquivo gerado
                verifyActualBitrate(outputPath, quality);

                resolve(true);
            } else {
                console.error(`❌ Erro na conversão FFmpeg (código ${code}):`);
                console.error('STDERR:', stderr);
                console.error('STDOUT:', stdout);
                resolve(false);
            }
        });

        ffmpeg.on('error', (error) => {
            console.error('❌ Erro ao executar FFmpeg:', error);

            // Se falhar com ffmpeg-static, tentar com ffmpeg global
            if (ffmpegPath !== 'ffmpeg') {
                console.log('🔄 Tentando com FFmpeg global...');

                const ffmpegGlobal = spawn('ffmpeg', [
                    '-i', inputPath,
                    '-vn',
                    '-codec:a', 'libmp3lame',
                    '-b:a', bitrateValue,
                    '-maxrate', bitrateValue,
                    '-minrate', bitrateValue,
                    '-ar', '44100',
                    '-ac', '2',
                    '-f', 'mp3',
                    '-write_xing', '0',
                    '-map_metadata', '-1',
                    '-y',
                    outputPath
                ]);

                ffmpegGlobal.on('close', (code) => {
                    if (code === 0) {
                        console.log(`✅ Conversão com FFmpeg global concluída (${quality} KBPS)`);
                        resolve(true);
                    } else {
                        console.error(`❌ FFmpeg global também falhou (código ${code})`);
                        resolve(false);
                    }
                });

                ffmpegGlobal.on('error', (globalError) => {
                    console.error('❌ FFmpeg global não disponível:', globalError);
                    resolve(false);
                });
            } else {
                resolve(false);
            }
        });
    });
}

// Função alternativa para download direto com qualidade específica (fallback)
async function downloadDirectWithQuality(url: string, outputPath: string, quality: string): Promise<boolean> {
    return new Promise(async (resolve) => {
        try {
            console.log(`🎵 Tentando download direto com qualidade ${quality}...`);

            // Buscar o melhor formato de áudio disponível
            const info = await ytdl.getInfo(url);
            const audioFormats = ytdl.filterFormats(info.formats, 'audioonly');

            let selectedFormat;
            if (quality === '128') {
                // Para 128kbps, buscar formato de qualidade média
                selectedFormat = audioFormats.find(format =>
                    format.audioBitrate && format.audioBitrate <= 128
                ) || audioFormats.find(format =>
                    format.audioQuality === 'AUDIO_QUALITY_LOW'
                ) || audioFormats[audioFormats.length - 1]; // Pior qualidade
            } else {
                // Para 320kbps, buscar a melhor qualidade
                selectedFormat = audioFormats.find(format =>
                    format.audioBitrate && format.audioBitrate >= 128
                ) || audioFormats.find(format =>
                    format.audioQuality === 'AUDIO_QUALITY_MEDIUM'
                ) || audioFormats[0]; // Melhor qualidade
            }

            console.log(`🎵 Formato selecionado: ${selectedFormat?.itag}, bitrate: ${selectedFormat?.audioBitrate}kbps`);

            const audioStream = ytdl.downloadFromInfo(info, { format: selectedFormat });
            const writeStream = fs.createWriteStream(outputPath);

            audioStream.pipe(writeStream);

            writeStream.on('finish', () => {
                console.log(`✅ Download direto concluído (${quality} KBPS)`);
                console.log(`📁 Arquivo salvo: ${outputPath}`);

                // Verificar o tamanho do arquivo
                const stats = fs.statSync(outputPath);
                const fileSizeMB = (stats.size / (1024 * 1024)).toFixed(2);
                console.log(`📊 Tamanho do arquivo: ${fileSizeMB} MB`);

                resolve(true);
            });

            writeStream.on('error', (error) => {
                console.error('❌ Erro no download direto:', error);
                resolve(false);
            });

            audioStream.on('error', (error) => {
                console.error('❌ Erro no stream direto:', error);
                resolve(false);
            });

        } catch (error) {
            console.error('❌ Erro no download direto:', error);
            resolve(false);
        }
    });
}

// GET para obter informações do vídeo
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
            console.error('[YTB-ROBUST][GET] Falha: URL do YouTube não fornecida', { url });
            return NextResponse.json({ error: 'URL do YouTube é obrigatória' }, { status: 400 });
        }


        if (!ytdl.validateURL(url)) {
            console.error('[YTB-ROBUST][GET] Falha: URL do YouTube inválida', { url });
            return NextResponse.json({ error: 'URL do YouTube inválida' }, { status: 400 });
        }

        // Verificar se é uma playlist

        if (url.includes('playlist') || url.includes('&list=')) {
            console.error('[YTB-ROBUST][GET] Falha: Playlist detectada', { url });
            return NextResponse.json({
                error: 'Esta ferramenta não suporta playlists. Para download de playlists, recomendamos o uso do Allavsoft.'
            }, { status: 400 });
        }

        // Tentar obter informações com diferentes configurações
        let videoInfo;
        let lastError;

        for (const config of ytdlConfigs) {
            try {
                console.log(`🔍 Tentando obter info com: ${config.name}`);
                videoInfo = await ytdl.getInfo(url, config.options);
                console.log(`✅ Info obtida com: ${config.name}`);
                break;
            } catch (error: any) {
                console.error(`❌ Falha ao obter info com ${config.name}:`, error?.message || error);
                lastError = error;
                continue;
            }
        }


        if (!videoInfo) {
            console.error('[YTB-ROBUST][GET] Falha: Não foi possível obter informações do vídeo com ytdl-core', { url });

            // Fallback: Tentar com yt-dlp ou youtube-dl
            console.log('🔄 Tentando fallback GET com yt-dlp/youtube-dl...');
            const ytDlpCheck = await checkYtDlpAvailability();

            if (ytDlpCheck.available) {
                console.log(`✅ ${ytDlpCheck.tool} disponível, tentando obter informações...`);
                const ytDlpInfo = await getVideoInfoWithYtDlp(url, ytDlpCheck.tool);

                if (ytDlpInfo) {
                    // Verificar duração (limite de 10 minutos = 600 segundos)
                    if (ytDlpInfo.duration && ytDlpInfo.duration > 600) {
                        console.error('[YTB-ROBUST][GET] Falha: Duração maior que 10 minutos', { url, duration: ytDlpInfo.duration });
                        return NextResponse.json({
                            error: 'Este vídeo tem mais de 10 minutos. Esta ferramenta é destinada apenas para músicas normais. Para arquivos longos (sets, compilações), recomendamos o uso do Allavsoft.'
                        }, { status: 400 });
                    }

                    return NextResponse.json({
                        title: ytDlpInfo.title,
                        duration: ytDlpInfo.duration,
                        thumbnail: ytDlpInfo.thumbnail,
                        author: ytDlpInfo.author,
                        viewCount: ytDlpInfo.viewCount,
                        isValid: true,
                        method: ytDlpCheck.tool
                    });
                }
            }

            return NextResponse.json({
                error: 'Não foi possível obter informações do vídeo. O YouTube pode estar bloqueando este acesso. Tente usar o Allavsoft para este vídeo.'
            }, { status: 400 });
        }

        // Verificar duração (limite de 10 minutos = 600 segundos)
        const duration = parseInt(videoInfo.videoDetails.lengthSeconds);

        if (duration > 600) {
            console.error('[YTB-ROBUST][GET] Falha: Duração maior que 10 minutos', { url, duration });
            return NextResponse.json({
                error: 'Este vídeo tem mais de 10 minutos. Esta ferramenta é destinada apenas para músicas normais. Para arquivos longos (sets, compilações), recomendamos o uso do Allavsoft.'
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

// Função para verificar o bitrate real do arquivo MP3 gerado
async function verifyActualBitrate(filePath: string, expectedQuality: string): Promise<void> {
    try {
        const ffmpegPath = getFFmpegPath();
        if (!ffmpegPath) {
            console.warn('⚠️ FFmpeg não disponível para verificar bitrate');
            return;
        }

        const ffprobe = spawn(ffmpegPath.replace('ffmpeg', 'ffprobe'), [
            '-v', 'quiet',
            '-show_entries', 'stream=bit_rate',
            '-select_streams', 'a:0',
            '-of', 'csv=p=0',
            filePath
        ]);

        let output = '';
        ffprobe.stdout.on('data', (data) => {
            output += data.toString();
        });

        ffprobe.on('close', (code) => {
            if (code === 0 && output.trim()) {
                const actualBitrateKbps = Math.round(parseInt(output.trim()) / 1000);
                console.log(`📊 Bitrate real do arquivo: ${actualBitrateKbps} kbps (esperado: ${expectedQuality} kbps)`);

                if (Math.abs(actualBitrateKbps - parseInt(expectedQuality)) > 50) {
                    console.warn(`⚠️ Aviso: Bitrate real (${actualBitrateKbps}) difere significativamente do esperado (${expectedQuality})`);
                }
            }
        });

        ffprobe.on('error', (error) => {
            console.warn('⚠️ Não foi possível verificar bitrate:', (error as Error).message);
        });

    } catch (error) {
        console.warn('⚠️ Erro na verificação de bitrate:', error);
    }
}
