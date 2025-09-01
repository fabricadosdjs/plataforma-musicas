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
        const limit = Math.min(parseInt(searchParams.get('limit') || '50', 10), 200); // Limitar máximo
        const offset = parseInt(searchParams.get('offset') || '0', 10);

        console.log('🔍 API Genre Tracks chamada para:', decodedGenreName, 'limit:', limit, 'offset:', offset);

        try {
            await prisma.$connect();
            console.log('✅ Conexão com banco estabelecida');
        } catch (dbError) {
            console.error('❌ Erro na conexão com banco:', dbError);
            throw dbError;
        }

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

        console.log(`📊 Gênero ${decodedGenreName}: ${tracks.length} tracks encontradas`);

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
            totalCount: tracks.length,
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



