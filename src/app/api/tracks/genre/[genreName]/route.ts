import prisma from '@/lib/prisma';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const revalidate = 300; // Cache por 5 minutos

export async function GET(
    request: Request,
    { params }: { params: Promise<{ genreName: string }> }
) {
    try {
        const { genreName } = await params;
        const decodedGenreName = decodeURIComponent(genreName);

        // Paginação otimizada
        const { searchParams } = new URL(request.url);
        const page = parseInt(searchParams.get('page') || '1', 10);
        const limit = Math.min(parseInt(searchParams.get('limit') || '60', 10), 200); // Limitar máximo
        const offset = (page - 1) * limit;

        // Log apenas em desenvolvimento
        if (process.env.NODE_ENV === 'development') {
            console.log(`🔍 Genre API: ${decodedGenreName} (page ${page})`);
        }

        try {
            await prisma.$connect();
        } catch (dbError) {
            console.error('❌ Erro na conexão com banco:', dbError);
            throw dbError;
        }

        // Primeiro, contar o total de tracks para este gênero
        const totalCount = await prisma.track.count({
            where: {
                style: {
                    equals: decodedGenreName,
                    mode: 'insensitive',
                },
            },
        });

        // Depois, buscar as tracks da página atual
        const tracks = await prisma.track.findMany({
            where: {
                style: {
                    equals: decodedGenreName,
                    mode: 'insensitive',
                },
            },
            select: {
                id: true,
                songName: true,
                artist: true,
                style: true,
                pool: true,
                folder: true,
                imageUrl: true,
                downloadUrl: true,
                releaseDate: true,
                createdAt: true,
                previewUrl: true,
                isCommunity: true,
                uploadedBy: true,
            },
            orderBy: [
                { createdAt: 'desc' },
            ],
            take: limit,
            skip: offset,
        });

        // Log apenas em desenvolvimento
        if (process.env.NODE_ENV === 'development') {
            console.log(`📊 ${decodedGenreName}: ${tracks.length}/${totalCount} tracks`);
        }

        const tracksWithPreview = tracks.map((track: any) => ({
            ...track,
            previewUrl: track.downloadUrl || '',
            isCommunity: false,
            uploadedBy: null,
            downloadCount: 0,
            likeCount: 0,
            playCount: 0,
        }));

        const response = NextResponse.json({
            tracks: tracksWithPreview,
            genreName: decodedGenreName,
            totalCount: totalCount,
            currentPage: page,
            totalPages: Math.ceil(totalCount / limit),
            hasNextPage: page < Math.ceil(totalCount / limit),
            hasPreviousPage: page > 1
        });

        // Adicionar headers de cache para melhor performance
        response.headers.set('Cache-Control', 'public, s-maxage=300, stale-while-revalidate=600');
        response.headers.set('CDN-Cache-Control', 'public, s-maxage=300');

        return response;
    } catch (error) {
        console.error('[GET_GENRE_TRACKS_ERROR]', error);
        return NextResponse.json(
            { error: 'Erro interno do servidor' },
            { status: 500 }
        );
    }
}



