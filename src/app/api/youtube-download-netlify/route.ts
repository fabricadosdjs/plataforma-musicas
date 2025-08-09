import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import { prisma } from '@/lib/prisma';
import ytdl from '@distube/ytdl-core';
import fs from 'fs';
import path from 'path';
import { spawn } from 'child_process';

// User-Agents rotativos para evitar bloqueios
const userAgents = [
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:121.0) Gecko/20100101 Firefox/121.0',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:121.0) Gecko/20100101 Firefox/121.0'
];

// Função para obter User-Agent aleatório
function getRandomUserAgent(): string {
    return userAgents[Math.floor(Math.random() * userAgents.length)];
}

// Função para delay entre tentativas
function delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// Configurações anti-bloqueio para Netlify/Serverless
const ytdlConfigs = [
    {
        name: 'Configuração Netlify 1',
        options: {
            filter: 'audioonly',
            quality: 'highestaudio',
            requestOptions: {
                headers: {
                    'User-Agent': getRandomUserAgent(),
                    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
                    'Accept-Language': 'en-US,en;q=0.5',
                    'Accept-Encoding': 'gzip, deflate',
                    'Connection': 'keep-alive',
                    'Upgrade-Insecure-Requests': '1',
                }
            }
        }
    },
    {
        name: 'Configuração Netlify 2',
        options: {
            filter: 'audioonly',
            quality: 'highestaudio',
            requestOptions: {
                headers: {
                    'User-Agent': getRandomUserAgent(),
                    'Accept': '*/*',
                    'Accept-Language': 'pt-BR,pt;q=0.9,en;q=0.8',
                    'Sec-Fetch-Dest': 'empty',
                    'Sec-Fetch-Mode': 'cors',
                    'Sec-Fetch-Site': 'same-origin',
                }
            }
        }
    },
    {
        name: 'Configuração Netlify 3',
        options: {
            filter: 'audioonly',
            quality: 'highestaudio',
            requestOptions: {
                headers: {
                    'User-Agent': getRandomUserAgent(),
                    'Accept': 'application/json, text/plain, */*',
                    'Accept-Language': 'en-US,en;q=0.9',
                    'Cache-Control': 'no-cache',
                    'Pragma': 'no-cache',
                }
            }
        }
    }
];

// GET para obter informações do vídeo (Otimizado para Netlify)
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
            console.error('[YTB-NETLIFY][GET] Falha: URL do YouTube não fornecida', { url });
            return NextResponse.json({ error: 'URL do YouTube é obrigatória' }, { status: 400 });
        }

        if (!ytdl.validateURL(url)) {
            console.error('[YTB-NETLIFY][GET] Falha: URL do YouTube inválida', { url });
            return NextResponse.json({ error: 'URL do YouTube inválida' }, { status: 400 });
        }

        // Verificar se é uma playlist
        if (url.includes('playlist') || url.includes('&list=')) {
            console.error('[YTB-NETLIFY][GET] Falha: Playlist detectada', { url });
            return NextResponse.json({
                error: 'Esta ferramenta não suporta playlists. Para download de playlists, recomendamos o uso do Allavsoft.'
            }, { status: 400 });
        }

        // Tentar obter informações com diferentes configurações e delays
        let videoInfo;
        let lastError;

        for (let i = 0; i < ytdlConfigs.length; i++) {
            const config = ytdlConfigs[i];
            try {
                console.log(`🔍 [Netlify] Tentando obter info com: ${config.name}`);

                // Delay entre tentativas (exceto primeira)
                if (i > 0) {
                    await delay(2000 + Math.random() * 3000); // 2-5 segundos
                }

                videoInfo = await ytdl.getInfo(url, config.options);
                console.log(`✅ [Netlify] Info obtida com: ${config.name}`);
                break;
            } catch (error: any) {
                console.error(`❌ [Netlify] Falha ao obter info com ${config.name}:`, error?.message || error);
                lastError = error;
                continue;
            }
        }

        if (!videoInfo) {
            console.error('[YTB-NETLIFY][GET] Falha: Todas as tentativas falharam', { url, lastError });

            // Verificar se é erro de bloqueio
            const errorMsg = lastError?.message || '';
            if (errorMsg.includes('Sign in to confirm') || errorMsg.includes('bot')) {
                return NextResponse.json({
                    error: 'O YouTube está bloqueando downloads no momento. Por favor, use o Allavsoft como alternativa. Este é um bloqueio temporário que pode ser resolvido em algumas horas.'
                }, { status: 400 });
            }

            return NextResponse.json({
                error: 'Não foi possível obter informações do vídeo. Tente novamente em alguns minutos ou use o Allavsoft.'
            }, { status: 400 });
        }

        // Verificar duração (limite de 10 minutos = 600 segundos)
        const duration = parseInt(videoInfo.videoDetails.lengthSeconds);
        if (duration > 600) {
            console.error('[YTB-NETLIFY][GET] Falha: Duração maior que 10 minutos', { url, duration });
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
            isValid: true,
            netlifyOptimized: true
        });

    } catch (error) {
        console.error('[YTB-NETLIFY] Erro ao obter informações do vídeo:', error);
        return NextResponse.json({
            error: 'Erro interno do servidor. Tente novamente ou use o Allavsoft.'
        }, { status: 500 });
    }
}

// POST não implementado para Netlify devido às limitações
// Para downloads completos, recomende migração para Vercel ou VPS
export async function POST(req: NextRequest) {
    return NextResponse.json({
        error: 'Downloads não estão disponíveis no Netlify devido a limitações de runtime. Recomendamos usar o Allavsoft ou migrar para Vercel/VPS para funcionalidade completa.',
        suggestion: 'Use o Allavsoft para downloads de YouTube',
        netlifyLimitation: true
    }, { status: 501 });
}
