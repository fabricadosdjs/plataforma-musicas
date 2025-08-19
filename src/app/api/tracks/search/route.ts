import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const query = searchParams.get('q') || '';
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '50');
        const offset = (page - 1) * limit;

        console.log(`🔍 API Search chamada - query: "${query}", page: ${page}, limit: ${limit}`);

        // Verificar conexão com o banco
        try {
            await prisma.$connect();
            console.log('✅ Conexão com banco estabelecida');
        } catch (dbError) {
            console.error('❌ Erro na conexão com banco:', dbError);
            throw dbError;
        }

        // Se não há query, retorna as músicas mais recentes
        if (!query.trim()) {
            const recentTracks = await prisma.track.findMany({
                take: limit,
                skip: offset,
                orderBy: [
                    { releaseDate: 'desc' },
                    { createdAt: 'desc' }
                ],
                select: {
                    id: true,
                    songName: true,
                    artist: true,
                    style: true,
                    pool: true,
                    version: true,
                    releaseDate: true,
                    createdAt: true,
                    imageUrl: true,
                    previewUrl: true,
                    downloadUrl: true,
                    isCommunity: true,
                    uploadedBy: true,
                    bitrate: true,
                }
            });

            const totalCount = await prisma.track.count();

            console.log(`📊 Retornando ${recentTracks.length} músicas recentes de ${totalCount} total`);

            const processedTracks = recentTracks.map((track: any) => ({
                ...track,
                previewUrl: track.downloadUrl || '',
                downloadCount: 0,
                likeCount: 0,
                playCount: 0,
            }));

            return NextResponse.json({
                tracks: processedTracks,
                query: '',
                page,
                limit,
                totalCount,
                totalPages: Math.ceil(totalCount / limit),
                hasMore: (page * limit) < totalCount,
                isSearch: false
            });
        }

        // Buscar músicas que correspondem à query
        const searchTracks = await prisma.track.findMany({
            where: {
                OR: [
                    {
                        songName: {
                            contains: query,
                            mode: 'insensitive'
                        }
                    },
                    {
                        artist: {
                            contains: query,
                            mode: 'insensitive'
                        }
                    },
                    {
                        style: {
                            contains: query,
                            mode: 'insensitive'
                        }
                    },
                    {
                        pool: {
                            contains: query,
                            mode: 'insensitive'
                        }
                    },
                    {
                        version: {
                            contains: query,
                            mode: 'insensitive'
                        }
                    }
                ]
            },
            take: limit,
            skip: offset,
            orderBy: [
                { releaseDate: 'desc' },
                { createdAt: 'desc' }
            ],
            select: {
                id: true,
                songName: true,
                artist: true,
                style: true,
                pool: true,
                version: true,
                releaseDate: true,
                createdAt: true,
                imageUrl: true,
                previewUrl: true,
                downloadUrl: true,
                isCommunity: true,
                uploadedBy: true,
                bitrate: true,
            }
        });

        // Contar total de resultados da busca
        const totalCount = await prisma.track.count({
            where: {
                OR: [
                    {
                        songName: {
                            contains: query,
                            mode: 'insensitive'
                        }
                    },
                    {
                        artist: {
                            contains: query,
                            mode: 'insensitive'
                        }
                    },
                    {
                        style: {
                            contains: query,
                            mode: 'insensitive'
                        }
                    },
                    {
                        pool: {
                            contains: query,
                            mode: 'insensitive'
                        }
                    },
                    {
                        version: {
                            contains: query,
                            mode: 'insensitive'
                        }
                    }
                ]
            }
        });

        console.log(`🔍 Encontradas ${searchTracks.length} músicas de ${totalCount} total para query: "${query}"`);

        // Processar tracks para retorno
        const processedTracks = searchTracks.map((track: any) => ({
            ...track,
            previewUrl: track.downloadUrl || '',
            downloadCount: 0,
            likeCount: 0,
            playCount: 0,
        }));

        return NextResponse.json({
            tracks: processedTracks,
            query,
            page,
            limit,
            totalCount,
            totalPages: Math.ceil(totalCount / limit),
            hasMore: (page * limit) < totalCount,
            isSearch: true
        });

    } catch (error) {
        console.error("[GET_SEARCH_TRACKS_ERROR]", error);

        if (error instanceof Error) {
            console.error('🔍 Detalhes do erro:', {
                message: error.message,
                stack: error.stack,
                name: error.name
            });
        }

        return NextResponse.json({
            error: "Erro interno do servidor ao buscar músicas",
            tracks: [],
            query: '',
            page: 1,
            limit: 50,
            totalCount: 0,
            totalPages: 0,
            hasMore: false,
            isSearch: false
        }, { status: 500 });
    }
}
