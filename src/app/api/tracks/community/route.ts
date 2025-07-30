// src/app/api/tracks/community/route.ts
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);

        // Parâmetros de filtro
        const search = searchParams.get('search');
        const genre = searchParams.get('genre');
        const artist = searchParams.get('artist');
        const dateRange = searchParams.get('dateRange');
        const version = searchParams.get('version');
        const month = searchParams.get('month');
        const pool = searchParams.get('pool');
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '50');

        // Construir condições de filtro
        const whereConditions: any = {
            // Filtrar apenas músicas da comunidade
            OR: [
                { isCommunity: true },
                { uploadedBy: { not: null } }
            ]
        };

        // Filtro de busca
        if (search) {
            whereConditions.OR = [
                { songName: { contains: search, mode: 'insensitive' } },
                { artist: { contains: search, mode: 'insensitive' } },
                { style: { contains: search, mode: 'insensitive' } }
            ];
        }

        // Filtro por gênero
        if (genre && genre !== 'all') {
            whereConditions.style = { contains: genre, mode: 'insensitive' };
        }

        // Filtro por artista
        if (artist && artist !== 'all') {
            whereConditions.artist = { contains: artist, mode: 'insensitive' };
        }

        // Filtro por versão
        if (version && version !== 'all') {
            whereConditions.version = { contains: version, mode: 'insensitive' };
        }

        // Filtro por pool
        if (pool && pool !== 'all') {
            whereConditions.pool = { contains: pool, mode: 'insensitive' };
        }

        // Filtro por mês
        if (month && month !== 'all') {
            const [year, monthNum] = month.split('-');
            const startDate = new Date(parseInt(year), parseInt(monthNum) - 1, 1);
            const endDate = new Date(parseInt(year), parseInt(monthNum), 0);

            whereConditions.releaseDate = {
                gte: startDate,
                lte: endDate
            };
        }

        // Filtro por período de data
        if (dateRange && dateRange !== 'all') {
            const today = new Date();
            let startDate: Date;

            switch (dateRange) {
                case 'today':
                    startDate = new Date(today.getFullYear(), today.getMonth(), today.getDate());
                    break;
                case 'week':
                    startDate = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
                    break;
                case 'month':
                    startDate = new Date(today.getFullYear(), today.getMonth(), 1);
                    break;
                case 'year':
                    startDate = new Date(today.getFullYear(), 0, 1);
                    break;
                default:
                    startDate = new Date(0);
            }

            whereConditions.releaseDate = {
                gte: startDate,
                lte: today
            };
        }

        // Buscar músicas da comunidade
        const tracks = await prisma.track.findMany({
            where: whereConditions,
            include: {
                uploader: {
                    select: {
                        id: true,
                        name: true,
                        email: true
                    }
                },
                _count: {
                    select: {
                        downloads: true,
                        likes: true,
                        plays: true
                    }
                }
            },
            orderBy: [
                { releaseDate: 'desc' },
                { createdAt: 'desc' }
            ],
            skip: (page - 1) * limit,
            take: limit
        });

        // Contar total de músicas da comunidade
        const totalCount = await prisma.track.count({
            where: whereConditions
        });

        // Agrupar músicas por data
        const tracksByDate: { [date: string]: any[] } = {};
        const sortedDates: string[] = [];

        tracks.forEach(track => {
            const releaseDate = track.releaseDate ? track.releaseDate.toISOString().split('T')[0] : 'unknown';

            if (!tracksByDate[releaseDate]) {
                tracksByDate[releaseDate] = [];
                sortedDates.push(releaseDate);
            }

            tracksByDate[releaseDate].push({
                ...track,
                downloadCount: track._count.downloads,
                likeCount: track._count.likes,
                playCount: track._count.plays,
                uploadedBy: track.uploader
            });
        });

        // Ordenar datas
        sortedDates.sort((a, b) => new Date(b).getTime() - new Date(a).getTime());

        return NextResponse.json({
            tracks: tracks.map(track => ({
                ...track,
                downloadCount: track._count.downloads,
                likeCount: track._count.likes,
                playCount: track._count.plays,
                uploadedBy: track.uploader
            })),
            tracksByDate,
            sortedDates,
            totalCount,
            total: totalCount,
            page,
            limit,
            totalPages: Math.ceil(totalCount / limit)
        });

    } catch (error) {
        console.error('Error fetching community tracks:', error);
        return NextResponse.json(
            { error: 'Erro interno do servidor' },
            { status: 500 }
        );
    }
} 