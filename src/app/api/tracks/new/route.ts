import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { apiCache, getCacheKey } from '@/lib/cache';

export const revalidate = 30; // habilita cache curto

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const page = parseInt(searchParams.get('page') || '1');
        // Forçar 60 por página independentemente do parâmetro recebido
        const limit = 60;
        const offset = (page - 1) * limit;

        // Parâmetros de filtro
        const query = searchParams.get('query');
        const genre = searchParams.get('genre');
        const stylesParam = searchParams.get('styles');
        const artistsParam = searchParams.get('artists');
        const poolsParam = searchParams.get('pools');

        // Processar parâmetros de filtro
        let styles: string[] = [];
        let artists: string[] = [];
        let pools: string[] = [];

        if (stylesParam) {
            try {
                styles = JSON.parse(decodeURIComponent(stylesParam));
            } catch (e) {
                console.warn('Erro ao processar parâmetro styles:', e);
            }
        }

        if (artistsParam) {
            try {
                artists = JSON.parse(decodeURIComponent(artistsParam));
            } catch (e) {
                console.warn('Erro ao processar parâmetro artists:', e);
            }
        }

        if (poolsParam) {
            try {
                pools = JSON.parse(decodeURIComponent(poolsParam));
            } catch (e) {
                console.warn('Erro ao processar parâmetro pools:', e);
            }
        }

        console.log(`📊 API New Tracks chamada - page: ${page}, limit: ${limit}, offset: ${offset}`);
        console.log(`🔍 Filtros aplicados:`, { query, genre, styles, artists, pools });

        // Construir condições de filtro
        const whereConditions: any = {};

        // Filtro por gênero (compatibilidade com filtro antigo)
        if (genre && genre !== 'all') {
            whereConditions.style = { contains: genre, mode: 'insensitive' };
        }

        // Filtro por query de busca
        if (query) {
            whereConditions.OR = [
                { songName: { contains: query, mode: 'insensitive' } },
                { artist: { contains: query, mode: 'insensitive' } },
                { style: { contains: query, mode: 'insensitive' } },
                { pool: { contains: query, mode: 'insensitive' } }
            ];
        }

        // Filtro por estilos
        if (styles.length > 0) {
            whereConditions.style = {
                in: styles
            };
        }

        // Filtro por artistas
        if (artists.length > 0) {
            whereConditions.artist = {
                in: artists
            };
        }

        // Filtro por pools
        if (pools.length > 0) {
            whereConditions.pool = {
                in: pools
            };
        }

        // Verificar cache primeiro (incluindo filtros na chave)
        const cacheKey = getCacheKey('new_tracks', { page, limit, query, genre, styles, artists, pools });
        const cached = apiCache.get(cacheKey);
        if (cached) {
            console.log(`🚀 Cache hit para new_tracks page ${page} com filtros`);
            return NextResponse.json(cached, {
                headers: {
                    'Cache-Control': 'public, max-age=30, stale-while-revalidate=60',
                    'X-Cache': 'HIT'
                }
            });
        }

        // Query otimizada - buscar apenas os campos necessários
        const [tracks, totalCount] = await Promise.all([
            prisma.track.findMany({
                where: whereConditions,
                orderBy: [
                    { releaseDate: 'desc' },
                    { createdAt: 'desc' }
                ],
                skip: offset,
                take: limit,
                select: {
                    id: true,
                    songName: true,
                    artist: true,
                    style: true,
                    pool: true,
                    version: true,
                    folder: true,
                    releaseDate: true,
                    createdAt: true,
                    imageUrl: true,
                    previewUrl: true,
                    downloadUrl: true,
                    isCommunity: true,
                    uploadedBy: true,
                    bitrate: true,
                }
            }),
            // Cache separado para total count (considerando filtros)
            (async () => {
                const countCacheKey = getCacheKey('tracks_total_count', { query, genre, styles, artists, pools });
                let count = apiCache.get(countCacheKey);
                if (!count) {
                    count = await prisma.track.count({
                        where: whereConditions
                    });
                    apiCache.set(countCacheKey, count, 600); // 10 minutos
                }
                return count;
            })()
        ]);

        // Processar tracks para retorno
        const processedTracks = tracks.map((track: any) => ({
            ...track,
            previewUrl: track.downloadUrl || '',
            downloadCount: 0,
            likeCount: 0,
            playCount: 0,
        }));

        const totalPages = Math.max(1, Math.ceil(totalCount / limit));
        const hasMore = page < totalPages;

        console.log(`📊 Estatísticas: total=${totalCount}, páginas=${totalPages}, página atual=${page}, retornadas=${tracks.length}`);
        console.log(`🔍 Filtros aplicados resultaram em ${totalCount} músicas encontradas`);

        const response = {
            tracks: processedTracks,
            page,
            limit,
            hasMore,
            totalCount,
            totalPages,
        };

        // Cachear resultado por 2 minutos
        apiCache.set(cacheKey, response, 120);

        return NextResponse.json(response, {
            headers: {
                'Cache-Control': 'public, max-age=30, stale-while-revalidate=60',
                'X-Cache': 'MISS'
            }
        });

    } catch (error) {
        console.error("[GET_NEW_TRACKS_ERROR]", error);

        if (error instanceof Error) {
            console.error('🔍 Detalhes do erro:', {
                message: error.message,
                stack: error.stack,
                name: error.name
            });
        }

        return NextResponse.json({
            error: "Erro interno do servidor ao buscar músicas novas",
            tracks: [],
            page: 1,
            hasMore: false,
            limit: 60
        }, { status: 500 });
    }
}


