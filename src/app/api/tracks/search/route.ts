import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const query = searchParams.get('q') || '';
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '20');
        const offset = (page - 1) * limit;

        if (!query.trim()) {
            return NextResponse.json({
                tracks: [],
                totalCount: 0,
                currentPage: page,
                totalPages: 0,
                hasMore: false
            });
        }

        console.log(`🔍 Busca por: "${query}" - página ${page}, limite ${limit}`);

        // Buscar total de resultados
        const totalCount = await prisma.track.count({
            where: {
                OR: [
                    { songName: { contains: query, mode: 'insensitive' as const } },
                    { artist: { contains: query, mode: 'insensitive' as const } },
                    { style: { contains: query, mode: 'insensitive' as const } },
                    { pool: { contains: query, mode: 'insensitive' as const } }
                ]
            }
        });

        // Buscar tracks com paginação
        const tracks = await prisma.track.findMany({
            where: {
                OR: [
                    { songName: { contains: query, mode: 'insensitive' as const } },
                    { artist: { contains: query, mode: 'insensitive' as const } },
                    { style: { contains: query, mode: 'insensitive' as const } },
                    { pool: { contains: query, mode: 'insensitive' as const } }
                ]
            },
            select: {
                id: true,
                songName: true,
                artist: true,
                style: true,
                pool: true,
                imageUrl: true,
                downloadUrl: true,
                releaseDate: true,
                createdAt: true,
                previewUrl: true,
                isCommunity: true,
                uploadedBy: true,
            },
            orderBy: [
                { createdAt: 'desc' }
            ],
            take: limit,
            skip: offset,
        });

        console.log(`✅ Busca concluída: ${tracks.length} resultados para "${query}"`);

        // Processar tracks
        const tracksWithPreview = tracks.map((track: any) => ({
            ...track,
            previewUrl: track.downloadUrl || '',
            downloadCount: 0,
            likeCount: 0,
            playCount: 0,
        }));

        return NextResponse.json({
            tracks: tracksWithPreview,
            totalCount,
            currentPage: page,
            totalPages: Math.ceil(totalCount / limit),
            hasMore: page < Math.ceil(totalCount / limit),
            query,
            limit,
            offset
        });

    } catch (error) {
        console.error('❌ Erro na busca:', error);
        return NextResponse.json(
            { error: 'Erro interno do servidor' },
            { status: 500 }
        );
    }
}
