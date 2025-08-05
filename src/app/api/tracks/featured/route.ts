import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
    try {
        // Buscar músicas mais populares da semana (baseado em plays e downloads)
        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

        const featuredTracks = await prisma.track.findMany({
            take: 5,
            orderBy: {
                createdAt: 'desc'
            },
            include: {
                _count: {
                    select: {
                        plays: true,
                        downloads: true,
                        likes: true
                    }
                }
            },
            where: {
                createdAt: {
                    gte: oneWeekAgo
                }
            }
        });

        // Se não há músicas da semana, buscar as mais recentes
        if (featuredTracks.length === 0) {
            const recentTracks = await prisma.track.findMany({
                take: 5,
                orderBy: {
                    createdAt: 'desc'
                },
                include: {
                    _count: {
                        select: {
                            plays: true,
                            downloads: true,
                            likes: true
                        }
                    }
                }
            });

            return NextResponse.json({
                tracks: recentTracks,
                period: 'recent'
            });
        }

        return NextResponse.json({
            tracks: featuredTracks,
            period: 'weekly'
        });

    } catch (error) {
        console.error('Error fetching featured tracks:', error);
        return NextResponse.json(
            { error: 'Erro ao buscar músicas em destaque' },
            { status: 500 }
        );
    }
} 