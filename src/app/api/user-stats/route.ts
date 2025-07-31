import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.email) {
            return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
        }

        // Buscar usuário
        const user = await prisma.user.findUnique({
            where: { email: session.user.email },
            select: {
                id: true,
                email: true,
                name: true
            }
        });

        if (!user) {
            return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 });
        }

        // Contar downloads do usuário
        const downloadsCount = await prisma.download.count({
            where: { userId: user.id }
        });

        // Contar likes do usuário
        const likesCount = await prisma.like.count({
            where: { userId: user.id }
        });

        // Contar plays do usuário
        const playsCount = await prisma.play.count({
            where: { userId: user.id }
        });

        // Buscar alguns exemplos de downloads recentes
        const recentDownloads = await prisma.download.findMany({
            where: { userId: user.id },
            include: {
                track: {
                    select: {
                        songName: true,
                        artist: true
                    }
                }
            },
            orderBy: { downloadedAt: 'desc' },
            take: 5
        });

        // Buscar alguns exemplos de likes recentes
        const recentLikes = await prisma.like.findMany({
            where: { userId: user.id },
            include: {
                track: {
                    select: {
                        songName: true,
                        artist: true
                    }
                }
            },
            orderBy: { createdAt: 'desc' },
            take: 5
        });

        // Buscar alguns exemplos de plays recentes
        const recentPlays = await prisma.play.findMany({
            where: { userId: user.id },
            include: {
                track: {
                    select: {
                        songName: true,
                        artist: true
                    }
                }
            },
            orderBy: { playedAt: 'desc' },
            take: 5
        });

        return NextResponse.json({
            user: {
                id: user.id,
                email: user.email,
                name: user.name
            },
            stats: {
                downloadsCount,
                likesCount,
                playsCount
            },
            recentActivity: {
                downloads: recentDownloads.map(d => ({
                    id: d.id,
                    downloadedAt: d.downloadedAt,
                    track: d.track
                })),
                likes: recentLikes.map(l => ({
                    id: l.id,
                    createdAt: l.createdAt,
                    track: l.track
                })),
                plays: recentPlays.map(p => ({
                    id: p.id,
                    playedAt: p.playedAt,
                    track: p.track
                }))
            }
        });

    } catch (error) {
        console.error('Erro ao buscar estatísticas do usuário:', error);
        return NextResponse.json(
            { error: 'Erro interno do servidor' },
            { status: 500 }
        );
    }
} 