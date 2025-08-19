import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import prisma from '@/lib/prisma';

export async function POST(request: NextRequest) {
    try {
        console.log('🔍 Iniciando POST /api/tracks/download');

        const session = await getServerSession(authOptions);
        console.log('👤 Sessão:', session?.user?.email ? 'Autenticado' : 'Não autenticado');

        if (!session?.user?.email) {
            console.log('❌ Erro: Usuário não autenticado');
            return NextResponse.json({ error: 'Usuário não autenticado' }, { status: 401 });
        }

        const body = await request.json();
        console.log('📦 Body recebido:', body);

        const { trackId } = body;

        if (!trackId) {
            console.log('❌ Erro: trackId não fornecido');
            return NextResponse.json({ error: 'trackId é obrigatório' }, { status: 400 });
        }

        console.log('🎵 TrackId:', trackId);

        // Verificar se o usuário existe
        console.log('🔍 Buscando usuário:', session.user.email);
        const user = await prisma.user.findUnique({
            where: { email: session.user.email }
        });

        if (!user) {
            console.log('❌ Erro: Usuário não encontrado no banco');
            return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 });
        }

        console.log('✅ Usuário encontrado:', user.id);

        // Verificar se é VIP ou admin
        const isAdmin = session.user.email === 'edersonleonardo@nexorrecords.com.br';
        const isVipUser = user.is_vip || isAdmin;

        // Verificar se a track existe
        console.log('🔍 Buscando track:', trackId);
        const track = await prisma.track.findUnique({
            where: { id: parseInt(trackId) }
        });

        if (!track) {
            console.log('❌ Erro: Música não encontrada');
            return NextResponse.json({ error: 'Música não encontrada' }, { status: 404 });
        }

        console.log('✅ Track encontrada:', track.songName);

        // Verificar se já baixou nas últimas 24 horas
        console.log('🔍 Verificando downloads recentes...');
        const recentDownload = await prisma.download.findFirst({
            where: {
                userId: user.id,
                trackId: parseInt(trackId),
                downloadedAt: {
                    gte: new Date(Date.now() - 24 * 60 * 60 * 1000) // Últimas 24 horas
                }
            }
        });

        if (recentDownload) {
            console.log('❌ Erro: Música já baixada nas últimas 24h');
            return NextResponse.json({ error: 'Você já baixou esta música nas últimas 24 horas' }, { status: 400 });
        }

        console.log('✅ Download recente não encontrado, pode prosseguir');

        // Verificar limite diário de downloads APENAS para usuários não-VIP
        let downloadsToday = 0;
        let dailyLimit = Infinity;

        console.log('👑 Verificando VIP status:', { isAdmin, isVipUser: user.is_vip, finalVipStatus: isVipUser });

        if (!isVipUser) {
            console.log('📊 Usuário não-VIP, verificando limite diário...');
            const today = new Date();
            today.setHours(0, 0, 0, 0);

            downloadsToday = await prisma.download.count({
                where: {
                    userId: user.id,
                    downloadedAt: {
                        gte: today
                    }
                }
            });

            dailyLimit = user.dailyDownloadCount || 50;

            console.log('📈 Downloads hoje:', downloadsToday, 'Limite:', dailyLimit);

            if (downloadsToday >= dailyLimit) {
                console.log('❌ Erro: Limite diário atingido');
                return NextResponse.json({
                    error: `Limite diário de downloads atingido (${dailyLimit})`
                }, { status: 400 });
            }
        } else {
            console.log('👑 Usuário VIP/Admin - sem limite');
        }

        // Criar ou atualizar download (upsert para evitar constraint unique)
        console.log('💾 Criando/atualizando registro de download...');
        await prisma.download.upsert({
            where: {
                userId_trackId: {
                    userId: user.id,
                    trackId: parseInt(trackId)
                }
            },
            update: {
                downloadedAt: new Date() // Atualiza a data se já existe
            },
            create: {
                userId: user.id,
                trackId: parseInt(trackId),
                downloadedAt: new Date()
            }
        });

        console.log('✅ Registro de download criado/atualizado');

        // Atualizar contador de downloads do usuário apenas para não-VIP
        if (!isVipUser) {
            await prisma.user.update({
                where: { id: user.id },
                data: {
                    dailyDownloadCount: downloadsToday + 1
                }
            });
        }

        const response = {
            success: true,
            message: 'Download registrado com sucesso',
            downloadUrl: track.downloadUrl,
            trackName: track.songName,
            artist: track.artist,
            downloadsLeft: isVipUser ? 'Ilimitado' : (dailyLimit - (downloadsToday + 1)),
            isVipUser: isVipUser
        };

        console.log('🎉 Sucesso! Retornando:', response);
        return NextResponse.json(response);

    } catch (error) {
        console.error('💥 Erro na API de download:', error);
        return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
    }
}

export async function GET(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.email) {
            return NextResponse.json({ error: 'Usuário não autenticado' }, { status: 401 });
        }

        const url = new URL(request.url);
        const trackId = url.searchParams.get('trackId');

        if (!trackId) {
            return NextResponse.json({ error: 'trackId é obrigatório' }, { status: 400 });
        }

        // Verificar se o usuário existe
        const user = await prisma.user.findUnique({
            where: { email: session.user.email }
        });

        if (!user) {
            return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 });
        }

        // Verificar se o usuário baixou a música nas últimas 24 horas
        const download = await prisma.download.findFirst({
            where: {
                userId: user.id,
                trackId: parseInt(trackId),
                downloadedAt: {
                    gte: new Date(Date.now() - 24 * 60 * 60 * 1000) // Últimas 24 horas
                }
            }
        });

        return NextResponse.json({
            downloaded: !!download,
            trackId: trackId
        });

    } catch (error) {
        console.error('Erro ao verificar download:', error);
        return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
    }
} 