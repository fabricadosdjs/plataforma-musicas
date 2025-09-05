import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(
    request: NextRequest,
    { params }: { params: { genreName: string } }
) {
    try {
        const genreName = params.genreName;
        const { searchParams } = new URL(request.url);
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '60');
        const skip = (page - 1) * limit;

        // Construir filtros - decodificar URL e fazer busca flexível
        const decodedGenreName = decodeURIComponent(genreName);

        // Normalização inteligente: tentar múltiplas variações
        const variations = [];

        // Variação 1: Com hífen preservado
        if (decodedGenreName.includes('-')) {
            const withHyphen = decodedGenreName
                .split('-')
                .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
                .join('-');
            variations.push(withHyphen);
        }

        // Variação 2: Com espaços (para casos como drum-&-bass)
        const withSpaces = decodedGenreName
            .replace(/-/g, ' ')
            .replace(/&/g, '&')
            .split(' ')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
            .join(' ');
        variations.push(withSpaces);

        // Variação 3: Lidar com barras (para casos como organic-house-/-downtempo)
        if (decodedGenreName.includes('-/-') || decodedGenreName.includes('/')) {
            const withSlash = decodedGenreName
                .replace(/-/g, ' ')
                .replace('/-/', ' / ')
                .replace(/\//g, ' / ')
                .split(/\s+/)
                .filter(word => word.length > 0)
                .map(word => word.length > 0 ? word.charAt(0).toUpperCase() + word.slice(1).toLowerCase() : word)
                .join(' ');
            variations.push(withSlash);
        }

        console.log('🔍 Buscando gênero:', {
            original: genreName,
            decoded: decodedGenreName,
            variations: variations
        });

        // Usar OR para tentar todas as variações
        const whereClause: any = {
            OR: variations.map(variation => ({
                style: {
                    equals: variation,
                    mode: 'insensitive'
                }
            }))
        };

        // Buscar músicas com filtros
        const [tracks, totalCount] = await Promise.all([
            prisma.track.findMany({
                where: whereClause,
                select: {
                    id: true,
                    songName: true,
                    artist: true,
                    style: true,
                    version: true,
                    pool: true,
                    imageUrl: true,
                    previewUrl: true,
                    downloadUrl: true,
                    releaseDate: true,
                    createdAt: true,
                    isCommunity: true,
                    uploadedBy: true,
                    bitrate: true
                },
                orderBy: {
                    releaseDate: 'desc'
                },
                skip,
                take: limit
            }),
            prisma.track.count({
                where: whereClause
            })
        ]);

        const totalPages = Math.ceil(totalCount / limit);

        const response = {
            tracks: tracks.map(track => ({
                ...track,
                downloadCount: 0,
                likeCount: 0,
                isDownloaded: false, // No session, so default to false
                isLiked: false,     // No session, so default to false
                downloadedAt: null
            })),
            pagination: {
                currentPage: page,
                totalPages,
                totalCount,
                limit,
                hasNextPage: page < totalPages,
                hasPrevPage: page > 1
            },
            genre: genreName
        };

        return NextResponse.json(response);

    } catch (error) {
        console.error('❌ Erro na API /genres/[genreName] GET:', error);

        return NextResponse.json({
            error: 'Internal server error',
            details: error instanceof Error ? error.message : 'Erro desconhecido'
        }, { status: 500 });
    }
}