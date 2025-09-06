// src/app/api/profile/downloads/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import prisma from '@/lib/prisma';

export async function GET(request: NextRequest) {
    try {
        console.log('🔍 API /profile/downloads: Iniciando requisição');

        const session = await getServerSession(authOptions);
        console.log('🔍 API /profile/downloads: Session:', session?.user?.email);

        if (!session?.user?.email) {
            console.log('❌ API /profile/downloads: Usuário não autenticado');
            return NextResponse.json({ error: 'Usuário não autenticado' }, { status: 401 });
        }

        // Verificar se o usuário existe
        const user = await prisma.user.findUnique({
            where: { email: session.user.email }
        });

        if (!user) {
            console.log('❌ API /profile/downloads: Usuário não encontrado');
            return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 });
        }

        console.log('✅ API /profile/downloads: Usuário encontrado:', user.id);

        // Calcular estatísticas de downloads
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const thisWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

        // Total de downloads
        const totalDownloads = await prisma.download.count({
            where: {
                userId: user.id
            }
        });

        // Downloads hoje
        const downloadsToday = await prisma.download.count({
            where: {
                userId: user.id,
                downloadedAt: {
                    gte: today
                }
            }
        });

        // Último download
        const lastDownload = await prisma.download.findFirst({
            where: {
                userId: user.id
            },
            orderBy: {
                downloadedAt: 'desc'
            },
            select: {
                downloadedAt: true
            }
        });

        // Buscar downloads recentes com detalhes das tracks (últimos 20)
        const recentDownloads = await prisma.download.findMany({
            where: {
                userId: user.id
            },
            include: {
                track: {
                    select: {
                        id: true,
                        songName: true,
                        artist: true,
                        imageUrl: true,
                        style: true,
                        pool: true,
                        version: true,
                        bitrate: true
                    }
                }
            },
            orderBy: {
                downloadedAt: 'desc'
            },
            take: 20
        });

        console.log('✅ API /profile/downloads: Downloads encontrados:', recentDownloads.length);

        const response = {
            stats: {
                totalDownloads,
                downloadsToday,
                lastDownload: lastDownload?.downloadedAt || null,
                isVip: user.is_vip || false,
                dailyLimit: user.is_vip ? 'Ilimitado' : 100
            },
            recentDownloads: recentDownloads.map((download: any) => ({
                id: download.id,
                downloadedAt: download.downloadedAt,
                track: download.track
            }))
        };

        return NextResponse.json(response);

    } catch (error) {
        console.error('❌ Erro na API de downloads do perfil:', error);
        return NextResponse.json({
            error: 'Erro interno do servidor',
            details: error instanceof Error ? error.message : 'Erro desconhecido'
        }, { status: 500 });
    }
}

