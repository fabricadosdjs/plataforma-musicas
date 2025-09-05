import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { apiCache, getCacheKey } from '@/lib/cache';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '100');
        const genre = searchParams.get('genre');
        const month = searchParams.get('month'); // Formato: YYYY-MM

        console.log('🔍 Most Downloaded API called with params:', { page, limit, genre, month });

        // Cache key inclui os parâmetros
        const cacheKey = getCacheKey('most_downloaded', { page, limit, genre, month });
        const cached = apiCache.get(cacheKey);
        if (cached) {
            return NextResponse.json(cached, {
                headers: {
                    'Cache-Control': 'public, max-age=300, stale-while-revalidate=600',
                    'X-Cache': 'HIT'
                }
            });
        }

        // Construir filtros
        let whereClause: any = {};

        // Filtro por gênero
        if (genre && genre !== 'all') {
            whereClause.style = {
                equals: genre,
                mode: 'insensitive'
            };
        }

        // Filtro por mês
        if (month && month !== 'all') {
            const [year, monthNum] = month.split('-');
            const startDate = new Date(parseInt(year), parseInt(monthNum) - 1, 1);
            const endDate = new Date(parseInt(year), parseInt(monthNum), 0, 23, 59, 59);

            whereClause.createdAt = {
                gte: startDate,
                lte: endDate
            };
        }

        // Buscar todas as músicas com contagem de downloads
        const tracksWithDownloads = await prisma.track.findMany({
            where: whereClause,
            include: {
                _count: {
                    select: {
                        downloads: true
                    }
                }
            },
            orderBy: {
                downloads: {
                    _count: 'desc'
                }
            },
            take: limit,
            skip: (page - 1) * limit
        });

        // Buscar total de tracks para paginação
        const totalTracks = await prisma.track.count({
            where: whereClause
        });

        // Formatar dados
        const tracks = tracksWithDownloads.map(track => ({
            id: track.id,
            songName: track.songName,
            artist: track.artist,
            imageUrl: track.imageUrl,
            style: track.style,
            pool: track.pool,
            downloadUrl: track.downloadUrl,
            previewUrl: track.previewUrl,
            downloadCount: track._count.downloads
        }));

        const response = {
            tracks,
            totalTracks,
            currentPage: page,
            totalPages: Math.ceil(totalTracks / limit),
            limit
        };

        apiCache.set(cacheKey, response, 300); // 5 minutos

        return NextResponse.json(response, {
            headers: {
                'Cache-Control': 'public, max-age=300, stale-while-revalidate=600',
                'X-Cache': 'MISS'
            }
        });
    } catch (error) {
        console.error('Error fetching most downloaded tracks:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    } finally {
        await prisma.$disconnect();
    }
}