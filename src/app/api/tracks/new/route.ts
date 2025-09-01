import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '60');
        const offset = (page - 1) * limit;

        console.log(`📊 API New Tracks chamada - page: ${page}, limit: ${limit}, offset: ${offset}`);

        // Buscar total de músicas para paginação
        const totalCount = await prisma.track.count();

        // Buscar músicas paginadas ordenadas por data de lançamento
        const tracks = await prisma.track.findMany({
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
        });

        // Processar tracks para retorno
        const processedTracks = tracks.map((track: any) => ({
            ...track,
            previewUrl: track.downloadUrl || '',
            downloadCount: 0,
            likeCount: 0,
            playCount: 0,
        }));

        const totalPages = Math.ceil(totalCount / limit);
        const hasMore = page < totalPages;

        console.log(`📊 Estatísticas: ${totalCount} músicas total, ${totalPages} páginas, página atual: ${page}, tem mais: ${hasMore}`);

        return NextResponse.json({
            tracks: processedTracks,
            totalCount,
            page,
            totalPages,
            hasMore,
            limit
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
            totalCount: 0,
            page: 1,
            totalPages: 1,
            hasMore: false,
            limit: 60
        }, { status: 500 });
    }
}


